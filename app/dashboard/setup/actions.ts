"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { validateReviewUrl } from "@/lib/validation";

export async function setupCardAction(formData: FormData) {
  await requireAdmin();
  const cardId = String(formData.get("card_id") || "");
  const selectedBusinessId = String(formData.get("business_id") || "");
  const newBusinessName = String(formData.get("business_name") || "").trim();
  const address = String(formData.get("address") || "").trim().slice(0, 500) || null;
  const reviewUrl = String(formData.get("review_url") || "").trim();
  const destinationTested = formData.get("destination_tested") === "on";

  if (!/^[0-9a-f-]{36}$/i.test(cardId)) redirect("/dashboard/setup?error=Select+a+valid+card.");
  const urlError = validateReviewUrl(reviewUrl);
  if (urlError) redirect(`/dashboard/setup?error=${encodeURIComponent(urlError)}`);
  if (!destinationTested) redirect("/dashboard/setup?error=Test+the+destination+before+activating+the+card.");

  const supabase = await createClient();
  let businessId = selectedBusinessId;
  let businessName = newBusinessName;

  if (selectedBusinessId === "new") {
    if (!newBusinessName) redirect("/dashboard/setup?error=Enter+the+new+business+name.");
    const { data, error } = await supabase.from("businesses").insert({ name: newBusinessName, review_url: reviewUrl, address }).select("id").single();
    if (error) redirect(`/dashboard/setup?error=${encodeURIComponent(error.message)}`);
    businessId = data.id;
  } else {
    const { data: business, error } = await supabase.from("businesses").select("id, name").eq("id", selectedBusinessId).maybeSingle();
    if (error || !business) redirect("/dashboard/setup?error=Select+an+existing+business+or+add+a+new+one.");
    businessName = business.name;
    const { error: businessUpdateError } = await supabase.from("businesses").update({ review_url: reviewUrl, address }).eq("id", business.id);
    if (businessUpdateError) redirect(`/dashboard/setup?error=${encodeURIComponent(businessUpdateError.message)}`);
    await supabase.from("cards").update({ destination_url: reviewUrl }).eq("business_id", business.id);
  }

  const { data: updated, error: cardError } = await supabase.from("cards").update({
    business_id: businessId,
    business_name: businessName,
    destination_url: reviewUrl,
    status: "active",
  }).eq("id", cardId).select("id");

  if (cardError) redirect(`/dashboard/setup?error=${encodeURIComponent(cardError.message)}`);
  if (!updated?.length) redirect("/dashboard/setup?error=Card+not+found.");

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/businesses");
  revalidatePath(`/dashboard/businesses/${businessId}`);
  revalidatePath(`/dashboard/cards/${cardId}`);
  redirect(`/dashboard/cards/${cardId}?saved=1`);
}
