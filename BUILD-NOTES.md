# Build Notes — Arz Estates (Demo) — Portfolio Queue #6

**Built:** 2026-11-21 · **Builders:** AICOS-110 (Real Estate Website Builds) · AICOS-112 (design system) · AICOS-115 (QA)
**Queue position:** #6, after Gift Basket #2 (81), Restaurant #3 (84), MTS flagship #1 rebuild (89), Salon #4 (90), Clinic #5 (90) — this build had to match or beat 90 and prove its headline feature, search/filter, in the battery (lesson 23).
**Stack:** hand-coded HTML/CSS/vanilla JS, zero third-party packages/CDN libraries except Google Fonts. No build step. All files strictly inside this project's folder (rule 18).

## Design record (Gate 2)

**Identity — "Listing-led navy + copper":** a property portal lives or dies on its cards, filters and numbers, so the system is built around scannability: white ground, deep navy ink, one copper accent, and prices set in Space Grotesk with tabular numerals (Inter `tnum`) so PKR figures align down a column of cards. Distinct from Gift Basket (cream/emerald/terracotta), Restaurant (ink/parchment/brick, Fraunces), MTS Core (black/lime, Archivo), Salon (porcelain/blush/bronze, Cormorant) and Clinic (white/petrol, Atkinson).

**References researched (2026-11-21):**
1. **Stripe** (Design Inspiration Library C1, corporate services) — density that stays scannable: one idea per cell, numbers up front. Taken: number-first card hierarchy. Not copied: assets, layout.
2. **Good Neighbor Pharmacy** (library P2) — the *local* branch as hero via a locator-led first screen. Taken: search-led hero (keyword + purpose in the first screen). Not copied: assets, layout.
3. **Zameen.com** (fresh web research 2026-11-21 — portal + listings pages studied) — Pakistan's portal pattern: purpose (buy/rent) chosen first, then type/city/price/beds; cards lead with price in PKR crore, beds/baths and marla area. Taken: purpose-first filter order, PKR lakh/crore price display, marla/kanal sizing. Not copied: branding, assets, layout.
4. **Rightmove-style portal UX** (fresh web research 2026-11-21, incl. a property-platform UX study) — scannable cards (photo, price, location, size, rooms, availability), selected filters stay visible, removing one filter never resets the rest. Taken: card information order, pressed-chip filter state, live result count. Not copied: assets, layout.

**Tokens + contrast table (computed from hex; asserted in tests.js — all PASS):**
- `--bg #FFFFFF` · `--surface #EEF1F4` · `--tint #E2E8EF` · `--line #C9D3DD` (borders only)
- `--ink #16283F` · `--ink-2 #22385A` · `--muted #43576E` · `--accent #8C5310` · `--accent-dark #6E4008` · `--error #B3261E` (semantic error red — the ONLY extra hue, ladder rule 4)

| Pairing | Ratio | Bar |
|---|---|---|
| Ink #16283F on white | 14.90:1 | ≥4.5 ✓ |
| Ink on surface #EEF1F4 | 13.14:1 | ≥4.5 ✓ |
| Muted #43576E on white | 7.43:1 | ≥4.5 ✓ |
| Muted on surface | 6.55:1 | ≥4.5 ✓ |
| White on accent #8C5310 (buttons) | 6.25:1 | ≥4.5 ✓ |
| Accent-dark #6E4008 on white (links) | 8.75:1 | ≥4.5 ✓ |
| Accent-dark on tint (kickers) | 7.09:1 | ≥4.5 ✓ |
| Error #B3261E on white | 6.54:1 | ≥4.5 ✓ |
| Footer note #D7E0EA on ink | 11.17:1 | ≥4.5 ✓ |
| Accent focus outline on white (non-text) | 6.25:1 | ≥3.0 ✓ |

**Type pairing:** Space Grotesk (500/700) display + Inter body with tabular numerals for every price/spec figure. Body 17px; form fields 16px (iOS zoom guard).
**Components:** buttons 52px (46px small), chips 46px, favourite buttons 46px, nav links ≥44px — all touch targets ≥44px. Focus: 3px accent outline everywhere; all interactive elements are native controls (no visually-hidden inputs exist on this build).

**The agency (fictional):** Arz Estates — invented name, demo office on Main Boulevard, Gulberg, Lahore; demo WhatsApp 0300 0000000 (placeholder number). Catalogue: 14 fictional properties across Lahore (6), Karachi (4), Islamabad (2), Gujranwala (2) — 7 houses, 4 apartments, 3 plots; 10 for sale, 4 for rent. Every listing is demo data and the site says so on every page.

**ONE conversion goal:** a sent property enquiry (per-property WhatsApp tap or the validated enquiry form). Secondary: saving a favourite.
**Pages (5):** `index.html` (hero search + featured) · `listings.html` (the core search/filter/sort page) · `property.html` (detail driven by `?id=` from data) · `about.html` · `contact.html` (enquiry form + Maps panel).

**Video position (plain, per owner rule): video: none — photo + CSS motion.** Video generation is region-blocked (403) — not attempted. Hero uses a real photograph with subtle Ken Burns CSS motion, disabled under reduced motion.

## Features — all working client-side, demo data only
Pure logic in `js/logic.js` shared by site + Node battery (lesson 13); data in `js/data.js`; DOM in `js/main.js`.
- **Listings from data:** 14 properties rendered from `js/data.js` — ref, title, city + area, PKR price, beds, baths, size (marla/kanal + sq ft), type, sale/rent badge, photo. Data integrity is test-asserted (refs unique, photo files exist, plots carry 0 beds/baths).
- **Search + filters (THE headline feature):** keyword (title/area/city/ref, multi-word AND), type chips, city, purpose, price band, minimum beds — all combine with AND; sort by newest / price asc / price desc / size desc / size asc; live result count; filter state reflected in pressed chips + selects and mirrored into URL query params (round-trip test-asserted). EMPTY state names the active constraints and offers a one-click reset (lesson 25; flow-proven: "No properties match type: apartment + city: Gujranwala…").
- **Property detail:** full specification table, features, description, agent card, styled Maps panel + "Open in Google Maps" link (NO iframe), and an illustrative monthly-estimate calculator for sale listings (price/down-payment/tenure/rate annuity formula, honestly labelled "not financial advice"; flow-proven: PKR 631,986/mo at defaults, PKR 451,419/mo at 50% down).
- **Per-property WhatsApp enquiry:** button on every card AND the detail page building a real `wa.me` link prefilled with ref + title + price; clicks recorded to a localStorage demo log — **FIRING RECORDED** in the flow run for both a card (AP-1006) and the detail page (AP-1001) (lesson 21).
- **Enquiry form:** name/phone/optional ref/message with full validation (ref format checked), live error clearing (flow-proven), honest demo success state + localStorage log; a `?ref=` link from a property page prefills the ref (flow-proven: AP-1007).
- **Favourites:** heart toggle on every card, saved to localStorage, saved-count in the nav (flow-proven: toggle → count 1, persisted refs).
- **DEMO labelling:** ribbon + footer note on every page; listings pages state the properties are fictional demo data.

## Ladder mechanics (lessons 1–25, all applied)
Reveal-by-default + IO rootMargin pre-reveal + 2s fallback + reduced-motion instant (2+11); pure-logic split (13); one component system (5); palette discipline incl. AA error red (4); `min-width:0` on grid/filterbar/form children — the filter-bar trap named in the brief (6); no inline-style grid rows (layout-only inline margins/font sizes only); row+column pinning — no lone-axis placed grid children (15); leaf-text overflow audit in the harness (14); specificity verified via state evidence (16); complete-repo/assets rule + nothing-mixes (17+18); video honesty (19); focus hosts — not applicable (no hidden inputs; keyboard walk records native 3px focus on real controls instead) (20); integration FIRING recorded (21); fixed-height card images are landscape architecture shots, no portraits to crop (22); headline requirement (search/filter/sort) proven exhaustively in the battery (23); harness modes branched (no-JS settle skip, inherited pattern) (24); empty state names the constraint (25). Weights: code ~64 KB < 400 KB; media 1,318 KB ≤ 1.6 MB, largest image 99 KB ≤ ~120 KB (10).

## Media
16 generated photographs in ONE consistent bright-daylight architectural style (no people, no text), 1,318 KB total, largest 99 KB:
`assets/hero.jpg` · `assets/office.jpg` · `assets/prop-01.jpg` … `assets/prop-14.jpg` (+ `assets/favicon.svg`, vector, pushed with code).
**Repo note (owner rule):** the connector push carries text files only, so the 16 photographs are PENDING WEB-UPLOAD; repo status is "code pushed — images pending web-upload", not complete. Video: none — photo + CSS motion.

## QA summary
- Tests: `tests.js` → **95 PASS / 0 FAIL** (`tests-output.log`): data integrity, every filter alone with exact counts/refs, keyword match/miss/multi-word, combined AND filters incl. the empty case, all five sort orders, empty-state constraint naming, exact PKR lakh/crore formatting, annuity estimate (zero-rate exact + monotonic), WhatsApp/Maps construction for every property, enquiry validation, URL round-trip, favourites toggle, **12 contrast assertions computed from hex**, link integrity across 5 pages, SEO artefacts, weights.
- Screenshots (`screenshots/`): 5 pages × 390/768/1440 (15) + 320px probe (5) + JS-disabled run (15) + reduced-motion run (15) — final audits: **0 overflow, 0 leaf text-overflow, 0 hidden reveals, 0 broken images** in every run (`audit.json` per folder). Phone + desktop pages read by eye; palette disciplined.
- Flow captures (`screenshots/flow-*.png` + `flow-log.txt`): unfiltered (14), filtered house+Lahore+sale (2, chip pressed, URL updated), sorted price-desc (AP-1013 first), empty state + reset, keyword "margalla" (1), favourite firing, WhatsApp firing on card + detail, calculator at two down-payments, form errors + live clear + success with localStorage records.
- Keyboard walk: `screenshots/keyboard-walk.md` — 20 Tab stops across Listings + Home, visible 3px focus at every stop on native controls; `keyboard-focus-listings.png` / `keyboard-focus-home.png`.

**Disclosures:** (1) One test expectation was corrected during the pass — "keyword dha + rent" was first asserted as 2; the data supports exactly 1 (only AP-1012 is a DHA rental), the assertion was fixed and the test renamed to record the correction (lesson 9). (2) The flow run caught a real site defect — the empty-state message printed "at least 0 bed" because the string `'0'` is truthy; `activeConstraints` now requires `+minBeds > 0`, battery re-run green. (3) First phone screenshots caught the hero copy overflowing its 360px image at 390px width; the phone hero is now a stacked photo + navy panel, re-shot clean. No assertion was silently amended.
