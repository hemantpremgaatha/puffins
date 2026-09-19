/**
 * Standalone JS for landing.html — sticky nav active-link tracking, the
 * scroll-driven background photo sequence (stand-in for "background video"
 * using six owned product/lifestyle photos), scroll-reveal animation, and
 * the signup form's client-side validation. Deliberately separate from
 * assets/js/main.js so this page stays lightweight and independently
 * editable for campaign use.
 */
(function () {
  "use strict";

  var prefersReducedMotion = function () {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  document.addEventListener("DOMContentLoaded", function () {
    initStickyNav();
    initBgSequence();
    initScrollReveal();
    initStickyMobileCta();
    initSignupForm();
    initYear();
  });

  /* ---------------- Sticky nav: shadow on scroll + active section highlight ---------------- */
  function initStickyNav() {
    var nav = document.querySelector("[data-lp-nav]");
    if (!nav) return;
    var links = Array.prototype.slice.call(nav.querySelectorAll("a[href^='#']"));
    var sections = links
      .map(function (a) { return document.querySelector(a.getAttribute("href")); })
      .filter(Boolean);

    window.addEventListener("scroll", function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 12);
    }, { passive: true });

    if (!sections.length || !("IntersectionObserver" in window)) return;
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href")] = a; });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-active"); });
        var link = byId["#" + entry.target.id];
        if (link) link.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------------- Scroll-driven background photo sequence ----------------
     Six frames fixed behind the hero + value-prop + feature sections. As the
     visitor scrolls through that span, the active frame advances — a
     lightweight, dependency-free stand-in for a looping background video. */
  function initBgSequence() {
    var wrap = document.querySelector("[data-lp-bg]");
    if (!wrap) return;
    var frames = Array.prototype.slice.call(wrap.querySelectorAll(".lp-bg-frame"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-lp-bg-dots] span"));
    var track = document.querySelector("[data-lp-bg-track]");
    if (!frames.length || !track) return;

    if (prefersReducedMotion()) {
      frames[0].classList.add("is-active");
      if (dots[0]) dots[0].classList.add("is-active");
      return;
    }

    var dotsWrap = document.querySelector("[data-lp-bg-dots]");
    var ticking = false;
    function update() {
      ticking = false;
      var rect = track.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      var index = Math.min(frames.length - 1, Math.floor(progress * frames.length));

      frames.forEach(function (f, i) { f.classList.toggle("is-active", i === index); });
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === index); });

      // Fade the whole fixed background (and its progress dots) out once the
      // visitor scrolls past the sequence's track (into the pricing/
      // testimonials/signup section) so neither shows through solid-
      // background sections below.
      var pastTrack = rect.bottom <= window.innerHeight;
      wrap.style.opacity = pastTrack ? "0" : "1";
      if (dotsWrap) dotsWrap.style.opacity = pastTrack ? "0" : "1";
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* ---------------- Scroll reveal ---------------- */
  function initScrollReveal() {
    var els = document.querySelectorAll(".lp-reveal, .lp-reveal-stagger");
    if (!els.length) return;
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------- Sticky mobile CTA: appears once hero is scrolled past ---------------- */
  function initStickyMobileCta() {
    var bar = document.querySelector("[data-lp-sticky-cta]");
    var hero = document.querySelector("[data-lp-hero]");
    if (!bar || !hero || !("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        bar.classList.toggle("is-visible", !entry.isIntersecting);
      });
    }, { threshold: 0 });
    observer.observe(hero);
  }

  /* ---------------- Signup form ---------------- */
  function initSignupForm() {
    document.querySelectorAll("form[data-lp-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var honeypot = form.querySelector('input[name="website"]');
        if (honeypot && honeypot.value) return; // silently drop bots
        if (!form.checkValidity()) { form.reportValidity(); return; }

        var successEl = form.parentElement.querySelector(".lp-form-success");
        form.reset();
        if (successEl) {
          successEl.classList.add("show");
          successEl.setAttribute("role", "status");
        }
        // NOTE for developer: wire this submit handler to the chosen email/
        // CRM backend before go-live. Currently simulates success client-side
        // only, same as the main site's Contact form (see main.js initForms).
      });
    });
  }

  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }
})();
