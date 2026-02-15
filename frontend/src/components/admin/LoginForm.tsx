import { useState, type FormEvent } from 'react';
import { adminLogin } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/LoginForm.css';

export default function LoginForm() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await adminLogin(username, password);
            if (res.token) login(res.token);
            else setError('Respuesta inesperada del servidor');
        } catch {
            setError('Credenciales inválidas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="icon">
                        <i className="fas fa-user-shield" />
                    </div>
                    <h1>Admin Panel</h1>
                    <p>Acceso autorizado únicamente</p>
                </div>

                {error && (
                    <div className="login-error">
                        <i className="fas fa-exclamation-circle" /> {error}
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>
                            <i className="fas fa-user" /> Usuario
                        </label>
                        <input
                            type="text"
                            placeholder="Ingresa tu usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label>
                            <i className="fas fa-lock" /> Contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button className="login-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                Verificando...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-sign-in-alt" />
                                Iniciar Sesión
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
