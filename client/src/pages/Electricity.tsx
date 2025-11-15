import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// --- Custom Hook for Scroll Animations ---
const useAnimateOnScroll = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); }
    }, options);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);
  return [ref, isVisible] as const;
};

// --- Helper Component for Inline Styles ---
const PageStyles = () => (
  <style>
    {`
      .page-header-section {
        background: linear-gradient(to right, #6a11cb 0%, #2575fc 100%);
        color: white;
        padding: 60px 0;
        text-align: center;
      }
      .form-section {
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        padding: 40px;
        margin-top: -50px;
        position: relative;
        z-index: 2;
      }
      .faq-section {
        padding: 80px 0;
        background-color: #f8f9fa;
      }
      .accordion-item {
        border: 1px solid #dee2e6;
        border-radius: 8px !important;
        margin-bottom: 1rem;
        overflow: hidden;
      }
      .accordion-button {
        font-weight: 600;
      }
      .accordion-button:not(.collapsed) {
        color: #E15D67;
        background-color: #fff0f1;
        box-shadow: none;
      }
      /* Scroll Animation */
      .animate-on-scroll { opacity: 0; transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
      .fade-in-up { transform: translateY(50px); }
      .is-visible { opacity: 1; transform: translate(0, 0); }
    `}
  </style>
);

const ElectricityPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [faqRef, faqVisible] = useAnimateOnScroll({ threshold: 0.2 });

  const faqData = [
    { q: "How do I find my consumer number?", a: "Your consumer number (or Customer ID/Account Number) is printed on your physical electricity bill. It's usually located at the top section." },
    { q: "How long does it take for the payment to reflect?", a: "Payments are usually reflected in your electricity board's records within 24-48 hours. You will receive an instant confirmation from us." },
    { q: "Can I get a receipt for my payment?", a: "Yes, once your payment is successful, a digital receipt will be generated which you can download from your transaction history." },
    { q: "What if I enter the wrong consumer number?", a: "It is crucial to enter the correct consumer number. Payments made to incorrect numbers are non-refundable. Please double-check before proceeding." },
  ];

  return (
    <>
      <PageStyles />

      {/* --- Page Header --- */}
      <section className="page-header-section">
        <div className="container">
          <h1 className="display-5 fw-bold">Electricity Bill Payment</h1>
          <p className="lead">Pay your electricity bills online instantly and securely.</p>
        </div>
      </section>

      <div className="container">
        {/* --- Bill Payment Form --- */}
        <section className="form-section">
          <h3 className="text-center mb-4">Pay Your Bill</h3>
          <form>
            <div className="row g-3">
              {/* State */}
              <div className="col-md-6">
                <label htmlFor="state" className="form-label">State</label>
                <select id="state" className="form-select form-select-lg">
                  <option selected>Select your state...</option>
                  <option value="MH">Maharashtra</option>
                  <option value="DL">Delhi</option>
                  <option value="KA">Karnataka</option>
                  {/* Add other states */}
                </select>
              </div>

              {/* Electricity Board */}
              <div className="col-md-6">
                <label htmlFor="board" className="form-label">Electricity Board</label>
                <select id="board" className="form-select form-select-lg">
                  <option selected>Select your board...</option>
                  <option value="MSEDCL">Mahavitaran (MSEDCL)</option>
                  <option value="TATA">Tata Power</option>
                  <option value="BESCOM">BESCOM</option>
                  {/* Add other boards */}
                </select>
              </div>

              {/* Consumer Number */}
              <div className="col-12">
                <label htmlFor="consumerNumber" className="form-label">Consumer Number / Account ID</label>
                <input type="text" className="form-control form-control-lg" id="consumerNumber" placeholder="Enter your consumer number" />
              </div>

              {/* Submit Button */}
              <div className="col-12 text-center mt-4">
                <button type="submit" className="btn btn-primary cmn__btn btn-lg">
                  Fetch Bill
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>

      {/* --- FAQ Section --- */}
      <section className="faq-section" ref={faqRef}>
        <div className="container">
          <div className="section-header text-center">
            <h2 className={`animate-on-scroll fade-in-up ${faqVisible ? "is-visible" : ""}`}>
              Frequently Asked Questions
            </h2>
          </div>
          <div className={`row justify-content-center animate-on-scroll fade-in-up ${faqVisible ? "is-visible" : ""}`} style={{ transitionDelay: "0.2s" }}>
            <div className="col-lg-8">
              <div className="accordion">
                {faqData.map((faq, index) => (
                  <div className="accordion-item" key={index}>
                    <h2 className="accordion-header">
                      <button
                        className={`accordion-button ${activeFaq !== index ? 'collapsed' : ''}`}
                        type="button"
                        onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                      >
                        {faq.q}
                      </button>
                    </h2>
                    <div className={`accordion-collapse collapse ${activeFaq === index ? 'show' : ''}`}>
                      <div className="accordion-body">{faq.a}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ElectricityPage;
