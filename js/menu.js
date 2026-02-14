// ============================================
// HAMBURGER MENU & VIEW NAVIGATION
// ============================================

function initMenuSystem() {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const menuClose = document.getElementById('menu-close');
    const menuItems = document.querySelectorAll('.menu-item');

    function toggleMenu() {
        hamburgerMenu.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        document.body.style.overflow = menuOverlay.classList.contains('active') ? 'hidden' : 'auto';
    }

    function closeMenu() {
        hamburgerMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    hamburgerMenu.addEventListener('click', toggleMenu);
    menuClose.addEventListener('click', closeMenu);

    menuOverlay.addEventListener('click', (e) => {
        if (e.target === menuOverlay) {
            closeMenu();
        }
    });

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = item.dataset.view;

            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            switchView(viewName);
            closeMenu();
        });
    });

    // Load saved view or default to add-card
    const savedView = localStorage.getItem('gpay-current-view') || 'add-card';
    switchView(savedView);
}

function switchView(viewName) {
    const views = document.querySelectorAll('.view-container');
    const menuItems = document.querySelectorAll('.menu-item');

    views.forEach(view => view.classList.remove('active'));

    const selectedView = document.getElementById(`${viewName}-view`);
    if (selectedView) {
        selectedView.classList.add('active');
    }

    menuItems.forEach(item => {
        if (item.dataset.view === viewName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    localStorage.setItem('gpay-current-view', viewName);
}
