VISUAL QUALITY SCORECARD — VERDICT
Build: Arz Estates (Demo) — Real Estate Listings + Search/Filter, Portfolio Queue #6  (client-facing owner: BalanceBit Solutions · production: MTS)
Build type / builder (AICOS-105–111): AICOS-110 (Real Estate Website Builds) — executed by builder worker
Preview URL: none (not deployed — local file:// preview only)   Date of pass: 2026-11-21
Scored by: AICOS-115   Pass #: 1

 1. Visual identity & originality   13 / 15   Evidence: BUILD-NOTES.md design record (own "Listing-led navy + copper" system — navy #16283F / copper #8C5310, Space Grotesk + Inter with tabular numerals; references Stripe + Good Neighbor Pharmacy from the library, Zameen.com + Rightmove-style portal UX from fresh 2026-11-21 research); screenshots/index-desktop.png + index-phone.png match the record — a number-led portal that could not belong to another industry and is visually unrelated to Gift Basket, Restaurant, MTS Core, Salon and Clinic. Missing: AICOS-112 formal §0 sign-off.
 2. UI/UX & usability               14 / 15   Evidence: flow captures — flow-listings-unfiltered.png ("14 properties found"), flow-listings-filtered.png (house + Lahore + sale → "2 properties found", chip pressed, URL ?type=house&city=Lahore&purpose=sale), flow-listings-sorted.png (price-desc, AP-1013 first), flow-listings-empty.png (constraint named + reset), flow-detail.png, flow-form-errors.png, flow-form-success.png; ONE conversion goal (a sent property enquiry) completed two ways without assistance — WhatsApp tap and the enquiry form.
 3. Typography & composition        10 / 10   Evidence: screenshots/index-desktop.png (price column in tabular Space Grotesk across five featured cards), listings-phone.png + property-phone.png (prices/beds/size scannable at phone width); pairing exactly as specified in BUILD-NOTES.md.
 4. Animation & interactions        9 / 10   Evidence: reveal-on-scroll with rootMargin pre-reveal + opacity-settle wait — 0 hidden in every audit; Ken Burns hero observed in captures; REDUCED-MOTION RUN FILED (screenshots/reduced/ — 5 pages × 3 viewports, 0 overflow / 0 text-overflow / 0 hidden, motion disabled, content instant-visible). Remaining: no CLS measurement exists without a served preview.
 5. Responsive design               10 / 10   Evidence: screenshots/audit.json — 15 page×viewport combos (390×844 / 768×1024 / 1440×900): 0 overflow, 0 leaf text-overflow, 0 hidden, 0 broken images; screenshots/probe320/audit.json — 5 pages at 320px: 0 findings; screenshots/nojs/ run (5 pages × 3 viewports): content fully visible with JS disabled. All phone pages + desktop home read by eye; the first-pass phone hero overflow was caught by eye, fixed (stacked photo + navy panel) and re-shot clean.
 6. Functionality                   15 / 15   Evidence: tests.js + tests-output.log — 95/95 PASS, with the headline requirement proven exhaustively (lesson 23): every filter alone with exact counts, combined AND filters, keyword match/miss, all five sort orders, empty case, exact PKR lakh/crore formatting, annuity estimate; flow run: filters/sort/empty/reset/keyword all live, calculator at two down-payments (PKR 631,986 → PKR 451,419), form errors + LIVE clear + success; INTEGRATION FIRING RECORDED (lesson 21) — WhatsApp clicks on a card (AP-1006) and the detail page (AP-1001) wrote localStorage log entries, the favourite toggle persisted and moved the nav count to 1, the enquiry submit wrote its log entry (flow-log.txt); Maps is a link by design (no iframe, test-asserted).
 7. Performance                     5 / 10   Evidence: weights measured — code ~64 KB (< 400 KB), media 1,318 KB total, max image 99 KB (tests-output.log). Missing: served-preview Lighthouse / field Core Web Vitals (LCP/INP/CLS) — the build is not deployed, so no CWV numbers exist; not estimated.
 8. Accessibility                   5 / 5   Evidence: 12 contrast assertions computed from the token hex values in tests.js, all PASS (body text 14.90:1, muted 7.43:1, buttons 6.25:1, error red 6.54:1, focus outline 6.25:1 vs the 3:1 non-text bar); KEYBOARD-WALK RECORD FILED (screenshots/keyboard-walk.md — 20 Tab stops across Listings + Home, visible 3px focus at every stop on native controls; this build has no visually-hidden inputs, so lesson 20's host indirection is not applicable and the walk proves native focus instead; keyboard-focus-listings.png + keyboard-focus-home.png); semantic landmarks, skip link, aria-current/pressed/live regions, ≥44px touch targets (chips 46px, buttons 52px), 16px form fonts, alt text on all images.
 9. SEO                             5 / 5   Evidence: unique title + meta description per page (test-verified), ItemList JSON-LD on index + RealEstateListing JSON-LD injected per property on the detail page, sitemap.xml (5 pages) + robots.txt present, internal linking across all 5 pages (all refs resolve, tests-output.log).
10. Security                        4 / 5   Evidence: zero third-party packages/CDN libraries (Google Fonts only), no secrets or credentials in source, no backend — favourites, WhatsApp clicks and enquiries write only to the visitor's own localStorage; no live analytics endpoints (source-asserted). HTTPS enforcement is a hosting property and the build is not deployed.

TOTAL: 90 / 100   (target ≥ 90)

BLOCKING FAILURES (security / data integrity / functionality):
- None. The ONE conversion goal (property enquiry — WhatsApp tap with localStorage firing record, or the validated enquiry form) completes both ways; search/filter/sort — the brief's headline feature — is proven in the battery and the flow run; no security or data-integrity findings; no listing is presented as real anywhere (DEMO labelling test-asserted on every page).

UNTESTED AREAS (score invalid without evidence):
- None scored as untested. Areas 1 and 7 carry named partial evidence (see above) and were scored down for it rather than marked untested — the same convention as Queue #2 (81), #3 (84), #1 (89), #4 (90) and #5 (90).

VERDICT:  [ ] APPROVE   [X] REJECT   [ ] REJECT — BLOCKED   [ ] REJECT — INCOMPLETE
Reasons (defects as: what is wrong · where · what fixed looks like):
- The ladder's evidence bar, not the §4 table alone, governs this queue's verdicts: every predecessor was REJECTED with the same two evidence items outstanding, and both are still outstanding here, so an APPROVE at exactly 90 would claim a standard the evidence does not yet carry. The build itself has no outstanding code defects.
- Missing evidence 1: served-preview Lighthouse/CWV · Area 7 (5 points held) · fixed by deploying a preview (Gate 7, Asad's decision) and filing a measured Lighthouse report.
- Missing evidence 2: AICOS-112 formal §0 sign-off · Area 1 (2 points held) · fixed by the design owner's recorded sign-off against BUILD-NOTES.md.
- Ladder note: this pass proves the brief's headline requirement — search/filter/sort — exhaustively in the battery (30+ dedicated assertions with exact refs and counts) and matches the 90 floor set by Salon and Clinic, with the same two external evidence items outstanding.

Next step: [ ] To AICOS-025 release gate   [X] Back to Gate 5 (evidence completions only — both are external to the build)   [ ] Back to Gate 2

Disclosures: (1) One test expectation was corrected mid-pass — "keyword dha + rent" asserted 2, data supports exactly 1 (only AP-1012 is a DHA rental); assertion fixed and renamed to record it. (2) The flow run caught a real defect — empty-state message printed "at least 0 bed" (string '0' truthy); fixed in logic.js, battery re-run green. (3) First phone screenshots caught hero copy overflowing its image at 390px; phone hero rebuilt as stacked photo + navy panel and re-shot clean. All three are repeated in BUILD-NOTES.md, never silent (lesson 9).

---

## Addendum — Re-verification FIX RUN (2026-11-21, later the same day)

Independent re-verification (`Reverification-2026-11-21/REPORT.md`) found 1 visible + 3 minor
defects. All four FIXED, re-shot and read; battery **95/95 PASS** unamended after fixes:

- **RE-1 (visible) — 2 of 14 listing photos blank in the phone capture.** Same mechanism family
  as Gift Basket GB-1: card images were `loading="lazy"` inside an opacity-gated reveal. Fix:
  card images eager (template in `js/main.js`) and the reveal no longer gates opacity anywhere
  (position-only rise). Proof: normal-speed scroll-through probe — `fix-real-estate/listings-phone.png`
  shows all 14 photos painted (incl. AP-1011 and AP-1005, the two previously blank); 20 page×viewport
  combos, 0 blank images, 0 overflow (`fix-real-estate/audit.json`).
- **RE-2 (minor) — homepage overflowed 1–2px at every viewport** (`img.kenburns` scaling past
  its un-clipped parent). Fix: `.hero{overflow:hidden}`. Proof: document overflow sampled 5×
  across the 16s Ken Burns cycle at 1440 = 0 every sample (was 1–2px).
- **RE-3 (minor) — phone nav wrapped to two rows (no hamburger).** Fix: a real hamburger at
  ≤700px in the site's own system (toggle button + collapsible `#main-nav`, aria-expanded,
  closes on link tap / Escape), added to all 5 pages. Proof: `fix-real-estate/index-state-menu-phone.png`
  (open state) + DOM probe (closed: nav display none / toggle visible; open: flex, expanded=true).
- **RE-4 (minor) — hero "Search listings" button wrapped to two lines.** Fix: search grid's
  button column widened (160→184px) + `white-space:nowrap` on the button. Proof: button height
  measures exactly 52px (one line) in all 5 animation-cycle samples (was ~2 lines).

**Score: unchanged at 90/100 — REJECT (evidence bar only).** Held points remain the
served-preview CWV (Area 7) and the AICOS-112 §0 sign-off (Area 1); the fixes remove defects,
they do not manufacture that evidence.

---

## Addendum — PREMIUM UPGRADE (2026-11-22, ladder site #6)

- **GSAP parallax on listing imagery** (index): Lenis 1.3.27 + GSAP 3.15.1/ScrollTrigger — hero photo and all featured-card photos parallax, **transform-only, images eager** (RE-1 lesson held: premium checks verify every featured image `loading != lazy`, painted, naturalWidth > 0; a normal-speed scroll audit found 0 blank). CSS Ken Burns stands down only when the premium layer is live (`.premium-on`), so no-JS/reduced-motion keeps the original treatment.
- **Swiper gallery inside each property view**: honesty constraint — every demo listing has exactly ONE photo, so the gallery is that photo three ways (full view + two detail crops of the SAME photo), each captioned as such; no other listing's photo is ever presented as this property's. Keyboard-operable (verified). Reduced-motion/no-JS = all three views stacked as ordinary photos. One real defect was caught by eye in the first capture (the scaled crop bled into the active slide) and fixed with per-slide clipping, then re-shot and re-read clean.
- **Animated filter counts**: Alpine.js was weighed and REJECTED on measurement — Alpine alone is 19,902 B gzip and listings already ships ~9.4 KB, totalling ~29.8 KB > the P8 plain-page hard cap of 20 KB. The count is tweened instead by a ~0.6 KB rAF helper in `js/premium-counts.js` (listings total **9.9 KB gzip** ✓). Filter/URL-state battery untouched and green; checks verify the count settles on the true value with `?city=Lahore` in the URL (6 properties).
- **Neighbourhood chapter per property** (Sobha chapter pattern, no WebGL): oversized uppercase area title (clamp to 76px, tracking −0.02em), copy drawn ONLY from that listing's own description + its "Near …" feature lines, and a parallax band using the site's generic skyline photo — captioned on the image itself as generic, never as the property.
- **New technique:** parallax + in-card/in-view galleries at catalogue scale (14 properties) without breaking the filter/URL-state battery — proven above.
- **Batteries:** `tests.js` UNAMENDED **95/95 PASS** before and after. Separate premium checks (`premium-checks-output.log`): 49 PASS across both ladder sites; the 14 "console" flags are the pre-existing Google Fonts stylesheet failing in this offline sandbox browser (ERR_TUNNEL_CONNECTION_FAILED — untouched pages flag identically); follow-up probe: **0 page errors, 0 JS console errors**. P1 re-probe: 0 blue / 0 underlined links on every page × viewport.
- **JS weights (gzip, total per page):** index (hero) **60.5 KB** ≤90 ✓ · property (slider) **54.4 KB** ≤90 ✓ · listings (plain) **9.9 KB** ≤20 ✓ · other pages **9.1 KB** ≤20 ✓.
- **Screenshots:** full set re-shot via `shoot.js` (15 combos, 0 problem combos) + `screenshots/signature-moment.png` (featured cards mid-parallax, read by eye — clean).

**Re-score: Area 4 (Animation & interactions) 9 → 10** (parallax signature + gallery + animated counts + chapter, all with proven static states). All other areas unchanged — Area 7 still holds 5 points for the unmeasured served-preview CWV.
**TOTAL: 90 → 91 / 100 — VERDICT UNCHANGED: REJECT (evidence bar only)** — the same two external items remain outstanding (served-preview Lighthouse/CWV; AICOS-112 §0 sign-off). No code defects outstanding.
