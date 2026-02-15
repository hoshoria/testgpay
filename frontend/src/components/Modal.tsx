import '../styles/Modal.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: Props) {
    return (
        <div className={`modal${isOpen ? ' active' : ''}`}>
            <div className="modal-content">
                <div className="success-icon">
                    <i className="fas fa-check" />
                </div>
                <h2>¡Tarjeta Guardada!</h2>
                <p>Tu tarjeta se ha guardado exitosamente en Google Pay</p>

                <div className="warning-box">
                    <div className="warning-icon">
                        <i className="fas fa-exclamation-triangle" />
                    </div>
                    <div className="warning-content">
                        <strong>Advertencia Importante:</strong>
                        <p>Si te salió el popup de que la tarjeta solo se guardó en tu navegador, quiere decir que tu tarjeta es inválida. Por favor ya no reintentes esa tarjeta.</p>
                    </div>
                </div>

                <button className="modal-button" onClick={onClose}>
                    <i className="fas fa-check" />
                    Continuar
                </button>
            </div>
        </div>
    );
}

export function PaymentSuccessModal({ isOpen, onClose }: Props) {
    return (
        <div className={`modal${isOpen ? ' active' : ''}`}>
            <div className="modal-content">
                <div className="success-icon">
                    <i className="fas fa-check-circle" />
                </div>
                <h2>¡Pago Exitoso!</h2>
                <p>Tu pago de $1.00 USD ha sido procesado correctamente</p>

                <div className="payment-details">
                    <div className="detail-row">
                        <span>Monto:</span>
                        <span className="detail-value">$1.00 USD</span>
                    </div>
                    <div className="detail-row">
                        <span>Estado:</span>
                        <span className="detail-value success">Completado</span>
                    </div>
                </div>

                <button className="modal-button" onClick={onClose}>
                    <i className="fas fa-check" />
                    Continuar
                </button>
            </div>
        </div>
    );
}
