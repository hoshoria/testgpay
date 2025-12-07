// Payment Platform JavaScript - Enhanced Version

// Format credit card number with real-time validation
const cardNumberInput = document.getElementById('card-number');
cardNumberInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
    
    // Update card brand icon
    updateCardBrand(value);
});

// Format expiry date
const expiryInput = document.getElementById('expiry');
const expiryYearInput = document.getElementById('expiry-year');
expiryInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        const month = value.slice(0, 2);
        const year = value.slice(2, 4);
        value = month + '/' + year;
        
        // Update hidden year field for autocomplete
        if (year) {
            expiryYearInput.value = '20' + year;
        }
    }
    e.target.value = value;
});

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

// Google Pay Integration - Enhanced
const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0
};

const allowedCardNetworks = ["MASTERCARD", "VISA", "AMEX"];
const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

// Use PAYMENT_GATEWAY for card saving (works better for saving cards)
const tokenizationSpecification = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
        gateway: 'example',
        gatewayMerchantId: 'exampleGatewayMerchantId'
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

let paymentsClient = null;
let googlePayLoaded = false;

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
    
    // Configure for card saving (not payment)
    paymentDataRequest.transactionInfo = {
        totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
        currencyCode: 'USD',
        totalPrice: '0.00'
    };
    
    paymentDataRequest.merchantInfo = {
        merchantName: 'Unknown Cards',
        merchantId: '01234567890123456789'
    };

    // Enable payment authorization callback
    paymentDataRequest.callbackIntents = ["PAYMENT_AUTHORIZATION"];
    
    // Request email if available
    paymentDataRequest.emailRequired = false;
    paymentDataRequest.shippingAddressRequired = false;

    return paymentDataRequest;
}

function getGooglePaymentsClient() {
    if (paymentsClient === null && typeof google !== 'undefined' && google.payments) {
        paymentsClient = new google.payments.api.PaymentsClient({
            environment: 'TEST', // Use TEST for development, change to PRODUCTION for real cards
            paymentDataCallbacks: {
                onPaymentAuthorized: onPaymentAuthorized
            }
        });
    }
    return paymentsClient;
}

function onPaymentAuthorized(paymentData) {
    return new Promise(function (resolve, reject) {
        // Process the payment data
        console.log('Payment authorized:', paymentData);
        
        // Check if card was saved to Google Pay or just browser
        const paymentMethodData = paymentData.paymentMethodData;
        const tokenizationData = paymentMethodData?.tokenizationData;
        
        // Resolve successfully
        resolve({ transactionState: 'SUCCESS' });
    });
}

function onGooglePayLoaded() {
    googlePayLoaded = true;
    const paymentsClient = getGooglePaymentsClient();
    
    if (!paymentsClient) {
        console.warn('Google Pay API not available');
        return;
    }
    
    paymentsClient.isReadyToPay(getGoogleIsReadyToPayRequest())
        .then(function (response) {
            if (response.result) {
                console.log('Google Pay is ready');
            } else {
                console.log('Google Pay is not available');
            }
        })
        .catch(function (err) {
            console.error('Error checking Google Pay availability:', err);
        });
}

// Load Google Pay API
const script = document.createElement('script');
script.src = 'https://pay.google.com/gp/p/js/pay.js';
script.async = true;
script.onload = onGooglePayLoaded;
script.onerror = function() {
    console.error('Failed to load Google Pay API');
};
document.head.appendChild(script);

// Form submission handler - Enhanced
const paymentForm = document.getElementById('payment-form');
const submitButton = document.getElementById('submit-button');
const buttonLoader = document.getElementById('button-loader');

paymentForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const expiry = document.getElementById('expiry').value;

    // Los campos son opcionales, pero si se ingresa número de tarjeta, validar formato
    if (cardNumber && (cardNumber.length < 13 || cardNumber.length > 19)) {
        showError('El número de tarjeta no es válido');
        return;
    }

    // Validate expiry format if provided
    if (expiry && expiry.length < 5) {
        showError('La fecha de vencimiento no es válida');
        return;
    }

    // Show loading state
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    buttonLoader.style.display = 'flex';

    // Use Payment Request API to trigger native Android popup
    activateNativeAndroidPopup();
});

function activateNativeAndroidPopup() {
    // Check if Payment Request API is available (this triggers native Android popup)
    if (!window.PaymentRequest) {
        // Fallback: Try to trigger autofill by focusing and blurring the card field
        // This sometimes triggers the native Android save prompt
        const cardInput = document.getElementById('card-number');
        if (cardInput.value) {
            cardInput.blur();
            cardInput.focus();
            
            // Wait a bit then show success (Android will show its own popup)
            setTimeout(() => {
                showSuccessModal();
                resetButton();
            }, 500);
        } else {
            showError('Por favor, ingresa al menos el número de tarjeta para guardarla.');
            resetButton();
        }
        return;
    }

    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const expiry = document.getElementById('expiry').value;
    
    // Parse expiry date
    let expiryMonth = '';
    let expiryYear = '';
    if (expiry && expiry.includes('/')) {
        const parts = expiry.split('/');
        expiryMonth = parts[0].padStart(2, '0');
        expiryYear = '20' + parts[1];
    }

    // Create payment method data for native Android popup
    const supportedMethods = ['basic-card'];
    
    const details = {
        total: {
            label: 'Guardar Tarjeta en Google Pay',
            amount: {
                currency: 'USD',
                value: '0.00'
            }
        },
        displayItems: []
    };

    // Payment method data - this triggers the native Android popup
    const methodData = [{
        supportedMethods: supportedMethods,
        data: {
            supportedNetworks: ['visa', 'mastercard', 'amex'],
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

        // Check if Payment Request is available
        request.canMakePayment()
            .then(canMake => {
                if (!canMake) {
                    // Fallback: Trigger autofill save prompt
                    triggerAutofillSave();
                    return;
                }

                // Show the native Android popup - this is what the user wants!
                return request.show();
            })
            .then(function(paymentResponse) {
                if (!paymentResponse) return;
                
                // User accepted in native Android popup
                console.log('Native Android popup accepted:', paymentResponse);
                
                // Get payment details
                const paymentMethod = paymentResponse.details;
                console.log('Payment method:', paymentMethod);
                
                // Complete the payment request
                paymentResponse.complete('success')
                    .then(() => {
                        // The native Android popup already asked the user if they want to save
                        // If they said yes, Android will save it to Google Pay
                        // If they said no or it was invalid, Android will show "saved to browser only"
                        showSuccessModal();
                        resetButton();
                    });
            })
            .catch(function(err) {
                console.log('Payment request cancelled or error:', err);
                
                if (err.name === 'AbortError' || err.message === 'AbortError' || err.message?.includes('cancel')) {
                    // User cancelled the native popup - no error message needed
                    resetButton();
                } else {
                    // Try fallback method
                    triggerAutofillSave();
                }
            });
    } catch (error) {
        console.error('Error creating PaymentRequest:', error);
        // Fallback: Try autofill method
        triggerAutofillSave();
    }
}

function triggerAutofillSave() {
    // This method tries to trigger Android's autofill save prompt
    // by programmatically interacting with the form fields
    const cardInput = document.getElementById('card-number');
    const expiryInput = document.getElementById('expiry');
    
    if (cardInput.value || expiryInput.value) {
        // Trigger autofill save by focusing and blurring
        cardInput.focus();
        setTimeout(() => {
            cardInput.blur();
            expiryInput.focus();
            setTimeout(() => {
                expiryInput.blur();
                // Android should show the save prompt automatically
                setTimeout(() => {
                    showSuccessModal();
                    resetButton();
                }, 1000);
            }, 300);
        }, 300);
    } else {
        showError('Por favor, ingresa la información de la tarjeta.');
        resetButton();
    }
}

function resetButton() {
    submitButton.disabled = false;
    submitButton.classList.remove('loading');
    buttonLoader.style.display = 'none';
}

function showError(message) {
    // Create or update error message
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
    paymentForm.reset();
    updateCardBrand('');
    
    // Hide any error messages
    const errorDiv = document.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

// Close modal on background click
document.getElementById('success-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Add input validation animations
const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
    input.addEventListener('focus', function () {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function () {
        this.parentElement.classList.remove('focused');
        if (this.value) {
            this.parentElement.classList.add('filled');
        } else {
            this.parentElement.classList.remove('filled');
        }
    });
    
    // Check if input has value on load
    if (input.value) {
        input.parentElement.classList.add('filled');
    }
});

// Smooth scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.form-section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.6s ease';
    observer.observe(section);
});
