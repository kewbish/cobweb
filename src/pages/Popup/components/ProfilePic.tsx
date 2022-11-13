import React from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

const ProfilePic = ({ width, address }: { width: number; address: string }) => {
  return (
    <div
      style={{
        filter: "drop-shadow(0.35rem 0.35rem 0.4rem rgba(0, 0, 0, 0.5))",
        marginBottom: "-6px",
      }}
    >
      <Jazzicon diameter={width} seed={jsNumberForAddress(address)} />
    </div>
  );
};

export default ProfilePic;
