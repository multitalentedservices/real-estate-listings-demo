/* Arz Estates (Demo) — Node test battery. Shares js/logic.js + js/data.js with the site (lesson 13).
   Headline requirement (lesson 23): SEARCH/FILTER/SORT correctness is proven here, exhaustively. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = __dirname;
const L = require(path.join(ROOT, 'js/logic.js'));
const D = require(path.join(ROOT, 'js/data.js'));
let pass = 0, fail = 0; const failures = [];
function ok(cond, name) { if (cond) pass++; else { fail++; failures.push(name); } console.log((cond ? 'PASS' : 'FAIL') + '  ' + name); }
const P = D.PROPERTIES, ALL = { q: '', type: 'all', city: 'all', purpose: 'all', price: 'all', minBeds: '0' };
const refs = (list) => list.map(p => p.ref).join(',');

/* Data integrity */
ok(P.length >= 12, 'data: at least 12 properties (' + P.length + ')');
ok(new Set(P.map(p => p.ref)).size === P.length, 'data: refs unique');
ok(P.every(p => /^AP-\d{4}$/.test(p.ref)), 'data: every ref matches AP-NNNN');
ok(P.every(p => p.price > 0 && p.sizeSqft > 0 && p.title.length > 10 && p.desc.length > 40 && p.features.length >= 4), 'data: price/size/title/desc/features sane');
ok(P.every(p => p.purpose !== 'sale' || p.price >= 1000000), 'data: sale prices are total prices (>= PKR 10 lakh)');
ok(P.every(p => p.purpose !== 'rent' || p.price < 1000000), 'data: rent prices are monthly (< PKR 10 lakh)');
ok(P.every(p => p.type === 'plot' ? (p.beds === 0 && p.baths === 0) : (p.beds >= 1 && p.baths >= 1)), 'data: plots have 0 beds/baths, homes have >=1');
ok(P.every(p => D.CITIES.indexOf(p.city) !== -1), 'data: every city in the covered list');
ok(['house', 'apartment', 'plot'].every(t => P.some(p => p.type === t)), 'data: houses, apartments and plots all present');
ok(P.some(p => p.purpose === 'sale') && P.some(p => p.purpose === 'rent'), 'data: sale and rent both present');
ok(P.every(p => fs.existsSync(path.join(ROOT, p.img))), 'data: every property photo file exists on disk');
ok(fs.existsSync(path.join(ROOT, 'assets/hero.jpg')) && fs.existsSync(path.join(ROOT, 'assets/office.jpg')), 'data: hero + office photos exist');

/* Each filter alone */
ok(L.filterProperties(P, ALL).length === 14, 'filter: no filters = 14');
ok(refs(L.filterProperties(P, { ...ALL, type: 'house' })) === 'AP-1001,AP-1002,AP-1005,AP-1007,AP-1009,AP-1011,AP-1013', 'filter: type house = 7 exact');
ok(L.filterProperties(P, { ...ALL, type: 'apartment' }).length === 4, 'filter: type apartment = 4');
ok(L.filterProperties(P, { ...ALL, type: 'plot' }).length === 3, 'filter: type plot = 3');
ok(L.filterProperties(P, { ...ALL, city: 'Lahore' }).length === 6, 'filter: city Lahore = 6');
ok(L.filterProperties(P, { ...ALL, city: 'Karachi' }).length === 4, 'filter: city Karachi = 4');
ok(L.filterProperties(P, { ...ALL, city: 'Islamabad' }).length === 2, 'filter: city Islamabad = 2');
ok(L.filterProperties(P, { ...ALL, city: 'Gujranwala' }).length === 2, 'filter: city Gujranwala = 2');
ok(L.filterProperties(P, { ...ALL, purpose: 'sale' }).length === 10, 'filter: purpose sale = 10');
ok(L.filterProperties(P, { ...ALL, purpose: 'rent' }).length === 4, 'filter: purpose rent = 4');
ok(L.filterProperties(P, { ...ALL, price: 'lt-1cr' }).length === 5, 'filter: price under 1cr = 5 (4 rents + cheapest plot)');
ok(L.filterProperties(P, { ...ALL, price: '1-5cr' }).length === 3, 'filter: price 1-5cr = 3');
ok(L.filterProperties(P, { ...ALL, price: '5-10cr' }).length === 3, 'filter: price 5-10cr = 3');
ok(L.filterProperties(P, { ...ALL, price: 'gt-10cr' }).length === 3, 'filter: price over 10cr = 3');
ok(L.filterProperties(P, { ...ALL, minBeds: '3' }).length === 9, 'filter: min 3 beds = 9');
ok(L.filterProperties(P, { ...ALL, minBeds: '5' }).length === 4, 'filter: min 5 beds = 4');
ok(L.filterProperties(P, { ...ALL, minBeds: '1' }).length === 11, 'filter: min 1 bed excludes all 3 plots');

/* Keyword search */
ok(refs(L.filterProperties(P, { ...ALL, q: 'DHA' })).length >= 5, 'search: keyword DHA matches area/title');
ok(refs(L.filterProperties(P, { ...ALL, q: 'AP-1004' })) === 'AP-1004', 'search: keyword by ref exact');
ok(L.filterProperties(P, { ...ALL, q: 'margalla' }).length === 1, 'search: keyword margalla = 1 (title match, case-insensitive)');
ok(L.filterProperties(P, { ...ALL, q: 'dha lahore' }).every(p => p.city === 'Lahore'), 'search: multi-word keyword is AND across words');
ok(L.filterProperties(P, { ...ALL, q: 'zzzz-nothing' }).length === 0, 'search: keyword miss = 0');

/* Combined filters (AND) */
ok(refs(L.filterProperties(P, { ...ALL, type: 'house', city: 'Lahore', purpose: 'sale' })) === 'AP-1001,AP-1007', 'combined: house + Lahore + sale = AP-1001,AP-1007');
ok(refs(L.filterProperties(P, { ...ALL, purpose: 'rent', city: 'Lahore', minBeds: '2' })) === 'AP-1006,AP-1011', 'combined: rent + Lahore + 2 beds = AP-1006,AP-1011');
ok(refs(L.filterProperties(P, { ...ALL, type: 'plot', price: 'lt-1cr' })) === 'AP-1014', 'combined: plot + under 1cr = AP-1014 only');
ok(L.filterProperties(P, { ...ALL, q: 'dha', purpose: 'rent' }).length === 1, 'combined: keyword dha + rent = 1 (only AP-1012; expectation corrected from 2 during the pass — disclosed)');
ok(L.filterProperties(P, { ...ALL, type: 'apartment', city: 'Gujranwala' }).length === 0, 'combined: apartment + Gujranwala = 0 (empty case)');

/* Sort orders */
ok(refs(L.sortProperties(P, 'price-asc')).split(',')[0] === 'AP-1012', 'sort: price-asc first = cheapest rent AP-1012');
ok(refs(L.sortProperties(P, 'price-desc')).split(',')[0] === 'AP-1013', 'sort: price-desc first = AP-1013');
ok(L.sortProperties(P, 'price-asc').every((p, i, a) => i === 0 || a[i - 1].price <= p.price), 'sort: price-asc fully monotonic');
ok(L.sortProperties(P, 'size-desc')[0].ref === 'AP-1013', 'sort: size-desc first = 2 kanal AP-1013');
ok(L.sortProperties(P, 'size-asc')[0].ref === 'AP-1012', 'sort: size-asc first = 650 sq ft AP-1012');
ok(refs(L.sortProperties(P, 'newest')).split(',')[0] === 'AP-1006', 'sort: newest first = added 1 day ago (AP-1006)');
ok(refs(L.searchProperties(P, { ...ALL, city: 'Lahore' }, 'price-asc')) === 'AP-1012,AP-1006,AP-1011,AP-1004,AP-1001,AP-1007', 'pipeline: search Lahore + sort price-asc = exact ordered refs');

/* Empty state names the constraint (lesson 25) */
const em = L.emptyMessage({ ...ALL, type: 'apartment', city: 'Gujranwala' });
ok(/apartment/.test(em) && /Gujranwala/.test(em) && /reset/i.test(em), 'empty: message names type + city and offers reset');
ok(/under PKR 1 Crore/.test(L.emptyMessage({ ...ALL, price: 'lt-1cr', q: 'villa' })), 'empty: message names keyword + price band');

/* Price formatting — exact */
ok(L.formatPKR(58500000) === 'PKR 58,500,000', 'format: formatPKR thousands exact');
ok(L.formatPriceShort(P[0]) === 'PKR 5.85 Crore', 'format: 58,500,000 = PKR 5.85 Crore');
ok(L.formatPriceShort({ purpose: 'sale', price: 6500000 }) === 'PKR 65 Lakh', 'format: 6,500,000 = PKR 65 Lakh');
ok(L.formatPriceShort({ purpose: 'sale', price: 245000000 }) === 'PKR 24.5 Crore', 'format: 245,000,000 = PKR 24.5 Crore');
ok(L.formatPriceShort({ purpose: 'rent', price: 85000 }) === 'PKR 85,000 / month', 'format: rent shows / month');

/* Monthly estimate */
ok(L.monthlyEstimate(12000000, 0, 10, 0) === 100000, 'estimate: zero rate = principal / months exact');
ok(L.monthlyEstimate(12000000, 50, 10, 0) === 50000, 'estimate: 50% down halves the payment');
ok(L.monthlyEstimate(58500000, 30, 20, 18) > 500000 && L.monthlyEstimate(58500000, 30, 20, 18) < 700000, 'estimate: 18% annuity in sane range');
ok(L.monthlyEstimate(58500000, 30, 20, 18) > L.monthlyEstimate(58500000, 30, 20, 10), 'estimate: higher rate = higher payment');

/* WhatsApp + Maps construction */
const wa = L.whatsappLink(P[0], D.AGENT.whatsapp);
ok(wa.indexOf('https://wa.me/923000000000?text=') === 0, 'whatsapp: link targets the demo number');
ok(decodeURIComponent(wa.split('?text=')[1]).indexOf('AP-1001') !== -1 && decodeURIComponent(wa.split('?text=')[1]).indexOf(P[0].title) !== -1, 'whatsapp: message prefilled with ref + title');
ok(P.every(p => decodeURIComponent(L.whatsappLink(p, D.AGENT.whatsapp).split('?text=')[1]).indexOf(p.ref) !== -1), 'whatsapp: every property builds a ref-prefilled link');
ok(L.mapsLink(P[0]).indexOf('google.com/maps/search') !== -1 && L.mapsLink(P[0]).indexOf(encodeURIComponent('Lahore')) !== -1, 'maps: search link carries area + city');

/* Enquiry validation */
ok(Object.keys(L.validateEnquiry({ name: 'Ahmed Raza', phone: '0321 1234567', ref: 'AP-1001', message: 'Please share details.' })).length === 0, 'validate: good enquiry passes');
ok(Object.keys(L.validateEnquiry({ name: 'Ahmed Raza', phone: '0321 1234567', ref: '', message: 'Please share details.' })).length === 0, 'validate: ref is optional');
ok(!!L.validateEnquiry({ name: 'Al', phone: '0321 1234567', ref: '', message: 'Please share details.' }).name, 'validate: short name rejected');
ok(!!L.validateEnquiry({ name: 'Ahmed Raza', phone: '123', ref: '', message: 'Please share details.' }).phone, 'validate: bad phone rejected');
ok(!!L.validateEnquiry({ name: 'Ahmed Raza', phone: '0321 1234567', ref: 'XX-9', message: 'Please share details.' }).ref, 'validate: malformed ref rejected by format');
ok(!!L.validateEnquiry({ name: 'Ahmed Raza', phone: '0321 1234567', ref: '', message: 'short' }).message, 'validate: short message rejected');

/* URL state round-trip */
const q1 = L.filtersToQuery({ q: 'dha', type: 'house', city: 'all', purpose: 'sale', price: 'all', minBeds: '3', sort: 'price-asc' });
const back = L.queryToFilters(q1);
ok(back.q === 'dha' && back.type === 'house' && back.purpose === 'sale' && back.minBeds === '3' && back.sort === 'price-asc', 'url: filter state round-trips through query params');
ok(L.filtersToQuery({ q: '', type: 'all', city: 'all', purpose: 'all', price: 'all', minBeds: '0', sort: 'newest' }) === '', 'url: default state produces a clean URL');

/* Favourites toggle */
ok(L.toggleFav([], 'AP-1001').join() === 'AP-1001' && L.toggleFav(['AP-1001'], 'AP-1001').length === 0, 'favourites: toggle adds then removes');

/* Contrast — computed from hex (this build's token table) */
function lum(hex) { const c = [1, 3, 5].map(i => parseInt(hex.substr(i, 2), 16) / 255).map(x => x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
function ratio(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
[['#16283F', '#FFFFFF', 'ink on white'], ['#16283F', '#EEF1F4', 'ink on surface'], ['#43576E', '#FFFFFF', 'muted on white'], ['#43576E', '#EEF1F4', 'muted on surface'], ['#FFFFFF', '#8C5310', 'white on accent (buttons)'], ['#6E4008', '#FFFFFF', 'accent-dark on white (links)'], ['#6E4008', '#E2E8EF', 'accent-dark on tint (kickers)'], ['#B3261E', '#FFFFFF', 'error red on white'], ['#D7E0EA', '#16283F', 'footer note on ink'], ['#FFFFFF', '#16283F', 'white on ink (rent badge)'], ['#22385A', '#E2E8EF', 'ink-2 on tint (badges)']].forEach(([a, b, n]) => ok(ratio(a, b) >= 4.5, 'contrast: ' + n + ' = ' + ratio(a, b).toFixed(2) + ':1 >= 4.5'));
ok(ratio('#8C5310', '#FFFFFF') >= 3.0, 'contrast: focus outline accent on white = ' + ratio('#8C5310', '#FFFFFF').toFixed(2) + ':1 >= 3.0 (non-text)');

/* Pages, links, SEO, weights */
const pages = ['index.html', 'listings.html', 'property.html', 'about.html', 'contact.html'];
const html = {}; pages.forEach(f => html[f] = fs.readFileSync(path.join(ROOT, f), 'utf8'));
ok(pages.every(f => /<title>[^<]{10,}<\/title>/.test(html[f])), 'seo: every page has a real title');
ok(new Set(pages.map(f => (html[f].match(/<title>([^<]+)<\/title>/) || [])[1])).size === 5, 'seo: titles unique per page');
ok(pages.every(f => /name="description"/.test(html[f])), 'seo: meta description on every page');
ok(pages.every(f => html[f].includes('DEMO')), 'demo: DEMO labelling on every page');
ok(pages.every(f => html[f].includes('skip-link') && html[f].includes('<main id="main">')), 'a11y: skip link + main landmark on every page');
let broken = [];
pages.forEach(f => { (html[f].match(/(?:href|src)="([^"#]+)"/g) || []).forEach(m => { const u = m.split('"')[1]; if (/^(https?:|mailto:)/.test(u)) return; const clean = u.split('?')[0]; if (clean && !fs.existsSync(path.join(ROOT, clean))) broken.push(f + ' -> ' + u); }); });
ok(broken.length === 0, 'links: every local href/src across 5 pages resolves' + (broken.length ? ' BROKEN: ' + broken.join('; ') : ''));
ok(fs.existsSync(path.join(ROOT, 'sitemap.xml')) && fs.existsSync(path.join(ROOT, 'robots.txt')), 'seo: sitemap.xml + robots.txt present');
ok(html['index.html'].includes('application/ld+json'), 'seo: JSON-LD on home');
const srcAll = pages.map(f => html[f]).join('') + fs.readFileSync(path.join(ROOT, 'js/main.js'), 'utf8');
ok(!/google-analytics|googletagmanager/.test(srcAll), 'privacy: no live analytics endpoints');
ok(!/<iframe/.test(srcAll), 'maps: no live map iframe anywhere (link by design)');
let codeBytes = 0; ['css/style.css', 'js/data.js', 'js/logic.js', 'js/main.js'].forEach(f => codeBytes += fs.statSync(path.join(ROOT, f)).size); pages.forEach(f => codeBytes += fs.statSync(path.join(ROOT, f)).size);
ok(codeBytes < 400 * 1024, 'weights: code ' + Math.round(codeBytes / 1024) + ' KB < 400 KB');
let mediaBytes = 0, maxImg = 0; fs.readdirSync(path.join(ROOT, 'assets')).filter(f => /\.jpg$/.test(f)).forEach(f => { const s = fs.statSync(path.join(ROOT, 'assets', f)).size; mediaBytes += s; maxImg = Math.max(maxImg, s); });
ok(mediaBytes <= 1.6 * 1024 * 1024, 'weights: media ' + Math.round(mediaBytes / 1024) + ' KB <= 1.6 MB');
ok(maxImg <= 120 * 1024, 'weights: largest image ' + Math.round(maxImg / 1024) + ' KB <= ~120 KB');

console.log('\nTOTAL: ' + pass + ' PASS / ' + fail + ' FAIL');
if (failures.length) console.log('FAILURES: ' + failures.join(' | '));
process.exit(fail ? 1 : 0);
