import type { Metadata } from "next";
import { ExternalLink, LogOut, Radio, Save, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { requireCustomer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { serialFor, type Business, type TapvoraCard } from "@/lib/types";
import { customerLogoutAction, updateCustomerReviewLinkAction } from "./actions";

export const metadata: Metadata = { title: "My business" };
export const dynamic = "force-dynamic";

type OwnedBusiness = Business & { cards: Pick<TapvoraCard, "id" | "card_number" | "code" | "status" | "redirect_count">[] };

export default async function CustomerAccountPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const [customer, query] = await Promise.all([requireCustomer(), searchParams]);
  const supabase = await createClient();
  const { data, error } = await supabase.from("businesses").select("*, cards(id, card_number, code, status, redirect_count)").order("created_at", { ascending: true });
  const businesses = (data || []) as unknown as OwnedBusiness[];

  return <main className="customer-account-page">
    <header className="customer-account-nav shell"><Brand href="/account" /><div><span>{customer.email}</span><form action={customerLogoutAction}><button className="button button-soft button-small" type="submit"><LogOut size={15} /> Sign out</button></form></div></header>
    <section className="customer-account-shell shell">
      <div className="customer-account-heading"><span className="eyebrow">Business account</span><h1 className="display">Your Tapvora cards.</h1><p>Update the Google Review destination without changing the QR code or rewriting the NFC chip.</p></div>
      {query.error || error ? <div className="alert alert-error">{query.error || "Your business account could not be loaded."}</div> : null}
      {query.saved ? <div className="alert alert-success">The new review link is live on every card assigned to this business.</div> : null}
      {!businesses.length && !error ? <div className="account-empty"><ShieldCheck size={34} /><h2>No business is connected to this email</h2><p>Use the same email address entered during card activation, or contact Tapvora support.</p></div> : null}
      <div className="customer-business-list">{businesses.map((business) => <article className="customer-business-card" key={business.id}>
        <div className="customer-business-head"><div><span>Business</span><h2>{business.name}</h2><p>{business.contact_name}{business.contact_phone ? ` · ${business.contact_phone}` : ""}</p></div><span className="security-badge"><ShieldCheck size={16} /> Verified owner</span></div>
        <form action={updateCustomerReviewLinkAction} className="customer-link-form"><input type="hidden" name="business_id" value={business.id} /><label><span>Google Review link</span><input className="input" name="review_url" type="url" inputMode="url" defaultValue={business.review_url} required /></label><button className="button button-dark" type="submit"><Save size={16} /> Update link</button></form>
        <div className="customer-card-grid">{business.cards.map((card) => <div className="customer-card-item" key={card.id}><div><Radio size={18} /><span><strong>{serialFor(card.card_number)}</strong><small>{card.redirect_count} opens · {card.status}</small></span></div><a href={`/r/${card.code}`} target="_blank" rel="noreferrer" aria-label={`Test ${serialFor(card.card_number)}`}><ExternalLink size={17} /></a></div>)}</div>
      </article>)}</div>
    </section>
  </main>;
}
