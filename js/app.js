// ============================================
// APP ENTRY POINT
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        initMenuSystem();
    });
} else {
    initMenuSystem();
}
