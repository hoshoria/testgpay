import '../styles/PaymentTest.css';

const LINKS = [
    { icon: 'fas fa-shopping-bag', label: 'Motive Products', url: 'https://www.motiveproducts.com/checkouts/cn/hWN85uFhIJ2ZXHhJr3pYi2Hy/en-us/information?_r=AQABZOt9S9UpjW_oE8SOfByre1VN--h4Nlih20wjNhLfNYY&skip_shop_pay=true' },
    { icon: 'fas fa-tshirt', label: 'Desert Noir', url: 'https://desert-noir.myshopify.com/checkouts/cn/hWN85uJ0YuoTuev6j19fpSra/en-pe?_r=AQABA49A2bMja4vDK0B33sfG2vgpZimegDVSctXcQjQpLTY&skip_shop_pay=true' },
    { icon: 'fas fa-tools', label: 'Demon Workshop', url: 'https://demon-workshop.com/checkouts/cn/hWN85uMFy1EvTsWF1NNKtp9W/en-us?_r=AQABkliPA8vPtjpbb-ZN6yslvTy36aXhABnz4qPr6TgbAKg&auto_redirect=false&edge_redirect=true&skip_shop_pay=true' },
    { icon: 'fas fa-graduation-cap', label: 'W3Schools', url: 'https://campus.w3schools.com/checkouts/cn/hWN85uOVcApKui2vr1A7xaks/en-pe?_r=AQAB7waapMgozdIPiDVuIjy-8smUAy4smdkP4bQl67fBpYI&skip_shop_pay=true' },
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
