import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Building2, Plus, Search } from "lucide-react";
import { listBusinesses } from "@/lib/businesses";

export const metadata: Metadata = { title: "Businesses" };
export const dynamic = "force-dynamic";

export default async function BusinessesPage({ searchParams }: { searchParams: Promise<{ q?: string; deleted?: string }> }) {
  const params = await searchParams;
  const query = (params.q || "").trim();
  const businesses = await listBusinesses(query);
  return <>
    <header className="admin-top"><div><h1>Businesses</h1><p>Save each customer once, then assign its review destination to any card.</p></div><Link className="button button-dark" href="/dashboard/businesses/new"><Plus size={17} /> Add business</Link></header>
    {params.deleted ? <div className="alert alert-success">Business deleted. Its existing cards kept their saved destinations.</div> : null}
    <section className="panel" style={{ marginBottom: 18 }}>
      <form className="card-filters" method="get" style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}>
        <label className="search-field"><Search size={16} /><input name="q" defaultValue={query} placeholder="Search businesses or contacts" aria-label="Search businesses" /></label>
        <button className="button button-dark" type="submit">Search</button>
      </form>
    </section>
    {businesses.length ? <div className="business-grid">{businesses.map((business) => (
      <Link className="business-card" href={`/dashboard/businesses/${business.id}`} key={business.id}>
        <div className="business-card-head"><div><Building2 size={20} /><h2>{business.name}</h2></div><ArrowUpRight size={18} /></div>
        <p>{business.review_url}</p>
        {business.address ? <p>{business.address}</p> : null}
        <div className="business-card-meta"><span>{business.card_count} card{business.card_count === 1 ? "" : "s"}</span><span>{business.contact_name || "No contact added"}</span></div>
      </Link>
    ))}</div> : <div className="panel empty-state">{query ? "No businesses match your search." : "No businesses yet. Add your first customer profile."}</div>}
  </>;
}
