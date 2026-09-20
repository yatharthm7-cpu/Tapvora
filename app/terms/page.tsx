import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
export const metadata: Metadata = { title: "Terms of Use" };
export default function TermsPage() { return <LegalPage title="Terms of Use" intro="These terms govern use of the Tapvora website, dashboard, redirect service, and NFC/QR products.">
  <h2>Product purpose</h2><p>Tapvora cards make it easier for customers to reach a business review destination using NFC or QR. Tapvora does not create reviews, guarantee review volume or ratings, or control third-party platforms such as Google.</p>
  <h2>Responsible use</h2><p>Customers must use genuine business destinations and follow applicable platform policies. Tapvora must not be used for fake, incentivized, misleading, unlawful, or abusive review activity.</p>
  <h2>Orders and customization</h2><p>Pricing, quantities, artwork, programming, delivery estimates, and payment terms are confirmed in the written quote or order confirmation. Customers are responsible for checking approved details before production begins.</p>
  <h2>Availability</h2><p>Tapvora aims to keep permanent links available, but uninterrupted operation cannot be guaranteed. Maintenance, network providers, third-party services, or events outside reasonable control may affect availability.</p>
  <h2>Ownership</h2><p>Tapvora branding, website design, software, and supplied artwork remain protected intellectual property. A purchase does not transfer ownership of the Tapvora platform or administrative software.</p>
</LegalPage>; }
