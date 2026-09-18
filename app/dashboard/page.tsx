import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowUpRight, CreditCard, MousePointerClick, Plus, Radio } from "lucide-react";
import { listCards } from "@/lib/cards";
import { serialFor } from "@/lib/types";
import { SITE_URL, isSupabaseConfigured } from "@/lib/config";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

function friendlyDate(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ created?: string; saved?: string; error?: string }> }) {
  const params = await searchParams;
  const cards = await listCards();
  const active = cards.filter((card) => card.status === "active").length;
  const unused = cards.filter((card) => card.status === "unused").length;
  const redirects = cards.reduce((sum, card) => sum + Number(card.redirect_count || 0), 0);
  const isDemo = !isSupabaseConfigured();

  return (
    <>
      <header className="admin-top">
        <div><h1>Cards overview</h1><p>Manage permanent Tapvora links and their destinations.</p></div>
        <Link className="button button-dark" href="/dashboard/cards/new"><Plus size={17} /> Create cards</Link>
      </header>

      {isDemo ? <div className="alert alert-demo">Demo mode is active. No live card data is connected, so all totals remain at zero.</div> : null}
      {params.error ? <div className="alert alert-error">{params.error}</div> : null}
      {params.created ? <div className="alert alert-success">{params.created} card{params.created === "1" ? "" : "s"} created successfully.</div> : null}
      {params.saved ? <div className="alert alert-success">Card changes saved.</div> : null}

      <section className="stats-grid" aria-label="Card statistics">
        <div className="stat-card"><span className="stat-label">Total cards</span><div className="stat-value"><b>{cards.length}</b><span className="stat-icon"><CreditCard size={18} /></span></div></div>
        <div className="stat-card"><span className="stat-label">Active</span><div className="stat-value"><b>{active}</b><span className="stat-icon"><Radio size={18} /></span></div></div>
        <div className="stat-card"><span className="stat-label">Ready to assign</span><div className="stat-value"><b>{unused}</b><span className="stat-icon"><Activity size={18} /></span></div></div>
        <div className="stat-card"><span className="stat-label">Total opens</span><div className="stat-value"><b>{redirects}</b><span className="stat-icon"><MousePointerClick size={18} /></span></div></div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>All physical cards</h2><p>QR and NFC on each card use the same permanent URL.</p></div><span className="muted" style={{ fontSize: 12 }}>{cards.length} records</span></div>
        {cards.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Card</th><th>Permanent URL</th><th>Business</th><th>Status</th><th>Opens</th><th>Last opened</th><th /></tr></thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.id}>
                    <td><span className="card-code">{serialFor(card.card_number)}</span></td>
                    <td><span className="muted">{SITE_URL.replace("https://", "")}/r/</span><strong>{card.code}</strong></td>
                    <td>{card.business_name || <span className="muted">Not assigned</span>}</td>
                    <td><span className={`status status-${card.status}`}>{card.status}</span></td>
                    <td>{card.redirect_count}</td>
                    <td className="muted">{friendlyDate(card.last_redirected_at)}</td>
                    <td><Link aria-label={`Open ${serialFor(card.card_number)}`} href={`/dashboard/cards/${card.id}`}><ArrowUpRight size={17} /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="empty-state">No cards yet. Create the first batch to generate permanent links.</div>}
      </section>
    </>
  );
}
