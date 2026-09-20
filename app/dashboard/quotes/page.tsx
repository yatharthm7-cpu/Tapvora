import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { listQuoteRequests } from "@/lib/quotes";

export const metadata: Metadata = { title: "Quote requests" };
export const dynamic = "force-dynamic";

export default async function QuoteRequestsPage() {
  const quotes = await listQuoteRequests();
  return <><header className="admin-top"><div><h1>Quote requests</h1><p>Real enquiries submitted through the public Tapvora website.</p></div></header>
    <section className="panel"><div className="panel-head"><div><h2>Enquiries</h2><p>Newest requests appear first.</p></div><span className="muted">{quotes.length} total</span></div>
      {quotes.length ? <div className="quote-admin-list">{quotes.map((quote) => <article className="quote-admin-card" key={quote.id}>
        <div className="quote-admin-head"><div><strong>{quote.business_name}</strong><span>{quote.name}</span></div><span className={`status status-${quote.status === "new" ? "active" : "unused"}`}>{quote.status}</span></div>
        <div className="quote-admin-details"><span>{quote.quantity} card{quote.quantity === 1 ? "" : "s"}</span>{quote.phone ? <a href={`tel:${quote.phone}`}>{quote.phone}</a> : null}{quote.email ? <a href={`mailto:${quote.email}`}>{quote.email}</a> : null}<time>{new Date(quote.created_at).toLocaleString("en-IN")}</time></div>
        {quote.message ? <p>{quote.message}</p> : null}
      </article>)}</div> : <div className="empty-state"><Inbox size={28} /><p>No quote requests yet.</p></div>}
    </section></>;
}
