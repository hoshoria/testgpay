import { useState, type FormEvent } from 'react';
import '../styles/LockScreen.css';

const LOCK_KEY = 'gpay-unlocked';
const PASSWORD = 'gpay123';

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
    const [value, setValue] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (value === PASSWORD) {
            sessionStorage.setItem(LOCK_KEY, '1');
            onUnlock();
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="lock-screen">
            <div className="lock-card">
                <div className="lock-icon">
                    <i className="fas fa-lock" />
                </div>
                <h1 className="lock-title">Unknown Cards</h1>
                <p className="lock-subtitle">Ingresa la contraseña para continuar</p>
                <form onSubmit={handleSubmit}>
                    <div className="lock-input-wrapper">
                        <input
                            className="lock-input"
                            type="password"
                            placeholder="••••••"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            autoFocus
                        />
                    </div>
                    {error && <p className="lock-error show">Contraseña incorrecta</p>}
                </form>
            </div>
        </div>
    );
}

export function isUnlocked() {
    return sessionStorage.getItem(LOCK_KEY) === '1';
}
