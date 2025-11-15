# 🚀 Backend Startup Guide

## Quick Start (One Command)

The backend, database, and all migrations are set up and started with a **single command**:

```bash
cd server
node start-all.js
```

This script automatically:
1. ✅ Creates MySQL database and tables (if needed)
2. ✅ Runs all migrations (columns, enums, etc.)
3. ✅ Creates admin user (if missing)
4. ✅ Verifies admin user credentials
5. ✅ **Starts the Express server on port 3000**

## Output

You'll see a summary like this:
```
╔════════════════════════════════════════╗
║  🚀 RECHARGE APP - MASTER STARTUP      ║
╚════════════════════════════════════════╝

✅ All 7 setup steps completed!

╔════════════════════════════════════════╗
║  🎯 STARTING EXPRESS SERVER...        ║
╚════════════════════════════════════════╝

✅ Server running on http://localhost:3000
```

## What's Included

### Database Setup (`setup-db.js`)
- Creates `recharge_db` database
- Creates `users`, `kyc`, `transactions` tables

### Migrations (automatic)
- `migrate-transactions-table.js` → Adds payment columns (plan_amount, commissions, total_amount)
- `add-razorpay-column.js` → Adds razorpay_order_id
- `add-razorpay-payment-id.js` → Adds razorpay_payment_id
- `add-recharge-columns.js` → Adds recharge_status, recharge_response

### Admin User Setup
- `add-admin-user.js` → Creates admin user if missing
- `verify-admin-user.js` → Verifies admin is set up correctly

### Server
- `server.js` → Starts Express server on http://localhost:3000

## Prerequisites

Before running `start-all.js`, ensure:

### 1. MySQL is Running
```powershell
# On Windows, MySQL should be running (XAMPP, Docker, native MySQL service, etc.)
# Verify with:
mysql -u root -p -e "SELECT 1"
```

### 2. Configuration (`server/.env`)
Create or update `server/.env` with:
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=recharge_db

# API Credentials (for external plan API)
API_USER_ID=6659
API_PASSWORD=Prakash@1482

# Razorpay (get from https://dashboard.razorpay.com/settings/api-keys)
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET

# External Recharge API (optional, can add later)
EZYTM_API_TOKEN=your-token-here

# JWT
JWT_SECRET=your-secret-key-change-in-production
```

### 3. Node.js Installed
```bash
node --version  # Should be v16+
npm --version
```

## Example Full Startup

```powershell
# Open PowerShell and navigate to project
cd 'c:\Users\praka\Downloads\newnew-main\newnew-main\server'

# Run the master startup script
node start-all.js
```

The backend is now ready! Frontend can make API calls to `http://localhost:3000/api/*`

## Troubleshooting

### "MySQL Connection Failed"
- Check MySQL service is running
- Verify `DB_HOST`, `DB_USER`, `DB_PASSWORD` in `.env`

### "Address already in use :::3000"
- Port 3000 is occupied. Either:
  - Kill the process: `taskkill /F /IM node.exe`
  - Or change `PORT` in `.env` and update frontend API URL

### "Status enum update skipped: Data truncated..."
- Old transactions have invalid status values
- Safe to ignore; only affects old test data
- New transactions will have correct status values

## Admin Login (After Startup)

- **Email**: `prakash@hadoglobalservices.com`
- **Password**: `Prakash@0000`

Go to: `http://localhost:5173/login` (frontend) and login to access admin dashboard.

## Next Steps

1. **Frontend**: Start React dev server
   ```bash
   cd client
   npm install  # if needed
   npm run dev
   ```

2. **Test Payment**: Go to http://localhost:5173/recharge and test payment flow

3. **Configure Razorpay**: Add your test keys from https://dashboard.razorpay.com/settings/api-keys

4. **Configure Operator API**: Add your EZYTM token for actual recharge calls

---

**That's it!** One command runs everything. 🚀
