import type { Metadata } from "next";
import Link from "next/link";
import { Check, KeyRound, MapPin, Radio, Store } from "lucide-react";
import { notFound } from "next/navigation";
import { SITE_URL, WHATSAPP_NUMBER, isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { serialFor } from "@/lib/types";
import { activateCardAction } from "./actions";

export const metadata: Metadata = { title: "Activate your Tapvora card", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type ActivationRecord = { card_number: number; card_status: "unused" | "active" | "inactive" };

export default async function ActivateCardPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ error?: string; activated?: string }> }) {
  const [{ code: rawCode }, query] = await Promise.all([params, searchParams]);
  const code = rawCode.trim().toUpperCase();
  if (!/^[A-Z2-9]{5,10}$/.test(code) || !isSupabaseConfigured()) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_card_activation_status", { requested_code: code });
  if (error || !data?.length) notFound();
  const card = data[0] as ActivationRecord;
  const cardId = serialFor(card.card_number);
  const permanentUrl = `${SITE_URL}/r/${code}`;

  return <main className="activation-page">
    <header className="activation-nav shell"><Link className="brand" href="/"><span className="brand-mark"><Radio size={17} /></span><span>Tapvora</span></Link><span>Secure card activation</span></header>
    <section className="activation-shell shell">
      <div className="activation-intro">
        <span className="eyebrow">Card {cardId}</span>
        <h1 className="display">Connect this card to your business.</h1>
        <p>Enter your details once. After activation, both the printed QR and NFC tap will open the same Google Review page.</p>
        <div className="activation-flow"><span><Radio size={18} /> Tap or scan</span><span><Store size={18} /> Add business</span><span><Check size={18} /> Ready to use</span></div>
      </div>

      <div className="activation-card">
        {query.activated === "1" || card.card_status === "active" ? <div className="activation-success"><div className="activation-success-icon"><Check size={30} /></div><h2>Card activated</h2><p>{cardId} is connected. Tap or scan the card again to open the review page.</p><a className="button button-dark button-wide" href={permanentUrl}>Test card now</a></div> : card.card_status === "inactive" ? <div className="activation-success"><div className="activation-success-icon"><Radio size={30} /></div><h2>Activation paused</h2><p>This card has been paused. Contact Tapvora support to continue.</p><a className="button button-dark button-wide" href={`https://wa.me/${WHATSAPP_NUMBER}`}>WhatsApp support</a></div> : <>
          <div className="activation-card-head"><KeyRound size={21} /><div><h2>Activate {cardId}</h2><p>Your PIN is supplied with the physical card.</p></div></div>
          {query.error ? <div className="alert alert-error">{query.error}</div> : null}
          <form action={activateCardAction} className="activation-form">
            <input type="hidden" name="code" value={code} />
            <label><span>Activation PIN</span><input className="input activation-pin-input" name="activation_pin" inputMode="text" autoCapitalize="characters" autoComplete="one-time-code" maxLength={8} placeholder="8-character PIN" required /></label>
            <label><span>Business name</span><input className="input" name="business_name" maxLength={120} autoComplete="organization" placeholder="Your business name" required /></label>
            <label><span>Business address <small>(optional)</small></span><textarea className="textarea" name="address" rows={2} maxLength={500} autoComplete="street-address" placeholder="Area, city, or full address" /></label>
            <label><span>Google Review link</span><input className="input" name="review_url" type="url" inputMode="url" placeholder="https://g.page/r/.../review" required /></label>
            <button className="button button-primary button-wide" type="submit">Activate card</button>
          </form>
          <p className="activation-help"><MapPin size={14} /> Need help? <a href={`https://wa.me/${WHATSAPP_NUMBER}`}>Contact Tapvora on WhatsApp</a></p>
        </>}
      </div>
    </section>
  </main>;
}
