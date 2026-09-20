import type { Metadata } from "next";
import { PublicPage } from "@/components/public-page";

export const metadata: Metadata = { title: "Product specifications", description: "Dimensions, link system, phone requirements, and production details for Tapvora review cards." };

const specs = [
  ["Card dimensions", "85 × 54 mm"],
  ["Customer interactions", "NFC tap and printed QR scan"],
  ["Link system", "One unique permanent Tapvora URL per card"],
  ["Destination", "A business's saved Google Review link"],
  ["Destination updates", "Can be changed without replacing the permanent URL"],
  ["QR fallback", "Available if NFC is unsupported or disabled"],
  ["Phone requirements", "Compatible NFC or camera phone with an internet connection"],
  ["Production artwork", "Phone-compatible PNG generated for the exact card layout"],
] as const;

export default function SpecificationsPage() {
  return <PublicPage kicker="Product details" title="Simple hardware. Flexible destination." intro="The physical card keeps one permanent identity while Tapvora controls where its NFC tap and QR scan lead.">
    <section className="spec-table" aria-label="Tapvora product specifications">{specs.map(([label, value]) => <div key={label}><strong>{label}</strong><span>{value}</span></div>)}</section>
    <section className="public-section"><h2>Compatibility notes</h2><p>NFC performance depends on the phone model, device settings, antenna position, card placement, and the physical environment. The printed QR is included as a universal fallback. Google services, internet access, and the business listing are operated by third parties and are not controlled by Tapvora.</p></section>
  </PublicPage>;
}
