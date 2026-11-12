import type { Metadata } from "next";
import { CheckoutReview } from "@/components/checkout/checkout-review";

export const metadata: Metadata = {
  title: "Revisar suas escolhas",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutReview />;
}
