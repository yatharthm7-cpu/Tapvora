import { isSupabaseConfigured } from "./config";
import { createClient } from "./supabase/server";
import type { TapvoraCard } from "./types";

export async function listCards(filters?: { query?: string; status?: string }, options?: { includeLogo?: boolean }): Promise<TapvoraCard[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .order("card_number", { ascending: true });

  if (error) throw new Error(error.message);
  const cards = (data || []).map((card) => ({
    ...card,
    card_logo_data: options?.includeLogo ? card.card_logo_data : null,
  })) as TapvoraCard[];
  const query = filters?.query?.trim().toLowerCase() || "";
  const status = filters?.status || "all";

  return cards.filter((card) => {
    const matchesStatus = status === "all" || card.status === status;
    if (!matchesStatus) return false;
    if (!query) return true;

    const searchable = [
      card.code,
      card.business_name || "",
      `TV-${String(card.card_number).padStart(4, "0")}`,
    ].join(" ").toLowerCase();
    return searchable.includes(query);
  });
}

export async function getCard(id: string): Promise<TapvoraCard | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.from("cards").select("*").eq("id", id).maybeSingle();

  if (error) throw new Error(error.message);
  return data as TapvoraCard | null;
}
