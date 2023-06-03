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
      <main className="card-body" style={{ textAlign: "center" }}>
        {children}
      </main>
    </div>
  );
};

export default BackgroundBox;
