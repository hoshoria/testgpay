const jwt = require('jsonwebtoken');
const { pool, ensureTables } = require('./lib/db');

const JWT_SECRET = process.env.JWT_SECRET || 'uc-default-secret-change-me';

module.exports = async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    try {
        await ensureTables();

        const id = req.query.id;
        if (!id) {
            return res.status(400).json({ error: 'Card ID is required' });
        }

        const client = await pool.connect();
        try {
            const result = await client.query('DELETE FROM cards WHERE id = $1', [id]);
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Card not found' });
            }
            return res.status(200).json({ success: true });
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Delete card error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
