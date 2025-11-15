import React, { useState } from "react";
import ServiceTabs from "../components/ServiceTabs";

const PageStyles = () => (
  <style>
    {`
      .page-wrapper { background-color: #f8f9fa; }
      .page-header-section { background: linear-gradient(to right, #8e2de2, #4a00e0); color: white; padding: 60px 0; text-align: center; }
      .form-section { 
        background-color: #ffffff; 
        border-radius: 12px; 
        box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
        padding: 40px; 
        margin-top: -60px; 
        position: relative; 
        z-index: 2; 
        border: 1px solid #e9ecef;
      }
      .faq-section { padding: 80px 0; }
      .accordion-item { border: 1px solid #dee2e6; border-radius: 8px !important; margin-bottom: 1rem; overflow: hidden; transition: box-shadow 0.2s ease-in-out; }
      .accordion-item:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.07); }
      .accordion-button { font-weight: 600; }
      .accordion-button:not(.collapsed) { color: #E15D67; background-color: #fff0f1; box-shadow: none; }
    `}
  </style>
);

const LandlinePage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const faqData = [
    { q: "What details are needed for landline bill payment?", a: "You will need your landline number including the STD code, and sometimes an account number." },
    { q: "Can I pay my postpaid mobile bill here?", a: "This section is for landline bills. Please use the 'Mobile' section for postpaid mobile bill payments." },
  ];

  return (
    <div className="page-wrapper">
      <PageStyles />
      <div className="container py-4">
        <ServiceTabs />
      </div>

      <main>
        <section className="page-header-section">
          <div className="container">
            <h1 className="display-5 fw-bold">Landline Bill Payment</h1>
            <p className="lead">Pay your landline bills for any operator across India.</p>
          </div>
        </section>

        <div className="container">
          <section className="form-section">
            <h3 className="text-center mb-4 fw-bold">Pay Your Landline Bill</h3>
            <form>
              <div className="row g-4 justify-content-center">
                <div className="col-lg-8">
                  <div className="mb-3">
                    <label htmlFor="operator" className="form-label">Operator</label>
                    <select id="operator" className="form-select form-select-lg">
                      <option selected>Select your operator...</option>
                      <option value="BSNL">BSNL Landline</option>
                      <option value="MTNL">MTNL Landline</option>
                      <option value="Airtel">Airtel Landline</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="landlineNumber" className="form-label">Landline Number (with STD code)</label>
                    <input type="text" className="form-control form-control-lg" id="landlineNumber" placeholder="e.g., 01123456789" />
                  </div>
                  <div className="text-center">
                    <button type="submit" className="btn btn-primary cmn__btn btn-lg px-5">Fetch Bill</button>
                  </div>
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
                        <button className={`accordion-button ${activeFaq !== index ? 'collapsed' : ''}`} type="button" onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
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
      </main>
    </div>
  );
};

export default LandlinePage;