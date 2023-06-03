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
  // const [currency, setCurrency] = useState(TOKEN_MAP.fDAI.name);

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
              // borderRadius: "16px 0 0 16px",
              borderRadius: 16,
              ...(fontSize && { fontSize }),
              textAlign: "center",
            }}
            aria-label={label}
          />
          {/*<button
            className="glassy-cw-btn dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{
              borderRadius: "0 16px 16px 0",
              textAlign: "center",
              padding: 10,
              color: "white",
            }}
          >
            {currency}
          </button>
          <ul
            className="dropdown-menu"
            style={{
              backgroundImage: "none",
              borderRadius: 16,
              minWidth: "unset",
            }}
          >
            {Object.values(TOKEN_MAP).map((token: Token) => (
              <li onClick={() => setCurrency(token.name)} key={token.name}>
                <div className="dropdown-item" style={{ color: "white" }}>
                  {token.name}
                </div>
              </li>
            ))}
          </ul>*/}
        </div>
      )}
    />
  );
};

export default TokenInput;
