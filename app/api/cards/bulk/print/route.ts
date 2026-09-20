import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { requireAdmin } from "@/lib/auth";
import { listCards } from "@/lib/cards";
import { SITE_URL } from "@/lib/config";
import { serialFor } from "@/lib/types";

export const dynamic = "force-dynamic";

function escapeHtml(value: string) {
  return value.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" })[char]!);
}

export async function GET() {
  await requireAdmin();
  const cards = await listCards();
  if (!cards.length) return new Response("No cards available", { status: 404 });

  const template = await readFile(path.join(process.cwd(), "public", "tapvora-card-template-transparent.png"));
  const templateDataUrl = `data:image/png;base64,${template.toString("base64")}`;
  const items = await Promise.all(cards.map(async (card) => {
    const serial = serialFor(card.card_number);
    const url = `${SITE_URL}/r/${card.code}`;
    const qr = await QRCode.toDataURL(url, { errorCorrectionLevel: "H", margin: 2, width: 700, color: { dark: "#000000", light: "#ffffff" } });
    return `<article><div class="art" role="img" aria-label="${serial}"><img src="${qr}" alt="QR for ${serial}"/></div><div class="meta"><strong>${serial}</strong><span>${escapeHtml(url)}</span></div></article>`;
  }));

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Tapvora production cards</title><style>
  @page{size:A4;margin:10mm}*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;color:#13211d}.note{margin:0 0 7mm;font-size:11px}.sheet{display:grid;grid-template-columns:85mm 85mm;gap:7mm 10mm;align-items:start}article{break-inside:avoid;page-break-inside:avoid}.art{position:relative;width:85mm;height:54mm;background:url("${templateDataUrl}") center/100% 100% no-repeat}.art img{position:absolute;left:43.58%;top:34.6%;width:16.39%;height:25.8%}.meta{display:flex;justify-content:space-between;gap:4mm;margin-top:1.5mm;font-size:8px}.meta span{overflow-wrap:anywhere;text-align:right}@media print{.note{display:none}}
  </style></head><body><p class="note">Print at 100% scale. Each artwork is exactly 85 × 54 mm. Card ID and permanent URL are shown beneath each card for production matching.</p><main class="sheet">${items.join("")}</main></body></html>`;

  return new Response(html, { headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Disposition": "attachment; filename=Tapvora-all-card-artworks.html",
    "Cache-Control": "private, no-store",
  } });
}
