/* Arz Estates (Demo) — premium layer, property page only.
   - Swiper gallery inside the property view. Honesty constraint: each demo
     listing has exactly ONE photo, so the gallery is that photo three ways —
     the full view plus two detail crops of the SAME photo, each captioned
     as such. No other property's photo is ever shown as this property's.
   - A designed "neighbourhood chapter" per property (Sobha chapter pattern,
     no WebGL): copy drawn ONLY from this listing's own description and its
     "Near …" feature lines; the band photo is the site's generic skyline,
     captioned as generic. Transform-only parallax on the band.
   - Reduced motion / no Swiper: the gallery never initialises and the CSS
     fallback stacks all three views as ordinary photos; no parallax. */
(function () {
  'use strict';
  var D = window.ESTATE_DATA, L = window.ESTATE_LOGIC;
  var detail = document.querySelector('[data-detail]');
  if (!D || !L || !detail) return;
  var ref = new URLSearchParams(window.location.search).get('id');
  var p = ref ? L.byRef(D.PROPERTIES, ref) : null;
  if (!p) return;
  /* Static capture mode (?static=1 / data-static) folds into `reduced`:
     the gallery + chapter CONTENT still builds (it is the page's content),
     but Swiper never initialises (CSS stacks the three views) and the
     band parallax stays off. */
  var STATIC = /[?&]static=1(?:&|$)/.test(window.location.search) || document.documentElement.hasAttribute('data-static');
  if (STATIC) document.documentElement.setAttribute('data-static', '');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || STATIC;

  /* --- Gallery --- */
  var hero = detail.querySelector('.detail-hero');
  if (hero) {
    var alt = 'Photo of ' + p.title + ' in ' + p.area + ', ' + p.city + ' (demo listing)';
    function slide(cls, pos, cap) {
      return '<div class="swiper-slide"><img class="' + cls + '" src="' + p.img + '" alt="' + alt + '"' +
        (pos ? ' style="object-position:' + pos + '"' : '') + '><p class="slide-cap">' + cap + '</p></div>';
    }
    hero.innerHTML =
      '<div class="swiper prop-swiper"><div class="swiper-wrapper">' +
      slide('', '', 'Full view — the listing\u2019s own demo photo.') +
      slide('crop', '22% 50%', 'Detail crop (left) — the same demo photo, enlarged. No second photo exists for this demo listing.') +
      slide('crop', '78% 50%', 'Detail crop (right) — the same demo photo, enlarged.') +
      '</div></div>' +
      '<div class="prop-controls"><button type="button" class="prop-btn prop-prev" aria-label="Previous photo view">←</button>' +
      '<button type="button" class="prop-btn prop-next" aria-label="Next photo view">→</button>' +
      '<div class="prop-pagination" aria-hidden="true"></div></div>';
    if (!reduced && window.Swiper) {
      new Swiper('.prop-swiper', {
        slidesPerView: 1, spaceBetween: 16,
        keyboard: { enabled: true }, a11y: { enabled: true },
        pagination: { el: '.prop-pagination', clickable: true },
        navigation: { nextEl: '.prop-next', prevEl: '.prop-prev' }
      });
    }
  }

  /* --- Neighbourhood chapter --- */
  var near = p.features.filter(function (f) { return /^Near /.test(f); });
  var chapter = document.createElement('section');
  chapter.className = 'chapter';
  chapter.innerHTML =
    '<div class="wrap"><p class="kicker">Neighbourhood chapter · ' + p.ref + ' (demo)</p>' +
    '<h2 class="chapter-title">' + p.area + '</h2>' +
    '<p class="lede">' + p.desc + '</p>' +
    (near.length ? '<ul class="chapter-near">' + near.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul>' : '') +
    '<div class="chapter-band"><img data-band src="assets/hero.jpg" alt="Generic city skyline photo used across this demo site">' +
    '<span class="chapter-band-cap">Generic demo skyline — not a photo of this property or its street.</span></div>' +
    '<p class="note" style="margin-top:14px">This chapter is built only from this demo listing\u2019s own description and feature list — nothing about the real neighbourhood is claimed.</p></div>';
  detail.parentNode.insertBefore(chapter, detail.nextSibling);

  /* --- Band parallax (transform-only, rAF, reduced-motion off) --- */
  var bandImg = chapter.querySelector('[data-band]');
  if (bandImg && !reduced) {
    var ticking = false;
    function paint() {
      ticking = false;
      var r = chapter.querySelector('.chapter-band').getBoundingClientRect();
      var prog = Math.max(-1, Math.min(1, (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight));
      bandImg.style.transform = 'translateY(' + (prog * 22).toFixed(1) + 'px)';
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    paint();
  }
})();
