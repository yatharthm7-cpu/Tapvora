import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/auth";
import { renderCardSvg } from "@/lib/card-artwork";
import { listCards } from "@/lib/cards";
import { SITE_URL } from "@/lib/config";
import { serialFor } from "@/lib/types";
import { createZip } from "@/lib/zip";

export const dynamic = "force-dynamic";

function csvCell(value: string | number | boolean | null) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET() {
  await requireAdmin();
  const cards = await listCards(undefined, { includeLogo: true });
  if (!cards.length) return new Response("No cards available", { status: 404 });

  const template = await readFile(path.join(process.cwd(), "public", "tapvora-card-template-transparent.png"));
  const files: { name: string; data: Buffer }[] = [
    { name: "assets/tapvora-card-template-transparent.png", data: template },
    { name: "README.txt", data: Buffer.from("Tapvora SVG production files\r\n\r\nExtract the entire ZIP before opening the SVG files. Keep the cards and assets folders together so every card displays correctly. All lettering is converted to vector outlines for reliable printing.\r\n", "utf8") },
  ];
  for (const card of cards) {
    const serial = serialFor(card.card_number);
    files.push({
      name: `cards/${serial}-${card.code}-85x54mm.svg`,
      data: await renderCardSvg(card, template, {
        templateHref: "../assets/tapvora-card-template-transparent.png",
      }),
    });
  }

  const headings = ["Card ID", "Permanent URL", "Activation PIN", "Business", "Status"];
  const rows = cards.map((card) => [serialFor(card.card_number), `${SITE_URL}/r/${card.code}`, card.activation_pin, card.business_name, card.status]);
  const csv = [headings, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  files.push({ name: "Tapvora-card-mapping.csv", data: Buffer.from(`\ufeff${csv}`, "utf8") });

  const zip = createZip(files);
  return new Response(new Uint8Array(zip), { headers: {
    "Content-Type": "application/zip",
    "Content-Disposition": "attachment; filename=Tapvora-all-card-SVGs.zip",
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  } });
}
