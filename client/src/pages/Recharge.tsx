import React, { useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import WorkingSectionThree from "./WorkingSectionThree";
import ServiceTabs from "../components/ServiceTabs";

const RechargePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operatorName, setOperatorName] = useState<string | null>(null);
  const [operatorCode, setOperatorCode] = useState<string | null>(null); // Store operator code
  const [mobileNumber, setMobileNumber] = useState("");

  const { auth } = useAuth();
  const navigate = useNavigate();

  // 🔹 Fetch operator + plans
  const handleCheckPlans = async () => {
    setLoading(true);
    setError(null);

    if (mobileNumber.length !== 10 || isNaN(Number(mobileNumber))) {
      setLoading(false);
      Swal.fire(
        "Invalid Input",
        "Please enter a valid 10-digit mobile number.",
        "error"
      );
      return;
    }

    try {
      // 1️⃣ Fetch operator & circle
      const operatorResp = await api.get(`/operator/${mobileNumber}`);
      const operatorData = operatorResp.data;

      // Check for the correct fields from the backend: operatorName, operatorCode, circleCode
      if (
        !operatorData ||
        !operatorData.name || // Corrected from operatorName to name
        !operatorData.operatorCode ||
        !operatorData.circleCode
      ) {
        setError(
          "Operator information incomplete. Please try a different number."
        );
        setPlans([]);
        setShowModal(true);
        return;
      }

      // Store the operator name for display purposes
      setOperatorName(operatorData.name); // Corrected from operatorName to name
      setOperatorCode(operatorData.operatorCode); // Store the operator code

      // 2️⃣ Fetch recharge plans using the operatorCode and circleCode
      await fetchPlans(operatorData.operatorCode, operatorData.circleCode);

      // Show the modal only after plans are successfully fetched
      setShowModal(true);
    } catch (err: any) {
      console.error("Error fetching plans:", err);
      const errorMessage =
        err.response?.data?.message || "Operator not found for this number.";
      setError(errorMessage);
      setPlans([]);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Helper to fetch and normalize plans given operator & circle codes
  const fetchPlans = async (operatorCode: string, circleCode: string) => {
    setLoading(true);
    setError(null);
    try {
      const plansResp = await api.get(`/plans/${operatorCode}/${circleCode}`);
      const respData = plansResp.data;
      console.log(respData);

      if (!respData || (typeof respData === "object" && "error" in respData)) {
        const msg = respData.error || "No plans found";
        setError(msg);
        setPlans([]);
        return;
      }

      // --- START OF CORRECTION ---
      // 'respData' is the object from your API, e.g., { "Annual Plans": [...], "Data Packs": [...] }

      // 1. Get all the arrays of plans from the object
      const arraysOfPlans = Object.values(respData);

      // 2. Flatten them into one single array. This is your 'rawPlans'.
      const rawPlans = arraysOfPlans.flat();
      // --- END OF CORRECTION ---

      // Now, 'rawPlans' is defined and this .map() will work
      const fetchedPlans = rawPlans.map((plan: any, i: number) => ({
        id: i + 1,

        // Use ?? to find the first non-null/undefined value.
        // The '|| 0' at the end safely converts NaN (from bad strings) to 0.
        amount:
          Number(plan.rs ?? plan.Amount ?? plan.amount ?? plan.Pr ?? 0) || 0,

        validity: plan.validity ?? plan.Validity ?? "N/A",

        data:
          plan.desc ??
          plan.PlanName ??
          plan.Plan ??
          JSON.stringify(plan).slice(0, 80),
      }));

      if (fetchedPlans.length === 0)
        setError("No plans found for this operator and circle.");

      setPlans(fetchedPlans);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "No plans available for this operator.";
      setError(errorMessage);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Recharge
  const handleRecharge = async (plan: any) => {
    if (!auth.user) {
      Swal.fire({
        title: "Login Required",
        text: "Please login first to proceed with the recharge.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Go to Login",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login", { state: { from: { pathname: "/recharge" } } });
        }
      });
      return;
    }

    if (!auth.user.is_active) {
      Swal.fire({
        title: "KYC Pending",
        text: "Your KYC is pending approval. Complete your KYC to enable recharges.",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Complete KYC",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) navigate("/kyc");
      });
      return;
    }

    // 💰 Calculate commissions
    const employeeCommission = plan.amount * 0.02; // 2%
    const companyCommission = plan.amount * 0.015; // 1.5%
    const agentCommission = plan.amount * 0.01; // 1%
    const totalCommissions =
      employeeCommission + companyCommission + agentCommission;
    const totalAmount = plan.amount + totalCommissions;

    Swal.fire({
      title: `Confirm Recharge for ${mobileNumber}`,
      html: `
        <div style="text-align: left; padding: 0 1rem; font-size: 0.9rem;">
          <div style="display: flex; justify-content: space-between; padding: 5px 0;"><span>Plan Amount:</span> <strong>₹${plan.amount.toFixed(
            2
          )}</strong></div>
          <hr style="margin: 5px 0;"/>
          <div style="padding: 5px 0;"><strong>Commissions:</strong></div>
          <ul style="list-style: none; padding-left: 1rem; margin: 0;">
            <li style="display: flex; justify-content: space-between;"><span>Employee (2%):</span> <span>₹${employeeCommission.toFixed(
              2
            )}</span></li>
            <li style="display: flex; justify-content: space-between;"><span>Company (1.5%):</span> <span>₹${companyCommission.toFixed(
              2
            )}</span></li>
            <li style="display: flex; justify-content: space-between;"><span>Agent (1%):</span> <span>₹${agentCommission.toFixed(
              2
            )}</span></li>
          </ul>
          <hr style="margin: 5px 0;"/>
          <div style="display: flex; justify-content: space-between; padding: 5px 0;"><span>Total Commissions:</span> <strong>₹${totalCommissions.toFixed(
            2
          )}</strong></div>
          <hr style="margin: 10px 0; border-style: dashed;"/>
          <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: bold; padding: 5px 0;"><span>Total Payable:</span> <span>₹${totalAmount.toFixed(
            2
          )}</span></div>
        </div>
      `,
      icon: "question",
      confirmButtonText: "Pay Now",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await initiateRazorpayPayment(
          plan,
          totalAmount,
          employeeCommission,
          companyCommission,
          agentCommission
        );
      }
    });
  };

  // 🔹 Razorpay Integration
  const initiateRazorpayPayment = async (
    plan: any,
    totalAmount: number,
    empComm: number,
    compComm: number,
    agentComm: number
  ) => {
    try {
      setLoading(true);

      const orderRes = await api.post("/payment/razorpay-order", {
        amount: totalAmount,
        mobile_number: mobileNumber,
        operator: operatorName || "Unknown Operator",
        plan_amount: plan.amount,
        employee_commission: empComm,
        company_commission: compComm,
        agent_commission: agentComm,
      });

      const { order_id, currency, receipt } = orderRes.data;

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => {
        const options = {
          key: "rzp_test_v9bZpQvmrVnUzZ", // Replace with your Razorpay key
          order_id: order_id,
          amount: totalAmount * 100,
          currency: currency,
          name: "Recharge Service",
          description: `Mobile Recharge - ${mobileNumber}`,
          receipt: receipt,
          handler: async (response: any) => {
            try {
              const verifyRes = await api.post("/payment/verify", {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature, // Send the signature
                mobile_number: mobileNumber,
                operator_code: operatorCode, // Pass the operator code to the backend
                operator: operatorName || "Unknown Operator",
                amount: totalAmount,
                plan_amount: plan.amount,
                employee_commission: empComm,
                company_commission: compComm,
                agent_commission: agentComm,
              });

              // Backend will attempt to call external recharge API and return its result in `recharge_call`
              const rechargeCall = verifyRes.data?.recharge_call;

              if (rechargeCall) {
                if (rechargeCall.ok) {
                  Swal.fire(
                    "Success!",
                    "Payment succeeded and recharge API returned success.",
                    "success"
                  );
                } else {
                  const body =
                    typeof rechargeCall.body === "string"
                      ? rechargeCall.body
                      : JSON.stringify(rechargeCall.body);
                  Swal.fire({
                    title: "Payment received — Recharge failed/unknown",
                    html: `Payment was successful, but operator recharge returned status ${rechargeCall.status}.<br/><pre style=\"white-space:pre-wrap;max-height:200px;overflow:auto;\">${body}</pre>`,
                    icon: "warning",
                    confirmButtonText: "OK",
                  });
                }
              } else {
                // No recharge_call info — treat payment as successful but operator recharge not attempted
                Swal.fire(
                  "Success!",
                  "Payment succeeded. Operator recharge was not attempted.",
                  "info"
                );
              }

              setShowModal(false);
            } catch {
              Swal.fire("Error", "Payment verification failed", "error");
            }
          },
          prefill: {
            email: auth.user?.email || "",
            contact: mobileNumber,
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };

      document.body.appendChild(script);
    } catch (err) {
      console.error("Payment initiation error:", err);
      Swal.fire("Error", "Failed to initiate payment", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Filter Plans
  const filteredPlans = plans.filter(
    (plan) =>
      plan.amount.toString().includes(searchTerm.toLowerCase()) ||
      plan.data.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-5">
      {/* ---------- Service Tabs ---------- */}
      <ServiceTabs />

      {/* ---------- Recharge Form ---------- */}
      <div className="row g-3 justify-content-center mt-3">
        <div className="col-xxl-10 col-xl-10 col-lg-10 col-md-12">
          <div className="recharge__paymentbox shadow p-4 border rounded bg-white">
            <div className="mobile__recharge text-center">
              <h4
                className="text-dark mb-4"
                style={{ fontSize: "20px", fontWeight: "600" }}
              >
                Mobile Recharge or Bill Payment
              </h4>

              <div className="prepaid__option d-flex justify-content-center gap-4 mb-4">
                <div className="form-check d-flex align-items-center">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="flexRadioDefault"
                    id="prepaidRadio"
                    defaultChecked
                  />
                  <label
                    className="form-check-label ms-2 fw-medium"
                    htmlFor="prepaidRadio"
                    style={{ fontSize: "14px" }}
                  >
                    Prepaid
                  </label>
                </div>
                <div className="form-check d-flex align-items-center">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="flexRadioDefault"
                    id="postpaidRadio"
                  />
                  <label
                    className="form-check-label ms-2 fw-medium"
                    htmlFor="postpaidRadio"
                    style={{ fontSize: "14px" }}
                  >
                    Postpaid
                  </label>
                </div>
              </div>

              <form
                id="rechargeForm"
                onSubmit={(e) => e.preventDefault()}
                className="pb-2"
              >
                <div className="row g-3 align-items-center">
                  <div className="col-lg-9 col-md-9 col-sm-12">
                    <input
                      type="text"
                      id="mobileNumber"
                      value={mobileNumber}
                      onChange={(e) =>
                        setMobileNumber(
                          e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      className="form-control"
                      placeholder="Enter Mobile Number(10 digits)"
                      style={{
                        fontSize: "16px",
                        padding: "16px 14px",
                        height: "60px",
                        width: "250px",
                        borderRadius: "6px",
                      }}
                    />
                  </div>
                  <div className="col-lg-3 col-md-3 col-sm-12">
                    <button
                      id="checkPlansBtn"
                      className="btn btn-primary cmn__btn w-100 fw-semibold"
                      style={{
                        fontSize: "13px",
                        padding: "14px 16px",
                        height: "55px",
                      }}
                      onClick={handleCheckPlans}
                    >
                      {loading ? "Loading..." : "Check"}
                    </button>
                  </div>
                </div>
              </form>

              {loading && (
                <div className="text-center text-primary mt-4">
                  <div className="spinner-border" role="status"></div>
                  <div className="mt-3" style={{ fontSize: "14px" }}>
                    Fetching Operator and Plans...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-xxl-2 col-xl-2 col-lg-2 col-md-12 d-flex align-items-start">
          <div className="payment__sponsor border p-3 rounded text-center bg-light w-100">
            <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
              Advertisement / Offers Here
            </p>
          </div>
        </div>
      </div>

      {/* ---------- Plans Modal ---------- */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Available Recharge Plans</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="p-3 border-bottom bg-light">
                <div
                  className="search-wrapper position-relative mx-auto"
                  style={{ maxWidth: "500px" }}
                >
                  <input
                    type="text"
                    className="form-control form-control-lg shadow-sm"
                    placeholder="Search plans by Amount, Data, or Validity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-body modal-body-scroll">
                {error && (
                  <div className="text-center mb-3">
                    <p className="text-danger mb-3">{error}</p>
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => {
                          // retry operator lookup
                          setShowModal(false);
                          (
                            document.getElementById(
                              "checkPlansBtn"
                            ) as HTMLButtonElement
                          )?.click();
                        }}
                      >
                        Retry
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setShowModal(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {!loading && plans.length > 0 ? (
                  <div id="plansCardsContainer" className="p-3">
                    {filteredPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="border p-3 mb-2 rounded shadow-sm bg-white d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <h6 className="mb-1">₹{plan.amount}</h6>
                          <p className="mb-0 text-muted small">
                            {plan.data} | Validity: {plan.validity}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRecharge(plan)}
                          className={`btn btn-sm btn-success`}
                        >
                          Pay
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-danger">
                    {loading ? "Loading plans..." : "No plans available."}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <WorkingSectionThree />
    </div>
  );
};

export default RechargePage;
