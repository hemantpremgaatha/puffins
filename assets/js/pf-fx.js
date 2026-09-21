/* Loader, smooth scroll, parallax and heading reveals (see pf-fx.css). No libraries. */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  doc.classList.add("pf-js-fx");

  var isHome = !!document.querySelector(".pf-hero");

  /* ---------- loader (homepage, first visit of the session) ---------- */
  function runLoader(done) {
    var seen = false;
    try { seen = sessionStorage.getItem("pf-loaded") === "1"; } catch (e) {}
    if (!isHome || seen) { done(); return; }
    var el = document.createElement("div");
    el.className = "pf-loader";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
      '<img class="pf-loader-mark" src="assets/img/brand/puff-mascot.png" alt="">' +
      '<div class="pf-loader-count">0%</div>' +
      '<div class="pf-loader-bar"><i></i></div>';
    document.body.appendChild(el);
    doc.classList.add("pf-loading");
    var count = el.querySelector(".pf-loader-count");
    var bar = el.querySelector(".pf-loader-bar i");
    var mark = el.querySelector(".pf-loader-mark");
    var start = performance.now();
    var loaded = document.readyState === "complete";
    if (!loaded) window.addEventListener("load", function () { loaded = true; });
    var MIN = 1500, MAX = 4000, shown = 0;
    (function tick(now) {
      var t = now - start;
      var target = Math.min(t / MIN, 1) * 100;      // time-based ramp
      if (!loaded && t < MAX) target = Math.min(target, 92); // wait for the page, but never forever
      shown += (target - shown) * 0.18;
      if (target >= 99.5 && shown > 99) shown = 100;
      var p = Math.round(shown);
      count.textContent = p + "%";
      bar.style.width = shown + "%";
      mark.style.transform = "scale(" + (0.35 + 0.65 * (shown / 100)) + ")";
      if (shown < 100) { requestAnimationFrame(tick); return; }
      try { sessionStorage.setItem("pf-loaded", "1"); } catch (e) {}
      setTimeout(function () {
        el.classList.add("is-done");
        doc.classList.remove("pf-loading");
        done();
        setTimeout(function () { el.remove(); }, 1000);
      }, 250);
    })(start);
  }

  /* ---------- headline lines: wrap each line's text so it can rise from a mask ---------- */
  function prepHero() {
    document.querySelectorAll(".pf-title > span").forEach(function (s) {
      if (s.firstElementChild && s.firstElementChild.tagName === "B") return;
      var b = document.createElement("b");
      while (s.firstChild) b.appendChild(s.firstChild);
      s.appendChild(b);
    });
  }

  /* ---------- masked heading reveal ---------- */
  function initHeadings() {
    var hs = document.querySelectorAll("main h2, main .h2, main .stmt-text");
    if (!("IntersectionObserver" in window)) return;
    var map = new Map();
    // watch each heading's parent (a masked heading has no visible box of its own to observe)
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        (map.get(e.target) || []).forEach(function (h) { h.classList.add("fx-in"); });
        io.unobserve(e.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -12% 0px" });
    hs.forEach(function (h) {
      if (h.closest(".pf-hero, .hero-photo") || !h.parentElement) return;
      h.classList.add("fx-h");
      var p = h.parentElement;
      if (!map.has(p)) { map.set(p, []); io.observe(p); }
      map.get(p).push(h);
    });
  }

  /* ---------- parallax (scroll-scrubbed) ---------- */
  var par = [];
  function initParallax() {
    document.querySelectorAll(".pf-mascot-photo, .pf-flavour-media, .crunch-poster-wrap, .story-photo").forEach(function (box) {
      if (box.querySelector(":scope > img")) { box.classList.add("fx-par"); par.push(box); }
    });
  }
  function updateParallax() {
    var vh = window.innerHeight;
    for (var i = 0; i < par.length; i++) {
      var r = par[i].getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      var p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2); // -1 .. 1
      par[i].style.setProperty("--fx-y", (-p * r.height * 0.07).toFixed(1) + "px");
    }
  }

  /* ---------- smooth wheel scrolling (desktop pointers only) ---------- */
  function initSmooth() {
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    var target = window.scrollY, current = target, raf = 0, active = false;
    function max() { return doc.scrollHeight - window.innerHeight; }
    function loop() {
      current += (target - current) * 0.11;
      if (Math.abs(target - current) < 0.4) { current = target; active = false; }
      window.scrollTo(0, current);
      if (active) raf = requestAnimationFrame(loop);
    }
    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey || e.defaultPrevented) return;
      var t = e.target;
      while (t && t !== document.body) {           // let nested scroll areas scroll normally
        var cs = getComputedStyle(t);
        if (/(auto|scroll)/.test(cs.overflowY) && t.scrollHeight > t.clientHeight + 2) return;
        t = t.parentElement;
      }
      if (document.querySelector(".nav-mobile.is-open") || doc.classList.contains("pf-loading")) return;
      e.preventDefault();
      if (!active) { current = window.scrollY; target = current; }
      var dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
      target = Math.max(0, Math.min(max(), target + dy));
      if (!active) { active = true; raf = requestAnimationFrame(loop); }
    }, { passive: false });
    // keep in sync when the user scrolls another way (scrollbar drag, keys, anchors)
    window.addEventListener("scroll", function () {
      if (!active) { target = window.scrollY; current = target; }
    }, { passive: true });
    document.addEventListener("click", function (e) {   // in-page anchors glide too
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute("href") === "#") return;
      var dest = document.getElementById(a.getAttribute("href").slice(1));
      if (!dest) return;
      e.preventDefault();
      current = window.scrollY;
      target = Math.max(0, Math.min(max(), dest.getBoundingClientRect().top + window.scrollY - 90));
      if (!active) { active = true; raf = requestAnimationFrame(loop); }
      if (history.pushState) history.pushState(null, "", a.getAttribute("href"));
    });
    doc.style.scrollBehavior = "auto";
  }

  function boot() {
    prepHero();
    runLoader(function () { doc.classList.add("pf-hero-in"); });
    initHeadings();
    initParallax();
    initSmooth();
    var ticking = false;
    function onScroll() {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { updateParallax(); ticking = false; });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateParallax();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
