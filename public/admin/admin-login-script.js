// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Toggle Password Visibility
const togglePasswordBtn = document.getElementById('toggle-password');
const passwordInput = document.getElementById('admin-password');
const eyeIcon = document.querySelector('.eye-icon');
const eyeOffIcon = document.querySelector('.eye-off-icon');

if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle icon visibility
        eyeIcon.style.display = type === 'password' ? 'block' : 'none';
        eyeOffIcon.style.display = type === 'password' ? 'none' : 'block';
    });
}

// Form Submission
const loginForm = document.getElementById('admin-login-form');
const loginBtn = document.getElementById('login-btn');
const usernameInput = document.getElementById('admin-username');

if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
}

async function handleLogin() {
    const email = usernameInput.value.trim();
    const password = passwordInput.value;
    
    // Clear previous error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Validate inputs
    if (!email || !password) {
        showMessage('Please enter both email and password', 'error');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading state
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    
    try {
        // Make API call to login
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        if (data.success && data.data) {
            // Check if user is admin
            if (data.data.user.role !== 'admin') {
                throw new Error('Access denied. Admin privileges required.');
            }
            
            // Store token and user data
            localStorage.setItem('adminToken', data.data.token);
            localStorage.setItem('adminUser', JSON.stringify(data.data.user));
            sessionStorage.setItem('adminLoggedIn', 'true');
            sessionStorage.setItem('adminUsername', data.data.user.email);
            sessionStorage.setItem('loginTime', new Date().toISOString());
            
            // Success
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect to admin dashboard using replace to prevent back button issues
            setTimeout(() => {
                window.location.replace('/public/admin/admin.html');
            }, 1500);
        } else {
            throw new Error(data.message || 'Login failed');
        }
    } catch (error) {
        // Failed
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
        showMessage(error.message || 'Invalid email or password', 'error');
        
        // Shake the form
        document.querySelector('.glass-box').style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            document.querySelector('.glass-box').style.animation = '';
        }, 500);
    }
}

// Show Message
function showMessage(message, type) {
    const existingMessage = document.querySelector('.error-message, .success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
    
    const icon = type === 'error' 
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    
    messageDiv.innerHTML = `${icon}<span>${message}</span>`;
    
    const form = document.querySelector('.login-form');
    form.insertBefore(messageDiv, form.querySelector('h2').nextSibling);
}

// Remember Me Functionality
const rememberMeCheckbox = document.getElementById('remember-me');

// Check if user has saved credentials
window.addEventListener('load', function() {
    const savedEmail = localStorage.getItem('rememberedAdminEmail');
    if (savedEmail) {
        usernameInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }
});

// Save email if remember me is checked
if (loginForm) {
    loginForm.addEventListener('submit', function() {
        if (rememberMeCheckbox && rememberMeCheckbox.checked) {
            localStorage.setItem('rememberedAdminEmail', usernameInput.value.trim());
        } else {
            localStorage.removeItem('rememberedAdminEmail');
        }
    });
}

// Forgot Password Handler
const forgotPasswordLink = document.querySelector('.forgot-password');
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('Please contact the system administrator to reset your password.', 'error');
    });
}

// Input Animation on Focus
document.querySelectorAll('.input-group input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.01)';
        this.parentElement.style.transition = 'transform 0.2s ease';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// Check if already logged in - validate token first
let sessionCheckDone = false;

async function checkExistingSession() {
    // Prevent multiple checks
    if (sessionCheckDone) return;
    sessionCheckDone = true;
    
    // Only check on login page
    if (!window.location.pathname.includes('admin-login.html')) {
        return;
    }
    
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    const hasToken = localStorage.getItem('adminToken');
    
    if (isLoggedIn && hasToken) {
        // Verify token is still valid by making a test API call
        try {
            const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${hasToken}`
                }
            });
            
            if (response.ok) {
                // Token is valid, redirect to admin panel
                window.location.replace('/public/admin/admin.html');
            } else {
                // Token invalid, clear storage
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                sessionStorage.clear();
            }
        } catch (error) {
            // Error checking token (server might be down), don't redirect
            // Just clear storage and let user login fresh
            console.log('Could not verify token, please login:', error);
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            sessionStorage.clear();
        }
    }
}

// Check existing session on page load (only on login page)
window.addEventListener('load', function() {
    // Only check if we're on login page
    if (window.location.pathname.includes('admin-login.html')) {
        checkExistingSession();
    }
});

// Prevent back button after logout
window.addEventListener('pageshow', function(event) {
    if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
        // Clear any stale session data
        if (!sessionStorage.getItem('adminLoggedIn')) {
            sessionStorage.clear();
        }
    }
});

// Keyboard shortcut (Enter to submit)
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && (document.activeElement === usernameInput || document.activeElement === passwordInput)) {
        handleLogin();
    }
});

console.log('Admin Login Page - Loaded Successfully!');
console.log('Use admin email and password to login');