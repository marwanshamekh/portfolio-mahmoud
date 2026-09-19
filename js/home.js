'use strict';

/* GSAP — INTRO / HERO SECTION ANIMATIONS */
(function initIntroSection() {
  if (typeof gsap === 'undefined') return;

  const introSec = document.querySelector('.intro-section');
  if (!introSec) return;

  const topLabel = introSec.querySelector('.intro-top-label');
  const titleLines = introSec.querySelectorAll('.intro-title-line');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let entranceCompleted = false;
  let entranceTl = null;

  function ensureVisible() {
    if (topLabel) {
      topLabel.style.opacity = '1';
      topLabel.style.transform = 'none';
    }
    titleLines.forEach(function(line) {
      line.style.opacity = '1';
      line.style.transform = 'none';
    });
    if (window.scrollY <= 10) {
      introSec.style.opacity = '1';
      introSec.style.transform = 'none';
    }
  }

  function runEntrance() {
    if (entranceCompleted) return;

    if (prefersReducedMotion) {
      ensureVisible();
      entranceCompleted = true;
      return;
    }

    entranceTl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        entranceCompleted = true;
      }
    });

    if (topLabel) {
      entranceTl.fromTo(topLabel,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9 },
        0
      );
    }

    if (titleLines.length) {
      entranceTl.fromTo(titleLines,
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out'
        },
        topLabel ? 0.2 : 0
      );
    }
  }

  // Trigger entrance when loader completes or immediately if loader is already done/absent
  const loaderEl = document.getElementById('loader');
  if (loaderEl && !loaderEl.classList.contains('done')) {
    const observer = new MutationObserver(() => {
      if (loaderEl.classList.contains('done')) {
        observer.disconnect();
        setTimeout(runEntrance, 100);
      }
    });
    observer.observe(loaderEl, { attributes: true, attributeFilter: ['class'] });

    // Safety fallback: if loader completes in background tab or observer timing was missed
    setTimeout(() => {
      if (!entranceCompleted && (!loaderEl || loaderEl.classList.contains('done') || loaderEl.style.display === 'none')) {
        runEntrance();
      }
    }, 2500);
  } else {
    runEntrance();
  }

  // GSAP ScrollTrigger for Scroll Micro-Interactions
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    let heroTrigger = null;

    if (!prefersReducedMotion) {
      const mm = gsap.matchMedia ? gsap.matchMedia() : null;

      if (mm) {
        mm.add('(min-width: 769px)', () => {
          heroTrigger = gsap.fromTo(introSec,
            { y: 0, scale: 1, opacity: 1 },
            {
              y: -120,
              scale: 0.93,
              opacity: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: introSec,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true,
                fastScrollEnd: true,
                onUpdate: (self) => {
                  if (self.progress <= 0.001 || window.scrollY <= 10) {
                    gsap.set(introSec, { opacity: 1, y: 0, scale: 1 });
                  }
                },
                onLeaveBack: () => {
                  gsap.set(introSec, { opacity: 1, y: 0, scale: 1 });
                }
              }
            }
          );

          return () => {
            if (heroTrigger) heroTrigger.kill();
          };
        });
      } else {
        heroTrigger = gsap.fromTo(introSec,
          { y: 0, scale: 1, opacity: 1 },
          {
            y: -120,
            scale: 0.93,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: introSec,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (self.progress <= 0.001 || window.scrollY <= 10) {
                  gsap.set(introSec, { opacity: 1, y: 0, scale: 1 });
                }
              },
              onLeaveBack: () => {
                gsap.set(introSec, { opacity: 1, y: 0, scale: 1 });
              }
            }
          }
        );
      }
    }

    // Direct scroll recovery check for fast scroll up
    window.addEventListener('scroll', () => {
      if (window.scrollY <= 10) {
        if (introSec.style.opacity !== '1' || introSec.style.visibility === 'hidden') {
          gsap.set(introSec, { opacity: 1, y: 0, scale: 1 });
        }
        if (entranceCompleted) {
          titleLines.forEach(line => {
            if (line.style.opacity !== '1') line.style.opacity = '1';
          });
          if (topLabel && topLabel.style.opacity !== '1') topLabel.style.opacity = '1';
        }
      }
    }, { passive: true });

    // Handle tab switching & visibility changes
    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        ScrollTrigger.refresh();
        if (loaderEl && loaderEl.classList.contains('done')) {
          if (!entranceCompleted) {
            runEntrance();
          } else {
            ensureVisible();
          }
        }
        if (window.scrollY <= 50) {
          gsap.set(introSec, { opacity: 1, y: 0, scale: 1 });
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pageshow', handleVisibility);
    window.addEventListener('focus', handleVisibility);
  }
})();

/* ACTIVE NAV LINK (highlight on scroll) */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link[data-section]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === entry.target.id) link.classList.add('active');
      });
    }
  });
}, { rootMargin: '-50% 0px -50% 0px' });

sections.forEach(sec => sectionObserver.observe(sec));


/* Projects hover image preview */
(function initProjectsPreview() {
  const projectsSection = document.getElementById('projects');
  if (!projectsSection) return;

  const preview = document.getElementById('projectsHoverPreview');
  const previewImg = document.getElementById('projectsPreviewImg');
  const rows = projectsSection.querySelectorAll('.project-row');
  const list = document.getElementById('projectsList');
  if (!preview || !previewImg || !rows.length) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let isHovering = false;
  let rafId = null;

  function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768;
  }

  function updatePosition() {
    if (!isHovering) return;

    currentX += (targetX - currentX) * 0.15;
    currentY += (targetY - currentY) * 0.15;

    preview.style.transform = 'translate3d(' + currentX + 'px, ' + currentY + 'px, 0)';
    rafId = requestAnimationFrame(updatePosition);
  }

  function setCoordinates(e) {
    const previewWidth = 360;
    const previewHeight = 230;

    let x = e.clientX + 25;
    let y = e.clientY - (previewHeight / 2);

    if (x + previewWidth > window.innerWidth - 20) {
      x = e.clientX - previewWidth - 25;
    }
    if (y < 20) {
      y = 20;
    } else if (y + previewHeight > window.innerHeight - 20) {
      y = window.innerHeight - previewHeight - 20;
    }

    targetX = x;
    targetY = y;
  }

  rows.forEach(row => {
    row.addEventListener('mouseenter', (e) => {
      if (isTouchDevice()) return;

      const imgSrc = row.getAttribute('data-image');
      const imgAlt = row.getAttribute('data-alt') || 'Project preview';

      if (imgSrc && previewImg.getAttribute('src') !== imgSrc) {
        previewImg.setAttribute('src', imgSrc);
        previewImg.setAttribute('alt', imgAlt);
      }

      setCoordinates(e);
      if (!isHovering) {
        currentX = targetX;
        currentY = targetY;
        preview.style.transform = 'translate3d(' + currentX + 'px, ' + currentY + 'px, 0)';
        isHovering = true;
        rafId = requestAnimationFrame(updatePosition);
      }

      preview.classList.add('is-active');
      if (list) list.classList.add('has-hovered-item');
      row.classList.add('is-hovered');
    });

    row.addEventListener('mousemove', (e) => {
      if (isTouchDevice()) return;
      setCoordinates(e);
    }, { passive: true });

    row.addEventListener('mouseleave', () => {
      row.classList.remove('is-hovered');
    });
  });

  if (list) {
    list.addEventListener('mouseleave', () => {
      isHovering = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      preview.classList.remove('is-active');
      list.classList.remove('has-hovered-item');
      rows.forEach(r => r.classList.remove('is-hovered'));
    });
  }
})();

/*  CERTIFICATES SLIDER — clone cards */
(function initCertSlider() {
  const track = document.querySelector('.slider-track');
  if (!track) return;
  Array.from(track.children).forEach(card => track.appendChild(card.cloneNode(true)));
})();


/* Copy email */
(function initCopyEmail() {
  const copyBtn = document.getElementById('ctCopyBtn');
  const tooltip = document.getElementById('ctTooltip');
  const EMAIL   = 'mmhmdshamekh@gmail.com';
  let resetTimer = null;

  if (!copyBtn || !tooltip) return;

  function showCopied() {
    copyBtn.classList.add('copied');
    tooltip.classList.add('show');
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copyBtn.classList.remove('copied');
      tooltip.classList.remove('show');
    }, 2200);
  }

  copyBtn.addEventListener('click', () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(showCopied).catch(fallback);
    } else {
      fallback();
    }
  });

  function fallback() {
    const ta = document.createElement('textarea');
    ta.value = EMAIL;
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    document.body.removeChild(ta);
    showCopied();
  }
})();


/* Submit form to Google Sheet */
(function initGoogleSheetForm() {
  const scriptURL = 'https://script.google.com/macros/s/AKfycbxzIMqt_NngHQtVlozCeI3tXsd4rkeZngIDeuS0JrxhSksJhrDkG0IG7k7UQczWTVo4Bw/exec';
  const form = document.forms['submit-to-google-sheet'] || document.getElementById('contactForm');
  const submitBtn = document.getElementById('ctSubmitBtn');
  const msg = document.getElementById('msg') || document.getElementById('ctFormStatus');
  const nameInput = document.getElementById('ctName');
  const emailInput = document.getElementById('ctEmail');
  const messageInput = document.getElementById('ctMessage');

  if (!form || !submitBtn) return;

  [nameInput, emailInput, messageInput].forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => {
      input.classList.remove('invalid');
      if (msg && msg.classList.contains('error')) {
        msg.textContent = '';
        msg.className = 'ct-form-status';
        msg.style.color = '';
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';

    let hasError = false;

    if (!name) {
      if (nameInput) nameInput.classList.add('invalid');
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      if (emailInput) emailInput.classList.add('invalid');
      hasError = true;
    }

    if (!message) {
      if (messageInput) messageInput.classList.add('invalid');
      hasError = true;
    }

    if (hasError) {
      if (msg) {
        msg.textContent = 'Please fill in all fields with a valid email.';
        msg.className = 'ct-form-status error';
        msg.style.color = '#ff4d1c';
      }
      return;
    }

    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';

    if (msg) {
      msg.textContent = 'Sending message...';
      msg.className = 'ct-form-status';
      msg.style.color = 'var(--text-dim)';
    }

    const formData = new FormData(form);
    formData.set('name', name);
    formData.set('Name', name);
    formData.set('email', email);
    formData.set('Email', email);
    formData.set('message', message);
    formData.set('Message', message);
    formData.set('date', new Date().toLocaleString());
    formData.set('Date', new Date().toLocaleString());

    fetch(scriptURL, {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    })
      .then(() => {
        if (msg) {
          msg.textContent = 'Message sent successfully!';
          msg.className = 'ct-form-status success';
          msg.style.color = '#25d366';
        }
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Sent!';
        submitBtn.style.background = '#25d366';
        submitBtn.style.color = '#ffffff';
        form.reset();

        setTimeout(() => {
          if (msg) {
            msg.textContent = '';
            msg.className = 'ct-form-status';
            msg.style.color = '';
          }
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnContent;
          submitBtn.style.background = '';
          submitBtn.style.color = '';
        }, 5000);
      })
      .catch(error => {
        if (msg) {
          msg.textContent = 'An error occurred. Please try again.';
          msg.className = 'ct-form-status error';
          msg.style.color = '#ff4d1c';
        }
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
        console.error('Error!', error.message);
      });
  });
})();


/* EXPERIENCE SECTION — Sticky card accordion */
(function () {
  'use strict';

  var SCROLL_PER_CARD = 800;   // px of scroll each card "owns" while active
  var END_BUFFER_RATIO = 0.4;  // extra scroll room after the last card (× viewport height)

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    var section = document.getElementById('experience');
    var stack   = document.getElementById('xpStack');
    if (!section || !stack) return;

    var cards    = Array.from(stack.querySelectorAll('.xp-card'));
    var numCards = cards.length;
    if (!numCards) return;

    cards.forEach(function (card) {
      var body = card.querySelector('.xp-card-body');
      if (!body) return;
      if (card.querySelector('.xp-card-body-outer')) return; // already wrapped

      var outer = document.createElement('div');
      outer.className = 'xp-card-body-outer';

      var inner = document.createElement('div');
      inner.className = 'xp-card-body-inner';

      body.parentNode.insertBefore(outer, body);
      outer.appendChild(inner);
      inner.appendChild(body);
    });

    cards.forEach(function (card) {
      if (card.parentNode && card.parentNode.classList.contains('xp-card-slot')) return; // already wrapped

      var slot = document.createElement('div');
      slot.className = 'xp-card-slot';
      slot.style.position = 'relative';

      card.parentNode.insertBefore(slot, card);
      slot.appendChild(card);
    });

    var slots = cards.map(function (card) { return card.parentNode; });

    function getStripHeight() {
      var strip = cards[0].querySelector('.xp-card-header');
      return (strip && strip.offsetHeight) || 90; // 90 = safe fallback
    }

    function layout() {
      var stripHeight = getStripHeight();
      var endBuffer    = window.innerHeight * END_BUFFER_RATIO;

      cards.forEach(function (card, i) {
        card.style.top    = (i * stripHeight) + 'px';
        card.style.zIndex = String(10 + i);

        var isLast = i === numCards - 1;
        slots[i].style.height = (SCROLL_PER_CARD + (isLast ? endBuffer : 0)) + 'px';
      });
    }

    layout();
    window.addEventListener('resize', layout, { passive: true });

    var activeIndex = -1;

    function setActive(index) {
      index = Math.max(0, Math.min(index, numCards - 1));
      if (index === activeIndex) return;
      activeIndex = index;

      cards.forEach(function (card, i) {
        card.classList.remove('xp-card--expanded', 'xp-card--collapsed');
        card.classList.add(i === index ? 'xp-card--expanded' : 'xp-card--collapsed');
      });
    }

    var ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    function update() {
      ticking = false;

      var sectionTop = section.getBoundingClientRect().top;
      var scrolledIn = -sectionTop;   /* negative = not reached yet */

      if (scrolledIn <= 0) {
        setActive(0);
        return;
      }

      var stripHeight = getStripHeight();
      var newIndex = 0;

      for (var i = 0; i < numCards; i++) {
        var slotTop = slots[i].getBoundingClientRect().top;
        if (slotTop <= (i * stripHeight) + 1) {
          newIndex = i;
        }
      }

      setActive(newIndex);
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    update();
  }

})();