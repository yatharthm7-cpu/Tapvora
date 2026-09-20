import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Download, ExternalLink, Printer, Save } from "lucide-react";
import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { getCard } from "@/lib/cards";
import { listBusinesses } from "@/lib/businesses";
import { SITE_URL, isSupabaseConfigured } from "@/lib/config";
import { serialFor } from "@/lib/types";
import { DeleteCardForm } from "@/components/delete-card-form";
import { CopyLinkButton } from "@/components/copy-link-button";
import { updateCardAction } from "../actions";

export const metadata: Metadata = { title: "Manage card" };
export const dynamic = "force-dynamic";

export default async function CardDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const [card, businesses] = await Promise.all([getCard(id), listBusinesses()]);
  if (!card) notFound();

  const permanentUrl = `${SITE_URL}/r/${card.code}`;
  const qrDataUrl = await QRCode.toDataURL(permanentUrl, { errorCorrectionLevel: "H", margin: 3, width: 700, color: { dark: "#13211d", light: "#ffffff" } });
  const demo = !isSupabaseConfigured();

  return (
    <>
      <header className="admin-top">
        <div><h1>{serialFor(card.card_number)}</h1><p>Permanent code <strong>{card.code}</strong> · created {new Date(card.created_at).toLocaleDateString("en-IN")}</p></div>
        <Link className="button button-soft" href="/dashboard"><ArrowLeft size={17} /> Back</Link>
      </header>
      {query.error ? <div className="alert alert-error">{query.error}</div> : null}
      {query.saved ? <div className="alert alert-success">Card changes saved.</div> : null}
      {demo ? <div className="alert alert-demo">Demo mode: the form validates normally, but changes reset because no database is connected.</div> : null}

      <div className="detail-grid">
        <div className="detail-stack">
          <form action={updateCardAction}>
            <input type="hidden" name="id" value={card.id} />
            <section className="form-card">
              <h2>Business & destination</h2>
              <p>Assign the card and control where tap and scan visitors go.</p>
              <div className="form-grid">
                <div className="field field-full">
                  <label htmlFor="business_id">Saved business profile</label>
                  <select className="select" id="business_id" name="business_id" defaultValue={card.business_id || ""}>
                    <option value="">Manual business details</option>
                    {businesses.map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}
                  </select>
                  <span className="field-help">When selected, the saved business name and review link below are used automatically.</span>
                </div>
                <div className="field">
                  <label htmlFor="business_name">Business name</label>
                  <input className="input" id="business_name" name="business_name" defaultValue={card.business_name || ""} placeholder="Enter the verified business name" />
                </div>
                <div className="field">
                  <label htmlFor="status">Card status</label>
                  <select className="select" id="status" name="status" defaultValue={card.status}>
                    <option value="unused">Unused</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="field field-full">
                  <label htmlFor="destination_url">Google Review URL</label>
                  <input className="input" id="destination_url" name="destination_url" type="url" defaultValue={card.destination_url || ""} placeholder="https://g.page/r/.../review" />
                  <span className="field-help">An active card needs a Google, Google Maps, g.page, or maps.app.goo.gl HTTPS link.</span>
                </div>
                <div className="field field-full">
                  <label htmlFor="notes">Internal notes</label>
                  <textarea className="textarea" id="notes" name="notes" rows={3} defaultValue={card.notes || ""} placeholder="Placement, customer request, or production note" />
                </div>
              </div>
              <div className="form-actions"><button className="button button-dark" type="submit"><Save size={16} /> Save card</button></div>
            </section>
          </form>

          <section className="form-card">
            <h2>Usage</h2><p>Combined opens from QR scans and NFC taps.</p>
            <div className="meta-list">
              <div className="meta-row"><span>Total opens</span><strong>{card.redirect_count}</strong></div>
              <div className="meta-row"><span>Last opened</span><strong>{card.last_redirected_at ? new Date(card.last_redirected_at).toLocaleString("en-IN") : "Never"}</strong></div>
              <div className="meta-row"><span>Current status</span><span className={`status status-${card.status}`}>{card.status}</span></div>
            </div>
          </section>

          <section className="form-card danger-zone">
            <h2>Delete card</h2>
            <p>Permanently remove this card, its redirect link, and its recorded open count.</p>
            <DeleteCardForm cardId={card.id} cardLabel={serialFor(card.card_number)} />
          </section>
        </div>

        <aside className="qr-panel">
          <h2 style={{ margin: "0 0 4px", fontFamily: "var(--font-display)" }}>Card assets</h2>
          <p className="muted" style={{ margin: "0 0 18px", fontSize: 12 }}>Use the same URL for the printed QR and the NFC NDEF record.</p>
          <div className="qr-box"><Image src={qrDataUrl} alt={`QR code for ${serialFor(card.card_number)}`} width={220} height={220} unoptimized /></div>
          <div className="url-box">{permanentUrl}</div>
          <div className="download-stack">
            <CopyLinkButton value={permanentUrl} label="Copy permanent link" />
            <a className="button button-dark button-wide" href={`/api/cards/${card.id}/qr`}><Download size={16} /> Download QR PNG</a>
            <a className="button button-outline button-wide" href={`/api/cards/${card.id}/print`}><Printer size={16} /> Download cropped card PNG</a>
            <CopyLinkButton value={`/api/cards/${card.id}/print`} label="Copy PNG download link" />
            <a className="button button-soft button-wide" href={permanentUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Test permanent link</a>
          </div>
        </aside>
      </div>
    </>
  );
}
