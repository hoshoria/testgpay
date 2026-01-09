// Payment Platform JavaScript - Enhanced Version with Menu Navigation and Google Pay

// ============================================
// THEME SWITCHING SYSTEM
// ============================================

// Theme configuration
const themes = {
    dark: { name: 'Dark', icon: 'fa-moon' },
    light: { name: 'Light', icon: 'fa-sun' },
    blue: { name: 'Blue', icon: 'fa-water' },
    purple: { name: 'Purple', icon: 'fa-gem' },
    green: { name: 'Green', icon: 'fa-leaf' },
    ocean: { name: 'Ocean', icon: 'fa-fish' }
};

// Load saved theme or default to dark
function loadTheme() {
    const savedTheme = localStorage.getItem('gpay-theme') || 'dark';
    applyTheme(savedTheme);
}

// Apply theme to body
function applyTheme(themeName) {
    // Remove all theme classes
    Object.keys(themes).forEach(theme => {
        document.body.classList.remove(`theme-${theme}`);
    });

    // Add new theme class (dark is default, no class needed)
    if (themeName !== 'dark') {
        document.body.classList.add(`theme-${themeName}`);
    }

    // Update UI
    updateThemeUI(themeName);

    // Save to localStorage
    localStorage.setItem('gpay-theme', themeName);
}

// Update theme switcher UI
function updateThemeUI(themeName) {
    const themeButton = document.getElementById('theme-button');
    const currentThemeName = document.getElementById('current-theme-name');
    const themeOptions = document.querySelectorAll('.theme-option');

    if (!themeButton || !currentThemeName) return;

    // Update button text and icon
    const theme = themes[themeName];
    currentThemeName.textContent = theme.name;

    // Update button icon
    const buttonIcon = themeButton.querySelector('i:first-child');
    if (buttonIcon) {
        buttonIcon.className = `fas ${theme.icon}`;
    }

    // Update active state in dropdown
    themeOptions.forEach(option => {
        if (option.dataset.theme === themeName) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

// Toggle theme dropdown
function toggleThemeDropdown() {
    const dropdown = document.getElementById('theme-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Close dropdown when clicking outside
function closeThemeDropdown(event) {
    const dropdown = document.getElementById('theme-dropdown');
    const themeSelector = document.querySelector('.theme-selector');

    if (dropdown && themeSelector && !themeSelector.contains(event.target)) {
        dropdown.classList.remove('active');
    }
}

// Initialize theme system
function initThemeSystem() {
    // Load saved theme
    loadTheme();

    // Theme button click handler
    const themeButton = document.getElementById('theme-button');
    if (themeButton) {
        themeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleThemeDropdown();
        });
    }

    // Theme option click handlers
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const themeName = option.dataset.theme;
            applyTheme(themeName);
            toggleThemeDropdown();
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', closeThemeDropdown);
}

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
    menuItems.forEach(item => {
        if (item.dataset.view === viewName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Save current view
    localStorage.setItem('gpay-current-view', viewName);

    // Initialize Google Pay button if switching to payment test view
    if (viewName === 'payment-test') {
        setTimeout(() => initGooglePayButton(), 500);
    }
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

        // Update card brand icon
        updateCardBrand(value);
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

// Update card brand icon based on card number
function updateCardBrand(cardNumber) {
    const brands = document.querySelectorAll('.card-brands i');
    brands.forEach(brand => brand.classList.remove('active'));

    if (cardNumber.length === 0) {
        brands.forEach(brand => brand.classList.add('active'));
        return;
    }

    const firstDigit = cardNumber[0];
    const firstTwo = cardNumber.substring(0, 2);

    if (firstDigit === '4') {
        document.querySelector('.fa-cc-visa')?.classList.add('active');
    } else if (firstTwo >= '51' && firstTwo <= '55') {
        document.querySelector('.fa-cc-mastercard')?.classList.add('active');
    } else if (firstTwo === '34' || firstTwo === '37') {
        document.querySelector('.fa-cc-amex')?.classList.add('active');
    }
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

function activateNativeAndroidPopup() {
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const expiry = document.getElementById('expiry').value;

    if (!cardNumber && !expiry) {
        showError('Por favor, ingresa la información de la tarjeta.');
        resetButton();
        return;
    }

    // Use Payment Request API if available
    if (window.PaymentRequest) {
        const supportedMethods = ['basic-card'];

        const details = {
            total: {
                label: 'Guardar Tarjeta',
                amount: {
                    currency: 'USD',
                    value: '0.01'
                }
            }
        };

        const methodData = [{
            supportedMethods: supportedMethods,
            data: {
                supportedNetworks: ['visa', 'mastercard', 'amex', 'discover'],
                supportedTypes: ['credit', 'debit']
            }
        }];

        const options = {
            requestPayerName: false,
            requestPayerEmail: false,
            requestPayerPhone: false
        };

        try {
            const request = new PaymentRequest(methodData, details, options);

            request.canMakePayment()
                .then(canMake => {
                    if (canMake) {
                        return request.show();
                    } else {
                        triggerAutofillSave();
                    }
                })
                .then(function (paymentResponse) {
                    if (!paymentResponse) return;

                    paymentResponse.complete('success')
                        .then(() => {
                            showSuccessModal();
                            resetButton();
                        });
                })
                .catch(function (err) {
                    if (err.name !== 'AbortError') {
                        triggerAutofillSave();
                    } else {
                        resetButton();
                    }
                });
        } catch (error) {
            triggerAutofillSave();
        }
    } else {
        triggerAutofillSave();
    }
}

function triggerAutofillSave() {
    const cardInput = document.getElementById('card-number');
    const expiryInput = document.getElementById('expiry');

    if (cardInput.value || expiryInput.value) {
        cardInput.blur();
        expiryInput.blur();

        setTimeout(() => {
            showSuccessModal();
            resetButton();
        }, 1500);
    } else {
        showError('Por favor, ingresa la información de la tarjeta.');
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

function closeModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';

    // Reset form
    if (paymentForm) {
        paymentForm.reset();
        updateCardBrand('');
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
        'gateway': 'example',
        'gatewayMerchantId': 'exampleGatewayMerchantId'
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
        merchantId: '01234567890123456789'
    };

    paymentDataRequest.callbackIntents = ["PAYMENT_AUTHORIZATION"];

    return paymentDataRequest;
}

function getGooglePaymentsClient() {
    if (paymentsClient === null && typeof google !== 'undefined' && google.payments) {
        paymentsClient = new google.payments.api.PaymentsClient({
            environment: 'TEST',
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

    // Clear existing button
    container.innerHTML = '';

    const paymentsClient = getGooglePaymentsClient();
    if (!paymentsClient) {
        console.warn('Google Pay not available');
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Google Pay no está disponible</p>';
        return;
    }

    paymentsClient.isReadyToPay(getGoogleIsReadyToPayRequest())
        .then(function (response) {
            if (response.result) {
                const button = paymentsClient.createButton({
                    onClick: onGooglePaymentButtonClicked,
                    buttonColor: 'default',
                    buttonType: 'buy',
                    buttonSizeMode: 'fill'
                });
                container.appendChild(button);
            } else {
                container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Google Pay no está disponible en este dispositivo</p>';
            }
        })
        .catch(function (err) {
            console.error('Error initializing Google Pay:', err);
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Error al cargar Google Pay</p>';
        });
}

function onGooglePaymentButtonClicked() {
    const paymentDataRequest = getGooglePaymentDataRequest();
    const paymentsClient = getGooglePaymentsClient();

    paymentsClient.loadPaymentData(paymentDataRequest)
        .then(function (paymentData) {
            console.log('Payment successful:', paymentData);
        })
        .catch(function (err) {
            console.error('Payment error:', err);
        });
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

// Initialize all systems when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        initThemeSystem();
        initMenuSystem();
    });
} else {
    initThemeSystem();
    initMenuSystem();
}
