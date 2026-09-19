export type CardStatus = "unused" | "active" | "inactive";

export type TapvoraCard = {
  id: string;
  card_number: number;
  code: string;
  business_id: string | null;
  business_name: string | null;
  destination_url: string | null;
  status: CardStatus;
  notes: string | null;
  redirect_count: number;
  last_redirected_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Business = {
  id: string;
  name: string;
  review_url: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export function serialFor(cardNumber: number) {
  return `TV-${String(cardNumber).padStart(4, "0")}`;
}
