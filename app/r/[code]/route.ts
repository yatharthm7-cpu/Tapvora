import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const normalizedCode = code.trim().toUpperCase();
  const origin = new URL(request.url).origin;

  if (!/^[A-Z2-9]{5,10}$/.test(normalizedCode)) {
    return NextResponse.redirect(`${origin}/card-unavailable?reason=not-found`, 307);
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/card-unavailable?reason=inactive`, 307);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("resolve_card_redirect", {
    requested_code: normalizedCode,
  });

  if (error || !data?.length) {
    return NextResponse.redirect(`${origin}/card-unavailable?reason=not-found`, 307);
  }

  const card = data[0] as { destination_url: string | null; card_status: string };
  if (card.card_status !== "active" || !card.destination_url) {
    return NextResponse.redirect(`${origin}/card-unavailable?reason=inactive`, 307);
  }

  const response = NextResponse.redirect(card.destination_url, 307);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
