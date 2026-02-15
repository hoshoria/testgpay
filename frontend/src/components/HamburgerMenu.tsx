import '../styles/HamburgerMenu.css';

export type ViewName = 'add-card' | 'payment-test' | 'chrome-flag';

interface Props {
    activeView: ViewName;
    onViewChange: (view: ViewName) => void;
    isOpen: boolean;
    onToggle: () => void;
}

const MENU_ITEMS: { view: ViewName; icon: string; title: string; subtitle: string }[] = [
    { view: 'add-card', icon: 'fas fa-credit-card', title: 'Agregar Tarjeta', subtitle: 'Guarda tu tarjeta en Google Pay' },
    { view: 'payment-test', icon: 'fas fa-shopping-cart', title: 'Editar Datos', subtitle: 'Seleccionar página para editar' },
    { view: 'chrome-flag', icon: 'fas fa-flag', title: 'Flag de Chrome', subtitle: 'Habilitar guardado de tarjetas' },
];

export default function HamburgerMenu({ activeView, onViewChange, isOpen, onToggle }: Props) {
    const handleItemClick = (view: ViewName) => {
        onViewChange(view);
        onToggle();
    };

    return (
        <>
            <button
                className={`hamburger-menu${isOpen ? ' active' : ''}`}
                onClick={onToggle}
                aria-label="Menu"
            >
                <span className="bar" />
                <span className="bar" />
                <span className="bar" />
            </button>

            <div
                className={`menu-overlay${isOpen ? ' active' : ''}`}
                onClick={(e) => { if (e.target === e.currentTarget) onToggle(); }}
            >
                <div className="menu-content">
                    <div className="menu-header">
                        <div className="menu-logo">
                            <i className="fab fa-google-pay" />
                            <span>Unknown Cards</span>
                        </div>
                        <button className="menu-close" onClick={onToggle} aria-label="Close menu">
                            <i className="fas fa-times" />
                        </button>
                    </div>

                    <nav className="menu-nav">
                        {MENU_ITEMS.map((item) => (
                            <button
                                key={item.view}
                                className={`menu-item${activeView === item.view ? ' active' : ''}`}
                                onClick={() => handleItemClick(item.view)}
                            >
                                <div className="menu-item-icon">
                                    <i className={item.icon} />
                                </div>
                                <div className="menu-item-content">
                                    <h3>{item.title}</h3>
                                    <p>{item.subtitle}</p>
                                </div>
                                <i className="fas fa-chevron-right" />
                            </button>
                        ))}
                    </nav>

                    <div className="menu-footer">
                        <p>Creado para Unknown Cards</p>
                    </div>
                </div>
            </div>
        </>
    );
}
