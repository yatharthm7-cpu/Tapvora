import { requireAdmin } from "@/lib/auth";
import { getBusiness } from "@/lib/businesses";
import { getBusinessAnalytics } from "@/lib/analytics";
import { SITE_URL, WHATSAPP_NUMBER } from "@/lib/config";
import { createHandoverPdf } from "@/lib/handover-pdf";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [business, analytics] = await Promise.all([getBusiness(id), getBusinessAnalytics(id)]);
  if (!business) return new Response("Business not found", { status: 404 });

  const bytes = await createHandoverPdf({ business, cards: analytics.cards, siteUrl: SITE_URL, whatsappNumber: WHATSAPP_NUMBER });
  const filename = business.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 60) || "business";
  return new Response(new Uint8Array(bytes), { headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${filename}-Tapvora-handover.pdf"`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  } });
}
