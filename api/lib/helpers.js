// This file is now at api/lib/helpers.js
// IMPORT PATH UPDATED
import { tdb } from './firebase.js';

// --- CORS HEADERS ---
export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// --- PASSWORD HELPERS ---
async function getAdminPass() {
  try {
    const docRef = tdb.doc('passwords/kanri_admin');
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      console.error("CRITICAL: 'kanri_admin' password document not found!");
      return null;
    }
    return docSnap.data().pass;
  } catch (error) {
    console.error("Error fetching admin password:", error);
    return null;
  }
}

export async function checkAdminAuth(req) {
  const token = req.headers.authorization;
  if (!token) return false;
  
  const providedPass = token.split('Bearer ')[1];
  if (!providedPass) return false;

  const adminPass = await getAdminPass();
  return providedPass === adminPass;
}

export async function checkUserOrAdminAuth(req, username) {
  const token = req.headers.authorization;
  if (!token) return false;
  
  const providedPass = token.split('Bearer ')[1];
  if (!providedPass) return false;

  // Check 1: Is it the admin?
  const adminPass = await getAdminPass();
  if (providedPass === adminPass) {
    return true; // Authorized as admin
  }

  // Check 2: Is it the user?
  try {
    const userRef = tdb.doc(`kanri_users/${username}`);
    const docSnap = await userRef.get();
    if (!docSnap.exists) return false; // User not found

    const userPass = docSnap.data().password;
    return providedPass === userPass; // Authorized as user
  } catch (error) {
    console.error("User auth check error:", error);
    return false;
  }
}

// --- TRX ID HELPER ---
export function generateTrxID() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
