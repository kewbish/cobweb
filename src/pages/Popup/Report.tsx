import React, { useState } from "react";
import ToastHandler from "./components/ToastHandler";
import CobwebPage from "./components/CobwebPage";
import InfoPopover from "./components/InfoPopover";
import verifySignature from "../shared/verifySignature";
import { toast } from "../shared/toast";

const Report = () => {
  const [oldReportingTag, setOldReportingTag] = useState("...");
  const [oldReportingUrl, setOldReportingUrl] = useState("...");
  const [reportingTag, setReportingTag] = useState("");
  const [reportingUrl, setReportingUrl] = useState("");
  const [reported, setReported] = useState(false);

  const report = async () => {
    const tryParseTag = verifySignature(reportingTag);
    if (!tryParseTag) {
      toast("Cobweb Tag is invalid.");
      return;
    }
    if (oldReportingUrl === reportingUrl || oldReportingTag === reportingTag) {
      toast("Tag already reported.");
      return;
    }
    const response = await fetch(
      "https://cobweb-worker.kewbish.workers.dev/report?" +
        new URLSearchParams({
          address: reportingTag,
          url: reportingUrl,
        }).toString()
    );
    const responseJson = await response.json();
    if (!response.ok || !responseJson.success) {
      toast("Couldn't report user, please try again.");
      return;
    }
    setReported(true);
    setOldReportingTag(reportingTag);
    setOldReportingUrl(reportingUrl);
    setReportingTag("");
    setReportingUrl("");
  };

  return (
    <>
      <CobwebPage>
        <>
          <h2 className="mb-0">Report User</h2>
          <hr className="my-1" />
          <p style={{ fontSize: 16 }} className="mb-0">
            Use this page to report spam, inappropriate Cobweb content, or other
            abusive actions. Reports are manually processed and if confirmed,
            will result in a ban from the Cobweb community.{" "}
          </p>
          <div className="d-flex flex-column align-items-start">
            <label htmlFor="cobweb-report" className="mt-2">
              Cobweb Tag to report (*)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Cobweb Tag to report"
              aria-label="Cobweb Tag to report"
              style={{
                padding: "0.5rem 1rem",
              }}
              value={reportingTag}
              onChange={(e) => {
                setReportingTag(e.target.value);
                setReported(false);
              }}
              required
              id="cobweb-report"
            />
            <label htmlFor="cobweb-report-url" className="mt-2 mb-1">
              URL of abusive content
              <InfoPopover
                text="
 To increase the
            chances of the report being successful, please attach the URL where
            the abusive content is located."
                moreSquare
              />
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="URL to report"
              aria-label="URL to report"
              style={{
                padding: "0.5rem 1rem",
              }}
              value={reportingUrl}
              onChange={(e) => {
                setReportingUrl(e.target.value);
                setReported(false);
              }}
              id="cobweb-report-url"
            />
            <button
              onClick={report}
              className="btn glassy-cw-btn p-1 mt-2"
              disabled={
                !verifySignature(reportingTag) ||
                !reportingTag ||
                reportingTag === oldReportingTag ||
                reportingUrl === oldReportingUrl
              }
            >
              {reported ? "Reported!" : "Report"}
            </button>
          </div>
        </>
      </CobwebPage>
      <ToastHandler />
    </>
  );
};
export default Report;
