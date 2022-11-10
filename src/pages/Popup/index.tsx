import React from "react";
import { render } from "react-dom";
import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import "../../assets/css/fonts.css";
import "../../assets/css/bootstrap.min.css";

import Popup from "./Popup";

render(
  <Router>
    <Routes>
      <Route path="/" element={<Popup />} />
    </Routes>
  </Router>,
  window.document.querySelector("#app-container")
);

// @ts-ignore
if (module.hot) module.hot.accept();
