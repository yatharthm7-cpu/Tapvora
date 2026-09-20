import type { Metadata } from "next";
import { Link2, RefreshCw, ScanLine, Star } from "lucide-react";
import { PublicPage } from "@/components/public-page";

export const metadata: Metadata = { title: "How it works", description: "Learn how Tapvora connects one NFC tap and QR scan to a business's Google Review destination." };

export default function HowItWorksPage() {
  return <PublicPage kicker="The Tapvora flow" title="One card. Two ways to reach the review page." intro="NFC and QR use the same permanent Tapvora link, keeping setup, testing, and future destination changes manageable.">
    <section className="public-grid two how-grid"><article className="info-card"><ScanLine size={26} /><span>01</span><h2>Tap or scan</h2><p>The customer taps the NFC area or scans the QR code printed on the card.</p></article><article className="info-card"><Link2 size={26} /><span>02</span><h2>Permanent link opens</h2><p>The unique Tapvora card URL identifies the correct physical card.</p></article><article className="info-card"><RefreshCw size={26} /><span>03</span><h2>Live destination resolves</h2><p>Tapvora checks the current destination saved for that business and redirects the visitor.</p></article><article className="info-card"><Star size={26} /><span>04</span><h2>Customer chooses to review</h2><p>The Google Review destination opens. The customer independently chooses whether and what to post.</p></article></section>
    <section className="notice-card"><strong>Designed for honest feedback</strong><p>Tapvora shortens the path to the review screen. It does not filter customers, generate reviews, promise ratings, or replace the customer&apos;s genuine experience.</p></section>
  </PublicPage>;
}
