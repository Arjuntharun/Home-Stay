const token = location.hash.slice(1);
const requestForm = document.getElementById('request-reset');
const resetForm = document.getElementById('complete-reset');
const statusMessage = document.getElementById('recovery-status');

if (token) {
    history.replaceState(null, '', location.pathname);
    requestForm.style.display = 'none';
    resetForm.hidden = false;
    resetForm.style.removeProperty('display');
}

for (const form of [requestForm, resetForm]) {
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const isReset = form === resetForm;
        const endpoint = isReset ? 'reset-password' : 'forgot-password';
        const payload = Object.fromEntries(new FormData(form));
        if (isReset) payload.token = token;
        const button = form.querySelector('button');
        button.disabled = true;
        statusMessage.textContent = '';
        try {
            const response = await fetch(API_BASE_URL + '/auth/' + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            statusMessage.textContent = result.message;
            if (response.ok) {
                form.reset();
                if (isReset) form.style.display = 'none';
            }
        } catch {
            statusMessage.textContent = 'Unable to complete the request. Please try again.';
        } finally {
            button.disabled = false;
        }
    });
}
