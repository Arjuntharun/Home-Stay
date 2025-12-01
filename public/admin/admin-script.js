// Check authentication - prevent redirect loops
let authChecked = false;
let isRedirecting = false;

function checkAdminAuth() {
    // Prevent multiple checks or if already redirecting
    if (authChecked || isRedirecting) return true;
    
    const currentPath = window.location.pathname;
    // Only check if we're on admin.html, not login page
    if (currentPath.includes('admin.html') && !currentPath.includes('admin-login.html')) {
        const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
        const hasToken = localStorage.getItem('adminToken');
        
        if (!isLoggedIn || !hasToken) {
            authChecked = true;
            isRedirecting = true;
            
            // Hide body to prevent flicker
            document.body.style.opacity = '0';
            
            // Clear any stale data
            sessionStorage.clear();
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            
            // Redirect to login using replace to prevent back button issues
            setTimeout(() => {
                window.location.replace('/public/admin/admin-login.html');
            }, 100);
            return false;
        }
    }
    authChecked = true;
    return true;
}

// Check auth immediately (before page renders)
checkAdminAuth();

// Also check after DOM is ready as backup
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (!isRedirecting) {
            checkAdminAuth();
        }
    });
}

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Get authentication token
function getAuthToken() {
    return localStorage.getItem('adminToken');
}

// Make authenticated API call
async function apiCall(endpoint, options = {}) {
    const token = getAuthToken();
    if (!token) {
        window.location.href = '/public/admin/admin-login.html';
        return;
    }

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    });

    if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('adminToken');
        sessionStorage.clear();
        window.location.href = '/public/admin/admin-login.html';
        return;
    }

    return response.json();
}

// Sidebar Toggle
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');

if (menuToggle) {
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
}

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');
const pageTitle = document.getElementById('page-title');

navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all items
        navItems.forEach(nav => nav.classList.remove('active'));
        
        // Add active class to clicked item
        this.classList.add('active');
        
        // Get section to display
        const section = this.getAttribute('data-section');
        
        // Hide all sections
        contentSections.forEach(sec => sec.classList.remove('active'));
        
        // Show selected section
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update page title
        const sectionTitle = this.querySelector('span').textContent;
        pageTitle.textContent = sectionTitle;
        
        // Load section content
        loadSectionContent(section);
        
        // Close sidebar on mobile
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('active');
        }
    });
});

// Load Section Content
function loadSectionContent(section) {
    const targetSection = document.getElementById(`${section}-section`);
    
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'bookings':
            loadBookings(targetSection);
            break;
        case 'packages':
            loadPackages(targetSection);
            break;
        case 'activities':
            loadActivities(targetSection);
            break;
        case 'users':
            loadUsers(targetSection);
            break;
        case 'payments':
            loadPayments(targetSection);
            break;
        case 'availability':
            loadAvailability(targetSection);
            break;
        case 'settings':
            loadSettings(targetSection);
            break;
    }
}

// Load Dashboard
async function loadDashboard() {
    try {
        const data = await apiCall('/admin/dashboard');
        
        if (data.success) {
            // Update stats cards
            const stats = data.data.stats;
            const statValues = document.querySelectorAll('.stat-value');
            if (statValues.length >= 4) {
                statValues[0].textContent = stats.totalBookings || 0;
                statValues[1].textContent = stats.totalUsers || 0;
                statValues[2].textContent = `₹${formatPrice(stats.totalRevenue || 0)}`;
                statValues[3].textContent = stats.activePackages || 0;
            }
            
            // Update recent bookings table
            const tableBody = document.getElementById('recent-bookings-table');
            if (tableBody && data.data.recentBookings) {
                if (data.data.recentBookings.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: rgba(255,255,255,0.6);">No bookings yet</td></tr>';
                } else {
                    tableBody.innerHTML = data.data.recentBookings.slice(0, 5).map(booking => `
                        <tr>
                            <td><strong>${booking.bookingId || booking._id}</strong></td>
                            <td>${booking.user?.name || booking.guestDetails?.fullName || 'N/A'}</td>
                            <td>${booking.package?.name || 'N/A'}</td>
                            <td>${formatDate(booking.checkIn)}</td>
                            <td>${formatDate(booking.checkOut)}</td>
                            <td>₹${formatPrice(booking.totalAmount || 0)}</td>
                            <td><span class="status-badge ${booking.status}">${booking.status}</span></td>
                        </tr>
                    `).join('');
                }
            }
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

// Load Bookings
async function loadBookings(section) {
    section.innerHTML = `
        <div class="glass-card table-card">
            <div class="card-header">
                <h3>All Bookings</h3>
                <div style="display: flex; gap: 1rem;">
                    <select class="filter-select" id="booking-filter">
                        <option value="all">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                    </select>
                    <button class="btn-secondary" onclick="exportBookings()">Export CSV</button>
                </div>
            </div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Guest Name</th>
                            <th>Package</th>
                            <th>Check-in</th>
                            <th>Check-out</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="bookings-table-body">
                        <tr><td colspan="8" style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.6);">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    try {
        const data = await apiCall('/admin/bookings');
        
        if (data.success && data.data.bookings) {
            renderBookings(data.data.bookings);
            
            // Add filter functionality
            const filterSelect = document.getElementById('booking-filter');
            if (filterSelect) {
                filterSelect.addEventListener('change', function() {
                    const status = this.value;
                    const filtered = status === 'all' 
                        ? data.data.bookings 
                        : data.data.bookings.filter(b => b.status === status);
                    renderBookings(filtered);
                });
            }
        } else {
            document.getElementById('bookings-table-body').innerHTML = 
                '<tr><td colspan="8" style="text-align: center; color: rgba(255,255,255,0.6);">No bookings found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        document.getElementById('bookings-table-body').innerHTML = 
            '<tr><td colspan="8" style="text-align: center; color: rgba(239,68,68,0.8);">Failed to load bookings</td></tr>';
    }
}

function renderBookings(bookings) {
    const tbody = document.getElementById('bookings-table-body');
    if (!tbody) return;
    
    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: rgba(255,255,255,0.6);">No bookings found</td></tr>';
        return;
    }
    
    tbody.innerHTML = bookings.map(booking => `
        <tr>
            <td><strong>${booking.bookingId || booking._id}</strong></td>
            <td>${booking.user?.name || booking.guestDetails?.fullName || 'N/A'}</td>
            <td>${booking.package?.name || 'N/A'}</td>
            <td>${formatDate(booking.checkIn)}</td>
            <td>${formatDate(booking.checkOut)}</td>
            <td>₹${formatPrice(booking.totalAmount || 0)}</td>
            <td><span class="status-badge ${booking.status}">${booking.status}</span></td>
            <td>
                <button class="btn-action" onclick="viewBooking('${booking._id}')">View</button>
                <select class="status-select" onchange="updateBookingStatus('${booking._id}', this.value)" style="padding: 0.3rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #fff; font-size: 0.8rem;">
                    <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Cancel</option>
                    <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            </td>
        </tr>
    `).join('');
}

// Load Packages
async function loadPackages(section) {
    section.innerHTML = `
        <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
            <h2>Manage Packages</h2>
            <button class="btn-primary" onclick="openAddPackageModal()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Package
            </button>
        </div>

        <div class="packages-grid" id="packages-grid">
            <div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.6);">Loading packages...</div>
        </div>
    `;
    
    try {
        const data = await apiCall('/packages');
        
        if (data.success && data.data.packages) {
            renderPackages(data.data.packages);
        } else {
            document.getElementById('packages-grid').innerHTML = 
                '<div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.6);">No packages found. Add your first package!</div>';
        }
    } catch (error) {
        console.error('Error loading packages:', error);
        document.getElementById('packages-grid').innerHTML = 
            '<div style="text-align: center; padding: 3rem; color: rgba(239,68,68,0.8);">Failed to load packages</div>';
    }
}

function renderPackages(packages) {
    const grid = document.getElementById('packages-grid');
    if (!grid) return;
    
    if (packages.length === 0) {
        grid.innerHTML = '<div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.6);">No packages found. Add your first package!</div>';
        return;
    }
    
    grid.innerHTML = packages.map(pkg => `
        <div class="glass-card package-item">
            <div class="package-item-image">
                <img src="${pkg.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${pkg.name}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <span class="status-badge ${pkg.isActive ? 'active' : 'inactive'}">${pkg.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div class="package-item-content">
                <h3>${pkg.name}</h3>
                <p class="duration">${pkg.duration || 'N/A'}</p>
                <p class="price">₹${formatPrice(pkg.price || 0)}</p>
                <div class="package-actions">
                    <button class="btn-action" onclick="editPackage('${pkg._id}')">Edit</button>
                    <button class="btn-action danger" onclick="deletePackage('${pkg._id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load Activities
async function loadActivities(section) {
    section.innerHTML = `
        <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
            <h2>Manage Activities</h2>
            <button class="btn-primary" onclick="openAddActivityModal()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Activity
            </button>
        </div>

        <div class="activities-grid" id="activities-grid">
            <div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.6);">Loading activities...</div>
        </div>
    `;
    
    try {
        const data = await apiCall('/activities');
        
        if (data.success && data.data.activities) {
            renderActivities(data.data.activities);
        } else {
            document.getElementById('activities-grid').innerHTML = 
                '<div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.6);">No activities found. Add your first activity!</div>';
        }
    } catch (error) {
        console.error('Error loading activities:', error);
        document.getElementById('activities-grid').innerHTML = 
            '<div style="text-align: center; padding: 3rem; color: rgba(239,68,68,0.8);">Failed to load activities</div>';
    }
}

function renderActivities(activities) {
    const grid = document.getElementById('activities-grid');
    if (!grid) return;
    
    if (activities.length === 0) {
        grid.innerHTML = '<div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.6);">No activities found. Add your first activity!</div>';
        return;
    }
    
    grid.innerHTML = activities.map(activity => `
        <div class="glass-card activity-item">
            <div class="activity-item-image">
                <img src="${activity.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${activity.name}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <span class="status-badge ${activity.isActive ? 'active' : 'inactive'}">${activity.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div class="activity-item-content">
                <h3>${activity.name}</h3>
                <p class="price">₹${formatPrice(activity.price || 0)}</p>
                <div class="activity-actions">
                    <button class="btn-action" onclick="editActivity('${activity._id}')">Edit</button>
                    <button class="btn-action danger" onclick="deleteActivity('${activity._id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load Users
async function loadUsers(section) {
    section.innerHTML = `
        <div class="glass-card table-card">
            <div class="card-header">
                <h3>Registered Users</h3>
                <button class="btn-secondary" onclick="exportUsers()">Export CSV</button>
            </div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Email Verified</th>
                            <th>Joined Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="users-table-body">
                        <tr><td colspan="7" style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.6);">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    try {
        const data = await apiCall('/admin/users');
        
        if (data.success && data.data.users) {
            const tbody = document.getElementById('users-table-body');
            if (data.data.users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: rgba(255,255,255,0.6);">No users found</td></tr>';
            } else {
                tbody.innerHTML = data.data.users.map(user => `
                    <tr>
                        <td><strong>${user.name}</strong></td>
                        <td>${user.email}</td>
                        <td>${user.phone || 'N/A'}</td>
                        <td><span class="status-badge ${user.role}">${user.role}</span></td>
                        <td><span class="status-badge ${user.isEmailVerified ? 'active' : 'inactive'}">${user.isEmailVerified ? 'Verified' : 'Not Verified'}</span></td>
                        <td>${formatDate(user.createdAt)}</td>
                        <td>
                            <button class="btn-action" onclick="viewUser('${user._id}')">View</button>
                            ${user.role !== 'admin' ? `<button class="btn-action danger" onclick="deleteUser('${user._id}')">Delete</button>` : ''}
                        </td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('users-table-body').innerHTML = 
            '<tr><td colspan="7" style="text-align: center; color: rgba(239,68,68,0.8);">Failed to load users</td></tr>';
    }
}

// Load Payments
async function loadPayments(section) {
    section.innerHTML = `
        <div class="glass-card table-card">
            <div class="card-header">
                <h3>Payment History</h3>
                <button class="btn-secondary" onclick="exportPayments()">Export CSV</button>
            </div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Payment ID</th>
                            <th>Booking ID</th>
                            <th>User</th>
                            <th>Amount</th>
                            <th>Payment Method</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="payments-table-body">
                        <tr><td colspan="7" style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.6);">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    try {
        const data = await apiCall('/admin/payments');
        
        if (data.success && data.data.payments) {
            const tbody = document.getElementById('payments-table-body');
            if (data.data.payments.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: rgba(255,255,255,0.6);">No payments found</td></tr>';
            } else {
                tbody.innerHTML = data.data.payments.map(payment => `
                    <tr>
                        <td><strong>${payment.paymentId || payment._id}</strong></td>
                        <td>${payment.booking?.bookingId || payment.booking?._id || 'N/A'}</td>
                        <td>${payment.user?.name || payment.user?.email || 'N/A'}</td>
                        <td>₹${formatPrice(payment.amount || 0)}</td>
                        <td>${payment.paymentMethod || 'Razorpay'}</td>
                        <td>${formatDate(payment.paymentDate || payment.createdAt)}</td>
                        <td><span class="status-badge ${payment.status}">${payment.status}</span></td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading payments:', error);
        document.getElementById('payments-table-body').innerHTML = 
            '<tr><td colspan="7" style="text-align: center; color: rgba(239,68,68,0.8);">Failed to load payments</td></tr>';
    }
}

// Load Availability
function loadAvailability(section) {
    section.innerHTML = `
        <div class="glass-card">
            <h3 style="margin-bottom: 1.5rem;">Room Availability Calendar</h3>
            <div id="availability-calendar">
                <p style="color: rgba(255, 255, 255, 0.6);">Calendar view will be implemented here with date selection and availability status.</p>
            </div>
        </div>
    `;
}

// Load Settings
function loadSettings(section) {
    section.innerHTML = `
        <div class="glass-card">
            <h3 style="margin-bottom: 1.5rem;">Admin Settings</h3>
            <div class="settings-form">
                <div class="form-group">
                    <label>Change Password</label>
                    <input type="password" placeholder="Current Password">
                    <input type="password" placeholder="New Password">
                    <input type="password" placeholder="Confirm New Password">
                    <button class="btn-primary" style="margin-top: 1rem;">Update Password</button>
                </div>
            </div>
        </div>
    `;
}

// Modal Functions
function openAddPackageModal() {
    showPackageModal();
}

async function editPackage(id) {
    try {
        const data = await apiCall(`/packages/${id}`);
        if (data.success && data.data.package) {
            showPackageModal(data.data.package);
        } else {
            showNotification('Failed to load package details', 'error');
        }
    } catch (error) {
        console.error('Error loading package:', error);
        showNotification('Failed to load package details', 'error');
    }
}

async function deletePackage(id) {
    if (!confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
        return;
    }
    
    try {
        const data = await apiCall(`/admin/packages/${id}`, {
            method: 'DELETE'
        });
        
        if (data.success) {
            showNotification('Package deleted successfully', 'success');
            // Reload packages
            const section = document.getElementById('packages-section');
            if (section && section.classList.contains('active')) {
                loadPackages(section);
            }
        } else {
            showNotification(data.message || 'Failed to delete package', 'error');
        }
    } catch (error) {
        console.error('Error deleting package:', error);
        showNotification('Failed to delete package', 'error');
    }
}

function openAddActivityModal() {
    showActivityModal();
}

async function editActivity(id) {
    try {
        const data = await apiCall(`/activities/${id}`);
        if (data.success && data.data.activity) {
            showActivityModal(data.data.activity);
        } else {
            showNotification('Failed to load activity details', 'error');
        }
    } catch (error) {
        console.error('Error loading activity:', error);
        showNotification('Failed to load activity details', 'error');
    }
}

async function deleteActivity(id) {
    if (!confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
        return;
    }
    
    try {
        const data = await apiCall(`/admin/activities/${id}`, {
            method: 'DELETE'
        });
        
        if (data.success) {
            showNotification('Activity deleted successfully', 'success');
            // Reload activities
            const section = document.getElementById('activities-section');
            if (section && section.classList.contains('active')) {
                loadActivities(section);
            }
        } else {
            showNotification(data.message || 'Failed to delete activity', 'error');
        }
    } catch (error) {
        console.error('Error deleting activity:', error);
        showNotification('Failed to delete activity', 'error');
    }
}

async function updateBookingStatus(bookingId, status) {
    try {
        const data = await apiCall(`/admin/bookings/${bookingId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        
        if (data.success) {
            showNotification('Booking status updated successfully', 'success');
            // Reload bookings
            const section = document.getElementById('bookings-section');
            if (section && section.classList.contains('active')) {
                loadBookings(section);
            }
            // Reload dashboard if active
            loadDashboard();
        } else {
            showNotification(data.message || 'Failed to update booking status', 'error');
        }
    } catch (error) {
        console.error('Error updating booking status:', error);
        showNotification('Failed to update booking status', 'error');
    }
}

function viewBooking(id) {
    showNotification(`View Booking ${id} - Feature coming soon`, 'info');
}

function viewUser(id) {
    showNotification(`View User ${id} - Feature coming soon`, 'info');
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    showNotification('User deletion feature coming soon', 'info');
    // TODO: Implement user deletion API call when endpoint is available
}

// Export Functions
function exportBookings() {
    showNotification('Exporting bookings...', 'info');
}

function exportUsers() {
    showNotification('Exporting users...', 'info');
}

function exportPayments() {
    showNotification('Exporting payments...', 'info');
}

// Utility Functions
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
        return 'N/A';
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
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
        max-width: 350px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Package Modal
function showPackageModal(packageData = null) {
    const isEdit = !!packageData;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    
    modal.innerHTML = `
        <div class="glass-box" style="max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; padding: 2rem;">
            <h2 style="margin-bottom: 1.5rem;">${isEdit ? 'Edit' : 'Add'} Package</h2>
            <form id="package-form">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">Package Name *</label>
                    <input type="text" id="package-name" value="${packageData?.name || ''}" required style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">Description *</label>
                    <textarea id="package-description" required style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff; min-height: 100px;">${packageData?.description || ''}</textarea>
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">Duration * (e.g., "2 Nights / 3 Days")</label>
                    <input type="text" id="package-duration" value="${packageData?.duration || ''}" required style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">Price (₹) *</label>
                    <input type="number" id="package-price" value="${packageData?.price || ''}" required min="0" style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">Features (one per line)</label>
                    <textarea id="package-features" style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff; min-height: 80px;">${packageData?.features?.join('\n') || ''}</textarea>
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">Image</label>
                    <input type="file" id="package-image" accept="image/*" style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255,255,255,0.8);">
                        <input type="checkbox" id="package-active" ${packageData?.isActive !== false ? 'checked' : ''}>
                        <span>Active</span>
                    </label>
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <button type="submit" class="btn-primary" style="flex: 1;">${isEdit ? 'Update' : 'Create'} Package</button>
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()" style="flex: 1;">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('package-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePackage(packageData?._id);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

async function savePackage(packageId = null) {
    const formData = new FormData();
    formData.append('name', document.getElementById('package-name').value);
    formData.append('description', document.getElementById('package-description').value);
    formData.append('duration', document.getElementById('package-duration').value);
    formData.append('price', document.getElementById('package-price').value);
    formData.append('isActive', document.getElementById('package-active').checked);
    
    const features = document.getElementById('package-features').value.split('\n').filter(f => f.trim());
    formData.append('features', JSON.stringify(features));
    
    const imageFile = document.getElementById('package-image').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    try {
        const token = getAuthToken();
        const url = packageId ? `${API_BASE_URL}/admin/packages/${packageId}` : `${API_BASE_URL}/admin/packages`;
        const method = packageId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(`Package ${packageId ? 'updated' : 'created'} successfully`, 'success');
            document.querySelector('.modal-overlay').remove();
            
            // Reload packages
            const section = document.getElementById('packages-section');
            if (section && section.classList.contains('active')) {
                loadPackages(section);
            }
        } else {
            showNotification(data.message || 'Failed to save package', 'error');
        }
    } catch (error) {
        console.error('Error saving package:', error);
        showNotification('Failed to save package', 'error');
    }
}

// Activity Modal
function showActivityModal(activityData = null) {
    const isEdit = !!activityData;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    
    modal.innerHTML = `
        <div class="glass-box" style="max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; padding: 2rem;">
            <h2 style="margin-bottom: 1.5rem;">${isEdit ? 'Edit' : 'Add'} Activity</h2>
            <form id="activity-form">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">Activity Name *</label>
                    <input type="text" id="activity-name" value="${activityData?.name || ''}" required style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">Description *</label>
                    <textarea id="activity-description" required style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff; min-height: 100px;">${activityData?.description || ''}</textarea>
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">Price (₹) *</label>
                    <input type="number" id="activity-price" value="${activityData?.price || ''}" required min="0" style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">Image</label>
                    <input type="file" id="activity-image" accept="image/*" style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255,255,255,0.8);">
                        <input type="checkbox" id="activity-active" ${activityData?.isActive !== false ? 'checked' : ''}>
                        <span>Active</span>
                    </label>
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <button type="submit" class="btn-primary" style="flex: 1;">${isEdit ? 'Update' : 'Create'} Activity</button>
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()" style="flex: 1;">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('activity-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveActivity(activityData?._id);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

async function saveActivity(activityId = null) {
    const formData = new FormData();
    formData.append('name', document.getElementById('activity-name').value);
    formData.append('description', document.getElementById('activity-description').value);
    formData.append('price', document.getElementById('activity-price').value);
    formData.append('isActive', document.getElementById('activity-active').checked);
    
    const imageFile = document.getElementById('activity-image').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    try {
        const token = getAuthToken();
        const url = activityId ? `${API_BASE_URL}/admin/activities/${activityId}` : `${API_BASE_URL}/admin/activities`;
        const method = activityId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(`Activity ${activityId ? 'updated' : 'created'} successfully`, 'success');
            document.querySelector('.modal-overlay').remove();
            
            // Reload activities
            const section = document.getElementById('activities-section');
            if (section && section.classList.contains('active')) {
                loadActivities(section);
            }
        } else {
            showNotification(data.message || 'Failed to save activity', 'error');
        }
    } catch (error) {
        console.error('Error saving activity:', error);
        showNotification('Failed to save activity', 'error');
    }
}

// Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            sessionStorage.clear();
            showNotification('Logging out...', 'info');
            setTimeout(() => {
                window.location.href = '/public/admin/admin-login.html';
            }, 1000);
        }
    });
}

// Make functions global for onclick handlers
window.openAddPackageModal = openAddPackageModal;
window.openAddActivityModal = openAddActivityModal;
window.editPackage = editPackage;
window.deletePackage = deletePackage;
window.editActivity = editActivity;
window.deleteActivity = deleteActivity;
window.updateBookingStatus = updateBookingStatus;
window.viewBooking = viewBooking;
window.viewUser = viewUser;
window.deleteUser = deleteUser;
window.exportBookings = exportBookings;
window.exportUsers = exportUsers;
window.exportPayments = exportPayments;

// Initialize
window.addEventListener('load', function() {
    // Show body after auth check passes
    document.body.classList.add('loaded');
    loadDashboard();
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
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
        
        .btn-primary {
            padding: 0.8rem 1.5rem;
            background: linear-gradient(135deg, #4ade80, #22c55e);
            border: none;
            border-radius: 8px;
            color: #000;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(74, 222, 128, 0.4);
        }
        
        .btn-action {
            padding: 0.5rem 1rem;
            background: rgba(74, 222, 128, 0.1);
            border: 1px solid rgba(74, 222, 128, 0.2);
            color: #4ade80;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
            margin-right: 0.5rem;
            transition: all 0.3s ease;
        }
        
        .btn-action:hover {
            background: rgba(74, 222, 128, 0.2);
        }
        
        .btn-action.danger {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.2);
            color: #ef4444;
        }
        
        .btn-action.danger:hover {
            background: rgba(239, 68, 68, 0.2);
        }
        
        .filter-select {
            padding: 0.7rem 1rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #fff;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.85rem;
        }
        
        .packages-grid, .activities-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
        }
        
        .package-item, .activity-item {
            overflow: hidden;
        }
        
        .package-item-image, .activity-item-image {
            position: relative;
            height: 200px;
            overflow: hidden;
        }
        
        .package-item-image img, .activity-item-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .package-item:hover img, .activity-item:hover img {
            transform: scale(1.1);
        }
        
        .package-item-image .status-badge, .activity-item-image .status-badge {
            position: absolute;
            top: 1rem;
            right: 1rem;
        }
        
        .package-item-content, .activity-item-content {
            padding: 1.5rem;
        }
        
        .package-item-content h3, .activity-item-content h3 {
            font-size: 1.3rem;
            margin-bottom: 0.5rem;
        }
        
        .duration {
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.9rem;
            margin-bottom: 0.8rem;
        }
        
        .price {
            font-size: 1.5rem;
            font-weight: 700;
            color: #4ade80;
            margin-bottom: 1rem;
        }
        
        .package-actions, .activity-actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .settings-form {
            max-width: 500px;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.8rem;
            color: rgba(255, 255, 255, 0.8);
            font-weight: 500;
        }
        
        .form-group input {
            width: 100%;
            padding: 0.9rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            color: #fff;
            font-size: 0.95rem;
            margin-bottom: 0.8rem;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #4ade80;
            background: rgba(255, 255, 255, 0.08);
        }
    `;
    document.head.appendChild(style);
});

console.log('Admin Dashboard - Loaded Successfully!');