/* PawPlace — main.js
   Features: navbar scroll, hero rotator, lightbox (click image to zoom),
   scroll reveal, testimonials, gallery duplicate, counters,
   contact form, scroll-top, dark mode, text size, language, progress bar.
   No bloat. */

(function () {
  'use strict';

  /* ── HELPERS ─────────────────────────────────────────── */
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

  /* ── PROGRESS BAR ────────────────────────────────────── */
  const pgBar = $('#pg-bar');
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - innerHeight) * 100;
    if (pgBar) pgBar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });

  /* ── NAVBAR ──────────────────────────────────────────── */
  const nav = $('nav');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ── MOBILE MENU ──────────────────────────────────────── */
  const hbg   = $('.hamburger');
  const links = $('.nav-links');
  hbg?.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    hbg.classList.toggle('open', open);
    hbg.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('.nav-links a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    hbg?.classList.remove('open');
    document.body.style.overflow = '';
  }));

  /* ── SMOOTH SCROLL ────────────────────────────────────── */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 72, behavior: 'smooth' });
  }));

  /* ── HERO ROTATOR ─────────────────────────────────────── */
  const slides = $$('.hg-slide');
  const dots   = $$('.hg-dot');
  let cur = 0, timer;

  function showSlide(i) {
    slides[cur]?.classList.remove('active');
    dots[cur]?.classList.remove('on');
    cur = (i + slides.length) % slides.length;
    slides[cur]?.classList.add('active');
    dots[cur]?.classList.add('on');
  }

  function startAuto() { timer = setInterval(() => showSlide(cur + 1), 10000); }
  function stopAuto()  { clearInterval(timer); }

  dots.forEach((d, i) => d.addEventListener('click', () => { stopAuto(); showSlide(i); startAuto(); }));

  /* Swipe on rotator */
  const rotator = $('.hero-gallery');
  if (rotator) {
    let sx = 0;
    rotator.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
    rotator.addEventListener('touchend', e => {
      const dx = sx - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 40) { stopAuto(); showSlide(dx > 0 ? cur + 1 : cur - 1); startAuto(); }
    });
  }
  startAuto();

  /* ── LIGHTBOX (click image → enlarge) ────────────────── */
  const lb      = $('#lightbox');
  const lbImg   = lb ? lb.querySelector('img') : null;
  const lbClose = $('#lb-close');

  function openLightbox(src, alt) {
    if (!lb || !lbImg) return;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose?.focus();
  }
  function closeLightbox() {
    lb?.classList.remove('open');
    document.body.style.overflow = '';
  }

  lbClose?.addEventListener('click', closeLightbox);
  lb?.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  /* Attach lightbox to all zoomable images */
  function attachZoom(img) {
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  }
  $$('img.zoomable').forEach(attachZoom);

  /* Gallery items also open lightbox */
  $$('.gal-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) openLightbox(img.src, img.alt);
    });
  });

  /* ── SCROLL REVEAL ────────────────────────────────────── */
  const rvObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = +e.target.dataset.d || 0;
      setTimeout(() => e.target.classList.add('in'), delay * 90);
      rvObs.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('.rv, .rv-l, .rv-r').forEach((el, i) => {
    if (!el.dataset.d) el.dataset.d = i % 5;
    rvObs.observe(el);
  });

  /* stagger children */
  $$('.stagger').forEach(parent => {
    const kids = [...parent.children];
    kids.forEach((k, i) => {
      k.style.opacity = '0';
      k.style.transform = 'translateY(24px)';
      k.style.transition = `opacity .55s ease ${i*100}ms, transform .55s ease ${i*100}ms`;
    });
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      kids.forEach(k => { k.style.opacity = '1'; k.style.transform = 'none'; });
      obs.disconnect();
    }, { threshold: 0.1 });
    obs.observe(parent);
  });

  /* ── COUNTERS ─────────────────────────────────────────── */
  const cntObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const end = +el.dataset.count;
      const suf = el.dataset.suf || '';
      const t0  = performance.now();
      const dur = 1600;
      (function tick(t) {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
      cntObs.unobserve(el);
    });
  }, { threshold: .5 });
  $$('[data-count]').forEach(el => cntObs.observe(el));

  /* ── TESTIMONIALS ─────────────────────────────────────── */
  const tSlides = $$('.t-slide');
  const tDots   = $$('.t-dot');
  let tCur = 0;
  function showT(i) {
    tSlides[tCur]?.classList.remove('on');
    tDots[tCur]?.classList.remove('on');
    tCur = (i + tSlides.length) % tSlides.length;
    tSlides[tCur]?.classList.add('on');
    tDots[tCur]?.classList.add('on');
  }
  tDots.forEach((d, i) => d.addEventListener('click', () => showT(i)));
  if (tSlides.length) setInterval(() => showT(tCur + 1), 5000);

  /* ── GALLERY DUPLICATE ────────────────────────────────── */
  $$('.gal-row').forEach(row => { row.innerHTML += row.innerHTML; });

  /* ── CONTACT FORM ─────────────────────────────────────── */
  const form = $('#contactForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    btn.disabled = true;
    btn.textContent = 'جاري الإرسال...';
    setTimeout(() => {
      form.style.display = 'none';
      $('.success-box').style.display = 'block';
    }, 1500);
  });

  /* ── SCROLL TOP ───────────────────────────────────────── */
  const stBtn = $('#scroll-top');
  window.addEventListener('scroll', () => stBtn?.classList.toggle('vis', scrollY > 380), { passive: true });
  stBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── DARK MODE ────────────────────────────────────────── */
  const themeBtn = $('#theme-toggle');
  const saved    = localStorage.getItem('theme') || 'light';
  document.documentElement.dataset.theme = saved;

  themeBtn?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
  });

  /* ── TEXT SIZE ────────────────────────────────────────── */
  const sizes = ['sm', 'md', 'lg'];
  let sizeIdx = 1; // default md
  $$('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.size;
      sizeIdx = sizes.indexOf(target);
      document.documentElement.dataset.size = target;
      $$('.size-btn').forEach(b => b.setAttribute('aria-pressed', b.dataset.size === target));
      localStorage.setItem('textSize', target);
    });
  });
  // restore saved size
  const savedSize = localStorage.getItem('textSize') || 'md';
  document.documentElement.dataset.size = savedSize;
  $$('.size-btn').forEach(b => b.setAttribute('aria-pressed', b.dataset.size === savedSize));

  /* ── LANGUAGE SELECTOR ────────────────────────────────── */
  const langSel = $('#lang-select');
  const langMap = {
    ar: {
      dir: 'rtl',
      nav_about: 'من نحن', nav_services: 'خدماتنا', nav_packages: 'الباقات',
      nav_gallery: 'معرضنا', nav_testimonials: 'آراء العملاء', nav_contact: 'احجز الآن',
      hero_badge: 'هونج كونج · منذ 2015',
      hero_title: 'منزل ثانٍ <em>لكلبك</em> الغالي',
      hero_desc: 'رعاية احترافية لكلبك في بيئة آمنة ودافئة. فريقنا المتخصص يضمن سعادته وصحته على مدار الساعة.',
      hero_btn1: 'استعرض الباقات', hero_btn2: 'احجز الآن',
    },
    en: {
      dir: 'ltr',
      nav_about: 'About', nav_services: 'Services', nav_packages: 'Packages',
      nav_gallery: 'Gallery', nav_testimonials: 'Reviews', nav_contact: 'Book Now',
      hero_badge: 'Hong Kong · Since 2015',
      hero_title: 'A Second Home <em>for Your Dog</em>',
      hero_desc: 'Professional care for your dog in a safe and warm environment. Our specialist team ensures happiness and health around the clock.',
      hero_btn1: 'View Packages', hero_btn2: 'Book Now',
    },
    zh: {
      dir: 'ltr',
      nav_about: '關於我們', nav_services: '服務', nav_packages: '套餐',
      nav_gallery: '相冊', nav_testimonials: '客戶評價', nav_contact: '立即預約',
      hero_badge: '香港 · 自2015年',
      hero_title: '您愛犬的<em>第二個家</em>',
      hero_desc: '在安全溫暖的環境中為您的愛犬提供專業護理，我們的專業團隊全天候確保健康快樂。',
      hero_btn1: '查看套餐', hero_btn2: '立即預約',
    }
  };

  langSel?.addEventListener('change', () => {
    const lang = langSel.value;
    const t    = langMap[lang];
    if (!t) return;
    document.documentElement.dir  = t.dir;
    document.documentElement.lang = lang;

    // nav
    const navLinks = $$('.nav-links a[data-key]');
    navLinks.forEach(a => {
      const key = a.dataset.key;
      if (t[key]) a.textContent = t[key];
    });
    // hero
    const hBadge = $('.hero-eyebrow span');
    const hTitle = $('.hero-title');
    const hDesc  = $('.hero-desc');
    const hBtn1  = $('.btn-primary span');
    const hBtn2  = $('.btn-secondary span');
    if (hBadge) hBadge.textContent = t.hero_badge;
    if (hTitle) hTitle.innerHTML   = t.hero_title;
    if (hDesc)  hDesc.textContent  = t.hero_desc;
    if (hBtn1)  hBtn1.textContent  = t.hero_btn1;
    if (hBtn2)  hBtn2.textContent  = t.hero_btn2;
  });

})();
