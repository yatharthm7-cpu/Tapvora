"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { generateCardCode } from "@/lib/card-code";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import type { CardStatus } from "@/lib/types";
import { validateReviewUrl } from "@/lib/validation";

export async function createCardsAction(formData: FormData) {
  await requireAdmin();
  const quantity = Math.max(1, Math.min(50, Number(formData.get("quantity") || 1)));

  if (!isSupabaseConfigured()) {
    redirect("/dashboard/cards/new?error=Connect+Supabase+before+creating+real+card+records.");
  }

  const supabase = await createClient();
  let created = 0;

  while (created < quantity) {
    const rows = Array.from({ length: quantity - created }, () => ({ code: generateCardCode() }));
    const { data, error } = await supabase.from("cards").insert(rows).select("id");

    if (!error) {
      created += data.length;
      continue;
    }

    if (error.code !== "23505") {
      redirect(`/dashboard/cards/new?error=${encodeURIComponent(error.message)}`);
    }
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard?created=${created}`);
}

export async function updateCardAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const businessId = String(formData.get("business_id") || "").trim();
  let businessName = String(formData.get("business_name") || "").trim();
  let destinationUrl = String(formData.get("destination_url") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const status = String(formData.get("status") || "unused") as CardStatus;

  if (!id || !["unused", "active", "inactive"].includes(status)) {
    redirect(`/dashboard/cards/${id}?error=Invalid+card+data`);
  }

  if (!isSupabaseConfigured()) {
    redirect("/dashboard?error=Connect+Supabase+before+saving+card+changes.");
  }

  const supabase = await createClient();
  if (businessId) {
    const { data: business, error: businessError } = await supabase.from("businesses").select("name, review_url").eq("id", businessId).maybeSingle();
    if (businessError || !business) redirect(`/dashboard/cards/${id}?error=${encodeURIComponent("Select a valid business profile.")}`);
    businessName = business.name;
    destinationUrl = business.review_url;
  }

  if (destinationUrl) {
    const validationError = validateReviewUrl(destinationUrl);
    if (validationError) redirect(`/dashboard/cards/${id}?error=${encodeURIComponent(validationError)}`);
  }

  if (status === "active" && (!businessName || !destinationUrl)) {
    redirect(`/dashboard/cards/${id}?error=${encodeURIComponent("An active card needs a business name and Google Review URL.")}`);
  }

  const { error } = await supabase
    .from("cards")
    .update({
      business_name: businessName || null,
      business_id: businessId || null,
      destination_url: destinationUrl || null,
      notes: notes || null,
      status,
    })
    .eq("id", id);

  if (error) redirect(`/dashboard/cards/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/cards/${id}`);
  redirect(`/dashboard/cards/${id}?saved=1`);
}

export async function deleteCardAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    redirect("/dashboard?error=Invalid+card+identifier.");
  }

  if (!isSupabaseConfigured()) {
    redirect("/dashboard?error=Connect+Supabase+before+deleting+cards.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("cards").delete().eq("id", id).select("id");

  if (error) redirect(`/dashboard/cards/${id}?error=${encodeURIComponent(error.message)}`);
  if (!data?.length) redirect(`/dashboard/cards/${id}?error=${encodeURIComponent("Card not found or delete access is not enabled yet.")}`);

  revalidatePath("/dashboard");
  redirect("/dashboard?deleted=1");
}

export async function deleteAllCardsAction() {
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    redirect("/dashboard?error=Connect+Supabase+before+deleting+cards.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("delete_all_cards_and_reset_sequence");

  if (error) redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/dashboard");
  redirect(`/dashboard?deleted=all&deleted_count=${Number(data || 0)}`);
}
