import { useState } from 'react';
import '../styles/ChromeFlag.css';

const FLAG_URL = 'chrome://flags/#enable-autofill-credit-card-upload';

export default function ChromeFlag() {
    const [copied, setCopied] = useState(false);

    const copyUrl = async () => {
        try {
            await navigator.clipboard.writeText(FLAG_URL);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = FLAG_URL;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="view-container active">
            <div className="payment-wrapper">
                <div className="payment-form">
                    <div className="form-header">
                        <div className="header-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                            <i className="fas fa-flag" />
                        </div>
                        <h1>Flag de Chrome</h1>
                        <p>Habilita el guardado automático de tarjetas en Google Pay</p>
                    </div>

                    <div className="form-section">
                        <div className="section-header">
                            <i className="fas fa-info-circle" />
                            <h3>Instrucciones</h3>
                        </div>

                        <div className="chrome-instructions">
                            <p>Para que tus tarjetas se guarden correctamente en Google Pay, necesitas habilitar una configuración especial en Chrome:</p>

                            <div className="steps-list">
                                <div className="step-item">
                                    <span className="step-number">1</span>
                                    <p>Copia el siguiente enlace y pégalo en la barra de direcciones de Chrome:</p>
                                </div>

                                <div className="flag-url-box">
                                    <code>{FLAG_URL}</code>
                                    <button
                                        className="copy-flag-btn"
                                        onClick={copyUrl}
                                        style={copied ? { background: 'linear-gradient(135deg, #4caf7c, #38a169)' } : undefined}
                                    >
                                        <i className={copied ? 'fas fa-check' : 'fas fa-copy'} />
                                        {copied ? 'Copiado!' : 'Copiar'}
                                    </button>
                                </div>

                                <div className="step-item">
                                    <span className="step-number">2</span>
                                    <p>Busca la opción <strong>"Enable offering upload of Autofilled credit cards"</strong></p>
                                </div>

                                <div className="step-item">
                                    <span className="step-number">3</span>
                                    <p>Cambia el valor de <strong className="muted">Default</strong> a <strong className="enabled">Enabled</strong></p>
                                </div>

                                <div className="step-item">
                                    <span className="step-number">4</span>
                                    <p>Haz click en <strong>"Relaunch"</strong> para reiniciar Chrome</p>
                                </div>
                            </div>
                        </div>

                        <div className="flag-success-box">
                            <i className="fas fa-check-circle" />
                            <p>Después de reiniciar Chrome, tus tarjetas se guardarán automáticamente en Google Pay</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
