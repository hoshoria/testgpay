import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { userLogin } from '../services/api';
import { useUser } from '../context/UserContext';
import '../styles/UserAuth.css';

export default function LoginPage() {
    const { loginUser } = useUser();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await userLogin(username, password);
            if (res.token) loginUser(res.token, remember);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Credenciales inválidas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon">
                        <i className="fas fa-user-circle" />
                    </div>
                    <h1>Iniciar Sesión</h1>
                    <p>Ingresa a tu cuenta</p>
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
                            placeholder="Tu nombre de usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="auth-field">
                        <label><i className="fas fa-lock" /> Contraseña</label>
                        <input
                            type="password"
                            placeholder="Tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="auth-remember">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                            />
                            <span className="checkmark" />
                            Guardar sesión
                        </label>
                    </div>

                    <button className="auth-btn" disabled={loading}>
                        {loading ? (
                            <><span className="auth-spinner" /> Verificando...</>
                        ) : (
                            <><i className="fas fa-sign-in-alt" /> Iniciar Sesión</>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
                </div>
            </div>
        </div>
    );
}
