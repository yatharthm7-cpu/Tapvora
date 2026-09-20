import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Business, TapvoraCard } from "./types";
import { serialFor } from "./types";

const A4: [number, number] = [595.28, 841.89];
const margin = 48;
const ink = rgb(19 / 255, 33 / 255, 29 / 255);
const soft = rgb(64 / 255, 81 / 255, 75 / 255);
const lime = rgb(216 / 255, 255 / 255, 99 / 255);
const paper = rgb(247 / 255, 245 / 255, 237 / 255);

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= width) line = next;
    else { if (line) lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}

function safePdfText(value: string) {
  return value.replace(/[^\x20-\x7E]/g, "-");
}

export async function createHandoverPdf({ business, cards, siteUrl, whatsappNumber }: { business: Business; cards: TapvoraCard[]; siteUrl: string; whatsappNumber: string }) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page!: PDFPage;
  let y = 0;

  function addPage() {
    page = pdf.addPage(A4);
    page.drawRectangle({ x: 0, y: 0, width: A4[0], height: A4[1], color: paper });
    page.drawText("TAPVORA", { x: margin, y: A4[1] - 42, size: 12, font: bold, color: ink });
    page.drawText("CUSTOMER HANDOVER", { x: A4[0] - margin - 142, y: A4[1] - 42, size: 9, font: bold, color: soft });
    page.drawLine({ start: { x: margin, y: A4[1] - 54 }, end: { x: A4[0] - margin, y: A4[1] - 54 }, thickness: 1, color: rgb(.82, .82, .78) });
    y = A4[1] - 84;
  }

  function ensure(height: number) {
    if (y - height < 46) addPage();
  }

  function text(value: string, options: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; gap?: number; width?: number } = {}) {
    const size = options.size ?? 10;
    const font = options.font ?? regular;
    const lines = wrap(safePdfText(value), font, size, options.width ?? (A4[0] - margin * 2));
    ensure(lines.length * (size + 4) + (options.gap ?? 0));
    for (const line of lines) { page.drawText(line, { x: margin, y, size, font, color: options.color ?? soft }); y -= size + 4; }
    y -= options.gap ?? 0;
  }

  function heading(value: string) {
    ensure(35);
    page.drawRectangle({ x: margin, y: y - 4, width: 7, height: 18, color: lime });
    page.drawText(safePdfText(value), { x: margin + 16, y, size: 16, font: bold, color: ink });
    y -= 29;
  }

  addPage();
  page.drawRectangle({ x: margin, y: y - 114, width: A4[0] - margin * 2, height: 124, color: ink });
  page.drawText("Your Tapvora cards are ready", { x: margin + 24, y: y - 28, size: 22, font: bold, color: rgb(1, 1, 1) });
  page.drawText(safePdfText(business.name), { x: margin + 24, y: y - 56, size: 13, font: bold, color: lime });
  const address = business.address ? wrap(safePdfText(business.address), regular, 9, A4[0] - margin * 2 - 48) : ["Address not provided"];
  address.slice(0, 3).forEach((line, index) => page.drawText(line, { x: margin + 24, y: y - 78 - index * 12, size: 9, font: regular, color: rgb(.83, .88, .86) }));
  y -= 146;

  heading("Purchased card IDs and permanent links");
  if (!cards.length) text("No cards are currently assigned to this business.", { gap: 12 });
  for (const card of cards) {
    if (y - 36 < 46) { addPage(); heading("Purchased cards - continued"); }
    page.drawRectangle({ x: margin, y: y - 19, width: A4[0] - margin * 2, height: 30, color: rgb(1, 1, 1) });
    page.drawText(serialFor(card.card_number), { x: margin + 12, y: y - 8, size: 10, font: bold, color: ink });
    page.drawText(`${siteUrl}/r/${card.code}`, { x: margin + 104, y: y - 8, size: 9, font: regular, color: soft });
    y -= 36;
  }
  y -= 8;

  heading("How to use the card");
  text("1. Unlock an NFC-compatible phone and hold its upper back area close to the TAP HERE symbol.", { gap: 5 });
  text("2. If NFC is unavailable or disabled, open the phone camera and scan the printed QR code.", { gap: 5 });
  text("3. The permanent Tapvora link opens and redirects to the business's current Google Review destination. An internet connection is required.", { gap: 5 });
  text("4. Test both tap and scan before placing the card where customers will use it.", { gap: 12 });

  heading("Support");
  const whatsappDisplay = whatsappNumber === "919638902001" ? "+91 96389 02001" : `+${whatsappNumber}`;
  text(`WhatsApp: ${whatsappDisplay}`, { font: bold, color: ink, gap: 4 });
  text("When contacting support, include the business name and printed Card ID so the correct permanent link can be checked quickly.", { gap: 12 });

  heading("Warranty and replacement information");
  text("Warranty and replacement eligibility follow the written quote or order confirmation supplied for the purchase. Report a printing defect, unreadable QR code, or NFC issue promptly with the Card ID and a clear photo or video.", { gap: 5 });
  text("Physical damage, bending, cutting, heat, liquid or chemical exposure, tampering, or rewriting the NFC chip may not qualify for replacement. Google listing restrictions, phone settings, internet availability, and third-party service outages are outside Tapvora's control.", { gap: 5 });
  text("The Google Review destination can be updated in Tapvora without changing the permanent URL printed and written on the card.");

  const pages = pdf.getPages();
  pages.forEach((item, index) => {
    item.drawLine({ start: { x: margin, y: 34 }, end: { x: A4[0] - margin, y: 34 }, thickness: 1, color: rgb(.82, .82, .78) });
    item.drawText(`${siteUrl.replace(/^https?:\/\//, "")}  |  Page ${index + 1} of ${pages.length}`, { x: margin, y: 20, size: 8, font: regular, color: soft });
  });

  pdf.setTitle(`${business.name} - Tapvora customer handover`);
  pdf.setAuthor("Tapvora");
  pdf.setSubject("NFC and QR review card handover information");
  return pdf.save();
}
