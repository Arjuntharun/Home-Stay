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

// Enhanced card tilt effect with perspective
document.querySelectorAll('.glass-liquid, .glass-box').forEach(card => {
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
document.querySelectorAll('.value-card, .team-card, .glass-box, .glass-liquid').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(el);
});

// Animated counter for statistics
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const isDecimal = target % 1 !== 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            if (isDecimal) {
                element.textContent = target.toFixed(1);
            } else {
                element.textContent = Math.round(target);
            }
            clearInterval(timer);
        } else {
            if (isDecimal) {
                element.textContent = start.toFixed(1);
            } else {
                element.textContent = Math.floor(start);
            }
        }
    }, 16);
}

// Animate statistics when in viewport
const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statValue = entry.target.querySelector('.stat-number');
            if (statValue && !statValue.classList.contains('animated')) {
                const target = parseFloat(statValue.getAttribute('data-target'));
                statValue.textContent = '0';
                animateCounter(statValue, target);
                statValue.classList.add('animated');
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item').forEach(stat => {
    statsObserver.observe(stat);
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
document.querySelectorAll('.glass-effect, .glass-liquid, .glass-box').forEach(element => {
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

// Parallax effect on hero
let ticking = false;
window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(function() {
            const scrolled = window.pageYOffset;
            const aboutHero = document.querySelector('.about-hero');
            
            if (aboutHero) {
                const heroContent = document.querySelector('.about-hero-content');
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

// Awards section entrance animation
const awardsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const awardItems = entry.target.querySelectorAll('.award-item');
            awardItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 150);
            });
        }
    });
}, { threshold: 0.3 });

const awardsGrid = document.querySelector('.awards-grid');
if (awardsGrid) {
    document.querySelectorAll('.award-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'all 0.6s ease';
    });
    awardsObserver.observe(awardsGrid);
}

// Team card stagger animation
const teamCards = document.querySelectorAll('.team-card');
teamCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.15}s`;
});

// Value cards hover effect
document.querySelectorAll('.value-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        const icon = this.querySelector('.value-icon svg');
        if (icon) {
            icon.style.transform = 'scale(1.2) rotate(10deg)';
            icon.style.transition = 'transform 0.3s ease';
        }
    });
    
    card.addEventListener('mouseleave', function() {
        const icon = this.querySelector('.value-icon svg');
        if (icon) {
            icon.style.transform = 'scale(1) rotate(0deg)';
        }
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

// Active nav link based on scroll position (for single-page sections)
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
        if (link.getAttribute('href') === `#${current}` || 
            (current === '' && link.getAttribute('href') === 'about.html')) {
            link.classList.add('active');
        }
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

// Journey section scroll animation
const journeyObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const content = entry.target.querySelector('.journey-content');
            const image = entry.target.querySelector('.journey-image');
            
            if (content) {
                content.style.animation = 'slide-in-left 1s ease-out forwards';
            }
            if (image) {
                image.style.animation = 'slide-in-right 1s ease-out forwards';
            }
        }
    });
}, { threshold: 0.2 });

const journeySection = document.querySelector('.journey-section');
if (journeySection) {
    journeyObserver.observe(journeySection);
}

// Add slide animations
const slideStyle = document.createElement('style');
slideStyle.textContent = `
    @keyframes slide-in-left {
        from {
            transform: translateX(-50px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slide-in-right {
        from {
            transform: translateX(50px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(slideStyle);

console.log('Hawkins Homestay - About Page Loaded Successfully!');