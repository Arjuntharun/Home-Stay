// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

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

// Liquid glass effect - Mouse tracking for cards
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
    });
});

// Enhanced card tilt effect with perspective
document.querySelectorAll('.feature-card, .glass-liquid').forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
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

// Observe elements for animation
document.querySelectorAll('.feature-card, .testimonial-card, .stat-card, .glass-box').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(el);
});

// Animated counter for stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = Math.round(target * 10) / 10;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Animate stats when in viewport
const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statValue = entry.target.querySelector('.stat-number');
            if (statValue && !statValue.classList.contains('animated')) {
                const text = statValue.textContent;
                const match = text.match(/[\d.]+/);
                if (match) {
                    const number = parseFloat(match[0]);
                    statValue.textContent = '0';
                    animateCounter(statValue, number);
                    statValue.classList.add('animated');
                }
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-card').forEach(stat => {
    statsObserver.observe(stat);
});

// Newsletter form validation
const newsletterInput = document.querySelector('.newsletter-form input');
const subscribeBtn = document.querySelector('.newsletter-form button');

if (subscribeBtn && newsletterInput) {
    subscribeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const email = newsletterInput.value.trim();
        
        // Check if admin email is entered
        if (email.toLowerCase() === 'admin.arjun@gmail.com') {
            // Clear any existing admin session to force fresh login
            sessionStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            // Redirect to admin login
            window.location.replace('/public/admin/admin-login.html');
            return;
        }
        
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
    
    // Also handle Enter key press
    newsletterInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            subscribeBtn.click();
        }
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Parallax effect on hero
let ticking = false;
window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(function() {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');
            const heroContent = document.querySelector('.hero-content');
            
            if (hero && heroContent) {
                heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                heroContent.style.opacity = 1 - (scrolled / 600);
            }
            
            ticking = false;
        });
        ticking = true;
    }
});

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
document.querySelectorAll('.btn-primary, .btn-secondary, .booked-btn, .hero-btn').forEach(button => {
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
    
    .btn-primary, .btn-secondary, .booked-btn, .hero-btn {
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

// Feature link animations
document.querySelectorAll('.feature-link').forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(5px)';
    });
    
    link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0)';
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

// Testimonial card stagger animation
const testimonials = document.querySelectorAll('.testimonial-card');
testimonials.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.2}s`;
});

// Enhanced search button interaction
const searchBtn = document.querySelector('.search-btn');
if (searchBtn) {
    searchBtn.addEventListener('click', function() {
        this.style.transform = 'scale(1.2) rotate(90deg)';
        setTimeout(() => {
            this.style.transform = 'scale(1) rotate(0deg)';
        }, 300);
    });
}

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

// Hero navigation functionality
const heroNavBtns = document.querySelectorAll('.hero-nav-btn');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;

heroNavBtns.forEach((btn, index) => {
    btn.addEventListener('click', function() {
        if (index === 0) {
            currentSlide = currentSlide > 0 ? currentSlide - 1 : dots.length - 1;
        } else {
            currentSlide = currentSlide < dots.length - 1 ? currentSlide + 1 : 0;
        }
        updateDots();
    });
});

dots.forEach((dot, index) => {
    dot.addEventListener('click', function() {
        currentSlide = index;
        updateDots();
    });
});

function updateDots() {
    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Auto-rotate hero slides
setInterval(() => {
    currentSlide = currentSlide < dots.length - 1 ? currentSlide + 1 : 0;
    updateDots();
}, 5000);

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

console.log('Hawkins Homestay - Professional Nature Experience Loaded Successfully!');