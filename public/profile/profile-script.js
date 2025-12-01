const API_BASE_URL = 'http://localhost:5000/api';

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/public/login/login.html';
        return;
    }
}

// Load user profile
async function loadProfile() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const user = data.data.user;
            document.getElementById('profile-name').value = user.name || '';
            document.getElementById('profile-email').value = user.email || '';
            document.getElementById('profile-phone').value = user.phone || '';
        } else {
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/public/login/login.html';
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Load bookings
async function loadBookings() {
    const bookingsList = document.getElementById('bookings-list');
    
    if (!bookingsList) {
        console.error('Bookings list element not found');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            bookingsList.innerHTML = '<p class="loading-text">Please login to view bookings</p>';
            return;
        }
        
        console.log('Fetching bookings...');
        const response = await fetch(`${API_BASE_URL}/user/bookings`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Bookings response status:', response.status);
        
        // Check if response is OK
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/public/login/login.html';
                return;
            }
            
            const errorData = await response.json().catch(() => ({ message: 'Failed to load bookings' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Bookings data received:', data);

        if (data.success) {
            const bookings = data.data?.bookings || [];
            console.log('Number of bookings:', bookings.length);
            
            if (bookings.length === 0) {
                bookingsList.innerHTML = `
                    <div class="no-bookings">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <p>No bookings found</p>
                        <a href="/public/book/book.html" style="color: #4ade80; margin-top: 1rem; display: inline-block;">Book Now</a>
                    </div>
                `;
            } else {
                bookingsList.innerHTML = bookings.map(booking => {
                    // Format status for display
                    const statusText = booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Pending';
                    const statusClass = booking.status || 'pending';
                    
                    // Format dates
                    const checkInDate = booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    }) : 'N/A';
                    
                    const checkOutDate = booking.checkOut ? new Date(booking.checkOut).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    }) : 'N/A';
                    
                    return `
                        <div class="booking-item">
                            <div class="booking-header">
                                <div class="booking-id">Booking ID: ${booking.bookingId || 'N/A'}</div>
                                <div class="booking-status ${statusClass}">${statusText}</div>
                            </div>
                            <div class="booking-details">
                                <div class="booking-detail-item">
                                    <div class="booking-detail-label">Package</div>
                                    <div class="booking-detail-value">${booking.package?.name || 'N/A'}</div>
                                </div>
                                <div class="booking-detail-item">
                                    <div class="booking-detail-label">Check-in</div>
                                    <div class="booking-detail-value">${checkInDate}</div>
                                </div>
                                <div class="booking-detail-item">
                                    <div class="booking-detail-label">Check-out</div>
                                    <div class="booking-detail-value">${checkOutDate}</div>
                                </div>
                                <div class="booking-detail-item">
                                    <div class="booking-detail-label">Guests</div>
                                    <div class="booking-detail-value">${booking.adults || 1} Adult(s)${booking.children > 0 ? `, ${booking.children} Child(ren)` : ''}</div>
                                </div>
                                <div class="booking-detail-item">
                                    <div class="booking-detail-label">Total Amount</div>
                                    <div class="booking-detail-value">₹${booking.totalAmount ? booking.totalAmount.toLocaleString('en-IN') : '0'}</div>
                                </div>
                                ${booking.payment && booking.payment.status === 'completed' ? `
                                <div class="booking-detail-item">
                                    <div class="booking-detail-label">Payment</div>
                                    <div class="booking-detail-value" style="color: #4ade80;">✓ Paid</div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } else {
            console.error('Failed to load bookings:', data);
            bookingsList.innerHTML = `<p class="loading-text">Failed to load bookings: ${data.message || 'Unknown error'}</p>`;
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsList.innerHTML = `<p class="loading-text">Error loading bookings: ${error.message}</p>`;
    }
}

// Edit profile
const editBtn = document.getElementById('edit-profile-btn');
if (editBtn) {
    editBtn.addEventListener('click', function() {
        const nameInput = document.getElementById('profile-name');
        const phoneInput = document.getElementById('profile-phone');
        
        if (this.textContent === 'Edit Profile') {
            nameInput.removeAttribute('readonly');
            phoneInput.removeAttribute('readonly');
            this.textContent = 'Save Changes';
            this.style.background = '#22c55e';
        } else {
            // Save changes
            saveProfile();
        }
    });
}

async function saveProfile() {
    const name = document.getElementById('profile-name').value;
    const phone = document.getElementById('profile-phone').value;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, phone })
        });

        const data = await response.json();

        if (data.success) {
            // Update local storage
            const user = JSON.parse(localStorage.getItem('user'));
            user.name = name;
            user.phone = phone;
            localStorage.setItem('user', JSON.stringify(user));
            
            // Make inputs readonly again
            document.getElementById('profile-name').setAttribute('readonly', 'readonly');
            document.getElementById('profile-phone').setAttribute('readonly', 'readonly');
            document.getElementById('edit-profile-btn').textContent = 'Edit Profile';
            document.getElementById('edit-profile-btn').style.background = '#4ade80';
            
            showNotification('Profile updated successfully!', 'success');
        } else {
            showNotification(data.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        showNotification('Failed to update profile', 'error');
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
        backdrop-filter: blur(20px);
        border: 1px solid ${type === 'success' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
        border-radius: 12px;
        color: #fff;
        z-index: 10000;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadProfile();
    loadBookings();
    
    // Update auth UI
    if (typeof updateAuthUI === 'function') {
        updateAuthUI();
    }
});

