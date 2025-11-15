import React from "react";

const WorkingSectionThree: React.FC = () => {
  const logos = [
    { src: "/assets/images/jio.png", alt: "Jio" },
    { src: "/assets/images/airtel.png", alt: "Airtel" },
    { src: "/assets/images/bsnl.png", alt: "BSNL" },
    { src: "/assets/images/vi.png", alt: "Vi" },
  ];
  const duplicatedLogos = [...logos, ...logos, ...logos]; // Duplicate for a smoother, longer scroll

  return (
    <>
      <style>
        {`
          /* --- Logo Scroller Animation --- */
          .logo-scroller {
            background: #fff;
            padding: 40px 0;
            overflow: hidden;
            white-space: nowrap;
            position: relative;
            border-top: 1px solid #f0f0f0;
            border-bottom: 1px solid #f0f0f0;
          }
          .logo-scroller:before,
          .logo-scroller:after {
            content: '';
            position: absolute;
            top: 0;
            width: 150px;
            height: 100%;
            z-index: 2;
          }
          .logo-scroller:before {
            left: 0;
            background: linear-gradient(to left, rgba(255, 255, 255, 0), #fff);
          }
          .logo-scroller:after {
            right: 0;
            background: linear-gradient(to right, rgba(255, 255, 255, 0), #fff);
          }
          .logo-scroller-inner {
            display: inline-block;
            animation: scroll 40s linear infinite;
          }
          .logo-scroller-inner img {
            height: 40px;
            margin: 0 40px;
            filter: grayscale(100%);
            opacity: 0.6;
            transition: filter 0.3s, opacity 0.3s;
          }
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
        `}
      </style>

      <section className="working__section__three pt-120 pb-120">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="section__header section__center pb__40">
                <h2>How It’s Work</h2>
                <p>
                  There are many variations of passages of Lorem Ipsum
                  available, but the majority have suffered alteration in some
                  form
                </p>
              </div>
            </div>
          </div>
          <div className="row g-4 justify-content-center align-items-center">
            <div className="col-lg-5 col-md-5">
              <div className="working__wrapitems__three">
                <div className="row justify-content-between">
                  <div className="col-xl-12 working__space">
                    <div
                      className="working__itemstwo affter__one wow fadeInUp"
                      data-wow-duration=".9s"
                    >
                      <span className="list">01</span>
                      <div className="icon">
                        <img
                          src="assets/img/working/chossetouch.png"
                          alt="img"
                        />
                      </div>
                      <div className="content">
                        <h5>Choose what to do</h5>
                        <p>
                          There are many variations of passages of Lorem Ipsum
                          available, but the majority have suffered alteration
                          in some form, by injected humour
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-12">
                    <div
                      className="working__itemstwo affter__three wow fadeInUp"
                      data-wow-duration="1.2s"
                    >
                      <span className="list">03</span>
                      <div className="icon">
                        <img src="assets/img/working/find.png" alt="img" />
                      </div>
                      <div className="content">
                        <h5>Find what you want</h5>
                        <p>
                          There are many variations of passages of Lorem Ipsum
                          available, but the majority have suffered alteration
                          in some form, by injected humour
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-2">
              <div className="borders"></div>
            </div>
            <div className="col-xl-5 col-md-5">
              <div
                className="working__itemstwo affter__two wow fadeInUp"
                data-wow-duration="1.8s"
              >
                <span className="list">03</span>
                <div className="icon">
                  <img src="assets/img/working/code.png" alt="img" />
                </div>
                <div className="content">
                  <h5>Explore amazing code</h5>
                  <p>
                    There are many variations of passages of Lorem Ipsum
                    available, but the majority have suffered alteration in some
                    form, by injected humour
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="working__3shape">
          <img src="assets/img/working/working3shape.png" alt="img" />
        </div>
      </section>

      {/* --- Logo Scroller Section --- */}
      <section className="logo-scroller">
        <div className="logo-scroller-inner">
          {duplicatedLogos.map((logo, index) => (
            <img key={index} src={logo.src} alt={logo.alt} />
          ))}
        </div>
      </section>

      <section className="refer__section py-5">
        <div className="container">
          <div className="row align-items-center justify-content-between">
            {/* Left Content */}
            <div className="col-lg-5 mb-4 mb-lg-0">
              <div className="section__header">
                <h2 className="h2 mb-3">Refer & Earn Rewards</h2>
                <p className="text-muted mb-4">
                  Invite your friends to join our platform and earn rewards for
                  every successful referral. It's an easy way to benefit both
                  you and your friends.
                </p>
                <a href="#refer" className="btn btn-primary">
                  Start Earning
                </a>
              </div>
            </div>

            {/* Right Steps */}
            <div className="col-lg-6">
              <div className="d-flex flex-column gap-3">
                {/* Step 1 */}
                <div className="d-flex align-items-start p-3 bg-white rounded shadow-sm">
                  <div className="icon flex-shrink-0 me-3">
                    <img
                      src="assets/img/refer/boxspeaker.png"
                      alt="Refer friends"
                      width="48"
                    />
                  </div>
                  <div>
                    <h5 className="mb-1">1. Refer Your Friends</h5>
                    <p className="mb-0 text-muted small">
                      Share your unique referral link with friends via social
                      media or email.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="d-flex align-items-start p-3 bg-white rounded shadow-sm">
                  <div className="icon flex-shrink-0 me-3">
                    <img
                      src="assets/img/refer/boxregister.png"
                      alt="Friends register"
                      width="48"
                    />
                  </div>
                  <div>
                    <h5 className="mb-1">2. They Register</h5>
                    <p className="mb-0 text-muted small">
                      Your friends sign up and complete their first transaction
                      using your link.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="d-flex align-items-start p-3 bg-white rounded shadow-sm">
                  <div className="icon flex-shrink-0 me-3">
                    <img
                      src="assets/img/refer/earndollar.png"
                      alt="Earn rewards"
                      width="48"
                    />
                  </div>
                  <div>
                    <h5 className="mb-1">3. You Both Earn</h5>
                    <p className="mb-0 text-muted small">
                      Once they complete the process, you both receive rewards
                      in your accounts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="refer__section__three py-5 position-relative">
        <div className="container">
          <div className="row justify-content-between align-items-center">
            {/* Left Content */}
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="section__header">
                <h2>Enjoy our Special Supports</h2>
                <p className="pb-4 text-muted">
                  There are many variations of passages of Lorem Ipsum
                  available, but the have suffered alteration in some form, by
                  injected humour, or randomized words which don't look even
                  slightly believable. If you are going to use...
                </p>
                <a href="#contact" className="btn btn-primary">
                  Contact us
                </a>
              </div>
            </div>

            {/* Right Content */}
            <div className="col-lg-6">
              <div className="refer__boxes__wrap">
                <div className="row g-4 align-items-center">
                  {/* Left Column of Boxes */}
                  <div className="col-lg-6 col-md-6">
                    <div className="d-flex flex-column gap-3">
                      {/* Box 1 */}
                      <div className="refer__item d-flex p-3 bg-white rounded shadow-sm">
                        <div className="icon me-3 flex-shrink-0">
                          <img
                            src="assets/img/working/mobilepro.png"
                            alt="Secure Payment"
                            width={48}
                          />
                        </div>
                        <div className="content">
                          <h5>
                            <a
                              href="order.html"
                              className="text-decoration-none text-dark"
                            >
                              Secure Payment
                            </a>
                          </h5>
                          <p className="mb-0 text-muted small">
                            There are many variations of passages of Lorem...
                          </p>
                        </div>
                      </div>
                      {/* Box 2 */}
                      <div className="refer__item d-flex p-3 bg-white rounded shadow-sm">
                        <div className="icon me-3 flex-shrink-0">
                          <img
                            src="assets/img/working/walletpro.png"
                            alt="Trust Pay"
                            width={48}
                          />
                        </div>
                        <div className="content">
                          <h5>
                            <a
                              href="order.html"
                              className="text-decoration-none text-dark"
                            >
                              Trust Pay
                            </a>
                          </h5>
                          <p className="mb-0 text-muted small">
                            There are many variations of passages of Lorem...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column of Boxes */}
                  <div className="col-lg-6 col-md-6">
                    <div className="d-flex flex-column gap-3">
                      {/* Box 3 */}
                      <div className="refer__item d-flex p-3 bg-white rounded shadow-sm">
                        <div className="icon me-3 flex-shrink-0">
                          <img
                            src="assets/img/working/soundpro.png"
                            alt="Refer Payment"
                            width={48}
                          />
                        </div>
                        <div className="content">
                          <h5>
                            <a
                              href="order.html"
                              className="text-decoration-none text-dark"
                            >
                              Refer Payment
                            </a>
                          </h5>
                          <p className="mb-0 text-muted small">
                            There are many variations of passages of Lorem...
                          </p>
                        </div>
                      </div>
                      {/* Box 4 */}
                      <div className="refer__item d-flex p-3 bg-white rounded shadow-sm">
                        <div className="icon me-3 flex-shrink-0">
                          <img
                            src="assets/img/working/supportpro.png"
                            alt="27x7 Support"
                            width={48}
                          />
                        </div>
                        <div className="content">
                          <h5>
                            <a
                              href="order.html"
                              className="text-decoration-none text-dark"
                            >
                              27x7 Support
                            </a>
                          </h5>
                          <p className="mb-0 text-muted small">
                            There are many variations of passages of Lorem...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Dots */}
                <div className="position-absolute top-0 start-0">
                  <img src="assets/img/refer/dots.png" alt="dots" />
                </div>
                <div className="position-absolute top-50 start-100 translate-middle">
                  <img src="assets/img/refer/dots.png" alt="dots" />
                </div>
                <div className="position-absolute bottom-0 end-0">
                  <img src="assets/img/refer/dots.png" alt="dots" />
                </div>
                <div className="position-absolute bottom-50 start-0 translate-middle">
                  <img src="assets/img/refer/dots.png" alt="dots" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Ball */}
        <div className="position-absolute" style={{ right: 0, bottom: 0 }}>
          <img src="assets/img/refer/referball.png" alt="decorative ball" />
        </div>
      </section>
    </>
  );
};

export default WorkingSectionThree;
