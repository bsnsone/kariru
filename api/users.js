// IMPORT PATHS UPDATED
import { tdb } from './lib/firebase.js';
import { setCorsHeaders, checkAdminAuth } from './lib/helpers.js';

export default async function handler(req, res) {
  // === CORS HEADERS ===
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // === [GET] /api/users - Get all users ===
    if (req.method === 'GET') {
      const usersRef = tdb.collection('kanri_users');
      const snapshot = await usersRef.get();
      if (snapshot.empty) {
        return res.status(200).json([]);
      }
      const users = snapshot.docs.map(doc => ({ username: doc.id, ...doc.data() }));
      return res.status(200).json(users);
    }

    // === [POST] /api/users - Create a new user ===
    if (req.method === 'POST') {
      // Check for admin auth
      const isAdmin = await checkAdminAuth(req);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden: Invalid admin password.' });
      }

      const { username, name, email, password, initialAmount } = req.body;
      if (!username || !name) {
        return res.status(400).json({ error: 'Username and name are required.' });
      }

      const userRef = tdb.doc(`kanri_users/${username}`);
      const docSnap = await userRef.get();

      if (docSnap.exists) {
        return res.status(409).json({ error: 'Conflict: User already exists.' });
      }

      const newUser = {
        name,
        email: email || null,
        password: password || null,
        amount: initialAmount || 0,
      };

      await userRef.set(newUser);
      return res.status(201).json({ message: 'User created successfully.', data: newUser });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('🔥 API /users error:', error);
    return res.status(500).json({ error: error.message });
  }
}
