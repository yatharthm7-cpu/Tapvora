import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { Brand } from "@/components/brand";
import { WHATSAPP_NUMBER } from "@/lib/config";
import { requestQuoteAction } from "./actions";

export const metadata: Metadata = { title: "Request a quote", description: "Request pricing for Tapvora NFC and QR Google Review cards." };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ error?: string; sent?: string }> }) {
  const params = await searchParams;
  const whatsappUrl = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Tapvora, I would like a quote for NFC and QR review cards.")}` : "";
  return <main className="legal-page">
    <header className="shell legal-nav"><Brand /><Link href="/"><ArrowLeft size={16} /> Back home</Link></header>
    <div className="shell contact-layout">
      <section className="contact-intro"><span className="section-kicker">Request a quote</span><h1 className="display">Tell us what your business needs.</h1><p>Share the quantity and basic details. Tapvora will respond with product availability, customization options, pricing, and delivery information.</p>
        {whatsappUrl ? <a className="button button-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Chat on WhatsApp</a> : null}
      </section>
      <form action={requestQuoteAction} className="form-card quote-form">
        {params.error ? <div className="alert alert-error">{params.error}</div> : null}
        {params.sent ? <div className="alert alert-success">Thank you. Your quote request has been received.</div> : null}
        <div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
        <div className="form-grid">
          <div className="field"><label htmlFor="name">Your name</label><input className="input" id="name" name="name" required /></div>
          <div className="field"><label htmlFor="business_name">Business name</label><input className="input" id="business_name" name="business_name" required /></div>
          <div className="field"><label htmlFor="phone">Phone / WhatsApp</label><input className="input" id="phone" name="phone" type="tel" /></div>
          <div className="field"><label htmlFor="email">Email</label><input className="input" id="email" name="email" type="email" /></div>
          <div className="field"><label htmlFor="quantity">Estimated quantity</label><input className="input" id="quantity" name="quantity" type="number" min="1" max="1000" defaultValue="1" required /></div>
          <div className="field field-full"><label htmlFor="message">Requirements</label><textarea className="textarea" id="message" name="message" rows={4} placeholder="Branding, delivery city, deadline, or questions" /></div>
        </div>
        <p className="form-consent">By submitting, you agree that Tapvora may contact you about this request. See our <Link href="/privacy">Privacy Policy</Link>.</p>
        <div className="form-actions"><button className="button button-dark" type="submit"><Send size={16} /> Send request</button></div>
      </form>
    </div>
  </main>;
}
