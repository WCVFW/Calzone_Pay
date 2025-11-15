import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import fetch from "node-fetch";
import pool from "./db.js";
import { protect } from "./authMiddleware.js";

const router = express.Router();

// --- Razorpay Setup ---
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET || !RAZORPAY_WEBHOOK_SECRET) {
  throw new Error("Razorpay key ID, key secret, and webhook secret are required. Please check your .env file.");
}


const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// POST /api/payment/razorpay-order
router.post("/razorpay-order", protect, async (req, res) => {
  const { amount, mobile_number, operator, plan_amount, employee_commission, company_commission, agent_commission } = req.body;
  if (!amount || !mobile_number || !operator) {
    return res.status(400).json({ message: "Missing required payment details" });
  }

  try {
    const conn = await pool.getConnection();
    const userId = req.user.id; // Correctly get user ID from protect middleware

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100), // Amount in paise
      currency: "INR",
      receipt: `receipt_${userId}_${Date.now()}`,
    });

    await conn.execute(
      "INSERT INTO transactions (user_id, mobile_number, operator, plan_amount, employee_commission, company_commission, agent_commission, total_amount, status, razorpay_order_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [userId, mobile_number, operator, plan_amount, employee_commission, company_commission, agent_commission, amount, "PENDING", razorpayOrder.id]
    );
    conn.release();

    res.json({
      order_id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
    });
  } catch (err) {
    console.error("Payment order error:", err.message);
    res.status(500).json({ message: "Failed to create payment order", error: err.message });
  }
});

// POST /api/payment/verify
router.post("/verify", protect, async (req, res) => {  
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, mobile_number, operator_code, plan_amount } = req.body;
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ message: "Missing payment verification details" });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const userId = req.user.id;

    // --- CRITICAL SECURITY FIX: Verify Razorpay Signature ---
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed: Invalid signature." });
    }

    await conn.execute(
      "UPDATE transactions SET razorpay_payment_id = ?, razorpay_signature = ? WHERE razorpay_order_id = ? AND user_id = ?",
      [razorpay_payment_id, razorpay_signature, razorpay_order_id, userId]
    );

    const responsePayload = {
      success: true,
      message: "Payment verified successfully",
      recharge_call: null,
    };

    // --- Call External Recharge API ---
    const EZYTM_API_TOKEN = process.env.EZYTM_API_TOKEN || "";
    if (!EZYTM_API_TOKEN) {
      console.warn("EZYTM_API_TOKEN not configured; skipping external recharge call.");
    } else {
      try {
        const rechargeUrl = `https://newapi.ezytm.in/Service/Recharge2?ApiToken=${encodeURIComponent(
          EZYTM_API_TOKEN
        )}&MobileNo=${encodeURIComponent(mobile_number)}&Amount=${encodeURIComponent(plan_amount)}&OpId=${encodeURIComponent(
          operator_code
        )}&RefTxnId=${encodeURIComponent(razorpay_payment_id)}`;

        console.log("Calling external recharge API:", rechargeUrl);
        const rechargeResp = await fetch(rechargeUrl);
        const rechargeText = await rechargeResp.text();

        let rechargeJson = null;
        try {
          rechargeJson = JSON.parse(rechargeText);
        } catch (e) {
          // Ignore parse error, use text
        }

        responsePayload.recharge_call = {
          ok: rechargeResp.ok,
          status: rechargeResp.status,
          body: rechargeJson || rechargeText,
        };

        await conn.execute(
          "UPDATE transactions SET recharge_status = ?, recharge_response = ? WHERE razorpay_order_id = ?",
          [rechargeResp.ok ? "SUCCESS" : "FAILED", rechargeText, razorpay_order_id]
        );
      } catch (reErr) {
        console.error("External recharge API call failed:", reErr);
        responsePayload.recharge_call = { ok: false, error: reErr.message };
      }
    }

    res.json(responsePayload);
  } catch (err) {
    console.error("Payment verification error:", err.message);
    res.status(500).json({ message: "Payment verification failed", error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/payment/webhook - Listens for automated Razorpay notifications
router.post("/webhook", async (req, res) => {
  const secret = RAZORPAY_WEBHOOK_SECRET;
  console.log("Received Razorpay webhook:", req.body);

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest === req.headers["x-razorpay-signature"]) {
    console.log("Webhook signature verified successfully.");

    const { event, payload } = req.body;

    // We only care about the 'payment.captured' event
    if (event === "payment.captured") {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;

      if (payment.status === "captured") {
        let conn;
        try {
          conn = await pool.getConnection();
          // Update the transaction status to COMPLETED
          await conn.execute(
            "UPDATE transactions SET status = 'COMPLETED' WHERE razorpay_order_id = ?",
            [orderId]
          );
          console.log(`Transaction status for order ${orderId} updated to COMPLETED.`);
        } catch (dbErr) {
          console.error("Webhook DB update error:", dbErr.message);
        } finally {
          if (conn) conn.release();
        }
      }
    }
    res.json({ status: "ok" });
  } else {
    console.error("Webhook signature verification failed.");
    res.status(400).send("Invalid signature");
  }
});

export default router;