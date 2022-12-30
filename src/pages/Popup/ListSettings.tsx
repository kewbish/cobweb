import React, { useEffect } from "react";
import { useChromeStorageLocal } from "use-chrome-storage";
import { useState } from "react";
import { PayRates, Rate, RateSettings, Stream } from "../shared/types";
import { BigNumber, constants, utils } from "ethers";
import fallbackRate from "../shared/fallbackRate";
import TokenInput from "./components/TokenInput";
import Setting from "./components/Setting";
import "bootstrap-icons/font/bootstrap-icons.css";
import { UPDATE_STREAM } from "../shared/events";
import CobwebPage from "./components/CobwebPage";
// @ts-expect-error
import bootstrap from "bootstrap/dist/js/bootstrap.bundle";
import { toast } from "../shared/toast";
import verifySignature from "../shared/verifySignature";
import ToastHandler from "./components/ToastHandler";

const ListSettings = () => {
  const [rateSettings, setRateSettings, ,]: [RateSettings, any, any, any] =
    useChromeStorageLocal("extend-chrome/storage__local--settings", {});
  const { 0: defaultRate }: { 0: Rate } = useChromeStorageLocal(
    "extend-chrome/storage__local--defaultRate",
    fallbackRate
  );

  const [newSettingTag, setNewSettingTag] = useState<string>("");
  const [newSettingRateAmt, setNewSettingRateAmt] = useState<BigNumber>(
    BigNumber.from(defaultRate.rateAmount)
  );

  const [currentStreams, , ,]: [Array<Stream>, any, any, any] =
    useChromeStorageLocal("extend-chrome/storage__local--streams", []);

  const resetNewSetting = () => {
    setNewSettingTag("");
    setNewSettingRateAmt(BigNumber.from(defaultRate.rateAmount));
  };

  const addNewSetting = () => {
    try {
      setRateSettings((prevSettings: RateSettings) => {
        prevSettings[newSettingTag] = {
          ...prevSettings[newSettingTag],
          rateAmount: newSettingRateAmt,
          payWhen: PayRates.ANY,
        };
        return prevSettings;
      });
      resetNewSetting();
    } catch {
      toast("Couldn't add setting");
    }
  };

  const deleteSetting = (key: string) => {
    try {
      setRateSettings((prevSettings: RateSettings) => {
        delete prevSettings[key];
        return prevSettings;
      });
    } catch {
      toast("Couldn't delete setting");
    }
  };

  const updateSetting = ({
    oldKey,
    newKey,
    rateAmt,
    payWhen,
  }: {
    oldKey: string;
    newKey: string;
    rateAmt: BigNumber;
    payWhen: PayRates;
  }) => {
    try {
      setRateSettings((prevSettings: RateSettings) => {
        delete prevSettings[oldKey];
        prevSettings[newKey] = {
          ...prevSettings[newKey],
          rateAmount: rateAmt,
          payWhen,
        };
        return prevSettings;
      });

      const stream = currentStreams.find((stream) =>
        new RegExp(newKey).test(stream.url)
      );
      if (stream) {
        chrome.runtime.sendMessage({
          message: UPDATE_STREAM,
          options: {
            rateAmount: rateAmt,
            to: stream.recipient,
            tabId: stream.tabId,
            url: stream.url,
          },
        });
      }
    } catch {
      toast("Couldn't update setting");
    }
  };

  return (
    <>
      <CobwebPage>
        <>
          <h2 className="mb-0">Settings List</h2>
          <hr className="my-1" />
          <div className="container overflow-auto" style={{ maxHeight: 300 }}>
            <div className="accordion mb-2" id="settingsAccordion">
              {Object.keys(rateSettings).length ? (
                Object.entries(rateSettings).map(
                  ([key, value]: [string, Rate], i: number) => (
                    <div
                      className="accordion-item"
                      key={key}
                      style={
                        i === 0
                          ? { borderRadius: "0.5rem 0.5rem 0 0" }
                          : undefined
                      }
                    >
                      <div
                        className="accordion-header"
                        style={
                          i === 0
                            ? { borderRadius: "0.5rem 0.5rem 0 0" }
                            : undefined
                        }
                      >
                        <button
                          className={
                            "btn glassy-cw-btn" + (i !== 0 ? " collapsed" : "")
                          }
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse${i}`}
                          aria-expanded="true"
                          aria-controls={`collapse${i}`}
                          style={{
                            borderRadius: i !== 0 ? "0" : "0.5rem 0.5rem 0 0",
                            width: "100%",
                          }}
                        >
                          <p style={{ fontSize: 16 }} className="mb-0">
                            {verifySignature(key) ?? "[invalid Cobweb Tag]"}:{" "}
                            <span className="blue">
                              {BigNumber.from(value.rateAmount) !==
                              constants.Zero
                                ? (+utils.formatUnits(
                                    value.rateAmount
                                  )).toFixed(4) + " ETH per second"
                                : "[blocked]"}
                            </span>{" "}
                          </p>
                        </button>
                      </div>
                      <div
                        id={`collapse${i}`}
                        className={
                          "accordion-collapse collapse" +
                          (i === 0 ? " show" : "")
                        }
                        data-bs-parent="#settingsAccordion"
                      >
                        <div className="accordion-body">
                          <Setting
                            skey={key}
                            value={value}
                            setSetting={updateSetting}
                            deleteSetting={deleteSetting}
                          />
                        </div>
                      </div>
                    </div>
                  )
                )
              ) : (
                <p className="blue">No settings.</p>
              )}
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="btn glassy-cw-btn"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#newRate"
                    aria-expanded="true"
                    aria-controls="newRate"
                    style={{
                      borderRadius: Object.keys(rateSettings).length
                        ? "0 0 0.5rem 0.5rem"
                        : "0.5rem",
                      width: "100%",
                    }}
                  >
                    Add a new user setting
                  </button>
                </h2>
                <div
                  id="newRate"
                  className="accordion-collapse collapse"
                  data-bs-parent="#settingsAccordion"
                >
                  <div className="accordion-body">
                    <div className="d-flex flex-column gap-1">
                      <input
                        type="text"
                        className="form-control p-1"
                        placeholder="Cobweb Tag"
                        id="inputDefault"
                        value={newSettingTag}
                        onChange={(e) => setNewSettingTag(e.target.value)}
                        style={{ borderRadius: 16 }}
                      />
                      <div className="d-flex align-space-between justify-center gap-1 mb-1">
                        <TokenInput
                          value={newSettingRateAmt}
                          setValue={setNewSettingRateAmt}
                        />
                        <button
                          type="button"
                          className="btn glassy-cw-btn"
                          onClick={addNewSetting}
                          style={{ padding: 10 }}
                          title="Add new setting"
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                        {/* TODO - catch more 'edited' possibilities below */}
                        {newSettingTag !== "" ? (
                          <button
                            type="button"
                            className="btn glassy-cw-btn"
                            style={{ padding: 10 }}
                            onClick={resetNewSetting}
                            title="Reset setting"
                          >
                            <i className="bi bi-arrow-clockwise"></i>
                          </button>
                        ) : null}
                      </div>
                    </div>
                    {newSettingTag && !verifySignature(newSettingTag) ? (
                      <p className="blue">This Cobweb tag is invalid.</p>
                    ) : null}
                    {newSettingTag && verifySignature(newSettingTag) ? (
                      <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                        This amount will be streamed to{" "}
                        {verifySignature(newSettingTag)} every second. A
                        recommended setting is 1e8 wei, or ~0.00000001 USD.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      </CobwebPage>
      <ToastHandler />
    </>
  );
};

export default ListSettings;
