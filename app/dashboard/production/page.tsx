import type { Metadata } from "next";
import { Download, FileSpreadsheet, Save } from "lucide-react";
import { listCards } from "@/lib/cards";
import { serialFor } from "@/lib/types";
import { updateProductionChecklistAction } from "@/app/dashboard/cards/actions";

export const metadata: Metadata = { title: "Production checklist" };
export const dynamic = "force-dynamic";

const checks = [
  ["nfc_written", "NFC written"],
  ["qr_printed", "QR printed"],
  ["tap_tested", "Tap tested"],
  ["scan_tested", "Scan tested"],
  ["ready_to_sell", "Ready to sell"],
] as const;

export default async function ProductionPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const [cards, query] = await Promise.all([listCards(), searchParams]);
  const ready = cards.filter((card) => card.ready_to_sell).length;

  return <>
    <header className="admin-top production-top">
      <div><h1>Production checklist</h1><p>Match each printed QR to the NFC chip carrying the same permanent URL.</p></div>
      <div className="production-downloads">
        <a className="button button-outline" href="/api/cards/bulk/csv"><FileSpreadsheet size={16} /> Export CSV</a>
        <a className="button button-dark" href="/api/cards/bulk/print"><Download size={16} /> Download all designs</a>
      </div>
    </header>
    {query.saved ? <div className="alert alert-success">Production checklist saved.</div> : null}
    {query.error ? <div className="alert alert-error">{query.error}</div> : null}
    <section className="panel">
      <div className="panel-head"><div><h2>All physical cards</h2><p>Save one row immediately after programming and testing that card.</p></div><strong>{ready} of {cards.length} ready</strong></div>
      {cards.length ? <div className="production-list">{cards.map((card) => {
        const completed = checks.filter(([key]) => card[key]).length;
        return <form className="production-row" action={updateProductionChecklistAction} key={card.id}>
          <input type="hidden" name="id" value={card.id} />
          <div className="production-card-id"><strong>{serialFor(card.card_number)}</strong><span>{card.code}</span></div>
          <div className="production-checks">{checks.map(([key, label]) => <label key={key}><input type="checkbox" name={key} defaultChecked={card[key]} /><span>{label}</span></label>)}</div>
          <div className="production-progress"><span>{completed}/5</span><i><b style={{ width: `${completed * 20}%` }} /></i></div>
          <button className="button button-soft" type="submit"><Save size={15} /> Save</button>
        </form>;
      })}</div> : <div className="empty-state">Create cards first, then track their production here.</div>}
    </section>
  </>;
}
