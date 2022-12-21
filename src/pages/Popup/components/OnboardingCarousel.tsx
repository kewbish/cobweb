import React, { useState } from "react";
import { useChromeStorageLocal } from "use-chrome-storage";
import { toast } from "../../shared/toast";

const Onboarding = () => {
  const [hasJoined, setHasJoined] = useState(false);
  const [address, , ,]: [string, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--address",
    ""
  );
  const joinCobweb = async () => {
    if (!address) {
      toast("Couldn't fetch Metamask account.");
      return;
    }
    const response = await fetch(
      "https://cobweb-worker.kewbish.workers.dev/request?" +
        new URLSearchParams({ address })
    );
    const responseJson = await response.json();
    if (responseJson.success) {
      toast("Successfully requested verification!");
      setHasJoined(true);
    } else {
      toast(
        "There was an issue with requesting verification. Please try again."
      );
    }
  };
  return (
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
            data-bs-slide-to="0"
            aria-label="Slide 2"
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
              To help you get started, we're offering a limited-time 0.003 ETH
              top-up to your account! Click the button below to register your
              ETH address.
            </p>
            <small className="mb-1">
              <em>
                Please note verification is performed manually. We reserve the
                right to not offer ETH but will always register you into the
                community.
              </em>
            </small>
            <button
              type="button"
              className="btn glassy-cw-btn p-1"
              disabled={hasJoined}
              onClick={joinCobweb}
            >
              {hasJoined ? "Thanks, and welcome!" : "Join the Cobweb!"}
            </button>
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
};

export default Onboarding;
