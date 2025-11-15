# ⚡ Quick Migration Checklist

Use this checklist to upgrade your existing recharge server in minutes.

---

## 📋 Pre-Migration Checklist

- [ ] Backup current `server.js` file
- [ ] Have MySQL installed and running
- [ ] Have Node.js 14+ installed
- [ ] Have npm or yarn package manager

---

## 🔧 Installation Steps (10 minutes)

### Step 1: Install New Dependencies
```bash
npm install mysql2 jsonwebtoken bcryptjs dotenv
```
**Time**: 2 minutes

### Step 2: Update server.js
Copy content from `server-enhanced.js` to `server.js` OR merge manually.
**Time**: 5 minutes

### Step 3: Create .env File
```properties
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=recharge_db
JWT_SECRET=your-secret-key-123
API_USER_ID=6659
API_PASSWORD=Prakash@1482
```
**Time**: 2 minutes

### Step 4: Setup Database
```bash
# Download schema.sql (provided)
mysql -u root -p < schema.sql
```
**Time**: 1 minute

---

## ✅ Verification Checklist

### Server Startup
- [ ] Run `npm start` or `npm run dev`
- [ ] See message: "✅ Server running on http://localhost:3000"
- [ ] No errors in console

### Test Basic Endpoints
- [ ] Operator endpoint still works: `GET /api/operator/9876543210`
- [ ] Plans endpoint still works: `GET /api/plans/VF/AP`

### Test New Auth Endpoints
- [ ] Signup works: `POST /api/auth/signup`
- [ ] Login works: `POST /api/auth/login`
- [ ] Get user works: `GET /api/auth/me` (with token)

### Test New KYC Endpoints
- [ ] Submit KYC works: `POST /api/kyc/submit`
- [ ] Admin can see pending: `GET /api/admin/kyc-pending`
- [ ] Admin can approve: `POST /api/admin/kyc-approve`

### Test New Payment Endpoints
- [ ] Create order works: `POST /api/payment/razorpay-order`
- [ ] Verify payment works: `POST /api/payment/verify`

---

## 🧪 Quick Test Commands

### Test Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","phone":"9876543210","password":"password123"}'
```
Expected: `{"message":"Signup successful..."}`

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```
Expected: `{"token":"eyJ...","message":"Login successful"}`

### Test Get Current User (replace TOKEN)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJ..."
```
Expected: User details with `is_active: false`

---

## 🚀 Deployment Readiness

- [ ] All endpoints tested locally
- [ ] Database running with schema
- [ ] .env file configured
- [ ] No console errors
- [ ] Original operator/plans endpoints work
- [ ] New auth/kyc/payment endpoints work

---

## ⚙️ Optional: Production Configuration

### Change JWT Secret
```bash
# Generate secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env
JWT_SECRET=<generated_string>
```

### Add Razorpay Keys
```properties
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
```

### Configure Database Backup
```bash
mysqldump -u root -p recharge_db > backup.sql
```

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| `Cannot find module 'mysql2'` | Run: `npm install mysql2` |
| `Connection refused` | Ensure MySQL is running |
| `Unknown database 'recharge_db'` | Run: `mysql -u root -p < schema.sql` |
| `EADDRINUSE: address already in use :::3000` | Change PORT in .env or kill process on 3000 |
| `Invalid token` | Ensure JWT_SECRET matches between restarts |

---

## 📝 Files to Download/Update

1. **server-enhanced.js** - Copy content to server.js
2. **schema.sql** - Run to create database
3. **SERVER_UPGRADE_GUIDE.md** - Reference for detailed steps
4. **.env template** - Create your .env file

---

## ✨ After Migration

Your server now has:

✅ User authentication (signup/login)  
✅ KYC document submission  
✅ Admin approval dashboard  
✅ Account activation workflow  
✅ Razorpay payment integration  
✅ Transaction logging  
✅ Security best practices  

**While keeping existing features:**

✅ Operator fetching  
✅ Plan browsing  
✅ External API integration  

---

## 🎯 Next: Connect Frontend

Once server is upgraded, connect your frontend to:
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user status
- `POST /api/kyc/submit` - KYC submission
- `GET /api/admin/kyc-pending` - Admin dashboard
- `POST /api/admin/kyc-approve` - Admin approval

---

**Total Setup Time**: ~15 minutes  
**Backward Compatible**: ✅ Yes  
**Production Ready**: ✅ With .env config  

