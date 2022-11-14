import React from "react";
import { render } from "react-dom";
import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import "../../assets/css/bootstrap.min.css";
import "../../assets/css/fonts.css";
import DefaultSettings from "./DefaultSettings";
import ListSettings from "./ListSettings";
import "./index.css";

import Popup from "./Popup";

render(
  <Router>
    <Routes>
      <Route path="/" element={<Popup />} />
      <Route path="settings/default" element={<DefaultSettings />} />
      <Route path="settings/list" element={<ListSettings />} />
    </Routes>
  </Router>,
  window.document.querySelector("#app-container")
);

// @ts-ignore
if (module.hot) module.hot.accept();
