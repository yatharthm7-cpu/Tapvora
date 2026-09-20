import { requireAdmin } from "@/lib/auth";
import { listCards } from "@/lib/cards";
import { SITE_URL } from "@/lib/config";
import { serialFor } from "@/lib/types";

export const dynamic = "force-dynamic";

function csv(value: string | number | boolean | null) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET() {
  await requireAdmin();
  const cards = await listCards();
  const columns = ["Card ID", "Code", "Permanent URL", "Business", "Status", "NFC written", "QR printed", "Tap tested", "Scan tested", "Ready to sell"];
  const rows = cards.map((card) => [
    serialFor(card.card_number), card.code, `${SITE_URL}/r/${card.code}`, card.business_name, card.status,
    card.nfc_written, card.qr_printed, card.tap_tested, card.scan_tested, card.ready_to_sell,
  ]);
  const body = [columns, ...rows].map((row) => row.map(csv).join(",")).join("\r\n");

  return new Response(`\uFEFF${body}`, { headers: {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": "attachment; filename=Tapvora-card-production-map.csv",
    "Cache-Control": "private, no-store",
  } });
}
