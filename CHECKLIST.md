# Prompt 20 Testing Checklist (End-to-End Cross-Role Wiring)

Below are the exact click-paths to verify all 9 cross-role workflows using the `localStorage` database.

**General Rule for Testing:**
Since this is a `localStorage` app, open different tabs for different roles. Avoid opening different roles in the exact same tab without clicking "Logout", as session tokens (`spg_current_session`) might conflict if not cleared properly.

---

### Flow 1: Owner Onboarding Pipeline
1. Go to `http://localhost:3000/owner-request`
2. Fill the public form (e.g., Name: **Virat**, Business: **VK PGs**) and submit.
3. Open a new tab and go to `http://localhost:3000/superadmin/login` (Admin / admin123).
4. Go to **Requests**. You will see the new request from Virat.
5. Click **Approve & Create Account**. Assign a temporary password (e.g., `Virat@123`) and submit.
6. Open an incognito window, go to `http://localhost:3000/owner/login` and log in with the new owner's email and `Virat@123`.

### Flow 2: Enquiry Pipeline
1. Go to `http://localhost:3000/vacant/elite-mens`
2. Submit the "Enquire Now" form (Name: **Rishabh Pant**, Phone: **8888888888**).
3. Log in to the Manager Portal (`manager.demo@example.com` / `Manager@123`).
4. Go to **Enquiries**. You will see Rishabh Pant's enquiry listed.

### Flow 3: Tenant Check-in & Parent Creation
1. In the Manager Portal (`manager.demo@example.com`), go to **Quick Actions > New Check-in**.
2. Fill out the tenant details (Name: **Shubman**, Email: **shub@test.com**, Parent Name: **Mr. Gill**).
3. Complete the check-in.
4. Log in to the Owner Portal (`owner.demo@example.com` / `Owner@123`). Go to **Tenants** -> Verify Shubman is "Active".
5. Log in to the Parent Portal (`parent_9999999999@example.com` / `Parent@123`). Verify Parent Dashboard loads Shubman's details.

### Flow 4: Complaint Pipeline
1. Log in to the Tenant Portal (`james.b@example.com` / `Tenant@123`).
2. Go to **Support/Complaints** and create a new ticket ("AC not cooling").
3. Log in to the Manager Portal (`manager.demo@example.com`).
4. Go to **Complaints**. The new ticket "AC not cooling" will appear in the inbox.

### Flow 5: Mess Order Pipeline
1. Log in to the Tenant Portal (`james.b@example.com`).
2. Go to **Food / Mess** and click "Eat Here" for Dinner (this creates an order).
3. Log in to the Staff Portal (`cook.demo@example.com` / `Staff@123`). Verify the dinner order appears in the active preparation list.
4. Log in to the Owner Portal (`owner.demo@example.com`). Go to **Mess/Food**. Verify the "Total Orders" metric has increased.

### Flow 6: Rent Payment Pipeline
1. Log in to the Tenant Portal (`james.b@example.com`).
2. Go to **Finance** and pay the pending rent (Mock Payment Gateway).
3. Log in to the Owner Portal (`owner.demo@example.com`).
4. Go to **Finance**. The "Revenue" widget will immediately reflect the newly paid amount, and "Pending Dues" will decrease.

### Flow 7: Late Gate Log -> Parent Alerts
1. Log in to the Staff Portal as a Guard (`guard.demo@example.com` / `Staff@123`).
2. Select James and click **Late Entry**.
3. Log in to the Parent Portal (`peter.m@example.com` / `Parent@123`).
4. Go to **Alerts**. A "Late Entry Logged" critical alert will appear.

### Flow 8: Emergency SOS
1. Log in to the Tenant Portal (`james.b@example.com`).
2. Click the **SOS** floating button or go to the SOS page and trigger it.
3. Open the Manager Portal (`manager.demo@example.com`). The Dashboard will show **Active SOS: 1** in red.
4. Open the Staff Guard Portal (`guard.demo@example.com`). The SOS alert will be flashing prominently.

### Flow 9: Notice Period
1. Log in to the Tenant Portal (`james.b@example.com`).
2. Go to **Notice Period**, pick a move-out date, and submit the notice.
3. Log in to the Owner Portal (`owner.demo@example.com`).
4. Go to **Tenants**. James' card will now have a yellow **ON NOTICE** badge at the top right.
