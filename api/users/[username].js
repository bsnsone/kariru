// IMPORT PATHS UPDATED
import { tdb } from '../lib/firebase.js';
import { setCorsHeaders, checkAdminAuth } from '../lib/helpers.js';

export default async function handler(req, res) {
  // === CORS HEADERS ===
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // This file only handles DELETE
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check for admin auth
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Invalid admin password.' });
    }

    const { username } = req.query; // Get username from the URL path
    const userRef = tdb.doc(`kanri_users/${username}`);
    const docSnap = await userRef.get();

    if (!docSnap.exists) {
      return res.status(4404).json({ error: 'User not found.' });
    }

    await userRef.delete();
    return res.status(200).json({ message: 'User deleted successfully.' });

  } catch (error) {
    console.error(`🔥 API /users/${req.query.username} error:`, error);
    return res.status(500).json({ error: error.message });
  }
}
