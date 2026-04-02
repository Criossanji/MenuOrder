(() => {
  /* ── Hamburger menu ── */
  function setupHamburger() {
    const toggle = document.querySelector('.menu-toggle');
    if (!toggle) return;
    const targetId = toggle.getAttribute('data-menu-target');
    const menu = targetId ? document.getElementById(targetId) : null;
    if (!menu) return;
    toggle.addEventListener('click', () => menu.classList.toggle('open'));
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => menu.classList.remove('open'));
    });
  }

  /* ── Scroll reveal ── */
  function setupScrollReveal() {
    const items = document.querySelectorAll('.menu-item, .category-card, .cert-card, .branch-card');
    if (!items.length) return;
    items.forEach(el => el.classList.add('reveal'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    items.forEach(el => observer.observe(el));
  }

  /* ── Back to top — only if page is scrollable ── */
  function setupBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    function checkScroll() {
      const pageScrollable = document.documentElement.scrollHeight > window.innerHeight + 200;
      const scrolledDown = window.scrollY > 300;
      btn.classList.toggle('show', pageScrollable && scrolledDown);
    }

    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });
    checkScroll();

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Lightbox for cert images ── */
  function setupLightbox() {
    const images = document.querySelectorAll('.cert-card img');
    if (!images.length) return;

    const box = document.createElement('div');
    box.className = 'lightbox';
    const boxImg = document.createElement('img');
    box.appendChild(boxImg);
    document.body.appendChild(box);

    images.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        boxImg.src = img.src;
        boxImg.alt = img.alt;
        box.classList.add('active');
      });
    });

    box.addEventListener('click', () => box.classList.remove('active'));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') box.classList.remove('active');
    });
  }

  /* ── Floating cart button (mobile) ── */
  function setupFloatingCart() {
    const cartEl = document.querySelector('#cart');
    if (!cartEl) return;

    const btn = document.createElement('button');
    btn.className = 'floating-cart-btn';
    btn.innerHTML = '<span style="pointer-events:none">&#128722;</span><span class="cart-badge" style="display:none">0</span>';
    btn.setAttribute('aria-label', 'View cart');
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
      cartEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    const updateBadge = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('croissanji_cart_v1') || '{}');
        const count = Object.values(cart).reduce((s, it) => s + (it.qty || 0), 0);
        const badge = btn.querySelector('.cart-badge');
        if (badge) {
          badge.textContent = count;
          badge.style.display = count > 0 ? 'flex' : 'none';
        }
      } catch (_) {}
    };
    updateBadge();
    setInterval(updateBadge, 500);
  }

  function init() {
    setupHamburger();
    setupScrollReveal();
    setupBackToTop();
    setupLightbox();
    setupFloatingCart();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
