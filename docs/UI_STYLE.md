# UI_STYLE — Design System Reference
> Read alongside AGENT_RULES.md at the start of every session that touches UI.
> The agent must not deviate from these tokens without explicit instruction.

---

## Design Direction

**Warm & Organic** — inspired by premium wellness/food apps.
Clean without being cold. Nature-forward without being rustic.
The palette signals health, calm, and care — appropriate for a family food app.

---

## Color Palette

### Primary Colors

| Token | Hex | Usage |
|---|---|---|
| `green-dark` | `#243D2F` | Header backgrounds, primary CTA background, nav bar |
| `green-mid` | `#2D5240` | Secondary buttons, active states, avatar backgrounds, save button |
| `green-light` | `#4A7C5F` | Secondary avatar, hover states, accents |
| `green-muted` | `#7AAE8A` | Subheadings on dark bg, muted labels on dark bg |

### Surface Colors

| Token | Hex | Usage |
|---|---|---|
| `cream` | `#F4EFE6` | Page/app background |
| `card` | `#FAF7F2` | Card and list item backgrounds |
| `border` | `#E2D9CC` | All card and component borders |
| `border-dashed` | `#C8BFB0` | Unassigned / placeholder items |

### Text Colors

| Token | Hex | Usage |
|---|---|---|
| `text-dark` | `#1A2A1F` | Primary body text, recipe names, item labels |
| `text-mid` | `#4A6355` | Secondary info, subtitles on light bg |
| `text-muted` | `#8A9E90` | Timestamps, counts, section labels, inactive states |

### Status / Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `ate-bg` | `#D4E8DA` | "Ate" toggle background |
| `ate-text` | `#1A4A2A` | "Ate" toggle label |
| `partial-bg` | `#F5EDD0` | "Partial" toggle background |
| `partial-text` | `#6B4F0A` | "Partial" toggle label |
| `rejected-bg` | `#F5D8D8` | "Rejected" toggle background |
| `rejected-text` | `#6B1A1A` | "Rejected" toggle label |
| `idle-bg` | `#EDE7DC` | Unselected toggle background |
| `idle-text` | `#8A9E90` | Unselected toggle label |

### Store Indicator Dots

| Store | Dot Color |
|---|---|
| Costco | `#E05C2A` |
| Whole Foods | `#4A7C5F` |
| Chinese Grocery | `#2D5240` |
| Unassigned | `#8A9E90` |

### Accent Button Colors

Three additional colors drawn from the reference palette for use on action buttons, highlight cards, and category tags. These complement the core greens without clashing.

| Token | Hex | Light text (on dark bg) | Dark text (on light bg) | When to use |
|---|---|---|---|---|
| `accent-purple` | `#6B5C8C` | `#EDE8F5` | `#3A2F52` | Secondary actions, planning features, week view highlights |
| `accent-gold` | `#E8A83A` | `#FDF5E0` | `#6B4400` | New items, unassigned prompts, attention-level actions |
| `accent-olive` | `#8A9070` | `#F0F0E8` | `#3A3D28` | Recipe category tags, ingredient labels |

**Button construction rule:** Every accent button uses the same shape as the primary CTA (`border-radius: 10px; padding: 11px; font-weight: 600`) — only the background color changes. Always pair the background with its matching light text color above.

**One accent per screen.** Do not use more than one accent color on the same screen. Accents draw the eye to one specific action — two accents cancel each other out. The primary greens are the default; reach for an accent only when an action needs to stand out from the green hierarchy.

Suggested assignments:
- "Generate meal plan" → `accent-purple`
- "Confirm store" / unassigned item prompt → `accent-gold`
- Recipe tag chips (上海菜, 快手, 主食) → `accent-olive`

---

## Typography

All UI is in the system sans-serif stack. No custom font needed.

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

| Role | Size | Weight | Color |
|---|---|---|---|
| Screen title | 17–20px | 600 | `#F4EFE6` (on dark) / `#1A2A1F` (on light) |
| Section label | 9–10px | 700 | `#8A9E90`, letter-spacing: 0.07em, UPPERCASE |
| Card title (recipe name) | 13–14px | 600 | `#1A2A1F` |
| Body / item label | 12–13px | 400 | `#1A2A1F` |
| Secondary label | 10–11px | 400–500 | `#4A6355` |
| Muted / meta | 9–10px | 400 | `#8A9E90` |
| Greeting / overline | 10px | 500 | `#7AAE8A` (on dark header), letter-spacing: 0.06em |

**Two weights only: 400 (regular) and 600 (bold). Never use 700+ in body UI.**

---

## Component Patterns

### Header / Top Bar
- Background: `#243D2F` (green-dark)
- Back label: 10px, `#7AAE8A`
- Title: 17–19px, 600, `#F4EFE6`
- Date/subtitle: 10px, `#7AAE8A`
- Padding: 14px 16px

### Cards
```css
background: #FAF7F2;
border: 0.5px solid #E2D9CC;
border-radius: 10px;
padding: 10px 12px;
margin-bottom: 6–8px;
```

### Segment Chips (Breakfast / Lunch / Dinner)
- Active: `background: #2D5240; color: #F4EFE6`
- Idle: `background: #EDE7DC; color: #8A9E90`
- Shape: `border-radius: 20px; padding: 4px 10px; font-size: 10px; font-weight: 500`

### Person Response Toggles (Ate / Partial / Rejected)
- Three-state buttons per person row
- Selected state uses semantic color (ate/partial/rejected tokens above)
- Idle state uses `#EDE7DC / #8A9E90`
- Shape: `border-radius: 6px; padding: 3px 7px; font-size: 9–10px; font-weight: 600`

### Person Avatar
- Circle, 26px diameter
- Family color ramp (Chengyuan → `#2D5240`, Fu → `#4A7C5F`, 瓜瓜 → `#6B9E7A`, 毛毛 → `#8ABE9A`)
- Font: 9px, 700, `#FAF7F2`

### Primary CTA Button (Save / Confirm)
```css
background: #243D2F;
color: #F4EFE6;
border-radius: 10px;
padding: 11px;
font-size: 12–13px;
font-weight: 600;
width: 100%;
text-align: center;
letter-spacing: 0.02em;
```

### Shopping List Item
```css
background: #FAF7F2;
border: 0.5px solid #E2D9CC;
border-radius: 8px;
padding: 7px 10px;
```
- Checkbox: 16px, `border-radius: 4px`, `border: 1.5px solid #E2D9CC`
- Checked state: `background: #2D5240; border-color: #2D5240`
- Checked item name: `color: #8A9E90; text-decoration: line-through`

### Unassigned Shopping Item
```css
background: #FAF7F2;
border: 1px dashed #C8BFB0;
border-radius: 8px;
```
- AI suggestion label: `color: #2D5240; font-size: 9px; font-weight: 600`

### Store Section Header
- Colored dot (8px circle) using store indicator color above
- Store name: 10px, 700, `#1A2A1F`, letter-spacing: 0.05em, UPPERCASE
- Item count: 9px, `#8A9E90`, pushed to right with `margin-left: auto`

---

## Layout

- **Page background:** `#F4EFE6` (cream)
- **Mobile padding:** 14px horizontal throughout
- **Card gap:** 6–8px between cards in a list
- **Section label margin-bottom:** 6px
- **Border radius — cards:** 10px; **— buttons:** 10px; **— chips:** 20px (pill); **— checkboxes:** 4px

---

## Dark Mode

This app is intentionally **light-mode only** for now. The green-dark header provides contrast without requiring a full dark mode implementation. Revisit when the app is stable.

---

## What the Agent Must Not Do

- Do not use generic blue as a primary color
- Do not use white backgrounds for the app shell — always `#F4EFE6`
- Do not use font weights above 600
- Do not introduce gradients or shadows on cards
- Do not use red/orange for anything other than the Costco store dot
- Do not invent new colors outside this palette — if a new component is needed, derive from existing tokens
- Do not use emoji in the UI — use simple SVG icons with `stroke: currentColor`
