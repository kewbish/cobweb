import React from "react";
import { BigNumberInput } from "big-number-input";
import { BigNumber, constants } from "ethers";
// import TOKEN_MAP from "../../shared/tokens";
// import { Token } from "../../shared/types";

const TokenInput = ({
  value,
  setValue,
  onBlur,
  disabled,
  fontSize,
  small = false,
  label = "",
}: {
  value: BigNumber;
  setValue: (value: BigNumber) => void;
  onBlur?: () => void;
  disabled?: boolean;
  fontSize?: number;
  small?: boolean;
  label?: string;
}) => {
  return (
    <BigNumberInput
      decimals={18}
      onChange={(newValue) => {
        newValue
          ? setValue(BigNumber.from(newValue))
          : setValue(constants.Zero);
      }}
      value={value ? value.toString() : ""}
      renderInput={(props) => (
        <div className="d-flex">
          <input
            className={
              "display form-control flex-grow-1" + (small ? " p-1" : "")
            }
            {...props}
            onBlur={onBlur}
            disabled={disabled ?? false}
            style={{
              borderRadius: 16,
              ...(fontSize && { fontSize }),
              textAlign: "center",
            }}
            aria-label={label}
          />
        </div>
      )}
    />
  );
};

export default TokenInput;
