import React from "react";

const FadedPill = ({ children }: { children: JSX.Element }) => {
  return (
    <div
      style={{
        borderRadius: "100px",
        padding: "8px",
        marginBottom: 0,
      }}
      className="alert"
    >
      {children}
    </div>
  );
};

export default FadedPill;
