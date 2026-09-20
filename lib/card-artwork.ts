import QRCode from "qrcode";
import { SITE_URL } from "./config";
import { serialFor, type TapvoraCard } from "./types";

export function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char]!);
}

export async function renderCardSvg(card: TapvoraCard, templateDataUrl: string) {
  const permanentUrl = `${SITE_URL}/r/${card.code}`;
  const qrDataUrl = await QRCode.toDataURL(permanentUrl, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 1000,
    color: { dark: "#000000", light: "#ffffff" },
  });
  const serial = escapeXml(serialFor(card.card_number));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="85mm" height="54mm" viewBox="0 0 1574 1000">
  <title>${serial} Tapvora print artwork</title>
  <desc>Exact card dimensions: 85 by 54 millimetres. Permanent URL ${escapeXml(permanentUrl)}</desc>
  <image width="1574" height="1000" preserveAspectRatio="none" xlink:href="${templateDataUrl}"/>
  <image x="686" y="346" width="258" height="258" preserveAspectRatio="xMidYMid meet" xlink:href="${qrDataUrl}"/>
</svg>`;
}
