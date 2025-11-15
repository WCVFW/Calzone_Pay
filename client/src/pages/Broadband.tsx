import React, { useState } from "react";

const PageStyles = () => (
  <style>{`
    .page-header-section { background: linear-gradient(to right, #43e97b, #38f9d7); color: white; padding: 60px 0; text-align: center; }
    .form-section { background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); padding: 40px; margin-top: -50px; position: relative; z-index: 2; }
    .faq-section { padding: 80px 0; background-color: #f8f9fa; }
    .accordion-item { border: 1px solid #dee2e6; border-radius: 8px !important; margin-bottom: 1rem; overflow: hidden; }
    .accordion-button { font-weight: 600; }
    .accordion-button:not(.collapsed) { color: #E15D67; background-color: #fff0f1; box-shadow: none; }
  `}</style>
);

const BroadbandPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const faqData = [
    { q: "What details are required for broadband bill payment?", a: "You typically need your landline number or a customer/account ID provided by your service provider." },
    { q: "Can I view my outstanding bill amount before paying?", a: "Yes, our 'Fetch Bill' feature connects to your provider to show you the current outstanding amount before you proceed with payment." },
  ];

  return (
    <>
      <PageStyles />
      <section className="page-header-section">
        <div className="container">
          <h1 className="display-5 fw-bold">Broadband Bill Payment</h1>
          <p className="lead">Pay your broadband and landline bills online hassle-free.</p>
        </div>
      </section>

      <div className="container">
        <section className="form-section">
          <h3 className="text-center mb-4">Pay Your Broadband Bill</h3>
          <form>
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="operator" className="form-label">Operator</label>
                <select id="operator" className="form-select form-select-lg">
                  <option selected>Select your provider...</option>
                  <option value="Airtel">Airtel Broadband</option>
                  <option value="Jio">JioFiber</option>
                  <option value="BSNL">BSNL Broadband</option>
                  <option value="ACT">ACT Fibernet</option>
                </select>
              </div>
              <div className="col-12">
                <label htmlFor="accountNumber" className="form-label">Telephone Number / Account ID</label>
                <input type="text" className="form-control form-control-lg" id="accountNumber" placeholder="Enter your number or ID" />
              </div>
              <div className="col-12 text-center mt-4">
                <button type="submit" className="btn btn-primary cmn__btn btn-lg">Fetch Bill</button>
              </div>
            </div>
          </form>
        </section>
      </div>

      <section className="faq-section">
        <div className="container">
          <div className="text-center mb-5"><h2>Frequently Asked Questions</h2></div>
          <div className="row justify-content-center">
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

export default BroadbandPage;

