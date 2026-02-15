import { useState, useCallback } from 'react';
import HamburgerMenu, { type ViewName } from '../components/HamburgerMenu';
import CardForm from '../components/CardForm';
import PaymentTest from '../components/PaymentTest';
import ChromeFlag from '../components/ChromeFlag';

const SAVED_VIEW_KEY = 'gpay-active-view';

function getInitialView(): ViewName {
    return (localStorage.getItem(SAVED_VIEW_KEY) as ViewName) || 'add-card';
}

export default function HomePage() {
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

            <div className="container">
                {activeView === 'add-card' && <CardForm />}
                {activeView === 'payment-test' && <PaymentTest />}
                {activeView === 'chrome-flag' && <ChromeFlag />}
            </div>
        </>
    );
}
