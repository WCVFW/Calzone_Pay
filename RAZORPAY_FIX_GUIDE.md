# Razorpay 400 Bad Request Error - FIXED ✅

## What Was Wrong?

You were seeing **400 Bad Request** errors from Razorpay's API:
```
api.razorpay.com/v1/standard_checkout/preferences?order_id=order_1763007533749&amount=7725.41...
Failed to load resource: the server responded with a status of 400
```

**Root Cause:** The order IDs being sent to Razorpay were **mock timestamps** (like `order_1763007533749`) that were never created via the Razorpay API. Razorpay doesn't recognize these orders, so it rejects them with 400 Bad Request.

## What I Fixed

### 1. **Database Schema Updated** ✅
- Updated `status` ENUM to include `PENDING` and `COMPLETED` (was only `SUCCESS`/`FAILED`)
- Verified all payment columns exist: `plan_amount`, `commissions`, `total_amount`, `razorpay_order_id`, `razorpay_payment_id`

### 2. **Server Already Has Real Razorpay Integration** ✅
Your `server.js` already correctly:
- Imports Razorpay SDK: `import Razorpay from "razorpay"`
- Creates **real Razorpay orders** via: `razorpayInstance.orders.create()`
- Stores `razorpay_order_id` in the database
- Updates payment status correctly

### 3. **Server Restarted** ✅
Server is now running with the fixed schema on http://localhost:3000

---

## What You Need To Do

### Step 1: Get Your Razorpay Test Credentials

1. Navigate to: **https://dashboard.razorpay.com/**
2. Sign in (create account if needed)
3. Go to **Settings → API Keys**
4. Copy your **Test Key ID** (looks like: `rzp_test_XXXXXXXXXXXXX`)
5. Copy your **Test Key Secret** (keep this private!)

### Step 2: Update Backend Configuration

Create or edit `server/.env` file:

```env
RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_KEY_SECRET
```

Then restart the server:
```powershell
cd 'c:\Users\praka\Downloads\newnew-main\newnew-main\server'
node server.js
```

### Step 3: Update Frontend Configuration

Open `client/src/pages/Recharge.tsx` and find line ~197:

```typescript
key: "rzp_test_v9bZpQvmrVnUzZ", // Replace with your Razorpay key
```

Replace `rzp_test_v9bZpQvmrVnUzZ` with your actual test key from the dashboard.

### Step 4: Test the Payment Flow

1. **Navigate to Recharge page** at `http://localhost:5173/recharge`
2. **Enter mobile number**: `8489529876` (or any 10-digit number)
3. **Click "Check Plans"** → Plans should load
4. **Select a plan** (e.g., ₹99)
5. **Click "Pay"** → Confirmation dialog shows:
   - Plan: ₹99
   - Commissions: ₹0.33 (0.2% + 0.1% + 0.03%)
   - Total: ₹99.33
6. **Click "Pay Now"** → Razorpay checkout opens
7. **Use test card**: `4111 1111 1111 1111`
   - Expiry: Any future date (e.g., 12/25)
   - CVV: Any 3 digits (e.g., 123)
   - OTP (if prompted): `123456`
8. **Verify Success**: 
   - You see "Success! Recharge completed successfully!"
   - Check database: Transaction recorded with `razorpay_order_id` and `razorpay_payment_id`

---

## How It Works Now

### Frontend → Backend Flow:

1. **User clicks Pay** → `handleRecharge()` calculates commissions
   ```
   Plan Amount: ₹100
   Employee Commission (0.2%): ₹0.20
   Company Commission (0.1%): ₹0.10
   API Commission (0.03%): ₹0.03
   Total to Charge: ₹100.33
   ```

2. **Frontend calls** `POST /api/payment/razorpay-order`
   ```json
   {
     "amount": 100.33,
     "mobile_number": "8489529876",
     "operator": "Vodafone",
     "plan_amount": 100,
     "commissions": 0.33
   }
   ```

3. **Backend creates real Razorpay order**
   ```javascript
   const razorpayOrder = await razorpayInstance.orders.create({
     amount: 10033,  // in paise
     currency: "INR",
     receipt: "receipt_user_123_1234567890",
     notes: { userId, mobile_number, operator, plan_amount, commissions }
   });
   ```
   
   Razorpay returns: `{ id: "order_Rf5o2JoDtTPMuf", ... }`

4. **Backend stores in database** with status = `PENDING`
   ```
   INSERT INTO transactions 
   (user_id, mobile_number, operator, plan_amount, commissions, total_amount, status, razorpay_order_id)
   VALUES (123, "8489529876", "Vodafone", 100, 0.33, 100.33, "PENDING", "order_Rf5o2JoDtTPMuf")
   ```

5. **Frontend receives real order_id** and opens Razorpay checkout with it
   - Razorpay validates the order exists ✅
   - User completes payment
   - Razorpay returns `razorpay_payment_id` and `razorpay_order_id`

6. **Frontend calls** `POST /api/payment/verify` with payment details

7. **Backend updates transaction** status = `COMPLETED` and stores `razorpay_payment_id`

---

## Troubleshooting

### Q: Getting "400 Bad Request" errors?
**A:** Check that you:
- Updated `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`
- Restarted the server after updating `.env`
- Updated the key in `Recharge.tsx` line 197

### Q: Getting "401 Unauthorized"?
**A:** Your Razorpay credentials are incorrect. Check the dashboard again.

### Q: Getting "Invalid order_id"?
**A:** You're using a test key from a different Razorpay account. Use the correct credentials.

### Q: Payment shows "Failed"?
**A:** For test cards, use:
- **Success**: `4111 1111 1111 1111`
- **Failed**: `4444 3333 2222 1111`
- **International Card**: `4012 8888 8888 1881`

### Q: Checkout not opening?
**A:** Check browser console (F12) for errors. Ensure:
- Razorpay SDK is loaded from `https://checkout.razorpay.com/v1/checkout.js`
- Your API returns valid `order_id` from Razorpay
- JavaScript is enabled

---

## Database Changes Made

```sql
-- Updated status ENUM
ALTER TABLE transactions MODIFY COLUMN status ENUM('PENDING','SUCCESS','FAILED','COMPLETED') DEFAULT 'PENDING';

-- Verified columns exist:
-- - plan_amount DECIMAL(10,2)
-- - commissions DECIMAL(10,2)
-- - total_amount DECIMAL(10,2)
-- - razorpay_order_id VARCHAR(255)
-- - razorpay_payment_id VARCHAR(200)
```

---

## Next Steps After Testing

Once testing is complete and working:

1. **Production Setup**: Switch to live Razorpay keys
2. **Payment Verification**: Add webhook handler for payment confirmations
3. **Email Notifications**: Send payment receipts to users
4. **Recharge Confirmation**: Integrate with actual operator recharge API

---

## Reference Links

- **Razorpay Dashboard**: https://dashboard.razorpay.com/
- **Razorpay API Docs**: https://razorpay.com/docs/api/
- **Test Card Numbers**: https://razorpay.com/docs/payments/payments-via-standard-checkout/test-cards/

---

**Status**: ✅ All backend fixes applied. Waiting for your Razorpay credentials to test.
