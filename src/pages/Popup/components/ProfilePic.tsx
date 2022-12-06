import React from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { useNavigate } from "react-router-dom";

const ProfilePic = ({ width, address }: { width: number; address: string }) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        filter: "drop-shadow(0.35rem 0.35rem 0.4rem rgba(0, 0, 0, 0.5))",
        marginBottom: "-6px",
        cursor: "pointer",
      }}
      onClick={() => navigate("/settings/about")}
    >
      <Jazzicon diameter={width} seed={jsNumberForAddress(address)} />
    </div>
  );
};

export default ProfilePic;
