export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://tapvora.in").replace(/\/$/, "");

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return Boolean(
    url &&
      key &&
      !url.includes("your-project") &&
      !key.includes("your_key"),
  );
}
