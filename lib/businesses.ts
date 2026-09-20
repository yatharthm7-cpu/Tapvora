import { isSupabaseConfigured } from "./config";
import { createClient } from "./supabase/server";
import type { Business } from "./types";

export type BusinessWithCardCount = Business & { card_count: number };

export async function listBusinesses(query = ""): Promise<BusinessWithCardCount[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("*, cards(id)")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  const needle = query.trim().toLowerCase();

  return (data || [])
    .map((business) => ({
      ...(business as unknown as Business),
      card_count: Array.isArray(business.cards) ? business.cards.length : 0,
    }))
    .filter((business) => !needle || [business.name, business.contact_name, business.contact_email, business.contact_phone, business.address]
      .filter(Boolean).join(" ").toLowerCase().includes(needle));
}

export async function getBusiness(id: string): Promise<BusinessWithCardCount | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("businesses").select("*, cards(id)").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { ...(data as unknown as Business), card_count: Array.isArray(data.cards) ? data.cards.length : 0 };
}
