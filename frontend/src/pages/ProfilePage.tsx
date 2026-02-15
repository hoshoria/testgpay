import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { updateProfile } from '../services/api';
import '../styles/Profile.css';

export default function ProfilePage() {
    const { user, userToken, logoutUser, refreshProfile } = useUser();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [pictureUrl, setPictureUrl] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!user || !userToken) {
        return (
            <div className="profile-page">
                <div className="profile-card">
                    <div className="auth-error"><i className="fas fa-lock" /> Debes iniciar sesión</div>
                    <Link to="/login" className="auth-btn" style={{ textAlign: 'center', display: 'block', textDecoration: 'none', marginTop: '1rem' }}>
                        <i className="fas fa-sign-in-alt" /> Iniciar Sesión
                    </Link>
                </div>
            </div>
        );
    }

    const handlePasswordChange = async (e: FormEvent) => {
        e.preventDefault();
        setError(''); setMsg('');
        if (newPassword.length < 8) { setError('Mínimo 8 caracteres'); return; }
        if (newPassword !== confirmPw) { setError('Las contraseñas no coinciden'); return; }
        setLoading(true);
        try {
            await updateProfile(userToken, { password: newPassword });
            setMsg('Contraseña actualizada');
            setNewPassword(''); setConfirmPw('');
        } catch { setError('Error al actualizar'); }
        setLoading(false);
    };

    const handlePictureChange = async () => {
        if (!pictureUrl.trim()) return;
        setError(''); setMsg('');
        setLoading(true);
        try {
            await updateProfile(userToken, { profilePicture: pictureUrl.trim() });
            await refreshProfile();
            setMsg('Foto actualizada');
            setPictureUrl('');
        } catch { setError('Error al actualizar'); }
        setLoading(false);
    };

    return (
        <div className="profile-page">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user.profilePicture ? (
                            <img src={user.profilePicture} alt="Profile" />
                        ) : (
                            <i className="fas fa-user" />
                        )}
                    </div>
                    <div className="profile-info">
                        <h1>{user.username}</h1>
                        <p className="tg-badge"><i className="fab fa-telegram-plane" /> {user.telegramUser}</p>
                    </div>
                </div>

                {msg && <div className="profile-success"><i className="fas fa-check-circle" /> {msg}</div>}
                {error && <div className="auth-error"><i className="fas fa-exclamation-circle" /> {error}</div>}

                <div className="profile-section">
                    <h2><i className="fas fa-image" /> Foto de Perfil</h2>
                    <div className="picture-group">
                        <input
                            type="text"
                            placeholder="URL de tu imagen"
                            value={pictureUrl}
                            onChange={(e) => setPictureUrl(e.target.value)}
                        />
                        <button onClick={handlePictureChange} disabled={loading}>
                            <i className="fas fa-save" /> Guardar
                        </button>
                    </div>
                </div>

                <div className="profile-section">
                    <h2><i className="fas fa-key" /> Cambiar Contraseña</h2>
                    <form onSubmit={handlePasswordChange}>
                        <input
                            type="password"
                            placeholder="Nueva contraseña (mín. 8 caracteres)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Confirmar contraseña"
                            value={confirmPw}
                            onChange={(e) => setConfirmPw(e.target.value)}
                        />
                        <button type="submit" disabled={loading}>
                            <i className="fas fa-save" /> Actualizar Contraseña
                        </button>
                    </form>
                </div>

                <div className="profile-actions">
                    <Link to="/" className="profile-back">
                        <i className="fas fa-arrow-left" /> Volver al Inicio
                    </Link>
                    <button className="profile-logout" onClick={logoutUser}>
                        <i className="fas fa-sign-out-alt" /> Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
