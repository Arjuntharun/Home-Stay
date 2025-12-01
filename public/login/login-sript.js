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
    });
});

// Password toggle functionality
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
        const passwordInput = this.parentElement.querySelector('input');
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle icon (optional - add different SVG paths for show/hide)
        this.style.color = type === 'text' ? '#4ade80' : 'rgba(255, 255, 255, 0.5)';
    });
});

// Login form submission
const loginSubmit = document.getElementById('login-submit');
if (loginSubmit) {
    loginSubmit.addEventListener('click', function(e) {
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
        
        // Simulate login process
        this.textContent = 'Logging in...';
        this.style.background = 'rgba(74, 222, 128, 0.3)';
        
        setTimeout(() => {
            showNotification('Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                // Redirect to home page or dashboard
                window.location.href = '/index.html';
            }, 1500);
        }, 1500);
    });
}

// Sign up form submission
const signupSubmit = document.getElementById('signup-submit');
if (signupSubmit) {
    signupSubmit.addEventListener('click', function(e) {
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
        
        if (password.length < 8) {
            showNotification('Password must be at least 8 characters long', 'error');
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
        
        // Simulate sign up process
        this.textContent = 'Creating Account...';
        this.style.background = 'rgba(74, 222, 128, 0.3)';
        
        setTimeout(() => {
            showNotification('Account created successfully! Redirecting...', 'success');
            
            setTimeout(() => {
                // Redirect to home page or dashboard
                window.location.href = '/index.html';
            }, 1500);
        }, 1500);
    });
}

// Social login buttons
document.querySelectorAll('.social-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        
        const provider = this.classList.contains('google-btn') ? 'Google' : 'Facebook';
        
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
        
        showNotification(`Redirecting to ${provider} authentication...`, 'info');
        
        // Simulate social login redirect
        setTimeout(() => {
            console.log(`${provider} authentication initiated`);
        }, 1000);
    });
});

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
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
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
    
    // Auto remove after 4 seconds
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
`;
document.head.appendChild(notificationStyles);

// Input focus animations
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.01)';
        this.parentElement.style.transition = 'transform 0.2s ease';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// Prevent form submission on Enter key (except for buttons)
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            // Find and click the submit button in the active form
            const activeForm = document.querySelector('.form-wrapper.active');
            if (activeForm) {
                const submitBtn = activeForm.querySelector('.submit-btn');
                if (submitBtn) {
                    submitBtn.click();
                }
            }
        }
    });
});

// Smooth page load animation
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.6s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Glass effect on hover
const loginBox = document.querySelector('.login-box');
if (loginBox) {
    loginBox.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        this.style.setProperty('--mouse-x', `${x}%`);
        this.style.setProperty('--mouse-y', `${y}%`);
    });
}

// Forgot password link
const forgotPasswordLink = document.querySelector('.forgot-password');
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('Password reset link will be sent to your email', 'info');
        
        // Here you would implement actual password reset functionality
        console.log('Forgot password clicked');
    });
}

// Button ripple effect
document.querySelectorAll('.submit-btn, .social-btn, .tab-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple CSS dynamically
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .submit-btn, .social-btn, .tab-btn {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(rippleStyle);

// Remember me functionality
const rememberCheckbox = document.getElementById('remember');
if (rememberCheckbox) {
    // Load saved email if remember me was checked
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
        document.getElementById('login-email').value = savedEmail;
        rememberCheckbox.checked = true;
    }
    
    // Save email when logging in with remember me checked
    loginSubmit.addEventListener('click', function() {
        const email = document.getElementById('login-email').value;
        if (rememberCheckbox.checked && email) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
    });
}

console.log('Hawkins Homestay Login Page - Loaded Successfully!');