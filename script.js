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
expiryInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        const month = value.slice(0, 2);
        const year = value.slice(2, 4);
        value = month + '/' + year;
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

// Payment Request API doesn't require tokenization for card saving
// The native Android popup handles the saving automatically

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
    // The native Android popup appears automatically when the form is submitted
    // with proper autocomplete attributes. We just need to let the browser handle it.
    // However, we can also use Payment Request API as a trigger.
    
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const expiry = document.getElementById('expiry').value;
    
    if (!cardNumber && !expiry) {
        showError('Por favor, ingresa la información de la tarjeta.');
        resetButton();
        return;
    }

    // Method 1: Use Payment Request API if available (triggers native Android popup)
    if (window.PaymentRequest) {
        const supportedMethods = ['basic-card'];
        
        const details = {
            total: {
                label: 'Guardar Tarjeta',
                amount: {
                    currency: 'USD',
                    value: '0.01'  // Small amount to trigger the save prompt
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
                        // Show native Android popup
                        return request.show();
                    } else {
                        // Fallback to autofill method
                        triggerAutofillSave();
                    }
                })
                .then(function(paymentResponse) {
                    if (!paymentResponse) return;
                    
                    // User interacted with native popup
                    paymentResponse.complete('success')
                        .then(() => {
                            showSuccessModal();
                            resetButton();
                        });
                })
                .catch(function(err) {
                    if (err.name !== 'AbortError') {
                        // Try autofill method as fallback
                        triggerAutofillSave();
                    } else {
                        resetButton();
                    }
                });
        } catch (error) {
            triggerAutofillSave();
        }
    } else {
        // Method 2: Trigger Android autofill save prompt
        triggerAutofillSave();
    }
}

function triggerAutofillSave() {
    // This method relies on Android's autofill service to detect the form
    // and show the native "Save card" popup automatically
    // The form already has proper autocomplete attributes, so Android will detect it
    
    const cardInput = document.getElementById('card-number');
    const expiryInput = document.getElementById('expiry');
    
    // Submit the form normally - Android will intercept and show the save prompt
    // We prevent default and manually trigger the autofill save flow
    if (cardInput.value || expiryInput.value) {
        // Blur the inputs to trigger Android's autofill detection
        cardInput.blur();
        expiryInput.blur();
        
        // Android Chrome will automatically show the "Save card?" popup
        // after detecting the form fields with autocomplete attributes
        // We wait a moment for the popup to appear, then show our success modal
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
