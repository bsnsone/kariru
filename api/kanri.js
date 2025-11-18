import { https } from 'firebase-functions';
import express from 'express';
import cors from 'cors';
// Use the client SDK 'db' as requested
import { db } from './lib/firebase.js'; 
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  runTransaction, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';

const app = express();

// --- Middleware ---

// 1. Enable All Cross-Origin Requests (CORS)
app.use(cors({ origin: true }));
app.use(express.json()); // Middleware to parse JSON bodies

// 2. Helper function to get the admin password
const getAdminPass = async () => {
  try {
    const docRef = doc(db, 'passwords', 'kanri_admin');
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.error("CRITICAL: 'kanri_admin' password document not found!");
      return null;
    }
    return docSnap.data().pass;
  } catch (error) {
    console.error("Error fetching admin password:", error);
    return null;
  }
};

// 3. Admin Authentication Middleware
const requireAdminAuth = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({ error: 'Unauthorized: No token provided.' });
  }
  
  const providedPass = token.split('Bearer ')[1];
  if (!providedPass) {
    return res.status(401).send({ error: 'Unauthorized: Invalid token format.' });
  }

  const adminPass = await getAdminPass();
  if (providedPass === adminPass) {
    req.admin = "admin"; 
    next(); // Authorized
  } else {
    return res.status(403).send({ error: 'Forbidden: Invalid admin password.' });
  }
};

// 4. User OR Admin Authentication Middleware (for history)
const requireUserOrAdminAuth = async (req, res, next) => {
  const { username } = req.params;
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).send({ error: 'Unauthorized: No token provided.' });
  }

  const providedPass = token.split('Bearer ')[1];
  if (!providedPass) {
    return res.status(401).send({ error: 'Unauthorized: Invalid token format.' });
  }

  // Check 1: Is it the admin?
  const adminPass = await getAdminPass();
  if (providedPass === adminPass) {
    next(); // Authorized as admin
    return;
  }

  // Check 2: Is it the user?
  try {
    const userRef = doc(db, 'kanri_users', username);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      return res.status(404).send({ error: 'User not found.' });
    }

    const userPass = docSnap.data().password;
    if (providedPass === userPass) {
      next(); // Authorized as user
    } else {
      return res.status(403).send({ error: 'Forbidden: Invalid password.' });
    }
  } catch (error) {
    console.error("Auth check error:", error);
    return res.status(500).send({ error: 'Internal server error during auth.' });
  }
};

// --- Helper Functions ---

// 10-char alphanumeric Trx ID
const generateTrxID = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};


// --- API Endpoints (Using Client SDK v9) ---

// [POST] Create a new account
app.post('/users', requireAdminAuth, async (req, res) => {
  try {
    const { username, name, email, password, initialAmount } = req.body;

    if (!username || !name) {
      return res.status(400).send({ error: 'Username and name are required.' });
    }

    const userRef = doc(db, 'kanri_users', username);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      return res.status(409).send({ error: 'Conflict: User already exists.' });
    }

    const newUser = {
      name,
      email: email || null,
      password: password || null,
      amount: initialAmount || 0,
    };

    await setDoc(userRef, newUser);
    return res.status(201).send({ message: 'User created successfully.', data: newUser });

  } catch (error) {
    console.error("POST /users error:", error);
    return res.status(500).send({ error: 'Internal server error.' });
  }
});

// [GET] Get all user data
app.get('/users', async (req, res) => {
  try {
    const usersRef = collection(db, 'kanri_users');
    const snapshot = await getDocs(usersRef);

    if (snapshot.empty) {
      return res.status(200).send([]);
    }

    const users = [];
    snapshot.forEach(doc => {
      users.push({ username: doc.id, ...doc.data() });
    });

    return res.status(200).send(users);
  } catch (error) {
    console.error("GET /users error:", error);
    return res.status(500).send({ error: 'Internal server error.' });
  }
});

// [GET] Get history for a specific user
app.get('/users/:username/history', requireUserOrAdminAuth, async (req, res) => {
  try {
    const { username } = req.params;
    
    // Create a query
    const historyQuery = query(
      collection(db, 'kanri_transactions'), 
      where('username', '==', username)
      // Note: Ordering requires a composite index in Firestore
      // orderBy('timestamp', 'desc') 
    );
                         
    const snapshot = await getDocs(historyQuery);

    if (snapshot.empty) {
      return res.status(200).send([]);
    }

    const history = [];
    snapshot.forEach(doc => {
      history.push({ id: doc.id, ...doc.data() });
    });

    // Sort in code to avoid needing an index
    history.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());

    return res.status(200).send(history);
  } catch (error) {
    console.error("GET /users/:username/history error:", error);
    return res.status(500).send({ error: 'Internal server error.' });
  }
});

// [PUT] Add or deduct amount for a user
app.put('/users/:username/transaction', requireAdminAuth, async (req, res) => {
  const { username } = req.params;
  const { type, amount, purpose } = req.body;

  if (!type || !amount || !purpose) {
    return res.status(400).send({ error: 'Missing fields: type, amount, and purpose are required.' });
  }
  if (type !== 'add' && type !== 'deduct') {
    return res.status(400).send({ error: 'Invalid transaction type. Must be "add" or "deduct".' });
  }

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).send({ error: 'Invalid amount. Must be a positive number.' });
  }

  const userRef = doc(db, 'kanri_users', username);
  
  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const currentAmount = userDoc.data().amount;
      let newAmount;

      if (type === 'add') {
        newAmount = currentAmount + numericAmount;
      } else {
        if (currentAmount < numericAmount) {
          throw new Error('InSufficient funds');
        }
        newAmount = currentAmount - numericAmount;
      }

      // 1. Update user's balance
      transaction.update(userRef, { amount: newAmount });

      // 2. Create transaction record
      const trxId = generateTrxID();
      const trxRef = doc(db, 'kanri_transactions', trxId);
      transaction.set(trxRef, {
        username: username,
        type: type,
        amount: numericAmount,
        purpose: purpose,
        timestamp: serverTimestamp(), // Use server timestamp
        admin: req.admin || 'admin',
        previousAmount: currentAmount,
        newAmount: newAmount
      });
    });

    return res.status(200).send({ message: 'Transaction successful.' });

  } catch (error) {
    console.error("PUT /users/:username/transaction error:", error);
    if (error.message === 'User not found') {
      return res.status(404).send({ error: 'User not found.' });
    }
    if (error.message === 'InSufficient funds') {
      return res.status(400).send({ error: 'Insufficient funds for this deduction.' });
    }
    return res.status(500).send({ error: 'Internal server error.' });
  }
});

// [DELETE] Delete a user
app.delete('/users/:username', requireAdminAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const userRef = doc(db, 'kanri_users', username);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      return res.status(404).send({ error: 'User not found.' });
    }

    await deleteDoc(userRef);
    
    return res.status(200).send({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error("DELETE /users/:username error:", error);
    return res.status(500).send({ error: 'Internal server error.' });
  }
});


// Expose the Express app as a serverless function
export const api = https.onRequest(app);
