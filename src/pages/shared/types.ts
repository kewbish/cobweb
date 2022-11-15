import { BigNumber } from "ethers";

export interface Wallet {
  address: string;
  mnemonic: string;
  pkey: string;
}

export interface Stream {
  tabId: number;
  url: string;
  recipient: string;
  rateAmount: BigNumber;
  requestId: string;
  startTime: Date;
  stopTime?: Date;
  token?: Token;
}

export interface Token {
  name: string;
  decimals: number;
  address?: string;
  xAddress: string;
}

export enum PayRates {
  BLOCKED = "BLOCKED",
  FOCUS = "FOCUS",
  ANY = "ANY",
}

export interface Rate {
  rateAmount: BigNumber;
  payWhen: PayRates;
}

export interface RateSettings {
  [key: string]: Rate;
}

export interface GraphQlStream {
  id: string;
  addressInOut: string;
  updatedAtTimestamp: Date;
  token: Token;
  streamedUntilUpdatedAt: BigNumber;
  userData?: string;
}
