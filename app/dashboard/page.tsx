import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, CreditCard, MousePointerClick, Plus, Radio, Search } from "lucide-react";
import { listCards } from "@/lib/cards";
import { getDashboardAnalytics } from "@/lib/analytics";
import { serialFor, type CardStatus } from "@/lib/types";
import { SITE_URL, isSupabaseConfigured } from "@/lib/config";
import { DeleteAllCardsForm } from "@/components/delete-all-cards-form";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

function friendlyDate(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

type DashboardParams = { created?: string; saved?: string; deleted?: string; deleted_count?: string; error?: string; q?: string; status?: string };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<DashboardParams> }) {
  const params = await searchParams;
  const status = ["active", "inactive", "unused"].includes(params.status || "") ? params.status as CardStatus : "all";
  const query = (params.q || "").trim();
  const [allCards, cards, analytics] = await Promise.all([
    listCards(),
    listCards({ query, status }),
    getDashboardAnalytics(),
  ]);
  const active = allCards.filter((card) => card.status === "active").length;
  const redirects = allCards.reduce((sum, card) => sum + Number(card.redirect_count || 0), 0);
  const isDemo = !isSupabaseConfigured();
  const maxDaily = Math.max(1, ...analytics.daily.map((day) => day.count));
  const isFiltered = Boolean(query || status !== "all");

  return (
    <>
      <header className="admin-top">
        <div><h1>Cards overview</h1><p>Live card inventory and real combined QR and NFC opens.</p></div>
        <Link className="button button-dark" href="/dashboard/cards/new"><Plus size={17} /> Create cards</Link>
      </header>

      {isDemo ? <div className="alert alert-demo">Demo mode is active. No live card data is connected, so all totals remain at zero.</div> : null}
      {!isDemo && !analytics.eventTrackingReady ? <div className="alert alert-demo">Lifetime totals are live. Run migration 003 to enable today and 7-day analytics.</div> : null}
      {params.error ? <div className="alert alert-error">{params.error}</div> : null}
      {params.created ? <div className="alert alert-success">{params.created} card{params.created === "1" ? "" : "s"} created successfully.</div> : null}
      {params.saved ? <div className="alert alert-success">Card changes saved.</div> : null}
      {params.deleted === "1" ? <div className="alert alert-success">Card deleted successfully.</div> : null}
      {params.deleted === "all" ? <div className="alert alert-success">All {Number(params.deleted_count || 0)} cards were deleted. The next card will be TV-0001.</div> : null}

      <section className="stats-grid" aria-label="Real card statistics">
        <div className="stat-card"><span className="stat-label">Total cards</span><div className="stat-value"><b>{allCards.length}</b><span className="stat-icon"><CreditCard size={18} /></span></div></div>
        <div className="stat-card"><span className="stat-label">Active cards</span><div className="stat-value"><b>{active}</b><span className="stat-icon"><Radio size={18} /></span></div></div>
        <div className="stat-card"><span className="stat-label">Total opens</span><div className="stat-value"><b>{redirects}</b><span className="stat-icon"><MousePointerClick size={18} /></span></div></div>
        <div className="stat-card"><span className="stat-label">Opens today</span><div className="stat-value"><b>{analytics.today}</b><span className="stat-icon"><CalendarDays size={18} /></span></div></div>
      </section>

      <section className="panel analytics-panel">
        <div className="panel-head"><div><h2>Last 7 days</h2><p>Real opens recorded after analytics was enabled.</p></div><strong>{analytics.lastSevenDays} opens</strong></div>
        <div className="activity-chart" aria-label={`${analytics.lastSevenDays} opens over the last seven days`}>
          {analytics.daily.map((day) => (
            <div className="activity-day" key={day.date}>
              <span className="activity-count">{day.count}</span>
              <div className="activity-track"><span style={{ height: `${Math.max(day.count ? 12 : 2, (day.count / maxDaily) * 100)}%` }} /></div>
              <span className="activity-label">{day.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head cards-panel-head"><div><h2>All physical cards</h2><p>Search real inventory by Card ID, code, or business name.</p></div><span className="muted record-count">{cards.length}{isFiltered ? ` of ${allCards.length}` : ""} records</span></div>
        <form className="card-filters" method="get">
          <label className="search-field"><Search size={16} /><input name="q" defaultValue={query} placeholder="Search cards or businesses" aria-label="Search cards or businesses" /></label>
          <select className="select filter-select" name="status" defaultValue={status} aria-label="Filter by card status">
            <option value="all">All statuses</option><option value="active">Active</option><option value="unused">Unused</option><option value="inactive">Inactive</option>
          </select>
          <button className="button button-dark" type="submit">Apply</button>
          {isFiltered ? <Link className="button button-soft" href="/dashboard">Clear</Link> : null}
        </form>
        {cards.length ? (
          <>
          <div className="table-wrap desktop-card-table">
            <table className="data-table">
              <thead><tr><th>Card</th><th>Permanent URL</th><th>Business</th><th>Status</th><th>Opens</th><th>Last opened</th><th /></tr></thead>
              <tbody>{cards.map((card) => (
                <tr key={card.id}>
                  <td><span className="card-code">{serialFor(card.card_number)}</span></td>
                  <td><span className="muted">{SITE_URL.replace("https://", "")}/r/</span><strong>{card.code}</strong></td>
                  <td>{card.business_name || <span className="muted">Not assigned</span>}</td>
                  <td><span className={`status status-${card.status}`}>{card.status}</span></td>
                  <td>{card.redirect_count}</td>
                  <td className="muted">{friendlyDate(card.last_redirected_at)}</td>
                  <td><Link aria-label={`Open ${serialFor(card.card_number)}`} href={`/dashboard/cards/${card.id}`}><ArrowUpRight size={17} /></Link></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="mobile-card-list">
            {cards.map((card) => (
              <Link className="mobile-card-row" href={`/dashboard/cards/${card.id}`} key={card.id}>
                <div><strong className="card-code">{serialFor(card.card_number)}</strong><span className={`status status-${card.status}`}>{card.status}</span></div>
                <p>{card.business_name || "Not assigned"}</p>
                <div className="mobile-card-meta"><span>{card.redirect_count} opens</span><span>{friendlyDate(card.last_redirected_at)}</span><ArrowUpRight size={17} /></div>
              </Link>
            ))}
          </div>
          </>
        ) : <div className="empty-state">{isFiltered ? "No cards match those filters." : "No cards yet. Create the first batch to generate permanent links."}</div>}
      </section>

      {allCards.length ? (
        <section className="panel delete-all-panel">
          <div>
            <h2>Delete all cards</h2>
            <p>Permanently remove every card and its analytics. Card numbering will restart from TV-0001.</p>
          </div>
          <DeleteAllCardsForm count={allCards.length} />
        </section>
      ) : null}
    </>
  );
}
