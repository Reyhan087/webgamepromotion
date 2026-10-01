/* -------------------------------------------------------------------------
   NAVBAR: transparan di atas hero, jadi solid + blur setelah discroll
   ------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hero = document.getElementById('home');
  if (!navbar || !hero) return;

  function onScroll() {
    const threshold = hero.offsetHeight * 0.6;
    navbar.classList.toggle('is-scrolled', window.scrollY > threshold);
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* -------------------------------------------------------------------------
   MOBILE HAMBURGER MENU
   ------------------------------------------------------------------------- */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  function closeMenu() {
    hamburger.classList.remove('is-open');
    navLinks.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    hamburger.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Tutup menu tiap kali salah satu link diklik (UX mobile yang wajar)
  navLinks.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Tap di luar navbar, tombol Escape, atau layar melebar ke desktop -> tutup
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('is-open') && !e.target.closest('#navbar')) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
      closeMenu();
      hamburger.focus();
    }
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => {
    if (e.matches) closeMenu();
  });
}

/* -------------------------------------------------------------------------
   SMOOTH SCROLL dengan offset navbar
   ------------------------------------------------------------------------- */
function initSmoothScroll() {
  const navbar = document.getElementById('navbar');
  const navbarHeight = navbar ? navbar.offsetHeight : 76;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      // Hero ada di paling atas (di bawah navbar transparan): tidak perlu offset
      const offset = target.matches('.hero-carousel') ? 0 : navbarHeight - 1;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
}
