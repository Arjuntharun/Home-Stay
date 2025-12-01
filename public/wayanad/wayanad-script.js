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

// Liquid glass effect - Mouse tracking for cards
document.querySelectorAll('.attraction-card, .season-card, .reach-card').forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
    });
});

// Enhanced card tilt effect with perspective
document.querySelectorAll('.attraction-card, .glass-liquid, .season-card, .reach-card').forEach(card => {
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

// Observe elements for animation on scroll
document.querySelectorAll('.attraction-card, .season-card, .reach-card, .glass-box').forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
    observer.observe(el);
});

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
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
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
    
    .btn-primary, .btn-secondary {
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

// Parallax effect on wayanad hero
let ticking = false;
window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(function() {
            const scrolled = window.pageYOffset;
            const wayanadHeroContent = document.querySelector('.wayanad-hero-content');
            
            if (wayanadHeroContent) {
                wayanadHeroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                wayanadHeroContent.style.opacity = 1 - (scrolled / 500);
            }
            
            ticking = false;
        });
        ticking = true;
    }
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

// Attraction badge pulse animation on hover
document.querySelectorAll('.attraction-badge').forEach(badge => {
    const card = badge.closest('.attraction-card');
    
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

// Tips items bounce animation
const tipsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const tipItems = entry.target.querySelectorAll('.tip-item');
            tipItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.animation = 'bounce-in 0.6s ease-out forwards';
                }, index * 100);
            });
        }
    });
}, { threshold: 0.3 });

const tipsSection = document.querySelector('.tips-section');
if (tipsSection) {
    tipsObserver.observe(tipsSection);
}

// Add bounce-in animation
const bounceStyle = document.createElement('style');
bounceStyle.textContent = `
    @keyframes bounce-in {
        0% {
            opacity: 0;
            transform: scale(0.3) translateY(20px);
        }
        50% {
            transform: scale(1.05) translateY(-5px);
        }
        70% {
            transform: scale(0.95) translateY(2px);
        }
        100% {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
    
    .tip-item {
        opacity: 0;
    }
`;
document.head.appendChild(bounceStyle);

// Season cards icon animation
document.querySelectorAll('.season-icon').forEach(icon => {
    const card = icon.closest('.season-card');
    
    card.addEventListener('mouseenter', function() {
        icon.style.transform = 'scale(1.2) rotate(10deg)';
        icon.style.transition = 'transform 0.3s ease';
    });
    
    card.addEventListener('mouseleave', function() {
        icon.style.transform = 'scale(1) rotate(0deg)';
    });
});

// Reach icons animation
document.querySelectorAll('.reach-icon').forEach(icon => {
    const card = icon.closest('.reach-card');
    
    card.addEventListener('mouseenter', function() {
        icon.style.transform = 'translateY(-10px)';
        icon.style.transition = 'transform 0.4s ease';
    });
    
    card.addEventListener('mouseleave', function() {
        icon.style.transform = 'translateY(0)';
    });
});

// Intro section scroll reveal
const introObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const paragraphs = entry.target.querySelectorAll('p');
            paragraphs.forEach((p, index) => {
                setTimeout(() => {
                    p.style.opacity = '1';
                    p.style.transform = 'translateX(0)';
                }, index * 200);
            });
        }
    });
}, { threshold: 0.3 });

const introContainer = document.querySelector('.intro-container');
if (introContainer) {
    const paragraphs = introContainer.querySelectorAll('p');
    paragraphs.forEach(p => {
        p.style.opacity = '0';
        p.style.transform = 'translateX(-20px)';
        p.style.transition = 'all 0.6s ease';
    });
    introObserver.observe(introContainer);
}

// Attractions stagger animation
const attractionsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.attraction-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 150);
            });
        }
    });
}, { threshold: 0.1 });

const attractionsGrid = document.querySelector('.attractions-grid');
if (attractionsGrid) {
    attractionsObserver.observe(attractionsGrid);
}

console.log('Wayanad Discovery Page - Loaded Successfully!');