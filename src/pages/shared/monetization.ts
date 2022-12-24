// @ts-ignore
const pendingMonetization = (to, uuid) => {
  class Monetization extends EventTarget {
    state = "stopped";

    // @ts-ignore
    constructor(newValue) {
      super();
      this.state = newValue ?? "stopped";
    }
  }

  class MonetizationPending extends Event {
    paymentPointer;
    requestId;

    // @ts-ignore
    constructor({ paymentPointer, requestId }) {
      super("pending");
      this.paymentPointer = paymentPointer;
      this.requestId = requestId;
    }
  }
  document.monetization = new Monetization("pending");
  document.monetization.dispatchEvent(
    new MonetizationPending({
      paymentPointer: to,
      requestId: uuid,
    })
  );
};

// @ts-ignore
const startMonetization = (to, uuid) => {
  class Monetization extends EventTarget {
    state = "stopped";

    // @ts-ignore
    constructor(newValue) {
      super();
      this.state = newValue ?? "stopped";
    }
  }

  class MonetizationStart extends Event {
    paymentPointer;
    requestId;

    // @ts-ignore
    constructor({ paymentPointer, requestId }) {
      super("started");
      this.paymentPointer = paymentPointer;
      this.requestId = requestId;
    }
  }

  document.monetization = new Monetization("started");
  document.monetization.dispatchEvent(
    new MonetizationStart({
      paymentPointer: to,
      requestId: uuid,
    })
  );
};

// @ts-ignore
const stopMonetization = (to, uuid) => {
  class Monetization extends EventTarget {
    state = "stopped";

    // @ts-ignore
    constructor(newValue) {
      super();
      this.state = newValue ?? "stopped";
    }
  }

  class MonetizationStop extends Event {
    paymentPointer;
    requestId;
    finalized;
    // @ts-ignore
    constructor({ paymentPointer, requestId, finalized }) {
      super("stopped");
      this.paymentPointer = paymentPointer;
      this.requestId = requestId;
      this.finalized = finalized ?? false;
    }
  }

  document.monetization = new Monetization("stopped");
  document.monetization.dispatchEvent(
    new MonetizationStop({
      paymentPointer: to,
      requestId: uuid,
      finalized: true,
    })
  );
};

export { pendingMonetization, startMonetization, stopMonetization };
