import React, { useState } from "react";
import { useChromeStorageLocal } from "use-chrome-storage";
import { toast } from "../../shared/toast";
// @ts-expect-error
import bootstrap from "bootstrap/dist/js/bootstrap.bundle";
import InfoPopover from "../components/InfoPopover";

const Onboarding = () => {
  const [hasJoined, setHasJoined] = useState(false);
  const [address, , ,]: [string, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--address",
    ""
  );
  const [, setRequested, ,]: [any, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--requested",
    ""
  );
  const joinCobweb = async () => {
    if (!address) {
      toast("Couldn't fetch Metamask account.");
      return;
    }
    try {
      const response = await fetch(
        "https://cobweb-worker.kewbish.workers.dev/request?" +
          new URLSearchParams({ address }).toString()
      );
      const responseJson = await response.json();
      if (response.ok && responseJson.success) {
        toast("Thanks, and welcome!");
        setRequested(true);
        setHasJoined(true);
        if (!document.getElementById("welcome")) {
          return;
        }
        const welcomeModal = bootstrap.Modal.getOrCreateInstance(
          document.getElementById("welcome")
        );
        welcomeModal.hide();
      } else {
        toast(
          "There was an issue with requesting verification. Please try again."
        );
      }
    } catch (e) {
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
        data-bs-interval="false"
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
          <button
            type="button"
            data-bs-target="#onboardingCarousel"
            data-bs-slide-to="3"
            aria-label="Slide 4"
          ></button>
          <button
            type="button"
            data-bs-target="#onboardingCarousel"
            data-bs-slide-to="4"
            aria-label="Slide 5"
          ></button>
          <button
            type="button"
            data-bs-target="#onboardingCarousel"
            data-bs-slide-to="5"
            aria-label="Slide 6"
          ></button>
        </div>
        <div className="carousel-inner">
          <div
            className="carousel-item active"
            style={{ height: 180, marginBottom: "0.75rem" }}
          >
            <div>
              <p style={{ fontSize: 16 }} className="mb-1 mt-1">
                Cobweb enables you to support other creative teens and start
                earning on the Ethereum blockchain.
              </p>
              <p style={{ fontSize: 16 }}>
                Learn more about the blockchain{" "}
                <a
                  href="https://ethereum.org/en/what-is-ethereum/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cobweb-link"
                  aria-label="Ethereum explainer website."
                >
                  here
                  <span className="screen-reader-text">
                    {" "}
                    opens a new window
                  </span>
                </a>{" "}
                and Cobweb's mission{" "}
                <a
                  href="https://github.com/kewbish/cobweb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cobweb-link"
                  aria-label="Cobweb GitHub page."
                >
                  here
                  <span className="screen-reader-text">
                    {" "}
                    opens a new window
                  </span>
                </a>
                .
              </p>
            </div>
          </div>
          <div
            className="carousel-item"
            style={{ height: 180, marginBottom: "0.75rem" }}
          >
            <p style={{ fontSize: 16 }}>
              Cobweb helps you earn for your work by creating monetization
              streams, which send tiny fractions of a cent while you view
              someone's work — like videos or blog posts.
            </p>
            <p style={{ fontSize: 16 }}>
              You'll interact directly with the blockchain, learning to navigate
              a blockchain world!
            </p>
            <br />
          </div>
          <div
            className="carousel-item"
            style={{ height: 180, marginBottom: "0.75rem" }}
          >
            <p style={{ fontSize: 16 }}>
              All websites are monetizable — just click your profile picture in
              the upper right to generate your Cobweb tag, and paste it anywhere
              on the web.
            </p>
            <p style={{ fontSize: 16 }}>
              You may see a Metamask popup asking you to sign something: this is
              how we protect users from scammers! Learn more{" "}
              <a
                href="https://github.com/kewbish/cobweb/wiki/Cobweb-Tags-&-Account-Page"
                target="_blank"
                rel="noopener noreferrer"
                className="cobweb-link"
                aria-label="Cobweb Wiki on Cobweb Tags and Accounts"
              >
                here
                <span className="screen-reader-text"> opens a new window</span>
              </a>
              .
            </p>
            <br />
          </div>
          <div
            className="carousel-item"
            style={{ height: 180, marginBottom: "0.75rem" }}
          >
            <p style={{ fontSize: 16 }}>
              Streams are automatically started when you go to a site with a
              Cobweb tag on it. You can edit settings or block Cobweb users by
              clicking 'Edit stream settings' on the main page.
            </p>
            <p style={{ fontSize: 16 }}>
              {" "}
              Learn more about stream settings{" "}
              <a
                href="https://github.com/kewbish/cobweb/wiki/Stream-Settings-Pages"
                target="_blank"
                rel="noopener noreferrer"
                className="cobweb-link"
                aria-label="Cobweb Wiki Stream Settings page"
              >
                here
                <span className="screen-reader-text"> opens a new window</span>
              </a>
              .
            </p>
            <br />
          </div>
          <div
            className="carousel-item"
            style={{ height: 180, marginBottom: "0.75rem" }}
          >
            <p style={{ fontSize: 16 }}>
              Cobweb streams you real cryptocurrency tokens! We use a 'wrapped
              token', or a special type of token, called{" "}
              <a
                href="https://docs.superfluid.finance/superfluid/developers/super-tokens/super-tokens/types-of-super-tokens/erc20-wrapper-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="cobweb-link"
                aria-label="ETHx Wrapped Tokens documentation"
              >
                ETHx
                <span className="screen-reader-text"> opens a new window</span>
              </a>
              .
            </p>
            <p style={{ fontSize: 16 }}>
              To get started, you'll need to have some ETH in your wallet, and
              upgrade it by clicking 'Manage balances'. Learn more{" "}
              <a
                href="https://github.com/kewbish/cobweb/wiki/Balances-&-Balances-Pages"
                target="_blank"
                rel="noopener noreferrer"
                className="cobweb-link"
                aria-label="Cobweb Wiki Balances page"
              >
                here
                <span className="screen-reader-text"> opens a new window</span>
              </a>
              .
            </p>
            <br />
          </div>
          <div
            className="carousel-item"
            style={{ height: 180, marginBottom: "0.75rem" }}
          >
            <p style={{ fontSize: 16 }} className="mb-1 d-inline">
              We're excited for you to begin your blockchain journey with
              Cobweb!
              <br />
              <br />
              Verify your account to get started.
            </p>
            <InfoPopover
              text={
                "Please note verification is performed manually. We reserve the right to not register you into the Cobweb community."
              }
              moreSquare={true}
              darker={true}
              id={"verification-popover"}
            />
            <br />
            <div className="d-flex align-items-center">
              <button
                type="button"
                className="btn glassy-cw-btn p-1 mt-2 mx-auto text-center"
                disabled={hasJoined}
                onClick={joinCobweb}
              >
                {hasJoined ? "Thanks, and welcome!" : "Request verification"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
