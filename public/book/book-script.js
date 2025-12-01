// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Get authentication token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Check if user is logged in
function isUserLoggedIn() {
    const token = getAuthToken();
    const user = localStorage.getItem('user');
    return token && user;
}

// State Management
let bookingState = {
    selectedPackage: null,
    selectedActivities: [],
    packagePrice: 0,
    activitiesPrice: 0,
    totalPrice: 0,
    numberOfGuests: 1
};

// Store packages and activities data
let packagesData = [];
let activitiesData = [];

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

// Package Selection - Use event delegation for dynamically loaded cards
const packagesGrid = document.getElementById('packages-grid');
const activitiesSection = document.getElementById('activities-section');
const bookingFormSection = document.getElementById('booking-form-section');
const activitiesGrid = document.getElementById('activities-grid');

// Event delegation for package cards
if (packagesGrid) {
    packagesGrid.addEventListener('click', function(e) {
        const card = e.target.closest('.package-card');
        if (card) {
            const selectBtn = e.target.closest('.select-package-btn');
            if (selectBtn) {
                e.stopPropagation();
            }
            selectPackage(card);
        }
    });
}

function selectPackage(card) {
    // Remove previous selection
    document.querySelectorAll('.package-card').forEach(c => c.classList.remove('selected'));
    
    // Add selection to clicked card
    card.classList.add('selected');
    
    // Get package data
    const packageId = card.getAttribute('data-package-id');
    const packageName = card.getAttribute('data-package-name');
    const packagePrice = parseInt(card.getAttribute('data-package-price'));
    const packageDuration = card.getAttribute('data-package-duration');
    
    // Update state
    bookingState.selectedPackage = {
        id: packageId,
        name: packageName,
        price: packagePrice,
        duration: packageDuration
    };
    bookingState.packagePrice = packagePrice;
    
    // Update summary
    updateSummary();
    
    // Show activities and form sections
    if (activitiesSection) activitiesSection.style.display = 'block';
    if (bookingFormSection) bookingFormSection.style.display = 'block';
    
    // Smooth scroll to activities
    setTimeout(() => {
        if (activitiesSection) {
            activitiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 300);
    
    // Add ripple effect
    if (event) {
        createRipple(card, event);
    }
}

// Activity Selection - Use event delegation for dynamically loaded cards
if (activitiesGrid) {
    activitiesGrid.addEventListener('click', function(e) {
        const card = e.target.closest('.activity-card');
        const checkboxContainer = e.target.closest('.activity-checkbox');
        
        if (checkboxContainer && card) {
            // Click on checkbox container toggles the checkbox
            const checkbox = checkboxContainer.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = !checkbox.checked;
                toggleActivity(card, checkbox.checked);
            }
        } else if (card && !checkboxContainer) {
            // Click on card (but not checkbox) - optional: could also toggle
            // For now, only checkbox area is clickable
        }
    });
    
    activitiesGrid.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox') {
            const card = e.target.closest('.activity-card');
            if (card) {
                toggleActivity(card, e.target.checked);
            }
        }
    });
}

function toggleActivity(card, isChecked) {
    const activityId = card.getAttribute('data-activity-id');
    const activityName = card.getAttribute('data-activity-name');
    const activityPrice = parseInt(card.getAttribute('data-activity-price'));
    
    if (isChecked) {
        card.classList.add('selected');
        
        // Add to selected activities
        bookingState.selectedActivities.push({
            id: activityId,
            name: activityName,
            price: activityPrice
        });
    } else {
        card.classList.remove('selected');
        
        // Remove from selected activities
        bookingState.selectedActivities = bookingState.selectedActivities.filter(
            activity => activity.id !== activityId
        );
    }
    
    // Update activities price
    bookingState.activitiesPrice = bookingState.selectedActivities.reduce(
        (sum, activity) => sum + activity.price, 0
    );
    
    // Update summary
    updateSummary();
}

// Update Booking Summary
function updateSummary() {
    // Update package details
    if (bookingState.selectedPackage) {
        document.getElementById('summary-package-name').textContent = bookingState.selectedPackage.name;
        document.getElementById('summary-package-duration').textContent = bookingState.selectedPackage.duration;
        document.getElementById('summary-package-price').textContent = `₹${formatPrice(bookingState.packagePrice * bookingState.numberOfGuests)}`;
    }
    
    // Update activities list
    const activitiesList = document.getElementById('activities-list');
    
    if (bookingState.selectedActivities.length === 0) {
        activitiesList.innerHTML = '<p class="no-activities">No activities selected</p>';
    } else {
        activitiesList.innerHTML = bookingState.selectedActivities.map(activity => `
            <div class="activity-item">
                <span class="activity-item-name">${activity.name}</span>
                <span class="activity-item-price">+₹${formatPrice(activity.price * bookingState.numberOfGuests)}</span>
            </div>
        `).join('');
    }
    
    // Update total price
    bookingState.totalPrice = (bookingState.packagePrice + bookingState.activitiesPrice) * bookingState.numberOfGuests;
    document.getElementById('total-price').textContent = `₹${formatPrice(bookingState.totalPrice)}`;
}

// Format price with commas
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Guest Count Change
const adultsSelect = document.getElementById('adults');
const childrenSelect = document.getElementById('children');

if (adultsSelect) {
    adultsSelect.addEventListener('change', function() {
        const adults = parseInt(this.value) || 1;
        const children = parseInt(childrenSelect.value) || 0;
        bookingState.numberOfGuests = adults;
        
        // Update summary guests display
        const guestsText = `${adults} ${adults === 1 ? 'Adult' : 'Adults'}${children > 0 ? `, ${children} ${children === 1 ? 'Child' : 'Children'}` : ''}`;
        document.getElementById('summary-guests').textContent = guestsText;
        
        updateSummary();
    });
}

if (childrenSelect) {
    childrenSelect.addEventListener('change', function() {
        const adults = parseInt(adultsSelect.value) || 1;
        const children = parseInt(this.value) || 0;
        
        const guestsText = `${adults} ${adults === 1 ? 'Adult' : 'Adults'}${children > 0 ? `, ${children} ${children === 1 ? 'Child' : 'Children'}` : ''}`;
        document.getElementById('summary-guests').textContent = guestsText;
    });
}

// Form Validation and Submission
const confirmBookingBtn = document.getElementById('confirm-booking-btn');
const confirmationModal = document.getElementById('confirmation-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const viewBookingBtn = document.getElementById('view-booking-btn');

if (confirmBookingBtn) {
    confirmBookingBtn.addEventListener('click', function() {
        if (validateBookingForm()) {
            submitBooking();
        }
    });
}

function validateBookingForm() {
    const fullName = document.getElementById('full-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    
    if (!fullName) {
        showNotification('Please enter your full name', 'error');
        document.getElementById('full-name').focus();
        return false;
    }
    
    if (!email || !validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        document.getElementById('email').focus();
        return false;
    }
    
    if (!phone || !validatePhone(phone)) {
        showNotification('Please enter a valid phone number', 'error');
        document.getElementById('phone').focus();
        return false;
    }
    
    if (!checkin) {
        showNotification('Please select check-in date', 'error');
        document.getElementById('checkin').focus();
        return false;
    }
    
    if (!checkout) {
        showNotification('Please select check-out date', 'error');
        document.getElementById('checkout').focus();
        return false;
    }
    
    // Validate dates
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkinDate < today) {
        showNotification('Check-in date cannot be in the past', 'error');
        document.getElementById('checkin').focus();
        return false;
    }
    
    if (checkoutDate <= checkinDate) {
        showNotification('Check-out date must be after check-in date', 'error');
        document.getElementById('checkout').focus();
        return false;
    }
    
    if (!bookingState.selectedPackage) {
        showNotification('Please select a package', 'error');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
    }
    
    return true;
}

async function submitBooking() {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
        showNotification('Please login to continue with booking', 'error');
        setTimeout(() => {
            window.location.href = '/public/login/login.html';
        }, 1500);
        return;
    }
    
    // Show loading state
    confirmBookingBtn.textContent = 'Creating Booking...';
    confirmBookingBtn.disabled = true;
    
    try {
        // Get form data
        const fullName = document.getElementById('full-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const checkin = document.getElementById('checkin').value;
        const checkout = document.getElementById('checkout').value;
        const adults = parseInt(document.getElementById('adults').value) || 1;
        const children = parseInt(document.getElementById('children').value) || 0;
        const specialRequests = document.getElementById('special-requests').value.trim();
        
        // Validate selected package exists
        if (!bookingState.selectedPackage || !bookingState.selectedPackage.id) {
            throw new Error('Please select a package to continue');
        }
        
        // Prepare booking data - filter out invalid activity IDs
        const activityIds = bookingState.selectedActivities && bookingState.selectedActivities.length > 0
            ? bookingState.selectedActivities
                .map(a => a && a.id ? a.id : null)
                .filter(id => {
                    // Filter out null, undefined, empty strings, and invalid MongoDB ObjectId format
                    if (!id) return false;
                    const idStr = String(id).trim();
                    return idStr.length === 24 && /^[0-9a-fA-F]{24}$/.test(idStr);
                })
            : [];
        
        // Prepare booking data
        const bookingData = {
            package: bookingState.selectedPackage.id,
            activities: activityIds, // Already filtered array
            guestDetails: {
                fullName,
                email,
                phone
            },
            checkIn: checkin,
            checkOut: checkout,
            adults: adults || 1, // Ensure at least 1 adult
            children: children || 0,
            specialRequests: specialRequests || ''
        };
        
        // Log booking data for debugging (remove in production)
        console.log('Sending booking data:', {
            ...bookingData,
            packageId: bookingData.package,
            activitiesCount: bookingData.activities.length
        });
        
        // Create booking
        const token = getAuthToken();
        const bookingResponse = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
        });
        
        const bookingResult = await bookingResponse.json();
        
        if (!bookingResponse.ok) {
            // Handle validation errors
            if (bookingResult.errors && Array.isArray(bookingResult.errors)) {
                const errorMessages = bookingResult.errors.map(err => {
                    if (typeof err === 'string') return err;
                    return err.msg || err.message || JSON.stringify(err);
                }).filter(Boolean).join(', ');
                throw new Error(errorMessages || bookingResult.message || 'Failed to create booking');
            }
            throw new Error(bookingResult.message || bookingResult.error || 'Failed to create booking');
        }
        
        if (!bookingResult.success) {
            throw new Error(bookingResult.message || 'Booking creation failed');
        }
        
        const booking = bookingResult.data.booking;
        showNotification('Booking created! Processing payment...', 'success');
        
        // Create Razorpay order
        confirmBookingBtn.textContent = 'Creating Payment...';
        const orderResponse = await fetch(`${API_BASE_URL}/payments/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bookingId: booking._id })
        });
        
        const orderResult = await orderResponse.json();
        
        if (!orderResponse.ok || !orderResult.success) {
            throw new Error(orderResult.message || 'Failed to create payment order');
        }
        
        const { orderId, amount, currency, keyId } = orderResult.data;
        
        // Open Razorpay checkout
        const options = {
            key: keyId,
            amount: amount,
            currency: currency,
            name: 'Hawkins Homestay',
            description: `Booking: ${booking.bookingId}`,
            order_id: orderId,
            handler: async function(response) {
                // Payment successful, verify payment
                await verifyPayment(response, booking._id, booking.bookingId);
            },
            prefill: {
                name: fullName,
                email: email,
                contact: phone
            },
            theme: {
                color: '#4ade80'
            },
            modal: {
                ondismiss: function() {
                    confirmBookingBtn.textContent = 'Confirm Booking';
                    confirmBookingBtn.disabled = false;
                    showNotification('Payment cancelled', 'error');
                }
            }
        };
        
        const razorpay = new Razorpay(options);
        razorpay.open();
        
        razorpay.on('payment.failed', function(response) {
            showNotification('Payment failed. Please try again.', 'error');
            confirmBookingBtn.textContent = 'Confirm Booking';
            confirmBookingBtn.disabled = false;
        });
        
    } catch (error) {
        console.error('Booking error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        
        // Show detailed error message
        const errorMessage = error.message || 'Failed to create booking. Please try again.';
        showNotification(errorMessage, 'error');
        
        confirmBookingBtn.textContent = 'Confirm Booking';
        confirmBookingBtn.disabled = false;
    }
}

// Verify payment after Razorpay success
async function verifyPayment(razorpayResponse, bookingId, bookingIdString) {
    try {
        confirmBookingBtn.textContent = 'Verifying Payment...';
        
        const token = getAuthToken();
        const verifyResponse = await fetch(`${API_BASE_URL}/payments/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                bookingId: bookingId
            })
        });
        
        const verifyResult = await verifyResponse.json();
        
        if (!verifyResponse.ok || !verifyResult.success) {
            throw new Error(verifyResult.message || 'Payment verification failed');
        }
        
        // Payment verified successfully
        const { booking, payment } = verifyResult.data;
        
        // Update modal with booking details
        document.getElementById('modal-booking-id').textContent = booking.bookingId || bookingIdString;
        document.getElementById('modal-package-name').textContent = booking.package?.name || bookingState.selectedPackage.name;
        document.getElementById('modal-total-price').textContent = `₹${formatPrice(payment.amount)}`;
        
        // Show success modal
        confirmationModal.classList.add('active');
        
        // Reset button
        confirmBookingBtn.textContent = 'Confirm Booking';
        confirmBookingBtn.disabled = false;
        
        // Show success notification
        showNotification('Payment successful! Booking confirmed.', 'success');
        
        // Reset form after successful booking
        setTimeout(() => {
            resetBookingForm();
        }, 2000);
        
    } catch (error) {
        console.error('Payment verification error:', error);
        showNotification('Payment verification failed. Please contact support.', 'error');
        confirmBookingBtn.textContent = 'Confirm Booking';
        confirmBookingBtn.disabled = false;
    }
}

// Reset booking form
function resetBookingForm() {
    document.getElementById('full-name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('checkin').value = '';
    document.getElementById('checkout').value = '';
    document.getElementById('special-requests').value = '';
    document.getElementById('adults').value = '1';
    document.getElementById('children').value = '0';
    
    // Reset booking state
    bookingState.selectedPackage = null;
    bookingState.selectedActivities = [];
    bookingState.packagePrice = 0;
    bookingState.activitiesPrice = 0;
    bookingState.totalPrice = 0;
    bookingState.numberOfGuests = 1;
    
    // Reset UI
    document.querySelectorAll('.package-card').forEach(card => card.classList.remove('selected'));
    document.querySelectorAll('.activity-card').forEach(card => {
        card.classList.remove('selected');
        const checkbox = card.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.checked = false;
    });
    
    activitiesSection.style.display = 'none';
    bookingFormSection.style.display = 'none';
}

// Modal Controls
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', function() {
        confirmationModal.classList.remove('active');
        
        // Optionally redirect to home page
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 500);
    });
}

if (viewBookingBtn) {
    viewBookingBtn.addEventListener('click', function() {
        confirmationModal.classList.remove('active');
        showNotification('Redirecting to booking details...', 'info');
        
        // Redirect to booking details page (implement as needed)
        setTimeout(() => {
            console.log('Redirect to booking details page');
        }, 1000);
    });
}

// Close modal when clicking overlay
const modalOverlay = document.querySelector('.modal-overlay');
if (modalOverlay) {
    modalOverlay.addEventListener('click', function() {
        confirmationModal.classList.remove('active');
    });
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
        max-width: 350px;
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
`;
document.head.appendChild(notificationStyles);

// Input focus animations
document.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.01)';
        this.parentElement.style.transition = 'transform 0.2s ease';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// Ripple effect
function createRipple(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(74, 222, 128, 0.6);
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
    
    .package-card, .select-package-btn, .confirm-booking-btn, .btn-primary, .btn-secondary {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(rippleStyle);

// Button ripple effects
document.querySelectorAll('.select-package-btn, .confirm-booking-btn, .btn-primary, .btn-secondary').forEach(button => {
    button.addEventListener('click', function(e) {
        createRipple(this, e);
    });
});

// Set minimum dates for check-in and check-out
const today = new Date().toISOString().split('T')[0];
const checkinInput = document.getElementById('checkin');
const checkoutInput = document.getElementById('checkout');

if (checkinInput) {
    checkinInput.setAttribute('min', today);
    
    checkinInput.addEventListener('change', function() {
        const checkinDate = new Date(this.value);
        checkinDate.setDate(checkinDate.getDate() + 1);
        const minCheckout = checkinDate.toISOString().split('T')[0];
        checkoutInput.setAttribute('min', minCheckout);
        
        // Clear checkout if it's before new minimum
        if (checkoutInput.value && checkoutInput.value < minCheckout) {
            checkoutInput.value = '';
        }
    });
}

if (checkoutInput) {
    checkoutInput.setAttribute('min', today);
}

// Smooth scroll for package cards
document.querySelectorAll('.package-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        if (!this.classList.contains('selected')) {
            this.style.transform = 'translateY(0) scale(1)';
        }
    });
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards for animation
document.querySelectorAll('.package-card, .activity-card, .glass-box').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(el);
});

// Smooth page load
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.6s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Auto-fill form (for testing)
// Uncomment to enable auto-fill
/*
document.getElementById('full-name').value = 'John Doe';
document.getElementById('email').value = 'john@example.com';
document.getElementById('phone').value = '+91 9876543210';
document.getElementById('checkin').value = '2024-12-20';
document.getElementById('checkout').value = '2024-12-23';
*/

// Load Packages from API
async function loadPackages() {
    const packagesGrid = document.getElementById('packages-grid');
    if (!packagesGrid) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/packages`);
        const data = await response.json();
        
        if (data.success && data.data.packages && data.data.packages.length > 0) {
            packagesData = data.data.packages;
            renderPackages(packagesData);
        } else {
            packagesGrid.innerHTML = `
                <div class="loading-message" style="text-align: center; padding: 3rem; color: rgba(255, 255, 255, 0.7);">
                    <p>No packages available at the moment. Please check back later.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading packages:', error);
        packagesGrid.innerHTML = `
            <div class="loading-message" style="text-align: center; padding: 3rem; color: rgba(239, 68, 68, 0.8);">
                <p>Failed to load packages. Please try again later.</p>
            </div>
        `;
    }
}

// Render Packages
function renderPackages(packages) {
    const packagesGrid = document.getElementById('packages-grid');
    if (!packagesGrid) return;
    
    packagesGrid.innerHTML = packages.map(pkg => `
        <div class="package-card" 
             data-package-id="${pkg._id}"
             data-package-name="${pkg.name}"
             data-package-price="${pkg.price}"
             data-package-duration="${pkg.duration || 'N/A'}">
            <div class="package-image">
                <img src="${pkg.image || '/public/images/default-package.jpg'}" alt="${pkg.name}" onerror="this.src='/public/images/default-package.jpg'">
                <div class="package-badge">${pkg.duration || 'N/A'}</div>
            </div>
            <div class="package-content">
                <h3>${pkg.name}</h3>
                <p>${pkg.description || 'Experience the best of nature and comfort.'}</p>
                <div class="package-features">
                    ${pkg.features && pkg.features.length > 0 ? pkg.features.slice(0, 3).map(feature => `
                        <span class="feature-tag">${feature}</span>
                    `).join('') : ''}
                </div>
                <div class="package-footer">
                    <div class="package-price">
                        <span class="price-amount">₹${formatPrice(pkg.price)}</span>
                        <span class="price-period">per person</span>
                    </div>
                    <button class="select-package-btn">Select Package</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Re-observe cards for animation
    document.querySelectorAll('.package-card').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
}

// Load Activities from API
async function loadActivities() {
    const activitiesGrid = document.getElementById('activities-grid');
    if (!activitiesGrid) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/activities`);
        const data = await response.json();
        
        if (data.success && data.data.activities && data.data.activities.length > 0) {
            activitiesData = data.data.activities;
            renderActivities(activitiesData);
        } else {
            activitiesGrid.innerHTML = `
                <div class="loading-message" style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.7);">
                    <p>No activities available at the moment.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading activities:', error);
        activitiesGrid.innerHTML = `
            <div class="loading-message" style="text-align: center; padding: 2rem; color: rgba(239, 68, 68, 0.8);">
                <p>Failed to load activities. Please try again later.</p>
            </div>
        `;
    }
}

// Render Activities
function renderActivities(activities) {
    const activitiesGrid = document.getElementById('activities-grid');
    if (!activitiesGrid) return;
    
    activitiesGrid.innerHTML = activities.map(activity => `
        <div class="activity-card" 
             data-activity-id="${activity._id}"
             data-activity-name="${activity.name}"
             data-activity-price="${activity.price}">
            <div class="activity-image">
                <img src="${activity.image || '/public/images/default-activity.jpg'}" alt="${activity.name}" onerror="this.src='/public/images/default-activity.jpg'">
            </div>
            <div class="activity-content">
                <h4>${activity.name}</h4>
                <p>${activity.description || 'Enhance your stay with this activity.'}</p>
                <div class="activity-footer">
                    <span class="activity-price">₹${formatPrice(activity.price)}</span>
                    <div class="activity-checkbox">
                        <input type="checkbox" id="activity-${activity._id}" data-activity-id="${activity._id}">
                        <label for="activity-${activity._id}"></label>
                        <span class="checkbox-label">Select</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Re-observe cards for animation
    document.querySelectorAll('.activity-card').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
}

// Initialize page - Load packages and activities
window.addEventListener('DOMContentLoaded', function() {
    loadPackages();
    loadActivities();
});

console.log('Hawkins Homestay Booking Page - Loaded Successfully!');