import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "./config";
import { createClient } from "./supabase/server";

export async function requireAdmin() {
  if (!isSupabaseConfigured()) {
    return { id: "demo-admin", email: "demo@tapvora.in", demo: true };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) redirect("/login");

  const { data: admin } = await supabase
    .from("app_admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!admin) redirect("/login?error=This+account+is+not+an+admin");

  return { id: data.user.id, email: data.user.email || "Admin", demo: false };
}
