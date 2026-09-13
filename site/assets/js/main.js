/* PUFFINS — shared site behaviour: nav, accordion, tabs, forms, product rendering */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initAccordions();
    initTabs();
    initForms();
    initFlavorChips();
    initYear();
    renderProductCards();
    renderProductDetail();
    initHeaderScroll();
    initScrollProgress();
    initMagneticButtons();
    initTiltEffect();
    initHeroGlow();
    initSwipeCarousels();
    initImageCarousel();
    initProductShowcase();
    initAssistant();
    initWordFlip();
  });

  var prefersReducedMotion = function () {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };
  var supportsHover = function () {
    return window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  };

  /* ---------------- Scroll progress bar ---------------- */
  function initScrollProgress() {
    if (prefersReducedMotion()) return;
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    var update = function () {
      var doc = document.documentElement;
      var scrollTop = doc.scrollTop || document.body.scrollTop;
      var height = doc.scrollHeight - doc.clientHeight;
      bar.style.transform = "scaleX(" + (height > 0 ? scrollTop / height : 0) + ")";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---------------- Magnetic buttons (desktop pointer only) ---------------- */
  function initMagneticButtons() {
    if (!supportsHover() || prefersReducedMotion()) return;
    var strength = 16;
    document.querySelectorAll(".btn:not(.btn-sm):not(.btn-block)").forEach(function (btn) {
      btn.classList.add("is-magnetic");
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width - 0.5) * strength;
        var y = ((e.clientY - r.top) / r.height - 0.5) * strength;
        btn.style.setProperty("--mx", x + "px");
        btn.style.setProperty("--my", y + "px");
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.setProperty("--mx", "0px");
        btn.style.setProperty("--my", "0px");
      });
    });
  }

  /* ---------------- 3D tilt on cards + hero media (desktop pointer only) ----------------
     Writes --tilt-* custom properties rather than the `transform` shorthand
     directly, so this composes with the scroll-progress reveal system
     (assets/js/scroll-motion.js) on the same elements (.card etc.) instead
     of one clobbering the other — see style.css for the rules that combine
     both sources into the final transform. */
  function initTiltEffect() {
    if (!supportsHover() || prefersReducedMotion()) return;
    var selector = ".card, .product-card, .team-card, .hero-media";
    document.addEventListener("mousemove", function (e) {
      var el = e.target.closest && e.target.closest(selector);
      if (!el) return;
      if (!el.classList.contains("tilt-target")) el.classList.add("tilt-target");
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      var isHero = el.classList.contains("hero-media");
      var rx = (0.5 - py) * (isHero ? 6 : 8);
      var ry = (px - 0.5) * (isHero ? 6 : 8);
      el.style.setProperty("--tilt-rx", rx + "deg");
      el.style.setProperty("--tilt-ry", ry + "deg");
      el.style.setProperty("--tilt-ty", isHero ? "0px" : "-6px");
    }, { passive: true });

    document.addEventListener("mouseout", function (e) {
      var el = e.target.closest && e.target.closest(selector);
      if (!el) return;
      if (e.relatedTarget && el.contains(e.relatedTarget)) return;
      el.style.removeProperty("--tilt-rx");
      el.style.removeProperty("--tilt-ry");
      el.style.removeProperty("--tilt-ty");
    });
  }

  /* ---------------- Hero cursor-reactive glow ---------------- */
  function initHeroGlow() {
    var hero = document.querySelector(".hero");
    if (!hero || !supportsHover() || prefersReducedMotion()) return;
    hero.classList.add("has-glow");
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
      hero.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
    });
  }

  /* ---------------- 3D swipe carousel (product gallery, testimonials) ----------------
     Two-phase so dynamically-rebuilt items (product gallery, filled in later by
     renderProductDetail) don't need their drag/keyboard/nav listeners rebound —
     setupCarouselInteraction() binds once per container (guarded by a data flag);
     layoutCarouselItems() can be called again any time the item list changes. */
  function setupCarouselInteraction(container) {
    if (container.dataset.carouselBound === "1") return;
    container.dataset.carouselBound = "1";

    var viewport = container.querySelector("[data-carousel-viewport]");
    var prevBtn = container.querySelector("[data-carousel-prev]");
    var nextBtn = container.querySelector("[data-carousel-next]");
    var dotsWrap = container.querySelector("[data-carousel-dots]");
    if (!viewport) return;

    var state = { index: 0, startX: 0, dx: 0, dragging: false };
    container._carouselState = state;

    var render = function () {
      var items = viewport.querySelectorAll(".carousel3d-item");
      items.forEach(function (item, i) {
        var offset = i - state.index;
        var abs = Math.abs(offset);
        item.style.zIndex = String(10 - abs);
        // Depth-of-field falloff (borrowed from react-bits' DepthCarousel):
        // the active card stays perfectly sharp, cards further from it blur
        // progressively, reinforcing the 3D depth the transform already
        // implies instead of relying on scale/opacity alone.
        item.style.filter = abs === 0 ? "none" : "blur(" + Math.min(abs * 2.5, 6) + "px)";
        if (abs > 2) {
          item.style.opacity = "0";
          item.style.pointerEvents = "none";
          item.style.transform = "translateX(" + (offset * 60) + "%) scale(.5)";
        } else {
          item.style.opacity = abs === 0 ? "1" : (abs === 1 ? ".6" : ".3");
          item.style.pointerEvents = abs === 0 ? "auto" : "none";
          var tx = offset * 58;
          var scale = 1 - abs * 0.18;
          var rot = offset * -18;
          var tz = -abs * 110;
          item.style.transform = "translateX(" + tx + "%) translateZ(" + tz + "px) rotateY(" + rot + "deg) scale(" + scale + ")";
        }
      });
      if (prevBtn) prevBtn.disabled = state.index <= 0;
      if (nextBtn) nextBtn.disabled = state.index >= items.length - 1;
      if (dotsWrap) {
        dotsWrap.querySelectorAll(".carousel3d-dot").forEach(function (d, i) {
          d.classList.toggle("is-active", i === state.index);
        });
      }
    };
    container._carouselRender = render;

    var go = function (delta) {
      var count = viewport.querySelectorAll(".carousel3d-item").length;
      if (!count) return;
      state.index = Math.max(0, Math.min(count - 1, state.index + delta));
      render();
    };

    if (prevBtn) prevBtn.addEventListener("click", function () { go(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { go(1); });

    container.setAttribute("tabindex", "0");
    container.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { go(-1); e.preventDefault(); }
      if (e.key === "ArrowRight") { go(1); e.preventDefault(); }
    });

    viewport.addEventListener("pointerdown", function (e) {
      state.dragging = true;
      state.startX = e.clientX;
      state.dx = 0;
      if (viewport.setPointerCapture) { try { viewport.setPointerCapture(e.pointerId); } catch (err) {} }
      viewport.classList.add("is-dragging");
    });
    viewport.addEventListener("pointermove", function (e) {
      if (!state.dragging) return;
      state.dx = e.clientX - state.startX;
    });
    var endDrag = function () {
      if (!state.dragging) return;
      state.dragging = false;
      viewport.classList.remove("is-dragging");
      var threshold = 40;
      if (state.dx > threshold) go(-1);
      else if (state.dx < -threshold) go(1);
      state.dx = 0;
    };
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("pointerleave", function () { if (state.dragging) endDrag(); });
  }

  function layoutCarouselItems(container) {
    var viewport = container.querySelector("[data-carousel-viewport]");
    var dotsWrap = container.querySelector("[data-carousel-dots]");
    if (!viewport) return;
    var items = viewport.querySelectorAll(".carousel3d-item");
    if (container._carouselState) container._carouselState.index = 0;
    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      items.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel3d-dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        dot.addEventListener("click", function () {
          if (container._carouselState) container._carouselState.index = i;
          if (container._carouselRender) container._carouselRender();
        });
        dotsWrap.appendChild(dot);
      });
    }
    if (container._carouselRender) container._carouselRender();
  }

  function initSwipeCarousels() {
    document.querySelectorAll("[data-carousel]").forEach(function (c) {
      setupCarouselInteraction(c);
      layoutCarouselItems(c);
    });
  }

  /* ---------------- Auto-advancing image carousel (The Crunch section) ----------------
     Slides one image at a time on a timer (real translateX shift, not a
     crossfade) with dot navigation; pauses on hover/focus so it doesn't
     fight someone inspecting a frame, and never auto-advances under
     prefers-reduced-motion (dots still work). */
  function initImageCarousel() {
    document.querySelectorAll("[data-image-carousel]").forEach(function (container) {
      var track = container.querySelector("[data-image-carousel-track]");
      var dotsWrap = container.querySelector("[data-image-carousel-dots]");
      if (!track) return;
      var slides = track.querySelectorAll(".image-carousel-slide");
      if (slides.length < 2) return;

      var index = 0;
      var timer = null;

      var render = function () {
        track.style.transform = "translateX(-" + (index * 100) + "%)";
        if (dotsWrap) {
          dotsWrap.querySelectorAll(".image-carousel-dot").forEach(function (d, i) {
            d.classList.toggle("is-active", i === index);
          });
        }
      };

      var goTo = function (i) {
        index = (i + slides.length) % slides.length;
        render();
      };

      var stop = function () {
        if (timer) { window.clearInterval(timer); timer = null; }
      };
      var start = function () {
        if (prefersReducedMotion()) return;
        stop();
        timer = window.setInterval(function () { goTo(index + 1); }, 3200);
      };

      if (dotsWrap) {
        slides.forEach(function (_, i) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.className = "image-carousel-dot" + (i === 0 ? " is-active" : "");
          dot.setAttribute("aria-label", "Show image " + (i + 1) + " of " + slides.length);
          dot.addEventListener("click", function () { goTo(i); start(); });
          dotsWrap.appendChild(dot);
        });
      }

      container.addEventListener("mouseenter", stop);
      container.addEventListener("mouseleave", start);
      container.addEventListener("focusin", stop);
      container.addEventListener("focusout", start);

      render();
      start();
    });
  }

  /* ---------------- Homepage product-range video showcase ----------------
     Stub: no real showcase video file exists yet (redesign spec item 7).
     Ships a <video> with no <source> so it's visibly inert, and always keeps
     the existing product-card grid rendered-but-hidden behind it so the
     homepage never ships broken or empty — reveal the grid automatically if
     no playable source is present, or if the video fails to play. */
  function initProductShowcase() {
    var showcase = document.querySelector("[data-product-showcase]");
    if (!showcase) return;
    var video = showcase.querySelector("[data-showcase-video]");
    var grid = showcase.querySelector("[data-product-grid]");
    var hasSource = video && video.querySelector("source");
    var fallbackToGrid = function () {
      if (video) video.hidden = true;
      if (grid) grid.hidden = false;
    };
    if (!hasSource) {
      fallbackToGrid();
    } else if (video) {
      video.addEventListener("error", fallbackToGrid);
    }
  }

  /* ---------------- Word-flip: word <-> emoji boomerang loop ----------------
     Any element with class="word-flip" (and a data-alt emoji) continuously
     swaps between its text and that emoji, forever, on a timer — "love"
     blinks to a heart and back, indefinitely. This is a small perpetual
     decorative flourish, not something scroll should control, so it's a
     plain interval rather than the site's scroll-progress system. */
  function initWordFlip() {
    if (prefersReducedMotion()) return;
    document.querySelectorAll(".word-flip").forEach(function (el) {
      var word = el.textContent;
      var alt = el.getAttribute("data-alt") || "❤️";
      var showingAlt = false;
      window.setInterval(function () {
        el.classList.add("is-flipping");
        window.setTimeout(function () {
          showingAlt = !showingAlt;
          el.textContent = showingAlt ? alt : word;
          el.classList.remove("is-flipping");
        }, 220);
      }, 1000);
    });
  }

  /* ---------------- "Puff" chat assistant (site-wide) ----------------
     Not a hosted-LLM integration — this is a static, no-backend site, so
     there's no server to hold an API key safely. Two layers, tried in order:

     1. Exact rule (matchTopic/buildAssistantTopics): keyword-matched Puffins
        brand/product facts from assets/js/assistant-data.js plus live fields
        from window.PUFFINS_PRODUCTS (ingredients/pack size), so it never
        drifts out of sync with the product tabs and never invents a
        regulated figure that isn't confirmed there yet.
     2. Generic fallback (queryGrainsKnowledge): a small *unsupervised*
        TF-IDF + cosine-similarity retrieval engine (TinyTfidf, see
        assets/js/tfidf-search.js) searching assets/js/grains-knowledge.js —
        general education on food grains, rice cakes as a category, and
        healthy snacking, for questions that aren't about this product
        specifically. See tfidf-search.js's header comment for why this is
        TF-IDF retrieval rather than a trained RNN/LSTM.

     If neither layer is confident, kb.fallback is used. Uses the Puff
     mascot (assistantIconMarkup) — the same artwork as the nav logo, see
     assets/img/brand/puff-mascot.png. */
  function initAssistant() {
    var kb = window.PUFFINS_ASSISTANT;
    if (!kb) return;
    var grainsEngine = buildGrainsEngine();

    var launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "assistant-launcher";
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "assistant-panel");
    launcher.setAttribute("aria-label", "Chat with Puff, the Puffins assistant");
    launcher.innerHTML = assistantIconMarkup() + '<span class="assistant-ping" aria-hidden="true"></span>';

    var panel = document.createElement("div");
    panel.className = "assistant-panel";
    panel.id = "assistant-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Chat with Puff");
    panel.hidden = true;
    panel.innerHTML =
      '<div class="assistant-head">' +
        '<div class="assistant-avatar">' + assistantIconMarkup() + '</div>' +
        '<div><strong>Puff</strong><span>Puffins snack assistant</span></div>' +
        '<button type="button" class="assistant-close" aria-label="Close chat">&times;</button>' +
      '</div>' +
      '<div class="assistant-messages" role="log" aria-live="polite"></div>' +
      '<div class="assistant-quick-replies"></div>' +
      '<form class="assistant-form">' +
        '<input type="text" placeholder="Ask about ingredients, story…" aria-label="Type your question" autocomplete="off">' +
        '<button type="submit" aria-label="Send">&#10148;</button>' +
      '</form>';

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    var messagesEl = panel.querySelector(".assistant-messages");
    var chipsEl = panel.querySelector(".assistant-quick-replies");
    var form = panel.querySelector(".assistant-form");
    var input = form.querySelector("input");
    var topics = buildAssistantTopics(kb);
    var started = false;

    var addMessage = function (text, who) {
      var msg = document.createElement("div");
      msg.className = "assistant-msg " + who;
      msg.textContent = text;
      messagesEl.appendChild(msg);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    };

    var renderQuickReplies = function () {
      chipsEl.innerHTML = "";
      (kb.quickReplies || []).forEach(function (q) {
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "assistant-chip";
        chip.textContent = q.label;
        chip.addEventListener("click", function () {
          addMessage(q.label, "user");
          reply(q.topic, q.query || q.label);
        });
        chipsEl.appendChild(chip);
      });
    };

    var findTopic = function (id) {
      for (var i = 0; i < topics.length; i++) {
        if (topics[i].id === id) return topics[i];
      }
      return null;
    };

    var matchTopic = function (query) {
      var q = query.toLowerCase();
      var best = null;
      var bestScore = 0;
      topics.forEach(function (t) {
        var score = 0;
        (t.keywords || []).forEach(function (k) {
          if (q.indexOf(k) !== -1) score += k.length;
        });
        if (score > bestScore) { bestScore = score; best = t; }
      });
      return best;
    };

    var reply = function (topicId, query) {
      var topic = topicId ? findTopic(topicId) : matchTopic(query || "");
      var answer = topic ? topic.answer : (query ? queryGrainsKnowledge(grainsEngine, query) : null);
      window.setTimeout(function () {
        addMessage(answer || kb.fallback, "bot");
      }, 250);
    };

    var start = function () {
      if (started) return;
      started = true;
      addMessage(kb.greeting, "bot");
      renderQuickReplies();
    };

    var open = function () {
      panel.hidden = false;
      window.requestAnimationFrame(function () { panel.classList.add("is-open"); });
      launcher.setAttribute("aria-expanded", "true");
      start();
      window.setTimeout(function () { input.focus(); }, 200);
    };

    var close = function () {
      panel.classList.remove("is-open");
      launcher.setAttribute("aria-expanded", "false");
      window.setTimeout(function () { panel.hidden = true; }, 200);
    };

    launcher.addEventListener("click", function () {
      if (panel.classList.contains("is-open")) close(); else open();
    });
    panel.querySelector(".assistant-close").addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("is-open")) close();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = input.value.trim();
      if (!value) return;
      addMessage(value, "user");
      input.value = "";
      reply(null, value);
    });

  }

  function buildAssistantTopics(kb) {
    var topics = (kb.topics || []).slice();
    var cakes = getProducts().filter(function (p) { return p.id === "rice-cakes"; })[0];
    if (cakes) {
      if (cakes.ingredients && cakes.ingredients.confirmed && cakes.ingredients.text) {
        topics.push({
          id: "ingredients",
          keywords: ["ingredient", "what's in", "whats in", "made of", "made from", "what is puffins made"],
          answer: cakes.ingredients.text
        });
      }
      if (cakes.packSize && cakes.packSize.confirmed && cakes.packSize.value) {
        topics.push({
          id: "packsize",
          keywords: ["pack size", "how many cakes", "sleeve", "net weight", "net wt", "how much does it weigh", "how many grams"],
          answer: "Each sleeve has " + cakes.packSize.value + "."
        });
      }
    }
    return topics;
  }

  /* Unsupervised fit (see tfidf-search.js) of the generic grains/rice-cakes/
     healthy-snacking corpus. Runs once, client-side, at assistant init —
     no server, no labels, just TF-IDF statistics over grains-knowledge.js. */
  function buildGrainsEngine() {
    var corpus = window.PUFFINS_GRAINS_KNOWLEDGE;
    if (!corpus || !corpus.length || typeof TinyTfidf === "undefined") return null;
    var engine = new TinyTfidf().fit(corpus.map(function (d) { return d.match; }));
    return { engine: engine, corpus: corpus };
  }

  /* Cosine-similarity nearest-neighbour lookup against the fitted corpus.
     MIN_SCORE guards against answering confidently on an unrelated query —
     below it, callers should fall through to kb.fallback instead. */
  var GRAINS_MIN_SCORE = 0.12;
  function queryGrainsKnowledge(built, query) {
    if (!built) return null;
    var hits = built.engine.query(query, 1);
    if (!hits.length || hits[0].score < GRAINS_MIN_SCORE) return null;
    return built.corpus[hits[0].index].answer;
  }

  /* The Puff mascot for the chat launcher and the chat-panel header avatar —
     same artwork as the nav logo (assets/img/brand/puff-mascot.png, the
     .brand-mark img in every header), so the assistant is visibly "Puff". */
  function assistantIconMarkup() {
    return '<img src="assets/img/brand/puff-mascot.png" alt="" class="assistant-icon">';
  }

  /* ---------------- Header shadow on scroll ---------------- */
  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      header.classList.toggle("is-shrunk", window.scrollY > 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Scroll-linked reveal animations (cards, Our Story, hero canister, etc.)
     live in assets/js/scroll-motion.js — a continuous scroll-progress
     system, not an enter-viewport-once trigger. See that file. */

  /* ---------------- Mobile nav ---------------- */
  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-mobile]");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      var open = toggle.classList.toggle("is-open");
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
      spawnToggleBurst(toggle);
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.classList.remove("is-open");
        menu.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------------- FAQ accordions ---------------- */
  function initAccordions() {
    document.querySelectorAll(".accordion-item").forEach(function (item) {
      var q = item.querySelector(".accordion-q");
      if (!q) return;
      q.addEventListener("click", function () {
        var isOpen = item.getAttribute("data-open") === "true";
        item.closest(".accordion").querySelectorAll(".accordion-item").forEach(function (other) {
          if (other !== item && other.dataset.singleOpen !== "false") {
            other.setAttribute("data-open", "false");
            other.querySelector(".accordion-q").setAttribute("aria-expanded", "false");
          }
        });
        item.setAttribute("data-open", isOpen ? "false" : "true");
        q.setAttribute("aria-expanded", isOpen ? "false" : "true");
      });
    });
  }

  /* ---------------- Tabs (product detail) ---------------- */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (wrap) {
      var buttons = wrap.querySelectorAll(".tabs-nav button");
      var panels = wrap.querySelectorAll(".tab-panel");
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          buttons.forEach(function (b) { b.setAttribute("aria-selected", "false"); });
          panels.forEach(function (p) { p.classList.remove("active"); });
          btn.setAttribute("aria-selected", "true");
          var target = wrap.querySelector('[data-panel="' + btn.dataset.tab + '"]');
          if (target) target.classList.add("active");
        });
      });
    });
  }

  /* ---------------- Flavour chip selection ----------------
     Delegated on document (not bound per-element) so chips rendered later by
     renderProductDetail() — which runs after this init — still respond to clicks.
     "Coming soon" chips are clickable too (no live inventory either way yet) —
     picking one previews that flavour's colour + one-line identity below the
     chip row and on the image accent bar, using the same pack photography for
     every flavour until real packshots exist. A click plays the full "world
     swap" (see updateFlavorPreview); the initial render in renderProductDetail
     does not, so the page doesn't animate itself on load. */
  function initFlavorChips() {
    document.addEventListener("click", function (e) {
      var chip = e.target.closest && e.target.closest(".flavor-chip");
      if (!chip) return;
      var row = chip.closest(".flavor-row");
      if (!row) return;
      row.querySelectorAll(".flavor-chip").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
      chip.setAttribute("aria-pressed", "true");
      var swatch = chip.getAttribute("data-swatch");
      spawnChipBurst(chip, e, swatch);
      spawnFlavorConfetti(chip, e, swatch);
      var root = chip.closest("[data-product-detail]");
      if (root) {
        updateFlavorPreview(root, {
          name: chip.getAttribute("data-name"),
          swatch: swatch,
          tagline: chip.getAttribute("data-tagline")
        }, { animate: true });
      }
    });
  }

  /* ---------------- Flavour preview: the "world swap" ----------------
     Deliberately over-the-top — the brief was "it should look like your
     world is being switched," not a subtle colour fade. Six things fire
     together on a real click (animate:true):
       1. .flavor-flash — a fast white camera-flash over the whole stage
       2. .flavor-world — the blurred colour blob behind the packshot
          collapses to almost nothing and blooms back oversized in the new
          colour, with a hard rotation, so it reads as a portal/warp
       3. .flavor-stage shakes — a short multi-axis jolt, classic "impact
          frame" game-juice
       4. the packshot itself squashes/stretches and springs back
          (easeOutBack-style overshoot) like it just landed in a new world
       5. the claymorphic identity card gives a squish-and-settle "glow" pop
          as its clay colour (background + shadow, both color-mix()'d from
          --flavor-color) shifts to match
       6. the name/tagline flip-clock (react-bits' SplitFlapText was the
          reference), now with a bigger rotation and a scale punch, text
          swapped at the edge-on/invisible moment so it reads as a flip
     Initial page load (animate false/omitted) skips all of it and just sets
     the end state — nothing to play, so nothing to skip for reduced-motion
     there either. A real click with reduced-motion active also skips
     straight to the end state. */
  function updateFlavorPreview(root, flavor, opts) {
    if (!flavor || !flavor.name) return;
    var animate = !!(opts && opts.animate) && !prefersReducedMotion();
    var stage = root.querySelector("[data-flavor-stage]");
    var world = root.querySelector("[data-flavor-world]");
    var flash = root.querySelector("[data-flavor-flash]");
    var accent = root.querySelector("[data-flavor-accent]");
    var carousel = root.querySelector("[data-gallery-carousel]");
    var inner = root.querySelector("[data-flavor-preview-inner]");
    var card = root.querySelector("[data-flavor-preview]");

    function applyContent() {
      var name = root.querySelector("[data-flavor-preview-name]");
      var tagline = root.querySelector("[data-flavor-preview-tagline]");
      if (name) name.textContent = flavor.name;
      if (tagline) tagline.textContent = flavor.tagline || "";
    }

    if (stage) stage.style.setProperty("--flavor-color", flavor.swatch || "");
    if (accent) accent.style.background = flavor.swatch || "";
    // The dot and the card's whole clay background/shadow read --flavor-color
    // via CSS color-mix() (inherited from this one custom property), so
    // setting it here on the card is enough to recolour both — no separate
    // dot.style.background needed.
    if (card) card.style.setProperty("--flavor-color", flavor.swatch || "");

    if (!animate) { applyContent(); return; }

    function retrigger(el, cls) {
      if (!el) return;
      el.classList.remove(cls);
      void el.offsetWidth;
      el.classList.add(cls);
    }

    retrigger(flash, "flash");
    retrigger(world, "warp");
    retrigger(stage, "shake");
    retrigger(carousel, "punch");
    retrigger(card, "glow");
    if (inner) {
      retrigger(inner, "flip-out");
      window.setTimeout(applyContent, 220); // card is edge-on/invisible here — swap it now, not at the end
    } else {
      applyContent();
    }
  }

  function spawnChipBurst(chip, e, color) {
    if (prefersReducedMotion()) return;
    var r = chip.getBoundingClientRect();
    var burst = document.createElement("span");
    burst.className = "chip-burst";
    var size = Math.max(r.width, r.height);
    burst.style.left = (e.clientX != null ? e.clientX - r.left : r.width / 2) + "px";
    burst.style.top = (e.clientY != null ? e.clientY - r.top : r.height / 2) + "px";
    burst.style.width = burst.style.height = size + "px";
    if (color) burst.style.background = color;
    chip.appendChild(burst);
    burst.addEventListener("animationend", function () { burst.remove(); });
  }

  /* A confetti burst of flavour-coloured (plus a few white/cream) puffs
     scatters and tumbles from the click point — a playful nod to "puffed"
     rice, and the loudest single signal that something just changed.
     Appended to <body> with position:fixed so they aren't clipped by the
     chip's own overflow:hidden and can fly well past its bounds; each
     removes itself on animationend. */
  function spawnFlavorConfetti(chip, e, color) {
    if (prefersReducedMotion()) return;
    var r = chip.getBoundingClientRect();
    var originX = e.clientX != null ? e.clientX : r.left + r.width / 2;
    var originY = e.clientY != null ? e.clientY : r.top + r.height / 2;
    var palette = [color || "var(--orange)", color || "var(--orange)", "#ffffff", "var(--yellow)"];
    var count = 16;
    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 * i) / count + (Math.random() * 0.6 - 0.3);
      var dist = 55 + Math.random() * 85;
      var size = 6 + Math.random() * 7;
      var puff = document.createElement("span");
      puff.className = "flavor-confetti";
      puff.style.left = originX + "px";
      puff.style.top = originY + "px";
      puff.style.width = puff.style.height = size + "px";
      puff.style.background = palette[i % palette.length];
      puff.style.setProperty("--dx", (Math.cos(angle) * dist) + "px");
      puff.style.setProperty("--dy", (Math.sin(angle) * dist - 20) + "px");
      puff.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
      document.body.appendChild(puff);
      puff.addEventListener("animationend", function () { this.remove(); });
    }
  }

  /* Small centred orange "pop" on the hamburger toggle — same burst
     language as spawnChipBurst above, but sized to the button itself
     (not the click point) since the toggle is small and the whole thing
     should flash, not just wherever the pointer landed. */
  function spawnToggleBurst(el) {
    if (prefersReducedMotion()) return;
    var burst = document.createElement("span");
    burst.className = "toggle-burst";
    el.appendChild(burst);
    burst.addEventListener("animationend", function () { burst.remove(); });
  }

  /* ---------------- Forms: client-side validation + honeypot spam guard ---------------- */
  function initForms() {
    document.querySelectorAll("form[data-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        var honeypot = form.querySelector('input[name="website"]');
        if (honeypot && honeypot.value) return; // silently drop bots

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        var successEl = form.parentElement.querySelector(".form-success") || form.querySelector(".form-success");
        form.reset();
        if (successEl) {
          successEl.classList.add("show");
          successEl.setAttribute("role", "status");
          successEl.focus && successEl.focus();
        }
        // NOTE for developer: wire this submit handler to the chosen backend
        // (form API, serverless function, or CMS) before go-live. Currently
        // simulates success client-side only.
      });
    });
  }

  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------------- Product catalogue rendering ---------------- */
  function getProducts() {
    return (window.PUFFINS_PRODUCTS && window.PUFFINS_PRODUCTS.products) || [];
  }

  function priceLabel(p) {
    if (p.price && p.price.confirmed && p.price.amount != null) {
      return "₹" + p.price.amount;
    }
    return "Price coming soon";
  }

  /* Redesign spec item 3: dynamically-computed "N Products" badge, kept in
     sync with the catalogue instead of a hardcoded count. */
  function renderProductCount() {
    var count = getProducts().length;
    var label = count + (count === 1 ? " Product" : " Products");
    document.querySelectorAll("[data-product-count]").forEach(function (el) {
      el.textContent = label;
    });
  }

  function renderProductCards() {
    renderProductCount();
    var grid = document.querySelector("[data-product-grid]");
    if (!grid) return;
    var products = getProducts();
    grid.innerHTML = products.map(function (p) {
      var soon = p.status === "coming-soon";
      return (
        '<div class="product-card">' +
          '<div class="media"><img src="' + p.heroImage + '" alt="' + p.name + ' pack" loading="lazy"></div>' +
          '<div class="body">' +
            '<div class="badges">' +
              (soon ? '<span class="badge orange">Coming soon</span>' : '<span class="badge orange">Available</span>') +
              '<span class="badge">' + p.format + '</span>' +
            '</div>' +
            '<h3>' + p.name + '</h3>' +
            '<p>' + p.shortDescription + '</p>' +
            '<div class="price">' +
              '<span>' + priceLabel(p) + '</span>' +
              '<a class="btn btn-outline btn-sm" href="product-' + p.slug + '.html">' + (soon ? 'Notify me' : 'View product') + '</a>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join("");
  }

  function renderProductDetail() {
    var root = document.querySelector("[data-product-detail]");
    if (!root) return;
    var slug = root.getAttribute("data-product-detail");
    var product = getProducts().filter(function (p) { return p.slug === slug; })[0];
    if (!product) return;

    // Gallery — 3D swipe carousel (redesign spec item 1). setupCarouselInteraction()
    // was already run once for this container by the DOMContentLoaded-time
    // initSwipeCarousels() pass (on an empty viewport); only the item layout
    // needs rebuilding here now that the real images are known.
    var galleryCarousel = root.querySelector("[data-gallery-carousel]");
    if (galleryCarousel) {
      var galleryViewport = galleryCarousel.querySelector("[data-carousel-viewport]");
      if (galleryViewport) {
        galleryViewport.innerHTML = product.galleryImages.map(function (src, i) {
          return '<div class="carousel3d-item"><img src="' + src + '" alt="' + product.name + ' — image ' + (i + 1) + '"' +
            (i === 0 ? ' fetchpriority="high"' : ' loading="lazy"') + '></div>';
        }).join("");
      }
      layoutCarouselItems(galleryCarousel);
    }

    // Flavours — chips stay clickable even when "coming soon" so visitors can
    // preview each flavour's colour + one-liner (see updateFlavorPreview);
    // only the CTA/price below reflects real availability, not the chips.
    var flavorRow = root.querySelector("[data-flavor-row]");
    if (flavorRow) {
      flavorRow.innerHTML = product.flavors.map(function (f, i) {
        var soon = f.status === "coming-soon";
        return '<button type="button" class="flavor-chip' + (soon ? ' soon' : '') + '" ' +
          'data-name="' + f.name + '" data-swatch="' + f.swatch + '" data-tagline="' + (f.tagline || "") + '" ' +
          (soon ? 'title="Coming soon" ' : '') +
          'aria-pressed="' + (i === 0 ? "true" : "false") + '">' +
          f.name + (soon ? ' · soon' : '') + '</button>';
      }).join("");
      updateFlavorPreview(root, product.flavors[0]);
    }

    // Price + pack size
    var priceEl = root.querySelector("[data-price]");
    if (priceEl) priceEl.textContent = priceLabel(product);
    var packEl = root.querySelector("[data-pack-size]");
    if (packEl) packEl.textContent = product.packSize.value || "Pack size to be confirmed";

    // Attributes
    var attrsEl = root.querySelector("[data-attributes]");
    if (attrsEl) {
      attrsEl.innerHTML = product.attributes.map(function (a) {
        return '<span class="badge">' + a + '</span>';
      }).join("");
    }

    // Regulated fields (ingredients/allergens/nutrition/shelf life) — show pending notice unless confirmed
    setRegulatedField(root, "ingredients", product.ingredients);
    setRegulatedField(root, "allergens", product.allergens);
    setRegulatedField(root, "shelf-life", product.shelfLife);
    setRegulatedField(root, "nutrition", product.nutrition, true);

    var storageEl = root.querySelector("[data-storage]");
    if (storageEl) storageEl.textContent = product.storage.text;

    // FAQs
    var faqEl = root.querySelector("[data-product-faqs]");
    if (faqEl) {
      faqEl.innerHTML = product.faqs.map(function (f, i) {
        return (
          '<div class="accordion-item" data-open="' + (i === 0 ? "true" : "false") + '">' +
            '<button class="accordion-q" aria-expanded="' + (i === 0 ? "true" : "false") + '">' + f.q + '<span class="plus">+</span></button>' +
            '<div class="accordion-a"><p>' + f.a + '</p></div>' +
          '</div>'
        );
      }).join("");
      initAccordions();
    }

    // CTA label
    var ctaBtn = root.querySelector("[data-cta-buy]");
    if (ctaBtn) ctaBtn.textContent = product.status === "coming-soon" ? "Notify me at launch" : "Where to buy";

    document.title = product.name + " — Puffins";
  }

  function setRegulatedField(root, key, field, isNutrition) {
    var el = root.querySelector('[data-field="' + key + '"]');
    if (!el) return;
    if (field && field.confirmed && (isNutrition ? field.perServing : field.text)) {
      el.innerHTML = isNutrition ? field.perServing : field.text;
    } else {
      el.innerHTML = '<p class="pending"><strong>Pending SIF approval —</strong> final, lab-verified information will appear here before launch.</p>';
    }
  }
})();
