/**
 * 梁曦 · AI 产品经理作品集 — 交互脚本
 */

(function () {
  'use strict';

  const nav = document.querySelector('.nav');
  const panels = document.querySelectorAll('.page-panel');
  const navTriggers = document.querySelectorAll('[data-nav]');
  const validPanels = ['hero', 'experience', 'midcircle', 'contact'];

  /* ---- Page panel switching ---- */
  function switchPanel(panelId, updateHash = true) {
    if (!validPanels.includes(panelId)) panelId = 'hero';

    panels.forEach((panel) => {
      panel.classList.toggle('active', panel.id === panelId);
    });

    navTriggers.forEach((trigger) => {
      trigger.classList.toggle('active', trigger.dataset.nav === panelId);
    });

    if (updateHash) {
      history.replaceState(null, '', '#' + panelId);
    }

    window.scrollTo(0, 0);
    nav?.classList.remove('scrolled');
    revealPanelContent(panelId);
  }

  function revealPanelContent(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    panel.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => {
      el.classList.add('visible');
    });
  }

  function getPanelFromHash() {
    const hash = window.location.hash.replace('#', '');
    return validPanels.includes(hash) ? hash : 'hero';
  }

  if (panels.length) {
    navTriggers.forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        switchPanel(trigger.dataset.nav);
        document.querySelector('.nav__links')?.classList.remove('open');
      });
    });

    window.addEventListener('hashchange', () => {
      switchPanel(getPanelFromHash(), false);
    });

    switchPanel(getPanelFromHash(), false);
  }

  /* ---- Nav shadow on inner scroll ---- */
  function onScroll() {
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile burger menu ---- */
  const burger = document.querySelector('.nav__burger');
  const navLinksEl = document.querySelector('.nav__links');
  burger?.addEventListener('click', () => {
    navLinksEl?.classList.toggle('open');
  });

  /* ---- Intersection Observer: reveal animations (detail pages) ---- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!panels.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---- Counter animation for metrics ---- */
  function animateCounter(el) {
    const target = el.dataset.count;
    if (!target) return;

    const isPercent = target.includes('%');
    const isTime = target.includes('分钟');
    const isMultiplier = target.includes('倍');

    let endVal = parseFloat(target);
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = endVal * eased;

      if (isPercent) {
        el.textContent = Math.round(current) + '%';
      } else if (isTime) {
        el.textContent = Math.ceil(current) + ' 分钟';
      } else if (isMultiplier) {
        el.textContent = current.toFixed(1) + ' 倍';
      } else if (target.includes('+')) {
        el.textContent = Math.round(current) + '+';
      } else {
        el.textContent = Math.round(current);
      }

      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('[data-count]').forEach((el) => {
    counterObserver.observe(el);
  });

  /* ---- Ripple effect on buttons ---- */
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
      ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  /* ---- Dark mode toggle ---- */
  const themeToggle = document.querySelector('.theme-toggle');
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  themeToggle?.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    if (next === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    localStorage.setItem('theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  });

  if (savedTheme === 'dark') {
    themeToggle.textContent = '☀️';
  }

  /* ---- Screenshot carousel ---- */
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('.screenshot-carousel__track');
    const slides = carousel.querySelectorAll('.screenshot-carousel__slide');
    const prevBtn = carousel.querySelector('.screenshot-carousel__btn--prev');
    const nextBtn = carousel.querySelector('.screenshot-carousel__btn--next');
    const dots = carousel.querySelectorAll('.screenshot-carousel__dot');
    let current = 0;
    const total = slides.length;

    function goTo(index) {
      current = Math.max(0, Math.min(total - 1, index));
      track.style.transform = `translateX(-${current * 100}%)`;
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === total - 1;
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
        dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
    }

    prevBtn?.addEventListener('click', () => goTo(current - 1));
    nextBtn?.addEventListener('click', () => goTo(current + 1));
    dots.forEach((dot) => {
      dot.addEventListener('click', () => goTo(Number(dot.dataset.slide)));
    });

    goTo(0);
  });

  /* ---- Lightbox for screenshots ---- */
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = lightbox?.querySelector('img');
  const lightboxClose = lightbox?.querySelector('.lightbox__close');

  document.querySelectorAll('.screenshot-item').forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img && lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeLightbox() {
    lightbox?.classList.remove('active');
    document.body.style.overflow = '';
  }

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
})();
