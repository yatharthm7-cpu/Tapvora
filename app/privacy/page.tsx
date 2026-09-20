import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
export const metadata: Metadata = { title: "Privacy Policy" };
export default function PrivacyPage() { return <LegalPage title="Privacy Policy" intro="This policy explains what Tapvora collects and how it is used when you visit the website, request a quote, or use a Tapvora card.">
  <h2>Information we collect</h2><p>Quote requests may include your name, business name, phone number, email address, requested quantity, and message. The administration system also stores card destinations, business details entered by the administrator, and aggregated card-open information.</p>
  <h2>How we use information</h2><p>We use information to answer enquiries, prepare quotes, provide and support Tapvora products, operate redirects, prevent misuse, and improve reliability. We do not sell personal information.</p>
  <h2>Service providers</h2><p>Tapvora uses hosting and database providers to operate the website securely. These providers process information only as needed to supply their services.</p>
  <h2>Retention and security</h2><p>Information is retained only while reasonably needed for enquiries, orders, support, legal obligations, and system security. Reasonable technical and organizational safeguards are used, but no internet service can guarantee absolute security.</p>
  <h2>Your choices</h2><p>You may ask Tapvora to correct or delete personal information associated with a quote request, subject to legitimate record-keeping and legal requirements.</p>
</LegalPage>; }
