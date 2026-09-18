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
    margin: 4,
    width: 900,
    color: { dark: "#13211d", light: "#ffffff" },
  });
  const business = escapeXml(card.business_name || "");
  const serial = escapeXml(serialFor(card.card_number));

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="85.6mm" height="54mm" viewBox="0 0 856 540">
  <title>${serial} Tapvora print artwork</title>
  <desc>Exact CR80 dimensions: 85.6 by 54 millimetres. Permanent URL ${escapeXml(permanentUrl)}</desc>
  <rect width="856" height="540" rx="28" fill="#13211d"/>
  <circle cx="820" cy="555" r="235" fill="#d8ff63"/>
  ${business ? `<text x="54" y="57" fill="#ffffff" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="1.2">${business}</text>` : ""}
  <text x="54" y="115" fill="#d8ff63" font-family="Arial, sans-serif" font-size="29" font-weight="700" letter-spacing="8">★★★★★</text>
  <text x="54" y="180" fill="#ffffff" font-family="Arial, sans-serif" font-size="39" font-weight="800">Enjoyed your</text>
  <text x="54" y="224" fill="#ffffff" font-family="Arial, sans-serif" font-size="39" font-weight="800">experience?</text>
  <text x="54" y="261" fill="#aebdb8" font-family="Arial, sans-serif" font-size="18">Your feedback helps us grow.</text>
  <rect x="54" y="301" width="178" height="178" rx="10" fill="#ffffff"/>
  <image x="61" y="308" width="164" height="164" xlink:href="${qrDataUrl}"/>
  <text x="79" y="507" fill="#ffffff" font-family="Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="2">SCAN HERE</text>
  <g transform="translate(305 318)" fill="none" stroke="#d8ff63" stroke-width="12" stroke-linecap="round">
    <path d="M0 70 C38 54 38 16 0 0"/>
    <path d="M35 90 C91 61 91 9 35 -20"/>
    <path d="M74 108 C150 67 150 2 74 -38"/>
  </g>
  <text x="304" y="455" fill="#ffffff" font-family="Arial, sans-serif" font-size="20" font-weight="800" letter-spacing="2">TAP HERE</text>
  <text x="304" y="488" fill="#d8ff63" font-family="Arial, sans-serif" font-size="16" font-weight="700">LEAVE A GOOGLE REVIEW</text>
  <text x="786" y="515" text-anchor="end" fill="#13211d" font-family="Arial, sans-serif" font-size="12" font-weight="700">${serial} · ${escapeXml(card.code)}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${serial}-${card.code}-85.6x54mm.svg"`,
      "Cache-Control": "private, no-store",
    },
  });
}
