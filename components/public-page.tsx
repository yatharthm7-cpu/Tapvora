import Link from "next/link";
import { MessageCircle, Radio } from "lucide-react";
import { Brand } from "@/components/brand";
import { SITE_URL, WHATSAPP_NUMBER } from "@/lib/config";

export function PublicPage({ kicker, title, intro, children }: { kicker: string; title: string; intro: string; children: React.ReactNode }) {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Tapvora, I would like to know more about NFC and QR review cards.")}`;
  return <main className="public-page">
    <header className="shell site-nav"><Brand /><nav className="nav-links" aria-label="Primary navigation"><Link href="/how-it-works">How it works</Link><Link href="/specifications">Specifications</Link><Link href="/faq">FAQ</Link><Link href="/contact">Request a quote</Link></nav></header>
    <section className="public-hero"><div className="shell"><span className="section-kicker">{kicker}</span><h1 className="display">{title}</h1><p>{intro}</p></div></section>
    <div className="shell public-content">{children}</div>
    <section className="quote-cta-section"><div className="shell quote-cta"><div><span className="section-kicker">Need help?</span><h2 className="display">Talk to Tapvora.</h2><p>Ask about quantities, customization, compatibility, production, or delivery before placing an order.</p></div><div className="quote-cta-actions"><Link className="button button-primary" href="/contact">Request a quote</Link><a className="button button-whatsapp-dark" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} /> WhatsApp</a></div></div></section>
    <footer className="site-footer"><div className="shell footer-row"><Brand /><span>Tap. Scan. Review. © {new Date().getFullYear()} Tapvora.</span><div className="footer-links"><Link href="/how-it-works">How it works</Link><Link href="/specifications">Specifications</Link><Link href="/shipping">Shipping</Link><Link href="/faq">FAQ</Link><Link href="/customer-stories">Customer stories</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div><span className="footer-domain"><Radio size={15} /> {SITE_URL.replace(/^https?:\/\//, "")}</span></div></footer>
  </main>;
}
