"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateReviewUrl } from "@/lib/validation";

export async function activateCardAction(formData: FormData) {
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const pin = String(formData.get("activation_pin") || "").trim().toUpperCase();
  const businessName = String(formData.get("business_name") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const reviewUrl = String(formData.get("review_url") || "").trim();
  const returnPath = `/activate/${encodeURIComponent(code)}`;

  if (!/^[A-Z2-9]{5,10}$/.test(code)) redirect("/card-unavailable?reason=not-found");
  if (!/^[A-F0-9]{8}$/.test(pin)) redirect(`${returnPath}?error=${encodeURIComponent("Enter the 8-character activation PIN supplied with the card.")}`);
  if (!businessName || businessName.length > 120) redirect(`${returnPath}?error=${encodeURIComponent("Enter a business name up to 120 characters.")}`);
  if (address.length > 500) redirect(`${returnPath}?error=${encodeURIComponent("Keep the business address under 500 characters.")}`);

  const urlError = validateReviewUrl(reviewUrl);
  if (urlError) redirect(`${returnPath}?error=${encodeURIComponent(urlError)}`);

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("activate_card", {
    requested_code: code,
    requested_pin: pin,
    requested_business_name: businessName,
    requested_address: address || null,
    requested_review_url: reviewUrl,
  });

  if (error) redirect(`${returnPath}?error=${encodeURIComponent("Activation is not available yet. Please contact Tapvora support.")}`);
  const result = data?.[0] as { activated?: boolean; result_message?: string } | undefined;
  if (!result?.activated) redirect(`${returnPath}?error=${encodeURIComponent(result?.result_message || "The card could not be activated.")}`);

  redirect(`${returnPath}?activated=1`);
}
