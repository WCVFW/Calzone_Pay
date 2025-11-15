import React, { useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiUpload, FiCheckCircle } from "react-icons/fi";

export default function Kyc() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [pan, setPan] = useState("");
  const [panFile, setPanFile] = useState<File | null>(null);
  const [address, setAddress] = useState("");
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    setter(file || null);
  };

  const nextStep = () => {
    if (step === 1 && (!aadhaar || !aadhaarFile)) {
      return Swal.fire("Missing Info", "Please provide Aadhaar number and file.", "warning");
    }
    if (step === 2) {
      if (!pan || !panFile) {
        return Swal.fire("Missing Info", "Please provide PAN number and file.", "warning");
      }
      // Client-side validation for PAN format
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(pan)) {
        return Swal.fire("Invalid Format", "Please enter a valid PAN number format (e.g., ABCDE1234F).", "error");
      }
    }
    setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) {
      Swal.fire("Login Required", "Please login to continue.", "warning");
      return navigate("/login");
    }
    if (!address || !addressFile || !isConfirmed) {
      Swal.fire("Incomplete", "Please fill all details and confirm.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("aadhaar", aadhaar);
    formData.append("aadhaarFile", aadhaarFile!);
    formData.append("pan", pan);
    formData.append("panFile", panFile!);
    formData.append("address", address);
    formData.append("addressFile", addressFile!);

    setIsSubmitting(true);
    try {
      await api.post("/kyc/submit-all", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("Submitted!", "Your KYC has been submitted successfully.", "success");
      navigate("/");
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err?.response?.data?.message || "Submission failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to bottom, #f5f3ff, #ffffff)",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "550px",
          backgroundColor: "#ffffff",
          padding: "32px",
          borderRadius: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          border: "1px solid #f0f0f0",
        }}
      >
        {/* Step Indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "30px",
          }}
        >
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ textAlign: "center", flex: 1 }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  margin: "0 auto",
                  borderRadius: "50%",
                  backgroundColor: s <= step ? "#7c3aed" : "#e5e7eb",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                {s < step ? <FiCheckCircle /> : s}
              </div>
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: s <= step ? "#7c3aed" : "#9ca3af",
                }}
              >
                {s === 1 ? "Aadhaar" : s === 2 ? "PAN" : "Address"}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Aadhaar Step */}
          {step === 1 && (
            <>
              <h3 style={{ textAlign: "center", color: "#6d28d9", fontWeight: 700 }}>Step 1: Aadhaar</h3>
              <div>
                <label style={{ fontWeight: 500, color: "#374151" }}>Aadhaar Number</label>
                <input
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  placeholder="Enter Aadhaar number"
                  maxLength={12}
                  style={{
                    width: "100%",
                    border: "1px solid #d1d5db",
                    borderRadius: "12px",
                    padding: "12px",
                    marginTop: "6px",
                    outline: "none",
                  }}
                />
              </div>
              <label
                style={{
                  border: "2px dashed #c4b5fd",
                  borderRadius: "12px",
                  padding: "24px",
                  textAlign: "center",
                  color: "#6b7280",
                  cursor: "pointer",
                }}
              >
                <FiUpload size={20} /> Upload Aadhaar
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, setAadhaarFile)}
                  style={{ display: "none" }}
                />
              </label>
              {aadhaarFile && (
                <p style={{ fontSize: "13px", color: "#4b5563" }}>{aadhaarFile.name}</p>
              )}
            </>
          )}

          {/* PAN Step */}
          {step === 2 && (
            <>
              <h3 style={{ textAlign: "center", color: "#6d28d9", fontWeight: 700 }}>Step 2: PAN</h3>
              <div>
                <label style={{ fontWeight: 500, color: "#374151" }}>PAN Number</label>
                <input
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder="Enter PAN number"
                  maxLength={10}
                  style={{
                    width: "100%",
                    border: "1px solid #d1d5db",
                    borderRadius: "12px",
                    padding: "12px",
                    marginTop: "6px",
                    outline: "none",
                  }}
                />
              </div>
              <label
                style={{
                  border: "2px dashed #c4b5fd",
                  borderRadius: "12px",
                  padding: "24px",
                  textAlign: "center",
                  color: "#6b7280",
                  cursor: "pointer",
                }}
              >
                <FiUpload size={20} /> Upload PAN
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, setPanFile)}
                  style={{ display: "none" }}
                />
              </label>
              {panFile && (
                <p style={{ fontSize: "13px", color: "#4b5563" }}>{panFile.name}</p>
              )}
            </>
          )}

          {/* Address Step */}
          {step === 3 && (
            <>
              <h3 style={{ textAlign: "center", color: "#6d28d9", fontWeight: 700 }}>Step 3: Address</h3>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter full address"
                rows={4}
                style={{
                  width: "100%",
                  border: "1px solid #d1d5db",
                  borderRadius: "12px",
                  padding: "12px",
                  resize: "none",
                  outline: "none",
                }}
              />
              <label
                style={{
                  border: "2px dashed #c4b5fd",
                  borderRadius: "12px",
                  padding: "24px",
                  textAlign: "center",
                  color: "#6b7280",
                  cursor: "pointer",
                }}
              >
                <FiUpload size={20} /> Upload Address Proof
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, setAddressFile)}
                  style={{ display: "none" }}
                />
              </label>
              {addressFile && (
                <p style={{ fontSize: "13px", color: "#4b5563" }}>{addressFile.name}</p>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <span style={{ fontSize: "13px", color: "#4b5563" }}>
                  I confirm that the uploaded documents are valid.
                </span>
              </div>
            </>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                style={{
                  backgroundColor: "#e5e7eb",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Back
              </button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                style={{
                  backgroundColor: "#7c3aed",
                  color: "#fff",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: isSubmitting ? "#9ca3af" : "#7c3aed",
                  color: "#fff",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "10px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontWeight: 600,
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit KYC"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
