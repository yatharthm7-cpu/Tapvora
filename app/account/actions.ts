"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCustomer } from "@/lib/auth";
import { SITE_URL } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { validateReviewUrl } from "@/lib/validation";

export async function sendCustomerLoginLinkAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/account/login?error=Enter+a+valid+email+address");

  const supabase = await createClient();
  await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: `${SITE_URL}/auth/callback?next=/account` },
  });

  redirect("/account/login?sent=1");
}

export async function updateCustomerReviewLinkAction(formData: FormData) {
  await requireCustomer();
  const businessId = String(formData.get("business_id") || "");
  const reviewUrl = String(formData.get("review_url") || "").trim();
  const urlError = validateReviewUrl(reviewUrl);
  if (urlError) redirect(`/account?error=${encodeURIComponent(urlError)}`);

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("update_owned_business_review_url", {
    requested_business_id: businessId,
    requested_review_url: reviewUrl,
  });
  const result = data?.[0] as { updated?: boolean; result_message?: string } | undefined;
  if (error || !result?.updated) redirect(`/account?error=${encodeURIComponent(result?.result_message || "The review link could not be updated.")}`);

  revalidatePath("/account");
  redirect("/account?saved=1");
}

export async function customerLogoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/account/login");
}
