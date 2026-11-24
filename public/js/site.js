const API_BASE_URL = '/api';
const siteScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

function escapeHTML(value) {
    const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
}

const navToggle = document.querySelector('.hamburger[aria-controls]');
if (navToggle) {
    const controlledMenu = document.getElementById(navToggle.getAttribute('aria-controls'));
    if (controlledMenu) {
        const setMenuOpen = open => {
            controlledMenu.classList.toggle('active', open);
            navToggle.classList.toggle('active', open);
            navToggle.setAttribute('aria-expanded', String(open));
        };
        navToggle.addEventListener('click', () => setMenuOpen(navToggle.getAttribute('aria-expanded') === 'false'));
        controlledMenu.addEventListener('click', event => {
            if (event.target.closest('a')) setMenuOpen(false);
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
                setMenuOpen(false);
                navToggle.focus();
            }
        });
    }
}
