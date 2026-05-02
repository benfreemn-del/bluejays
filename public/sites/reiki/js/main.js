document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  const toggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (mobileMenu) mobileMenu.classList.add('hidden');
      }
    });
  });

  // Scroll-reveal animation
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const answer = this.nextElementSibling;
      const icon = this.querySelector('.faq-icon');
      const isOpen = answer.classList.contains('open');
      document.querySelectorAll('.faq-answer').forEach(function (a) { a.classList.remove('open'); });
      document.querySelectorAll('.faq-icon').forEach(function (i) { i.textContent = '+'; });
      if (!isOpen) {
        answer.classList.add('open');
        if (icon) icon.textContent = '×';
      }
    });
  });
});
