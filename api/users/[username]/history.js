// IMPORT PATHS UPDATED
import { tdb } from '../../lib/firebase.js';
import { setCorsHeaders, checkUserOrAdminAuth } from '../../lib/helpers.js';

export default async function handler(req, res) {
  // === CORS HEADERS ===
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // This file only handles GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username } = req.query; // Get username from the URL path

    // Check for user OR admin auth
    const isAuthorized = await checkUserOrAdminAuth(req, username);
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Forbidden: Invalid password.' });
    }

    const historyQuery = tdb.collection('kanri_transactions')
                            .where('username', '==', username)
                            .orderBy('timestamp', 'desc');
                         
    const snapshot = await historyQuery.get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(history);

  } catch (error) {
    console.error(`🔥 API /users/${req.query.username}/history error:`, error);
    return res.status(500).json({ error: error.message });
  }
}
