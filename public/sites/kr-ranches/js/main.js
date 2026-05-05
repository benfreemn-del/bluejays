// KR Ranches — Farm-Direct Meat | Prosser, WA
// Static site interactions: nav reveal, smooth scroll, gallery hover,
// FAQ toggle, contact form handler, scroll-reveal animations.

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initPreloader();
    initStickyNav();
    initMobileMenu();
    initSmoothScroll();
    initScrollReveal();
    initOrderCalc();
    initFaqToggle();
    initContactForm();
    initYearStamp();
    initStickyCta();
    initNeedsCalculator();
  });

  // ---- PRELOADER ----
  function initPreloader() {
    var pre = document.getElementById("preloader");
    if (!pre) return;
    window.addEventListener("load", function () {
      setTimeout(function () {
        pre.classList.add("done");
        setTimeout(function () {
          pre.style.display = "none";
        }, 500);
      }, 250);
    });
  }

  // ---- STICKY NAV (color shift on scroll) ----
  function initStickyNav() {
    var nav = document.getElementById("navbar");
    if (!nav) return;
    var lastScroll = 0;

    function update() {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (y > 40) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
      // hide on scroll down past 320, show on scroll up
      if (y > 320 && y > lastScroll) {
        nav.classList.add("hide");
      } else {
        nav.classList.remove("hide");
      }
      lastScroll = y;
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  // ---- MOBILE MENU ----
  function initMobileMenu() {
    var burger = document.querySelector(".hamburger");
    var menu = document.querySelector(".mobile-menu");
    if (!burger || !menu) return;

    burger.addEventListener("click", function () {
      burger.classList.toggle("open");
      menu.classList.toggle("open");
      document.body.classList.toggle("menu-open");
    });

    // close on link tap
    var links = menu.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function () {
        burger.classList.remove("open");
        menu.classList.remove("open");
        document.body.classList.remove("menu-open");
      });
    }
  }

  // ---- SMOOTH SCROLL (anchor links) ----
  function initSmoothScroll() {
    var anchors = document.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < anchors.length; i++) {
      anchors[i].addEventListener("click", function (e) {
        var href = this.getAttribute("href");
        if (!href || href === "#" || href.length < 2) return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        var navOffset = 72;
        var top =
          target.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({ top: top, behavior: "smooth" });
      });
    }
  }

  // ---- SCROLL REVEAL (IntersectionObserver) ----
  function initScrollReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      // fallback: show everything
      for (var j = 0; j < els.length; j++) {
        els[j].classList.add("in");
      }
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    for (var i = 0; i < els.length; i++) {
      io.observe(els[i]);
    }
  }

  // ---- ORDER CALC (whole/half/quarter estimator) ----
  function initOrderCalc() {
    var radios = document.querySelectorAll('input[name="order-cut"]');
    var yieldEl = document.getElementById("calc-yield");
    var freezerEl = document.getElementById("calc-freezer");
    var depositEl = document.getElementById("calc-deposit");
    if (!radios.length || !yieldEl) return;

    // Approximate, conservative numbers for whole-animal beef orders.
    // These are estimates only. The Notes / FAQ explain the variability.
    var data = {
      quarter: { yield: "100 to 130 lbs", freezer: "4 to 5 cubic feet" },
      half: { yield: "200 to 250 lbs", freezer: "8 to 10 cubic feet" },
      whole: { yield: "400 to 500 lbs", freezer: "16 to 20 cubic feet" }
    };

    function update(value) {
      var d = data[value] || data.half;
      yieldEl.textContent = d.yield + " of cut and wrapped meat";
      if (freezerEl) freezerEl.textContent = d.freezer + " of freezer space";
      if (depositEl) depositEl.textContent = "Reserve with a deposit";
    }

    for (var i = 0; i < radios.length; i++) {
      radios[i].addEventListener("change", function () {
        if (this.checked) update(this.value);
      });
      if (radios[i].checked) update(radios[i].value);
    }
  }

  // ---- FAQ ACCORDION ----
  function initFaqToggle() {
    var items = document.querySelectorAll(".faq-item");
    for (var i = 0; i < items.length; i++) {
      var btn = items[i].querySelector(".faq-question");
      if (!btn) continue;
      btn.addEventListener("click", function () {
        var item = this.parentElement;
        var open = item.classList.contains("open");
        // close any other open items (single-open accordion)
        for (var k = 0; k < items.length; k++) {
          items[k].classList.remove("open");
        }
        if (!open) item.classList.add("open");
      });
    }
  }

  // ---- CONTACT FORM (POST to BlueJays contact-form API) ----
  function initContactForm() {
    var form = document.getElementById("orderForm");
    var success = document.getElementById("formSuccess");
    var errorBox = document.getElementById("formError");
    if (!form) return;

    var endpoint =
      "https://bluejayportfolio.com/api/contact-form/30eec463-5f78-4632-8c4b-aaba9fa3151f";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector(".form-submit");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending...";
      }
      if (errorBox) errorBox.style.display = "none";

      var fd = new FormData(form);
      var payload = {
        name: fd.get("name") || "",
        phone: fd.get("phone") || "",
        email: fd.get("email") || "",
        service: fd.get("interest") || "",
        message: fd.get("message") || ""
      };

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("send-failed");
          return res.json().catch(function () {
            return {};
          });
        })
        .then(function () {
          form.style.display = "none";
          if (success) success.style.display = "block";
        })
        .catch(function () {
          if (btn) {
            btn.disabled = false;
            btn.textContent = "Send Order Request";
          }
          if (errorBox) {
            errorBox.style.display = "block";
            errorBox.textContent =
              "Something went wrong. Please call us directly or try again.";
          }
        });
    });
  }

  // ---- YEAR STAMP ----
  function initYearStamp() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  // ---- MOBILE STICKY CTA (show after scrolling past hero) ----
  function initStickyCta() {
    var bar = document.getElementById("mobileStickyCta");
    if (!bar) return;
    function update() {
      var triggerPoint = window.innerHeight * 0.7;
      var y = window.scrollY || document.documentElement.scrollTop;
      if (y > triggerPoint) {
        bar.classList.add("show");
      } else {
        bar.classList.remove("show");
      }
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  // ---- HOW MUCH MEAT DO I NEED? CALCULATOR ----
  function initNeedsCalculator() {
    var minus = document.getElementById("needs-minus");
    var plus = document.getElementById("needs-plus");
    var count = document.getElementById("needs-count");
    var share = document.getElementById("needs-share");
    var yieldEl = document.getElementById("needs-yield");
    var freezer = document.getElementById("needs-freezer");
    if (!minus || !plus || !count || !share) return;

    // Per-eater estimates: about 100 lbs of cut meat per person per year for an
    // average eater. We round UP to a real share size (quarter, half, whole).
    function recommendation(n) {
      // total pounds needed for the household over a year
      var totalLbs = n * 100;
      var data;
      if (n <= 1) {
        data = {
          share: "A quarter beef",
          yield: "100 to 130 lbs of cut and wrapped meat",
          freezer: "4 to 5 cubic feet"
        };
      } else if (n <= 3) {
        data = {
          share: "A half beef",
          yield: "200 to 250 lbs of cut and wrapped meat",
          freezer: "8 to 10 cubic feet"
        };
      } else if (n <= 5) {
        data = {
          share: "A half beef plus a half hog",
          yield: "300 to 360 lbs of cut and wrapped meat",
          freezer: "12 to 14 cubic feet"
        };
      } else if (n <= 7) {
        data = {
          share: "A whole beef",
          yield: "400 to 500 lbs of cut and wrapped meat",
          freezer: "16 to 20 cubic feet"
        };
      } else {
        data = {
          share: "A whole beef plus a whole hog",
          yield: "550 to 650 lbs of cut and wrapped meat",
          freezer: "22 to 26 cubic feet"
        };
      }
      data.totalLbs = totalLbs;
      return data;
    }

    function flash(el) {
      if (!el) return;
      el.classList.add("flash");
      setTimeout(function () { el.classList.remove("flash"); }, 350);
    }

    function update() {
      var n = parseInt(count.textContent, 10) || 0;
      if (n < 1) n = 1;
      if (n > 14) n = 14;
      count.textContent = String(n);
      var d = recommendation(n);
      share.textContent = d.share;
      yieldEl.textContent = d.yield;
      freezer.textContent = d.freezer;
      flash(share); flash(yieldEl); flash(freezer);
    }

    minus.addEventListener("click", function () {
      var n = parseInt(count.textContent, 10) || 1;
      count.textContent = String(Math.max(1, n - 1));
      update();
    });
    plus.addEventListener("click", function () {
      var n = parseInt(count.textContent, 10) || 1;
      count.textContent = String(Math.min(14, n + 1));
      update();
    });

    update();
  }
})();
