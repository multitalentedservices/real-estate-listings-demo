/* Arz Estates (Demo) — pure logic, shared by the site and the Node test battery. No DOM. */
(function (global) {
  'use strict';
  var PRICE_BANDS = {
    'all': null,
    'lt-1cr': [0, 10000000],
    '1-5cr': [10000000, 50000000],
    '5-10cr': [50000000, 100000000],
    'gt-10cr': [100000000, Infinity]
  };
  var BAND_LABELS = { 'lt-1cr': 'under PKR 1 Crore', '1-5cr': 'PKR 1–5 Crore', '5-10cr': 'PKR 5–10 Crore', 'gt-10cr': 'over PKR 10 Crore' };
  function byRef(list, ref) { for (var i = 0; i < list.length; i++) if (list[i].ref === ref) return list[i]; return null; }
  function matchesQuery(p, q) {
    if (!q) return true;
    var hay = (p.title + ' ' + p.city + ' ' + p.area + ' ' + p.ref + ' ' + p.type).toLowerCase();
    return q.toLowerCase().split(/\s+/).filter(Boolean).every(function (w) { return hay.indexOf(w) !== -1; });
  }
  function filterProperties(list, f) {
    f = f || {};
    var band = PRICE_BANDS[f.price || 'all'];
    return list.filter(function (p) {
      if (!matchesQuery(p, f.q || '')) return false;
      if (f.type && f.type !== 'all' && p.type !== f.type) return false;
      if (f.city && f.city !== 'all' && p.city !== f.city) return false;
      if (f.purpose && f.purpose !== 'all' && p.purpose !== f.purpose) return false;
      if (band && (p.price < band[0] || p.price >= band[1])) return false;
      if (f.minBeds && p.beds < +f.minBeds) return false;
      return true;
    });
  }
  function sortProperties(list, sort) {
    var out = list.slice();
    if (sort === 'price-asc') out.sort(function (a, b) { return a.price - b.price; });
    else if (sort === 'price-desc') out.sort(function (a, b) { return b.price - a.price; });
    else if (sort === 'size-desc') out.sort(function (a, b) { return b.sizeSqft - a.sizeSqft; });
    else if (sort === 'size-asc') out.sort(function (a, b) { return a.sizeSqft - b.sizeSqft; });
    else out.sort(function (a, b) { return a.addedDays - b.addedDays; }); /* newest */
    return out;
  }
  function searchProperties(list, f, sort) { return sortProperties(filterProperties(list, f), sort || 'newest'); }
  function formatPKR(n) { return 'PKR ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function trimNum(x) { return (Math.round(x * 100) / 100).toString(); }
  function formatPriceShort(p) {
    if (p.purpose === 'rent') return formatPKR(p.price) + ' / month';
    if (p.price >= 10000000) return 'PKR ' + trimNum(p.price / 10000000) + ' Crore';
    if (p.price >= 100000) return 'PKR ' + trimNum(p.price / 100000) + ' Lakh';
    return formatPKR(p.price);
  }
  function monthlyEstimate(price, downPct, years, annualRatePct) {
    var principal = price * (1 - (downPct || 0) / 100);
    var n = Math.round((years || 0) * 12);
    if (n <= 0 || principal <= 0) return 0;
    var r = (annualRatePct || 0) / 100 / 12;
    if (r === 0) return Math.round(principal / n);
    var m = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    return Math.round(m);
  }
  function whatsappLink(p, waNumber) {
    var msg = 'Assalam-o-Alaikum, I am interested in property ' + p.ref + ' — ' + p.title + ' (' + p.area + ', ' + p.city + '), listed at ' + formatPriceShort(p) + '. Please share more details. (Demo enquiry)';
    return 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(msg);
  }
  function mapsLink(p) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.area + ', ' + p.city + ', Pakistan'); }
  function normalisePhone(raw) { return String(raw || '').replace(/[\s-]/g, '').replace(/^\+92/, '0'); }
  function validPhone(raw) { return /^03\d{9}$/.test(normalisePhone(raw)); }
  function validateEnquiry(e) {
    var errs = {};
    if (!e.name || e.name.trim().length < 3) errs.name = 'Please enter your full name.';
    if (!validPhone(e.phone)) errs.phone = 'Please enter a valid Pakistani mobile number (e.g. 0321 1234567).';
    if (e.ref && !/^AP-\d{4}$/.test(e.ref.trim())) errs.ref = 'Property ref looks like AP-1001 — check the ref on the listing, or leave it blank.';
    if (!e.message || e.message.trim().length < 10) errs.message = 'Please write a short message (at least 10 characters).';
    return errs;
  }
  function activeConstraints(f) {
    var out = [];
    if (f.q) out.push('keyword "' + f.q + '"');
    if (f.type && f.type !== 'all') out.push('type: ' + f.type);
    if (f.city && f.city !== 'all') out.push('city: ' + f.city);
    if (f.purpose && f.purpose !== 'all') out.push('purpose: ' + (f.purpose === 'sale' ? 'for sale' : 'for rent'));
    if (f.price && f.price !== 'all') out.push('price ' + BAND_LABELS[f.price]);
    if (f.minBeds && +f.minBeds > 0) out.push('at least ' + f.minBeds + ' bed' + (+f.minBeds > 1 ? 's' : ''));
    return out;
  }
  function emptyMessage(f) {
    var c = activeConstraints(f);
    return c.length ? 'No properties match ' + c.join(' + ') + '. Try removing one filter, or reset the search to see all listings.'
                     : 'No properties to show right now.';
  }
  function filtersToQuery(f) {
    var parts = [];
    ['q', 'type', 'city', 'purpose', 'price', 'minBeds', 'sort'].forEach(function (k) {
      if (f[k] && f[k] !== 'all' && f[k] !== 'newest' && f[k] !== '0') parts.push(k + '=' + encodeURIComponent(f[k]));
    });
    return parts.length ? '?' + parts.join('&') : '';
  }
  function queryToFilters(search) {
    var f = { q: '', type: 'all', city: 'all', purpose: 'all', price: 'all', minBeds: '0', sort: 'newest' };
    String(search || '').replace(/^\?/, '').split('&').forEach(function (pair) {
      if (!pair) return; var kv = pair.split('='); var k = kv[0], v = decodeURIComponent(kv[1] || '');
      if (k in f) f[k] = v;
    });
    return f;
  }
  function toggleFav(favs, ref) { var out = favs.slice(); var i = out.indexOf(ref); if (i === -1) out.push(ref); else out.splice(i, 1); return out; }
  global.ESTATE_LOGIC = { PRICE_BANDS: PRICE_BANDS, BAND_LABELS: BAND_LABELS, byRef: byRef, matchesQuery: matchesQuery, filterProperties: filterProperties, sortProperties: sortProperties, searchProperties: searchProperties, formatPKR: formatPKR, formatPriceShort: formatPriceShort, monthlyEstimate: monthlyEstimate, whatsappLink: whatsappLink, mapsLink: mapsLink, normalisePhone: normalisePhone, validPhone: validPhone, validateEnquiry: validateEnquiry, activeConstraints: activeConstraints, emptyMessage: emptyMessage, filtersToQuery: filtersToQuery, queryToFilters: queryToFilters, toggleFav: toggleFav };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.ESTATE_LOGIC;
})(typeof window !== 'undefined' ? window : globalThis);
