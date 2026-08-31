# 🎨 SMART LIBRARY 360 — GLOBAL DESIGN SYSTEM

> **Prepend this block to EVERY module you give to Stitch.**
> This ensures visual consistency across all 109 pages.
> Stack: Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS · shadcn/ui components

---

## 1. COLOR PALETTE

*Note: For v1, the system defaults to Dark Mode. Light mode values are provided below for future-proofing and consistency.*

### Core Colors
| Token | Dark Mode (Default) | Light Mode | Usage |
|---|---|---|---|
| `--primary` | `#6366F1` (Indigo-500) | `#4F46E5` | Primary buttons, active nav item, links |
| `--primary-hover` | `#4F46E5` (Indigo-600) | `#4338CA` | Primary button hover state |
| `--primary-subtle` | `#EEF2FF` (Indigo-50) | `#EEF2FF` | Soft badge backgrounds, selected row highlight |
| `--bg-page` | `#0F0F1A` | `#F8FAFC` | Main page background |
| `--bg-card` | `#1A1A2E` | `#FFFFFF` | Card, panel, table background |
| `--bg-sidebar` | `#12121F` | `#F1F5F9` | Sidebar background |
| `--bg-header` | `#16162A` | `#FFFFFF` | Top header background |
| `--bg-input` | `#1E1E32` | `#FFFFFF` | Input field background |
| `--border` | `#2A2A3E` | `#E2E8F0` | Card borders, table dividers, input borders |
| `--border-focus` | `#6366F1` | `#4F46E5` | Input border on focus |
| `--text-primary` | `#F0F0FF` | `#0F172A` | All primary text, headings, table values |
| `--text-secondary` | `#94A3B8` (Slate-400) | `#64748B` | Labels, captions, placeholder text (improved contrast) |
| `--text-disabled` | `#44445A` | `#94A3B8` | Disabled states |
| `--skeleton-base` | `#2A2A3E` | `#E2E8F0` | Loading skeleton base color |
| `--skeleton-highlight`| `#3F3F5A` | `#F1F5F9` | Loading skeleton shimmer highlight |

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
| `--pay-cash` | `#5EEAD4` (Teal) | `#134E4A` | Cash payments |
| `--pay-upi` | `#67E8F9` (Cyan) | `#164E63` | UPI payments |
| `--pay-card` | `#94A3B8` (Slate)| `#1E293B` | Card payments |
| `--pay-bank` | `#38BDF8` (Sky) | `#0C4A6E` | Bank Transfers |

### Border Radius Scale
| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `4px` | Small elements, checkboxes |
| `--radius-md` | `8px` | Buttons, Inputs, standard elements |
| `--radius-lg` | `12px` | Cards, Panels, standard containers |
| `--radius-xl` | `16px` | Modals, large surface areas |
| `--radius-full`| `999px` | Status badges, circular avatars |

---

## 2. TYPOGRAPHY

- **Font Family:** `Inter` — loaded via `next/font/google` (NOT Google Fonts CDN `@import`): `import { Inter } from 'next/font/google'`
- **Base font-size:** 14px

| Role | Size | Weight | Color | Usage |
|---|---|---|---|---|
| Page Title (H1) | 22px | 700 Bold | `--text-primary` | One per page, top-left |
| Section Heading (H2) | 16px | 600 SemiBold | `--text-primary` | Section titles inside cards |
| Card Label | 11px | 500 Medium | `--text-secondary` | UPPERCASED stat card labels |
| Stat Number | 28px | 700 Bold | `--text-primary` | Big KPI numbers on dashboard cards |
| Table Header | 12px | 600 SemiBold | `--text-secondary` | UPPERCASED column headers |
| Table Cell | 14px | 400 Normal | `--text-primary` | Row data values |
| Button Text | 14px | 500 Medium | White / `--primary` | Primary / ghost buttons |
| Input Text | 14px | 400 Normal | `--text-primary` | User-typed values |
| Caption / Helper | 12px | 400 Normal | `--text-secondary` | Below inputs, footnotes |
| Error Message | 12px | 400 Normal | `--danger` | Below invalid input fields |
| Badge Text | 11px | 600 SemiBold | Varies | Status pill labels |

---

## 3. APP SHELL LAYOUT

Every authenticated page uses this shell. Auth pages (`login`, `signup`, `forgot-password`, `reset-password`) do NOT use this shell.

```
┌──────────────────────────────────────────────────────────────────┐
│  TOP HEADER (height: 64px, position: fixed, top: 0, full-width)  │
│  [☰ Collapse] [📚 Smart Library 360 Logo]  ··· [🏢 Branch Name ▼] [🔔 Bell (badge count)] [👤 Avatar + Name ▼]  │
├────────────────┬─────────────────────────────────────────────────┤
│  SIDEBAR       │  MAIN CONTENT AREA                              │
│  width: 240px  │  margin-left: 240px                            │
│  (collapsible  │  padding: 24px                                 │
│   to 60px,     │  margin-top: 64px (below header)               │
│   icon-only    │                                                 │
│   mode on      │  [Breadcrumb: Dashboard > Students > Profile]  │
│   toggle)      │  [Page Title (H1) + subtitle]                  │
│                │  [Action Bar: filters left + CTA buttons right] │
│  position:     │  [Page Content: table / form / grid / charts]  │
│  fixed, left:0 │                                                 │
│  bg: --bg-sidebar                                               │
│  border-right: │  *Note: Sidebar nav items scroll independently  │
│  1px --border  │  (overflow-y-auto), header/toggle stay pinned.* │
└────────────────┴─────────────────────────────────────────────────┘
```

### Sidebar Nav Groups & Items (in order)
Each nav item has: [Icon] Label · Active state = Indigo left border + `--primary-subtle` background

```
📊  Dashboard
📈  Reports
── CRM ──────────────────────
📞  Enquiries
── Students ─────────────────
🎓  All Students
➕  New Admission
👥  Group Admission
🎓  Alumni
🗄️  Document Vault
🏅  Referral Bonus
── Seats & Shifts ───────────
🗺️  Seat Matrix
🪑  Seats
🔄  Shifts
↔️  Shift Migration
📋  Allocations
📜  Seat History
🔒  Lockers
🗺️  Locker Matrix
── Finance ──────────────────
💰  Collect Fee
📋  Subscriptions
🔁  Renewals
💳  Payments
🤝  Payment Promises
🛡️  Trust Scores
💼  Security Deposits
⏰  Late Fees
🚫  Auto-Suspend
🧾  Invoice
🧾  Receipt
👥  Referrals
💸  Refunds
── Operations ───────────────
📅  Attendance
📋  Absentee Report
📷  QR Scanner
📅  Holiday Calendar
── Accounts & Assets ────────
💸  Expenses
📊  Financial Reports
📊  Daily Settlement
🪑  Seat Gap Report
🔍  Shift Gap Analyzer
🏭  Assets
🔧  Asset Maintenance
── Communication ─────────────
📢  Notices
💬  Complaints
🔔  Notification Center
📱  WhatsApp Logs
📱  WhatsApp Templates
── Admin ─────────────────────
🏢  Branches
👥  Staff & Users
🔑  Permissions
💰  Plans
🎟️  Coupons
⏳  Waitlist
🚫  Blacklist
🔍  Audit Logs
📤  Bulk Import
📥  Data Export
💾  Backups
🧾  GST & Tax Settings
── System ────────────────────
⚙️  Settings
👤  Profile
🎨  Branding
📱  WhatsApp Integration
```

---

## 4. STATUS BADGE RULES (Universal — Apply to ALL pages)

> **CRITICAL ARCHITECTURE RULE:** The status-to-color mapping MUST live in a single constants file (e.g. `src/config/statusBadgeConfig.ts`), never as inline if/else or switch-case statements inside individual components. (Consistent with Frontend Rule 3/35).

Badges are small pill-shaped labels: `border-radius: var(--radius-full)`, `padding: 2px 10px`, `font-size: 11px`, `font-weight: 600`.

| Status Value | Text Color | Background | Icon |
|---|---|---|---|
| Active / Working / Present / Sent / Delivered / Resolved / Paid / Fulfilled | `--success text` | `--success bg` | ✅ |
| Expiring Soon / Pending / In-Progress / Moderate / Maintenance / Held / Late | `--warning text` | `--warning bg` | ⚠️ |
| Occupied / Suspended / Failed / Low Trust / Overdue / Due / Broken | `--danger text` | `--danger bg` | 🔴 |
| Exited / Inactive / Expired / Lost / Cancelled / Forfeited | `--text-secondary` | `#1E1E2E` | — |
| New / Interested / Visited | `--info text` | `--info bg` | 🔵 |
| Alumni | `--purple` | `--purple-bg` | 🟣 |
| Blacklisted | `#FCA5A5` | `#7F1D1D` | ⛔ |

*(Note: Payment Modes (Cash, UPI, Card, Bank) use `--pay-*` tokens mapped in Section 1 to avoid visual collision with these statuses).*

---

## 5. REUSABLE COMPONENT PATTERNS

### 5a. KPI / Stat Card
- Size: roughly 200–260px wide, height ~120px
- Structure: Top-left icon (32px, in a rounded square with subtle color background) + label (UPPERCASE, 11px, `--text-secondary`) · Below: Big number (28px bold, `--text-primary`) · Bottom: Trend line ("↑ 12% vs last month" in green, or "↓ 3%" in red)
- Background: `--bg-card`, border: `1px solid --border`, border-radius: var(--radius-lg)
- Arranged in a row of 3–5 cards at the top of dashboard/report pages

### 5b. Data Table
- Header row: `background: rgba(99,102,241,0.08)`, UPPERCASE 12px `--text-secondary`, sortable columns show ↑↓ arrows on hover
- Data rows: alternating subtle zebra stripe (`--bg-card` / slightly lighter), 48px row height
- Row hover: `background: rgba(99,102,241,0.06)`, subtle highlight
- Inline row actions (rightmost column): small icon buttons — ✏️ Edit, 🗑️ Delete — shown on row hover. **There is NO View/Eye button — clicking the entire row opens the detail view (see Frontend Rule 19).**
- Pagination bar (below table): "Showing 1–25 of 143 results" + Previous / Next buttons + rows-per-page selector (10 / 25 / 50)
- Empty state (no rows): Centered SVG illustration + "No [items] found" (16px, `--text-secondary`) + optional CTA button

### 5c. Form Layout
- **Simple form** (≤6 fields): single column, centered card, max-width 560px
- **Complex form** (>6 fields): two-column grid inside a full-width card, grouped in labeled sections separated by a horizontal rule
- Each field: Label above (14px, `--text-secondary`, bold) → Input below → Helper/error text below input (12px)
- Required fields: Label has red asterisk `*`
- Input styling: `background: --bg-input`, `border: 1px solid --border`, border-radius: var(--radius-md), padding: 10px 14px, focus: `border-color: --border-focus` + subtle indigo glow
- Form footer: Buttons right-aligned — Cancel (ghost) | Save/Submit (primary)

### 5d. Modal / Dialog
- Overlay: `backdrop: rgba(0,0,0,0.6)`, centered, **`z-40`** (Tailwind class — see Section 12 Z-Index Scale)
- Modal card: `background: var(--bg-card)`, border-radius: var(--radius-xl), padding: 28px, max-width: 480px
- Structure: Title (18px bold) + Description text + Content area + Footer buttons
- **Confirmation/Destructive modal:** Icon = ⚠️ (amber) or 🗑️ (red) · Description explains what will happen · Buttons: "Cancel" (ghost, left) + "Confirm" (danger red, right)
- **Form modal / Drawer:** Slide-in from right, width 480px, full-height, has its own form + Save/Cancel footer

### 5e. Visual Grid (Seat / Locker Matrix)
- CSS Grid, auto-fill columns (8–10 per row depending on count)
- Each cell: 64×64px, rounded: var(--radius-md), colored by status (see badge rules above)
- Cell content: seat/locker number centered (bold, 13px)
- Hover: scales up slightly (transform: scale 1.05), shows tooltip popover (student name + shift + expiry)
- Empty cell (free): click → quick-assign action
- Occupied cell (red): click → navigates to `student-profile.tsx`

### 5f. Kanban Board
- Horizontal scrollable columns container
- Each column = a status lane: header with status badge + count · Cards stacked vertically below
- Card: `background: --bg-card`, border-radius: var(--radius-lg), padding: 14px, border-left: 3px solid [status color]
- Card content: Name (bold), Phone (masked: 98****2310), tag/badge for shift or date

### 5g. Wizard / Stepper
- Left panel: vertical step list numbered 01–05, active step in `--primary`, completed steps with ✅ checkmark
- Right panel: current step form content
- Top: progress bar (fills from 0% → 100% as steps complete)
- Footer: "← Back" ghost button (left) + "Next →" primary button (right)

### 5h. Timeline (for follow-ups, history logs)
- Vertical line on left (2px, `--border`)
- Each entry: colored dot on line + date (bold, `--text-secondary`) + content card to the right
- Newest entry at top
### 5i. Command Palette (Ctrl+K)
- **Overlay:** `backdrop: rgba(0,0,0,0.6)`
- **Modal card:** Centered, top-aligned (margin-top: 10vh), max-width 600px.
- **Content:** Large input field with magnifying glass icon `🔍 Search or jump to...`.
- **Results:** Grouped by category (e.g., Pages, Recent Members, Actions) with keyboard up/down navigation support.
- **Trigger:** Global `Ctrl+K` listener on all pages.

### 5j. Confirmation Drawer (Not just Modal)
- **Usage:** For complex confirmations requiring data context (e.g., "You are about to refund ₹5,000. Here are the transaction details: [...]").
- **Layout:** Slide-in from the right side, width 480px, full-height.
- **Footer:** Cancel (ghost) | Confirm Action (danger or primary).

### 5k. Inline Editable Cell Pattern
- **Usage:** For rapid editing inside data tables without opening a modal.
- **Default State:** Text display with `truncate`.
- **Active State (On click):** Input field appears in-place with `--border-focus` ring.
- **Save (On blur/Enter):** Save changes and revert to text display.
- **Cancel (On Escape):** Revert without saving.
- **Loading:** Show a small spinner inside the cell while the API call is in flight.

---

## 6. FEEDBACK & STATE PATTERNS

### Toast Notifications
- Position: Bottom-right corner, fixed
- Size: 320px wide, padding: 16px, border-radius: var(--radius-lg)
- ✅ Success: green left border + "✅ [message]"
- ❌ Error: red left border + "❌ [message]"
- Auto-dismiss after 4 seconds with slide-out animation

### Loading State
- Show skeleton loaders (using `--skeleton-base` and `--skeleton-highlight`) that match the exact layout of the page content
- Tables: show 5–8 skeleton rows with random widths
- Stat cards: show shimmer blocks the size of the card

### Empty State
- Centered in the content area
- Simple SVG icon (related to the entity — e.g., 🎓 for students, 💳 for payments)
- Heading: "No [items] yet" (16px, `--text-secondary`)
- Subtext: "Get started by adding your first [item]" (13px, `--text-secondary`)
- CTA button: Primary button "➕ Add [item]" (if user has permission)

### Form Validation
- Validate on submit + on blur
- Error: red border on input (`border-color: --danger`) + error message below (12px, `--danger`)
- Success: green border on input after valid value entered

### Confirmation Dialogs (REQUIRED FOR these actions)
Always show a modal before executing: Delete, Soft-Delete, Blacklist, Suspend, Mark Exit, Forfeit Deposit, Close Register, Process Refund, Remove from Waitlist, Revoke Permission.

---

## 7. BUTTON HIERARCHY RULES

| Type | Style | Usage |
|---|---|---|
| **Primary** | Solid `--primary` background, white text, border-radius: var(--radius-md), padding: 10px 20px | Main CTA per page (one per view) |
| **Danger Primary** | Solid `--danger` background, off-white text (to pass WCAG contrast) | Destructive confirm actions (Delete, Blacklist, Exit) |
| **Ghost / Outlined** | Transparent bg, `--border` border, `--text-primary` text | Secondary actions (Cancel, Export, Back) |
| **Ghost Danger** | Transparent bg, `--danger` border, `--danger` text | Soft destructive (Mark Lost, Deactivate) |
| **Icon Button** | 32×32px circle or square, icon only | Inline table row actions (Edit ✏️, Delete 🗑️) |
| **Text Link** | No bg, no border, `--primary` text, underline on hover | Navigation links, "Forgot Password?", "Add Category" |
| **Segmented Control** | Joined button group, selected = `--primary` bg | Payment mode selector (Cash/UPI/Card), view toggles |

### Button Placement Rules
- **Page-level CTA** (e.g., "Add Student", "New Admission"): TOP-RIGHT of the action bar
- **Form submit** (e.g., "Save", "Confirm"): BOTTOM-RIGHT of the form card
- **Destructive** (e.g., "Delete", "Blacklist"): Always paired with "Cancel" ghost button to its LEFT
- **Inline row actions**: Rightmost column of data tables, shown on row hover only
- **Wizard "Next/Back"**: Footer of wizard step — Back (left ghost) | Next (right primary)

---

## 8. RESPONSIVE BEHAVIOR

| Breakpoint | Behavior |
|---|---|
| Desktop ≥1280px | Full sidebar (240px) + full content. Tables show all columns. |
| Tablet 768–1279px | Sidebar collapses to icon-only (60px). Tables scroll horizontally. |
| Mobile <768px | Sidebar hidden, accessible via hamburger menu drawer. Tables become card-stacks. Forms single-column. KPI cards use horizontal scroll or 2-col grid. Charts use reduced height & simplified legend. |

---

## 9. ICONS

> **CRITICAL RULE:** Emojis used throughout this document (📊, ✅, 🔴, 🎓, etc.) are strictly shorthand for human readability in this documentation. Actual implementation MUST use the corresponding **Lucide icon component**, NEVER a raw emoji character in JSX.

Use **Lucide Icons** (tree-shakeable, consistent style). Key icons:
- 🧑🎓 Students: `Users`, `UserPlus`, `UserCheck`, `UserX`
- 🪑 Seats: `Armchair`, `Grid`, `LayoutGrid`
- 💰 Finance: `IndianRupee`, `Receipt`, `CreditCard`, `Wallet`
- 📅 Dates: `Calendar`, `CalendarDays`, `Clock`
- 🔔 Alerts: `Bell`, `BellRing`, `AlertTriangle`
- 📊 Reports: `BarChart2`, `LineChart`, `PieChart`, `TrendingUp`
- ⚙️ Admin: `Settings`, `Shield`, `Lock`, `Key`
- 📤 Actions: `Upload`, `Download`, `FileText`, `Printer`
- 💬 Comms: `MessageSquare`, `Phone`, `Mail`
- ✅ Status: `CheckCircle`, `XCircle`, `Clock`, `AlertCircle`

---

## 10. CHART STYLE GUIDE (for `reports.tsx`, `financial-reports.tsx`, `dashboard.tsx`)

**Canonical chart library: ApexCharts** (`react-apexcharts`). Do NOT use Recharts or Chart.js — the project uses ApexCharts exclusively.

| Chart Type | Colors | Usage |
|---|---|---|
| Bar Chart (grouped) | Income bars: `#6366F1` (Indigo) · Expense bars: `#EF4444` (Red) | Income vs Expense monthly comparison |
| Line Chart | Line: `#10B981` (Green) · Area fill: `rgba(16,185,129,0.15)` | Revenue trend over months |
| Pie / Donut Chart | Slice colors: Indigo, Emerald, Amber, Blue, Purple, Red (in that order) | Shift occupancy, expense category breakdown |
| Horizontal Bar | Single color: `#6366F1` | Seat utilization, student growth |

All charts: dark background (`--bg-card`), `--text-secondary` axis labels, gridlines `rgba(255,255,255,0.05)`, tooltips with dark card style matching the design system.

---

## 11. THEMING & DARK/LIGHT MODE

This design system intrinsically supports both Dark and Light modes using CSS variables. 
When building modules or components, **ALWAYS follow these rules** to ensure seamless theme switching:

1. **Never use hardcoded Tailwind colors** for backgrounds or text (e.g., `bg-white`, `bg-gray-900`, `text-black`, `text-white`) unless explicitly required for a specific UI element (like a primary button where text is always white).
2. **The One Canonical Pattern for CSS Variables:** Define the variable in `globals.css` → map it as a named token in `tailwind.config.ts` → use the Tailwind class name in JSX (e.g., `bg-card`, `text-primary`). **Never use `bg-[var(--bg-card)]` or `bg-[#1A1A2E]` directly in JSX.** This is the single source of truth that resolves any ambiguity between Rule 4 and Rule 36 of the Frontend Instructions.
3. **Theme Provider**: Ensure the app is wrapped in a `ThemeProvider` (like `next-themes`) that toggles a `.dark` class on the `<html>` or `<body>` tag.
4. **CSS Setup**: In your global CSS file (e.g., `globals.css`), define the light mode variables inside `:root { ... }` and the dark mode variables inside `.dark { ... }`.
5. **Gradients & Shadows**: For gradients and shadows, use variables like `var(--primary)` instead of hardcoded hex/rgba. Note that shadows like `shadow-black/50` will need to switch to `shadow-gray-200/50` or similar when implementing Light Mode.

---

## 12. PREMIUM UI & MICRO-INTERACTIONS (The WOW Factor)

To ensure the application feels like a world-class, premium SaaS, **every developer and AI agent MUST adhere to these interaction details:**

1. **Universal Micro-Animations:** No interactive element should change state instantly. 
   - Apply `transition-all duration-200 ease-in-out` universally to buttons, cards, list items, and dropdown items.
   - **Hover effects:** Cards should elevate (`hover:-translate-y-1 hover:shadow-lg`), and buttons should have subtle brightness changes.
   - **Active states:** Buttons should scale down slightly when clicked (`active:scale-95`).

2. **Glassmorphism & Depth (Z-Axis Elevation):**
   - **Sticky Headers:** Must not be solid flat colors. Use translucent backgrounds with blur (e.g., `bg-[var(--bg-header)]/80 backdrop-blur-md`).
   - **Modals, Tooltips, & Dropdowns:** Must use deep, soft shadows to create physical separation from the background (e.g., `shadow-2xl shadow-black/50` in dark mode).

3. **Custom Premium Scrollbars:**
   - Default browser scrollbars destroy the premium aesthetic.
   - Implement custom thin scrollbars globally via CSS: `::-webkit-scrollbar { width: 6px; height: 6px; }`, with a rounded thumb (`bg-[var(--border)]`) and a transparent track.

4. **Strict Z-Index Layering Scale:**
   Never use random `z-50` or `z-999` classes. Strictly follow this scale to prevent UI collision:
   - `z-10`: Sticky Table Headers & Sticky Action Bars
   - `z-20`: Top App Header (Navbar)
   - `z-30`: Popovers, Tooltips, & Dropdowns
   - `z-40`: Modal Overlays & Dialogs
   - `z-50`: Toast Notifications & Critical Alerts

---

## 13. ENTERPRISE UX SAFEGUARDS & ACCESSIBILITY

To guarantee stability, safety, and compliance in an ERP environment, these rules are mandatory:

1. **Data Overflow Strategy (Truncation + Tooltips):**
   - **The Problem:** Unpredictably long user inputs (e.g., a 100-character email) will stretch and break responsive table and card layouts.
   - **The Rule:** Any dynamic text inside a constrained container MUST use Tailwind's `truncate` class. Whenever text is truncated, you MUST wrap it in a Tooltip component so the user can hover to read the full value.

2. **Irreversible Action Safeguards ("Type-to-Confirm"):**
   - **The Problem:** Standard confirmation modals are too easy to accidentally click through for catastrophic actions (like "Delete Entire Branch" or "Purge Financial Records").
   - **The Rule:** For highly destructive and irreversible actions, the modal MUST require the user to manually type a confirmation phrase (e.g., `Please type "DELETE" to confirm`) into an input field before the Danger button is enabled.

3. **Enterprise Accessibility (WCAG Focus Rings):**
   - **The Problem:** Default browser focus outlines (when users navigate via the `Tab` key) are often inconsistent or invisible in dark mode, failing WCAG accessibility standards.
   - **The Rule:** Never rely on default outlines. All interactive elements (Inputs, Buttons, Links, Dropdown Items) MUST explicitly define a `focus-visible` state that matches the design system.
   - **Snippet:** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-page)]`

---

## 14. PRINT & EXPORT STYLES
Enterprise ERP users print receipts, invoices, and reports constantly.
- **`@media print` rules:** Must hide the sidebar, header, action bars, and toast notifications.
- **Print typography:** Ensure black text on a pure white background (no dark themes in print mode).
- **Pattern:** Use a `PrintableWrapper` component for areas of the screen that should survive the print stylesheet.

## 15. GLOBAL KEYBOARD SHORTCUT MAP
Power users expect keyboard navigation. Respect these shortcuts universally:
- `Ctrl + K`: Global search/command palette
- `Esc`: Close any open modal, drawer, or dropdown
- `Ctrl + S`: Submit the active form
- `?`: Show a keyboard shortcut help overlay

## 16. NOTIFICATION & ALERT BANNER PATTERNS
Unlike toasts (which auto-dismiss), alert banners are persistent inline messages.
- **Placement:** Sits immediately below the top header, pushing page content down.
- **Usage:** "Your subscription expires in 3 days", "Branch is in maintenance mode".
- **Styles:** Use the background colors mapped in Section 1 (e.g., `--warning-bg` for expiring warnings) with a clear dismissal `X` icon (if dismissible).

## 17. DATA DENSITY MODES
Enterprise users have different preferences for how much data fits on a screen.
- **Compact Mode:** 32px row height, smaller font (12px). Zebra striping is preserved. For power users managing 500+ records.
- **Comfortable Mode (Default):** 48px row height, standard 14px font.
- **Implementation:** A toggle in settings/header switches between these modes. Save preference using a `useLocalStorage` hook (never call `window.localStorage` directly — see Frontend Rule 61).

## 18. RIGHT-CLICK CONTEXT MENU PATTERN
- **Usage:** On tables and Kanban cards, right-clicking should open a custom context menu.
- **Actions:** Must mirror the inline action column only: ✏️ Edit, 🗑️ Delete, 📋 Copy ID. **Do NOT include a 👁️ View action** — row click already handles navigation (see Frontend Rule 19).
- **Styling:** Small dropdown menu with `shadow-2xl` matching the Glassmorphism rules (`z-30`).

## 19. TOOLTIP DESIGN SPECIFICATION
- **Background:** `var(--bg-card)` with `1px solid var(--border)`.
- **Typography:** `12px`, `var(--text-primary)`.
- **Layout:** `max-width: 240px`, word-wrap enabled.
- **Arrow:** Small triangle pointing to the trigger element.
- **Animation/Delay:** 300ms show delay, 100ms hide delay (prevents flicker on mouse-over).
- **Z-index:** `z-30`.

## 20. FORM FIELD DISABLED & READ-ONLY STATES
- **Disabled:** `opacity: 0.5`, `cursor: not-allowed`, background `--bg-input` (no change), no focus ring.
- **Read-only:** Full opacity, `cursor: default`, subtle `--border` dashed instead of solid, no focus ring.
- **Filled/Success:** `border-color: --success` with a small checkmark icon inside the input.

## 21. NUMBER & CURRENCY FORMATTING RULES
- **Currency:** Always format using the Indian Numbering System: `₹1,23,456.00` (never `₹123456`).
- **Large Numbers (KPIs):** Abbreviate: `₹12.4L`, `₹2.3Cr`.
- **Percentages:** Always 1 decimal place: `12.5%`.
- **Negative Numbers:** Red color (`--danger`) with minus sign: `-₹500`.
- **Implementation:** Centralized in `src/lib/formatters.ts`.

## 22. TABLE COLUMN WIDTH STRATEGY
- **ID/Reference Columns:** Fixed narrow width (`w-24`).
- **Name Columns:** Flexible, `min-width` set, `truncate` class mandatory.
- **Status Badge Columns:** Fixed width (`w-28`), center-aligned.
- **Date Columns:** Fixed width (`w-32`).
- **Amount/Number Columns:** Fixed width, right-aligned (standard accounting convention).
- **Action Columns:** Fixed narrow width (`w-20`), right-aligned, never truncated.

## 23. DRAG & DROP INTERACTION PATTERN
- **Library:** Use `@dnd-kit/core`.
- **Dragging Item State:** `opacity: 0.5`, `cursor: grabbing`, subtle scale up `scale-105`.
- **Valid Drop Target:** `border: 2px dashed var(--primary)`, background `rgba(99,102,241,0.08)`.
- **Invalid Drop Target:** `border: 2px dashed var(--danger)`.
- **Animation:** After drop, use a smooth snap animation (`transition: transform 200ms ease`).

## 24. LOADING BUTTON STATE
- **Behavior:** When a button triggers an async action, it must transition to a loading state.
- **Visuals:** The button retains its width, the text is replaced (or shifted) by a small spinner icon (e.g., `Loader2` from lucide-react with `animate-spin`), and `disabled={true}` is applied.

## 25. MOBILE CARD-STACK TABLE PATTERN
- **Behavior:** On mobile (<768px), standard data tables must collapse into a vertically stacked list of cards.
- **Layout:** Each row becomes a card. The primary identifier (Name/ID) becomes the card title. Status badges align top-right. Other columns become `Label: Value` pairs stacked inside the card.
- **Actions:** Inline actions appear at the bottom of the card or via a `...` dropdown menu.
