# Smart PG Management System – Blueprint Summary

## 1️⃣ High‑level Hierarchy
```
Platform (SuperAdmin)
 └─ Owner 1
 │    ├─ PG A
 │    │   ├─ Manager
 │    │   ├─ Staff (Cook / Guard / Cleaner …)
 │    │   ├─ Tenants
 │    │   └─ Parents
 │    └─ PG B
 └─ Owner 2
      └─ PG C
```
- **SuperAdmin** creates **Owners** (no self‑signup).
- **Owner** creates one or more **Properties/PGs** and their **Managers/Staff**.
- **Manager** runs day‑to‑day operations, adds **Tenants**.
- **Parent** accounts are linked to a Tenant.

## 2️⃣ Core Roles & Permissions
| Role | Primary Capabilities | Create / Manage |
|------|----------------------|-----------------|
| **SuperAdmin** | Platform settings, owners, plans, analytics, audit logs | Owners, feature flags, subscriptions |
| **Owner** | Dashboard, multi‑PG CRUD, finance, reports, staff creation | PGs, Managers/Staff, property settings |
| **Manager** | Assigned‑PG operations – rooms, tenants, complaints, mess, attendance, visitors, SOS | Tenants (within own PG), rooms/beds, complaints, mess orders |
| **Staff** (Cook, Guard, Cleaner, etc.) | Limited UI per role (mess, gate, cleaning tasks) | No user creation |
| **Tenant** | Profile, rent/pay, mess, complaints, SOS | Self‑service actions |
| **Parent** | Child status, payments, alerts | View child data only |

**Permission Matrix** (simplified):
- SuperAdmin sees *all* data.
- Owner sees only their own PGs.
- Manager sees only assigned PG(s).
- Staff sees role‑specific modules.
- Tenant sees own personal data.
- Parent sees linked child data.

## 3️⃣ Authentication & Security
- Email/Phone + password (or OTP for tenants/parents).
- Passwords for Owner/Manager/Staff are **set by the creator** (SuperAdmin or Owner).
- First login forces password change (except OTP logins).
- JWT **access + refresh** tokens.
- RBAC enforced on every endpoint (`user.role`, `owner_id`, `property_id`).
- Audit logs for critical actions (user creation, password reset, plan change, etc.).

## 4️⃣ Core Modules (MVP = Phase 1)
1. **Entry Gate** – unified login, role detection, redirects.
2. **Owner Request Inbox** – public form → SuperAdmin approval.
3. **Owner Dashboard** – overview, create PGs, staff, finance.
4. **Property & Room Management** – CRUD for properties → floors → rooms → beds.
5. **User Management** – create Manager/Staff accounts (Owner), Tenant onboarding (Manager).
6. **Finance Engine** – monthly invoice generation, Razorpay integration, payment tracking, simple reporting.
7. **Complaint Ticketing** – create, assign, resolve, rating.
8. **Basic Settings** – OTP provider, email/SMS templates, platform configs.
9. **Audit Log Viewer** – for SuperAdmin.

*Later phases* add Mess wallet, Parent portal, SOS, AI roommate matching, dynamic pricing, IoT meters, etc.

## 5️⃣ Data Isolation Rules
- Every record stores `owner_id` and, where applicable, `property_id`.
- Access checks validate that the requesting user’s `owner_id` matches the record’s `owner_id` and, for Manager/Staff, that the `property_id` is in their assigned list.
- SuperAdmin bypasses checks.

## 6️⃣ Minimal Viable Product (MVP) Scope
1. SuperAdmin creates Owner (email + temp password). 
2. Owner logs in, changes password, creates multiple PGs. 
3. Owner defines rooms & beds. 
4. Owner creates Manager accounts (password set by Owner). 
5. Manager logs in, adds Tenants (basic profile, room assignment). 
6. Invoice generation & Razorpay payment flow. 
7. Complaint creation & resolution workflow. 
8. Dashboard views for SuperAdmin, Owner, Manager.

## 7️⃣ Database Sketch (Key Tables)
- `users (id, email, phone, password_hash, role, owner_id, property_id, created_at…)`
- `owners (id, user_id, business_name, plan_id, status…)`
- `properties (id, owner_id, name, address, city, type, …)`
- `floors (id, property_id, number)`
- `rooms (id, floor_id, number, sharing_type, …)`
- `beds (id, room_id, code, status, rent, tenant_id…)`
- `tenants (id, user_id, property_id, bed_id, parent_id, …)`
- `parents (id, user_id, child_tenant_id, …)`
- `staff (id, user_id, role, property_id, …)`
- `invoices, invoice_items, payments, expenses` 
- `complaints (id, property_id, tenant_id, assigned_to, status…)`
- `audit_logs (id, action, performed_by, target_id, details…)`
- `owner_requests, plans, feature_flags`

Each table includes `id, owner_id, property_id (if applicable), created_by, created_at, updated_at, is_deleted`.

## 8️⃣ API Surface (high‑level)
- **Auth**: `/login`, `/refresh`, `/reset-password`, `/otp-login`.
- **SuperAdmin**: `/admin/owners`, `/admin/owner-requests`, `/admin/plans`, `/admin/audit`.
- **Owner**: `/owner/properties`, `/owner/staff`, `/owner/finance`, `/owner/reports`.
- **Manager**: `/manager/tenants`, `/manager/rooms`, `/manager/complaints`, `/manager/mess`.
- **Tenant**: `/tenant/profile`, `/tenant/pay`, `/tenant/complaint`, `/tenant/sos`.
- **Parent**: `/parent/child-status`.

All endpoints are secured with JWT and role‑based middleware.

## 9️⃣ Development Roadmap (high‑level)
| Phase | Duration | Focus |
|-------|----------|-------|
| **0 – Planning** | 1‑2 weeks | Finalize schema, wireframes, permission matrix. |
| **1 – Foundation** (Month 1‑3) | Users + RBAC, SuperAdmin UI, Owner request flow, Owner CRUD, Property/Room CRUD, Staff creation, basic dashboards, invoice & Razorpay stub. |
| **2 – Core Operations** (Month 4‑7) | Tenant onboarding, complaints, basic mess, parent portal starter, gate logs, broadcast. |
| **3 – USPs** (Month 8‑10) | AI matching, dynamic pricing, IoT, SOS, chatbot, multilingual support. |
| **4 – Polish** (Month 11‑12) | Security hardening, compliance (GST), performance, documentation, beta rollout. |

---

*This blueprint file captures the essential architecture, roles, data isolation, authentication, MVP scope, and roadmap. It will serve as the reference for the upcoming detailed DB schema, API definitions, and UI wireframes.*
