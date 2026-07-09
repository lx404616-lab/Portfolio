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
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          animateCounter(entry.target);
          entry.target.dataset.animated = 'true';
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

  /* ---- Project detail tabs ---- */
  document.querySelectorAll('[data-project-detail]').forEach((detail) => {
    const tabBtns = detail.querySelectorAll('.project-tabs__btn');
    const panels = detail.querySelectorAll('.project-tabs__panel');
    const gallery = detail.querySelector('[data-project-gallery]');
    const galleryTab = gallery?.dataset.galleryTab || 'pdc';
    const showcase = detail.querySelector('[data-showcase-tab]');
    const showcaseTab = showcase?.dataset.showcaseTab || 'pdc';

    function animatePanelCounters(panel) {
      panel.querySelectorAll('[data-count]').forEach((el) => {
        if (el.dataset.animated) return;
        animateCounter(el);
        el.dataset.animated = 'true';
      });
    }

    function syncGalleryHeight() {
      detail.querySelectorAll('.project-gallery-slot').forEach((slot) => {
        slot.style.height = '';
      });

      if (window.innerWidth <= 991) return;

      const panel = detail.querySelector('.project-tabs__panel.active');
      const body = panel?.querySelector('.project-panel__body');
      const slot = panel?.querySelector('.project-gallery-slot');
      if (body && slot) {
        slot.style.height = `${body.offsetHeight}px`;
      }
    }

    function switchTab(tabId) {
      tabBtns.forEach((btn) => {
        const isActive = btn.dataset.tab === tabId;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      panels.forEach((panel) => {
        const isActive = panel.dataset.tabPanel === tabId;
        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
        if (isActive) animatePanelCounters(panel);
      });

      if (gallery) {
        const showGallery = tabId === galleryTab;
        gallery.classList.toggle('is-hidden', !showGallery);
      }

      if (showcase) {
        const showShowcase = tabId === showcaseTab;
        showcase.classList.toggle('is-hidden', !showShowcase);
      }

      requestAnimationFrame(syncGalleryHeight);
    }

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    const initial = detail.querySelector('.project-tabs__btn.active')?.dataset.tab || 'pdc';
    switchTab(initial);

    window.addEventListener('resize', syncGalleryHeight);
    if (document.fonts?.ready) {
      document.fonts.ready.then(syncGalleryHeight);
    }
  });

  /* ---- Project detail image gallery ---- */
  document.querySelectorAll('[data-project-gallery]').forEach((gallery) => {
    const track = gallery.querySelector('.project-gallery__track');
    const slides = gallery.querySelectorAll('.project-gallery__slide');
    const dots = gallery.querySelectorAll('.project-gallery__dot');
    const prevBtn = gallery.querySelector('.project-gallery__btn--prev');
    const nextBtn = gallery.querySelector('.project-gallery__btn--next');
    let current = 0;

    function goTo(index) {
      current = Math.max(0, Math.min(slides.length - 1, index));
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
        dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current === slides.length - 1;
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
