// API Base URL
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

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        }
    });
});

// Load Activities from API
async function loadActivities() {
    const activitiesGrid = document.getElementById('activities-grid');
    if (!activitiesGrid) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/activities`);
        const data = await response.json();
        
        if (data.success && data.data.activities && data.data.activities.length > 0) {
            renderActivities(data.data.activities);
        } else {
            activitiesGrid.innerHTML = `
                <div class="loading-message" style="text-align: center; padding: 3rem; color: rgba(255, 255, 255, 0.7);">
                    <p>No activities available at the moment. Please check back later.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading activities:', error);
        activitiesGrid.innerHTML = `
            <div class="loading-message" style="text-align: center; padding: 3rem; color: rgba(239, 68, 68, 0.8);">
                <p>Failed to load activities. Please try again later.</p>
            </div>
        `;
    }
}

// Format price with commas
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Get activity icon SVG path based on activity name
function getActivityIconSVG(activityName) {
    const nameLower = activityName.toLowerCase();
    
    // Return appropriate SVG path based on activity name
    if (nameLower.includes('trek') || nameLower.includes('hike')) {
        return '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>';
    } else if (nameLower.includes('safari') || nameLower.includes('wildlife')) {
        return '<circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path>';
    } else if (nameLower.includes('camp')) {
        return '<path d="M3 21h18l-9-18-9 18z"></path><path d="M12 9v12"></path>';
    } else {
        // Default icon (circle with dot)
        return '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle>';
    }
}

// Render Activities
function renderActivities(activities) {
    const activitiesGrid = document.getElementById('activities-grid');
    if (!activitiesGrid) return;
    
    activitiesGrid.innerHTML = activities.map(activity => {
        // Format features
        const featuresHtml = activity.features && activity.features.length > 0 
            ? activity.features.map(feature => `
                <span>${feature}</span>
            `).join('')
            : '';
        
        return `
            <div class="activity-card" 
                 data-activity-id="${activity._id}"
                 data-activity-name="${activity.name}"
                 data-activity-price="${activity.price}">
                <div class="activity-image">
                    <img src="${activity.image || '/public/images/default-activity.jpg'}" alt="${activity.name}" onerror="this.src='/public/images/default-activity.jpg'">
                    <div class="activity-badge">${activity.duration || 'Available'}</div>
                </div>
                <div class="activity-content">
                    <div class="activity-header">
                        <svg class="activity-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${getActivityIconSVG(activity.name)}
                        </svg>
                        <div>
                            <h3>${activity.name}</h3>
                            <div class="activity-duration">${activity.duration || 'Custom Duration'}</div>
                        </div>
                    </div>
                    <p class="activity-description">${activity.description || 'Experience an amazing adventure at Hawkins Homestay.'}</p>
                    <div class="activity-price-display">
                        ₹${formatPrice(activity.price)} <span>per person</span>
                    </div>
                    ${featuresHtml ? `
                    <div class="activity-features">
                        ${featuresHtml}
                    </div>
                    ` : ''}
                    <button class="activity-btn" onclick="redirectToBooking('${activity._id}')">BOOK NOW</button>
                </div>
            </div>
        `;
    }).join('');
    
    // Initialize animations and effects for dynamically loaded cards
    initializeActivityCards();
    
    // Observe cards for animation
    observeActivityCards();
}

// Redirect to booking page
function redirectToBooking(activityId) {
    sessionStorage.setItem('selectedActivityId', activityId);
    window.location.href = '/public/book/book.html';
}

// Initialize activity cards with animations and event listeners
function initializeActivityCards() {
    // Enhanced card tilt effect
    document.querySelectorAll('.activity-card').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
    
    // Activity button click handlers
    document.querySelectorAll('.activity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.activity-card');
            const activityId = card.getAttribute('data-activity-id');
            redirectToBooking(activityId);
        });
    });
}

// Enhanced card tilt effect for static elements (safety cards, glass boxes, etc.)
document.querySelectorAll('.glass-liquid, .glass-box, .glass-effect').forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
    
    card.addEventListener('mouseleave', function() {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// Intersection Observer for fade-in animations
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

// Observe static elements for animation (safety cards, glass boxes)
document.querySelectorAll('.safety-card, .glass-box').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(el);
});

// Observe activity cards after they're loaded
function observeActivityCards() {
    document.querySelectorAll('.activity-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
        observer.observe(card);
    });
}

// Newsletter form validation
const newsletterInput = document.querySelector('.newsletter-form input');
const subscribeBtn = document.querySelector('.newsletter-form button');

if (subscribeBtn && newsletterInput) {
    subscribeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const email = newsletterInput.value;
        
        if (validateEmail(email)) {
            subscribeBtn.textContent = 'Subscribed!';
            subscribeBtn.style.background = 'rgba(74, 222, 128, 0.3)';
            newsletterInput.value = '';
            
            showNotification('Successfully subscribed to newsletter!', 'success');
            
            setTimeout(() => {
                subscribeBtn.textContent = 'Subscribe';
                subscribeBtn.style.background = '';
            }, 3000);
        } else {
            newsletterInput.style.borderColor = '#ef4444';
            showNotification('Please enter a valid email address', 'error');
            setTimeout(() => {
                newsletterInput.style.borderColor = '';
            }, 2000);
        }
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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

// Glass morphism glow effect
document.querySelectorAll('.glass-effect, .glass-liquid, .glass-box').forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 15px 50px rgba(74, 222, 128, 0.2)';
    });
    
    element.addEventListener('mouseleave', function() {
        this.style.boxShadow = '';
    });
});

// Button ripple effect
document.querySelectorAll('.btn-primary, .btn-secondary, .activity-btn').forEach(button => {
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
const style = document.createElement('style');
style.textContent = `
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
    
    .btn-primary, .btn-secondary, .activity-btn {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(style);

// Smooth page load animation
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.6s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Parallax effect on hero
let ticking = false;
window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(function() {
            const scrolled = window.pageYOffset;
            const activitiesHero = document.querySelector('.activities-hero');
            
            if (activitiesHero) {
                const heroContent = document.querySelector('.activities-hero-content');
                if (heroContent) {
                    heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                    heroContent.style.opacity = 1 - (scrolled / 400);
                }
            }
            
            ticking = false;
        });
        ticking = true;
    }
});

// Activity icon hover animations
document.querySelectorAll('.activity-icon').forEach(icon => {
    icon.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.2) rotate(10deg)';
        this.style.transition = 'transform 0.3s ease';
    });
    
    icon.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotate(0deg)';
    });
});

// Safety icon animations
document.querySelectorAll('.safety-icon').forEach(icon => {
    icon.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.15) rotate(-5deg)';
        this.style.transition = 'transform 0.3s ease';
    });
    
    icon.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotate(0deg)';
    });
});

// Liquid effect on glass elements
document.querySelectorAll('.glass-liquid, .glass-effect, .glass-box').forEach(element => {
    let animationId;
        
    element.addEventListener('mouseenter', function() {
        let hue = 120;
        animationId = setInterval(() => {
            hue = (hue + 1) % 360;
            this.style.borderColor = `hsla(${hue}, 70%, 60%, 0.3)`;
        }, 50);
    });
    
    element.addEventListener('mouseleave', function() {
        clearInterval(animationId);
        this.style.borderColor = '';
    });
});

// CTA section entrance animation
const ctaObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const glassBox = entry.target.querySelector('.cta-glass-box');
            if (glassBox) {
                glassBox.style.animation = 'float-in 1s ease-out forwards';
            }
        }
    });
}, { threshold: 0.3 });

const ctaSection = document.querySelector('.cta-section');
if (ctaSection) {
    ctaObserver.observe(ctaSection);
}

// Add float-in animation
const floatStyle = document.createElement('style');
floatStyle.textContent = `
    @keyframes float-in {
        from {
            transform: translateY(50px) scale(0.9);
            opacity: 0;
        }
        to {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
    }
`;
document.head.appendChild(floatStyle);

// Badge pulse animation
const badges = document.querySelectorAll('.activity-badge');
badges.forEach(badge => {
    badge.style.animation = 'badge-pulse 2s ease-in-out infinite';
});

const badgeStyle = document.createElement('style');
badgeStyle.textContent = `
    @keyframes badge-pulse {
        0%, 100% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.05);
            opacity: 0.9;
        }
    }
`;
document.head.appendChild(badgeStyle);

// Intro section scroll reveal
const introObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slide-up 1s ease-out forwards';
        }
    });
}, { threshold: 0.2 });

const introContainer = document.querySelector('.intro-container');
if (introContainer) {
    introObserver.observe(introContainer);
}

const slideUpStyle = document.createElement('style');
slideUpStyle.textContent = `
    @keyframes slide-up {
        from {
            transform: translateY(50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(slideUpStyle);

// Safety cards entrance animation with stagger
const safetyCards = document.querySelectorAll('.safety-card');
safetyCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.15}s`;
});

// Activity features fade-in
document.querySelectorAll('.activity-features span').forEach((feature, index) => {
    feature.style.opacity = '0';
    feature.style.transform = 'translateX(-20px)';
    feature.style.transition = `all 0.5s ease ${index * 0.1}s`;
    
    const featureObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, { threshold: 0.5 });
    
    featureObserver.observe(feature);
});

// Image lazy load effect
document.querySelectorAll('.activity-image img').forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.6s ease';
    
    img.addEventListener('load', function() {
        this.style.opacity = '1';
    });
});

// Scroll progress indicator
const createScrollIndicator = () => {
    const indicator = document.createElement('div');
    indicator.style.cssText = `
        position: fixed;
        top: 70px;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #4ade80, #22c55e);
        width: 0%;
        z-index: 999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(indicator);
    
    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        indicator.style.width = scrolled + '%';
    });
};

createScrollIndicator();

// Initialize page - Load activities on page load
window.addEventListener('DOMContentLoaded', function() {
    loadActivities();
});

console.log('Hawkins Homestay - Activities Page Loaded Successfully!');