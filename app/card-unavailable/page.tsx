import Link from "next/link";
import { Radio } from "lucide-react";

export default async function CardUnavailablePage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  const missing = reason === "not-found";

  return (
    <main className="unavailable">
      <div className="unavailable-card">
        <div className="unavailable-icon"><Radio /></div>
        <h1>{missing ? "Card not found" : "This card isn’t active yet"}</h1>
        <p>{missing ? "We couldn’t find a Tapvora card for this link. Please check the printed address or contact the business." : "The card is ready, but its review destination has not been activated. Please try again later."}</p>
        <Link className="button button-dark" href="/">Visit Tapvora</Link>
      </div>
    </main>
  );
}
