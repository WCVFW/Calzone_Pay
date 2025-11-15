# Recharge App - Complete Implementation Guide

This document outlines the full user flow and implementation details for the recharge application.

## 🔄 User Flow

### 1. **Normal User Access**
- Users can browse the website and view recharge plans without logging in
- The **Pay** button is disabled until the user logs in and their account is activated

### 2. **🔐 Signup Process**
- User fills out the Signup form with: Name, Email, Phone, Password
- Account is created with status = **PENDING** (waiting for KYC)
- User is immediately redirected to the **KYC Page**

### 3. **🪪 KYC Process**
- User uploads:
  - Aadhaar number
  - PAN number
  - Address proof
- KYC status = **PENDING** (awaiting admin review)
- User sees message: "Your KYC has been submitted. Please wait for admin approval."

### 4. **🧑‍💼 Admin Approval**
- Admin logs in via `/admin` (requires ADMIN role)
- Can see all pending KYC submissions in a table
- Admin can **Approve** or **Reject** each KYC
- Once approved:
  - User's account status changes to **ACTIVE**
  - User receives notification: "Your account is activated. You can now recharge."

### 5. **💳 Recharge Process**
When user clicks the **Recharge** tab:

- **Not logged in?** → Popup: "Please login first" → Redirects to Login
- **Logged in but KYC pending?** → Message: "Your KYC is pending approval" → Cannot proceed
- **KYC approved?** → Can proceed to Razorpay checkout
  - User enters mobile number
  - Selects a plan
  - Clicks Pay
  - Opens Razorpay Checkout
  - After successful payment → Transaction saved with user details

---

## 🛠️ Backend Implementation

### Database Schema

#### `users` table
```sql
id, name, email, phone, password, kyc_status (PENDING|APPROVED|REJECTED), role (USER|ADMIN)
```

#### `kyc` table
```sql
id, user_id, aadhaar, pan, address, document_urls, status
```

#### `transactions` table
```sql
id, user_id, mobile_number, operator, amount, razorpay_payment_id, status, created_at
```

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - Create user account (status = PENDING)
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user details + is_active flag

#### KYC Management
- `POST /api/kyc/submit` - Submit KYC documents (requires auth)
- `GET /api/admin/kyc-pending` - Get all pending KYC (admin only)
- `POST /api/admin/kyc-approve` - Approve/Reject KYC (admin only)

#### Payments
- `POST /api/payment/razorpay-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment and save transaction

#### Recharge Plans
- `GET /api/operator/:mobile` - Fetch operator by mobile number
- `GET /api/plans/:operatorCode/:circleCode` - Fetch plans

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 16+
- MySQL Server
- Razorpay Account (for payment integration)

### 1. Database Setup

```bash
# Create database and tables
mysql -u root -p < server/schema.sql
```

### 2. Server Setup

```bash
cd server
npm install

# Configure .env file
# Update DB_HOST, DB_USER, DB_PASSWORD
# Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET

npm run dev
# Server runs on http://localhost:3000
```

### 3. Client Setup

```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

---

## ✅ Testing the Complete Flow

### Step 1: Create an Account
1. Navigate to `/signup`
2. Fill in: Name, Email, Phone, Password
3. Click "Create account & Continue to KYC"
4. → Redirected to `/kyc`

### Step 2: Submit KYC
1. On KYC page, enter:
   - Aadhaar: `123456789012`
   - PAN: `ABCDE1234F`
   - Address: `123 Main St, City, State`
2. Click "Submit KYC"
3. → See message: "KYC submitted successfully. Awaiting admin approval."

### Step 3: Admin Approval
1. Create an admin user:
   ```sql
   INSERT INTO users (name, email, phone, password, kyc_status, role) 
   VALUES ('Admin', 'admin@test.com', '9999999999', 'hashed_password', 'APPROVED', 'ADMIN');
   ```
2. Login as admin with email: `admin@test.com`
3. Navigate to `/admin`
4. See the pending KYC submission
5. Click "Approve"
6. → User's kyc_status changes to APPROVED, is_active = true

### Step 4: Attempt Recharge
1. Login as the user (from Step 1)
2. Navigate to `/recharge`
3. Enter mobile number: `9876543210`
4. Click "Check Plans"
5. Plans load
6. Click "Pay" button
7. → Should now be enabled (green)
8. → Opens Razorpay Checkout
9. Complete payment
10. → Transaction saved in database

---

## 🔑 Key Features Implemented

✅ **User Signup** - Creates PENDING accounts  
✅ **JWT Authentication** - Secure token-based auth  
✅ **KYC Submission** - Upload documents  
✅ **Admin Dashboard** - Review and approve KYC  
✅ **Account Activation** - Automatic after admin approval  
✅ **Recharge Gating** - Pay button disabled until KYC approved  
✅ **Razorpay Integration** - Payment processing  
✅ **Transaction Logging** - Save payment details with user  
✅ **Role-based Access** - Admin-only endpoints protected  

---

## 📝 Configuration Files

### Server `.env`
```properties
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=recharge_db
JWT_SECRET=your-super-secret-key
RAZORPAY_KEY_ID=rzp_test_v9bZpQvmrVnUzZ
RAZORPAY_KEY_SECRET=7WK71mMmiIYb4ZLi4Mcw1eDl
```

### Important Notes
- Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with your actual Razorpay credentials
- Change `JWT_SECRET` to a strong random string in production
- Ensure database is created before running server

---

## 🐛 Troubleshooting

**"Database connection failed"**
- Check MySQL is running
- Verify DB_HOST, DB_USER, DB_PASSWORD in .env

**"Token invalid"**
- Clear localStorage and login again
- Ensure JWT_SECRET is consistent between server restarts

**"Razorpay checkout not opening"**
- Add Razorpay script to HTML head or dynamically load
- Verify RAZORPAY_KEY_ID is set correctly

**"Pay button still disabled after approval"**
- Refresh the page or logout/login to sync user state
- Check `/auth/me` returns is_active: true

---

## 📚 Technology Stack

- **Backend**: Express.js, MySQL, JWT, Razorpay API
- **Frontend**: React 18, TypeScript, React Router, Axios
- **UI**: Bootstrap 5, SweetAlert2
- **Auth**: JWT tokens with localStorage persistence

