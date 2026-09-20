import type { Metadata } from "next";
import { CardSetupWizard } from "@/components/card-setup-wizard";
import { listBusinesses } from "@/lib/businesses";
import { listCards } from "@/lib/cards";
import { serialFor } from "@/lib/types";

export const metadata: Metadata = { title: "Card setup" };
export const dynamic = "force-dynamic";

export default async function SetupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [cards, businesses, query] = await Promise.all([listCards(), listBusinesses(), searchParams]);
  return <div className="wizard-shell">
    <header className="admin-top"><div><h1>Card setup wizard</h1><p>Connect one permanent NFC and QR card to the correct business.</p></div></header>
    {query.error ? <div className="alert alert-error">{query.error}</div> : null}
    {cards.length ? <CardSetupWizard
      cards={cards.map((card) => ({ id: card.id, label: serialFor(card.card_number), code: card.code, status: card.status }))}
      businesses={businesses.map((business) => ({ id: business.id, name: business.name, reviewUrl: business.review_url, address: business.address || "" }))}
    /> : <div className="panel empty-state">Create cards before starting the setup wizard.</div>}
  </div>;
}
