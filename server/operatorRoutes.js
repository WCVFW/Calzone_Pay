import express from "express";
import fetch from "node-fetch"; // You might need to install this: npm install node-fetch

const router = express.Router();

// --- API Credentials for Recharge Plans ---
const API_USER_ID = process.env.API_USER_ID || "6659";
const API_PASSWORD = process.env.API_PASSWORD || "Prakash@1482";

// --- Helper: Safe Fetch ---
async function safeFetch(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("External API fetch failed:", response.status, response.statusText);
      return null;
    }
    return await response.json();
  } catch (err) {
    console.error("External API fetch error:", err);
    return null;
  }
}

// GET /api/plans/:operatorCode/:circleCode - Fetch Plans
// This more specific route must come BEFORE the generic /:mobileNumber route.
router.get("/plans/:operatorCode/:circleCode", async (req, res) => {
  const { operatorCode, circleCode } = req.params;

  const plansApiUrl = `https://planapi.in/api/Mobile/NewMobilePlans?apimember_id=${API_USER_ID}&api_password=${API_PASSWORD}&operatorcode=${operatorCode}&cricle=${circleCode}`;
  const data = await safeFetch(plansApiUrl);

  if (!data) {
    return res.status(502).json({ message: "Could not connect to the plans service." });
  }

  if (data.RDATA) {
    res.json(data.RDATA);
  } else {
    res.status(404).json({ message: "No plans found for this operator and circle." });
  }
});

// GET /api/operator/:mobileNumber - Fetch Operator
router.get("/operator/:mobileNumber", async (req, res) => {
  const { mobileNumber } = req.params;

  if (!/^\d{10}$/.test(mobileNumber)) {
    return res.status(400).json({ error: "Invalid 10-digit mobile number." });
  }

  const operatorApiUrl = `https://planapi.in/api/Mobile/OperatorFetchNew?ApiUserID=${API_USER_ID}&ApiPassword=${API_PASSWORD}&Mobileno=${mobileNumber}`;
  const data = await safeFetch(operatorApiUrl);

  if (!data) {
    return res.status(502).json({ message: "Could not connect to the operator service." });
  }

  // The API returns "OpCode" and "CircleCode" which are needed for the next step
  if (data.OpCode && data.CircleCode) {
    res.json({
      name: data.Operator, // Standardize to 'name'
      operatorCode: data.OpCode,
      circleCode: data.CircleCode,
    });
  } else {
    res.status(404).json({ message: data.Response || "Operator not found for this number." });
  }
});

export default router;