// IMPORT PATHS UPDATED
import { tdb } from '../../lib/firebase.js';
import { setCorsHeaders, checkAdminAuth, generateTrxID } from '../../lib/helpers.js';
import admin from 'firebase-admin'; // Needed for ServerTimestamp and Transaction

export default async function handler(req, res) {
  // === CORS HEADERS ===
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // This file only handles PUT
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check for admin auth
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Invalid admin password.' });
    }

    const { username } = req.query; // Get username from the URL path
    const { type, amount, purpose } = req.body;

    if (!type || !amount || !purpose) {
      return res.status(400).json({ error: 'Missing fields: type, amount, and purpose are required.' });
    }
    const numericAmount = parseFloat(amount);

    const userRef = tdb.doc(`kanri_users/${username}`);
    
    // Run as a Firestore transaction
    await tdb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('User not found'); // This will be caught
      }

      const currentAmount = userDoc.data().amount;
      let newAmount;

      if (type === 'add') {
        newAmount = currentAmount + numericAmount;
      } else if (type === 'deduct') {
        if (currentAmount < numericAmount) {
          throw new Error('Insufficient funds'); // This will be caught
        }
        newAmount = currentAmount - numericAmount;
      } else {
        throw new Error('Invalid transaction type');
      }

      // 1. Update user's balance
      transaction.update(userRef, { amount: newAmount });

      // 2. Create transaction record
      const trxId = generateTrxID();
      const trxRef = tdb.doc(`kanri_transactions/${trxId}`);
      transaction.set(trxRef, {
        username: username,
        type: type,
        amount: numericAmount,
        purpose: purpose,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        admin: "admin",
        previousAmount: currentAmount,
        newAmount: newAmount
      });
    });

    return res.status(200).json({ message: 'Transaction successful.' });

  } catch (error) {
    console.error(`🔥 API /users/${req.query.username}/transaction error:`, error);
    // Handle specific transaction errors
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (error.message === 'Insufficient funds') {
      return res.status(400).json({ error: 'Insufficient funds for this deduction.' });
    }
    return res.status(500).json({ error: error.message });
  }
}
