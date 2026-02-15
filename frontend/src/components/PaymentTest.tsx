import '../styles/PaymentTest.css';

const LINKS = [
    { icon: 'fas fa-shopping-cart', label: 'Yona West', url: 'https://www.yonawest.com/checkouts/cn/hWN8g8g2TXzetehrdUNDRZQI/es-us?_r=AQABFi4mwoao81Ks7DbGXx6Xl-tItDBtH4mTEpJjRhoF7Wo&auto_redirect=false&edge_redirect=true&skip_shop_pay=true' },
];

export default function PaymentTest() {
    return (
        <div className="view-container active">
            <div className="payment-wrapper">
                <div className="payment-form">
                    <div className="form-header">
                        <div className="header-icon payment-icon">
                            <i className="fas fa-edit" />
                        </div>
                        <h1>Editar Datos</h1>
                        <p>Selecciona una opción para editar tu información</p>
                    </div>

                    <div className="redirect-section">
                        {LINKS.map((link) => (
                            <button
                                key={link.label}
                                className="redirect-button"
                                onClick={() => window.open(link.url, '_blank')}
                            >
                                <i className={link.icon} />
                                <span>{link.label}</span>
                            </button>
                        ))}

                        <div className="form-footer">
                            <div className="security-info">
                                <i className="fas fa-lock" />
                                <p>Serás redirigido a una página segura</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
