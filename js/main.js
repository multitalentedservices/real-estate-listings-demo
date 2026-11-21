/* Arz Estates (Demo) — DOM layer. Logic lives in js/logic.js (shared with tests). */
(function () {
  'use strict';
  var D = window.ESTATE_DATA, L = window.ESTATE_LOGIC;
  document.documentElement.classList.add('js');

  /* Reveal-by-default + IO pre-reveal + 2s fallback + reduced-motion instant (lessons 2+11) */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '600px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    setTimeout(function () { revealEls.forEach(function (el) { el.classList.add('in'); }); }, 2000);
  } else { revealEls.forEach(function (el) { el.classList.add('in'); }); }

  /* Favourites (localStorage) */
  function getFavs() { try { return JSON.parse(localStorage.getItem('arz_favourites') || '[]'); } catch (e) { return []; } }
  function setFavs(f) { localStorage.setItem('arz_favourites', JSON.stringify(f)); paintFavCount(); }
  function paintFavCount() { document.querySelectorAll('[data-fav-count]').forEach(function (el) { el.textContent = getFavs().length; }); }
  paintFavCount();

  function logPush(key, entry) { var arr = []; try { arr = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) {} arr.push(entry); localStorage.setItem(key, JSON.stringify(arr)); }

  function cardHTML(p) {
    var fav = getFavs().indexOf(p.ref) !== -1;
    return '<article class="card reveal in">' +
      '<a href="property.html?id=' + p.ref + '"><img src="' + p.img + '" alt="Photo of ' + p.title + ' in ' + p.area + ', ' + p.city + ' (demo listing)" loading="lazy"></a>' +
      '<div class="body">' +
      '<span class="badge' + (p.purpose === 'rent' ? ' rent' : '') + '">' + (p.purpose === 'rent' ? 'For Rent' : 'For Sale') + ' · ' + p.ref + '</span>' +
      '<div class="price num">' + L.formatPriceShort(p) + '</div>' +
      '<h3><a href="property.html?id=' + p.ref + '">' + p.title + '</a></h3>' +
      '<div class="loc">' + p.area + ', ' + p.city + '</div>' +
      '<div class="specs num"><span>' + (p.type === 'plot' ? 'Plot' : p.beds + ' Beds') + '</span>' + (p.type !== 'plot' ? '<span>' + p.baths + ' Baths</span>' : '') + '<span>' + p.sizeLabel + '</span></div>' +
      '<div class="actions">' +
      '<a class="btn small wa" data-wa="' + p.ref + '" target="_blank" rel="noopener" href="' + L.whatsappLink(p, D.AGENT.whatsapp) + '">WhatsApp Enquiry</a>' +
      '<button type="button" class="fav-btn" data-fav="' + p.ref + '" aria-pressed="' + fav + '" aria-label="Save ' + p.ref + ' to favourites">' + (fav ? '♥' : '♡') + '</button>' +
      '</div></div></article>';
  }
  function bindCards(scope) {
    scope.querySelectorAll('[data-wa]').forEach(function (a) {
      a.addEventListener('click', function () { logPush('arz_whatsapp_log', { ref: a.getAttribute('data-wa'), at: new Date().toISOString(), demo: true }); });
    });
    scope.querySelectorAll('[data-fav]').forEach(function (b) {
      b.addEventListener('click', function () {
        var next = L.toggleFav(getFavs(), b.getAttribute('data-fav')); setFavs(next);
        var on = next.indexOf(b.getAttribute('data-fav')) !== -1;
        b.setAttribute('aria-pressed', on); b.textContent = on ? '♥' : '♡';
      });
    });
  }

  /* Home: featured */
  var feat = document.querySelector('[data-featured]');
  if (feat) { feat.innerHTML = D.PROPERTIES.filter(function (p) { return p.featured; }).map(cardHTML).join(''); bindCards(feat); }

  /* Listings page */
  var grid = document.querySelector('[data-listings-grid]');
  if (grid) {
    var form = document.querySelector('[data-filter-form]');
    var state = L.queryToFilters(window.location.search);
    function readForm() {
      state.q = form.q.value.trim();
      state.city = form.city.value; state.purpose = form.purpose.value;
      state.price = form.price.value; state.minBeds = form.minBeds.value; state.sort = form.sort.value;
      state.type = (form.querySelector('[data-type-chip][aria-pressed="true"]') || {}).getAttribute ? form.querySelector('[data-type-chip][aria-pressed="true"]').getAttribute('data-type-chip') : 'all';
    }
    function writeForm() {
      form.q.value = state.q || ''; form.city.value = state.city; form.purpose.value = state.purpose;
      form.price.value = state.price; form.minBeds.value = state.minBeds; form.sort.value = state.sort;
      form.querySelectorAll('[data-type-chip]').forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-type-chip') === state.type ? 'true' : 'false'); });
    }
    function render() {
      readForm();
      var results = L.searchProperties(D.PROPERTIES, state, state.sort);
      document.querySelector('[data-result-count]').textContent = results.length + (results.length === 1 ? ' property' : ' properties') + ' found';
      var empty = document.querySelector('[data-empty]');
      if (!results.length) {
        grid.innerHTML = ''; empty.hidden = false;
        document.querySelector('[data-empty-msg]').textContent = L.emptyMessage(state);
      } else { empty.hidden = true; grid.innerHTML = results.map(cardHTML).join(''); bindCards(grid); }
      if (window.history && window.history.replaceState) window.history.replaceState(null, '', 'listings.html' + L.filtersToQuery(state));
    }
    form.querySelectorAll('[data-type-chip]').forEach(function (c) {
      c.addEventListener('click', function () { form.querySelectorAll('[data-type-chip]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); c.setAttribute('aria-pressed', 'true'); render(); });
    });
    form.addEventListener('input', render); form.addEventListener('change', render);
    form.addEventListener('submit', function (e) { e.preventDefault(); render(); });
    document.querySelector('[data-reset]').addEventListener('click', function () {
      state = { q: '', type: 'all', city: 'all', purpose: 'all', price: 'all', minBeds: '0', sort: 'newest' }; writeForm(); render();
    });
    document.querySelector('[data-empty-reset]').addEventListener('click', function () { document.querySelector('[data-reset]').click(); });
    writeForm(); render();
  }

  /* Property detail */
  var detail = document.querySelector('[data-detail]');
  if (detail) {
    var ref = new URLSearchParams(window.location.search).get('id');
    var p = ref ? L.byRef(D.PROPERTIES, ref) : null;
    if (!p) { detail.innerHTML = '<div class="empty"><h2>Listing not found</h2><p>That property ref does not match any demo listing. Browse all listings instead.</p><a class="btn" href="listings.html">View all listings</a></div>'; }
    else {
      document.title = p.title + ' — ' + p.ref + ' | Arz Estates (Demo)';
      detail.innerHTML =
        '<div class="detail-hero"><img src="' + p.img + '" alt="Photo of ' + p.title + ' in ' + p.area + ', ' + p.city + ' (demo listing)"></div>' +
        '<div class="two-col" style="margin-top:26px"><div>' +
        '<span class="badge' + (p.purpose === 'rent' ? ' rent' : '') + '">' + (p.purpose === 'rent' ? 'For Rent' : 'For Sale') + ' · Ref ' + p.ref + '</span>' +
        '<h1 style="font-size:clamp(26px,4vw,38px);margin:10px 0 6px">' + p.title + '</h1>' +
        '<div class="loc">' + p.area + ', ' + p.city + ' · Listed ' + p.addedDays + ' day' + (p.addedDays > 1 ? 's' : '') + ' ago (demo)</div>' +
        '<div class="price num" style="font-size:32px;margin:12px 0">' + L.formatPriceShort(p) + (p.purpose === 'sale' ? '<span class="note num" style="display:block;font-size:15px">Full price: ' + L.formatPKR(p.price) + '</span>' : '') + '</div>' +
        '<p>' + p.desc + '</p><h2 style="font-size:22px;margin-top:22px">Features</h2><ul>' + p.features.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul>' +
        '<h2 style="font-size:22px;margin-top:22px">Full specifications</h2>' +
        '<table class="spec-table num"><tr><th>Reference</th><td>' + p.ref + '</td></tr><tr><th>Type</th><td>' + p.type + '</td></tr><tr><th>Purpose</th><td>' + (p.purpose === 'rent' ? 'For rent' : 'For sale') + '</td></tr><tr><th>City / Area</th><td>' + p.city + ' — ' + p.area + '</td></tr>' + (p.type !== 'plot' ? '<tr><th>Bedrooms</th><td>' + p.beds + '</td></tr><tr><th>Bathrooms</th><td>' + p.baths + '</td></tr>' : '') + '<tr><th>Size</th><td>' + p.sizeLabel + ' (' + L.formatPKR(p.sizeSqft).replace('PKR ', '') + ' sq ft)</td></tr><tr><th>Price</th><td>' + L.formatPriceShort(p) + '</td></tr></table>' +
        (p.purpose === 'sale' ? '<h2 style="font-size:22px;margin-top:26px">Monthly estimate (illustrative)</h2><p class="note">A simple demo estimate only — not financial advice and not a loan offer. Adjust the figures to see how the monthly payment changes.</p>' +
        '<div class="form-grid" style="margin-top:12px"><div><label class="fl" for="c-down">Down payment (%)</label><input class="field num" id="c-down" type="number" min="0" max="90" value="30"></div>' +
        '<div><label class="fl" for="c-years">Tenure (years)</label><input class="field num" id="c-years" type="number" min="1" max="30" value="20"></div>' +
        '<div><label class="fl" for="c-rate">Annual rate (%)</label><input class="field num" id="c-rate" type="number" min="0" max="40" value="18"></div>' +
        '<div><label class="fl">Estimated monthly payment</label><div class="calc-out num" data-calc-out></div></div></div>' : '') +
        '</div><div>' +
        '<div class="panel"><h2 style="font-size:20px">Enquire about ' + p.ref + '</h2><p class="note">Listed by ' + D.AGENT.name + ' · ' + D.AGENT.phoneDisplay + '</p>' +
        '<p style="display:grid;gap:10px"><a class="btn wa" data-wa="' + p.ref + '" target="_blank" rel="noopener" href="' + L.whatsappLink(p, D.AGENT.whatsapp) + '">WhatsApp Enquiry</a>' +
        '<a class="btn ghost" href="contact.html?ref=' + p.ref + '">Use the enquiry form</a></p>' +
        '<p class="note">Demo only: the WhatsApp number is a placeholder and no real agent receives these messages.</p></div>' +
        '<div class="panel map" style="margin-top:18px"><h2 style="font-size:20px">Location — ' + p.area + ', ' + p.city + '</h2><p class="note">Styled location panel (demo). No live map is embedded; open the area in Google Maps instead.</p><a class="btn small ghost" target="_blank" rel="noopener" href="' + L.mapsLink(p) + '">Open in Google Maps</a></div>' +
        '</div></div>';
      bindCards(detail);
      var out = detail.querySelector('[data-calc-out]');
      if (out) {
        var calc = function () { out.textContent = L.formatPKR(L.monthlyEstimate(p.price, +detail.querySelector('#c-down').value, +detail.querySelector('#c-years').value, +detail.querySelector('#c-rate').value)) + ' / month'; };
        ['#c-down', '#c-years', '#c-rate'].forEach(function (s) { detail.querySelector(s).addEventListener('input', calc); }); calc();
      }
      var ld = document.createElement('script'); ld.type = 'application/ld+json';
      ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'RealEstateListing', name: p.title + ' (Demo)', url: 'property.html?id=' + p.ref, offers: { '@type': 'Offer', price: p.price, priceCurrency: 'PKR' } });
      document.head.appendChild(ld);
    }
  }

  /* Enquiry form (contact page) */
  var form2 = document.querySelector('[data-enquiry-form]');
  if (form2) {
    var fld = function (n) { return form2.elements.namedItem(n); };
    var refParam = new URLSearchParams(window.location.search).get('ref');
    if (refParam && fld('ref')) fld('ref').value = refParam;
    function showErrs(errs) { ['name', 'phone', 'ref', 'message'].forEach(function (k) { var el = form2.querySelector('[data-error-for="' + k + '"]'); if (el) el.textContent = errs[k] || ''; }); }
    function vals() { return { name: fld('name').value, phone: fld('phone').value, ref: fld('ref').value, message: fld('message').value }; }
    form2.addEventListener('input', function () {
      var errs = L.validateEnquiry(vals());
      ['name', 'phone', 'ref', 'message'].forEach(function (k) { var el = form2.querySelector('[data-error-for="' + k + '"]'); if (el && el.textContent && !errs[k]) el.textContent = ''; });
    });
    form2.addEventListener('submit', function (e) {
      e.preventDefault();
      var vals = { name: fld('name').value.trim(), phone: fld('phone').value.trim(), ref: fld('ref').value.trim(), message: fld('message').value.trim() };
      var errs = L.validateEnquiry(vals); showErrs(errs);
      if (Object.keys(errs).length) return;
      logPush('arz_enquiry_log', Object.assign({}, vals, { at: new Date().toISOString(), demo: true }));
      form2.hidden = true;
      var s = document.querySelector('[data-enquiry-success]'); s.hidden = false;
      s.querySelector('[data-success-text]').textContent = 'Thank you, ' + vals.name + '. Your demo enquiry' + (vals.ref ? ' about ' + vals.ref : '') + ' has been recorded locally in this browser only — no message has been sent to any real agency.';
    });
  }
})();
