import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/auth";
import { renderCardSvg } from "@/lib/card-artwork";
import { getCard } from "@/lib/cards";
import { serialFor } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const card = await getCard(id);
  if (!card) return new Response("Card not found", { status: 404 });

  const template = await readFile(path.join(process.cwd(), "public", "tapvora-card-template-transparent.png"));
  const svg = await renderCardSvg(card, template);

  return new Response(new Uint8Array(svg), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${serialFor(card.card_number)}-${card.code}-85x54mm.svg"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
