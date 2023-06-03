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
          <button
            style={{
              backgroundColor: "transparent",
              color: "inherit",
              border: "none",
            }}
            onClick={() => navigate(-1)}
            aria-label="Navigate to previous page"
          >
            <h1 className="display" style={{ fontSize: 40, fontWeight: 600 }}>
              &lt;
            </h1>
          </button>
          <BalanceDisplay />
        </div>
        <BackgroundBox>
          <>{children}</>
        </BackgroundBox>
      </div>
    </div>
  );
};

export default CobwebPage;
