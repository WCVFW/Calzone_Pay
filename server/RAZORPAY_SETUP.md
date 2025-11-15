# Razorpay Integration Setup

## Get Your Razorpay Credentials

1. **Sign up/Log in** to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. **Navigate** to "Settings" → "API Keys"
3. **Copy** your Test Key ID (starts with `rzp_test_`)
4. **Copy** your Test Key Secret

## Configure Backend

Add to `server/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_YOUR_TEST_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_TEST_KEY_SECRET
```

Example:
```env
RAZORPAY_KEY_ID=rzp_test_1Oy7iUUz8LjBh9
RAZORPAY_KEY_SECRET=abcdefghijklmnopqrst12345
```

## Configure Frontend

Update the Razorpay key in `client/src/pages/Recharge.tsx` line ~195:

```typescript
key: "rzp_test_YOUR_KEY_ID", // Replace with your actual Razorpay test key
```

Or better: set as environment variable `VITE_RAZORPAY_KEY_ID` and use:

```typescript
key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_default",
```

## Test the Integration

1. Start server: `cd server && node server.js`
2. Start client: `cd client && npm run dev`
3. Go to Recharge page
4. Enter test mobile number (e.g., 8489529876)
5. Click "Check Plans"
6. Select a plan and click "Pay"
7. Razorpay checkout should open
8. Use test card: **4111 1111 1111 1111** with any future expiry and any CVV
9. Complete the payment
10. Check `transactions` table in database to see the order

## Test Cards (Razorpay)

- **Success**: 4111 1111 1111 1111
- **Failure**: 4444 3333 2222 1111
- Expiry: Any future date
- CVV: Any 3 digits

## Troubleshooting

- **400 Bad Request**: Invalid key_id or key_secret. Check your credentials in `.env`
- **401 Unauthorized**: Incorrect secret. Verify both key_id AND key_secret match
- **Payment not showing in dashboard**: Check that `RAZORPAY_KEY_ID` matches what's in Razorpay dashboard

## Production Deployment

When going live:
1. Get Live Key ID and Live Key Secret from Razorpay
2. Update `.env` with live credentials
3. Update frontend key to use live key
4. Remove test cards from accepted payment methods
