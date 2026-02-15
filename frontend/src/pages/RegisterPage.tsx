import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { userRegister } from '../services/api';
import { useUser } from '../context/UserContext';
import '../styles/UserAuth.css';

export default function RegisterPage() {
    const { loginUser } = useUser();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [telegram, setTelegram] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }
        if (password !== confirm) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (!telegram.trim()) {
            setError('Debes ingresar tu usuario de Telegram');
            return;
        }

        setLoading(true);
        try {
            const res = await userRegister(username, password, telegram.replace(/^@/, ''));
            if (res.token) loginUser(res.token, false);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al registrar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon register-icon">
                        <i className="fas fa-user-plus" />
                    </div>
                    <h1>Crear Cuenta</h1>
                    <p>Registra tu cuenta con tu usuario de Telegram</p>
                </div>

                {error && (
                    <div className="auth-error">
                        <i className="fas fa-exclamation-circle" /> {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label><i className="fas fa-user" /> Usuario</label>
                        <input
                            type="text"
                            placeholder="Elige un nombre de usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="auth-field">
                        <label><i className="fas fa-lock" /> Contraseña</label>
                        <input
                            type="password"
                            placeholder="Mínimo 8 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="auth-field">
                        <label><i className="fas fa-lock" /> Confirmar Contraseña</label>
                        <input
                            type="password"
                            placeholder="Repite tu contraseña"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                        />
                    </div>

                    <div className="auth-field">
                        <label><i className="fab fa-telegram-plane" /> Usuario de Telegram</label>
                        <div className="telegram-input-wrapper">
                            <span className="telegram-prefix">@</span>
                            <input
                                type="text"
                                placeholder="tu_usuario"
                                value={telegram}
                                onChange={(e) => setTelegram(e.target.value.replace(/^@/, ''))}
                                className="telegram-input"
                            />
                        </div>
                        <span className="field-hint">Solo usuarios autorizados pueden registrarse</span>
                    </div>

                    <button className="auth-btn register-btn" disabled={loading}>
                        {loading ? (
                            <><span className="auth-spinner" /> Registrando...</>
                        ) : (
                            <><i className="fas fa-user-plus" /> Crear Cuenta</>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
                </div>
            </div>
        </div>
    );
}
