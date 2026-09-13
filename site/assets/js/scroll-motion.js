/* PUFFINS — scroll-progress motion system.
   ---------------------------------------------------------------------
   Every animated element here maps CURRENT SCROLL POSITION to a 0-1
   "progress" value, every frame, and derives its visual state as a pure
   function of that value:

       scroll position -> normalized progress (0-1) -> visual state

   There is no "play once when it enters the viewport" state anywhere in
   this file. Scrolling down plays an element's motion forward; scrolling
   up plays the exact same motion backward; stopping mid-scroll holds the
   exact in-between frame; leaving a section and coming back reproduces
   whatever visual state that scroll position already implied. Progress is
   recomputed from live geometry each frame, never stored/incremented, so
   there is nothing to "reset."

   Visual state is written as CSS custom properties (--rv-*), not directly
   as `transform`/`opacity`, so this can compose with the unrelated
   pointer-driven hover-tilt effect (initTiltEffect in main.js) on the same
   elements without either one clobbering the other — see style.css for
   the rules that actually consume these variables. No CSS `transition` is
   applied to any of them: a transition would race the next scroll update
   and lag behind the finger/wheel, breaking the "exact halfway point"
   requirement. Any easing here is applied to PROGRESS itself, which is
   still a pure function of scroll position, so it stays fully
   deterministic and reversible.
   --------------------------------------------------------------------- */
(function () {
  "use strict";

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var narrowMQ = window.matchMedia ? window.matchMedia("(max-width:719px)") : null;
  function isNarrow() { return narrowMQ ? narrowMQ.matches : window.innerWidth < 720; }

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeOutBack(t) {
    var c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  /* progress 0 while el's top is at/below startFrac*vh; progress 1 once
     el's top has risen to endFrac*vh. Pure function of rect + vh — no
     memory of past frames. */
  function entryProgress(rect, vh, startFrac, endFrac) {
    var startY = vh * startFrac, endY = vh * endFrac;
    return clamp01((startY - rect.top) / (startY - endY));
  }

  /* ---- Single shared ticker: one scroll listener, one resize listener,
     one rAF loop, no matter how many elements are being animated. ---- */
  var registry = [];
  function watch(el, compute) { if (el) registry.push({ el: el, compute: compute }); }

  var dirty = true, ticking = false;
  function requestTick() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      if (dirty) render();
    });
  }
  function render() {
    dirty = false;
    var vh = window.innerHeight;
    var i, n = registry.length;
    var rects = new Array(n);
    // Pass 1: read all geometry first (no writes in between) so we never
    // force a synchronous layout recalculation mid-loop.
    for (i = 0; i < n; i++) rects[i] = registry[i].el.getBoundingClientRect();
    // Pass 2: write all derived styles.
    for (i = 0; i < n; i++) registry[i].compute(vh, rects[i]);
  }
  window.addEventListener("scroll", function () { dirty = true; requestTick(); }, { passive: true });
  window.addEventListener("resize", function () { dirty = true; requestTick(); });

  document.addEventListener("DOMContentLoaded", function () {
    if (reduced) return; // CSS custom-property fallbacks already render the fully-visible, untransformed state.
    initCascadeReveal();
    initStoryReveal();
    initHeroCanister();
    initHeroStatsReveal();
    initStatementReveal();
    initStoryTaglinePuff();
    initTeamReveal();
    render(); // resolve the correct in-between state immediately (e.g. a mid-page reload), no flash of the wrong frame.
  });

  /* ---------------- Generic cascade reveal ----------------
     Section heads, feature cards, product cards, quote cards, process
     steps, CTA bands (team cards are handled separately by initTeamReveal,
     synchronized with their photos). A small geometric (not time-based)
     stagger comes from nudging each sibling's own entry window slightly
     later — indexed PER PARENT, not globally across the whole page: a
     global index here previously made a card's reveal order depend on how
     many unrelated .card/.step/etc. elements happened to precede its own
     group elsewhere in the DOM, instead of its actual left-to-right
     position among its own siblings. */
  function initCascadeReveal() {
    var selector = [
      "main section .section-head", "main .card", "main .product-card",
      "main .quote-card", "main .step", "main .cta-band", "main .crunch-poster"
    ].join(",");
    var els = document.querySelectorAll(selector);
    var siblingIndex = new Map();
    els.forEach(function (el) {
      var parent = el.parentElement;
      var idx = siblingIndex.get(parent) || 0;
      siblingIndex.set(parent, idx + 1);
      var icon = el.querySelector(".icon");
      var stagger = (idx % 5) * 0.025;
      watch(el, function (vh, rect) {
        var narrow = isNarrow();
        var p = entryProgress(rect, vh, 0.92 - stagger, 0.55 - stagger);
        var t = easeOutCubic(p);
        el.style.setProperty("--rv-o", t);
        el.style.setProperty("--rv-rx", (narrow ? lerp(-5, 0, t) : lerp(-11, 0, t)) + "deg");
        el.style.setProperty("--rv-y", lerp(26, 0, t) + "px");
        el.style.setProperty("--rv-s", lerp(0.96, 1, t));
        if (icon) {
          var ti = easeOutBack(p);
          icon.style.setProperty("--rv-io", clamp01(p * 1.4));
          icon.style.setProperty("--rv-is", lerp(0.5, 1, ti));
        }
      });
    });
  }

  /* ---------------- Our Story: 3D cascade ----------------
     Same continuous-progress model as the cascade reveal above, but with
     a stronger tilt/blur treatment reserved for this one editorial
     moment. The pull-quote uses a spring (easeOutBack) curve so scrolling
     slowly through its entry window visibly plays the overshoot-and-
     settle, rather than faking a bounce with a CSS transition. */
  function initStoryReveal() {
    var paras = document.querySelectorAll(".story-reveal > p");
    paras.forEach(function (el, i) {
      var stagger = i * 0.02;
      watch(el, function (vh, rect) {
        var narrow = isNarrow();
        var p = entryProgress(rect, vh, 0.9 - stagger, 0.5 - stagger);
        var t = easeOutCubic(p);
        el.style.setProperty("--rv-o", t);
        el.style.setProperty("--rv-b", (narrow ? 0 : lerp(6, 0, t)) + "px");
        el.style.setProperty("--rv-rx", (narrow ? lerp(-22, 0, t) : lerp(-58, 0, t)) + "deg");
        el.style.setProperty("--rv-y", lerp(38, 0, t) + "px");
        el.style.setProperty("--rv-s", lerp(0.94, 1, t));
      });
    });

    var quote = document.querySelector(".story-reveal-quote");
    if (quote) {
      watch(quote, function (vh, rect) {
        var narrow = isNarrow();
        var p = entryProgress(rect, vh, 0.85, 0.45);
        var tSpring = easeOutBack(p); // drives rotation/scale — the "spring" overshoot
        var tLinear = clamp01(p);     // drives opacity/shadow — no overshoot on those
        quote.style.setProperty("--rv-o", tLinear);
        quote.style.setProperty("--rv-shadow",
          "0 " + lerp(4, 22, tLinear) + "px " + lerp(10, 44, tLinear) + "px -18px rgba(15,39,64," + lerp(0, 0.4, tLinear) + ")");
        quote.style.setProperty("--rv-rx", (narrow ? lerp(-16, 0, tSpring) : lerp(-42, 0, tSpring)) + "deg");
        quote.style.setProperty("--rv-rz", lerp(-1.5, 0, tSpring) + "deg");
        quote.style.setProperty("--rv-y", lerp(32, 0, tSpring) + "px");
        quote.style.setProperty("--rv-s", lerp(0.9, 1, tSpring));
      });
    }
  }

  /* ---------------- Signature moment: the canister, right -> centre ----------------
     Homepage hero packshot. Progress is driven directly by page scrollY
     (not the element's own viewport entry) because this is the very first
     thing on the page — at scrollY 0 it sits off to the right; by the
     time the visitor has scrolled half a screen's height, it has arrived
     at its resting position. Scrolling back to the top puts it back
     exactly where it started, every time. */
  function initHeroCanister() {
    var img = document.querySelector(".hero .hero-media img");
    if (!img) return;
    watch(img, function (vh) {
      var p = clamp01(window.scrollY / (vh * 0.55));
      var t = easeOutCubic(p);
      if (isNarrow()) {
        // Stacked single-column layout: a lateral "arrives from the right"
        // motion has no natural resting spot to read against, so this
        // simplifies to a settle-and-lift instead of removing the motion.
        img.style.setProperty("--rv-x", "0px");
        img.style.setProperty("--rv-ry", "0deg");
        img.style.setProperty("--rv-y", lerp(20, 0, t) + "px");
        img.style.setProperty("--rv-s", lerp(0.93, 1, t));
        img.style.setProperty("--rv-o", lerp(0.8, 1, t));
      } else {
        img.style.setProperty("--rv-x", lerp(72, 0, t) + "px");
        img.style.setProperty("--rv-ry", lerp(-15, 0, t) + "deg");
        img.style.setProperty("--rv-y", "0px");
        img.style.setProperty("--rv-s", lerp(0.9, 1, t));
        img.style.setProperty("--rv-o", "1");
      }
    });
  }

  /* ---------------- Hero stat pointers: puffed / gluten free / zero ----------------
     "Puffed", "Gluten free" and "Zero" sit right at the top of the page, so
     on a wide viewport they're already inside the first frame and this
     resolves straight to its fully-popped end state (no motion to play) —
     same reasoning as initHeroCanister above. On a narrow/stacked layout the
     eyebrow + big h1 + lead + buttons push this row down past the first
     screenful, so scrolling (swiping) down is what actually plays the
     entrance: each pointer pops in with a spring overshoot (react-bits'
     GradientText inspired this row's shimmer; the pop-in here borrows the
     same BounceCards-style spring used for team photos), staggered
     left-to-right, and reverses cleanly on scroll-up like every other
     reveal in this file. */
  function initHeroStatsReveal() {
    var items = document.querySelectorAll(".hero-stats > div");
    items.forEach(function (el, i) {
      var stagger = i * 0.08;
      watch(el, function (vh, rect) {
        var p = entryProgress(rect, vh, 0.95 - stagger, 0.62 - stagger);
        var tSpring = easeOutBack(p);
        var tLinear = clamp01(p);
        el.style.setProperty("--rv-o", tLinear);
        el.style.setProperty("--rv-y", lerp(24, 0, tSpring) + "px");
        el.style.setProperty("--rv-s", lerp(0.55, 1, tSpring));
      });
    });
  }

  /* ---------------- Team cards: box + photo, one synchronized wave ----------------
     The card box and its circular photo are driven from a SINGLE progress
     value per team member — computed once from the card's own geometry,
     then reused for both — so they can never drift out of sync with each
     other. All five cards share the exact same entry window (no per-index
     stagger), so they pop in together rather than cascading left-to-right;
     this queries .team-card directly rather than going through the shared
     multi-selector cascade reveal, so it can't be thrown off by unrelated
     elements elsewhere on the page shifting a global index (that was the
     bug behind cards revealing in a seemingly random order — see
     initCascadeReveal's comment). The photo's extra pop-and-spin (inspired
     by react-bits' BounceCards) rides on top of the same p, using a spring
     curve where the box uses a plain ease-out; the alternating spin
     direction per card (dir) is still index-based purely for visual
     variety, not timing — every card starts and finishes at the same
     scroll position. */
  function initTeamReveal() {
    var cards = document.querySelectorAll(".team-card");
    cards.forEach(function (card, i) {
      var img = card.querySelector("img");
      var dir = i % 2 === 0 ? -1 : 1; // alternates left/right spin, like a dealt fan of photos
      watch(card, function (vh, rect) {
        var narrow = isNarrow();
        var p = entryProgress(rect, vh, 0.94, 0.6);
        var t = easeOutCubic(p);
        card.style.setProperty("--rv-o", t);
        card.style.setProperty("--rv-rx", (narrow ? lerp(-5, 0, t) : lerp(-11, 0, t)) + "deg");
        card.style.setProperty("--rv-y", lerp(26, 0, t) + "px");
        card.style.setProperty("--rv-s", lerp(0.96, 1, t));
        if (img) {
          var tSpring = easeOutBack(p); // scale/rotation/lift — plays the overshoot
          var tLinear = clamp01(p);     // opacity — no flicker on the overshoot
          img.style.setProperty("--photo-o", tLinear);
          img.style.setProperty("--photo-s", lerp(0.35, 1, tSpring));
          img.style.setProperty("--photo-r", (dir * lerp(narrow ? 35 : 55, 0, tSpring)) + "deg");
          img.style.setProperty("--photo-y", lerp(22, 0, tSpring) + "px");
        }
      });
    });
  }

  /* ---------------- Statement / big typographic moment ---------------- */
  function initStatementReveal() {
    var el = document.querySelector(".statement .stmt-text");
    if (!el) return;
    watch(el, function (vh, rect) {
      var p = entryProgress(rect, vh, 0.85, 0.48);
      var t = easeOutCubic(p);
      el.style.setProperty("--rv-o", t);
      el.style.setProperty("--rv-y", lerp(30, 0, t) + "px");
      el.style.setProperty("--rv-s", lerp(0.97, 1, t));
    });
  }

  /* ---------------- Story tagline: "grain" settles, then "crunch" puffs up ----
     "From a simple rice grain to EVERYDAY CRUNCH" — the two halves read off
     the same element's scroll position but on offset windows (--tag-* custom
     properties, namespaced away from the ambient --rv-* ones this element's
     .section-head ancestor already drives — see style.css comment), so the
     plain half settles in first and the gradient half arrives a beat later
     and visibly overshoots past full size before springing back, rather
     than both halves doing the same fade/slide the rest of the
     section-head cascade uses. The motion illustrates the sentence: plain
     settles, then the crunchy half puffs up out of it. */
  function initStoryTaglinePuff() {
    var el = document.querySelector("[data-story-tagline]");
    if (!el) return;
    var plain = el.querySelector(".story-tagline-plain");
    var pop = el.querySelector(".story-tagline-pop");
    watch(el, function (vh, rect) {
      var pPlain = entryProgress(rect, vh, 0.88, 0.58);
      var tPlain = easeOutCubic(pPlain);
      if (plain) {
        plain.style.setProperty("--tag-po", tPlain);
        plain.style.setProperty("--tag-ps", lerp(0.88, 1, tPlain));
      }
      var pPop = entryProgress(rect, vh, 0.78, 0.42);
      var tPopSpring = easeOutBack(pPop);
      var tPopLinear = clamp01(pPop);
      if (pop) {
        pop.style.setProperty("--tag-co", tPopLinear);
        pop.style.setProperty("--tag-cs", lerp(0.32, 1, tPopSpring));
        pop.style.setProperty("--tag-cr", lerp(-9, 0, tPopSpring) + "deg");
      }
    });
  }
})();
