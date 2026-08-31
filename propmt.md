# Smart PG — Frontend Prompt Pack (Next.js + localStorage)

Yeh file **copy-paste prompt bible** hai. Isko sequentially use karo. Har prompt ke baad code chalna chahiye. AI ko **ek prompt at a time** do.

---

## 0) Kaise use karna hai (pehle yeh padho)

### Golden rules
1. **Pehle Prompt 00** ko har naye chat me paste karo (master rules).
2. Phir us chat me **sirf 1 numbered prompt** do.
3. Prompt complete hone ke baad browser me check karo.
4. Next prompt **naye message** me do, pehle wala repeat mat karo unless AI bhool jaye.
5. Agar SuperAdmin me error aaye to AI ko do:
   - Prompt 00
   - `app/superadmin` folder
   - `components/superadmin` folder
   - `lib/storage` (sirf tab jab data toot raha ho)
6. **Koi shared dashboard nahi.** Har role ka apna layout, sidebar, navbar, cards, tables.
7. Code repeat ho to chalega. Copy-paste better hai shared abstraction se.
8. Components me **raw localStorage mat likho**. Sirf `lib/storage` + `lib/api` use hoga. Backend aane par sirf `lib/api` change hoga.

### Recommended chat strategy
- Chat A: Prompt 00 + 01 + 02 + 03 (foundation)
- Chat B: Prompt 00 + SuperAdmin prompts
- Chat C: Prompt 00 + Owner prompts
- Chat D: Prompt 00 + Manager
- Chat E: Prompt 00 + Staff
- Chat F: Prompt 00 + Tenant
- Chat G: Prompt 00 + Parent
- Chat H: Prompt 00 + cross-flow polish

---

# PROMPT 00 — MASTER RULES  
**Har naye AI chat ka pehla message. Hamesha paste karo.**

```text
You are a senior Next.js frontend engineer. Build a production-quality FRONTEND-ONLY Smart PG Management System.

STACK
- Next.js App Router + TypeScript
- Tailwind CSS
- lucide-react icons
- No backend, no database, no Prisma, no API routes that hit a server DB
- All persistence = browser localStorage
- All “backend” access must go through lib/api/* functions
- Components MUST NOT call localStorage directly

ARCHITECTURE LAW
This is a multi-role SaaS. Roles are completely isolated.

Roles:
1. superadmin
2. owner
3. manager
4. staff
5. tenant
6. parent

FOLDER LAW
Keep UI isolated by role so a future AI can debug one role without opening others.

app/
  page.tsx                          // public landing
  owner-request/page.tsx
  vacant/[slug]/page.tsx
  superadmin/
    layout.tsx
    login/page.tsx
    dashboard/page.tsx
    owner-requests/page.tsx
    create-owner/page.tsx
    owners/page.tsx
    owners/[id]/page.tsx
    plans/page.tsx
    analytics/page.tsx
    feature-flags/page.tsx
    tickets/page.tsx
    audit-logs/page.tsx
    settings/page.tsx
  owner/
    layout.tsx
    login/page.tsx
    first-login/page.tsx
    dashboard/page.tsx
    properties/page.tsx
    properties/create/page.tsx
    properties/[id]/page.tsx
    rooms/page.tsx
    rooms/[id]/page.tsx
    team/page.tsx
    team/create/page.tsx
    tenants/page.tsx
    tenants/[id]/page.tsx
    finance/page.tsx
    reports/page.tsx
    mess/page.tsx
    settings/page.tsx
    subscription/page.tsx
  manager/
    layout.tsx
    login/page.tsx
    dashboard/page.tsx
    enquiries/page.tsx
    check-in/page.tsx
    rooms/page.tsx
    tenants/page.tsx
    tenants/[id]/page.tsx
    complaints/page.tsx
    complaints/[id]/page.tsx
    mess/page.tsx
    visitors/page.tsx
    attendance/page.tsx
    broadcasts/page.tsx
    documents/page.tsx
    inventory/page.tsx
    gate-logs/page.tsx
    finance/page.tsx
  staff/
    layout.tsx
    login/page.tsx
    dashboard/page.tsx
    cook/page.tsx
    guard/page.tsx
    housekeeping/page.tsx
    maintenance/page.tsx
    tasks/page.tsx
  tenant/
    layout.tsx
    login/page.tsx
    dashboard/page.tsx
    rent/page.tsx
    mess/page.tsx
    complaints/page.tsx
    complaints/new/page.tsx
    notices/page.tsx
    documents/page.tsx
    notice-period/page.tsx
    profile/page.tsx
    sos/page.tsx
  parent/
    layout.tsx
    login/page.tsx
    dashboard/page.tsx
    safety/page.tsx
    logs/page.tsx
    finance/page.tsx
    complaints/page.tsx
    alerts/page.tsx
    profile/page.tsx
components/
  superadmin/   // ONLY superadmin UI
  owner/        // ONLY owner UI
  manager/
  staff/
  tenant/
  parent/
  public/
lib/
  storage/      // localStorage keys, read/write, seed
  api/          // future backend swap layer
  auth/         // session helpers
  types/        // shared types only
  utils/        // id, date, formatters

NO SHARED DASHBOARD
- Do not create one Dashboard component with role if/else
- Each role has its own layout, sidebar, header, cards, tables, empty states
- Duplicate UI code is REQUIRED and preferred
- Do not create a shared <AppShell role="..."> unless I explicitly ask later

AUTH LAW
- SuperAdmin creates Owner + temporary password
- Owner creates Manager/Staff + password
- Owner creates multiple PGs
- Manager does NOT create owners or PGs
- Tenant/Parent can be created by manager/system
- Each role login page is separate
- After login, redirect only to that role’s dashboard
- Protect each role layout: if session role mismatch, redirect to that role’s login
- First login for owner/manager/staff must force password change if mustChangePassword=true

DATA LAW (backend-ready)
Every record uses API-like shape:
{
  id: string,
  createdAt: ISO string,
  updatedAt: ISO string,
  createdBy: string | null,
  updatedBy: string | null,
  isDeleted: boolean
}

Ownership fields when relevant:
- ownerId
- propertyId
- tenantId
- parentId
- assignedPropertyIds

localStorage is a fake DB. Never store UI-only junk in DB tables.
Use collection keys like:
spg_users
spg_sessions
spg_owner_requests
spg_owners
spg_properties
spg_rooms
spg_beds
spg_staff
spg_tenants
spg_parents
spg_enquiries
spg_bookings
spg_stays
spg_invoices
spg_payments
spg_complaints
spg_menus
spg_meal_orders
spg_wallets
spg_wallet_txns
spg_visitors
spg_gate_logs
spg_attendance
spg_broadcasts
spg_documents
spg_inventory
spg_sos
spg_notices
spg_agreements
spg_plans
spg_subscriptions
spg_tickets
spg_audit_logs
spg_feature_flags
spg_expenses

lib/api must look like real backend:
api.auth.login({ email, password, expectedRole })
api.owners.create(...)
api.properties.listByOwner(ownerId)
Never name functions saveToLocalStorage in UI.

When we later add a backend, we should only replace lib/api implementations.

STYLE LAW (Ref: style.md)
Premium Indian SaaS with strict adherence to Global Design System.
- Font: Inter (loaded via next/font/google)
- Theming: Full Dark & Light mode support using next-themes.
- Default to Dark Mode.
- Universal CSS Variables must be used globally: var(--bg-page), var(--bg-card), var(--primary), var(--text-primary), var(--border), etc.
- DO NOT hardcode Tailwind colors (like bg-white, text-gray-500) for structural elements.
- No role-specific themes. All roles follow the universal design tokens from style.md.
- Micro-interactions: hover elevation, glassmorphism headers, subtle focus rings.
- Large radius for cards, small for buttons.
- Hindi+English labels where parents/owners benefit.
- Use meaningful dummy Indian names, INR formatting, cities like Patna/Delhi/Bengaluru.

CODING LAW
- TypeScript strict
- Small client components where needed ("use client")
- Readable names
- No any
- Seed demo data on first load if storage empty
- After every mutation, write audit log
- Use confirm modals for delete/suspend
- Toast or inline success/error alerts
- Loading and empty states
- Do not break existing working pages
- Only create files needed for the CURRENT prompt unless I ask for full module
- At the end of your response, list:
  1. files created/updated
  2. how to test
  3. demo accounts used

DEMO ACCOUNTS that seed data MUST create
SuperAdmin:
  email: leo.a@example.org
  password: Super@123

Owner:
  email: peter.m@example.com
  password: Owner@123
  mustChangePassword: false for demo convenience, but support the flag

Manager:
  email: tom.h@example.org
  password: Manager@123
  assigned to Sharma PG Patna

Staff cook:
  email: ivan.p@example.net
  password: Staff@123

Tenant:
  email: james.b@example.com
  password: Tenant@123

Parent:
  email: peter.m@example.com
  password: Parent@123

If a previous file already exists, extend it. Do not rewrite the whole app unless asked.
Wait for the next specific prompt. If this message is sent alone, only reply: "MASTER RULES LOCKED. Send the next numbered prompt."
```

---

# PROMPT 01 — Create Next.js project + design system + empty role shells

```text
PROMPT 01
Follow MASTER RULES.

Create the Next.js App Router TypeScript project structure and visual foundation only.

DO
1. Initialize/assume Next.js + Tailwind + TypeScript is ready. If config files are needed, add them.
2. Add app/layout.tsx with Plus Jakarta Sans, clean metadata: "SmartPG — Hostel Operating System"
3. Create app/globals.css with design tokens as CSS variables:
   --bg, --card, --ink, --muted, --line, --brand, --brand-2, --danger, --success, --warning
   Beautiful background: warm off-white + subtle grid/noise, not flat gray.
4. Create these EMPTY but valid route shells with a simple branded placeholder card:
   - app/page.tsx (temporary "SmartPG landing coming next")
   - app/superadmin/login/page.tsx
   - app/owner/login/page.tsx
   - app/manager/login/page.tsx
   - app/staff/login/page.tsx
   - app/tenant/login/page.tsx
   - app/parent/login/page.tsx
5. Create lib/types/index.ts with base types only:
   Role, BaseEntity, SessionUser
6. Create lib/utils/cn.ts, lib/utils/id.ts, lib/utils/format.ts
   - id: createId("own"), createId("pg"), etc
   - formatINR
   - formatDate
7. Do NOT implement auth or localStorage yet.
8. Do NOT install backend packages.

Each login placeholder should visually differ by role color so isolation is obvious.

Deliver working `npm run dev` with 6 login placeholder routes + home.
```

---

# PROMPT 02 — Backend-ready localStorage DB + API layer + seed

```text
PROMPT 02
Follow MASTER RULES. Do not build dashboards yet.

Create the fake backend.

FILES
lib/storage/keys.ts
lib/storage/db.ts
lib/storage/seed.ts
lib/api/auth.ts
lib/api/audit.ts
lib/api/index.ts
lib/types/*.ts as needed

db.ts MUST implement a mini repository:
- getAll<T>(key)
- getById<T>(key, id)
- insert<T>(key, item)
- update<T>(key, id, patch)
- remove<T>(key, id) // soft delete isDeleted=true
- query<T>(key, predicate)
- replaceAll<T>(key, items) // only for seed

IMPORTANT
- Guard window/localStorage for SSR. All storage functions must be client-safe.
- Create a client hook or ensure seed runs only in browser, e.g. lib/storage/useSeed.ts or a small client provider in app/providers.tsx
- Wrap app/layout.tsx with a client SeedProvider that seeds once.

SEED DATA (rich, realistic)
Create:
- 1 SuperAdmin
- 1 pending owner request from "Rajesh Verma, Lucknow, 2 PGs"
- 1 approved owner: Rajesh Sharma / Sharma Stays
- 2 properties:
  - Sharma PG Patna, 75 beds planned, 8 rooms seeded, occupancy mixed
  - Sharma PG Delhi, 4 rooms seeded
- Rooms and beds with statuses available/occupied/maintenance
- 1 manager Ramesh for Patna
- 1 cook, 1 guard
- 2 tenants including Rahul Singh in room 303 Bed B
- 1 parent linked to Rahul
- 1 subscription Gold plan for owner
- 2 invoices: 1 paid, 1 pending
- 1 open complaint
- 1 mess menu for today
- 1 wallet for Rahul with transactions
- 2 gate logs including one LATE
- 1 enquiry
- 2 audit logs
- plans: Basic, Gold, Platinum with feature flags and limits

USERS table is the source of login.
User fields:
id, role, name, email, phone, password, status, mustChangePassword, ownerId, propertyId, assignedPropertyIds, linkedTenantId, createdAt, updatedAt, createdBy, updatedBy, isDeleted

Do not encrypt passwords in this demo, but keep a comment: replace with hashed auth later.

api.auth.login
- find user by email+password+not deleted+active
- if expectedRole provided, must match
- create session in spg_sessions and also spg_current_session
- return session user without password

api.auth.logout
api.auth.currentUser
api.auth.changePassword

api.audit.write({ actorId, actorRole, action, entity, entityId, meta })

Export a clean api object.

After this prompt, no fancy UI except maybe a tiny hidden /dev/seed-status is optional. Prefer no extra pages.

Test by temporarily console logging seed counts in SeedProvider in development only.
```

---

# PROMPT 03 — Public website: landing + owner request + vacant beds

```text
PROMPT 03
Follow MASTER RULES. Build PUBLIC frontend only. Do not touch role dashboards.

Create components/public/* and these pages:
- app/page.tsx  (full landing)
- app/owner-request/page.tsx
- app/vacant/[slug]/page.tsx
- app/login/page.tsx  (chooser only, links to 6 role logins)

LANDING
World-class PG SaaS marketing page.
Sections:
- Navbar: logo SmartPG, Features, For Owners, Vacant Beds, Owner Request, Login
- Hero: Hindi-English mix headline
  "PG ko digital banao. Rent, mess, safety, parents — ek system."
  CTA: Owner Request, View Vacant Beds
- Problem vs SmartPG comparison
- 6 role cards
- USP grid: parent portal, pay-per-day mess, SOS, vacant bed link, eSign, AI matching
- How it works: Request -> SuperAdmin creates owner -> Owner adds PGs/staff -> Go live
- Dummy stats
- Footer

OWNER REQUEST PAGE
Beautiful form:
name, businessName, email, phone, city, pgCount, bedCount, gst optional, message
On submit:
- api.ownerRequests.create status=pending
- audit log
- success screen: "Request bhej di gayi. SuperAdmin review karega."

VACANT BEDS
Use seeded Sharma PG Patna.
Page shows property story, hygiene 4.9, available beds with rent, amenities, photos placeholders, Book/Enquire button that creates an enquiry via api.enquiries.create and thank-you state.

LOGIN CHOOSER
6 large role tiles, each goes to that role’s login route. Different colors.

Create lib/api/ownerRequests.ts and lib/api/enquiries.ts if missing.
Keep public components inside components/public only.
```

---

# PROMPT 04 — Auth session helpers + reusable but NOT shared dashboard primitives?  
Wait: user said no shared dashboard. Small inputs can be duplicated. I'll allow tiny form bits duplicated per role.

```text
PROMPT 04
Follow MASTER RULES.

Create auth helpers only, no dashboards.

FILES
lib/auth/session.ts
lib/auth/guards.ts

Need client-side helpers:
- getSession()
- requireRole(role)
- clearSession()

Create a client component pattern that each role will copy later:
Do NOT create a shared AuthGuard used by all roles if that violates isolation.
Instead create 6 tiny guards:
components/superadmin/RequireSuperAdmin.tsx
components/owner/RequireOwner.tsx
components/manager/RequireManager.tsx
components/staff/RequireStaff.tsx
components/tenant/RequireTenant.tsx
components/parent/RequireParent.tsx

Each guard:
- "use client"
- on mount read session
- if no session or wrong role, router.replace to that role login
- if mustChangePassword and path is not first-login, redirect owner/manager/staff to their first-login page
- show a premium branded loading splash while checking

Also implement real login pages now for all 6 roles. Duplicate the login UI in each folder, change colors/copy.

Login page behavior:
- email + password
- validate via api.auth.login({ email, password, expectedRole })
- error: galat details / role mismatch
- success redirect:
  superadmin -> /superadmin/dashboard
  owner -> /owner/dashboard or /owner/first-login
  manager -> /manager/dashboard or /manager/first-login if you create it
  staff -> /staff/dashboard
  tenant -> /tenant/dashboard
  parent -> /parent/dashboard

Add demo credential hint on each login card for this prototype.

Create first-login pages:
app/owner/first-login/page.tsx
app/manager/first-login/page.tsx
app/staff/first-login/page.tsx
Change password + set mustChangePassword false + redirect dashboard.

Do not build dashboards yet. After login, dashboard routes can still be placeholders, but create them as simple “Welcome, {name}” role-colored pages so redirect works.

Update each role layout.tsx to wrap children with that role’s RequireX and that role’s own sidebar later. For now layout can be minimal with a top bar + logout.
```

---

# PROMPT 05 — SuperAdmin chrome: own layout, sidebar, dashboard

```text
PROMPT 05
Follow MASTER RULES.
Work ONLY in:
app/superadmin/**
components/superadmin/**
You may import lib/* 

Build SuperAdmin’s OWN shell. Do not reuse owner/manager layout.

app/superadmin/layout.tsx
- left sidebar unique to SuperAdmin
- gold/navy theme
- logo mark “SPG Platform”
- nav:
  Dashboard
  Owner Requests
  Create Owner
  Owners
  Plans
  Analytics
  Feature Flags
  Tickets
  Audit Logs
  Settings
- header: current admin name, logout
- mobile drawer

app/superadmin/dashboard/page.tsx
High-end platform dashboard, not a PG operations dashboard.
Cards:
- Total owners
- Pending requests
- Active properties
- Total tenants
- MRR dummy from subscriptions
- Occupancy network average
- Open tickets
- Expiring plans

Lists:
- Latest owner requests
- Recent audit logs
- Owners by plan

Charts can be CSS bars, no heavy chart library unless already installed.

All numbers from api/storage seeded data, not hardcoded fake constants.

Create lib/api/platform.ts if needed to aggregate stats.
Do not build other SuperAdmin pages yet, but sidebar links can go to existing placeholder routes. Create simple placeholders for missing pages so no 404.
```

---

# PROMPT 06 — SuperAdmin Owner Requests + Create Owner (CORE FLOW)

```text
PROMPT 06
Follow MASTER RULES.
Work ONLY in SuperAdmin folders + lib/api needed.

This is the most important business flow.

1) app/superadmin/owner-requests/page.tsx
Table of owner requests:
name, business, city, email, phone, pgCount, beds, createdAt, status badge
Filters: All / Pending / Approved / Rejected / Hold
Search
Row click or View drawer

Actions on pending:
- Approve & Create Owner (goes to create-owner with query ?requestId=)
- Hold
- Reject with reason modal

2) app/superadmin/create-owner/page.tsx
If requestId present, prefill from request.

Form sections:
Personal: name, email, phone, city, address
Business: businessName, gst, pan, expectedPgs, expectedBeds
Access:
  loginEmail (default same as email)
  temporaryPassword (required, SuperAdmin types it)
  mustChangePassword default true
  status Active
Plan:
  planId select Basic/Gold/Platinum
  billingCycle monthly/yearly
  maxProperties, maxBeds, maxStaff prefilled from plan but editable
Feature flags checkboxes from plan, editable

Submit:
- validate unique email
- create users record role=owner password=temporaryPassword
- create owners profile
- create subscription
- if requestId, mark request approved
- write audit log: OWNER_CREATED
- success screen showing credentials summary and button “View Owner”

Also create lib/api/owners.ts, update types.

IMPORTANT UX
This page should feel like an internal ops tool. Clear, serious, not playful.
Show helper text:
"Owner self-signup nahi karta. Aap account banaake email+password doge."
```

---

# PROMPT 07 — SuperAdmin Owners directory + owner detail

```text
PROMPT 07
Follow MASTER RULES. SuperAdmin folders only + apis.

app/superadmin/owners/page.tsx
Directory with search/filter by plan/status/city
Columns: name, business, email, plan, properties count, beds, occupancy, collection this month, status, lastLogin
Actions: view

app/superadmin/owners/[id]/page.tsx
Owner 360 page:
- profile header
- contact
- plan + expiry + usage 2/5 properties
- list of that owner’s properties with occupancy
- managers count / tenants count
- recent payments
- tickets
Buttons:
- Reset password modal (SuperAdmin sets new temp password, mustChangePassword true)
- Suspend / Activate owner
- Change plan
- Toggle feature flags
- Add internal note

CRITICAL
SuperAdmin does NOT create properties here.
Show a note: “PGs owner khud create karega.”

All actions write audit logs.
Use only this owner’s data via ownerId filter.
```

---

# PROMPT 08 — SuperAdmin remaining platform pages

```text
PROMPT 08
Follow MASTER RULES. SuperAdmin only.

Build complete pages:

1) plans
CRUD-lite for Basic/Gold/Platinum
fields: name, price, maxProperties, maxBeds, maxStaff, features[]
Cannot break seeded plans; allow edit.

2) analytics
More detailed platform analytics using real seeded aggregates + computed values.
Property-wise network table.

3) feature-flags
Global flags and per-owner overrides.
Simple table owner vs features matrix.

4) tickets
List + create-on-behalf + status change.
Seed 1-2 tickets from owner.

5) audit-logs
Filter by actorRole, action, date.
Pretty timeline/table.

6) settings
Platform settings stored in spg_settings:
otp enabled, defaultNightEntryTime, defaultNoticeDays, supportPhone, maintenanceMode, whatsappEnabled
Save/load via api.settings

Keep UI in components/superadmin/*.
```

---

# PROMPT 09 — Owner chrome + dashboard (separate universe)

```text
PROMPT 09
Follow MASTER RULES.
Work ONLY in app/owner/** and components/owner/** plus lib/api if needed.

Build Owner shell completely separate from SuperAdmin.
Theme: deep teal, warm paper, sand cards.

Sidebar nav:
Dashboard
Properties
Rooms
Team
Tenants
Finance
Mess
Reports
Settings
Subscription

Property switcher in header:
- All Properties
- Sharma PG Patna
- Sharma PG Delhi
Store selectedPropertyId in session or spg_owner_ui_state
All owner pages must read this filter.

Dashboard cards:
- Total PGs
- Beds / occupied / vacant
- Occupancy %
- This month collection
- Pending rent
- Open complaints
- Staff present dummy
- Mess wallet revenue if data exists

Charts: occupancy by property, collection vs pending
Tables: defaulters, vacant beds, latest enquiries

Logout + user name.
If owner has 0 properties, show onboarding empty state CTA “Create your first PG”.
```

---

# PROMPT 10 — Owner creates multiple PGs

```text
PROMPT 10
Follow MASTER RULES. Owner folders only.

CORE FLOW 2: Owner creates multiple PGs.

app/owner/properties/page.tsx
Grid of property cards with photo gradient, city, beds, occupancy, revenue, hygiene, manager name.
Button Add Property.

app/owner/properties/create/page.tsx
Multi-section form:
name, slug auto, type boys/girls/coed, address, city, pincode, landmark, description
contactName, contactPhone
floorsCount
amenities checkboxes
nightEntryTime default 23:00
noticePeriodDays default 30
messEnabled
visitorCutoff
defaultDeposit
rentCycleDate
photos as URL list or placeholder uploads stored as strings

On save:
- check subscription maxProperties
- create property ownerId=session.ownerId
- optionally generate empty floors
- audit PROPERTY_CREATED
- redirect to property detail

app/owner/properties/[id]/page.tsx
Property detail:
stats, rooms preview, assigned staff, settings edit, danger zone archive.

Owner can create many PGs. SuperAdmin cannot do this from this UI.
```

---

# PROMPT 11 — Owner rooms + beds

```text
PROMPT 11
Follow MASTER RULES. Owner folders only.

app/owner/rooms/page.tsx
Respect property switcher.
Kanban or filterable table of rooms.
Add Room modal/page.

Room fields:
propertyId, floor, number, sharing, rentPerBed, deposit, amenities, status, photos
On create, also create N beds: A,B,C... with codes like 303-A

app/owner/rooms/[id]/page.tsx
Room profile + bed list + current tenants + mark maintenance.

Bed statuses: available, occupied, reserved, maintenance, blocked
Prevent delete if occupied.

Use api.rooms and api.beds.
Duplicate UI is fine. Do not import SuperAdmin components.
```

---

# PROMPT 12 — Owner creates Manager + Staff + passwords

```text
PROMPT 12
Follow MASTER RULES. Owner folders only.
CORE FLOW 3.

app/owner/team/page.tsx
Team directory filter by role/property/status
Cards for managers and staff.

app/owner/team/create/page.tsx
Form:
name, role: manager | cook | guard | cleaner | maintenance | accountant
assignedPropertyIds multi-select from owner properties
phone, email, temporaryPassword (Owner types it)
salary, joinDate, shift
status active
mustChangePassword true

On submit:
- create users record with role manager or staff
- if staff, add staffType
- create staff profile
- audit STAFF_CREATED
- success screen shows login URL + email + password
  manager login is /manager/login
  staff login is /staff/login

Permissions checkboxes for manager:
canEditRent, canAddExpense, canOnboardTenant, canBroadcast, canCollectCash
Store on staff/manager profile.

Cannot create owners.
Cannot create users for other owners.
```

---

# PROMPT 13 — Owner tenants, finance, reports, mess, settings, subscription

```text
PROMPT 13
Follow MASTER RULES. Owner folders only. Complete remaining owner pages with real data bindings.

TENANTS
list + profile page
filters: property, dues, notice, active
profile shows room, rent, wallet, invoices, complaints, parent, pgScore
owner can mark notice or checkout at a high level

FINANCE
invoices table, payments, pending, expenses
record manual cash payment
create expense
property-wise totals
INR formatting

REPORTS
occupancy, collection efficiency, complaint count, mess summary
export button can download JSON/CSV from client

MESS
owner analytics only: revenue, orders, waste placeholder, popular items
do not build cook workflow here

SETTINGS
per selected property: lateFine, dueDate, nightEntryTime, noticeDays, complaint categories

SUBSCRIPTION
show plan from SuperAdmin, usage meters, request upgrade ticket to SuperAdmin

Everything filtered by ownerId.
```

---

# PROMPT 14 — Manager shell + dashboard

```text
PROMPT 14
Follow MASTER RULES.
ONLY app/manager/** and components/manager/**

Manager is an operations product, not a SaaS admin.

Theme: slate + electric blue, dense but clear.
Sidebar:
Dashboard, Enquiries, Check-in, Rooms, Tenants, Complaints, Mess, Visitors, Attendance, Gate Logs, Broadcasts, Documents, Inventory, Cash Collection

Guard:
- session.role === manager
- only assignedPropertyIds
- if multiple assigned, property switcher limited to those

Dashboard widgets from assigned PG only:
active tenants, vacant beds, today checkins, open complaints, pending visitors, overdue rent, late entries, low inventory if any
Quick actions buttons.

If manager has no assigned property, show locked empty state.
```

---

# PROMPT 15 — Manager enquiries + check-in wizard

```text
PROMPT 15
Follow MASTER RULES. Manager only.
This is the tenant onboarding engine.

ENQUIRIES
CRUD list pipeline columns or tabs:
new, contacted, visited, interested, booked, lost, converted
Add enquiry form
Convert to Check-in button passes enquiryId

CHECK-IN WIZARD  /manager/check-in
Steps:
1. Personal: name, email, phone, gender, college, dob
2. Documents: store file names/URLs in documents collection
3. Parent details: name, phone, email -> create parent user + parent profile + link
4. Room/bed selection: only vacant beds in assigned property
5. Roommate questions + show compatibility score against occupying roommate if any (simple weighted score)
6. Deposit: normal or zero_deposit + loanPartner note
7. Agreement review + I Agree checkbox -> create agreement acceptedAt
8. Create tenant user password default Tenant@123 or owner/manager set
9. Activate mess wallet 0
10. Success

Write stays, occupy bed, audit TENANT_CHECKED_IN
Do not allow beds from unassigned properties.
```

---

# PROMPT 16 — Manager operations pages

```text
PROMPT 16
Follow MASTER RULES. Manager only. Build all remaining manager pages with working localStorage CRUD.

Rooms board with color statuses and allocate/vacate
Tenants list/detail
Complaints inbox + detail timeline + status changes + assign staff
Mess: create today menu items + see orders + mark served
Visitors: approve/reject/check-in/out
Attendance: mark staff present/absent for today
Gate logs: list + add manual entry/exit + late flag after property.nightEntryTime + create parent alert record
Broadcasts: create message to all/floor/defaulters, store history
Documents: list tenant docs
Inventory: items, qty, low stock alert
Cash collection: list pending invoices and mark paid cash, create payment

Duplicate components inside components/manager.
Use api.* only.
```

---

# PROMPT 17 — Staff app (role-specific home, still own folder)

```text
PROMPT 17
Follow MASTER RULES.
ONLY app/staff/** and components/staff/**

Staff login already exists.
After login, dashboard should detect staffType:
cook -> highlight kitchen
guard -> gate/visitors/SOS
cleaner -> housekeeping tasks
maintenance -> assigned complaints
accountant -> simple invoice list

Still keep separate pages:
/staff/cook
/staff/guard
/staff/housekeeping
/staff/maintenance
/staff/tasks

Cook page:
today menu, live orders from meal_orders, mark prepared/served, low stock note

Guard page:
expected visitors, gate log form, SOS list if any, late entries

Housekeeping:
rooms to clean checklist stored in tasks

Maintenance:
complaints assigned to them, start/complete

Do not give staff owner finance power except accountant view.

Own sidebar, own theme (stone/orange). No shared dashboard.
```

---

# PROMPT 18 — Tenant app

```text
PROMPT 18
Follow MASTER RULES.
ONLY app/tenant/** and components/tenant/**

Mobile-first, beautiful student app on web.

Own layout bottom-nav on mobile + side nav on desktop:
Home, Rent, Mess, Complaints, SOS

Pages working with Rahul seed + any tenant session:

Dashboard:
room, bed, due amount, wallet, today menu snapshot, notices, SOS big button

Rent:
current invoice, pay mock payment modal (no real gateway)
on pay: create payment, mark invoice paid, receipt view, pgScore +10
history list

Mess:
breakfast/lunch/dinner from today’s menu
Eating/Skipping
if eating create meal_order and debit wallet
if wallet low, recharge modal adds wallet txn
ratings after order
daily summary

Complaints:
new complaint with category/priority/photo url
list + detail timeline

Notices:
broadcasts targeted to all/property

Documents:
agreement + uploaded docs read-only

Notice period:
select date + reason, create notice, notify via stored notice record

Profile:
edit phone, emergency contacts

SOS page:
red button creates sos record with timestamp, property, tenant, dummy lat/long
success: “Manager alerted”

Tenant can see only own data.
```

---

# PROMPT 19 — Parent app

```text
PROMPT 19
Follow MASTER RULES.
ONLY app/parent/** and components/parent/**

Trust-first design, large type, Hindi labels with English.

Guard: role parent, load linked tenant.

Dashboard:
child name, room, SAFE INSIDE / OUTSIDE derived from last gate log
last activity time
safety score
hygiene stars
pending rent
mess balance
buttons: logs, call manager (tel:), alerts

Safety + logs:
entry-exit timeline from gate_logs for that tenant only
late badges

Finance:
child invoices/payments read-only

Complaints:
child tickets read-only

Alerts:
late entry + SOS + due rent list

Profile:
parent phone/email

Never show other students.
Never show owner revenue.
```

---

# PROMPT 20 — Cross-role wiring demo (still no shared UI)

```text
PROMPT 20
Follow MASTER RULES.

Do not merge dashboards.
Only fix data wiring so one action in one role appears in another.

Make these flows work end-to-end with current localStorage API:

1) Public owner-request -> SuperAdmin requests -> Create Owner with password -> login as new owner -> create a 3rd PG -> create a new manager for that PG -> login as that manager.

2) Public vacant enquire -> Manager enquiries shows it.

3) Manager check-in new tenant -> bed occupied -> Owner tenants updates -> create parent -> parent can login if you set password Parent@123 or shown password.

4) Tenant raise complaint -> Manager complaints inbox.

5) Tenant mess order -> Staff cook orders + Owner mess analytics.

6) Tenant pay rent -> Owner finance collection.

7) Guard/manager late gate log -> Parent alerts.

8) Tenant SOS -> Manager dashboard emergency + Staff guard.

9) Tenant notice period -> Owner tenant status Notice.

Add missing api methods rather than writing localStorage in pages.
Add extra seed only if a flow has no demo data.
After changes, write a CHECKLIST.md in project root describing every demo click-path and accounts.
```

---

# PROMPT 21 — UX polish, empty states, validation, responsiveness

```text
PROMPT 21
Follow MASTER RULES.

Polish the whole frontend without changing architecture.

For EVERY role folder independently:
- empty states with illustration-like CSS and CTA
- form validation errors under fields
- disable double submit
- confirm dialogs for destructive actions
- toasts
- sticky table headers
- better mobile nav
- page titles + breadcrumbs inside that role
- 404 within role
- print-friendly invoice on tenant/owner finance
- consistent INR, dates Asia/Kolkata display
- accessibility: labels, focus states, contrast

Do not create a shared component library unless a tiny lib/ui is absolutely necessary for inputs. Prefer duplicated role-styled buttons.

Fix any TypeScript errors.
```

---

# PROMPT 22 — Data contract freeze (backend migration readiness)

```text
PROMPT 22
Follow MASTER RULES.

Create lib/api/README.md and lib/types/contract.ts documenting every collection and function.

Refactor if any component still touches localStorage directly. That is a bug. Move it into lib/api.

Add lib/api/http.ts as a future switch:
const MODE = "local" // later "http"
If MODE is local, current adapters.
If http, fetch(`${API_URL}/...`) with same function signatures.

Do not implement real HTTP yet. Just the switch skeleton.

Ensure IDs, ISO dates, ownerId/propertyId are present everywhere.

Add export/import JSON backup buttons only on SuperAdmin settings:
- download all collections
- upload to replace DB
Useful for demos and later backend mapping.
```

---

# Optional extra prompts (jab basic chal jaye)

## PROMPT 23 — Dynamic pricing + PG score UI
```text
PROMPT 23
Owner can set seasonal price rules per property. Tenant profile shows pgScore. On-time payment increases score. Defaulters decrease. Owner can give discount if score > 90. LocalStorage only. Isolated owner/tenant folders.
```

## PROMPT 24 — Digital agreement PDF-ish view
```text
PROMPT 24
Manager check-in agreement step and tenant documents page should render a legal-style agreement preview using the stay data. Store accepted boolean + timestamp. No real eSign vendor.
```

## PROMPT 25 — Hindi language toggle per role
```text
PROMPT 25
Each role layout has EN | हिं toggle stored in that role’s ui state key, e.g. spg_ui_tenant_lang. Duplicate dictionary objects inside each role folder. Do not make one global i18n god-file if it reduces folder isolation. Parent and Owner must have good Hindi.
```

## PROMPT 26 — Beautiful print receipts + invoice templates
```text
PROMPT 26
Create role-specific invoice templates:
components/owner/InvoicePrint.tsx
components/tenant/InvoicePrint.tsx
Duplicate is OK. Use window.print().
```

---

# File / style / storage rules (AI ko har prompt me already ghusa do, yeh tumhare liye)

## Folder isolation map

```text
components/superadmin     <-> app/superadmin
components/owner          <-> app/owner
components/manager        <-> app/manager
components/staff          <-> app/staff
components/tenant         <-> app/tenant
components/parent         <-> app/parent
components/public         <-> app/page, owner-request, vacant

SHARED ALLOWED (sirf yeh)
lib/types
lib/storage
lib/api
lib/utils
app/globals.css
app/layout.tsx
app/providers.tsx
```

Agar SuperAdmin tootey:

```text
Fix only SuperAdmin UI.
You may read lib/api and lib/types.
Do not modify app/owner, app/manager, app/tenant, app/parent, app/staff unless I paste them.
```

## localStorage contract (backend jaisa)

Har collection array of objects.

Example user:

```ts
{
  id: "usr_...",
  role: "owner",
  name: "Rajesh Sharma",
  email: "peter.m@example.com",
  phone: "9876543210",
  password: "Owner@123",
  status: "active",
  mustChangePassword: false,
  ownerId: "own_...",      // for owner user, same as profile id or users.id link
  propertyId: null,
  assignedPropertyIds: [],
  linkedTenantId: null,
  createdAt: "2026-01-15T10:00:00.000Z",
  updatedAt: "2026-01-15T10:00:00.000Z",
  createdBy: "usr_super",
  updatedBy: "usr_super",
  isDeleted: false
}
```

Example property:

```ts
{
  id: "pg_...",
  ownerId: "own_...",
  name: "Sharma PG Patna",
  slug: "sharma-pg-patna",
  city: "Patna",
  address: "...",
  type: "coed",
  nightEntryTime: "23:00",
  noticePeriodDays: 30,
  messEnabled: true,
  hygieneScore: 4.9,
  status: "active",
  createdAt: "...",
  updatedAt: "...",
  createdBy: "usr_owner",
  updatedBy: "usr_owner",
  isDeleted: false
}
```

`lib/api/owners.ts` aisa dikhe jaise REST:

```ts
export const ownersApi = {
  list() {},
  get(id: string) {},
  create(input) {},
  update(id, patch) {},
  suspend(id) {},
  resetPassword(id, tempPassword) {},
};
```

Baad me backend:

```ts
create(input) {
  return http.post("/owners", input);
}
```

UI file change nahi hogi. Yahi asal trick hai.

## Coding style for prompts
Har prompt me already hai, short reminder:

- TypeScript, no `any`
- "use client" only where needed
- duplicate role UI
- INR + Indian dummy data
- audit log on mutations
- filter by ownerId/propertyId always

---

# Suggested build order (tum kya kab karoge)

| Step | Prompt | Result |
|---|---|---|
| 1 | 00 + 01 | project + empty routes |
| 2 | 02 | fake DB + seed accounts |
| 3 | 03 | landing + owner request |
| 4 | 04 | 6 logins kaam karein |
| 5 | 05-08 | SuperAdmin complete |
| 6 | 09-13 | Owner complete |
| 7 | 14-16 | Manager complete |
| 8 | 17 | Staff |
| 9 | 18 | Tenant |
| 10 | 19 | Parent |
| 11 | 20 | poora loop connected |
| 12 | 21-22 | polish + backend-ready |

Pehle 04 ke baad tum yeh test karo:

- `/superadmin/login` → Super@123
- `/owner/login` → Owner@123
- `/manager/login` → Manager@123
- `/tenant/login` → Tenant@123
- `/parent/login` → Parent@123

Agar yeh 5 login alag dashboards pe jaate hain, architecture sahi hai.

---

# Error-fix mini prompts (folder deke use karna)

## SuperAdmin error
```text
Follow MASTER RULES.
Bug: <paste error>
You may edit only app/superadmin, components/superadmin, and lib/api if the contract is wrong.
Do not touch other roles.
```

## Owner error
```text
Follow MASTER RULES.
Bug: <paste error>
Edit only app/owner, components/owner, and lib/api if required.
Do not touch superadmin/manager/tenant.
```

## Data not showing across roles
```text
Follow MASTER RULES.
Flow broken: <describe>
Fix in lib/api and the two role folders involved only.
Check ownerId/propertyId filters and seed IDs.
Do not create a shared dashboard.
```

---

# Extra instruction jo almost har prompt me kaam aata hai

Isko chaaho to Prompt 00 ke baad chhota sticky note bana ke rakhna:

```text
NEVER:
- one reusable dashboard
- localStorage inside JSX pages
- mix role routes
- allow manager to create owners
- allow owner to self-register
- show other owner’s data
- install backend/db packages
- generic purple SaaS template

ALWAYS:
- isolate folders
- api.* functions
- audit logs
- Indian demo data
- empty/loading/error states
- list files changed + test steps at the end
```

---

# Practical tip

Prompt 02 sabse critical hai. Agar seed + api kharab hua to saari dashboards jhooth dikhengi.  
Prompt 06, 10, 12, 15 business ke pillar hain. Inko skip mat karna.

Jab Prompt 01 ke liye AI se project banana ho, pehle tum khud yeh chala lo:

```bash
npx create-next-app@latest smart-pg --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
cd smart-pg
npm i lucide-react
```

Phir Cursor/ChatGPT me Prompt 00 + Prompt 01.

---

Agar next message me bolo **“Prompt 01 ka output structure bhi de do files ke andar kya-kya code hona chahiye”**, to main pehle foundation ka **file-by-file skeleton** likh dunga taaki tum AI ke bina bhi folders bana sako.