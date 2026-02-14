// ============================================
// UTILITY FUNCTIONS
// ============================================

function copyFlagUrl() {
    const url = 'chrome://flags/#enable-autofill-credit-card-upload';
    navigator.clipboard.writeText(url).then(() => {
        const btn = document.getElementById('copy-flag-btn');
        btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        btn.style.background = 'linear-gradient(135deg, #4caf7c, #38a169)';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
            btn.style.background = 'linear-gradient(135deg, #6b4c9a, #8b6cb8)';
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        const btn = document.getElementById('copy-flag-btn');
        btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
        }, 2000);
    });
}
