const API_BASE = '/api';

export async function saveCard(cardNumber: string, expiry?: string, userToken?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (userToken) headers['Authorization'] = `Bearer ${userToken}`;
    const res = await fetch(`${API_BASE}/cards`, {
        method: 'POST',
        headers,
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

export async function userRegister(username: string, password: string, telegramUser: string) {
    const res = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, telegramUser }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
}

export async function userLogin(username: string, password: string) {
    const res = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Invalid credentials');
    return data;
}

export async function getProfile(token: string) {
    const res = await fetch(`${API_BASE}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    return res.json();
}

export async function updateProfile(token: string, data: { password?: string; profilePicture?: string }) {
    const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function getRegisteredUsers(token: string) {
    const res = await fetch(`${API_BASE}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    return res.json();
}

export async function adminUpdateUserPassword(token: string, userId: number, password: string) {
    const res = await fetch(`${API_BASE}/auth/users/${userId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password }),
    });
    return res.json();
}

export async function getTelegramUsernames(token: string) {
    const res = await fetch(`${API_BASE}/auth/telegram-usernames`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    return res.json();
}

export async function deleteUser(token: string, userId: number) {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete user');
    return res.json();
}

export async function blockTelegramUser(token: string, telegramUser: string) {
    const res = await fetch(`${API_BASE}/users/telegram/block`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ telegramUser }),
    });
    if (!res.ok) throw new Error('Failed to block user');
    return res.json();
}

export async function unblockTelegramUser(token: string, handle: string) {
    const safeHandle = encodeURIComponent(handle);
    const res = await fetch(`${API_BASE}/users/telegram/block/${safeHandle}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to unblock user');
    return res.json();
}

export async function getUserLoginHistory(token: string, userId: number) {
    const res = await fetch(`${API_BASE}/users/${userId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to get login history');
    return res.json();
}
