import React from "react";
import BackgroundBox from "./BackgroundBox";
import { useNavigate } from "react-router-dom";
import BalanceDisplay from "./BalanceDisplay";

const CobwebPage = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  return (
    <div className="mx-2 my-3 p-0">
      <div className="container">
        <div className="d-flex justify-content-between align-items-start">
          <h1
            className="display"
            style={{ fontSize: 40, fontWeight: 600, cursor: "pointer" }}
            onClick={() => navigate(-1)}
          >
            &lt;
          </h1>
        </div>
        <BalanceDisplay />
        <BackgroundBox>
          <>{children}</>
        </BackgroundBox>
      </div>
    </div>
  );
};

export default CobwebPage;
