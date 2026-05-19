/* SCWIBGA · main.js
   Mobile drawer toggle · scroll-reveal animations · footer year. */

(function () {
  // Mobile drawer
  const burger = document.getElementById("hamburgerBtn");
  const drawer = document.getElementById("mobileDrawer");
  const close = document.getElementById("mobileClose");
  if (burger && drawer) {
    burger.addEventListener("click", () => drawer.classList.add("is-open"));
  }
  if (close && drawer) {
    close.addEventListener("click", () => drawer.classList.remove("is-open"));
  }
  if (drawer) {
    drawer.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => drawer.classList.remove("is-open")),
    );
  }

  // Footer year
  const yr = document.getElementById("year");
  if (yr) yr.textContent = String(new Date().getFullYear());

  // Scroll reveal
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
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
