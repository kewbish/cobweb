import React from "react";
import BackgroundBox from "./components/BackgroundBox";

const MetamaskNotFound = () => {
  return (
    <div className="App mx-2 my-3 p-0">
      <div className="container">
        <BackgroundBox>
          <>
            <h1 className="display" style={{ fontSize: 70 }}>
              Cobweb
            </h1>
            <p>
              An Ethereum-based Web Monetization tool, enabling creation like
              never before.
            </p>
            <p style={{ fontSize: 16 }}>
              Metamask not found. Please make sure{" "}
              <a
                href="https://metamask.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Metamask
                <span className="screen-reader-text"> opens a new window</span>
              </a>{" "}
              is installed and try again. You may need to log into Metamask's
              extension, or wait a minute for Cobweb to detect Metamask.{" "}
            </p>
            <div className="d-flex justify-content-center">
              <div style={{ cursor: "pointer", width: "fit-content" }}></div>
            </div>
          </>
        </BackgroundBox>
        <div className="d-flex flex-row justify-content-between align-items-end">
          <p className="mt-2 mb-0">
            <a
              href="https://github.com/kewbish/cobweb"
              target="_blank"
              rel="noopener noreferrer"
              className="cobweb-link"
            >
              view source
              <span className="screen-reader-text"> opens a new window</span>
            </a>{" "}
            |{" "}
            <a
              href="https://github.com/kewbish/cobweb/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="cobweb-link"
            >
              get help
              <span className="screen-reader-text"> opens a new window</span>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetamaskNotFound;
