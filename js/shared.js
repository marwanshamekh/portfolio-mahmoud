'use strict';


const loader      = document.getElementById('loader');
const loaderFill  = loader?.querySelector('.loader-fill');
const loaderPct   = document.getElementById('loaderPct');
const cursorDot   = document.getElementById('cursorDot');
const cursorRing  = document.getElementById('cursorRing');
const navbar      = document.getElementById('navbar');
const navOpen     = document.getElementById('navOpen');
const navClose    = document.getElementById('navClose');
const navOverlay  = document.getElementById('navOverlay');
const navBackdrop = document.getElementById('navBackdrop');

/* Loader */
document.body.style.overflow = 'hidden';

let pct = 0;
const loadInterval = setInterval(() => {
  pct += Math.random() * 18 + 5;
  if (pct > 100) pct = 100;
  if (loaderFill) loaderFill.style.width = pct + '%';
  if (loaderPct)  loaderPct.textContent  = Math.floor(pct) + '%';

  if (pct >= 100) {
    clearInterval(loadInterval);
    setTimeout(() => {
      loader?.classList.add('done');
      document.body.style.overflow = 'auto';
      setTimeout(initReveal, 150);
    }, 400);
  }
}, 80);

/* Custom cursor */
if (cursorDot && cursorRing && !('ontouchstart' in window)) {
  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.transform = 'translate(' + (mouseX - 3) + 'px,' + (mouseY - 3) + 'px)';
  }, { passive: true });

  (function animateCursor() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.transform = 'translate(' + (ringX - 18) + 'px,' + (ringY - 18) + 'px)';
    requestAnimationFrame(animateCursor);
  })();
} else if (cursorDot && cursorRing) {
  /* Touch device: hide cursor elements */
  cursorDot.style.display    = 'none';
  cursorRing.style.display   = 'none';
  document.body.style.cursor = 'auto';
}

/* Nav overlay */
if (navOverlay && !navOverlay.classList.contains('open')) {
  navOverlay.setAttribute('aria-hidden', 'true');
  navOverlay.setAttribute('inert', '');
  navOpen?.setAttribute('aria-expanded', 'false');
}

function openNav() {
  if (!navOverlay) return;
  navOverlay.removeAttribute('inert');
  navOverlay.setAttribute('aria-hidden', 'false');
  navOverlay.classList.add('open');
  navOpen?.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  document.body.classList.add('menu-open');

  // Focus close button inside overlay for accessibility
  navClose?.focus();
}

function closeNav() {
  if (!navOverlay) return;

  // Move focus back to trigger button before marking overlay as hidden or inert
  if (navOverlay.contains(document.activeElement)) {
    if (navOpen) {
      navOpen.focus();
    } else if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
  }

  navOverlay.classList.remove('open');
  navOverlay.setAttribute('aria-hidden', 'true');
  navOverlay.setAttribute('inert', '');
  navOpen?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  document.body.classList.remove('menu-open');
}

navOpen    ?.addEventListener('click', openNav);
navClose   ?.addEventListener('click', closeNav);
navBackdrop?.addEventListener('click', closeNav);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navOverlay?.classList.contains('open')) closeNav();
});

document.querySelectorAll('.nav-panel a').forEach(l => l.addEventListener('click', closeNav));

/* Navbar scroll behavior */
(function () {
  if (!navbar) return;
  let ticking = false;

  function updateNavbar() {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled',  y > 80);
    navbar.classList.toggle('floating',  y > 120);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });
})();

/* Scroll reveal */
function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible', 'is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });

  elements.forEach(el => observer.observe(el));
}

if (!loader || loader.classList.contains('done')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }
}