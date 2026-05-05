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
    initContactCalc();
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

  // ---- ORDER CALC (animal × share live estimator) ----
  function initOrderCalc() {
    var animalPills = document.querySelectorAll('[data-group="animal"] .calc-pill');
    var sharePills = document.querySelectorAll('[data-group="share"] .calc-pill');
    var yieldEl = document.getElementById("calc-yield");
    var freezerEl = document.getElementById("calc-freezer");
    var depositEl = document.getElementById("calc-deposit");
    var priceEl = document.getElementById("calc-price");
    var priceSubEl = document.getElementById("calc-price-sub");
    var shareNoteEl = document.getElementById("calc-share-note");

    if (!animalPills.length || !sharePills.length || !priceEl) return;

    // Pricing matrix — realistic ranch ballpark for the Yakima Valley.
    // Numbers are conservative ranges. Final price = hanging weight ×
    // per-lb rate, locked in at the butcher.
    var MATRIX = {
      beef: {
        quarter: {
          yield: "100 to 130 lbs",
          freezer: "4 to 5 cubic feet",
          priceLow: 750,
          priceHigh: 1100,
          deposit: "$200 holds your spot",
          sub: "Includes harvest, USDA cut & wrap, vacuum-sealed packaging.",
        },
        half: {
          yield: "200 to 250 lbs",
          freezer: "8 to 10 cubic feet",
          priceLow: 1500,
          priceHigh: 2200,
          deposit: "$300 holds your spot",
          sub: "Includes harvest, USDA cut & wrap, vacuum-sealed packaging.",
        },
        whole: {
          yield: "400 to 500 lbs",
          freezer: "16 to 20 cubic feet",
          priceLow: 3000,
          priceHigh: 4400,
          deposit: "$500 holds your spot",
          sub: "Includes harvest, USDA cut & wrap, vacuum-sealed packaging. Whole-animal best value per pound.",
        },
      },
      pork: {
        half: {
          yield: "60 to 80 lbs",
          freezer: "3 to 4 cubic feet",
          priceLow: 400,
          priceHigh: 650,
          deposit: "$150 holds your spot",
          sub: "Heritage hog. Includes harvest, custom cut, smoking & sausage if desired.",
        },
        whole: {
          yield: "120 to 160 lbs",
          freezer: "6 to 7 cubic feet",
          priceLow: 800,
          priceHigh: 1300,
          deposit: "$250 holds your spot",
          sub: "Heritage hog. Includes harvest, custom cut, smoking & sausage if desired.",
        },
      },
      lamb: {
        half: {
          yield: "20 to 25 lbs",
          freezer: "1 to 2 cubic feet",
          priceLow: 250,
          priceHigh: 400,
          deposit: "$100 holds your spot",
          sub: "Grass-finished. Includes harvest, USDA cut & wrap.",
        },
        whole: {
          yield: "40 to 50 lbs",
          freezer: "2 to 3 cubic feet",
          priceLow: 500,
          priceHigh: 800,
          deposit: "$150 holds your spot",
          sub: "Grass-finished. Includes harvest, USDA cut & wrap.",
        },
      },
    };

    var SHARE_NOTES = {
      beef: "Quarter, half, or whole — beef is the most flexible.",
      pork: "Pork comes in halves or whole. Quarter not available.",
      lamb: "Lamb comes in halves or whole. Quarter not available.",
    };

    var state = { animal: "beef", share: "half" };

    function fmtMoney(n) {
      return "$" + n.toLocaleString("en-US");
    }

    function flashPrice() {
      priceEl.classList.remove("flash");
      // force reflow so the animation re-fires
      void priceEl.offsetWidth;
      priceEl.classList.add("flash");
    }

    function setActive(pills, attrName, value) {
      for (var i = 0; i < pills.length; i++) {
        if (pills[i].getAttribute(attrName) === value) {
          pills[i].classList.add("is-active");
        } else {
          pills[i].classList.remove("is-active");
        }
      }
    }

    function updateShareAvailability() {
      // Pork & lamb don't sell quarters — disable the quarter pill.
      for (var i = 0; i < sharePills.length; i++) {
        var size = sharePills[i].getAttribute("data-share");
        if (size === "quarter" && state.animal !== "beef") {
          sharePills[i].setAttribute("disabled", "disabled");
          // If quarter was active, snap to half
          if (state.share === "quarter") {
            state.share = "half";
            setActive(sharePills, "data-share", "half");
          }
        } else {
          sharePills[i].removeAttribute("disabled");
        }
      }
      if (shareNoteEl) shareNoteEl.textContent = SHARE_NOTES[state.animal];
    }

    function render() {
      var bucket = MATRIX[state.animal];
      if (!bucket) return;
      var data = bucket[state.share] || bucket.half || bucket.whole;
      if (!data) return;

      priceEl.textContent =
        fmtMoney(data.priceLow) + " – " + fmtMoney(data.priceHigh);
      flashPrice();
      if (priceSubEl) priceSubEl.textContent = data.sub;
      if (yieldEl) yieldEl.textContent = data.yield + " of cut and wrapped meat";
      if (freezerEl) freezerEl.textContent = data.freezer + " of freezer space";
      if (depositEl) depositEl.textContent = data.deposit;
    }

    // Wire animal pills
    for (var i = 0; i < animalPills.length; i++) {
      (function (pill) {
        pill.addEventListener("click", function () {
          state.animal = pill.getAttribute("data-animal");
          setActive(animalPills, "data-animal", state.animal);
          updateShareAvailability();
          render();
        });
      })(animalPills[i]);
    }

    // Wire share pills
    for (var j = 0; j < sharePills.length; j++) {
      (function (pill) {
        pill.addEventListener("click", function () {
          if (pill.hasAttribute("disabled")) return;
          state.share = pill.getAttribute("data-share");
          setActive(sharePills, "data-share", state.share);
          render();
        });
      })(sharePills[j]);
    }

    updateShareAvailability();
    render();
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

  // ---- CONTACT-FORM CALCULATOR (mirrors order calc, drives hidden interest) ----
  function initContactCalc() {
    var animalPills = document.querySelectorAll('[data-group="animal-contact"] .calc-pill');
    var sharePills = document.querySelectorAll('[data-group="share-contact"] .calc-pill');
    var priceEl = document.getElementById("contactCalcPrice");
    var subEl = document.getElementById("contactCalcSub");
    var interestEl = document.getElementById("interest");
    var shareStep = document.getElementById("contactShareStep");
    var shareNote = document.getElementById("contactShareNote");

    if (!animalPills.length || !priceEl) return;

    // Same matrix shape as the order calculator. Animals without shares
    // (chicken/eggs/cuts) skip step 2 and show a single price line.
    var MATRIX = {
      beef: {
        quarter: { yield: "100–130 lbs", priceLow: 750, priceHigh: 1100, interest: "quarter-beef" },
        half:    { yield: "200–250 lbs", priceLow: 1500, priceHigh: 2200, interest: "half-beef" },
        whole:   { yield: "400–500 lbs", priceLow: 3000, priceHigh: 4400, interest: "whole-beef" },
      },
      pork: {
        half:  { yield: "60–80 lbs", priceLow: 400, priceHigh: 650, interest: "half-hog" },
        whole: { yield: "120–160 lbs", priceLow: 800, priceHigh: 1300, interest: "whole-hog" },
      },
      lamb: {
        half:  { yield: "20–25 lbs", priceLow: 250, priceHigh: 400, interest: "half-lamb" },
        whole: { yield: "40–50 lbs", priceLow: 500, priceHigh: 800, interest: "whole-lamb" },
      },
      // No-share animals — single flat estimate.
      chicken: { yield: "Whole birds, 4–6 lbs each", priceLow: 25, priceHigh: 35, interest: "chicken", perUnit: " per bird" },
      eggs:    { yield: "By the dozen", priceLow: 8, priceHigh: 8, interest: "eggs", perUnit: " / dozen" },
      cuts:    { yield: "Whatever is in the freezer", priceLow: 9, priceHigh: 26, interest: "cuts", perUnit: " / lb" },
    };

    var SHARE_NOTES = {
      beef: "Beef: quarter, half, or whole.",
      pork: "Pork: halves or whole only.",
      lamb: "Lamb: halves or whole only.",
    };

    var state = { animal: "beef", share: "half" };

    function fmtMoney(n) { return "$" + n.toLocaleString("en-US"); }

    function setActive(pills, attr, value) {
      for (var i = 0; i < pills.length; i++) {
        if (pills[i].getAttribute(attr) === value) pills[i].classList.add("is-active");
        else pills[i].classList.remove("is-active");
      }
    }

    function flashPrice() {
      priceEl.classList.remove("flash");
      void priceEl.offsetWidth;
      priceEl.classList.add("flash");
    }

    function render() {
      var bucket = MATRIX[state.animal];
      if (!bucket) return;

      var noShare = !!bucket.perUnit;

      if (noShare) {
        // Single flat-price animal (chicken/eggs/cuts) — hide share step
        if (shareStep) shareStep.classList.add("is-hidden");
        var priceText = bucket.priceLow === bucket.priceHigh
          ? fmtMoney(bucket.priceLow) + bucket.perUnit
          : fmtMoney(bucket.priceLow) + "–" + fmtMoney(bucket.priceHigh) + bucket.perUnit;
        priceEl.textContent = priceText;
        if (subEl) {
          subEl.innerHTML = bucket.yield +
            ' &middot; <span class="calc-pickup-pill" style="margin-left:6px;">📍 Ranch pickup only</span>';
        }
        if (interestEl) interestEl.value = bucket.interest;
        flashPrice();
        return;
      }

      // Share-based animal (beef/pork/lamb) — show share step
      if (shareStep) shareStep.classList.remove("is-hidden");
      if (shareNote) shareNote.textContent = SHARE_NOTES[state.animal] || "";

      // Pork/lamb: no quarter — disable + auto-snap
      for (var i = 0; i < sharePills.length; i++) {
        var size = sharePills[i].getAttribute("data-share");
        if (size === "quarter" && state.animal !== "beef") {
          sharePills[i].setAttribute("disabled", "disabled");
          if (state.share === "quarter") {
            state.share = "half";
            setActive(sharePills, "data-share", "half");
          }
        } else {
          sharePills[i].removeAttribute("disabled");
        }
      }

      var data = bucket[state.share] || bucket.half || bucket.whole;
      if (!data) return;

      priceEl.textContent = fmtMoney(data.priceLow) + " – " + fmtMoney(data.priceHigh);
      if (subEl) {
        subEl.innerHTML = "About " + data.yield + " cut and wrapped" +
          ' &middot; <span class="calc-pickup-pill" style="margin-left:6px;">📍 Ranch pickup only</span>';
      }
      if (interestEl) interestEl.value = data.interest;
      flashPrice();
    }

    for (var i = 0; i < animalPills.length; i++) {
      (function (pill) {
        pill.addEventListener("click", function () {
          state.animal = pill.getAttribute("data-animal");
          setActive(animalPills, "data-animal", state.animal);
          render();
        });
      })(animalPills[i]);
    }

    for (var j = 0; j < sharePills.length; j++) {
      (function (pill) {
        pill.addEventListener("click", function () {
          if (pill.hasAttribute("disabled")) return;
          state.share = pill.getAttribute("data-share");
          setActive(sharePills, "data-share", state.share);
          render();
        });
      })(sharePills[j]);
    }

    render();
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

/* ----------------------------------------------------------------------
   COUNTER ANIMATION — count up on scroll into view
   Targets: .num[data-count-to]  (optional data-suffix)
   ---------------------------------------------------------------------- */
(function () {
  var nodes = document.querySelectorAll(".num[data-count-to]");
  if (!nodes.length) return;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animate(node) {
    var target = parseFloat(node.getAttribute("data-count-to")) || 0;
    var suffix = node.getAttribute("data-suffix") || "";
    var duration = 1600;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var elapsed = ts - start;
      var p = Math.min(elapsed / duration, 1);
      var eased = easeOutCubic(p);
      var current = Math.round(target * eased);
      node.textContent = current + suffix;
      if (p < 1) requestAnimationFrame(step);
      else node.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  if (!("IntersectionObserver" in window)) {
    nodes.forEach(function (n) {
      n.textContent = n.getAttribute("data-count-to") + (n.getAttribute("data-suffix") || "");
    });
    return;
  }

  var seen = new WeakSet();
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !seen.has(e.target)) {
        seen.add(e.target);
        animate(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });

  nodes.forEach(function (n) { io.observe(n); });
})();

/* ----------------------------------------------------------------------
   LIVE MENU FETCH — pulls freezer items from the admin-edited DB row
   on page load, replaces the hardcoded HTML fallback. If the API is
   slow/down, the original HTML stays visible. 60s response cache.
   ---------------------------------------------------------------------- */
(function () {
  var list = document.querySelector(".freezer-list");
  if (!list) return;

  var STATUS_LABEL = { available: "Available", low: "Low Stock", gone: "Gone" };

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function render(items) {
    if (!Array.isArray(items) || items.length === 0) return;
    var html = items
      .map(function (it) {
        var status = STATUS_LABEL[it.status] || "Available";
        var statusCls = it.status || "available";
        var nameSafe = escapeHtml(it.name);
        var priceSafe = escapeHtml(it.price);
        var noteSafe = escapeHtml(it.note || "call to confirm");
        return (
          '<li class="freezer-item">' +
          '<span><span class="freezer-name">' + nameSafe + "</span>" +
          '<span class="freezer-price">' + priceSafe +
          ' &middot; ' + noteSafe + "</span></span>" +
          '<span class="freezer-badge ' + statusCls + '">' + status + "</span>" +
          "</li>"
        );
      })
      .join("");
    list.innerHTML = html;
  }

  // 4-second timeout — if API is slow, leave the static fallback visible
  var ctrl = new AbortController();
  var timeout = setTimeout(function () { ctrl.abort(); }, 4000);

  fetch("/api/clients/kr-ranches/menu/public", {
    signal: ctrl.signal,
    cache: "no-cache",
  })
    .then(function (r) {
      clearTimeout(timeout);
      if (!r.ok) throw new Error("api_" + r.status);
      return r.json();
    })
    .then(function (j) {
      if (j && j.ok && Array.isArray(j.items)) render(j.items);
    })
    .catch(function () {
      // Silent fail — static fallback in HTML stays visible
    });
})();

/* ----------------------------------------------------------------------
   FREEZER WAITLIST FORM — captures email when an item is gone-but-coming
   POSTs to /api/clients/kr-ranches/waitlist. Shows inline success/error.
   ---------------------------------------------------------------------- */
(function () {
  var form = document.getElementById("krWaitlistForm");
  if (!form) return;
  var input = form.querySelector('input[type="email"]');
  var btn = form.querySelector(".waitlist-btn");
  var msg = form.querySelector(".waitlist-msg");
  var label = form.querySelector(".waitlist-btn-label");
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setMsg(text, kind) {
    msg.textContent = text;
    msg.className = "waitlist-msg show " + (kind || "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = (input.value || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      setMsg("Please enter a valid email.", "error");
      input.focus();
      return;
    }
    btn.disabled = true;
    label.textContent = "Adding…";
    setMsg("", "");

    fetch("/api/clients/kr-ranches/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email }),
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j && res.j.ok) {
          form.classList.add("success");
          if (res.j.already) {
            setMsg("You're already on the list — we'll be in touch.", "success");
          } else {
            setMsg("You're on the list. We'll text when fresh meat hits the freezer.", "success");
          }
        } else {
          throw new Error("save_failed");
        }
      })
      .catch(function () {
        btn.disabled = false;
        label.textContent = "Notify me";
        setMsg("Something went wrong — try again or call us.", "error");
      });
  });
})();
