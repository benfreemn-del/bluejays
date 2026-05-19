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
    initReviewsCarousel();
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
  // Pricing model (Ben spec 2026-05-09):
  //   · Property base: $150 for ≤ 1500 sqft, +$50 per 500 sqft after
  //     (so 2000=$200, 2500=$250, 3000=$300, 3500=$350, 4000=$400,
  //     4500=$450, 5000=$500). Over 5000 = custom quote (book a call).
  //   · Air sample: FIRST sample = $250 and INCLUDES the outdoor control
  //     sample (required for any indoor-vs-outdoor comparison). Each
  //     additional air sample = $100.
  //   · Surface sample: $100 each (no bundled extras).
  //
  // Removed 2026-05-09 (Ben spec):
  //   · 24-hr rush — can't reliably deliver, removed from offer
  //   · Thermal/infrared scan — included in every base inspection,
  //     not a paid add-on. Mentioned in the Process copy instead.
  //
  // The pricing math runs in priceForSqft() + addonsTotal() so future
  // changes only edit two helpers.

  function fmtMoney(n) { return "$" + n.toLocaleString("en-US"); }

  function priceForSqft(sqft) {
    if (sqft >= 5500) return null; // custom quote
    if (sqft <= 1500) return 150;
    var increments = Math.ceil((sqft - 1500) / 500);
    return 150 + increments * 50;
  }

  function priceForAirSamples(qty) {
    if (qty <= 0) return 0;
    // first one bundles outdoor control — $250 flat
    if (qty === 1) return 250;
    return 250 + (qty - 1) * 100;
  }

  function sizeLabel(sqft) {
    if (sqft >= 5500) return "Over 5,000 sqft (custom)";
    return sqft.toLocaleString("en-US") + " sqft";
  }

  function initCalculator() {
    var sizeSlider = document.getElementById("calcSqft");
    var sizeReadout = document.getElementById("calcSqftReadout");
    var sizeOverBtn = document.getElementById("calcSizeOver5000");
    var addons = document.querySelectorAll('.calc-addon input[type="checkbox"]');
    var totalEl = document.getElementById("calcTotal");
    var breakdownEl = document.getElementById("calcBreakdown");
    var bookCta = document.getElementById("calcBookCta");
    if (!sizeSlider || !totalEl) return;

    var bookSize = document.getElementById("bookSize");
    var bookEstimate = document.getElementById("bookEstimate");
    var bookAddonsField = document.getElementById("bookAddons");
    var bookSummarySize = document.getElementById("bookSummarySize");
    var bookSummaryPrice = document.getElementById("bookSummaryPrice");
    var bookSummaryAddons = document.getElementById("bookSummaryAddons");

    var state = {
      // Default 1500 sqft → $150 entry-point. Slider is in 100-sqft steps
      // but the price formula floors to the next 500-sqft increment so
      // the user sees clean $X0 numbers as they drag.
      sqft: 1500,
      customQuote: false,
      addonChecked: { airSample: false, surfaceSample: false },
      addonQty: { airSample: 1, surfaceSample: 1 },
    };

    function flash() {
      totalEl.classList.remove("flash");
      void totalEl.offsetWidth;
      totalEl.classList.add("flash");
    }

    function escHtml(s) {
      return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }

    function render() {
      var base = state.customQuote ? null : priceForSqft(state.sqft);
      var addonTotal = 0;
      var breakdownParts = [];
      var summaryRows = [];

      // Air sample (first $250 incl. outdoor control, then $100 each)
      if (state.addonChecked.airSample) {
        var aQty = state.addonQty.airSample || 1;
        var aSub = priceForAirSamples(aQty);
        addonTotal += aSub;
        var aLabel = aQty === 1
          ? "1× air sample (incl. outdoor control)"
          : aQty + "× air sample (1 incl. outdoor control)";
        breakdownParts.push(aLabel);
        summaryRows.push({ label: aLabel, price: "+" + fmtMoney(aSub) });
      }

      // Surface sample (flat $100 each)
      if (state.addonChecked.surfaceSample) {
        var sQty = state.addonQty.surfaceSample || 1;
        var sSub = sQty * 100;
        addonTotal += sSub;
        var sLabel = sQty + "× surface sample";
        breakdownParts.push(sLabel);
        summaryRows.push({ label: sLabel, price: "+" + fmtMoney(sSub) });
      }

      // Render total
      if (base === null) {
        totalEl.textContent = "Custom quote";
        if (breakdownEl) breakdownEl.textContent = "Larger properties get a written estimate after a quick call.";
      } else {
        var total = base + addonTotal;
        totalEl.textContent = fmtMoney(total);
        var bd = "Base inspection";
        if (breakdownParts.length > 0) bd += " + " + breakdownParts.join(", ");
        bd += " · written lab report included";
        if (breakdownEl) breakdownEl.textContent = bd;
      }
      flash();

      // Sync hidden booking form fields
      if (bookSize) bookSize.value = state.customQuote ? "over5000" : String(state.sqft);
      if (bookEstimate) {
        bookEstimate.value = base === null ? "custom" : String(base + addonTotal);
      }
      if (bookAddonsField) bookAddonsField.value = breakdownParts.join(", ") || "none";

      // Sync booking summary card
      if (bookSummarySize) bookSummarySize.textContent = sizeLabel(state.customQuote ? 5500 : state.sqft);
      if (bookSummaryPrice) {
        bookSummaryPrice.textContent = base === null ? "Custom quote" : fmtMoney(base + addonTotal);
      }
      if (bookSummaryAddons) {
        if (summaryRows.length > 0) {
          bookSummaryAddons.style.display = "block";
          var html = '<div class="summary-divider"></div>';
          summaryRows.forEach(function (r) {
            html += '<div class="summary-line">' +
                      '<span class="summary-label">' + escHtml(r.label) + '</span>' +
                      '<span class="summary-price">' + escHtml(r.price) + '</span>' +
                    '</div>';
          });
          bookSummaryAddons.innerHTML = html;
        } else {
          bookSummaryAddons.style.display = "none";
        }
      }

      // Live readout next to the slider
      if (sizeReadout) {
        if (state.customQuote) {
          sizeReadout.textContent = "Over 5,000 sqft · custom quote";
        } else {
          sizeReadout.textContent = sizeLabel(state.sqft) + " · " + fmtMoney(priceForSqft(state.sqft));
        }
      }
      if (sizeOverBtn) {
        sizeOverBtn.classList.toggle("is-active", !!state.customQuote);
      }
      if (sizeSlider) {
        sizeSlider.disabled = !!state.customQuote;
        // Paint the filled portion of the slider track. Range 500-5000.
        var pct = state.customQuote ? 100 : ((state.sqft - 500) / 4500) * 100;
        sizeSlider.style.setProperty("--pct", pct + "%");
      }
    }

    // Wire slider
    sizeSlider.addEventListener("input", function () {
      var v = parseInt(sizeSlider.value, 10) || 1500;
      // snap to 100-sqft steps for clean readout, formula handles the rest
      state.sqft = Math.max(500, Math.min(5000, Math.round(v / 100) * 100));
      state.customQuote = false;
      render();
    });

    // Wire "Over 5,000" toggle
    if (sizeOverBtn) {
      sizeOverBtn.addEventListener("click", function () {
        state.customQuote = !state.customQuote;
        render();
      });
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

    // Wire the "Suggest a different time" toggle (custom slot input)
    var toggle = document.getElementById("slotCustomToggle");
    var custom = document.getElementById("slotCustom");
    if (toggle && custom) {
      toggle.addEventListener("click", function () {
        var willOpen = custom.hasAttribute("hidden");
        if (willOpen) {
          custom.removeAttribute("hidden");
          toggle.classList.add("is-open");
          // Clear any selected preset slot since user is suggesting custom
          if (hiddenInput) hiddenInput.value = "";
          var sel = picker.querySelectorAll(".slot-pill.is-selected");
          for (var i = 0; i < sel.length; i++) sel[i].classList.remove("is-selected");
        } else {
          custom.setAttribute("hidden", "");
          toggle.classList.remove("is-open");
        }
      });
      // If user clicks a preset slot pill while custom is open, auto-collapse
      picker.addEventListener("click", function (e) {
        var t = e.target;
        if (t && t.classList && t.classList.contains("slot-pill")) {
          if (!custom.hasAttribute("hidden")) {
            custom.setAttribute("hidden", "");
            toggle.classList.remove("is-open");
            // Clear custom inputs
            var cd = document.getElementById("customDate");
            var ct = document.getElementById("customTime");
            if (cd) cd.value = "";
            if (ct) ct.value = "";
          }
        }
      });
    }
  }

  // ---- BOOKING FORM ----
  function initBookingForm() {
    var form = document.getElementById("bookForm");
    var success = document.getElementById("bookSuccess");
    if (!form) return;

    // Native OIT booking endpoint — atomically claims the slot + creates booking
    var endpoint = "/api/clients/olympic-inspections/bookings";

    // ── Validation helpers ─────────────────────────────────────────────
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Phone: at least 10 digits when stripped of formatting.
    var PHONE_RE = /^\+?[\d\s().\-]{10,}$/;

    function setFieldError(inputId, errorId, message) {
      var input = document.getElementById(inputId);
      var err = document.getElementById(errorId);
      if (input) input.classList.add("is-invalid");
      if (err) {
        err.textContent = message;
        err.hidden = false;
      }
    }
    function clearFieldError(inputId, errorId) {
      var input = document.getElementById(inputId);
      var err = document.getElementById(errorId);
      if (input) input.classList.remove("is-invalid");
      if (err) {
        err.textContent = "";
        err.hidden = true;
      }
    }
    function showBanner(message) {
      var b = document.getElementById("bookFormError");
      if (!b) return;
      b.textContent = message;
      b.hidden = false;
    }
    function hideBanner() {
      var b = document.getElementById("bookFormError");
      if (!b) return;
      b.textContent = "";
      b.hidden = true;
    }

    // ── Submit-button gate ────────────────────────────────────────────
    // Submit stays disabled until name + phone + email all pass validation.
    // Re-checked live on every keystroke so the button enables the moment
    // the form is complete.
    var submitBtn = form.querySelector(".book-submit");

    function isFormValid() {
      var n = (form.elements.name.value || "").trim();
      var p = (form.elements.phone.value || "").trim();
      var em = (form.elements.email.value || "").trim();
      return n.length >= 2 && PHONE_RE.test(p) && EMAIL_RE.test(em);
    }
    function refreshSubmitState() {
      if (!submitBtn) return;
      submitBtn.disabled = !isFormValid();
    }
    refreshSubmitState();

    // Live-clear field errors + refresh submit button as the user types.
    [
      ["bookName", "bookNameError"],
      ["bookPhone", "bookPhoneError"],
      ["bookEmail", "bookEmailError"],
    ].forEach(function (pair) {
      var input = document.getElementById(pair[0]);
      if (input) {
        input.addEventListener("input", function () {
          clearFieldError(pair[0], pair[1]);
          refreshSubmitState();
        });
        input.addEventListener("blur", refreshSubmitState);
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideBanner();

      // ── Client-side validation ──
      var name = (form.elements.name.value || "").trim();
      var phone = (form.elements.phone.value || "").trim();
      var email = (form.elements.email.value || "").trim();
      var hasError = false;

      clearFieldError("bookName", "bookNameError");
      clearFieldError("bookPhone", "bookPhoneError");
      clearFieldError("bookEmail", "bookEmailError");

      if (name.length < 2) {
        setFieldError("bookName", "bookNameError", "Please enter your name.");
        hasError = true;
      }
      if (!phone) {
        setFieldError("bookPhone", "bookPhoneError", "Phone is required.");
        hasError = true;
      } else if (!PHONE_RE.test(phone)) {
        setFieldError("bookPhone", "bookPhoneError", "Please enter a valid phone number (at least 10 digits).");
        hasError = true;
      }
      if (!email) {
        setFieldError("bookEmail", "bookEmailError", "Email is required.");
        hasError = true;
      } else if (!EMAIL_RE.test(email)) {
        setFieldError("bookEmail", "bookEmailError", "Please enter a valid email address.");
        hasError = true;
      }

      if (hasError) {
        // Focus the first invalid field
        var firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

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

      // If customer used the "Suggest a different time" path, prepend that
      // request to their notes field so it lands in the admin booking detail.
      var userNotes = (fd.get("notes") || "").toString();
      var customDate = (fd.get("customDate") || "").toString();
      var customTime = (fd.get("customTime") || "").toString();
      var combinedNotes = userNotes;
      if (!slotId && (customDate || customTime)) {
        var requested = "Requested time: " +
          (customDate || "(no date)") +
          (customTime ? " at " + customTime : "");
        combinedNotes = requested + (userNotes ? "\n\n" + userNotes : "");
      }

      var payload = {
        slotId: slotId || null,
        name: name,
        phone: phone,
        email: email,
        address: (fd.get("address") || "").toString(),
        propertySize: (fd.get("propertySize") || "").toString(),
        addons: (fd.get("addons") || "").toString(),
        estimateLow: estimateLow,
        estimateHigh: estimateHigh,
        notes: combinedNotes,
      };

      function resetButton() {
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Request my inspection";
        }
      }

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.text().then(function (text) {
            var body = null;
            try { body = text ? JSON.parse(text) : null; } catch (_e) { body = null; }
            return { ok: r.ok, status: r.status, body: body, raw: text };
          });
        })
        .then(function (res) {
          if (res.ok && res.body && res.body.ok) {
            form.style.display = "none";
            if (success) success.classList.add("show");
            return;
          }
          if (res.status === 409) {
            // Slot got claimed by someone else — refresh picker
            resetButton();
            showBanner(
              (res.body && res.body.message) ||
                "That slot was just booked by someone else. Please pick another time."
            );
            initSlotPicker();
            return;
          }
          // Surface the actual error message + status so failures are diagnosable.
          var serverError = (res.body && (res.body.message || res.body.error)) || "";
          var msg = "We couldn't submit your request";
          if (res.status) msg += " (status " + res.status + ")";
          if (serverError) msg += ": " + serverError;
          msg += ". Please try again or call (360) 670-3367.";
          console.error("[oit-booking] submit failed:", res);
          resetButton();
          showBanner(msg);
        })
        .catch(function (err) {
          console.error("[oit-booking] network error:", err);
          resetButton();
          showBanner(
            "Network error — couldn't reach the booking server. Please check your connection or call (360) 670-3367."
          );
        });
    });
  }

  // ---- YEAR STAMP ----
  function initYearStamp() {
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  // ─── LIVE GOOGLE REVIEWS CAROUSEL (added 2026-05-10) ────────────────────
  // Fetches reviews from /api/clients/olympic-inspections/google-reviews
  // (cached server-side 1hr). Renders cards into the carousel, wires
  // prev/next + dots + autoplay (6s) + keyboard nav. Pauses on hover.
  // Graceful empty state when API unconfigured or zero reviews.
  function initReviewsCarousel() {
    var loading = document.getElementById("reviewsLoading");
    var track = document.getElementById("reviewsTrack");
    var prev = document.getElementById("reviewsPrev");
    var next = document.getElementById("reviewsNext");
    var dots = document.getElementById("reviewsDots");
    var summary = document.getElementById("reviewsRatingSummary");
    var empty = document.getElementById("reviewsEmpty");
    var subtitle = document.getElementById("testimonialsSubtitle");
    if (!track) return;

    fetch("/api/clients/olympic-inspections/google-reviews")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (loading) loading.hidden = true;
        var reviews = (data && data.reviews) || [];
        if (!reviews.length) {
          if (empty) empty.hidden = false;
          if (subtitle && data && !data.configured) {
            // Hide the "Live Google Reviews" subtitle when API isn't
            // configured yet — don't promise live data we can't deliver.
            subtitle.hidden = true;
          }
          return;
        }
        renderCards(track, reviews);
        renderDots(dots, reviews.length);
        renderSummary(summary, data);
        if (prev) prev.hidden = false;
        if (next) next.hidden = false;
        if (dots) dots.hidden = false;
        if (summary) summary.hidden = false;
        track.hidden = false;
        wireCarousel(track, prev, next, dots, reviews.length);
      })
      .catch(function (err) {
        if (loading) loading.hidden = true;
        if (empty) empty.hidden = false;
        console.warn("[oit] reviews fetch failed:", err);
      });
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderCards(track, reviews) {
    track.innerHTML = reviews
      .map(function (r) {
        var initial = (r.author || "?").trim().charAt(0).toUpperCase() || "?";
        var avatar = r.profilePhoto
          ? '<img src="' + escapeHtml(r.profilePhoto) + '" alt="" loading="lazy" referrerpolicy="no-referrer" />'
          : escapeHtml(initial);
        var stars = "★★★★★".slice(0, Math.max(1, Math.min(5, Math.round(r.rating || 5))));
        return (
          '<article class="testimonial-card" role="group" aria-roledescription="slide">' +
            '<div class="testimonial-card-header">' +
              '<div class="testimonial-avatar">' + avatar + '</div>' +
              '<div class="testimonial-meta">' +
                '<span class="testimonial-meta-author">' + escapeHtml(r.author) + '</span>' +
                '<span class="testimonial-meta-time">' + escapeHtml(r.relativeTime || "") + '</span>' +
              '</div>' +
              '<span class="testimonial-google-badge" title="Verified Google review">G&nbsp;Review</span>' +
            '</div>' +
            '<p class="testimonial-stars" aria-label="' + r.rating + ' out of 5 stars">' + stars + '</p>' +
            '<blockquote>' + escapeHtml(r.text) + '</blockquote>' +
          '</article>'
        );
      })
      .join("");
  }

  function renderDots(dots, count) {
    if (!dots) return;
    dots.innerHTML = "";
    for (var i = 0; i < count; i++) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "testimonial-dot";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Review " + (i + 1) + " of " + count);
      b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      b.dataset.index = String(i);
      dots.appendChild(b);
    }
  }

  function renderSummary(summary, data) {
    if (!summary || !data || data.rating == null) {
      if (summary) summary.hidden = true;
      return;
    }
    var starsEl = summary.querySelector(".rating-stars");
    var numEl = summary.querySelector(".rating-number");
    var countEl = summary.querySelector(".rating-count");
    var linkEl = summary.querySelector(".rating-google-link");
    if (starsEl) starsEl.textContent = "★★★★★".slice(0, Math.round(data.rating));
    if (numEl) numEl.textContent = Number(data.rating).toFixed(1);
    if (countEl) countEl.textContent = "(" + (data.reviewCount || 0) + " reviews)";
    if (linkEl && data.placeId) {
      linkEl.href = "https://search.google.com/local/reviews?placeid=" +
        encodeURIComponent(data.placeId);
    } else if (linkEl) {
      linkEl.hidden = true;
    }
  }

  function wireCarousel(track, prev, next, dots, count) {
    var current = 0;
    var autoplayMs = 6000;
    var autoplayTimer = null;

    function go(index) {
      current = (index + count) % count;
      var card = track.children[current];
      if (card) {
        card.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
      }
      if (dots) {
        var allDots = dots.querySelectorAll(".testimonial-dot");
        for (var i = 0; i < allDots.length; i++) {
          allDots[i].setAttribute("aria-selected", i === current ? "true" : "false");
        }
      }
    }
    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(function () { go(current + 1); }, autoplayMs);
    }
    function stopAutoplay() {
      if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
    }

    if (prev) prev.addEventListener("click", function () { go(current - 1); stopAutoplay(); });
    if (next) next.addEventListener("click", function () { go(current + 1); stopAutoplay(); });
    if (dots) {
      dots.addEventListener("click", function (e) {
        var btn = e.target.closest(".testimonial-dot");
        if (!btn) return;
        go(parseInt(btn.dataset.index, 10));
        stopAutoplay();
      });
    }

    var carousel = track.parentElement;
    if (carousel) {
      carousel.addEventListener("mouseenter", stopAutoplay);
      carousel.addEventListener("mouseleave", startAutoplay);
      carousel.addEventListener("focusin", stopAutoplay);
      carousel.addEventListener("focusout", startAutoplay);
    }

    track.tabIndex = 0;
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { go(current - 1); stopAutoplay(); }
      else if (e.key === "ArrowRight") { go(current + 1); stopAutoplay(); }
    });

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    startAutoplay();
  }

})();


/* ─── Back-to-top button: show after scrolling past 1/3 of the page ─── */
(function () {
  var btn = document.getElementById('back-to-top');
  if (!btn) return;
  function update() {
    var doc = document.documentElement;
    var total = doc.scrollHeight - window.innerHeight;
    if (total <= 0) {
      btn.classList.remove('is-visible');
      return;
    }
    if (window.scrollY > total * 0.33) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  }
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
