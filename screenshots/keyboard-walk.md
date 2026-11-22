# Keyboard walk — Arz Estates (Demo)

Method: Playwright Tab presses on the file:// pages at 1280px; focused element + computed outline recorded at each stop. All interactive elements here are native links/buttons/inputs/selects (the type chips are real <button> elements), so each shows its own 3px :focus-visible outline — no visually-hidden inputs exist on this build, so no focus-host indirection was needed (lesson 20 checked: not applicable, and the walk proves native focus instead).

| Page | Stop | Focused element | Class | Outline |
|---|---|---|---|---|
| Listings | 1 | a — Skip to main content | skip-link | 3px solid |
| Listings | 2 | a — ArzEstates | logo | 3px solid |
| Listings | 3 | a — Home |  | 3px solid |
| Listings | 4 | a — Listings |  | 3px solid |
| Listings | 5 | a — About |  | 3px solid |
| Listings | 6 | a — Enquire |  | 3px solid |
| Listings | 7 | a — Saved0 |  | 3px solid |
| Listings | 8 | input —  | field | 3px solid |
| Listings | 9 | button — All types | chip | 3px solid |
| Listings | 10 | button — Houses | chip | 3px solid |
| Listings | 11 | button — Apartments | chip | 3px solid |
| Listings | 12 | button — Plots | chip | 3px solid |
| Home | 1 | a — Skip to main content | skip-link | 3px solid |
| Home | 2 | a — ArzEstates | logo | 3px solid |
| Home | 3 | a — Home |  | 3px solid |
| Home | 4 | a — Listings |  | 3px solid |
| Home | 5 | a — About |  | 3px solid |
| Home | 6 | a — Enquire |  | 3px solid |
| Home | 7 | a — Saved0 |  | 3px solid |
| Home | 8 | input —  | field | 3px solid |
