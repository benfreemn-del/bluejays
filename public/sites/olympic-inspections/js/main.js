/* ==========================================================================
   Olympic Inspections & Testing — main.js
   Cost calculator, booking form, FAQ, nav, reveal observer.
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initMobileDrawer();
    initRevealObserver();
    initFaqToggle();
    initCalculator();
    initBookingForm();
    initYearStamp();
  });

  // ---- NAV: scrolled state + smooth scroll ----
  function initNav() {
    var navbar = document.getElementById("navbar");
    if (!navbar) return;

    function onScroll() {
      if (window.scrollY > 24) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ---- MOBILE DRAWER ----
  function initMobileDrawer() {
    var btn = document.getElementById("hamburgerBtn");
    var drawer = document.getElementById("mobileDrawer");
    var close = document.getElementById("mobileClose");
    if (!btn || !drawer) return;

    btn.addEventListener("click", function () { drawer.classList.add("open"); });
    if (close) close.addEventListener("click", function () { drawer.classList.remove("open"); });
    var links = drawer.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function () { drawer.classList.remove("open"); });
    }
  }

  // ---- REVEAL ON SCROLL ----
  function initRevealObserver() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < els.length; i++) els[i].classList.add("in");
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    for (var k = 0; k < els.length; k++) io.observe(els[k]);
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
        for (var k = 0; k < items.length; k++) items[k].classList.remove("open");
        if (!open) item.classList.add("open");
      });
    }
  }

  // ---- COST CALCULATOR ----
  // Pricing matrix (Olympic Peninsula realistic mold-inspection rates).
  // Ben can tune these in one place — they're the only source of truth.
  var BASE_PRICES = {
    under1500:  { low: 295, high: 350, label: "Under 1,500 sqft" },
    "1500to3000": { low: 350, high: 425, label: "1,500–3,000 sqft" },
    "3000to5000": { low: 450, high: 575, label: "3,000–5,000 sqft" },
    over5000:   { low: null, high: null, label: "Over 5,000 sqft" }, // custom quote
  };

  function fmtMoney(n) { return "$" + n.toLocaleString("en-US"); }

  function initCalculator() {
    var sizePills = document.querySelectorAll('[data-group="size"] .calc-pill');
    var addons = document.querySelectorAll('.calc-addon input[type="checkbox"]');
    var qtyVals = document.querySelectorAll(".qty-val[data-qty-for]");
    var totalEl = document.getElementById("calcTotal");
    var breakdownEl = document.getElementById("calcBreakdown");
    var bookCta = document.getElementById("calcBookCta");
    if (!sizePills.length || !totalEl) return;

    var bookSize = document.getElementById("bookSize");
    var bookEstimate = document.getElementById("bookEstimate");
    var bookAddonsField = document.getElementById("bookAddons");
    var bookSummarySize = document.getElementById("bookSummarySize");
    var bookSummaryPrice = document.getElementById("bookSummaryPrice");
    var bookSummaryAddons = document.getElementById("bookSummaryAddons");

    var state = {
      size: "1500to3000",
      addonChecked: { airSample: false, surfaceSample: false, rush: false, thermal: false },
      addonQty: { airSample: 1, surfaceSample: 1, rush: 1, thermal: 1 },
    };

    function flash() {
      totalEl.classList.remove("flash");
      void totalEl.offsetWidth;
      totalEl.classList.add("flash");
    }

    function setActiveSize(value) {
      for (var i = 0; i < sizePills.length; i++) {
        if (sizePills[i].getAttribute("data-size") === value) sizePills[i].classList.add("is-active");
        else sizePills[i].classList.remove("is-active");
      }
    }

    function render() {
      var base = BASE_PRICES[state.size];
      var addonTotalLow = 0, addonTotalHigh = 0;
      var breakdownParts = [];
      var summaryAddonParts = [];

      // sample-based add-ons (per quantity)
      var samples = ["airSample", "surfaceSample"];
      samples.forEach(function (key) {
        if (state.addonChecked[key]) {
          var qty = state.addonQty[key] || 1;
          var unit = key === "airSample" ? 85 : 55;
          var sub = qty * unit;
          addonTotalLow += sub;
          addonTotalHigh += sub;
          var label = key === "airSample" ? "air sample" : "surface sample";
          breakdownParts.push(qty + "× " + label);
          summaryAddonParts.push(qty + "× " + label + " " + fmtMoney(sub));
        }
      });

      // Flat-fee add-ons
      if (state.addonChecked.rush) {
        addonTotalLow += 150; addonTotalHigh += 150;
        breakdownParts.push("24-hr rush");
        summaryAddonParts.push("Rush 24-hr +$150");
      }
      if (state.addonChecked.thermal) {
        addonTotalLow += 95; addonTotalHigh += 95;
        breakdownParts.push("thermal scan");
        summaryAddonParts.push("Thermal scan +$95");
      }

      // Render total
      if (base.low === null) {
        totalEl.textContent = "Custom quote";
        if (breakdownEl) breakdownEl.textContent = "Larger properties get a written estimate after a quick call.";
      } else {
        var totalLow = base.low + addonTotalLow;
        var totalHigh = base.high + addonTotalHigh;
        totalEl.textContent = fmtMoney(totalLow) + " – " + fmtMoney(totalHigh);
        var bd = "Base inspection";
        if (breakdownParts.length > 0) bd += " + " + breakdownParts.join(", ");
        bd += " · written lab report included";
        if (breakdownEl) breakdownEl.textContent = bd;
      }
      flash();

      // Sync hidden booking form fields
      if (bookSize) bookSize.value = state.size;
      if (bookEstimate && base.low !== null) {
        bookEstimate.value = String(base.low + addonTotalLow) + "-" + String(base.high + addonTotalHigh);
      } else if (bookEstimate) {
        bookEstimate.value = "custom";
      }
      if (bookAddonsField) bookAddonsField.value = breakdownParts.join(", ") || "none";

      // Sync booking summary card
      if (bookSummarySize) bookSummarySize.textContent = base.label;
      if (bookSummaryPrice) {
        bookSummaryPrice.textContent = base.low === null
          ? "Custom quote"
          : fmtMoney(base.low + addonTotalLow) + "–" + fmtMoney(base.high + addonTotalHigh);
      }
      if (bookSummaryAddons) {
        if (summaryAddonParts.length > 0) {
          bookSummaryAddons.style.display = "flex";
          bookSummaryAddons.innerHTML = "<span>" + summaryAddonParts.join(" · ") + "</span>";
        } else {
          bookSummaryAddons.style.display = "none";
        }
      }
    }

    // Wire size pills
    for (var i = 0; i < sizePills.length; i++) {
      (function (pill) {
        pill.addEventListener("click", function () {
          state.size = pill.getAttribute("data-size");
          setActiveSize(state.size);
          render();
        });
      })(sizePills[i]);
    }

    // Wire add-on checkboxes
    for (var j = 0; j < addons.length; j++) {
      (function (cb) {
        cb.addEventListener("change", function () {
          var key = cb.getAttribute("data-addon");
          state.addonChecked[key] = cb.checked;
          render();
        });
      })(addons[j]);
    }

    // Wire qty +/- buttons
    var qtyRows = document.querySelectorAll(".calc-addon-qty");
    for (var q = 0; q < qtyRows.length; q++) {
      (function (row) {
        var input = row.parentElement.querySelector('input[data-addon]');
        if (!input) return;
        var key = input.getAttribute("data-addon");
        if (!key || (key !== "airSample" && key !== "surfaceSample")) return;
        var dec = row.querySelector('[data-qty-action="dec"]');
        var inc = row.querySelector('[data-qty-action="inc"]');
        var val = row.querySelector(".qty-val");
        function update() {
          var v = state.addonQty[key];
          if (val) val.textContent = String(v);
          if (dec) dec.disabled = (v <= 1);
          if (inc) inc.disabled = (v >= 8);
        }
        if (dec) dec.addEventListener("click", function (e) {
          e.preventDefault(); e.stopPropagation();
          if (state.addonQty[key] > 1) state.addonQty[key]--;
          update();
          // auto-check the addon when user hits qty buttons
          if (!state.addonChecked[key]) {
            input.checked = true;
            state.addonChecked[key] = true;
          }
          render();
        });
        if (inc) inc.addEventListener("click", function (e) {
          e.preventDefault(); e.stopPropagation();
          if (state.addonQty[key] < 8) state.addonQty[key]++;
          update();
          if (!state.addonChecked[key]) {
            input.checked = true;
            state.addonChecked[key] = true;
          }
          render();
        });
        update();
      })(qtyRows[q]);
    }

    // CTA scrolls to booking — smooth scroll with offset
    if (bookCta) {
      bookCta.addEventListener("click", function (e) {
        e.preventDefault();
        var target = document.getElementById("book");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    render();
  }

  // ---- BOOKING FORM ----
  function initBookingForm() {
    var form = document.getElementById("bookForm");
    var success = document.getElementById("bookSuccess");
    if (!form) return;

    // Pine & Particle / OIT prospect ID — used to route inquiry to KR Ranches
    // contact-form endpoint until we wire up a dedicated booking system.
    // TODO Phase 2: replace with native /api/clients/olympic-inspections/booking
    var endpoint = "https://bluejayportfolio.com/api/contact-form/9de1d213-e0d0-492e-ba34-b0c874056b66";

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var btn = form.querySelector(".book-submit");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending…";
      }

      var fd = new FormData(form);
      var notesParts = [];
      var dateVal = fd.get("date") || "";
      var timeVal = fd.get("time") || "";
      var addressVal = fd.get("address") || "";
      var sizeVal = fd.get("propertySize") || "";
      var estimateVal = fd.get("estimate") || "";
      var addonsVal = fd.get("addons") || "";
      var userNotes = fd.get("notes") || "";

      if (sizeVal) notesParts.push("Property size: " + sizeVal);
      if (estimateVal) notesParts.push("Live estimate: $" + estimateVal);
      if (addonsVal && addonsVal !== "none") notesParts.push("Add-ons: " + addonsVal);
      if (dateVal) notesParts.push("Preferred date: " + dateVal);
      if (timeVal && timeVal !== "any") notesParts.push("Preferred time: " + timeVal);
      if (addressVal) notesParts.push("Property: " + addressVal);
      if (userNotes) notesParts.push("\nCustomer notes:\n" + userNotes);

      var payload = {
        name: fd.get("name") || "",
        phone: fd.get("phone") || "",
        email: fd.get("email") || "",
        service: "mold-inspection-booking",
        message: notesParts.join("\n"),
      };

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (r) { if (!r.ok) throw new Error("send_failed"); return r.json().catch(function () { return {}; }); })
        .then(function () {
          form.style.display = "none";
          if (success) success.classList.add("show");
        })
        .catch(function () {
          if (btn) {
            btn.disabled = false;
            btn.textContent = "Request my inspection";
          }
          alert("Something went wrong sending your request. Please call (360) 670-3367 directly or try again.");
        });
    });
  }

  // ---- YEAR STAMP ----
  function initYearStamp() {
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

})();
