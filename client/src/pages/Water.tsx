import React, { useState } from "react";
import ServiceTabs from "../components/ServiceTabs";

const PageStyles = () => (
  <style>{`
    .page-header-section { background: linear-gradient(to right, #00c6ff, #0072ff); color: white; padding: 60px 0; text-align: center; }
    .form-section { background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); padding: 40px; margin-top: -50px; position: relative; z-index: 2; }
    .faq-section { padding: 80px 0; background-color: #f8f9fa; }
    .accordion-item { border: 1px solid #dee2e6; border-radius: 8px !important; margin-bottom: 1rem; overflow: hidden; }
    .accordion-button { font-weight: 600; }
    .accordion-button:not(.collapsed) { color: #E15D67; background-color: #fff0f1; box-shadow: none; }
  `}</style>
);

const WaterPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const faqData = [
    { q: "Where can I find my Consumer ID/K Number?", a: "Your Consumer ID or K Number is printed on your monthly water bill, usually near the top." },
    { q: "Can I pay a partial amount of the bill?", a: "This depends on the policy of your water board. Most boards require the full bill amount to be paid." },
  ];

  return (
    <>
      <PageStyles />
      <ServiceTabs/>
      <section className="page-header-section">
        <div className="container">
          <h1 className="display-5 fw-bold">Water Bill Payment</h1>
          <p className="lead">Pay your water bills online with ease and convenience.</p>
        </div>
      </section>

      <div className="container">
        <section className="form-section">
          <h3 className="text-center mb-4">Pay Your Water Bill</h3>
          <form>
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="board" className="form-label">Water Board</label>
                <select id="board" className="form-select form-select-lg">
                  <option selected>Select your water board...</option>
                  <option value="DJB">Delhi Jal Board (DJB)</option>
                  <option value="BWSSB">Bangalore Water Supply and Sewerage Board (BWSSB)</option>
                  <option value="HMWSSB">Hyderabad Metropolitan Water Supply and Sewerage Board (HMWSSB)</option>
                </select>
              </div>
              <div className="col-12">
                <label htmlFor="consumerId" className="form-label">Consumer ID / K Number</label>
                <input type="text" className="form-control form-control-lg" id="consumerId" placeholder="Enter your Consumer ID" />
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

export default WaterPage;

