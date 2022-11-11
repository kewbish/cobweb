import { BigNumber } from "ethers";

class Monetization extends EventTarget {
  _state: string | undefined;

  constructor(newValue: string) {
    super();
    this._state = newValue ?? undefined;
  }

  get state() {
    return this._state;
  }
  set state(newValue) {
    this._state = newValue;
  }
}

class MonetizationPending extends Event {
  _pp: string | undefined;
  _rId: string | undefined;

  constructor({
    paymentPointer,
    requestId,
  }: {
    paymentPointer: string;
    requestId: string;
  }) {
    super("pending");
    this._pp = paymentPointer;
    this._rId = requestId;
  }

  get paymentPointer() {
    return this._pp;
  }

  get requestId() {
    return this._rId;
  }
}

class MonetizationStart extends Event {
  _pp: string | undefined;
  _rId: string | undefined;
  constructor({
    paymentPointer,
    requestId,
  }: {
    paymentPointer: string;
    requestId: string;
  }) {
    super("started");
    this._pp = paymentPointer;
    this._rId = requestId;
  }

  get paymentPointer() {
    return this._pp;
  }

  get requestId() {
    return this._rId;
  }
}

class MonetizationStop extends Event {
  _pp: string | undefined;
  _rId: string | undefined;
  _fin: boolean | undefined;
  constructor({
    paymentPointer,
    requestId,
    finalized,
  }: {
    paymentPointer: string;
    requestId: string;
    finalized: boolean;
  }) {
    super("stopped");
    this._pp = paymentPointer;
    this._rId = requestId;
    this._fin = finalized ?? false;
  }

  get paymentPointer() {
    return this._pp;
  }

  get requestId() {
    return this._rId;
  }

  get finalized() {
    return this._fin;
  }

  set finalized(_) {
    this._fin = true;
  }
}

class MonetizationProgress extends Event {
  _pp: string | undefined;
  _rId: string | undefined;
  _amt: BigNumber | undefined;
  _assC: string | undefined;
  _assS: number | undefined;
  _rec: string | undefined;
  constructor({
    paymentPointer,
    requestId,
    amount,
    assetCode,
    assetScale,
    receipt,
  }: {
    paymentPointer: string;
    requestId: string;
    amount: BigNumber;
    assetCode: string;
    assetScale: number;
    receipt: string;
  }) {
    super("monetizationprogress");
    this._pp = paymentPointer;
    this._rId = requestId;
    this._amt = amount;
    this._assC = assetCode;
    this._assS = assetScale;
    this._rec = receipt;
  }

  get paymentPointer() {
    return this._pp;
  }

  get requestId() {
    return this._rId;
  }

  get amount() {
    return this._amt;
  }

  get assetCode() {
    return this._assC;
  }

  get assetScale() {
    return this._assS;
  }

  get receipt() {
    return this._rec;
  }

  set receipt(newValue) {
    this._rec = newValue;
  }
}

export {
  Monetization,
  MonetizationStart,
  MonetizationPending,
  MonetizationProgress,
  MonetizationStop,
};
