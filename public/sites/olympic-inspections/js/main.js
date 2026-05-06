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
    initSlotPicker();
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

  // ---- SLOT PICKER (fetches real available slots from API) ----
  function initSlotPicker() {
    var picker = document.getElementById("slotPicker");
    var hiddenInput = document.getElementById("bookSlotId");
    if (!picker) return;

    function setStatus(msg, kind) {
      picker.innerHTML = '<div class="slot-picker-status">' + msg + "</div>";
      picker.setAttribute("data-state", kind || "loading");
    }

    function setEmpty() {
      picker.innerHTML =
        '<div class="slot-picker-empty">' +
          '<strong>No open slots showing right now.</strong>' +
          'Submit your details below and we will reach out with the next available time.' +
        "</div>";
      picker.setAttribute("data-state", "empty");
    }

    function groupByDay(slots) {
      var groups = {};
      var order = [];
      slots.forEach(function (s) {
        var d = new Date(s.start_at);
        var key = d.toISOString().slice(0, 10);
        if (!groups[key]) {
          groups[key] = { date: d, slots: [] };
          order.push(key);
        }
        groups[key].slots.push(s);
      });
      return order.map(function (k) { return groups[k]; });
    }

    function fmtTime(d) {
      return d.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    function fmtDay(d) {
      return d.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }

    function render(slots) {
      if (!slots || slots.length === 0) {
        setEmpty();
        return;
      }
      picker.setAttribute("data-state", "ready");
      var days = groupByDay(slots);
      var html = "";
      days.forEach(function (g) {
        html += '<div class="slot-picker-day">';
        html += '<span class="slot-picker-day-label">' + fmtDay(g.date) + "</span>";
        html += '<div class="slot-picker-times">';
        g.slots.forEach(function (s) {
          var start = new Date(s.start_at);
          var end = new Date(s.end_at);
          html +=
            '<button type="button" class="slot-pill" data-slot-id="' + s.id + '">' +
              fmtTime(start) + " – " + fmtTime(end) +
            "</button>";
        });
        html += "</div></div>";
      });
      picker.innerHTML = html;

      // Wire selection
      var pills = picker.querySelectorAll(".slot-pill");
      for (var i = 0; i < pills.length; i++) {
        pills[i].addEventListener("click", function () {
          for (var k = 0; k < pills.length; k++) pills[k].classList.remove("is-selected");
          this.classList.add("is-selected");
          if (hiddenInput) hiddenInput.value = this.getAttribute("data-slot-id") || "";
        });
      }
    }

    setStatus("Loading available slots…", "loading");

    fetch("/api/clients/olympic-inspections/slots/public", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("api_" + r.status);
        return r.json();
      })
      .then(function (j) {
        if (j && j.ok) render(j.slots || []);
        else setEmpty();
      })
      .catch(function () {
        setEmpty();
      });
  }

  // ---- BOOKING FORM ----
  function initBookingForm() {
    var form = document.getElementById("bookForm");
    var success = document.getElementById("bookSuccess");
    if (!form) return;

    // Native OIT booking endpoint — atomically claims the slot + creates booking
    var endpoint = "/api/clients/olympic-inspections/bookings";

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var btn = form.querySelector(".book-submit");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending…";
      }

      var fd = new FormData(form);
      var slotId = fd.get("slotId") || null;
      var estimateVal = (fd.get("estimate") || "").toString();
      // estimateVal is "low-high" string from calculator; split for API
      var estimateLow = null, estimateHigh = null;
      if (estimateVal && estimateVal !== "custom") {
        var parts = estimateVal.split("-");
        if (parts.length === 2) {
          estimateLow = parseInt(parts[0], 10);
          estimateHigh = parseInt(parts[1], 10);
          if (isNaN(estimateLow)) estimateLow = null;
          if (isNaN(estimateHigh)) estimateHigh = null;
        }
      }

      var payload = {
        slotId: slotId || null,
        name: (fd.get("name") || "").toString(),
        phone: (fd.get("phone") || "").toString(),
        email: (fd.get("email") || "").toString(),
        address: (fd.get("address") || "").toString(),
        propertySize: (fd.get("propertySize") || "").toString(),
        addons: (fd.get("addons") || "").toString(),
        estimateLow: estimateLow,
        estimateHigh: estimateHigh,
        notes: (fd.get("notes") || "").toString(),
      };

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json().then(function (j) { return { ok: r.ok, status: r.status, body: j }; });
        })
        .then(function (res) {
          if (res.ok && res.body && res.body.ok) {
            form.style.display = "none";
            if (success) success.classList.add("show");
          } else if (res.status === 409) {
            // Slot got claimed by someone else — refresh picker
            if (btn) {
              btn.disabled = false;
              btn.textContent = "Request my inspection";
            }
            alert(
              (res.body && res.body.message) ||
                "That slot was just booked by someone else. Please pick another time."
            );
            initSlotPicker();
          } else {
            throw new Error("save_failed");
          }
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
