import type { Metadata } from "next";
import { BadgeCheck, Quote } from "lucide-react";
import { PublicPage } from "@/components/public-page";

export const metadata: Metadata = { title: "Customer stories", description: "Verified Tapvora customer case studies and testimonials, published only with permission." };

export default function CustomerStoriesPage() {
  return <PublicPage kicker="Real customers only" title="Customer stories, without the fiction." intro="Tapvora publishes testimonials and case studies only after verifying the customer and receiving permission to share their experience.">
    <section className="stories-empty"><Quote size={34} /><h2>Verified stories will appear here.</h2><p>There are no public case studies yet. We will not fill this page with placeholder names, stock portraits, invented quotations, or unsupported performance claims.</p></section>
    <section className="public-grid three"><article className="info-card"><BadgeCheck size={24} /><h2>Verified identity</h2><p>The business and its relationship with Tapvora must be confirmed.</p></article><article className="info-card"><BadgeCheck size={24} /><h2>Permission recorded</h2><p>The customer must agree to the wording and the information being published.</p></article><article className="info-card"><BadgeCheck size={24} /><h2>Evidence-based results</h2><p>Any performance figures must come from real Tapvora records and include enough context to be meaningful.</p></article></section>
  </PublicPage>;
}
