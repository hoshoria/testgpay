import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import HamburgerMenu, { type ViewName } from '../components/HamburgerMenu';
import CardForm from '../components/CardForm';
import PaymentTest from '../components/PaymentTest';
import ChromeFlag from '../components/ChromeFlag';
import { useUser } from '../context/UserContext';
import '../styles/Profile.css';

const SAVED_VIEW_KEY = 'gpay-active-view';

function getInitialView(): ViewName {
    return (localStorage.getItem(SAVED_VIEW_KEY) as ViewName) || 'add-card';
}

export default function HomePage() {
    const { user } = useUser();
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeView, setActiveView] = useState<ViewName>(getInitialView);

    const handleViewChange = useCallback((view: ViewName) => {
        setActiveView(view);
        localStorage.setItem(SAVED_VIEW_KEY, view);
    }, []);

    return (
        <>
            <HamburgerMenu
                activeView={activeView}
                onViewChange={handleViewChange}
                isOpen={menuOpen}
                onToggle={() => setMenuOpen((o) => !o)}
            />

            <Link to="/profile" className="profile-btn" title="Mi Perfil">
                {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" />
                ) : (
                    <i className="fas fa-user" />
                )}
            </Link>

            <div className="container">
                {activeView === 'add-card' && <CardForm />}
                {activeView === 'payment-test' && <PaymentTest />}
                {activeView === 'chrome-flag' && <ChromeFlag />}
            </div>
        </>
    );
}
