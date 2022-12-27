import { Monetization } from "./pages/shared/monetization";

declare global {
  interface Document {
    monetization: Monetization;
  }
}
