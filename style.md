# SMART LIBRARY 360 – GLOBAL DESIGN SYSTEM

*Prepend this block to EVERY module you give to Stitch. This ensures visual consistency across all 109 pages.*

**Stack:** Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS · shadcn/ui components

---

## 1. COLOR PALETTE

*Note: For v1, the system defaults to Dark Mode. Light mode values are provided below for future‑proofing and consistency.*

### Core Colors
| Token | Dark Mode (Default) | Light Mode | Usage |
|---|---|---|---|
| `--primary` | `#6366F1` (Indigo‑500) | `#4F46E5` | Primary buttons, active nav item, links |
| `--primary‑hover` | `#4F46E5` (Indigo‑600) | `#4338CA` | Primary button hover state |
| `--primary‑subtle` | `#EEF2FF` (Indigo‑50) | `#EEF2FF` | Soft badge backgrounds, selected row highlight |
| `--bg‑page` | `#0F0F1A` | `#F8FAFC` | Main page background |
| `--bg‑card` | `#1A1A2E` | `#FFFFFF` | Card, panel, table background |
| `--bg‑sidebar` | `#12121F` | `#F1F5F9` | Sidebar background |
| `--bg‑header` | `#16162A` | `#FFFFFF` | Top header background |
| `--bg‑input` | `#1E1E32` | `#FFFFFF` | Input field background |
| `--border` | `#2A2A3E` | `#E2E8F0` | Card borders, table dividers, input borders |
| `--border‑focus` | `#6366F1` | `#4F46E5` | Input border on focus |
| `--text‑primary` | `#F0F0FF` | `#0F172A` | All primary text, headings, table values |
| `--text‑secondary` | `#94A3B8` (Slate‑400) | `#64748B` | Labels, captions, placeholder text |
| `--text‑disabled` | `#44445A` | `#94A3B8` | Disabled states |
| `--skeleton‑base` | `#2A2A3E` | `#E2E8F0` | Loading skeleton base color |
| `--skeleton‑highlight`| `#3F3F5A` | `#F1F5F9` | Loading skeleton shimmer highlight |

### Status Colors (Strictly for statuses)
| Token | Text Color | Background Color | Usage |
|---|---|---|---|
| `--success` | `#34D399` (WCAG pass) | `#064E3B` | Active / Working / Present / Resolved |
| `--warning` | `#FBBF24` (WCAG pass) | `#451A03` | Pending / Expiring / Held |
| `--danger` | `#F87171` (WCAG pass) | `#450A0A` | Overdue / Suspended / Broken |
| `--info` | `#60A5FA` | `#1E3A5F` | New / Neutral |

### Payment Mode Colors (Separated to avoid status collision)
| Token | Text Color | Background Color | Usage |
|---|---|---|---|
| `--pay‑cash` | `#5EEAD4` (Teal) | `#134E4A` | Cash payments |
| `--pay‑upi` | `#67E8F9` (Cyan) | `#164E63` | UPI payments |
| `--pay‑card` | `#94A3B8` (Slate) | `#1E1E2B` | Card payments |
| `--pay‑bank` | `#38BDF8` (Sky) | `#0C4A6E` | Bank Transfers |

### Border Radius Scale
| Token | Value | Usage |
|---|---|---|
| `--radius‑sm` | `4px` | Small elements, checkboxes |
| `--radius‑md` | `8px` | Buttons, Inputs, standard elements |
| `--radius‑lg` | `12px` | Cards, Panels, standard containers |
| `--radius‑xl` | `16px` | Modals, large surface areas |
| `--radius‑full`| `999px` | Status badges, circular avatars |

---

## 2. TYPOGRAPHY

- **Font Family:** `Inter` – loaded via `next/font/google` (`import { Inter } from 'next/font/google'`).
- **Base font‑size:** 14px

| Role | Size | Weight | Color | Usage |
|---|---|---|---|---|
| Page Title (H1) | 22px | 700 Bold | `--text-primary` | One per page, top‑left |
| Section Heading (H2) | 16px | 600 SemiBold | `--text-primary` | Section titles inside cards |
| Card Label | 11px | 500 Medium | `--text-secondary` | Upper‑cased stat card labels |
| Stat Number | 28px | 700 Bold | `--text-primary` | KPI numbers on dashboards |
| Table Header | 12px | 600 SemiBold | `--text-secondary` | Upper‑cased column headers |
| Table Cell | 14px | 400 Normal | `--text-primary` | Row data values |
| Button Text | 14px | 500 Medium | White / `--primary` | Primary / ghost buttons |
| Input Text | 14px | 400 Normal | `--text-primary` | User‑typed values |
| Caption / Helper | 12px | 400 Normal | `--text-secondary` | Below inputs, footnotes |
| Error Message | 12px | 400 Normal | `--danger` | Below invalid fields |
| Badge Text | 11px | 600 SemiBold | Varies | Status pill labels |

---

## 3. APP SHELL LAYOUT

*(Authenticated pages use this shell; auth pages do NOT.)*
```
┌──────────────────────────────────────────────────────────────────┐
│  TOP HEADER (64px, fixed, full‑width)                             │
│  [☰] [📚 Logo] … [🏢 Branch ▼] [🔔 Bell] [👤 Avatar ▼]           │
├─────────────────────┬───────────────────────────────────────────┤
│ SIDEBAR (240px)     │ MAIN CONTENT (margin‑left:240px, padding:24px) │
│ (collapsible)       │   Breadcrumb → Page Title (H1)                │
│                     │   Action Bar + Page Content                  │
└─────────────────────┴───────────────────────────────────────────┘
```

### Sidebar navigation (order shown in the doc) – each item: `icon + label`, active = indigo left border + `--primary‑subtle` background.

---

## 4. STATUS BADGE RULES (Universal)

**Critical Architecture Rule:** The mapping lives in a single constants file (`src/config/statusBadgeConfig.ts`). No inline switches.

Badge style: `border‑radius: var(--radius‑full); padding: 2px 10px; font‑size: 11px; font‑weight: 600;`.

| Status Value | Text Color | Background | Icon |
|---|---|---|---|
| Active / Working / Present / Sent / Delivered / Resolved / Paid / Fulfilled | `--success` text | `--success` bg | ✅ |
| Expiring Soon / Pending / In‑Progress / Moderate / Maintenance / Held / Late | `--warning` text | `--warning` bg | ⚠️ |
| Occupied / Suspended / Failed / Low Trust / Overdue / Due / Broken | `--danger` text | `--danger` bg | 🔴 |
| Exited / Inactive / Expired / Lost / Cancelled / Forfeited | `--text-secondary` | `#1E1E2E` | — |
| New / Interested / Visited | `--info` text | `--info` bg | 🔵 |
| Alumni | `--purple` | `--purple‑bg` | 🟣 |
| Blacklisted | `#FCA5A5` | `#7F1D1D` | ⛔ |

*(Payment mode colors use the `--pay‑*` tokens to avoid collision.)*

---

## 5. REUSABLE COMPONENT PATTERNS

### 5a. KPI / Stat Card
- Size: 200‑260 px × ~120 px
- Layout: Icon (32 px) + Upper‑cased label (11 px) → Big number (28 px) → Trend line.
- Styles: `bg-card`, `border border‑border`, `rounded‑lg`, hover elevation.

### 5b. Data Table
- Header: `bg‑[rgba(99,102,241,0.08)]`, uppercase 12 px `text‑secondary`.
- Rows: zebra striping, hover `bg‑[rgba(99,102,241,0.06)]`.
- Inline actions: edit ✏️, delete 🗑️ appear on row hover. **No View button** – click the row to open detail.
- Pagination + empty state with SVG + CTA.

### 5c. Form Layout
- Simple ≤6 fields → single column, max‑width 560 px.
- Complex >6 → two‑column grid inside full‑width card, sections separated by `<hr>`.
- Required label includes red `*`.
- Input: `bg‑input`, `border border‑border`, `rounded‑md`, focus `border‑focus` + indigo glow.
- Footer: Cancel (ghost) | Save (primary).

### 5d. Modal / Dialog
- Overlay: `backdrop rgba(0,0,0,0.6)`, `z‑40`.
- Card: `bg‑card`, `rounded‑xl`, `p‑7`, max‑width 480 px.
- Confirmation modal uses danger color, descriptive text, Cancel (ghost) + Confirm (danger).

### 5e. Visual Grid (Seat / Locker Matrix)
- CSS Grid auto‑fill, cells 64 × 64 px, rounded `radius‑md`, color by status.
- Hover scale 1.05, tooltip with details.

### 5f. Kanban Board
- Horizontal scroll lanes, each lane header shows status badge + count.
- Cards: `bg‑card`, `rounded‑lg`, left border colored by status.

### 5g. Wizard / Stepper
- Left vertical steps (01‑05) – active in `--primary`, completed with ✅.
- Right panel holds step content, top progress bar.

### 5h. Timeline (history logs)
- Vertical line left, dot per entry, date bold `text‑secondary`, content card right.

### 5i. Command Palette (Ctrl + K)
- Full‑screen overlay, centered card, input with search icon, grouped results, keyboard navigation.

### 5j. Confirmation Drawer
- Slide‑in from right, width 480 px, full height, footer Cancel (ghost) + Confirm.

### 5k. Inline Editable Cell
- Click → in‑place input, save on blur/Enter, cancel on Escape, loading spinner while API call.

---

## 6. FEEDBACK & STATE PATTERNS

- **Toast:** bottom‑right, 320 px, `z‑50`, auto‑dismiss 4 s, success ✅ / error ❌.
- **Loading:** skeletons using `--skeleton‑*` variables, matching exact layout.
- **Empty:** centered SVG, heading “No […] yet”, CTA button “➕ Add […]”.
- **Form Validation:** red border (`--danger`) + error message.
- **Confirmation Dialogs:** required for Delete, Blacklist, Suspend, Exit, Refund, etc.

---

## 7. BUTTON HIERARCHY

| Type | Style | Usage |
|---|---|---|
| Primary | `bg‑primary` white text, `rounded‑md` | Main CTA (one per view) |
| Danger Primary | `bg‑danger` off‑white text | Destructive actions |
| Ghost / Outlined | Transparent, `border border‑border`, `text‑primary` | Secondary actions |
| Ghost Danger | Transparent, `border‑danger`, `text‑danger` | Soft destructive |
| Icon Button | 32 × 32 px circle/square, icon only | Inline row actions |
| Text Link | `text‑primary` underline on hover | Navigation links |
| Segmented Control | Joined group, selected `bg‑primary` | Payment mode selector, view toggles |

**Placement Rules** – CTA at top‑right of action bar, form submit bottom‑right, destructive paired with Cancel on left, row actions only on hover, wizard Next/Back in footer.

---

## 8. RESPONSIVE BEHAVIOR

| Breakpoint | Behaviour |
|---|---|
| Desktop ≥1280 px | Full sidebar (240 px), all columns visible |
| Tablet 768‑1279 px | Sidebar collapses to icons‑only (60 px), tables scroll horizontally |
| Mobile <768 px | Sidebar hidden (hamburger drawer), tables become card‑stacks, forms single‑column, KPI cards horizontally scroll |

---

## 9. ICONS

**Rule:** Never use raw emoji – use **Lucide** components.

Examples: `Users`, `UserPlus`, `Armchair`, `IndianRupee`, `Calendar`, `Bell`, `Settings`, `CheckCircle`, etc.

---

## 10. CHART STYLE GUIDE (ApexCharts)

| Chart | Colors | Usage |
|---|---|---|
| Bar (grouped) | Income `#6366F1`, Expense `#EF4444` | Monthly income vs expense |
| Line | Line `#10B981`, area `rgba(16,185,129,0.15)` | Revenue trend |
| Pie / Donut | Indigo, Emerald, Amber, Blue, Purple, Red | Category breakdown |
| Horizontal Bar | `#6366F1` | Seat utilisation |

All charts: dark background `--bg-card`, axis `--text-secondary`, grid `rgba(255,255,255,0.05)`, dark tooltip style.

---

## 11. THEMING & DARK/LIGHT MODE

1. **Never hard‑code Tailwind colors** for backgrounds/text – always use the CSS‑variable‑based classes (`bg‑card`, `text‑primary`).
2. **Canonical pattern:** Define variables in `globals.css`, map them in `tailwind.config.ts`, use the generated Tailwind classes.
3. Wrap app in `ThemeProvider` (`next‑themes`) that toggles `.dark` on `<html>`.
4. Gradients/shadows use `var(--primary)` etc.
5. Custom scrollbars, glass‑morphism, and backdrop blur follow the variable tokens.

---

## 12. PREMIUM UI & MICRO‑INTERACTIONS

- Universal transition: `transition‑all duration‑200 ease‑in‑out` on buttons, cards, dropdowns.
- Hover elevation: `hover:-translate-y-1 hover:shadow-lg`.
- Active press: `active:scale‑95`.
- Glassmorphism for sticky headers (`bg‑header/80 backdrop‑blur‑md`).
- Custom thin scrollbars globally (`::-webkit‑scrollbar`).
- Z‑Index scale:
  - `z‑10` sticky table headers/action bars
  - `z‑20` top navbar
  - `z‑30` popovers/tooltips
  - `z‑40` modal overlays
  - `z‑50` toasts

---

## 13. ENTERPRISE UX SAFEGUARDS & ACCESSIBILITY

1. **Truncation + Tooltip:** Any constrained dynamic text uses `truncate` + Tooltip.
2. **Irreversible actions** require a *type‑to‑confirm* input before the danger button enables.
3. **Focus rings:** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-page)]` on all interactive elements.

---

## 14. PRINT & EXPORT STYLES

- `@media print` hides sidebar, header, action bars, toasts.
- PrintableWrapper component ensures white background, black text.

---

## 15. GLOBAL KEYBOARD SHORTCUT MAP

- `Ctrl + K` → command palette
- `Esc` → close modal/drawer
- `Ctrl + S` → submit active form
- `?` → shortcut help overlay

---

## 16. NOTIFICATION & ALERT BANNERS

- Persistent banner below top header, uses status colors (`--warning‑bg`, `--danger‑bg`, etc.).
- Dismissable with `X` icon.

---

## 17. DATA DENSITY MODES

- **Compact:** 32 px row height, 12 px font.
- **Comfortable (default):** 48 px row height, 14 px font.
- Toggle stored via `useLocalStorage` hook.

---

## 18. RIGHT‑CLICK CONTEXT MENU

- Mirrors inline actions (Edit, Delete, Copy ID). No View action (row click already navigates).
- Styled with `shadow‑2xl`, `z‑30`.

---

## 19. TOOLTIP DESIGN SPEC

- Background `bg‑card` + `border‑border`
- Font 12 px `text‑primary`
- Max‑width 240 px, arrow, 300 ms show delay, 100 ms hide, `z‑30`.

---

## 20. FORM FIELD DISABLED & READ‑ONLY

- Disabled: `opacity‑50`, `cursor‑not-allowed`, same bg, no focus ring.
- Read‑only: full opacity, `cursor‑default`, dashed `border‑border`, no focus ring.
- Success state: `border‑success` + checkmark inside.

---

## 21. NUMBER & CURRENCY FORMATTING

- Indian notation: `₹1,23,456.00`.
- KPI abbrev: `₹12.4L`, `₹2.3Cr`.
- Percentages: one decimal (`12.5%`).
- Negatives red with minus sign.
- Centralised in `src/lib/formatters.ts`.

---

## 22. TABLE COLUMN WIDTH STRATEGY

- ID: `w‑24`
- Name: flexible, `min‑w‑0 truncate`
- Status badge: `w‑28` centered
- Date: `w‑32`
- Amount/Number: `w‑28` right‑aligned
- Actions: `w‑20` right‑aligned, never truncated.

---

## 23. DRAG & DROP INTERACTION

- Library: `@dnd-kit/core`.
- Drag state: `opacity‑0.5`, `cursor‑grabbing`, `scale‑105`.
- Valid drop: `border‑2 dashed var(--primary)`, bg `rgba(99,102,241,0.08)`.
- Invalid drop: `border‑2 dashed var(--danger)`.
- Snap animation `transition‑transform 200ms ease`.

---

## 24. LOADING BUTTON STATE

- Keep width, replace text with `Loader2` (`animate‑spin`), `disabled`.

---

## 25. MOBILE CARD‑STACK TABLE PATTERN

- On <768 px, table rows become cards.
- Title = primary identifier, status badge top‑right.
- Other columns become `Label: Value` rows.
- Inline actions at card bottom or via `…` dropdown.

---

*END OF GLOBAL DESIGN SYSTEM*
