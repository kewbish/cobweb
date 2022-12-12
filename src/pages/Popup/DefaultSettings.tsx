import React from "react";
import { BigNumber, constants } from "ethers";
import { useChromeStorageLocal } from "use-chrome-storage";
import { Rate } from "../shared/types";
import TokenInput from "./components/TokenInput";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import CobwebPage from "./components/CobwebPage";
import InfoPopover from "./components/InfoPopover";
// @ts-expect-error
import bootstrap from "bootstrap/dist/js/bootstrap.bundle";
import fallbackRate from "../shared/fallbackRate";

const DefaultSettings = () => {
  const [defaultRate, setDefaultRate, ,]: [Rate, any, any, any] =
    useChromeStorageLocal(
      "extend-chrome/storage__local--defaultRate",
      fallbackRate
    );

  const [timeSpent, setTimeSpent] = useState(60);

  useEffect(() => {
    const hours = new bootstrap.Popover(document.getElementById("eth-hours"));
    const days = new bootstrap.Popover(document.getElementById("eth-days"));
    const weeks = new bootstrap.Popover(document.getElementById("eth-weeks"));
    const months = new bootstrap.Popover(document.getElementById("eth-months"));
    return () => {
      hours.dispose();
      days.dispose();
      weeks.dispose();
      months.dispose();
    };
  }, []);

  return (
    <CobwebPage>
      <>
        <h2 className="mb-0">Default Settings</h2>
        <hr className="my-1 mb-2" />
        <TokenInput
          value={
            defaultRate
              ? BigNumber.from(defaultRate.rateAmount)
              : constants.Zero
          }
          fontSize={
            340 / ethers.utils.formatUnits(defaultRate.rateAmount).length
          }
          setValue={setDefaultRate}
          disabled={!defaultRate}
        />
        <p className="mt-1 d-inline-block">ETH per second</p>
        <InfoPopover
          text={
            "This is the amount of ETH streamed per second when no site-specific settings are found."
          }
        />
        <div className="d-flex flex-row gap-1">
          <Link to="/settings/list">
            <button type="button" className="btn p-1 glassy-cw-btn">
              Edit individual site settings
            </button>
          </Link>
          <button
            className="btn glassy-cw-btn p-1"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#unitsCollapse"
            aria-expanded="false"
            aria-controls="unitsCollapse"
          >
            See this in other units
          </button>
        </div>
        <div className="collapse" id="unitsCollapse">
          <div className="card card-body mt-2" style={{ borderRadius: 16 }}>
            Assuming you spend an average of:
            <input
              type="range"
              className="form-range"
              min="0"
              max="120"
              step="5"
              id="range"
              value={timeSpent}
              onChange={(e) => setTimeSpent(Number(e.target.value))}
            />
            <label htmlFor="range" className="form-label">
              {timeSpent} minutes on a monetized site a day, that's:
            </label>
            <p
              className="mb-0"
              style={{ fontSize: 18 }}
              id="eth-hours"
              data-bs-toggle="popover"
              data-bs-trigger="hover focus"
              data-bs-placement="bottom"
              data-bs-content={ethers.utils.formatUnits(
                Boolean(defaultRate)
                  ? BigNumber.from(defaultRate.rateAmount).mul(
                      BigNumber.from(Math.round((timeSpent / 24) * 60))
                    )
                  : constants.Zero
              )}
              data-bs-template={
                '<div class="popover" role="tooltip"><div class="popover-arrow popover-arrow-override"></div><p class="popover-header"></p><div class="popover-body"></div></div>'
              }
            >
              {(+ethers.utils.formatUnits(
                Boolean(defaultRate)
                  ? BigNumber.from(defaultRate.rateAmount).mul(
                      BigNumber.from(Math.round((timeSpent / 24) * 60))
                    )
                  : constants.Zero
              )).toFixed(4)}{" "}
              ETH per hour
            </p>
            <p
              className="mb-0"
              style={{ fontSize: 18 }}
              id="eth-days"
              data-bs-toggle="popover"
              data-bs-trigger="hover focus"
              data-bs-placement="bottom"
              data-bs-content={ethers.utils.formatUnits(
                Boolean(defaultRate)
                  ? BigNumber.from(defaultRate.rateAmount).mul(
                      BigNumber.from(Math.round(timeSpent * 60))
                    )
                  : constants.Zero
              )}
              data-bs-template={
                '<div class="popover" role="tooltip"><div class="popover-arrow popover-arrow-override"></div><p class="popover-header"></p><div class="popover-body"></div></div>'
              }
            >
              {(+ethers.utils.formatUnits(
                Boolean(defaultRate)
                  ? BigNumber.from(defaultRate.rateAmount).mul(
                      BigNumber.from(Math.round(timeSpent * 60))
                    )
                  : constants.Zero
              )).toFixed(4)}{" "}
              ETH per day
            </p>
            <p
              className="mb-0"
              style={{ fontSize: 18 }}
              id="eth-weeks"
              data-bs-toggle="popover"
              data-bs-trigger="hover focus"
              data-bs-placement="bottom"
              data-bs-content={ethers.utils.formatUnits(
                Boolean(defaultRate)
                  ? BigNumber.from(defaultRate.rateAmount).mul(
                      BigNumber.from(Math.round(timeSpent * 60 * 7))
                    )
                  : constants.Zero
              )}
              data-bs-template={
                '<div class="popover" role="tooltip"><div class="popover-arrow popover-arrow-override"></div><p class="popover-header"></p><div class="popover-body"></div></div>'
              }
            >
              {(+ethers.utils.formatUnits(
                Boolean(defaultRate)
                  ? BigNumber.from(defaultRate.rateAmount).mul(
                      BigNumber.from(Math.round(timeSpent * 60 * 7))
                    )
                  : constants.Zero
              )).toFixed(4)}{" "}
              ETH per week
            </p>
            <p
              className="mb-0"
              style={{ fontSize: 18 }}
              id="eth-months"
              data-bs-toggle="popover"
              data-bs-trigger="hover focus"
              data-bs-placement="bottom"
              data-bs-content={ethers.utils.formatUnits(
                Boolean(defaultRate)
                  ? BigNumber.from(defaultRate.rateAmount).mul(
                      BigNumber.from(Math.round(timeSpent * 60 * 30))
                    )
                  : constants.Zero
              )}
              data-bs-template={
                '<div class="popover" role="tooltip"><div class="popover-arrow popover-arrow-override"></div><p class="popover-header"></p><div class="popover-body"></div></div>'
              }
            >
              {(+ethers.utils.formatUnits(
                Boolean(defaultRate)
                  ? BigNumber.from(defaultRate.rateAmount).mul(
                      BigNumber.from(Math.round(timeSpent * 60 * 30))
                    )
                  : constants.Zero
              )).toFixed(4)}{" "}
              ETH per month
            </p>
            <p className="mb-0" style={{ fontSize: 18 }}>
              to the site.
            </p>
          </div>
        </div>
      </>
    </CobwebPage>
  );
};

export default DefaultSettings;
