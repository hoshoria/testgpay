// Payment Platform JavaScript

// Format credit card number
const cardNumberInput = document.getElementById('card-number');
cardNumberInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
});

// Format expiry date
const expiryInput = document.getElementById('expiry');
expiryInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
});


// Google Pay Integration
const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0
};

const allowedCardNetworks = ["MASTERCARD", "VISA", "AMEX"];
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

let paymentsClient = null;

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
    // Transacción mínima solo para activar el popup de guardado
    paymentDataRequest.transactionInfo = {
        totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
        currencyCode: 'USD'
    };
    paymentDataRequest.merchantInfo = {
        merchantName: 'Mi Tienda',
        merchantId: '01234567890123456789'
    };

    paymentDataRequest.callbackIntents = ["PAYMENT_AUTHORIZATION"];

    return paymentDataRequest;
}

function getGooglePaymentsClient() {
    if (paymentsClient === null) {
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
        processPayment(paymentData)
            .then(function () {
                resolve({ transactionState: 'SUCCESS' });
            })
            .catch(function () {
                resolve({
                    transactionState: 'ERROR',
                    error: {
                        intent: 'PAYMENT_AUTHORIZATION',
                        message: 'Insufficient funds',
                        reason: 'PAYMENT_DATA_INVALID'
                    }
                });
            });
    });
}

function onGooglePayLoaded() {
    const paymentsClient = getGooglePaymentsClient();
    paymentsClient.isReadyToPay(getGoogleIsReadyToPayRequest())
        .then(function (response) {
            if (response.result) {
                addGooglePayButton();
            }
        })
        .catch(function (err) {
            console.error('Error checking Google Pay availability:', err);
        });
}

function addGooglePayButton() {
    const paymentsClient = getGooglePaymentsClient();
    const button = paymentsClient.createButton({
        onClick: onGooglePaymentButtonClicked,
        allowedPaymentMethods: [baseCardPaymentMethod]
    });
    button.classList.add('google-pay-button');
    document.getElementById('google-pay-button-container').appendChild(button);
}


function onGooglePaymentButtonClicked() {
    const paymentDataRequest = getGooglePaymentDataRequest();
    const paymentsClient = getGooglePaymentsClient();
    paymentsClient.loadPaymentData(paymentDataRequest);
}

function processPayment(paymentData) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            console.log('Payment processed successfully');
            console.log(paymentData);
            showSuccessModal();
            resolve({});
        }, 1500);
    });
}

// Load Google Pay API
const script = document.createElement('script');
script.src = 'https://pay.google.com/gp/p/js/pay.js';
script.async = true;
script.onload = onGooglePayLoaded;
document.head.appendChild(script);

// Form submission handler
const paymentForm = document.getElementById('payment-form');
paymentForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const submitButton = document.getElementById('submit-button');
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const expiry = document.getElementById('expiry').value;

    // Los campos son opcionales, pero si se ingresa número de tarjeta, validar formato
    if (cardNumber && (cardNumber.length < 13 || cardNumber.length > 19)) {
        alert('El número de tarjeta no es válido');
        return;
    }

    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="button-text">Guardando...</span>';

    // Activar popup nativo de Google Pay para guardar tarjeta
    try {
        const paymentsClient = getGooglePaymentsClient();
        const paymentDataRequest = getGooglePaymentDataRequest();
        
        // Cargar datos de pago - esto activará el popup nativo de Android
        paymentsClient.loadPaymentData(paymentDataRequest)
            .then(function(paymentData) {
                // El usuario aceptó guardar la tarjeta en Google Pay
                console.log('Tarjeta guardada exitosamente:', paymentData);
                showSuccessModal();
                
                // Reset button
                submitButton.disabled = false;
                submitButton.innerHTML = '<span class="button-text">Guardar en Google Pay</span><span class="button-icon">💳</span>';
            })
            .catch(function(err) {
                // El usuario canceló o hubo un error
                console.log('Popup cancelado o error:', err);
                
                // Reset button
                submitButton.disabled = false;
                submitButton.innerHTML = '<span class="button-text">Guardar en Google Pay</span><span class="button-icon">💳</span>';
            });
    } catch (error) {
        console.error('Error al activar Google Pay:', error);
        alert('Error al activar Google Pay. Por favor, asegúrate de estar en un dispositivo compatible.');
        
        // Reset button
        submitButton.disabled = false;
        submitButton.innerHTML = '<span class="button-text">Guardar en Google Pay</span><span class="button-icon">💳</span>';
    }
});

// Success modal functions
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('active');

    // Reset form
    paymentForm.reset();
}

// Add input validation animations
const inputs = document.querySelectorAll('input, select');
inputs.forEach(input => {
    input.addEventListener('blur', function () {
        if (this.value) {
            this.style.borderColor = 'var(--success-color)';
            setTimeout(() => {
                this.style.borderColor = '';
            }, 300);
        }
    });
});

// Animate elements on scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.form-section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.6s ease';
    observer.observe(section);
});
