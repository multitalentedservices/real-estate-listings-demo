/* Premium upgrade checks — Clinic + Real Estate (separate from tests.js). */
const { chromium } = require('/home/hatch/workspace/tools/screenshot-engine/node_modules/playwright');
const fs = require('fs'); const path = require('path');
const EXEC = '/home/hatch/workspace/tools/screenshot-engine/browsers/chrome-headless-shell-linux64/chrome-headless-shell';
const CLINIC = '/home/hatch/workspace/portfolio-builds/clinic-website-demo';
const RE = '/home/hatch/workspace/portfolio-builds/real-estate-listings-demo';
let pass = 0, fail = 0; const fails = [];
function ok(c, name) { if (c) { pass++; console.log('PASS', name); } else { fail++; fails.push(name); console.log('FAIL', name); } }
async function scrollHuman(page) {
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 350) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 70)); } window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 200)); });
}
async function audit(page) {
  return page.evaluate(() => {
    const vw = window.innerWidth; const bad = [];
    document.querySelectorAll('body *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
        if (el.closest('.skip-link')) return;
        let clipped = false;
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const ox = getComputedStyle(a).overflowX; if (['hidden','clip','auto','scroll'].includes(ox)) { clipped = true; break; } }
        if (!clipped) bad.push(el.tagName + '.' + String(el.className).split(' ').join('.'));
      }
    });
    const broken = []; document.querySelectorAll('img').forEach(im => { if (im.complete && im.naturalWidth === 0) broken.push(im.getAttribute('src')); });
    return { overflowX: document.documentElement.scrollWidth - vw, bad: bad.slice(0, 6), broken };
  });
}
async function p1(page) {
  return page.evaluate(() => {
    let blue = 0, underlined = 0, n = 0;
    document.querySelectorAll('a').forEach(a => {
      const r = a.getBoundingClientRect(); if (!r.width || !r.height) return;
      const cs = getComputedStyle(a); n++;
      if (cs.color === 'rgb(0, 0, 238)') blue++;
      if (cs.textDecorationLine.includes('underline')) underlined++;
    });
    return { n, blue, underlined };
  });
}
function ratio(fg, bg) {
  const L = c => { c = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const a = L(fg), b = L(bg); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
(async () => {
  const browser = await chromium.launch({ executablePath: EXEC });
  async function ctxPage(opts) { const c = await browser.newContext(opts); const p = await c.newPage(); const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e))); return { c, p, errs }; }

  /* ---------- CLINIC ---------- */
  for (const [file, vp] of [['index.html', [1440, 900]], ['index.html', [390, 844]], ['services.html', [1440, 900]], ['services.html', [390, 844]], ['doctors.html', [390, 844]], ['booking.html', [390, 844]]]) {
    const { c, p, errs } = await ctxPage({ viewport: { width: vp[0], height: vp[1] } });
    await p.goto('file://' + path.join(CLINIC, file)); await p.waitForTimeout(500); await scrollHuman(p);
    const a = await audit(p); const l = await p1(p);
    ok(a.overflowX <= 1 && !a.bad.length && !a.broken.length, `clinic ${file}@${vp[0]} audit clean ${JSON.stringify(a)}`);
    ok(l.blue === 0 && l.underlined === 0, `clinic ${file}@${vp[0]} P1 links (${l.n} links, blue ${l.blue}, underlined ${l.underlined})`);
    ok(errs.length === 0, `clinic ${file}@${vp[0]} console clean ${errs.join(';')}`);
    await c.close();
  }
  { // clinic index: count-up + hero scrub + contrast + signature
    const { c, p } = await ctxPage({ viewport: { width: 1440, height: 900 } });
    await p.goto('file://' + path.join(CLINIC, 'index.html')); await p.waitForTimeout(600);
    await p.evaluate(() => document.querySelector('.stats-band').scrollIntoView({ block: 'center' })); await p.waitForTimeout(2200);
    const nums = await p.evaluate(() => [...document.querySelectorAll('[data-count]')].map(e => e.textContent));
    ok(JSON.stringify(nums) === JSON.stringify(['12', '4', '4', '6']), 'clinic count-up completes to existing figures ' + nums.join(','));
    const cr = await p.evaluate(() => {
      const num = document.querySelector('.stat-num'); const cs = getComputedStyle(num);
      const lab = document.querySelector('.stat-label');
      return { numColor: cs.color, numBg: getComputedStyle(num.closest('.stat')).backgroundColor, labColor: getComputedStyle(lab).color };
    });
    const parse = s => s.match(/\d+/g).slice(0, 3).map(Number);
    ok(ratio(parse(cr.numColor), parse(cr.numBg)) >= 4.5, 'clinic stat-num contrast ' + ratio(parse(cr.numColor), parse(cr.numBg)).toFixed(2) + ':1');
    ok(ratio(parse(cr.labColor), parse(cr.numBg)) >= 4.5, 'clinic stat-label contrast ' + ratio(parse(cr.labColor), parse(cr.numBg)).toFixed(2) + ':1');
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
    await p.evaluate(() => window.scrollTo(0, document.querySelector('.hero').offsetHeight * 0.55)); await p.waitForTimeout(700);
    const op = await p.evaluate(() => [...document.querySelectorAll('.hero-frame:not(.is-first)')].map(f => parseFloat(getComputedStyle(f).opacity)));
    ok(op.some(o => o > 0.15), 'clinic hero scrub crossfade mid-scroll opacities ' + op.join(','));
    await p.screenshot({ path: path.join(CLINIC, 'screenshots/signature-moment.png') });
    await c.close();
  }
  { // clinic services: swiper + keyboard
    const { c, p } = await ctxPage({ viewport: { width: 1440, height: 900 } });
    await p.goto('file://' + path.join(CLINIC, 'services.html')); await p.waitForTimeout(700);
    ok(await p.evaluate(() => document.querySelector('.svc-swiper').classList.contains('swiper-initialized')), 'clinic services swiper initialised');
    ok(await p.evaluate(() => document.querySelectorAll('.svc-swiper .swiper-slide').length) === 12, 'clinic slider has all 12 services');
    const before = await p.evaluate(() => document.querySelector('.svc-swiper').swiper.activeIndex);
    await p.focus('.svc-next'); await p.keyboard.press('Enter'); await p.waitForTimeout(600);
    const after = await p.evaluate(() => document.querySelector('.svc-swiper').swiper.activeIndex);
    ok(after > before, `clinic slider keyboard: Enter on Next advances (${before}->${after})`);
    const foc = await p.evaluate(() => { const cs = getComputedStyle(document.querySelector('.svc-next')); return cs.outlineWidth + ' ' + cs.outlineStyle; });
    ok(foc.startsWith('3px'), 'clinic slider button focus outline ' + foc);
    await c.close();
  }
  { // clinic reduced motion
    const { c, p } = await ctxPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await p.goto('file://' + path.join(CLINIC, 'index.html')); await p.waitForTimeout(500); await scrollHuman(p);
    const st = await p.evaluate(() => ({ nums: [...document.querySelectorAll('[data-count]')].map(e => e.textContent), frames: [...document.querySelectorAll('.hero-frame:not(.is-first)')].map(f => getComputedStyle(f).opacity) }));
    ok(JSON.stringify(st.nums) === JSON.stringify(['12', '4', '4', '6']) && st.frames.every(o => o === '0'), 'clinic reduced-motion: figures final, sequence static ' + JSON.stringify(st));
    await p.goto('file://' + path.join(CLINIC, 'services.html')); await p.waitForTimeout(400);
    const sv = await p.evaluate(() => ({ init: document.querySelector('.svc-swiper').classList.contains('swiper-initialized'), visible: [...document.querySelectorAll('.svc-swiper .swiper-slide')].filter(s => s.getBoundingClientRect().height > 0).length }));
    ok(!sv.init && sv.visible === 12, 'clinic reduced-motion: slider static grid, all 12 visible ' + JSON.stringify(sv));
    await c.close();
  }
  { // clinic no-JS
    const { c, p } = await ctxPage({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    await p.goto('file://' + path.join(CLINIC, 'services.html')); await p.waitForTimeout(400);
    const sv = await p.evaluate(() => [...document.querySelectorAll('.svc-swiper .swiper-slide')].filter(s => s.getBoundingClientRect().height > 0).length);
    ok(sv === 12, 'clinic no-JS: all 12 slider services visible as cards (' + sv + ')');
    await p.goto('file://' + path.join(CLINIC, 'index.html')); await p.waitForTimeout(300);
    const n = await p.evaluate(() => document.querySelector('[data-count]').textContent);
    ok(n === '12', 'clinic no-JS: numbers block reads final figures');
    await c.close();
  }

  /* ---------- REAL ESTATE ---------- */
  for (const [file, vp] of [['index.html', [1440, 900]], ['index.html', [390, 844]], ['listings.html', [1440, 900]], ['listings.html', [390, 844]], ['property.html?id=AP-1001', [1440, 900]], ['property.html?id=AP-1001', [390, 844]], ['about.html', [390, 844]], ['contact.html', [390, 844]]]) {
    const { c, p, errs } = await ctxPage({ viewport: { width: vp[0], height: vp[1] } });
    await p.goto('file://' + path.join(RE, file)); await p.waitForTimeout(500); await scrollHuman(p);
    const a = await audit(p); const l = await p1(p);
    ok(a.overflowX <= 1 && !a.bad.length && !a.broken.length, `RE ${file}@${vp[0]} audit clean ${JSON.stringify(a)}`);
    ok(l.blue === 0 && l.underlined === 0, `RE ${file}@${vp[0]} P1 links (${l.n} links, blue ${l.blue}, underlined ${l.underlined})`);
    ok(errs.length === 0, `RE ${file}@${vp[0]} console clean ${errs.join(';')}`);
    await c.close();
  }
  { // RE index parallax + signature
    const { c, p } = await ctxPage({ viewport: { width: 1440, height: 900 } });
    await p.goto('file://' + path.join(RE, 'index.html')); await p.waitForTimeout(700);
    await p.evaluate(() => document.querySelector('[data-featured]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(600);
    const t = await p.evaluate(() => getComputedStyle(document.querySelector('[data-featured] .card img')).transform);
    ok(t !== 'none' && t !== 'matrix(1, 0, 0, 1, 0, 0)', 'RE card parallax transform active: ' + t);
    const eager = await p.evaluate(() => [...document.querySelectorAll('[data-featured] .card img')].every(i => i.loading !== 'lazy' && i.complete && i.naturalWidth > 0));
    ok(eager, 'RE featured images eager + painted (no lazy blank)');
    await p.screenshot({ path: path.join(RE, 'screenshots/signature-moment.png') });
    await c.close();
  }
  { // RE listings: animated count + URL state intact (Lahore count verified against data: expect from battery flow = city Lahore total)
    const { c, p } = await ctxPage({ viewport: { width: 1440, height: 900 } });
    await p.goto('file://' + path.join(RE, 'listings.html')); await p.waitForTimeout(600);
    await p.selectOption('#f-city', 'Lahore'); await p.waitForTimeout(900);
    const st = await p.evaluate(() => ({ count: document.querySelector('[data-result-count]').textContent, url: location.search, cards: document.querySelectorAll('[data-listings-grid] .card').length }));
    ok(st.cards > 0 && st.count.startsWith(String(st.cards)) && st.url.includes('city=Lahore'), 'RE filter after count animation: ' + JSON.stringify(st));
    await p.selectOption('#f-city', 'all'); await p.waitForTimeout(900);
    const back = await p.evaluate(() => document.querySelector('[data-result-count]').textContent);
    ok(back.startsWith('14'), 'RE count animates back to 14: ' + back);
    await c.close();
  }
  { // RE property: gallery + chapter
    const { c, p } = await ctxPage({ viewport: { width: 1440, height: 900 } });
    await p.goto('file://' + path.join(RE, 'property.html?id=AP-1001')); await p.waitForTimeout(800); await scrollHuman(p);
    const g = await p.evaluate(() => ({ init: document.querySelector('.prop-swiper').classList.contains('swiper-initialized'), slides: document.querySelectorAll('.prop-swiper .swiper-slide').length, chapter: document.querySelector('.chapter-title') ? document.querySelector('.chapter-title').textContent : null, near: document.querySelectorAll('.chapter-near li').length }));
    ok(g.init && g.slides === 3, 'RE property gallery initialised, 3 views of own photo ' + JSON.stringify(g));
    ok(g.chapter === 'DHA Phase 6' && g.near >= 1, 'RE neighbourhood chapter for AP-1001: ' + JSON.stringify(g));
    const b = await p.evaluate(() => document.querySelector('.prop-swiper').swiper.activeIndex);
    await p.focus('.prop-next'); await p.keyboard.press('Enter'); await p.waitForTimeout(600);
    const a2 = await p.evaluate(() => document.querySelector('.prop-swiper').swiper.activeIndex);
    ok(a2 > b, `RE gallery keyboard advance (${b}->${a2})`);
    await c.close();
  }
  { // RE reduced + nojs
    const { c, p } = await ctxPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await p.goto('file://' + path.join(RE, 'property.html?id=AP-1001')); await p.waitForTimeout(600);
    const g = await p.evaluate(() => ({ init: document.querySelector('.prop-swiper').classList.contains('swiper-initialized'), visible: [...document.querySelectorAll('.prop-swiper .swiper-slide')].filter(s => s.getBoundingClientRect().height > 0).length, chapter: !!document.querySelector('.chapter') }));
    ok(!g.init && g.visible === 3 && g.chapter, 'RE reduced-motion: gallery stacked static, chapter present ' + JSON.stringify(g));
    await c.close();
    const n = await ctxPage({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    await n.p.goto('file://' + path.join(RE, 'index.html')); await n.p.waitForTimeout(400);
    const a = await audit(n.p); ok(a.overflowX <= 1 && !a.broken.length, 'RE no-JS index clean ' + JSON.stringify(a));
    await n.c.close();
  }
  console.log(`\nPREMIUM CHECKS: ${pass} PASS / ${fail} FAIL`); if (fails.length) console.log('FAILURES:', fails.join(' | '));
  await browser.close(); process.exit(fail ? 1 : 0);
})();
