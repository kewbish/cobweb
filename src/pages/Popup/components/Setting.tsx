import React, { useState } from "react";
import { BigNumber, constants } from "ethers";
import TokenInput from "./TokenInput";
import { PayRates, Rate } from "../../shared/types";
import "bootstrap-icons/font/bootstrap-icons.css";
import fallbackRate from "../../shared/fallbackRate";
import { useChromeStorageLocal } from "use-chrome-storage";

const Setting = ({
  skey,
  value,
  setSetting,
  deleteSetting,
  onBlur = true,
  showTag = true,
}: {
  skey: string;
  value: Rate;
  setSetting: ({
    oldKey,
    newKey,
    rateAmt,
    payWhen,
  }: {
    oldKey: string;
    newKey: string;
    rateAmt: BigNumber;
    payWhen: PayRates;
  }) => void;
  deleteSetting?: (key: string) => void;
  onBlur?: boolean;
  showTag?: boolean;
}) => {
  const [currentKey, setCurrentKey] = useState<string>(skey);
  const [currentRateAmt, setCurrentRateAmt] = useState<BigNumber>(
    BigNumber.from(value.rateAmount)
  );
  const [defaultRate, , ,]: [Rate, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--defaultRate",
    fallbackRate
  );
  return (
    <div className="d-flex flex-column align-items-start gap-1">
      <div className="d-flex flex-row justify-content-between gap-1">
        {showTag ? (
          <input
            type="text"
            className="form-control p-1"
            placeholder="Cobweb Tag"
            id="inputDefault"
            value={currentKey}
            onChange={(e) => setCurrentKey(e.target.value)}
            style={{ borderRadius: 16 }}
            onBlur={() => {
              if (onBlur) {
                setSetting({
                  oldKey: skey,
                  newKey: currentKey,
                  rateAmt: currentRateAmt,
                  payWhen: value.payWhen,
                });
              }
            }}
            aria-label="Cobweb Tag for setting to target"
          />
        ) : null}
        {deleteSetting ? (
          <button
            type="button"
            className="btn glassy-cw-btn"
            onClick={() => deleteSetting(skey)}
            style={{ padding: 10 }}
            title="Delete setting"
          >
            <i className="bi bi-trash-fill text-danger"></i>
          </button>
        ) : null}
      </div>
      <div className="d-flex align-space-between justify-center gap-1">
        {value.payWhen === PayRates.BLOCKED ? (
          <>
            <div className="d-flex flex-row justify-content-between gap-1">
              <p className="blue mb-0" style={{ fontSize: 14 }}>
                This tag is currently blocked.
              </p>
              <button
                type="button"
                className="btn glassy-cw-btn"
                onClick={() => {
                  setSetting({
                    oldKey: skey,
                    newKey: skey,
                    rateAmt: BigNumber.from(defaultRate.rateAmount),
                    payWhen: PayRates.ANY,
                  });
                  setCurrentRateAmt(BigNumber.from(defaultRate.rateAmount));
                }}
                style={{ padding: 10 }}
              >
                Unblock
              </button>
            </div>
          </>
        ) : (
          <TokenInput
            value={currentRateAmt}
            setValue={setCurrentRateAmt}
            onBlur={() => {
              if (onBlur) {
                setSetting({
                  oldKey: skey,
                  newKey: skey,
                  rateAmt: currentRateAmt,
                  payWhen: value.payWhen,
                });
              }
            }}
            small={true}
            label="Amount of tokens to stream per second"
          />
        )}
        {!onBlur ? (
          <button
            type="button"
            className="btn glassy-cw-btn"
            title="Save"
            onClick={() => {
              setSetting({
                oldKey: skey,
                newKey: skey,
                rateAmt: currentRateAmt,
                payWhen: value.payWhen,
              });
            }}
            style={{ padding: 10 }}
          >
            <i className="bi bi-save"></i>
          </button>
        ) : null}
      </div>
      {value.payWhen !== PayRates.BLOCKED ? (
        <>
          <label style={{ fontSize: 14 }} className="mb-0" htmlFor="pay-when">
            Enable Cobweb when:{" "}
          </label>
          <div className="btn-group" role="group" id="pay-when">
            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="btnradio1"
              checked={value.payWhen === PayRates.ANY}
              onChange={() =>
                setSetting({
                  oldKey: skey,
                  newKey: skey,
                  rateAmt: currentRateAmt,
                  payWhen: PayRates.ANY,
                })
              }
            />
            <label
              className={
                "btn glassy-cw-btn p-1" +
                (value.payWhen === PayRates.ANY ? " glassy-cw-btn-checked" : "")
              }
              htmlFor="btnradio1"
              style={{ fontSize: 14 }}
            >
              Page Open
            </label>
            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="btnradio2"
              checked={value.payWhen === PayRates.FOCUS}
              onChange={() =>
                setSetting({
                  oldKey: skey,
                  newKey: skey,
                  rateAmt: currentRateAmt,
                  payWhen: PayRates.FOCUS,
                })
              }
            />
            <label
              className={
                "btn glassy-cw-btn p-1" +
                (value.payWhen === PayRates.FOCUS
                  ? " glassy-cw-btn-checked"
                  : "")
              }
              htmlFor="btnradio2"
              style={{ fontSize: 14 }}
            >
              Page Focused
            </label>
            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="btnradio3"
              onChange={() =>
                setSetting({
                  oldKey: skey,
                  newKey: skey,
                  rateAmt: constants.Zero,
                  payWhen: PayRates.BLOCKED,
                })
              }
            />
            <label
              className="btn glassy-cw-btn p-1"
              htmlFor="btnradio3"
              style={{ fontSize: 14 }}
            >
              Never (Blocked)
            </label>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Setting;
