/* Arz Estates (Demo) — premium layer, home page only.
   - Lenis smooth scroll synced to ScrollTrigger (P2), off under reduced motion.
   - GSAP parallax on listing imagery (P3/P5): transform-only, images stay
     EAGER (the RE-1 lesson — no lazy/opacity gating is reintroduced), one
     scrubbed treatment for the hero photo and the featured-card photos. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Static capture mode (?static=1 / data-static): no parallax transforms —
     imagery sits at its natural, fully-painted state. */
  var STATIC = /[?&]static=1(?:&|$)/.test(window.location.search) || document.documentElement.hasAttribute('data-static');
  if (STATIC) document.documentElement.setAttribute('data-static', '');
  if (reduced || STATIC || !window.gsap || !window.ScrollTrigger) return;
  document.documentElement.classList.add('premium-on');
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    var lenis = new Lenis({ duration: 1.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  var heroImg = document.querySelector('.hero img');
  if (heroImg) {
    gsap.fromTo(heroImg, { yPercent: -6, scale: 1.12 }, {
      yPercent: 6, scale: 1.12, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }
  document.querySelectorAll('[data-featured] .card img').forEach(function (img) {
    gsap.fromTo(img, { yPercent: -5, scale: 1.14 }, {
      yPercent: 5, scale: 1.14, ease: 'none',
      scrollTrigger: { trigger: img.closest('.card'), start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });
})();
