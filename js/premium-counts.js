/* Arz Estates (Demo) — premium layer, listings page only.
   Animated filter result count. Alpine.js was weighed for this (19,902 B
   gzip alone): listings already ships ~9.4 KB gzip of its own JS, so Alpine
   would have broken the P8 plain-page budget (<=20 KB gzip). The count is
   therefore tweened with a ~0.6 KB rAF helper here instead — same visible
   result, budget intact. The count text itself is always written by
   js/main.js first; this only animates between two real values, and under
   reduced motion it does nothing at all. */
(function () {
  'use strict';
  var el = document.querySelector('[data-result-count]');
  if (!el) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  /* Static capture mode (?static=1 / data-static): the count stands exactly
     as js/main.js wrote it — no tween can be caught mid-flight. */
  var STATIC = /[?&]static=1(?:&|$)/.test(window.location.search) || document.documentElement.hasAttribute('data-static');
  if (STATIC) { document.documentElement.setAttribute('data-static', ''); return; }
  var current = parseInt(el.textContent, 10) || 0;
  var animating = false;
  function animateTo(target, suffix) {
    var from = current; current = target; animating = true;
    var t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / 350);
      el.textContent = Math.round(from + (target - from) * p) + suffix;
      if (p < 1) requestAnimationFrame(step); else animating = false;
    }
    requestAnimationFrame(step);
  }
  new MutationObserver(function () {
    if (animating) return;
    var m = el.textContent.match(/^(\d+)(.*)$/);
    if (!m) return;
    var target = parseInt(m[1], 10);
    if (target !== current) animateTo(target, m[2]);
  }).observe(el, { childList: true, characterData: true, subtree: true });
})();
