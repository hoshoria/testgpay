const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

let tablesReady = false;

async function ensureTables() {
    if (tablesReady) return;
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS cards (
                id SERIAL PRIMARY KEY,
                card_number VARCHAR(30) NOT NULL,
                expiry VARCHAR(10),
                ip_address VARCHAR(50),
                ip_info JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        tablesReady = true;
    } finally {
        client.release();
    }
}

module.exports = { pool, ensureTables };
