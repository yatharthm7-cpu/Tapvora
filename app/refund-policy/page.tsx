import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
export const metadata: Metadata = { title: "Refund Policy" };
export default function RefundPolicyPage() { return <LegalPage title="Refund Policy" intro="Because Tapvora products may be printed and programmed for a specific order, refund eligibility depends on the production stage and the written order confirmation.">
  <h2>Before production</h2><p>Cancellation requests made before printing, programming, or customization begins will be reviewed according to the payment and cancellation terms in the written quote.</p>
  <h2>Customized products</h2><p>Once custom production has started, change-of-mind cancellations may not be eligible for a refund because the products cannot normally be resold.</p>
  <h2>Incorrect or defective products</h2><p>If an order arrives damaged, materially defective, or different from the approved order, contact Tapvora promptly with the order details and clear photos or video. After verification, Tapvora may repair, replace, or refund the affected items as appropriate.</p>
  <h2>Third-party services</h2><p>Changes, restrictions, or outages affecting Google, NFC-compatible phones, browsers, networks, or other third-party services do not by themselves make a correctly supplied physical product defective.</p>
</LegalPage>; }
