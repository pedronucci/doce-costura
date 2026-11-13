import type { Metadata } from "next";
import { CheckoutReview } from "@/components/checkout/checkout-review";
import { Suspense } from "react";
import { getSession } from "@/lib/auth/guard";
import { checkoutAccountData } from "@/app/(loja)/conta/actions";

export const metadata: Metadata = {
  title: "Revisar suas escolhas",
  robots: { index: false, follow: false },
};
export const instant = false;

export default function CheckoutPage() {
  return <Suspense fallback={<p role="status" className="p-12 text-center">Preparando sua revisão…</p>}><CheckoutContent /></Suspense>;
}

async function CheckoutContent() {
  const session = await getSession();
  return <CheckoutReview account={session ? await checkoutAccountData() : null} />;
}
