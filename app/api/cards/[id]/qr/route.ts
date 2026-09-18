import QRCode from "qrcode";
import { requireAdmin } from "@/lib/auth";
import { getCard } from "@/lib/cards";
import { SITE_URL } from "@/lib/config";
import { serialFor } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const card = await getCard(id);
  if (!card) return new Response("Card not found", { status: 404 });

  const svg = await QRCode.toString(`${SITE_URL}/r/${card.code}`, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 4,
    width: 1000,
    color: { dark: "#13211d", light: "#ffffff" },
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${serialFor(card.card_number)}-${card.code}-qr.svg"`,
      "Cache-Control": "private, no-store",
    },
  });
}
