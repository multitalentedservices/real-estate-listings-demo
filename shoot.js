/* Arz Estates (Demo) — screenshot + layout-audit runner.
   Usage: node shoot.js <outDir> [--nojs] [--probe320] [--flows] [--reduced] [--keyboard] */
const { chromium } = require('/home/hatch/workspace/tools/screenshot-engine/node_modules/playwright');
const fs = require('fs'); const path = require('path');
const ROOT = '/home/hatch/workspace/portfolio-builds/real-estate-listings-demo';
const EXEC = '/home/hatch/workspace/tools/screenshot-engine/browsers/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = process.argv[2];
const NOJS = process.argv.includes('--nojs'), PROBE = process.argv.includes('--probe320');
const FLOWS = process.argv.includes('--flows'), REDUCED = process.argv.includes('--reduced'), KEYBOARD = process.argv.includes('--keyboard');
const PAGES = [['index', 'index.html'], ['listings', 'listings.html'], ['property', 'property.html?id=AP-1001'], ['about', 'about.html'], ['contact', 'contact.html']];
const VIEWPORTS = PROBE ? [['probe320', 320, 700]] : [['phone', 390, 844], ['tablet', 768, 1024], ['desktop', 1440, 900]];

async function auditPage(page) {
  return page.evaluate(() => {
    const vw = window.innerWidth; const bad = [];
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
        if (el.closest('.skip-link')) return;
        let clipped = false;
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const ox = getComputedStyle(a).overflowX; if (ox === 'hidden' || ox === 'clip' || ox === 'auto' || ox === 'scroll') { clipped = true; break; } }
        if (!clipped) bad.push({ el: el.tagName.toLowerCase() + '.' + String(el.className).split(' ').join('.'), right: Math.round(r.right) });
      }
    });
    const hidden = []; document.querySelectorAll('.reveal').forEach((el) => { if (parseFloat(getComputedStyle(el).opacity) < 0.05) hidden.push(el.tagName); });
    const broken = []; document.querySelectorAll('img').forEach((im) => { if (im.complete && im.naturalWidth === 0) broken.push(im.getAttribute('src')); });
    const textBad = [];
    document.querySelectorAll('body *').forEach((el) => {
      if (el.children.length || !el.textContent || !el.textContent.trim() || el.closest('.skip-link')) return;
      if (el.scrollWidth > el.clientWidth + 1) textBad.push({ el: el.tagName.toLowerCase() + '.' + String(el.className).split(' ').join('.'), sw: el.scrollWidth, cw: el.clientWidth, text: el.textContent.trim().slice(0, 40) });
    });
    return { overflowX: document.documentElement.scrollWidth - vw, badEls: bad.slice(0, 12), hiddenCount: hidden.length, brokenImgs: broken, textBad: textBad.slice(0, 12) };
  });
}
async function settle(page) {
  if (NOJS) { await page.waitForTimeout(600); return; }
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
  await page.waitForFunction(() => [...document.querySelectorAll('.reveal')].every(el => parseFloat(getComputedStyle(el).opacity) > 0.95), null, { timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(300);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--proxy-server=http://hatch-egress-proxy:3128', '--no-sandbox', '--force-color-profile=srgb'] });

  if (KEYBOARD) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage(); const rows = [];
    async function walk(file, label, tabs) {
      await page.goto('file://' + path.join(ROOT, file), { waitUntil: 'load' }); await page.waitForTimeout(700);
      for (let i = 0; i < tabs; i++) {
        await page.keyboard.press('Tab'); await page.waitForTimeout(120);
        const info = await page.evaluate(() => {
          const el = document.activeElement; if (!el) return null;
          const cs = getComputedStyle(el);
          return { tag: el.tagName.toLowerCase(), text: (el.textContent || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 42), cls: String(el.className || ''), outline: cs.outlineWidth + ' ' + cs.outlineStyle };
        });
        rows.push(`| ${label} | ${i + 1} | ${info ? info.tag + ' — ' + info.text : '?'} | ${info ? info.cls : ''} | ${info ? info.outline : ''} |`);
        if (label === 'Listings' && i === 6) await page.screenshot({ path: path.join(OUT, 'keyboard-focus-listings.png') });
        if (label === 'Home' && i === 2) await page.screenshot({ path: path.join(OUT, 'keyboard-focus-home.png') });
      }
    }
    await walk('listings.html', 'Listings', 12);
    await walk('index.html', 'Home', 8);
    fs.writeFileSync(path.join(OUT, 'keyboard-walk.md'), '# Keyboard walk — Arz Estates (Demo)\n\nMethod: Playwright Tab presses on the file:// pages at 1280px; focused element + computed outline recorded at each stop. All interactive elements here are native links/buttons/inputs/selects (the type chips are real <button> elements), so each shows its own 3px :focus-visible outline — no visually-hidden inputs exist on this build, so no focus-host indirection was needed (lesson 20 checked: not applicable, and the walk proves native focus instead).\n\n| Page | Stop | Focused element | Class | Outline |\n|---|---|---|---|---|\n' + rows.join('\n') + '\n');
    console.log('KEYBOARD DONE'); await browser.close(); return;
  }

  if (FLOWS) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage(); const log = [];
    const shot = async (name, loc) => { if (loc) await loc.screenshot({ path: path.join(OUT, name) }); else await page.screenshot({ path: path.join(OUT, name), fullPage: false }); };
    /* Unfiltered */
    await page.goto('file://' + path.join(ROOT, 'listings.html'), { waitUntil: 'load' }); await settle(page);
    log.push('unfiltered count -> ' + await page.textContent('[data-result-count]'));
    await shot('flow-listings-unfiltered.png');
    /* Filtered: house chip + Lahore + sale */
    await page.click('button[data-type-chip="house"]');
    await page.selectOption('#f-city', 'Lahore'); await page.selectOption('#f-purpose', 'sale'); await page.waitForTimeout(400);
    log.push('filtered house+Lahore+sale count -> ' + await page.textContent('[data-result-count]'));
    const chipState = await page.getAttribute('button[data-type-chip="house"]', 'aria-pressed');
    log.push('house chip aria-pressed -> ' + chipState);
    log.push('URL after filter -> ' + page.url().split('/').pop());
    await shot('flow-listings-filtered.png');
    /* Sorted: reset then price-desc */
    await page.click('[data-reset]'); await page.waitForTimeout(300);
    await page.selectOption('#f-sort', 'price-desc'); await page.waitForTimeout(400);
    const firstCard = await page.textContent('[data-listings-grid] .card .badge');
    log.push('sorted price-desc first card badge -> ' + firstCard + ' (AP-1013 expected as highest price)');
    await shot('flow-listings-sorted.png');
    /* Empty state: apartment + Gujranwala */
    await page.selectOption('#f-sort', 'newest'); await page.click('button[data-type-chip="apartment"]');
    await page.selectOption('#f-city', 'Gujranwala'); await page.waitForTimeout(400);
    log.push('empty state visible -> ' + await page.isVisible('[data-empty]'));
    log.push('empty message -> ' + await page.textContent('[data-empty-msg]'));
    await shot('flow-listings-empty.png', page.locator('[data-empty]'));
    await page.click('[data-empty-reset]'); await page.waitForTimeout(400);
    log.push('after empty-reset count -> ' + await page.textContent('[data-result-count]'));
    /* Keyword search */
    await page.fill('#f-q', 'margalla'); await page.waitForTimeout(400);
    log.push('keyword margalla count -> ' + await page.textContent('[data-result-count]'));
    /* Favourite toggle */
    await page.fill('#f-q', ''); await page.waitForTimeout(300);
    await page.click('[data-listings-grid] [data-fav] >> nth=0'); await page.waitForTimeout(300);
    const favs = await page.evaluate(() => ({ favs: JSON.parse(localStorage.getItem('arz_favourites') || '[]'), count: document.querySelector('[data-fav-count]').textContent }));
    log.push('FIRING favourites after toggle -> ' + JSON.stringify(favs));
    /* WhatsApp firing (lesson 21): click a card WhatsApp link, popup blocked — assert the localStorage log */
    await page.evaluate(() => { window.open = () => null; });
    await page.click('[data-listings-grid] [data-wa] >> nth=0'); await page.waitForTimeout(300);
    const waLog = await page.evaluate(() => JSON.parse(localStorage.getItem('arz_whatsapp_log') || '[]'));
    log.push('FIRING whatsapp log after card click -> ' + JSON.stringify(waLog));
    /* Detail page */
    await page.goto('file://' + path.join(ROOT, 'property.html?id=AP-1001'), { waitUntil: 'load' }); await settle(page);
    log.push('detail title -> ' + await page.title());
    log.push('detail calc out -> ' + await page.textContent('[data-calc-out]'));
    await page.fill('#c-down', '50'); await page.waitForTimeout(300);
    log.push('detail calc after 50% down -> ' + await page.textContent('[data-calc-out]'));
    await shot('flow-detail.png');
    await page.evaluate(() => { window.open = () => null; });
    await page.click('[data-detail] [data-wa]'); await page.waitForTimeout(300);
    const waLog2 = await page.evaluate(() => JSON.parse(localStorage.getItem('arz_whatsapp_log') || '[]'));
    log.push('FIRING whatsapp log after detail click -> ' + JSON.stringify(waLog2));
    /* Enquiry form: errors, live clear, success */
    await page.goto('file://' + path.join(ROOT, 'contact.html?ref=AP-1007'), { waitUntil: 'load' }); await page.waitForTimeout(500);
    log.push('contact ref prefilled -> ' + await page.inputValue('#e-ref'));
    await page.click('[data-enquiry-form] button[type="submit"]'); await page.waitForTimeout(300);
    log.push('form name error -> ' + await page.textContent('[data-error-for="name"]'));
    await shot('flow-form-errors.png', page.locator('[data-enquiry-form]'));
    await page.fill('#e-name', 'Ahmed Raza'); await page.waitForTimeout(300);
    log.push('name error after fix (must be empty) -> "' + (await page.textContent('[data-error-for="name"]')) + '"');
    await page.fill('#e-phone', '0321 1234567'); await page.fill('#e-msg', 'Please share more details about this house.');
    await page.click('[data-enquiry-form] button[type="submit"]'); await page.waitForTimeout(500);
    log.push('form success visible -> ' + await page.isVisible('[data-enquiry-success]'));
    log.push('form success text -> ' + (await page.textContent('[data-success-text]')).trim());
    await shot('flow-form-success.png', page.locator('[data-enquiry-success]'));
    const enq = await page.evaluate(() => JSON.parse(localStorage.getItem('arz_enquiry_log') || '[]'));
    log.push('FIRING enquiry log -> ' + JSON.stringify(enq));
    fs.writeFileSync(path.join(OUT, 'flow-log.txt'), log.join('\n') + '\n');
    console.log(log.join('\n')); console.log('FLOWS DONE'); await browser.close(); return;
  }

  const results = {};
  for (const [pname, file] of PAGES) {
    for (const [vname, w, h] of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, javaScriptEnabled: !NOJS, reducedMotion: REDUCED ? 'reduce' : 'no-preference' });
      const page = await ctx.newPage();
      await page.goto('file://' + path.join(ROOT, file), { waitUntil: 'load' }); await page.waitForTimeout(400);
      await settle(page);
      const a = await auditPage(page);
      results[pname + '@' + vname] = a;
      await page.screenshot({ path: path.join(OUT, pname + '-' + vname + '.png'), fullPage: true });
      if (vname === 'phone') await page.screenshot({ path: path.join(OUT, pname + '-phone-top.png') });
      await ctx.close();
    }
  }
  fs.writeFileSync(path.join(OUT, 'audit.json'), JSON.stringify(results, null, 2));
  const bad = Object.entries(results).filter(([, a]) => a.overflowX > 1 || a.badEls.length || a.hiddenCount || a.brokenImgs.length || a.textBad.length);
  console.log('combos:', Object.keys(results).length, '| problem combos:', bad.length);
  bad.forEach(([k, a]) => console.log(k, JSON.stringify(a)));
  await browser.close();
})();
