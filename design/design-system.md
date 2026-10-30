# ResQTh — Design System (M3)

Source of truth for every colour, font and spacing value in `ResQTh_full_prototype_v3_retheme.html`.
**Rule:** screens use tokens only (`var(--primary)`), never raw values like `#27306B`. To re-theme, edit the `:root` block only (low coupling).

Theme idea: Thai-flag navy for calm and main actions, emergency red for urgency, white and cool grey surfaces.

## 1. Colour tokens

| Token | Light | Dark | Used for | Links to |
|---|---|---|---|---|
| `--bg` | #F4F5FA | #0F1226 | App background | NFR-6 |
| `--surface` | #FFFFFF | #181C38 | Cards, inputs | NFR-6 |
| `--page` | #E6E9F2 | #080A16 | Area outside the phone frame | |
| `--ink` | #181B38 | #E9EBF7 | Body text | NFR-6 |
| `--muted` | #565B78 | #A3A9C7 | Secondary text | NFR-6 |
| `--line` | #D4D8E6 | #2C3256 | Borders, dividers | |
| `--primary` | #27306B | #AEB8F7 | Main buttons, selected chips, low-urgency band, links to trusted contact | FR-2, FR-3 |
| `--on-primary` | #FFFFFF | #0E1230 | Text/icons on `--primary` | NFR-6 |
| `--primary-disabled` / `--on-primary-disabled` | #5A62A0 / #FFFFFF | #3B4275 / #E9EBF7 | Disabled main button (e.g. Continue before a province is chosen). Contrast 5.7 / 6.2 | FR-1 |
| `--primary-soft` | #E1E5F6 | #1D2350 | Low-urgency tag, map background | FR-3 |
| `--danger` | #C8102E | #C8102E | **Fill only:** high-urgency band, route, unit marker | FR-3, FR-5 |
| `--on-danger` | #FFFFFF | #FFFFFF | Text/icons on `--danger` | NFR-6 |
| `--danger-text` | #B80F2A | #FF8FA0 | **Red text/borders** (high-urgency tag, Stop sharing) | FR-3, FR-5 |
| `--danger-soft` | #FBE3E7 | #3A1720 | High-urgency tag, fallback notices | NFR-7 |
| `--danger-deep` / `--danger-ink` | #9E0C24 / #4A1520 | same | Call button on red band | FR-3 |
| `--mk-cat` / `--mk-prov` | #F7D3DA / #C9D2F3 | #6A2A38 / #2C3A82 | Parser highlights: category / place | FR-4 |
| `--note-bg` / `--note-ink` / `--note-line` | #E9EBF6 / #181B38 / #8A93C4 | #232850 / #E9EBF7 / #6A74B8 | "Concept / Future" notes (dashed border so it is not colour-only) | NFR-6 |
| `--focus` | #1456D6 | #8DB4FF | Keyboard focus ring | NFR-6 |
| `--you` | #1456D6 | #5B8CFF | "You are here" map dot | FR-1 |
| `--river`, `--map-ink`, `--on-map` | #B8C4EA, #181B38, #FFFFFF | river #26306A | Map drawing | |
| `--card-*` (bg, ink, ink-2, muted, rule) | white / black greys | **same in dark** | The full-screen Thai card shown to locals: always black on white | FR-3 |

## 2. Typography
- `--font`: IBM Plex Sans Thai → Noto Sans Thai → Segoe UI → system-ui.
- Scale used: 12.5 / 13.5 / 14.5 / 16 / 19 / 24 / 28 px. Thai card text 23–28 px, bold.

## 3. Spacing, shape, motion
- Spacing: 4 / 8 / 10 / 12 / 14 / 16 px. Radius: 9–10 (inputs), 12–14 (cards/buttons), 16 (bands), 99 (chips/pills).
- Minimum touch target 38–52 px. Animations switch off under `prefers-reduced-motion`.

## 4. Components
| Component | Class | Tokens |
|---|---|---|
| Primary button | `.btn-primary` | `--primary` on `--on-primary` |
| Ghost button | `.btn-ghost` | `--line` border |
| Danger button | `.btn-danger` | `--danger-text` border and text |
| Chip / segmented control (selected) | `.chip`, `.seg button` | `--primary` on `--on-primary` |
| Urgency tag | `.tag-high`, `.tag-low`, `.tag-future` | danger-soft / primary-soft / note |
| Urgency band | `.band-high`, `.band-low` | `--danger` / `--primary` |
| Card | `.card`, `.box` | `--surface`, `--line` |
| Notice (error / fallback) | `.fallback` | `--danger-soft` |
| Thai show-to-local card | `.thai`, `.full` | `--card-*` |

## 5. Contrast check (NFR-6 target ≥ 4.5:1 for text)
Computed from the hex values above (WCAG formula). Every text pair passes in both themes.

| Pair | Light | Dark |
|---|---|---|
| `--ink` on `--bg` | 15.4 | 15.6 |
| `--muted` on `--surface` | 6.6 | 7.2 |
| `--on-primary` on `--primary` | 12.2 | 9.6 |
| `--on-danger` on `--danger` | 5.9 | 5.9 |
| `--danger-text` on `--danger-soft` | 5.5 | 7.3 |
| `--ink` on `--mk-cat` / `--mk-prov` | 12.2 / 11.2 | 8.8 / 8.7 |
| `--card-ink` on `--card-bg` | 18.9 | 18.9 |

Note: `--danger` itself is 3.2:1 on the dark background, so it is used as a fill only; red text uses `--danger-text`.
