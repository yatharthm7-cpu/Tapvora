"use client";

import { useState } from "react";
import { ExternalLink, Radio, Rocket, ScanLine, Store } from "lucide-react";
import { setupCardAction } from "@/app/dashboard/setup/actions";

type WizardCard = { id: string; label: string; code: string; status: string };
type WizardBusiness = { id: string; name: string; reviewUrl: string };

export function CardSetupWizard({ cards, businesses }: { cards: WizardCard[]; businesses: WizardBusiness[] }) {
  const [businessId, setBusinessId] = useState(businesses[0]?.id || "new");
  const initial = businesses[0];
  const [businessName, setBusinessName] = useState(initial?.name || "");
  const [reviewUrl, setReviewUrl] = useState(initial?.reviewUrl || "");
  const testUrl = reviewUrl.startsWith("https://") ? reviewUrl : "";

  function chooseBusiness(id: string) {
    setBusinessId(id);
    const business = businesses.find((item) => item.id === id);
    setBusinessName(business?.name || "");
    setReviewUrl(business?.reviewUrl || "");
  }

  return <form className="wizard" action={setupCardAction}>
    <section className="wizard-step"><span>1</span><div><div className="wizard-title"><Radio size={18} /><h2>Select card</h2></div><p>Choose the physical card you are setting up.</p><select className="select" name="card_id" required defaultValue=""><option value="" disabled>Select a card</option>{cards.map((card) => <option key={card.id} value={card.id}>{card.label} · {card.code} · {card.status}</option>)}</select></div></section>
    <section className="wizard-step"><span>2</span><div><div className="wizard-title"><Store size={18} /><h2>Select or add business</h2></div><p>Use a saved customer or create a new customer profile.</p><select className="select" name="business_id" value={businessId} onChange={(event) => chooseBusiness(event.target.value)}><option value="new">+ Add a new business</option>{businesses.map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}</select>{businessId === "new" ? <input className="input wizard-extra" name="business_name" value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="Business name" required /> : null}</div></section>
    <section className="wizard-step"><span>3</span><div><div className="wizard-title"><ScanLine size={18} /><h2>Paste Google Review link</h2></div><p>This destination will be shared by both NFC and QR.</p><input className="input" name="review_url" type="url" value={reviewUrl} onChange={(event) => setReviewUrl(event.target.value)} placeholder="https://g.page/r/.../review" required /></div></section>
    <section className="wizard-step"><span>4</span><div><div className="wizard-title"><ExternalLink size={18} /><h2>Test destination</h2></div><p>Open the link and confirm the correct Google review screen appears.</p><a className={`button button-outline ${testUrl ? "" : "button-disabled"}`} href={testUrl || undefined} target="_blank" rel="noreferrer" aria-disabled={!testUrl}><ExternalLink size={16} /> Test destination</a><label className="wizard-confirm"><input type="checkbox" name="destination_tested" required /><span>I tested the link and it opens the correct business.</span></label></div></section>
    <section className="wizard-step wizard-final"><span>5</span><div><div className="wizard-title"><Rocket size={18} /><h2>Activate card</h2></div><p>Save the business and review destination, then make the permanent link live.</p><button className="button button-dark" type="submit"><Rocket size={16} /> Activate card</button></div></section>
  </form>;
}
