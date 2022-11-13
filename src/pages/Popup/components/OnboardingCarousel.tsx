import React from "react";

const Onboarding = () => (
  <div>
    <div
      id="onboardingCarousel"
      className="carousel slide"
      data-bs-ride="carousel"
    >
      <div className="carousel-indicators">
        <button
          type="button"
          data-bs-target="#onboardingCarousel"
          data-bs-slide-to="0"
          className="active"
          aria-current="true"
          aria-label="Slide 1"
        ></button>
        <button
          type="button"
          data-bs-target="#onboardingCarousel"
          data-bs-slide-to="1"
          aria-label="Slide 2"
        ></button>
        <button
          type="button"
          data-bs-target="#onboardingCarousel"
          data-bs-slide-to="2"
          aria-label="Slide 3"
        ></button>
      </div>
      <div className="carousel-inner">
        <div className="carousel-item active">
          <div>
            <p style={{ fontSize: 16 }} className="mb-1 mt-1">
              Cobweb enables you to support other creative teens and start
              earning on the blockchain.
            </p>
            <p style={{ fontSize: 16 }}>
              Learn more about the blockchain and Cobweb's mission{" "}
              <a
                href="https://github.com/kewbish/cobweb"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>
              .
            </p>
          </div>
        </div>
        <div className="carousel-item">
          <p style={{ fontSize: 16 }} className="mb-1">
            SLIDE 2
          </p>
        </div>
        <div className="carousel-item">
          <p style={{ fontSize: 16 }} className="mb-1">
            SLIDE 3
          </p>
        </div>
      </div>
    </div>
    <div className="d-flex justify-content-end">
      <button
        type="button"
        className="btn glassy-cw-btn p-1"
        data-bs-dismiss="modal"
        style={{ marginTop: 30 }}
      >
        Thanks, I'll dive in!
      </button>
    </div>
  </div>
);

export default Onboarding;
