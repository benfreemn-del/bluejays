/* ===================================
   OLYMPIC PROTECTION SERVICES
   Main JavaScript
   =================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- Preloader ---
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('loaded');
            document.body.style.overflow = '';
            initAnimations();
        }, 1800);
    });

    // Fallback: remove preloader after 3s max
    setTimeout(() => {
        if (!preloader.classList.contains('loaded')) {
            preloader.classList.add('loaded');
            document.body.style.overflow = '';
            initAnimations();
        }
    }, 3000);

    // --- Navigation ---
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navLinkItems = document.querySelectorAll('.nav-link');

    // Scroll handler for navbar
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        navbar.classList.toggle('scrolled', scrollY > 50);
        lastScroll = scrollY;
        updateActiveNav();
    });

    // Mobile toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile nav on link click
    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Also close on CTA click
    const navCta = document.querySelector('.nav-cta');
    if (navCta) {
        navCta.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    }

    // Update active nav link based on scroll position
    function updateActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 200;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinkItems.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // --- Scroll Animations (Intersection Observer) ---
    function initAnimations() {
        const elements = document.querySelectorAll('[data-animate]');

        // Immediately reveal hero elements (inside #home)
        document.querySelectorAll('#home [data-animate]').forEach(el => {
            const delay = el.getAttribute('data-delay') || 0;
            setTimeout(() => el.classList.add('visible'), parseInt(delay) + 300);
        });

        // Intersection Observer for scroll-triggered reveals
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const delay = entry.target.getAttribute('data-delay') || 0;
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, parseInt(delay));
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0,
                rootMargin: '0px 0px 100px 0px'
            });

            elements.forEach(el => {
                if (!el.closest('#home')) {
                    observer.observe(el);
                }
            });
        }

        // Backup: scroll listener to catch anything the observer misses
        function revealOnScroll() {
            const windowHeight = window.innerHeight;
            elements.forEach(el => {
                if (el.classList.contains('visible')) return;
                const rect = el.getBoundingClientRect();
                if (rect.top < windowHeight + 100) {
                    const delay = el.getAttribute('data-delay') || 0;
                    setTimeout(() => el.classList.add('visible'), parseInt(delay));
                }
            });
        }
        window.addEventListener('scroll', revealOnScroll, { passive: true });
        // Run once immediately to catch already-visible elements
        revealOnScroll();

        // Ultimate fallback: reveal everything after 4 seconds
        setTimeout(() => {
            elements.forEach(el => {
                if (!el.classList.contains('visible')) {
                    el.classList.add('visible');
                }
            });
        }, 4000);
    }

    // --- Animated Counters ---
    function animateCounters() {
        const counters = document.querySelectorAll('[data-count]');

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-count'));
                    animateCounter(entry.target, target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    function animateCounter(el, target) {
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);

            el.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    animateCounters();

    // --- Hero Particles ---
    function createParticles() {
        const container = document.getElementById('heroParticles');
        if (!container) return;

        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 3 + 1}px;
                height: ${Math.random() * 3 + 1}px;
                background: rgba(201, 162, 39, ${Math.random() * 0.3 + 0.1});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particleFloat ${Math.random() * 8 + 6}s ease-in-out infinite;
                animation-delay: ${Math.random() * 4}s;
            `;
            container.appendChild(particle);
        }

        // Add particle animation keyframes
        if (!document.getElementById('particleStyles')) {
            const style = document.createElement('style');
            style.id = 'particleStyles';
            style.textContent = `
                @keyframes particleFloat {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                        opacity: 0.3;
                    }
                    25% {
                        transform: translate(${Math.random() * 60 - 30}px, ${Math.random() * -60}px) scale(1.2);
                        opacity: 0.7;
                    }
                    50% {
                        transform: translate(${Math.random() * 80 - 40}px, ${Math.random() * -40}px) scale(0.8);
                        opacity: 0.4;
                    }
                    75% {
                        transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * -80}px) scale(1.1);
                        opacity: 0.6;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    createParticles();

    // --- Smooth Scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
                const targetPos = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({
                    top: targetPos,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Form Handling ---
    function handleFormSubmit(form, formCard) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = form.querySelector('button[type="submit"]');
            const originalContent = btn.innerHTML;

            // Show loading state
            btn.innerHTML = `
                <span>Sending...</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
                    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                </svg>
            `;
            btn.disabled = true;

            // Simulate submission
            setTimeout(() => {
                form.style.display = 'none';

                const success = document.createElement('div');
                success.className = 'form-success';
                success.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    <h4>Message Received</h4>
                    <p>Thank you! We'll get back to you within 24 hours.</p>
                `;
                formCard.appendChild(success);
            }, 1500);
        });
    }

    const contactForm = document.getElementById('contactForm');
    const careerForm = document.getElementById('careerForm');

    if (contactForm) {
        handleFormSubmit(contactForm, contactForm.closest('.form-card'));
    }
    if (careerForm) {
        handleFormSubmit(careerForm, careerForm.closest('.form-card'));
    }

    // --- Add spin animation for loading ---
    const spinStyle = document.createElement('style');
    spinStyle.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .spin {
            animation: spin 1s linear infinite;
        }
    `;
    document.head.appendChild(spinStyle);

    // --- Parallax on mouse move for hero ---
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const xRatio = (e.clientX / window.innerWidth - 0.5) * 2;
            const yRatio = (e.clientY / window.innerHeight - 0.5) * 2;

            const grid = hero.querySelector('.hero-grid-pattern');
            if (grid) {
                grid.style.transform = `translate(${xRatio * 10}px, ${yRatio * 10}px)`;
            }
        });
    }

    // --- Service cards tilt effect ---
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `translateY(-4px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
});