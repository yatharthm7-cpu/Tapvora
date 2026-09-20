import { isSupabaseConfigured } from "./config";
import { createClient } from "./supabase/server";

export type QuoteRequest = {
  id: string; name: string; business_name: string; phone: string | null; email: string | null;
  quantity: number; message: string | null; status: "new" | "contacted" | "closed"; created_at: string;
};

export async function listQuoteRequests(): Promise<QuoteRequest[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("quote_requests").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as QuoteRequest[];
}
