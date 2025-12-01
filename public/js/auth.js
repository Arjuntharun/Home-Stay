// Authentication utility functions
const API_BASE_URL = 'http://localhost:5000/api';

// Store token in localStorage
function setToken(token) {
    localStorage.setItem('token', token);
}

// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Remove token from localStorage
function removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

// Store user data
function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// Get user data
function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Check if user is logged in
function isLoggedIn() {
    return !!getToken();
}

// Get auth headers
function getAuthHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// API call helper
async function apiCall(endpoint, method = 'GET', data = null, requiresAuth = false) {
    const options = {
        method,
        headers: getAuthHeaders()
    };

    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Request failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Register user
async function registerUser(userData) {
    return await apiCall('/auth/register', 'POST', userData);
}

// Verify OTP
async function verifyOTP(email, otp) {
    return await apiCall('/auth/verify-otp', 'POST', { email, otp });
}

// Resend OTP
async function resendOTP(email) {
    return await apiCall('/auth/resend-otp', 'POST', { email });
}

// Login user
async function loginUser(email, password) {
    return await apiCall('/auth/login', 'POST', { email, password });
}

// Get current user
async function getCurrentUser() {
    return await apiCall('/auth/me', 'GET', null, true);
}

// Logout
function logout() {
    removeToken();
    window.location.href = '/index.html';
}

// Update UI based on auth status
function updateAuthUI() {
    const user = getUser();
    const token = getToken();
    
    // Find login button in navigation
    const navRight = document.querySelector('.nav-right');
    if (!navRight) return;
    
    const loginBtn = navRight.querySelector('.login-btn');
    
    if (token && user) {
        // User is logged in - show user dropdown
        if (loginBtn) {
            loginBtn.style.display = 'none';
        }
        
        // Create user dropdown if it doesn't exist
        let userDropdown = navRight.querySelector('.user-dropdown');
        if (!userDropdown) {
            userDropdown = document.createElement('div');
            userDropdown.className = 'user-dropdown';
            userDropdown.innerHTML = `
                <div class="user-avatar" id="user-avatar">
                    ${user.name.charAt(0).toUpperCase()}
                </div>
                <div class="user-dropdown-menu" id="user-dropdown-menu">
                    <div class="user-info">
                        <div class="user-name">${user.name}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a href="/public/profile/profile.html" class="dropdown-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Profile
                    </a>
                    <a href="#" class="dropdown-item" id="logout-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                    </a>
                </div>
            `;
            navRight.appendChild(userDropdown);
            
            // Add click handlers
            const avatar = userDropdown.querySelector('#user-avatar');
            const menu = userDropdown.querySelector('#user-dropdown-menu');
            const logoutBtn = userDropdown.querySelector('#logout-btn');
            
            avatar.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.toggle('show');
            });
            
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userDropdown.contains(e.target)) {
                    menu.classList.remove('show');
                }
            });
        }
    } else {
        // User is not logged in - show login button
        if (loginBtn) {
            loginBtn.style.display = 'block';
        }
        
        const userDropdown = navRight.querySelector('.user-dropdown');
        if (userDropdown) {
            userDropdown.remove();
        }
    }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    
    // Try to get current user if token exists
    if (isLoggedIn()) {
        getCurrentUser()
            .then(response => {
                if (response.success) {
                    setUser(response.data.user);
                    updateAuthUI();
                } else {
                    removeToken();
                    updateAuthUI();
                }
            })
            .catch(() => {
                removeToken();
                updateAuthUI();
            });
    }
});

