import type { Metadata } from "next";
import { PackageCheck, PackageOpen, Truck } from "lucide-react";
import { PublicPage } from "@/components/public-page";

export const metadata: Metadata = { title: "Shipping and delivery", description: "Tapvora order preparation, shipping, delivery checks, and support information." };

export default function ShippingPage() {
  return <PublicPage kicker="Order fulfilment" title="Shipping and delivery information." intro="Every order is prepared according to its written quote. Final charges and timelines are confirmed before production begins.">
    <section className="public-grid three"><article className="info-card"><PackageOpen size={25} /><h2>Before production</h2><p>Tapvora confirms the quantity, artwork requirements, destination city, delivery details, price, and estimated schedule in writing.</p></article><article className="info-card"><PackageCheck size={25} /><h2>Before dispatch</h2><p>Cards are matched to their permanent URLs and checked for QR scanning and NFC response before they are marked ready.</p></article><article className="info-card"><Truck size={25} /><h2>Delivery</h2><p>Shipping method, tracking availability, charges, and estimated arrival depend on the order and destination and are shared in the order confirmation.</p></article></section>
    <section className="public-section"><h2>When your order arrives</h2><ul className="public-list"><li>Check the package and quantity promptly.</li><li>Match the printed Card IDs with the customer handover document.</li><li>Test one NFC tap and one QR scan before placing the cards.</li><li>Report visible damage, missing items, or a card issue with photos and the relevant Card ID.</li></ul></section>
    <section className="notice-card"><strong>No invented delivery promises</strong><p>Tapvora does not publish a fixed delivery window that may not apply to your location. Your written quote or order confirmation is the source of truth for timing, shipping charges, and replacement terms.</p></section>
  </PublicPage>;
}
