/* KR Ranches — main.js */
document.addEventListener('DOMContentLoaded', function () {

  /* --- PRELOADER --- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', function () {
    setTimeout(function () {
      preloader.classList.add('loaded');
    }, 400);
  });

  /* --- NAVBAR SCROLL --- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  /* --- MOBILE MENU --- */
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navOverlay = document.getElementById('navOverlay');

  function openMenu() {
    navMenu.classList.add('open');
    navOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
    menuToggle.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    navMenu.classList.remove('open');
    navOverlay.classList.remove('visible');
    document.body.style.overflow = '';
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  if (menuToggle) menuToggle.addEventListener('click', function () {
    navMenu.classList.contains('open') ? closeMenu() : openMenu();
  });
  if (navOverlay) navOverlay.addEventListener('click', closeMenu);
  document.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* --- FAQ ACCORDION --- */
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (el) {
        el.classList.remove('open');
        el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* --- SCROLL REVEAL --- */
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });

  /* --- SMOOTH SCROLL NAV --- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* --- ACTIVE NAV LINK --- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  window.addEventListener('scroll', function () {
    let current = '';
    sections.forEach(function (section) {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) current = section.getAttribute('id');
    });
    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  });

  /* --- COUNTER ANIMATION --- */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(function () {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current).toLocaleString() + (el.dataset.suffix || '');
    }, 16);
  }

  const statsObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.counter').forEach(animateCounter);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stats-bar').forEach(function (el) {
    statsObserver.observe(el);
  });

});
