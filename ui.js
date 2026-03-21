(() => {
  function setupHamburger() {
    const toggle = document.querySelector('.menu-toggle');
    if (!toggle) return;
    const targetId = toggle.getAttribute('data-menu-target');
    const menu = targetId ? document.getElementById(targetId) : null;
    if (!menu) return;

    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupHamburger);
  } else {
    setupHamburger();
  }
})();
