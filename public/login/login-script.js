// Import auth utilities
const API_BASE_URL = 'http://localhost:5000/api';

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', function() {
        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
});

// Tab switching functionality
const tabButtons = document.querySelectorAll('.tab-btn');
const formWrappers = document.querySelectorAll('.form-wrapper');

tabButtons.forEach(button => {
    button.addEventListener('click', function() {
        const targetTab = this.getAttribute('data-tab');
        
        // Remove active class from all tabs and forms
        tabButtons.forEach(btn => btn.classList.remove('active'));
        formWrappers.forEach(wrapper => wrapper.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Show corresponding form
        const targetForm = document.getElementById(`${targetTab}-form`);
        if (targetForm) {
            targetForm.classList.add('active');
        }
        
        // Reset forms
        resetForms();
    });
});

// Password toggle functionality
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
        const passwordInput = this.parentElement.querySelector('input');
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.style.color = type === 'text' ? '#4ade80' : 'rgba(255, 255, 255, 0.5)';
    });
});

// Store registration email for OTP verification
let registrationEmail = '';

// Sign up form submission
const signupSubmit = document.getElementById('signup-submit');
if (signupSubmit) {
    signupSubmit.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const phone = document.getElementById('signup-phone').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const terms = document.getElementById('terms').checked;
        
        // Validation
        if (!name || !email || !phone || !password || !confirmPassword) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        if (!validatePhone(phone)) {
            showNotification('Please enter a valid phone number', 'error');
            return;
        }
        
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters long', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        if (!terms) {
            showNotification('Please agree to the Terms & Conditions', 'error');
            return;
        }
        
        // Disable button
        this.disabled = true;
        this.textContent = 'Creating Account...';
        
        try {
            // Prepare and validate registration data
            const registrationData = {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                password: password
            };
            
            // Validate data one more time before sending
            if (!registrationData.name || !registrationData.email || !registrationData.phone || !registrationData.password) {
                showNotification('Please fill in all fields', 'error');
                this.disabled = false;
                this.textContent = 'Create Account';
                return;
            }
            
            // Register user
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });
            
            // Check if response is JSON
            let data;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // If not JSON, get text
                const text = await response.text();
                console.error('Non-JSON response:', text);
                showNotification('Server error. Please try again.', 'error');
                this.disabled = false;
                this.textContent = 'Create Account';
                return;
            }
            
            if (!response.ok) {
                // Handle validation errors from express-validator
                if (data.errors && Array.isArray(data.errors)) {
                    const errorMessages = data.errors.map(err => {
                        // Handle different error formats
                        if (typeof err === 'string') return err;
                        return err.msg || err.message || JSON.stringify(err);
                    }).filter(Boolean).join(', ');
                    
                    showNotification(errorMessages || data.message || 'Registration failed', 'error');
                } else if (data.message) {
                    showNotification(data.message, 'error');
                } else {
                    showNotification('Registration failed. Please check your inputs.', 'error');
                }
                
                // Log error for debugging
                console.error('Registration error:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: data
                });
                
                this.disabled = false;
                this.textContent = 'Create Account';
                return;
            }
            
            if (data.success) {
                registrationEmail = email;
                showNotification('OTP sent to your email!', 'success');
                
                // Hide signup form, show OTP verification
                document.getElementById('signup-form-fields').style.display = 'none';
                document.getElementById('otp-verification-section').style.display = 'block';
                document.getElementById('otp-email-display').textContent = email;
            } else {
                showNotification(data.message || 'Registration failed', 'error');
                this.disabled = false;
                this.textContent = 'Create Account';
            }
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('Failed to register. Please try again.', 'error');
            this.disabled = false;
            this.textContent = 'Create Account';
        }
    });
}

// Verify OTP
const verifyOtpBtn = document.getElementById('verify-otp-btn');
if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const otp = document.getElementById('otp-input').value;
        
        if (!otp || otp.length !== 6) {
            showNotification('Please enter a valid 6-digit OTP', 'error');
            return;
        }
        
        this.disabled = true;
        this.textContent = 'Verifying...';
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: registrationEmail, otp })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store token and user data
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));
                
                showNotification('Email verified! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1500);
            } else {
                showNotification(data.message || 'Invalid OTP', 'error');
                this.disabled = false;
                this.textContent = 'Verify OTP';
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            showNotification('Failed to verify OTP. Please try again.', 'error');
            this.disabled = false;
            this.textContent = 'Verify OTP';
        }
    });
}

// Resend OTP
const resendOtpBtn = document.getElementById('resend-otp-btn');
if (resendOtpBtn) {
    resendOtpBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        if (!registrationEmail) {
            showNotification('Email not found', 'error');
            return;
        }
        
        this.disabled = true;
        this.textContent = 'Sending...';
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: registrationEmail })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('OTP resent to your email!', 'success');
            } else {
                showNotification(data.message || 'Failed to resend OTP', 'error');
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            showNotification('Failed to resend OTP. Please try again.', 'error');
        } finally {
            this.disabled = false;
            this.textContent = 'Resend OTP';
        }
    });
}

// Login form submission
const loginSubmit = document.getElementById('login-submit');
if (loginSubmit) {
    loginSubmit.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const remember = document.getElementById('remember').checked;
        
        // Basic validation
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Disable button
        this.disabled = true;
        this.textContent = 'Logging in...';
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Handle validation errors
                if (data.errors && Array.isArray(data.errors)) {
                    const errorMessages = data.errors.map(err => err.msg || err.message).join(', ');
                    showNotification(errorMessages || data.message || 'Login failed', 'error');
                } else if (data.requiresVerification) {
                    showNotification('Please verify your email first. Check your inbox for OTP.', 'error');
                } else {
                    showNotification(data.message || 'Invalid credentials', 'error');
                }
                this.disabled = false;
                this.textContent = 'Login';
                return;
            }
            
            if (data.success) {
                // Store token and user data
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));
                
                // Remember email if checkbox is checked
                if (remember) {
                    localStorage.setItem('rememberedEmail', email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }
                
                showNotification('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1500);
            } else {
                if (data.requiresVerification) {
                    showNotification('Please verify your email first. Check your inbox for OTP.', 'error');
                    // Optionally redirect to verification or show resend OTP option
                } else {
                    showNotification(data.message || 'Login failed', 'error');
                }
                this.disabled = false;
                this.textContent = 'Login';
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Failed to login. Please try again.', 'error');
            this.disabled = false;
            this.textContent = 'Login';
        }
    });
}

// Reset forms
function resetForms() {
    document.getElementById('signup-form-fields').style.display = 'block';
    document.getElementById('otp-verification-section').style.display = 'none';
    document.getElementById('otp-input').value = '';
    registrationEmail = '';
}

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Phone validation
function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]{10,}$/;
    return re.test(phone);
}

// Notification system
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'rgba(74, 222, 128, 0.2)' : 
                     type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 
                     'rgba(59, 130, 246, 0.2)'};
        backdrop-filter: blur(20px);
        border: 1px solid ${type === 'success' ? 'rgba(74, 222, 128, 0.3)' : 
                           type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 
                           'rgba(59, 130, 246, 0.3)'};
        border-radius: 12px;
        color: #fff;
        font-size: 0.9rem;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// Add notification animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .otp-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .otp-header h3 {
        margin-bottom: 0.5rem;
        color: #fff;
    }
    
    .otp-header p {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
    }
    
    .otp-header #otp-email-display {
        color: #4ade80;
        font-weight: 600;
    }
    
    #otp-input {
        text-align: center;
        font-size: 1.5rem;
        letter-spacing: 0.5rem;
        font-weight: 600;
    }
    
    .resend-otp-btn {
        width: 100%;
        margin-top: 1rem;
        padding: 0.75rem;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: rgba(255, 255, 255, 0.7);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .resend-otp-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
    }
`;
document.head.appendChild(notificationStyles);

// Remember me functionality
const rememberCheckbox = document.getElementById('remember');
if (rememberCheckbox) {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
        document.getElementById('login-email').value = savedEmail;
        rememberCheckbox.checked = true;
    }
}

console.log('Hawkins Homestay Login Page - Loaded Successfully!');

