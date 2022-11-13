import React from "react";

const BackgroundBox = ({
  children,
  style,
}: {
  children: JSX.Element;
  style?: React.CSSProperties;
}) => {
  return (
    <div className="card" style={{ ...style, borderRadius: "32px" }}>
      <div className="card-body" style={{ textAlign: "center" }}>
        {children}
      </div>
    </div>
  );
};

export default BackgroundBox;
