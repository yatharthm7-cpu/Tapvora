import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { requireAdmin } from "@/lib/auth";
import { getCard } from "@/lib/cards";
import { SITE_URL } from "@/lib/config";
import { serialFor } from "@/lib/types";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char]!);
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const card = await getCard(id);
  if (!card) return new Response("Card not found", { status: 404 });

  const permanentUrl = `${SITE_URL}/r/${card.code}`;
  const qrDataUrl = await QRCode.toDataURL(permanentUrl, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 1000,
    color: { dark: "#000000", light: "#ffffff" },
  });
  const serial = escapeXml(serialFor(card.card_number));
  const template = await readFile(path.join(process.cwd(), "public", "tapvora-card-template-transparent.png"));
  const templateDataUrl = `data:image/png;base64,${template.toString("base64")}`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="85mm" height="54mm" viewBox="0 0 1574 1000">
  <title>${serial} Tapvora print artwork</title>
  <desc>Exact card dimensions: 85 by 54 millimetres. Permanent URL ${escapeXml(permanentUrl)}</desc>
  <image width="1574" height="1000" preserveAspectRatio="none" xlink:href="${templateDataUrl}"/>
  <image x="686" y="346" width="258" height="258" preserveAspectRatio="xMidYMid meet" xlink:href="${qrDataUrl}"/>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${serial}-${card.code}-85x54mm.svg"`,
      "Cache-Control": "private, no-store",
    },
  });
}
