/* ==========================================================================
   Pulse — Medical template scripts (vanilla JS, zero dependencies)
   Each feature is one guard-claused init.
   ========================================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------- sticky header shadow --------------------- */
  function initHeader() {
    var header = document.getElementById("siteHeader");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --------------------------- mobile nav --------------------------- */
  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var panel = document.getElementById("mobileNav");
    if (!toggle || !panel) return;

    var open = function (state) {
      if (state) {
        panel.hidden = false;
      } else {
        panel.hidden = true;
      }
      toggle.setAttribute("aria-expanded", state ? "true" : "false");
      toggle.setAttribute("aria-label", state ? "Close menu" : "Open menu");
    };

    toggle.addEventListener("click", function () {
      open(panel.hidden);
    });

    // Close when a link is tapped
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) open(false);
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) {
        open(false);
        toggle.focus();
      }
    });

    // Reset when resizing up to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth > 992 && !panel.hidden) open(false);
    });
  }

  /* ------------------------ animated counters ----------------------- */
  function initCounters() {
    var nums = Array.prototype.slice.call(document.querySelectorAll(".stat-num[data-count]"));
    if (!nums.length) return;

    var run = function (el) {
      var target = parseFloat(el.getAttribute("data-count")) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      if (prefersReduced) { el.textContent = target + suffix; return; }
      var start = null;
      var dur = 1500;
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) {
      nums.forEach(run);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* --------------------------- booking form ------------------------- */
  function initBookingForm() {
    var form = document.getElementById("bookForm");
    if (!form) return;
    var status = document.getElementById("bookStatus");
    var dateInput = document.getElementById("bk-date");

    // Prevent past dates
    if (dateInput) {
      var today = new Date();
      var iso = today.toISOString().split("T")[0];
      dateInput.setAttribute("min", iso);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!status) return;

      var required = form.querySelectorAll("[required]");
      var ok = true;
      required.forEach(function (field) {
        if (!field.value || (field.type === "email" && field.value.indexOf("@") === -1)) {
          ok = false;
        }
      });

      if (!ok) {
        status.textContent = "Please fill in your name, phone, email, department and date.";
        status.className = "form-status is-error";
        return;
      }

      var name = (document.getElementById("bk-name") || {}).value || "there";
      var dept = (document.getElementById("bk-dept") || {}).value || "your visit";
      status.textContent = "Thanks, " + name.split(" ")[0] + "! Your " + dept +
        " request is in — we'll text your confirmed time within one business hour.";
      status.className = "form-status is-success";
      form.reset();
    });
  }

  /* ------------------------ testimonial slider ---------------------- */
  function initSlider() {
    var root = document.querySelector("[data-slider]");
    if (!root) return;
    var track = root.querySelector(".slider-track");
    var slides = Array.prototype.slice.call(root.querySelectorAll(".story"));
    var dotsWrap = root.querySelector(".slider-dots");
    var prev = root.querySelector("[data-prev]");
    var next = root.querySelector("[data-next]");
    if (!track || slides.length < 2) return;

    var index = 0;
    var timer = null;

    // Build dots
    var dots = [];
    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", "Go to story " + (i + 1));
        b.addEventListener("click", function () { go(i, true); });
        dotsWrap.appendChild(b);
        dots.push(b);
      });
    }

    function render() {
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      slides.forEach(function (s, i) {
        s.setAttribute("aria-hidden", i === index ? "false" : "true");
      });
      dots.forEach(function (d, i) {
        d.setAttribute("aria-selected", i === index ? "true" : "false");
      });
    }

    function go(i, user) {
      index = (i + slides.length) % slides.length;
      render();
      if (user) restart();
    }

    if (prev) prev.addEventListener("click", function () { go(index - 1, true); });
    if (next) next.addEventListener("click", function () { go(index + 1, true); });

    function restart() {
      if (prefersReduced) return;
      stop();
      timer = window.setInterval(function () { go(index + 1, false); }, 6000);
    }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", restart);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", restart);

    render();
    restart();
  }

  /* ---------------------------- back to top ------------------------- */
  function initBackToTop() {
    var btn = document.getElementById("toTop");
    if (!btn) return;
    btn.hidden = false;
    var onScroll = function () {
      btn.classList.toggle("is-visible", window.scrollY > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  /* --------------------------- reveal on scroll --------------------- */
  function initReveal() {
    var targets = Array.prototype.slice.call(
      document.querySelectorAll(".dept-card, .doc-card, .why-list li, .info-card, .stat")
    );
    if (!targets.length) return;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("in"); });
      return;
    }
    targets.forEach(function (t, i) {
      t.classList.add("reveal");
      t.style.transitionDelay = (Math.min(i % 4, 3) * 70) + "ms";
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -30px 0px" });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ------------------------------ boot ------------------------------ */
  function boot() {
    initHeader();
    initMobileNav();
    initCounters();
    initBookingForm();
    initSlider();
    initBackToTop();
    initReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
