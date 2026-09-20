import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, CreditCard, MousePointerClick, Save } from "lucide-react";
import { notFound } from "next/navigation";
import { DeleteBusinessForm } from "@/components/delete-business-form";
import { getBusinessAnalytics } from "@/lib/analytics";
import { getBusiness } from "@/lib/businesses";
import { serialFor } from "@/lib/types";
import { updateBusinessAction } from "../actions";

export const metadata: Metadata = { title: "Manage business" };
export const dynamic = "force-dynamic";

function friendlyDate(value: string | null) {
  return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Never";
}

export default async function BusinessPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string; created?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [business, analytics] = await Promise.all([getBusiness(id), getBusinessAnalytics(id)]);
  if (!business) notFound();
  const maxDaily = Math.max(1, ...analytics.daily.map((day) => day.count));

  return <>
    <header className="admin-top"><div><h1>{business.name}</h1><p>{business.card_count} assigned card{business.card_count === 1 ? "" : "s"}</p></div><Link className="button button-soft" href="/dashboard/businesses"><ArrowLeft size={17} /> Back</Link></header>
    {query.error ? <div className="alert alert-error">{query.error}</div> : null}
    {query.saved || query.created ? <div className="alert alert-success">Business saved successfully.</div> : null}

    <section className="stats-grid" aria-label={`${business.name} analytics`}>
      <div className="stat-card"><span className="stat-label">Total opens</span><div className="stat-value"><b>{analytics.total}</b><span className="stat-icon"><MousePointerClick size={18} /></span></div></div>
      <div className="stat-card"><span className="stat-label">Opens today</span><div className="stat-value"><b>{analytics.today}</b><span className="stat-icon"><CalendarDays size={18} /></span></div></div>
      <div className="stat-card"><span className="stat-label">Cards assigned</span><div className="stat-value"><b>{analytics.cards.length}</b><span className="stat-icon"><CreditCard size={18} /></span></div></div>
      <div className="stat-card"><span className="stat-label">Last opened</span><div className="stat-value stat-date"><b>{friendlyDate(analytics.lastOpened)}</b></div></div>
    </section>

    <section className="panel analytics-panel">
      <div className="panel-head"><div><h2>Last 7 days</h2><p>Combined QR and NFC opens for this business.</p></div><strong>{analytics.lastSevenDays} opens</strong></div>
      <div className="activity-chart">{analytics.daily.map((day) => <div className="activity-day" key={day.date}><span className="activity-count">{day.count}</span><div className="activity-track"><span style={{ height: `${Math.max(day.count ? 12 : 2, (day.count / maxDaily) * 100)}%` }} /></div><span className="activity-label">{day.label}</span></div>)}</div>
    </section>

    <section className="panel business-cards-panel">
      <div className="panel-head"><div><h2>Assigned cards</h2><p>Every permanent card currently connected to this business.</p></div></div>
      {analytics.cards.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Card</th><th>Status</th><th>Opens</th><th>Last opened</th><th /></tr></thead><tbody>{analytics.cards.map((card) => <tr key={card.id}><td><span className="card-code">{serialFor(card.card_number)}</span></td><td><span className={`status status-${card.status}`}>{card.status}</span></td><td>{card.redirect_count}</td><td>{friendlyDate(card.last_redirected_at)}</td><td><Link aria-label={`Open ${serialFor(card.card_number)}`} href={`/dashboard/cards/${card.id}`}><ArrowUpRight size={17} /></Link></td></tr>)}</tbody></table></div> : <div className="empty-state">No cards are assigned to this business yet.</div>}
    </section>

    <div className="business-manage-grid">
      <form action={updateBusinessAction}><input type="hidden" name="id" value={business.id} /><section className="form-card"><h2>Business details</h2><p>Changing the name or review link also updates every assigned card.</p><div className="form-grid">
        <div className="field"><label htmlFor="name">Business name</label><input className="input" id="name" name="name" defaultValue={business.name} required /></div>
        <div className="field"><label htmlFor="contact_name">Contact name</label><input className="input" id="contact_name" name="contact_name" defaultValue={business.contact_name || ""} /></div>
        <div className="field field-full"><label htmlFor="review_url">Google Review URL</label><input className="input" id="review_url" name="review_url" type="url" defaultValue={business.review_url} required /></div>
        <div className="field"><label htmlFor="contact_email">Email</label><input className="input" id="contact_email" name="contact_email" type="email" defaultValue={business.contact_email || ""} /></div>
        <div className="field"><label htmlFor="contact_phone">Phone</label><input className="input" id="contact_phone" name="contact_phone" type="tel" defaultValue={business.contact_phone || ""} /></div>
        <div className="field field-full"><label htmlFor="notes">Internal notes</label><textarea className="textarea" id="notes" name="notes" rows={3} defaultValue={business.notes || ""} /></div>
      </div><div className="form-actions"><button className="button button-dark" type="submit"><Save size={16} /> Save changes</button></div></section></form>
      <section className="form-card danger-zone"><h2>Delete business</h2><p>The assigned cards will keep their current business name and review destination.</p><DeleteBusinessForm id={business.id} name={business.name} /></section>
    </div>
  </>;
}
