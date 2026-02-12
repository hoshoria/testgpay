const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, ensureTables } = require('./lib/db');

const JWT_SECRET = process.env.JWT_SECRET || 'uc-default-secret-change-me';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '$$Tribal123';

async function ensureAdminUser() {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT id FROM admin_users WHERE username = $1',
            [ADMIN_USERNAME]
        );
        if (result.rows.length === 0) {
            const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
            await client.query(
                'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)',
                [ADMIN_USERNAME, hash]
            );
        }
    } finally {
        client.release();
    }
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await ensureTables();
        await ensureAdminUser();

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const client = await pool.connect();
        let user;
        try {
            const result = await client.query(
                'SELECT * FROM admin_users WHERE username = $1',
                [username]
            );
            user = result.rows[0];
        } finally {
            client.release();
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({ success: true, token });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
