"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export async function requestQuoteAction(formData: FormData) {
  const website = String(formData.get("website") || "");
  if (website) redirect("/contact?sent=1");

  const name = String(formData.get("name") || "").trim();
  const businessName = String(formData.get("business_name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const quantity = Math.max(1, Math.min(1000, Number(formData.get("quantity") || 1)));
  const message = String(formData.get("message") || "").trim().slice(0, 1500);

  if (name.length < 2 || businessName.length < 2 || (!phone && !email)) {
    redirect("/contact?error=Enter+your+name%2C+business%2C+and+at+least+one+contact+method.");
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/contact?error=Enter+a+valid+email+address.");
  if (!isSupabaseConfigured()) redirect("/contact?error=Quote+requests+are+temporarily+unavailable.");

  const supabase = await createClient();
  const { error } = await supabase.from("quote_requests").insert({
    name,
    business_name: businessName,
    phone: phone || null,
    email: email || null,
    quantity,
    message: message || null,
  });
  if (error) redirect(`/contact?error=${encodeURIComponent("We couldn't save your request. Please try again.")}`);
  redirect("/contact?sent=1");
}
