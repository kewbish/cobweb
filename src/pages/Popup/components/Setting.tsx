import React, { useState } from "react";
import { BigNumber } from "ethers";
import TokenInput from "./TokenInput";
import { PayRates, Rate } from "../../shared/types";
import "bootstrap-icons/font/bootstrap-icons.css";

const Setting = ({
  skey,
  value,
  setSetting,
  deleteSetting,
  onBlur = true,
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
}) => {
  const [currentKey, setCurrentKey] = useState<string>(skey);
  const [currentRateAmt, setCurrentRateAmt] = useState<BigNumber>(
    BigNumber.from(value.rateAmount)
  );
  return (
    <div className="d-flex flex-column align-items-start gap-1">
      <div className="d-flex flex-row justify-content-between gap-1">
        <input
          type="text"
          className="form-control p-1"
          placeholder="Site URL (Regex supported)"
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
        />
        {deleteSetting ? (
          <button
            type="button"
            className="btn"
            onClick={() => deleteSetting(skey)}
            style={{ padding: 10 }}
          >
            <i className="bi bi-trash-fill text-danger"></i>
          </button>
        ) : null}
        {!onBlur ? (
          <button
            type="button"
            className="btn "
            onClick={() => {
              setSetting({
                oldKey: skey,
                newKey: currentKey,
                rateAmt: currentRateAmt,
                payWhen: value.payWhen,
              });
            }}
            style={{ padding: 10 }}
          >
            <i className="bi bi-save text-danger"></i>
          </button>
        ) : null}
      </div>
      <div className="d-flex align-space-between justify-center gap-1">
        {value.payWhen === PayRates.BLOCKED ? (
          <>
            <div className="d-flex flex-row justify-content-between gap-1">
              <p className="purple" style={{ fontSize: 14 }}>
                This site is currently blocked.
              </p>
              <button
                type="button"
                className="btn "
                onClick={() =>
                  setSetting({
                    oldKey: skey,
                    newKey: currentKey,
                    rateAmt: value.rateAmount,
                    payWhen: PayRates.ANY,
                  })
                }
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
                  newKey: currentKey,
                  rateAmt: currentRateAmt,
                  payWhen: value.payWhen,
                });
              }
            }}
            small={true}
          />
        )}
      </div>
      {value.payWhen !== PayRates.BLOCKED ? (
        <>
          <p style={{ fontSize: 14 }} className="mb-0">
            Enable CobWeb when:{" "}
          </p>
          <div className="btn-group" role="group">
            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="btnradio1"
              checked={value.payWhen === PayRates.ANY}
              onChange={() =>
                setSetting({
                  oldKey: skey,
                  newKey: currentKey,
                  rateAmt: currentRateAmt,
                  payWhen: PayRates.ANY,
                })
              }
            />
            <label
              className={"btn  p-1"}
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
                  newKey: currentKey,
                  rateAmt: currentRateAmt,
                  payWhen: PayRates.FOCUS,
                })
              }
            />
            <label
              className={
                "btn p-1" +
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
                  newKey: currentKey,
                  rateAmt: currentRateAmt,
                  payWhen: PayRates.BLOCKED,
                })
              }
            />
            <label
              className="btn  p-1"
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
