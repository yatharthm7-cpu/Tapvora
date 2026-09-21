import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next") || "/dashboard/account";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard/account";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }

  const errorPath = next.startsWith("/account") ? "/account/login?error=The+sign-in+link+is+invalid+or+expired" : "/login?error=The+recovery+link+is+invalid+or+expired";
  return NextResponse.redirect(new URL(errorPath, url.origin));
}
