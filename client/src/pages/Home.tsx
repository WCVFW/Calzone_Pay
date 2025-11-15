import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// Import the background image
import heroBgImage from './image/home-top.jpeg';
import homebottom from './image/home-bottom.jpeg';

// --- Helper Component for Inline Styles ---
const HomeStyles = () => (
  <style>
    {`
      /* --- Parallax Background Effect --- */
      .parallax-section {
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        background-attachment: fixed; /* This creates the parallax effect */
        min-height: 50vh;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
      }

      .hero-section {
        background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroBgImage});
        min-height: 80vh;
      }

      .parallax-divider {
        background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${homebottom});
      }
      
      .app-showcase-section {
        background-color: #f8f9fa;
      }

      /* --- Animation for elements fading in --- */
      .animate-on-scroll {
        opacity: 0;
        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
      }

      .fade-in-up {
        transform: translateY(50px);
      }
      .fade-in-left {
        transform: translateX(-50px);
      }
      .fade-in-right {
        transform: translateX(50px);
      }

      .is-visible {
        opacity: 1;
        transform: translate(0, 0);
      }
      
      /* Initial hero animation */
      @keyframes heroFadeIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0px);
        }
      }
      
      .hero-content h1, .hero-content p, .hero-content .cmn__btn {
        animation: heroFadeIn 1.5s ease-out forwards;
      }

      /* --- Feature Card Styling --- */
      .feature-card {
        background-color: #ffffff;
        border-radius: 10px;
        padding: 2rem;
        border-left: 5px solid rgb(76, 0, 130);
        border-bottom: 5px solid rgb(76, 0, 130);
        transition: transform 0.3s ease;
        margin-bottom: 1.5rem;
        height: 100%; /* Make cards in a row have equal height */
      }

      .feature-card:hover {
        transform: translateY(-10px);
      }

      .feature-card .icon {
        font-size: 3rem;
        color: rgb(76, 0, 130); /* Dark purple icon color */
        margin-bottom: 1rem;
      }

      /* --- How It Works Styling --- */
      .step-card {
        padding: 1.5rem;
      }
      .step-card .icon {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        display: inline-flex; /* Use flexbox for centering */
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        border: 2px solid rgb(76, 0, 130); /* Single line purple border */
      }

      .step-card .icon img {
        width: 60%; /* Zoom out the image even more */
        height: 60%; /* Zoom out the image even more */
        border-radius: 50%;
        object-fit: cover;
      }
    `}
  </style>
);

// --- Custom Hook for Scroll Animations ---
const useAnimateOnScroll = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);

  return [ref, isVisible] as const;
};

const Home: React.FC = () => {
  const [featuresRef, featuresVisible] = useAnimateOnScroll({ threshold: 0.2 });
  const [howItWorksRef, howItWorksVisible] = useAnimateOnScroll({ threshold: 0.3 });
  const [appShowcaseRef, appShowcaseVisible] = useAnimateOnScroll({ threshold: 0.3 });
  const [ctaRef, ctaVisible] = useAnimateOnScroll({ threshold: 0.5 });

  return (
    <>
      <HomeStyles />

      {/* --- Hero Section with Parallax Background --- */}
      <section className="parallax-section hero-section">
        <div className="container text-center hero-content">
          <h1 className="display-4 fw-bold mb-3">
            Seamless Payments, Limitless Possibilities
          </h1>
          <p className="lead fs-5 mb-4">
            Your one-stop solution for fast recharges, bill payments, and secure
            money transfers.
          </p>
          <Link to="/recharge" className="cmn__btn btn-lg">
            <i className="fas fa-bolt me-2"></i>
            Get Started
          </Link>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section className="py-5 bg-light px-3" ref={featuresRef}>
        <div className="container">
          <div className="text-center mb-5">
            <h3 className={`fw-bold animate-on-scroll fade-in-up ${featuresVisible ? "is-visible" : ""}`}>
              Everything You Need, All in One Place
            </h3>
            <p className="text-muted">
              Manage your finances with our comprehensive suite of services.
            </p>
          </div>
          <div className="row text-center">
            {/* Feature 1: Recharge */} 
            <div className={`col-lg-4 col-md-6 animate-on-scroll fade-in-up ${featuresVisible ? "is-visible" : ""}`}>
              <div className="feature-card">
                <div className="icon">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <h5 className="fw-bold">Recharge & Bills</h5>
                <p>Instantly recharge your mobile, DTH, and pay utility bills with just a few clicks.</p>
              </div>
            </div>
            {/* Feature 2: Booking */} 
            <div className={`col-lg-4 col-md-6 animate-on-scroll fade-in-up ${featuresVisible ? "is-visible" : ""}`} style={{ transitionDelay: "0.2s" }}>
              <div className="feature-card">
                <div className="icon">
                  <i className="fas fa-plane-departure"></i>
                </div>
                <h5 className="fw-bold">Travel Booking</h5>
                <p>Book flights, hotels, and trains effortlessly and find the best deals for your next trip.</p>
              </div>
            </div>
            {/* Feature 3: Transfer Money */} 
            <div className={`col-lg-4 col-md-6 animate-on-scroll fade-in-up ${featuresVisible ? "is-visible" : ""}`} style={{ transitionDelay: "0.4s" }}>
              <div className="feature-card">
                <div className="icon">
                  <i className="fas fa-paper-plane"></i>
                </div>
                <h5 className="fw-bold">Transfer Money</h5>
                <p>Send and receive money securely and instantly to anyone, anywhere.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- How It Works Section --- */}
      <section className="py-5" ref={howItWorksRef}>
        <div className="container">
          <div className="text-center mb-5">
            <h3 className={`fw-bold animate-on-scroll fade-in-up ${howItWorksVisible ? "is-visible" : ""}`}>
              Get Started in 3 Easy Steps
            </h3>
          </div>
          <div className="row text-center">
            {/* Step 1 */} 
            <div className={`col-md-4 animate-on-scroll fade-in-up ${howItWorksVisible ? "is-visible" : ""}`}>
              <div className="step-card">
                <div className="icon">
                  <img src="./src/pages/icon/account.png" alt="Create Account"/>
                </div>
                <h6 className="fw-bold">Create Account</h6>
                <p className="text-muted">Sign up for free in just a minute.</p>
              </div>
            </div>
            {/* Step 2 */} 
            <div className={`col-md-4 animate-on-scroll fade-in-up ${howItWorksVisible ? "is-visible" : ""}`} style={{ transitionDelay: "0.2s" }}>
              <div className="step-card">
                <div className="icon">
                  <img src="./src/pages/icon/money.png" alt="Add Money" />
                </div>
                <h6 className="fw-bold">Add Money</h6>
                <p className="text-muted">Add funds to your wallet securely.</p>
              </div>
            </div>
            {/* Step 3 */} 
            <div className={`col-md-4 animate-on-scroll fade-in-up ${howItWorksVisible ? "is-visible" : ""}`} style={{ transitionDelay: "0.4s" }}>
              <div className="step-card">
                <div className="icon">
                  <img src="./src/pages/icon/transfer.png" alt="Start Transacting" />
                </div>
                <h6 className="fw-bold">Start Transacting</h6>
                <p className="text-muted">You're all set to pay and transfer.</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* --- Parallax Divider --- */}
      <section className="parallax-section parallax-divider">
        <div className="container text-center">
          <h3 className="display-6 fw-bold" style={{ color: 'white' }}>Trusted by Millions Worldwide</h3>
        </div>
      </section>

      {/* --- Final Call to Action --- */}
      <section className="py-5 text-center" ref={ctaRef}>
        <div className="container">
          <h3 className={`fw-bold animate-on-scroll fade-in-up ${ctaVisible ? "is-visible" : ""}`}>Ready to Join?</h3>
          <p className={`lead text-muted mb-4 animate-on-scroll fade-in-up ${ctaVisible ? "is-visible" : ""}`} style={{ transitionDelay: "0.2s" }}>
            Create an account today and experience the future of digital payments.
          </p>
          <Link to="/signup" className={`cmn__btn btn-lg animate-on-scroll fade-in-up ${ctaVisible ? "is-visible" : ""}`} style={{ transitionDelay: "0.4s" }}>
            Sign Up for Free
          </Link>
        </div>
      </section>
    </>
  );
};

export default Home;