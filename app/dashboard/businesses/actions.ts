"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { validateReviewUrl } from "@/lib/validation";

function values(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    review_url: String(formData.get("review_url") || "").trim(),
    contact_name: String(formData.get("contact_name") || "").trim() || null,
    contact_email: String(formData.get("contact_email") || "").trim() || null,
    contact_phone: String(formData.get("contact_phone") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  };
}

export async function createBusinessAction(formData: FormData) {
  await requireAdmin();
  const business = values(formData);
  if (!business.name) redirect("/dashboard/businesses/new?error=Enter+a+business+name.");
  const urlError = validateReviewUrl(business.review_url);
  if (urlError) redirect(`/dashboard/businesses/new?error=${encodeURIComponent(urlError)}`);

  const supabase = await createClient();
  const { data, error } = await supabase.from("businesses").insert(business).select("id").single();
  if (error) redirect(`/dashboard/businesses/new?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/businesses");
  redirect(`/dashboard/businesses/${data.id}?created=1`);
}

export async function updateBusinessAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const business = values(formData);
  if (!business.name) redirect(`/dashboard/businesses/${id}?error=Enter+a+business+name.`);
  const urlError = validateReviewUrl(business.review_url);
  if (urlError) redirect(`/dashboard/businesses/${id}?error=${encodeURIComponent(urlError)}`);

  const supabase = await createClient();
  const { error } = await supabase.from("businesses").update(business).eq("id", id);
  if (error) redirect(`/dashboard/businesses/${id}?error=${encodeURIComponent(error.message)}`);

  await supabase.from("cards").update({ business_name: business.name, destination_url: business.review_url }).eq("business_id", id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/businesses");
  revalidatePath(`/dashboard/businesses/${id}`);
  redirect(`/dashboard/businesses/${id}?saved=1`);
}

export async function deleteBusinessAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const supabase = await createClient();
  const { error } = await supabase.from("businesses").delete().eq("id", id);
  if (error) redirect(`/dashboard/businesses/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/businesses");
  redirect("/dashboard/businesses?deleted=1");
}
