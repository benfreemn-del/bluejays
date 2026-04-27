document.addEventListener("DOMContentLoaded", function () {

  // ─── 1. PRELOADER ────────────────────────────────────────────────────────────
  window.addEventListener("load", function () {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      preloader.classList.add("loaded");
    }
  });

  // ─── 2. NAVBAR SCROLL ────────────────────────────────────────────────────────
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", function () {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // ─── 3. MOBILE MENU ──────────────────────────────────────────────────────────
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("open");
      mobileMenu.classList.toggle("open");
    });

    const mobileLinks = mobileMenu.querySelectorAll("a");
    mobileLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        hamburger.classList.remove("open");
        mobileMenu.classList.remove("open");
      });
    });
  }

  // ─── 4. RADAR SCANNER STATUS TEXT ────────────────────────────────────────────
  const scannerStatus = document.getElementById("scannerStatus");
  if (scannerStatus) {
    const statusMessages = ["SCANNING...", "ANALYZING...", "DETECTED", "CLEAR"];
    let statusIndex = 0;
    setInterval(function () {
      statusIndex = (statusIndex + 1) % statusMessages.length;
      scannerStatus.textContent = statusMessages[statusIndex];
    }, 2000);
  }

  // ─── 5. SPORE DOT FLASH ──────────────────────────────────────────────────────
  const sporeDots = document.querySelectorAll(".spore-dot");
  if (sporeDots.length > 0) {
    setInterval(function () {
      const randomIndex = Math.floor(Math.random() * sporeDots.length);
      const dot = sporeDots[randomIndex];
      const originalFill = dot.style.fill;
      const originalFilter = dot.style.filter;

      dot.style.fill = "rgba(74,222,128,0.9)";
      dot.style.filter = "drop-shadow(0 0 6px #4ade80)";

      setTimeout(function () {
        dot.style.fill = originalFill;
        dot.style.filter = originalFilter;
      }, 600);
    }, 1200);
  }

  // ─── 6. STAT COUNTERS ────────────────────────────────────────────────────────
  const statElements = document.querySelectorAll("[data-count]");

  function animateCounter(el) {
    const rawValue = el.getAttribute("data-count");
    const hasPlus = rawValue.includes("+");
    const hasPercent = rawValue.includes("%");
    const numericValue = parseFloat(rawValue.replace(/[^0-9.]/g, ""));
    const duration = 1500;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * numericValue);

      let display = current.toString();
      if (hasPlus) display += "+";
      if (hasPercent) display += "%";
      el.textContent = display;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        let finalDisplay = numericValue.toString();
        if (Number.isInteger(numericValue)) {
          finalDisplay = numericValue.toString();
        }
        if (hasPlus) finalDisplay += "+";
        if (hasPercent) finalDisplay += "%";
        el.textContent = finalDisplay;
      }
    }

    requestAnimationFrame(step);
  }

  if (statElements.length > 0) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    statElements.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  // ─── 7. FAQ ACCORDION ────────────────────────────────────────────────────────
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach(function (question) {
    question.addEventListener("click", function () {
      const faqItem = question.closest(".faq-item");
      if (!faqItem) return;

      const isOpen = faqItem.classList.contains("open");

      // Close all other items
      document.querySelectorAll(".faq-item").forEach(function (item) {
        item.classList.remove("open");
      });

      // Toggle the clicked item
      if (!isOpen) {
        faqItem.classList.add("open");
      }
    });
  });

  // ─── 8. SCROLL REVEAL ────────────────────────────────────────────────────────
  const revealElements = document.querySelectorAll(".reveal");

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "-50px" });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // ─── 9. FLOATING PARTICLES ───────────────────────────────────────────────────
  const heroParticles = document.querySelector(".hero-particles");

  if (heroParticles) {
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");

      const leftPercent = 5 + Math.random() * 90;
      const animDelay = Math.random() * 8;
      const animDuration = 6 + Math.random() * 6;
      const size = 2 + Math.random() * 2;

      particle.style.left = leftPercent + "%";
      particle.style.animationDelay = animDelay + "s";
      particle.style.animationDuration = animDuration + "s";
      particle.style.width = size + "px";
      particle.style.height = size + "px";

      heroParticles.appendChild(particle);
    }
  }

  // ─── 10. CONTACT FORM ────────────────────────────────────────────────────────
  const contactForm = document.getElementById("contactForm");
  const formSuccess = document.getElementById("formSuccess");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const nameField = contactForm.querySelector("[name='name'], #name");
      const phoneField = contactForm.querySelector("[name='phone'], #phone");
      const emailField = contactForm.querySelector("[name='email'], #email");
      const serviceField = contactForm.querySelector("[name='service'], #service");

      const nameValue = nameField ? nameField.value.trim() : "";
      const phoneValue = phoneField ? phoneField.value.trim() : "";
      const emailValue = emailField ? emailField.value.trim() : "";
      const serviceValue = serviceField ? serviceField.value.trim() : "";

      const contactProvided = phoneValue || emailValue;

      if (!nameValue || !contactProvided || !serviceValue) {
        alert("Please fill in all required fields.");
        return;
      }

      contactForm.style.display = "none";
      if (formSuccess) {
        formSuccess.style.display = "block";
      }
    });
  }

  // ─── 11. SMOOTH SCROLL ───────────────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // ─── 12. ACTIVE NAV LINK ─────────────────────────────────────────────────────
  const sectionIds = [
    "home",
    "warning-signs",
    "services",
    "process",
    "pricing",
    "faq",
    "about",
    "contact"
  ];

  function updateActiveNavLink() {
    const scrollPosition = window.scrollY + window.innerHeight * 0.35;
    let activeSectionId = null;

    for (let i = sectionIds.length - 1; i >= 0; i--) {
      const section = document.getElementById(sectionIds[i]);
      if (section && section.offsetTop <= scrollPosition) {
        activeSectionId = sectionIds[i];
        break;
      }
    }

    document.querySelectorAll("nav a, .mobile-menu a").forEach(function (link) {
      link.classList.remove("active");
      if (activeSectionId) {
        const href = link.getAttribute("href");
        if (href === "#" + activeSectionId) {
          link.classList.add("active");
        }
      }
    });
  }

  window.addEventListener("scroll", updateActiveNavLink);
  updateActiveNavLink();

  // Pricing calculator
  function calcPrice(sqft) {
    if (sqft <= 1500) return 150;
    return 150 + Math.ceil((sqft - 1500) / 500) * 50;
  }

  var slider = document.getElementById("sqft-slider");
  var priceEl = document.getElementById("calc-price");
  var sqftDisplay = document.getElementById("sqft-display");

  if (slider && priceEl && sqftDisplay) {
    function updateCalc() {
      var sqft = parseInt(slider.value, 10);
      sqftDisplay.textContent = sqft.toLocaleString() + " sq ft";
      priceEl.textContent = "$" + calcPrice(sqft);
    }
    slider.addEventListener("input", updateCalc);
    updateCalc();
  }

});
