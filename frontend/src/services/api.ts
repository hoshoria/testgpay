const API_BASE = '/api';

export async function saveCard(cardNumber: string, expiry?: string) {
    const res = await fetch(`${API_BASE}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNumber, expiry }),
    });
    return res.json();
}

export async function adminLogin(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Invalid credentials');
    }
    return res.json();
}

export async function getCards(token: string, page = 1, limit = 9999, search = '') {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), search });
    const res = await fetch(`${API_BASE}/cards?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    return res.json();
}

export async function deleteCard(token: string, id: number) {
    const res = await fetch(`${API_BASE}/cards/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
}
