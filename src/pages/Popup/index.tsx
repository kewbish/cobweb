import React from "react";
import { render } from "react-dom";
import { MemoryRouter as Router, Routes, Route } from "react-router-dom";

import "../../assets/css/bootstrap.min.css";
import "../../assets/css/fonts.css";
import "./index.css";
import "./scrollbars.css";

import DefaultSettings from "./DefaultSettings";
import ListSettings from "./ListSettings";
import ManageBalances from "./ManageBalances";
import Popup from "./Popup";
import DowngradingTokens from "./DowngradingTokens";
import UpgradingTokens from "./UpgradingTokens";
import ListStreamsOut from "./ListStreamsOut";
import CobwebInfo from "./CobwebInfo";
import Welcome from "./Welcome";
import MetamaskNotFound from "./MetamaskNotFound";
import Report from "./Report";

render(
  <Router>
    <Routes>
      <Route path="/" element={<Popup />} />
      <Route path="settings/default" element={<DefaultSettings />} />
      <Route path="settings/about" element={<CobwebInfo />} />
      <Route path="settings/list" element={<ListSettings />} />
      <Route path="balance" element={<ManageBalances />} />
      <Route path="balance/downgrade" element={<DowngradingTokens />} />
      <Route path="balance/upgrade" element={<UpgradingTokens />} />
      <Route path="streams/out" element={<ListStreamsOut />} />
      <Route path="welcome" element={<Welcome />} />
      <Route path="metamask/not-found" element={<MetamaskNotFound />} />
      <Route path="report" element={<Report />} />
    </Routes>
  </Router>,
  window.document.querySelector("#app-container")
);

// @ts-ignore
if (module.hot) module.hot.accept();
