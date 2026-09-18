import { isSupabaseConfigured } from "./config";
import { createClient } from "./supabase/server";
import type { TapvoraCard } from "./types";

export async function listCards(): Promise<TapvoraCard[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .order("card_number", { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as TapvoraCard[];
}

export async function getCard(id: string): Promise<TapvoraCard | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.from("cards").select("*").eq("id", id).maybeSingle();

  if (error) throw new Error(error.message);
  return data as TapvoraCard | null;
}
