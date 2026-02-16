import { useState, useRef, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { updateProfile } from '../services/api';
import '../styles/Profile.css';

export default function ProfilePage() {
    const { user, userToken, logoutUser, refreshProfile } = useUser();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            setError('El archivo es muy grande (máx. 5MB)');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setPreviewSrc(base64);
            setError('');
        };
        reader.onerror = () => {
            setError('Error al leer el archivo');
        };
        reader.readAsDataURL(file);
    };

    const handlePictureUpload = async () => {
        if (!previewSrc) return;
        setError(''); setMsg('');
        setLoading(true);
        try {
            await updateProfile(userToken, { profilePicture: previewSrc });
            await refreshProfile();
            setMsg('Foto actualizada');
            setPreviewSrc(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch { setError('Error al actualizar'); }
        setLoading(false);
    };

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
                    <div className="picture-upload-area">
                        {previewSrc && (
                            <div className="picture-preview">
                                <img src={previewSrc} alt="Preview" />
                            </div>
                        )}
                        <div className="picture-group">
                            <label className="file-upload-btn">
                                <i className="fas fa-cloud-upload-alt" /> Seleccionar Archivo
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    hidden
                                />
                            </label>
                            <button onClick={handlePictureUpload} disabled={loading || !previewSrc}>
                                <i className="fas fa-save" /> Guardar
                            </button>
                        </div>
                        <p className="upload-hint">JPG, PNG, GIF, WEBP — Máx. 5MB</p>
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
