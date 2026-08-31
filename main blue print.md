# Smart PG Management System — Poora Blueprint (Start → End)

Yeh document **build-ready system design** hai. Isme hierarchy, har role, har feature, creation flow, access, aur kaam kaise chalta hai — sab clearly likha hai. Extra focus: **SuperAdmin owner create karega**, **Owner multiple PG + Manager/Staff create karega**.

---

## 0) System ka simple matlab

**Smart PG Management System** ek **SaaS platform** hai.

- Aap (SuperAdmin) platform ke malik ho.
- Aap **PG Owners** onboard karte ho.
- Har Owner apne **multiple PGs** chalata hai.
- Har PG ke liye Owner **Manager + Staff** banata hai.
- Tenant (student) PG me rehta hai.
- Parent safety + finance dekh sakta hai.

Socho:

```text
PLATFORM (Aap)
   └── Owner 1 (Sharma)
   │      ├── PG A (Patna)
   │      │     ├── Manager
   │      │     ├── Staff
   │      │     ├── Tenants
   │      │     └── Parents
   │      └── PG B (Delhi)
   └── Owner 2 (Verma)
          └── PG C (Bangalore)
```

Ek line me: **OYO/Zolo jaisa PG operating system**, lekin aapka control SuperAdmin ke haath me.

---

## 1) Sabse important rule: kaun kisko create karega

Yeh aapka special requirement hai. Isko system ka **core law** banao.

| Kaun | Kisko create karega | Login kaise milega |
|---|---|---|
| SuperAdmin | PG Owner | SuperAdmin email + password khud set karega |
| Owner | Property/PG | PG Owner ke andar create hoga |
| Owner | Manager + Staff | Owner unka ID/password create karega |
| Manager (Owner permission se) | Tenant | Tenant signup / manager onboarding |
| System / Manager | Parent account | Tenant ke parent details se |

**Owner self-signup nahi karega.**  
Woh SuperAdmin ko request bhejega. SuperAdmin approve karke account banayega.

**Manager/Staff self-signup nahi karenge.**  
Unka account Owner banayega.

**Tenant** enquiry/booking ke baad onboard hoga.  
**Parent** tenant se link hoga, alag login milega.

---

## 2) Poori user hierarchy

### Role 1 — SuperAdmin (Platform Owner = aap)
Platform ka boss. Multiple owners, plans, revenue, system health.

### Role 2 — PG Owner (Business Malik)
Apne business ka boss. Multiple PGs, finance, managers, reports.

### Role 3 — Manager (Warden / Operations Head)
Ek PG (ya assigned PGs) ka daily operator.

### Role 4 — Staff
Cook, Guard, Cleaner, Plumber, Electrician. Limited access.

### Role 5 — Tenant (Student)
Apna room, rent, mess, complaint, SOS.

### Role 6 — Parent
Apne child ki safety, attendance, rent status.

> Note: Original doc me 5 roles the. Practical system me **Staff alag role** hona chahiye, warna cook/guard ko manager jaisi power mil jayegi. Isliye yahan 6 roles rakho.

---

## 3) Start-to-end business flow (asli duniya jaisa)

### Step A — Owner aata hai
Koi PG malik kehta hai:  
“Sir, mujhe aapka system use karna hai.”

Woh **Owner Request Form** bharta hai:

- Full name
- Business/PG brand name
- Email
- Phone
- City / state
- Kitne PGs hain
- Total beds
- GST (optional)
- Message: “Mujhe system chahiye”

Status: `PENDING`

### Step B — SuperAdmin review karta hai
SuperAdmin panel me request dikhti hai.

SuperAdmin check karta hai:

- Serious client hai ya nahi
- Plan decide karta hai: Basic / Gold / Platinum
- Commission / monthly fee set karta hai
- Features enable/disable karta hai

Phir SuperAdmin **Create Owner** karta hai.

### Step C — SuperAdmin owner account banata hai
Form me SuperAdmin ye details leta/confirm karta hai:

- Owner name
- Email
- Phone
- Business name
- Address
- GST
- Subscription plan
- Max properties allowed
- Max beds allowed
- Trial days / billing cycle
- **Password SuperAdmin khud set karega**
- Status: Active

System kya kare:

1. Owner user create
2. Owner profile create
3. Empty business dashboard create
4. Welcome email/SMS:
   - Login URL
   - Email
   - Temporary password
   - “Pehli baar login ke baad password change karo”

### Step D — Owner login
Owner login karta hai:

- Email = SuperAdmin ne diya
- Password = SuperAdmin ne create kiya

Pehli login pe force karo:

- Password change
- Profile complete
- Terms accept

Ab Owner dashboard khulta hai.

### Step E — Owner apne PGs create karta hai
Owner 1 se zyada PG bana sakta hai:

Example:

- Sharma PG Patna
- Sharma PG Delhi
- Sharma Plus Bangalore

Har PG me:

- Name
- Address
- City
- Google map location
- Total floors
- Gender type (Boys / Girls / Co-ed)
- Contact number
- Photos
- Rules
- Amenities
- Rent range
- Mess available? Yes/No
- Check-in time / night entry time

### Step F — Owner har PG ke liye rooms/beds banata hai
Har PG ke andar:

- Floors
- Rooms
- Beds
- Rent per bed
- Amenities
- Status: Vacant / Occupied / Maintenance

### Step G — Owner Manager + Staff create karta hai
Owner har PG ke liye staff rakhta hai.

Example:

- Manager: Ramesh
- Cook: Suresh
- Guard: Mahesh
- Cleaner: Anita

Owner unka:

- Name
- Phone
- Email
- Role
- Assigned PG
- Salary
- Shift
- **User ID / Email**
- **Password**

banata hai.

Manager login karke operations chalata hai.

### Step H — Tenant aata hai
Enquiry → Visit → Booking → Check-in → Stay → Notice → Checkout

### Step I — Parent link hota hai
Check-in ke time parent account create hota hai. Parent child ko track karta hai.

### Step J — Daily system chalta hai
Attendance, mess, complaints, rent, visitors, SOS, reports.

Yahi poora product hai.

---

## 4) Multi-PG + multi-user ka dimaag kaise rakho

Yeh project tabhi sahi banega jab aap **data isolation** sahi rakho.

Har important record pe ye IDs honi chahiye:

- `platform` (implicit)
- `owner_id`
- `property_id`
- `created_by`
- `role`

### Isolation rules

1. SuperAdmin sab dekh sakta hai.
2. Owner sirf apne PGs dekh sakta hai.
3. Manager sirf assigned PG(s) dekh sakta hai.
4. Staff sirf apna limited module dekh sakta hai.
5. Tenant sirf apna data dekh sakta hai.
6. Parent sirf linked child ka limited data dekh sakta hai.

Agar ye rule toot gaya, system dangerous ho jayega. Do owners ek dusre ka data nahi dekh sakte.

---

## 5) Authentication system kaise kaam kare

### Login types

| User | Login method | Password kaun banaye |
|---|---|---|
| SuperAdmin | Email + password | System/aap |
| Owner | Email + password | SuperAdmin |
| Manager | Email/phone + password | Owner |
| Staff | Phone/email + password | Owner |
| Tenant | Email/phone + password / OTP | Self + manager verify |
| Parent | Phone/email + OTP preferred | System generate / parent set |

### Security rules

- JWT access token + refresh token
- First login pe password change (Owner/Manager/Staff)
- SuperAdmin Owner ka password reset kar sakta hai
- Owner Manager/Staff ka password reset kar sakta hai
- Role-based access control (RBAC)
- Har sensitive action ka audit log
- OTP for password reset
- Device session list
- Inactive logout

### Recommended login screens

1. Common login page
2. User email/phone + password dalta hai
3. Backend role detect karta hai
4. Us role ka dashboard open hota hai

Alag-alag login URLs bhi rakh sakte ho:

- `/superadmin/login`
- `/owner/login`
- `/manager/login`
- `/tenant/login`
- `/parent/login`

Beginner ke liye **ek login + role redirect** simple hai.

---

# ROLE 1 — SUPERADMIN (SABSE DEEP)

SuperAdmin platform chalata hai. Woh kisi ek PG ka warden nahi hai. Woh **software company ka admin** hai.

## SuperAdmin kya sochta hai

- Kitne owners hain?
- Kaun active hai, kaun pending hai?
- Kis plan se kitna paise aa raha hai?
- Kaunsa owner zyada properties use kar raha hai?
- Kisi owner ka subscription expire to nahi ho raha?
- System crash / complaints / abuse to nahi ho raha?

## SuperAdmin ke main modules

### 1) Owner Request Inbox
Jab koi PG malik form bharta hai:

```text
Namaste Sir,
Mera naam Rajesh Sharma hai.
Patna me 2 PG hain, 175 beds.
Mujhe aapka Smart PG system use karna hai.
```

SuperAdmin dekhata hai:

- Applicant name
- Phone / email
- City
- Number of PGs
- Beds
- Message
- Date
- Status: Pending / Approved / Rejected / On Hold

Actions:

- View
- Call / Notes add
- Approve & Create Owner
- Reject with reason
- Hold for later

### 2) Create Owner (sabse important screen)

SuperAdmin form:

**Personal**
- Full name
- Email
- Phone
- Alternate phone
- City
- Address

**Business**
- Business name
- GST number
- PAN
- Number of existing PGs
- Expected beds

**Access**
- Login email
- Temporary password
- Force password change = ON
- Status = Active / Suspended

**Plan**
- Plan: Basic / Gold / Platinum
- Monthly/Yearly
- Max properties
- Max beds
- Max staff
- Max managers
- Commission % (agar marketplace ho)
- Feature flags:
  - Mess module
  - IoT billing
  - Parent portal
  - SOS
  - WhatsApp
  - Zero-deposit
  - AI matching
  - Chatbot

Button: **Create Owner Account**

System result:

- Owner login ready
- Welcome mail
- Owner dashboard empty, lekin accessible
- SuperAdmin ko success message: “Owner created. Credentials sent.”

### 3) All Owners Directory
List:

- Owner name
- Business
- Email
- Phone
- Plan
- Properties count
- Total beds
- Occupancy
- Monthly collection
- Subscription status
- Last login

Filters:

- Active / Expired / Suspended
- City
- Plan
- High revenue / low usage

Actions:

- View owner
- Impersonate / “Login as Owner” (optional, careful, audit log ke saath)
- Reset password
- Suspend
- Upgrade/downgrade plan
- Add note

### 4) Owner Detail Page
SuperAdmin ek owner pe click kare to:

- Profile
- All PGs of that owner
- Managers count
- Tenants count
- Revenue summary
- Pending dues
- Complaints volume
- Subscription invoices
- Activity logs
- Support tickets

Yahan SuperAdmin **PG create nahi karega** (aapka rule).  
PG create Owner khud karega.

SuperAdmin sirf owner ko access dega.

### 5) Subscription & Billing
Plans example:

**Basic**
- 1 PG
- 50 beds
- Rent + tenant + complaint
- No IoT, no AI, no SOS advanced

**Gold**
- 5 PGs
- 300 beds
- Mess + parent portal + broadcasts

**Platinum**
- Unlimited PGs
- IoT, SOS, chatbot, analytics, zero-deposit

SuperAdmin:

- Plan create/edit
- Feature matrix
- Coupons
- Manual activate
- Expiry reminders
- Payment history
- Invoice generate

Agar owner ka plan expire:
- Owner login ho sakta hai
- Lekin create/edit band
- Banner: “Plan renew karo”
- SuperAdmin manually extend bhi kar sakta hai

### 6) Platform Analytics
Cards:

- Total owners
- Active PGs
- Total tenants
- GMV / rent collected through platform
- Pending rent across network
- Occupancy average
- New signups this month
- Churned owners
- Support tickets open

Charts:

- Monthly recurring revenue
- Owners by city
- Feature usage
- Mess revenue
- Complaint resolution time

### 7) Feature Control
SuperAdmin kisi ek owner ke liye feature on/off kar sakta hai.

Example:
- Sharma Owner ke liye IoT ON
- Verma Owner ke liye Zero-Deposit OFF

Yeh important hai kyunki har client alag plan leta hai.

### 8) System Settings
- OTP provider
- SMS/WhatsApp templates
- Payment gateway keys
- Email templates
- App versions
- Maintenance mode
- Terms & privacy
- Default night entry time
- Default notice period

### 9) Support / Tickets
Owners SuperAdmin ko ticket bhej sakte hain:

- Payment issue
- Login issue
- Feature request
- Bug

SuperAdmin:

- Open
- In progress
- Resolved

### 10) Audit Logs
Har critical action:

- Owner created
- Password reset
- Plan changed
- Owner suspended
- Feature disabled

Kab, kisne, kya change kiya — yeh log zaroori hai.

## SuperAdmin kya NAHI karega

Daily PG operations SuperAdmin nahi karega:

- Room allot nahi
- Attendance nahi
- Mess menu nahi
- Tenant complaint resolve nahi
- Staff salary daily mark nahi

Woh platform manage karega, PG nahi.

## SuperAdmin ke pages (build list)

1. SuperAdmin Login
2. Dashboard
3. Owner Requests
4. Create Owner
5. Owners List
6. Owner Detail
7. Subscription Plans
8. Platform Finance
9. Feature Flags
10. Support Tickets
11. Audit Logs
12. Settings
13. Broadcast to Owners (optional)

## SuperAdmin permissions

Allowed:
- Create / suspend / delete owner
- Reset owner password
- Change plan
- View all data (read-level)
- Enable/disable modules
- See platform revenue

Not allowed (recommended):
- Tenant ka personal locker casually edit
- Owner ke bina uske manager ko daily operate karna
- Production data silently delete without confirm

---

# ROLE 2 — PG OWNER (BUSINESS MALIK)

Owner SuperAdmin se account paake login karta hai.

Uske dimaag me sirf yeh hota hai:

- Mere kitne PG hain?
- Kitna rent aaya?
- Kitna pending hai?
- Kaun sa PG fill hai?
- Manager kaam kar raha hai ya nahi?
- Profit kitna hai?

## Owner first-time setup wizard

Pehli baar login ke baad:

1. Password change
2. Business profile complete
3. First PG create
4. First rooms add
5. First manager create
6. Payment/bank details add
7. Mess on/off choose

Isse owner confuse nahi hoga.

## Owner ke modules

### A) Owner Dashboard
Top cards:

- Total PGs
- Total beds
- Occupied beds
- Vacant beds
- Occupancy %
- This month collection
- Pending rent
- Open complaints
- Staff present today
- Mess profit this month

Property switcher:

```text
[ All Properties ▼ ]
   Sharma PG Patna
   Sharma PG Delhi
```

Agar “All” select ho, combined numbers.
Agar ek PG select ho, usi PG ka data.

### B) Create / Manage Multiple PGs
Yeh aapka second core rule hai.

Owner **Add Property** pe click kare:

Form:

- PG name
- Type: Boys / Girls / Co-ed / Hostel
- Address
- City
- Pincode
- Landmark
- Map location
- Total floors
- Contact person
- Contact phone
- Description
- Photos
- House rules
- Amenities: WiFi, AC, Power backup, RO, CCTV, Laundry, Gym
- Night entry limit: 11:00 PM
- Notice period: 30/60 days
- Mess available
- Visitor allowed till
- Security deposit default
- Rent cycle date (1st / 5th / 10th)

After save:

PG create ho jata hai, lekin abhi empty hota hai.

Owner us PG ke andar:

- Floors add kare
- Rooms add kare
- Beds add kare
- Manager assign kare

### C) Room & Bed Management
Owner ya Manager rooms bana sakte hain. Permission Owner set karega.

Room form:

- Room number
- Floor
- Sharing type: 1/2/3/4
- Rent per bed
- Security deposit
- Amenities
- Photos
- Status

Bed form:

- Bed code: 303-A, 303-B
- Rent override (agar alag ho)
- Occupied by
- IoT meter ID

Statuses:

- Available
- Occupied
- Reserved
- Maintenance
- Blocked

### D) Manager & Staff Management (Owner create karega)

Yeh third core rule hai.

Owner jaata hai: **Staff & Access**

Button: **Add Team Member**

Form:

- Full name
- Role: Manager / Cook / Guard / Cleaner / Accountant / Maintenance
- Assigned PG(s)
- Phone
- Email / username
- **Password Owner set karega**
- Salary
- Join date
- Shift: Morning / Night
- ID proof
- Address
- Emergency contact
- Permissions template
- Status: Active

System:

- User account create
- Role attach
- Property assign
- Credentials Owner ko dikhao
- Optional SMS: “Aapka Manager login ready hai”

#### Manager ke liye extra
Owner decide kare:

- Kya manager rent discount de sakta hai?
- Kya manager room rent edit kar sakta hai?
- Kya manager expense add kar sakta hai?
- Kya manager staff attendance mark karega?
- Ek manager 1 PG handle kare ya multiple?

Recommended default:

- 1 Manager = 1 PG
- Senior Manager = multiple PGs, agar Owner allow kare

#### Staff ke liye limited access
Cook ko sirf mess.
Guard ko sirf visitors + gate.
Cleaner ko sirf assigned tasks.
Accountant ko finance view.

### E) Tenant Management
Owner dekh sakta hai saare tenants, saare PGs me.

- Search
- Filter by PG / floor / dues / notice
- Tenant profile
- Payment history
- Complaints
- Documents
- PG score
- Notice status

Bulk actions:

- Send reminder
- Export Excel
- Filter defaulters

Daily onboarding mostly Manager karega. Owner supervise karega.

### F) Finance
Owner ka favourite module.

- Rent collected
- Pending
- Expenses
- Salaries
- Mess profit
- Electricity recovery
- Security deposits
- Refunds
- Profit & loss
- Property-wise comparison

Bank/UPI settlement:

- Razorpay/Cashfree account
- Settlement reports
- Manual cash entries (Manager add, Owner approve)

### G) Reports
- Occupancy trend
- Collection efficiency
- Complaint SLA
- Mess waste
- Staff attendance
- Lead conversion
- Monthly P&L

Export: PDF / Excel

### H) Settings per PG
- Late fine
- Due date
- Night alert time
- Mess prices
- Complaint categories
- Document checklist
- Parent alerts on/off
- WhatsApp templates

### I) Subscription page
Owner SuperAdmin ke plan ko dekh sakta hai:

- Current plan
- Expiry
- Usage: 2/5 properties used
- Upgrade request

Owner khud naya owner nahi bana sakta.  
Woh sirf SuperAdmin ko request bhej sakta hai agar extra limits chahiye.

## Owner permissions summary

Kar sakta hai:
- Multiple PG create/edit
- Manager/Staff create, password set, block
- Finance dekhna
- Reports
- Settings
- Approve discounts / refunds
- View all complaints
- Leads overview

Nahi kare (generally):
- SuperAdmin jaisa naya owner banana
- Dusre owner ka data dekhna
- Platform plans banana

---

# ROLE 3 — MANAGER (WARDEN)

Manager Owner ka field commander hai.

Uske login Owner ne banaye.

Uske dimaag me:

- Aaj kaun check-in ho raha hai?
- Kaun sa bed khali hai?
- Kaun complain kar raha hai?
- Mess me kya banana hai?
- Rent kisne nahi diya?
- Visitor kaun aaya?
- Night pe late kaun aaya?

## Manager Dashboard

- Active tenants
- Vacant beds
- Today check-ins
- Today check-outs
- Open complaints
- Pending visitors
- Low mess stock
- Absent staff
- Due renters
- Late night entries yesterday

Quick buttons:

- Take attendance
- New enquiry
- New check-in
- Raise expense
- Broadcast message
- View menu
- Emergency alerts

## Manager ke kaam (daily)

### 1) Leads & Enquiry
Walk-in / call aaya:

- Name, phone, budget, sharing, college
- Visit date
- Status: New / Visited / Interested / Converted / Lost
- Follow-up reminder
- Convert to Tenant button

### 2) Check-in / Onboarding
Manager tenant onboard karta hai:

1. Personal details
2. Documents upload
3. Room/bed select
4. Roommate matching questions
5. Deposit / zero-deposit
6. Digital agreement
7. Parent details
8. Mess wallet activate
9. App access
10. IoT meter link
11. Police verification status mark

### 3) Room operations
- Allocate bed
- Change room
- Mark maintenance
- Vacate bed
- Inventory in room (2 chairs, 1 table, 1 fan)

### 4) Attendance
- Staff attendance
- Tenant occupancy / in-out if needed
- Leave requests

### 5) Complaints
- Receive
- Assign staff
- Update status
- Resolve
- Ask rating

### 6) Visitors
- Approve/reject
- Gate entry
- Time out
- Overnight permission

### 7) Communication
- Floor-wise notice
- Defaulters reminder
- Emergency broadcast
- WhatsApp / SMS / push

### 8) Mess operations
- Menu create
- Orders dekhna
- Kitchen instruction
- Stock update
- Meal ratings dekhna

### 9) Documents
- Collect Aadhaar, college ID, photo
- Mark verified
- Expiry alerts

### 10) Soft finance
Manager usually:

- Cash payment record
- Invoice send
- Reminder
- Small expense add

Bada refund / discount Owner approve kare.

## Manager permissions

Allowed:
- Assigned PG ka almost operational control
- Tenant create / update
- Room allocate
- Complaint handle
- Mess run
- Attendance
- Leads

Not allowed:
- PG delete
- Owner settings change
- Subscription
- Other PG data (unless assigned)
- Manager khud naya manager banana (optional lock)
- Salary structure permanently change

---

# ROLE 4 — STAFF

Staff alag-alag hote hain. Unko full dashboard mat dena.

## Cook
- Aaj ka menu
- Meal orders list
- “Rahul - Poha”
- Prepared / served mark
- Stock low report
- Recipe notes

## Guard
- Visitor list
- Expected guests
- Entry/exit
- SOS nearby alert
- Night late entries
- Emergency contacts

## Cleaner / Housekeeping
- Room cleaning tasks
- Checklist
- Before/after photo
- Hygiene score input

## Maintenance
- Assigned tickets
- Start / complete
- Spare parts used

## Accountant (optional)
- Invoices
- Collections
- Expense entries
- Reports view

Staff login bhi Owner create karega.

---

# ROLE 5 — TENANT (STUDENT)

Tenant app/web use karta hai.

## Tenant Dashboard

- Room + bed
- Rent due
- Mess wallet
- Today menu
- Notices
- Complaint status
- SOS button

## Tenant features

### Profile
- Photo, phone, email
- Emergency contacts
- College details
- Password change

### Rent
- Current invoice
- Pay now
- History
- Receipt download
- Due reminders

### Mess
- Today breakfast/lunch/dinner
- Eating / Skipping
- Item choose
- Wallet recharge
- Ratings
- Monthly statement

### Stay
- Roommate info (limited)
- House rules
- Digital agreement PDF
- Notice period button
- Leave request / outing

### Complaints
- Raise
- Photo/video
- Track
- Chat/comment
- Rate resolution

### Safety
- SOS
- Saved emergency contacts
- Late entry awareness

### Community
- Notices
- Alumni / jobs (phase 3)
- Polls / announcements

## Tenant kya nahi karega

- Room rent change
- Dusre tenant ka bill
- Staff manage
- Gate system control
- Owner reports

---

# ROLE 6 — PARENT

Parent alag login. Yeh USP hai.

## Parent Dashboard

- Child name, room
- Inside PG / outside
- Last entry-exit
- Safety score
- Hygiene rating
- Rent status
- Mess balance
- Open complaints

## Parent features

- Real-time / last known status
- Entry-exit timeline
- Late night alerts
- Call manager
- Message manager
- Financial view (rent paid/pending)
- Auto top-up request (optional)
- Weekly summary
- Complaint visibility
- Emergency button (call PG / call child)

## Parent privacy rules

Parent ko yeh mat dikhana:

- Child ke private chats
- Exact live GPS 24/7 agar legal/privacy issue ho
- Roommate private details
- Other students data

Better approach:

- Gate entry-exit
- “Inside / Outside PG”
- Last seen at gate
- Optional geofence around PG, not full stalking app

---

# 6 MAIN MODULES — SYSTEM KAISE KAAM KAREGA

## Module 1: Entry Gate (Auth + Roles)

### Owner onboarding flow
1. Public website pe “PG Owner Banen” form
2. Request SuperAdmin inbox me
3. SuperAdmin details verify
4. SuperAdmin password set karke owner create
5. Owner email se login
6. Force password change
7. Owner dashboard

### Manager/Staff onboarding flow
1. Owner PG select kare
2. Add team member
3. Role + password set
4. Credentials share
5. First login password change
6. Assigned PG dashboard

### Tenant/Parent auth
- Tenant: phone/email + password/OTP
- Parent: mostly OTP login, easy for mummy-papa

### Access engine
Har API pe check:

```text
user.role
user.owner_id
user.assigned_property_ids
requested_property_id
```

Agar match nahi, 403 Forbidden.

---

## Module 2: Property & Room Management

Yeh system ka skeleton hai.

### Data tree

```text
Owner
 └── Property
      └── Floor
           └── Room
                └── Bed
                     └── Tenant stay
                     └── IoT meter
```

### Room lifecycle

- Created
- Available
- Reserved (booking)
- Occupied
- Maintenance
- Vacated / Available again

### Important screens

**Owner**
- All properties
- Add property
- Occupancy comparison

**Manager**
- Room board (color boxes)
- Vacant beds
- Quick allot

**Public**
- Live vacant bed link
- Photos, rent, amenities
- Enquiry / Book

### Live vacant bed link
Har PG ka public URL:

`smartpg.com/pg/sharma-patna`

Dikhe:
- Available beds
- Rent
- Hygiene score
- Photos
- Book / Enquiry

Yeh marketing USP hai.

---

## Module 3: Tenant Lifecycle

Yeh sabse lamba operational flow hai.

### 1) Enquiry
Source:
- Public link
- Walk-in
- Call
- Instagram / referral

CRM stages:
- New
- Contacted
- Visited
- Interested
- Booked
- Lost

### 2) Booking
- Bed reserve for X hours/days
- Token amount optional
- Deposit type: Normal / Zero-deposit
- Booking status

### 3) Check-in
Documents:
- Aadhaar
- Photo
- College ID
- Guardian ID/phone
- Signature / eSign

AI roommate questions:
- Sleep time
- Cleanliness
- Introvert/extrovert
- Veg/non-veg
- Smoking
- Music/study habits

System compatibility score nikal ke suggested beds dikhaye.

### 4) Digital agreement
Template variables auto-fill:
- Name, room, rent, deposit, term, rules

Tenant agree + OTP/biometric/checkbox eSign
PDF generate, both sides store.

### 5) Police verification tracker
Pehle phase me auto-submit police portal mushkil ho sakta hai.
Practical version:

- Documents locker me
- Form PDF auto-generate
- Status: Not started / Submitted / Verified / Rejected
- Expiry reminder
- Manager update

Baad me actual API/integration.

### 6) Active stay
Rent, mess, complaints, visitors, attendance, score.

### 7) Notice period
Tenant “Give Notice”:
- Last date
- Reason
- Temporary leave or permanent exit

System:
- Notice accepted
- Checkout task list
- Dues freeze date
- Refund estimate

### 8) Checkout
- Room inspection
- Damage charges
- Final bill
- Deposit adjustment
- Fintech loan settlement if any
- Refund
- Exit photos
- Bed vacant
- Alumni invite

---

## Module 4: Finance & Payments

### Invoice engine
Har month cron job:

Due date se X din pehle invoice banao:

- Room rent
- Electricity (IoT/manual)
- Water
- WiFi
- Parking
- Mess leftover/adjustment if needed
- Fines
- Guest charges

Student + parent + manager notify.

### Payments
Methods:
- UPI
- Card
- Netbanking
- Cash (manager collect)

Gateway:
- Razorpay / Cashfree

Success pe:
- Receipt
- Dues clear
- PG score +points
- Owner settlement

### Defaulters
Day 0 reminder  
Day 3 follow-up  
Day 7 manager alert  
Day 15 owner alert  
Optional: late fine

### Owner finance views
Property-wise:
- Expected vs collected
- Expense
- Net profit
- Deposit liability
- Refunds pending

### Expenses
Categories:
- Grocery
- Staff salary
- Repair
- Utilities
- Marketing
- Miscellaneous

Manager add kare, Owner approve kare (recommended).

---

## Module 5: Operations & Safety

### Attendance
Staff:
- Selfie + GPS
- In/out
- Leave

Tenants:
- Gate biometric/QR/RFID
- Present in PG or not

### Complaints
Ticket:
- Category
- Priority
- Photos
- Assigned to
- SLA clock
- Status timeline
- Rating

### Broadcasts
Audience:
- All
- One PG
- One floor
- Defaulters
- Girls/boys
- Notice period people

Channels:
- App push
- WhatsApp
- SMS
- Email

### Gate logs
- Entry
- Exit
- Method
- Photo
- Time
- Late flag

After 11 PM:
- Parent alert
- Manager alert
- Log “LATE”

### SOS
Tenant SOS:
- Timestamp
- Location
- Room
- Notify manager, guard, optional parent
- Response timer
- Incident report

### Visitors
Student invite → manager approve → guard check-in → auto timeout alert.

### Documents locker
Encrypted files:
- Tenant KYC
- Agreements
- Property papers
- Staff IDs

Access by role.

### Inventory
- Grocery stock
- Assets per room
- Low stock alert
- Purchase history
- Theft/wastage control

### Leads CRM
Manager ka sales pipeline.  
“Convert to Tenant” pe data copy.

---

## Module 6: Smart Mess (bada USP)

### Idea
Fixed monthly mess nahi.  
Student jo khaye, wahi pay kare.

### Daily loop

Subah 7:30  
App: “Breakfast me kya loge?”  
Student: Poha / Dosa / Skip  
Cook ko count milta hai  
Food kam waste

### Wallet
- Recharge
- Auto-refill
- Low balance alert
- Daily deduction
- Monthly statement

### Menu
Manager/cook:
- Breakfast/lunch/dinner items
- Price
- Capacity
- Veg/non-veg
- Weekly planner

### Analytics
Owner dekhe:
- Revenue
- Popular items
- Waste %
- Profit
- Quiet days
- Recommendations

### Ratings
Meal ke baad 1-5 stars + comment.

---

# 15+ KILLER FEATURES — KAHAN FIT HONGE

| # | Feature | Primary owner | Kab use hoga |
|---|---|---|---|
| 1 | Parent portal | Parent | Check-in ke baad |
| 2 | Police verification tracker | Manager/Owner | Onboarding |
| 3 | Live vacant bed link | Public/Owner | Marketing |
| 4 | Dynamic pricing | Owner | Peak college season |
| 5 | Bed-specific electricity | Finance/IoT | Monthly invoice |
| 6 | AI roommate matching | Manager | Room allot |
| 7 | Digital eSign | Tenant/Manager | Check-in |
| 8 | Zero-deposit flag + loan status | Owner/Tenant | Booking |
| 9 | Digital notice + refund calc | Tenant/Manager | Exit |
| 10 | PG credit score | Owner/Tenant | Behavior + discounts |
| 11 | SOS | Tenant/Women safety | Emergency |
| 12 | Biometric + night alerts | Guard/Parent | Daily |
| 13 | Hygiene scorecard | Owner/Public | Trust |
| 14 | AI chatbot | Tenant/Manager | 24/7 FAQs |
| 15 | Pay-per-day mess | Everyone | Daily |
| 16 | Hindi/English | All | Adoption |
| 17 | Inventory | Manager | Kitchen/assets |
| 18 | Alumni job board | Tenant | After stay |
| 19 | Leads CRM | Manager | Filling vacant beds |

Phase wise banana, ek saath mat banana.

---

# PERMISSION MATRIX (bahut zaroori)

| Action | SuperAdmin | Owner | Manager | Staff | Tenant | Parent |
|---|---|---|---|---|---|---|
| Create Owner | Yes | No | No | No | No | No |
| Create PG | No* | Yes | No | No | No | No |
| Create Manager/Staff + password | No | Yes | No | No | No | No |
| Create rooms/beds | View | Yes | Yes if allowed | No | No | No |
| Onboard tenant | View | Yes | Yes | No | Limited self | No |
| Collect rent / invoices | Platform view | Yes | Yes limited | Accountant maybe | Pay own | View child |
| Mess menu | No | Yes | Yes | Cook | Order | View maybe |
| Complaints resolve | No | Yes | Yes | Assigned only | Create own | View child |
| SOS receive | No | Yes | Yes | Guard | Trigger | Receive |
| Reports full | Platform | Yes | PG level | No | No | No |
| Subscription control | Yes | View/upgrade request | No | No | No | No |
| Delete/suspend owner | Yes | No | No | No | No | No |

\* SuperAdmin normally PG nahi banata. Aapne clearly kaha owner banayega. Isko lock rakho.

---

# DATABASE BLUEPRINT (simple, build karne layak)

Zaroori tables:

**Users & Access**
- users
- roles
- permissions
- user_roles
- owner_profiles
- staff_profiles
- tenant_profiles
- parent_profiles
- parent_tenant_links
- login_sessions
- audit_logs
- owner_requests

**Property**
- properties
- floors
- rooms
- beds
- amenities
- property_photos
- room_assets

**Stay**
- enquiries
- bookings
- stays
- room_change_logs
- agreements
- documents
- police_verifications
- notices
- checkouts
- roommate_answers
- roommate_matches

**Finance**
- invoices
- invoice_items
- payments
- refunds
- expenses
- salaries
- wallets
- wallet_transactions
- deposits
- fine_rules

**Ops**
- complaints
- complaint_comments
- visitors
- attendance
- gate_logs
- broadcasts
- inventory_items
- inventory_stock
- inventory_usage
- tasks

**Mess**
- menus
- menu_items
- meal_orders
- meal_ratings
- recipes (optional)

**Safety**
- sos_alerts
- emergency_contacts
- geofences

**SaaS**
- plans
- subscriptions
- feature_flags
- platform_invoices

Har table me roughly:
`id, owner_id, property_id, created_by, created_at, updated_at, is_deleted`

---

# SCREEN-BY-SCREEN BUILD LIST

## Public
- Landing page
- Owner request form
- PG vacant beds page
- Enquiry form
- Tenant/Parent app download

## SuperAdmin
- Login
- Dashboard
- Requests
- Create owner
- Owners
- Owner detail
- Plans
- Feature flags
- Tickets
- Logs
- Settings

## Owner
- Login / first password change
- Setup wizard
- Dashboard
- Properties CRUD
- Rooms/beds
- Team (manager/staff create)
- Tenants
- Finance
- Mess analytics
- Reports
- Settings
- Subscription

## Manager
- Dashboard
- Enquiries
- Check-in wizard
- Rooms board
- Tenants
- Complaints
- Mess
- Visitors
- Attendance
- Broadcast
- Documents
- Inventory
- Gate logs

## Tenant app
- Home
- Pay rent
- Mess
- Complaints
- Notices
- Profile
- SOS
- Agreement / documents

## Parent app
- Child status
- Logs
- Alerts
- Payments view
- Call/message manager

---

# COMPLETE USER JOURNEY (aapke rule ke hisaab se)

## 1) SuperAdmin owner banata hai
Rajesh Sharma form bharta hai.  
Aap SuperAdmin panel me request dekhte ho.  
Aap details lete ho, password set karte ho: `Sharma@2026`  
Account active.

Mail:

```text
Subject: Aapka SmartPG Owner Account Ready Hai
Email: rajesh@sharmapg.com
Temporary Password: Sharma@2026
Login: https://app.smartpg.com/login
Pehli baar login ke baad password change kijiye.
```

## 2) Owner login karke 2 PG banata hai
- Sharma PG Patna
- Sharma PG Delhi

Patna me 75 beds, Delhi me 100 beds.

## 3) Owner managers banata hai
Patna Manager: Ramesh / `ramesh.patna@sharmapg.com` / password Owner set kare.  
Delhi Manager: Sandeep / alag credentials.

Cook/Guard bhi isi tarah.

## 4) Managers rooms fill karte hain, leads lete hain
Vacant bed link se Rahul aata hai.

## 5) Rahul booking + check-in
Zero-deposit choose kare, documents de, eSign kare, roommate match ho, parent account ban jaye.

## 6) Daily life
Mess order, rent auto-invoice, late night parent alert, complaint ticket, SOS if needed.

## 7) Exit
Notice → inspection → refund calc → bed vacant → alumni.

Yahi start-to-end product loop hai.

---

# DEVELOPMENT ROADMAP (ab build order clear hai)

## Phase 0 — Planning (1-2 weeks)
- Final roles
- DB schema
- Figma screens
- Permission matrix
- Owner create flow first

## Phase 1 — Foundation (Month 1-3)
Pehle yeh banao, warna baaki atak jayega:

1. Users + roles + JWT
2. SuperAdmin panel
3. Owner request form
4. SuperAdmin creates owner + password
5. Owner login
6. Owner creates multiple PGs
7. Rooms/beds CRUD
8. Owner creates manager/staff + password
9. Manager login + assigned PG only
10. Basic dashboards
11. Tenant basic profile
12. Invoice + Razorpay test
13. OTP/email/SMS basic

Is phase ke baad aapka **core skeleton** chalna chahiye.

## Phase 2 — Core PG operations (Month 4-7)
- Enquiry CRM
- Check-in wizard
- Agreements
- Complaints
- Mess wallet + orders
- Parent portal basic
- Gate logs / QR
- Broadcasts
- Documents
- PG score
- Defaulters
- Inventory basic

## Phase 3 — USPs (Month 8-10)
- AI roommate matching
- Dynamic pricing
- IoT meters
- SOS
- Chatbot
- Zero-deposit partner fields
- Advanced analytics
- Multi-language
- Alumni board

## Phase 4 — Polish (Month 11-12)
- Security
- GST/compliance
- Performance
- Store release
- Docs
- Beta owners

---

# TECH STACK (practical)

**Web:** React + TypeScript + Tailwind  
**Mobile:** Flutter (ek codebase se Owner/Manager/Tenant/Parent apps ban sakti hain, alag flavors)  
**Backend:** Django REST + PostgreSQL  
**Auth:** JWT + refresh  
**Tasks:** Celery + Redis  
**Files:** S3  
**Payments:** Razorpay  
**SMS/WhatsApp:** Twilio / Gupshup / WhatsApp Business  
**Push:** Firebase  
**Maps:** Google Maps  
**Hosting:** Docker + AWS

### Project structure suggestion

```text
backend/
  accounts/
  owners/
  properties/
  tenants/
  finance/
  mess/
  operations/
  safety/
  platform/
frontend-admin/   (SuperAdmin + Owner + Manager web)
mobile-app/       (Tenant + Parent, later manager)
```

---

# IMPLEMENTATION RULES TAKE ME EASY LAGE

1. **Pehle hierarchy banao, features baad me.**  
   SuperAdmin → Owner → PG → Manager → Tenant.

2. **Har API pe owner_id + property_id check.**

3. **Passwords jo upar wala banaye, first login pe change.**

4. **Manager ko sirf assigned PG.**

5. **Staff ko alag chhota interface.**

6. **Mess aur SOS ko phase 1 me mat uljhao.**  
   Pehle login + PG + rooms + users.

7. **Har important action ka log.**  
   Especially password create/reset, refund, suspend.

8. **Hindi + English labels shuru se.**  
   Baad me add karna muskil.

9. **Dummy seed data banao.**  
   1 SuperAdmin, 2 Owners, 3 PGs, 4 managers, 20 rooms, 10 tenants.

10. **Ek check-in wizard solid banao.**  
    Usse poora system zinda dikhega.

---

# MINIMUM VIABLE PRODUCT (jo pehle live kar sakte ho)

Agar aap confuse ho rahe ho to sirf yeh launch karo:

1. SuperAdmin creates owner
2. Owner login
3. Owner multiple PG create
4. Rooms/beds
5. Owner creates manager
6. Manager tenant add
7. Rent invoice + payment
8. Complaint ticket
9. Basic dashboard

Iske baad:
- Mess
- Parent
- SOS
- Matching
- IoT

Yahi sahi tarika hai. Warna 19 USP ek saath me project doob jayega.

---

# FINAL MENTAL MODEL

SuperAdmin = **software ka malik**  
Owner = **business ka malik**  
Manager = **PG ka captain**  
Staff = **haath-pair**  
Tenant = **customer**  
Parent = **safety customer**

Paise ka flow:
Tenant/Parent pay → PG Owner ko settlement  
Owner platform fee pay → SuperAdmin ko

Control ka flow:
SuperAdmin owner banaye  
Owner PG + manager banaye  
Manager tenant daily life chalaye

Agar yeh 3 lines yaad rakhoge, poora project seedha banega.

---

Agar chaho to next message me main isi blueprint ko tod kar **exact database fields + API list + har role ke page wireframe (fields ke saath)** de dunga, taaki aap seedha coding start kar sako.