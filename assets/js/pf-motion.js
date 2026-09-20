/* Scroll reveal + header shadow (from the Puffins prototype). */
(function () {
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("pf-scrolled", window.scrollY > 30); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  document.documentElement.classList.add("pf-js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;
  var targets = document.querySelectorAll(
    ".pf-reveal, .pf-copy, .pf-media, main .grid-2 > div, .editorial-item, .accordion-item, .form-row, .health-pulse, " +
    ".image-carousel, .crunch-poster-wrap, .prose > *, .tabs-nav, .flavor-world"
  );
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("show"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  targets.forEach(function (el) { el.classList.add("pf-reveal"); io.observe(el); });
})();
