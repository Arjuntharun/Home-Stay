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

// Redirect to booking page with package ID
function redirectToBooking(packageId) {
    // Store package ID in sessionStorage for the booking page to use
    sessionStorage.setItem('selectedPackageId', packageId);
    
    // Redirect to booking page
    window.location.href = '/public/book/book.html';
}

// Load Packages from API
async function loadPackages() {
    const packagesGrid = document.getElementById('packages-grid');
    if (!packagesGrid) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/packages`);
        const data = await response.json();
        
        if (data.success && data.data.packages && data.data.packages.length > 0) {
            renderPackages(data.data.packages);
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

// Format price with commas
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Render Packages
function renderPackages(packages) {
    const packagesGrid = document.getElementById('packages-grid');
    if (!packagesGrid) return;
    
    packagesGrid.innerHTML = packages.map(pkg => {
        // Format features
        const featuresHtml = pkg.features && pkg.features.length > 0 
            ? pkg.features.map(feature => `
                <div class="feature-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>${feature}</span>
                </div>
            `).join('')
            : '';
        
        return `
            <div class="package-card glass-liquid" 
                 data-package-id="${pkg._id}"
                 data-package-name="${pkg.name}"
                 data-package-price="${pkg.price}">
                <div class="package-image">
                    <img src="${pkg.image || '/public/images/default-package.jpg'}" alt="${pkg.name}" onerror="this.src='/public/images/default-package.jpg'">
                    <div class="package-badge">${pkg.duration || 'N/A'}</div>
                </div>
                <div class="package-content">
                    <h3>${pkg.name}</h3>
                    <div class="package-duration">${pkg.duration || 'Custom Duration'}</div>
                    <p class="package-description">${pkg.description || 'Experience the best of nature and comfort at Hawkins Homestay.'}</p>
                    <div class="package-features">
                        ${featuresHtml}
                    </div>
                    <div class="package-footer">
                        <div class="package-price">
                            <span class="currency">₹</span>
                            <span class="amount">${formatPrice(pkg.price)}</span>
                            <span class="period">per person</span>
                        </div>
                        <button class="book-btn" onclick="redirectToBooking('${pkg._id}')">BOOK NOW</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Initialize animations and effects for dynamically loaded cards
    initializePackageCards();
    
    // Observe cards for animation
    observePackageCards();
}

// Initialize package cards with animations and event listeners
function initializePackageCards() {
    // Liquid glass effect - Mouse tracking for cards
    document.querySelectorAll('.package-card').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });

    // Enhanced card tilt effect with perspective
    document.querySelectorAll('.package-card, .glass-liquid').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

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

// Observe package cards for animation on scroll (after loading)
function observePackageCards() {
    document.querySelectorAll('.package-card').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
        observer.observe(el);
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
            
            setTimeout(() => {
                subscribeBtn.textContent = 'Subscribe';
                subscribeBtn.style.background = '';
            }, 3000);
        } else {
            newsletterInput.style.borderColor = '#ef4444';
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

// Glass morphism glow effect
document.querySelectorAll('.glass-liquid, .glass-box').forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 15px 50px rgba(74, 222, 128, 0.2)';
    });
    
    element.addEventListener('mouseleave', function() {
        this.style.boxShadow = '';
    });
});

// Button ripple effect
document.querySelectorAll('.book-btn, .contact-btn').forEach(button => {
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
    
    .book-btn, .contact-btn {
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

// Parallax effect on packages hero
let ticking = false;
window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(function() {
            const scrolled = window.pageYOffset;
            const packagesHeroContent = document.querySelector('.packages-hero-content');
            
            if (packagesHeroContent) {
                packagesHeroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                packagesHeroContent.style.opacity = 1 - (scrolled / 400);
            }
            
            ticking = false;
        });
        ticking = true;
    }
});

// Custom Package Box entrance animation
const customPackageObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const box = entry.target.querySelector('.custom-package-box');
            if (box) {
                box.style.animation = 'float-in 1s ease-out forwards';
            }
        }
    });
}, { threshold: 0.3 });

const customPackageSection = document.querySelector('.custom-package-section');
if (customPackageSection) {
    customPackageObserver.observe(customPackageSection);
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

// Liquid effect on glass elements
document.querySelectorAll('.glass-liquid, .glass-box').forEach(element => {
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

// Badge pulse animation on hover
document.querySelectorAll('.package-badge').forEach(badge => {
    const card = badge.closest('.package-card');
    
    card.addEventListener('mouseenter', function() {
        badge.style.animation = 'pulse 1s ease-in-out infinite';
    });
    
    card.addEventListener('mouseleave', function() {
        badge.style.animation = 'none';
    });
});

// Add pulse animation
const pulseStyle = document.createElement('style');
pulseStyle.textContent = `
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
`;
document.head.appendChild(pulseStyle);

// Price animation when card comes into view
const priceObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const priceAmount = entry.target.querySelector('.amount');
            if (priceAmount && !priceAmount.classList.contains('animated')) {
                const finalPrice = priceAmount.textContent;
                const numericPrice = parseInt(finalPrice.replace(/,/g, ''));
                
                let currentPrice = 0;
                const increment = numericPrice / 50;
                
                const timer = setInterval(() => {
                    currentPrice += increment;
                    if (currentPrice >= numericPrice) {
                        priceAmount.textContent = finalPrice;
                        clearInterval(timer);
                    } else {
                        priceAmount.textContent = Math.floor(currentPrice).toLocaleString('en-IN');
                    }
                }, 20);
                
                priceAmount.classList.add('animated');
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.package-card').forEach(card => {
    priceObserver.observe(card);
});

// Feature items slide-in animation
document.querySelectorAll('.package-card').forEach(card => {
    const featureItems = card.querySelectorAll('.feature-item');
    
    card.addEventListener('mouseenter', function() {
        featureItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.transform = 'translateX(5px)';
                item.style.transition = 'transform 0.3s ease';
            }, index * 50);
        });
    });
    
    card.addEventListener('mouseleave', function() {
        featureItems.forEach(item => {
            item.style.transform = 'translateX(0)';
        });
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize page - Load packages on page load
window.addEventListener('DOMContentLoaded', function() {
    loadPackages();
});

console.log('Hawkins Homestay Packages - Loaded Successfully!');