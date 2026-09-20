import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Link2,
  MessageCircle,
  Radio,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SITE_URL, WHATSAPP_NUMBER } from "@/lib/config";

export default function HomePage() {
  const whatsappUrl = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Tapvora, I would like a quote for NFC and QR review cards.")}` : "";
  return (
    <main>
      <ScrollReveal />
      <header className="shell site-nav">
        <Brand />
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#system">The system</a>
          <Link href="/contact">Request a quote</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-content hero-enter">
            <span className="eyebrow">NFC + QR review cards</span>
            <h1 className="display">More reviews.<br /><em>One tap away.</em></h1>
            <p className="hero-copy">
              A beautifully simple card that sends customers straight to your Google Review page—by tap or scan.
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href="#how-it-works">See how it works <ArrowRight size={17} /></a>
              <Link className="button button-outline" href="/contact">Request a quote</Link>
            </div>
            <div className="micro-proof">
              <span><i /> No app needed</span>
              <span><i /> Editable destination</span>
              <span><i /> Works with iPhone & Android</span>
            </div>
          </div>

          <div className="card-stage hero-enter hero-enter-late" aria-label="Tapvora review card preview">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="product-card product-card-real">
              <Image
                src="/tapvora-card-template-transparent.png"
                alt="Tapvora Google Review NFC and QR card"
                fill
                priority
                sizes="(max-width: 960px) 90vw, 485px"
              />
              <span className="card-sheen" />
            </div>
            <div className="float-note one"><span className="float-icon"><RefreshCw size={17} /></span> Change the link anytime</div>
            <div className="float-note two"><span className="float-icon"><ShieldCheck size={17} /></span> Permanent card URL</div>
          </div>
        </div>
      </section>

      <div className="motion-strip" aria-hidden="true">
        <div className="motion-strip-track">
          <span>TAP</span><i /> <span>SCAN</span><i /> <span>REVIEW</span><i /> <span>GROW</span><i />
          <span>TAP</span><i /> <span>SCAN</span><i /> <span>REVIEW</span><i /> <span>GROW</span><i />
        </div>
      </div>

      <section className="section section-dark" id="how-it-works">
        <div className="shell">
          <div data-reveal>
            <div className="section-kicker">Frictionless by design</div>
            <h2 className="display section-title">From a happy customer to a Google Review in seconds.</h2>
            <p className="section-lead">No searching, no instructions, no app download. The shortest possible path to the review screen.</p>
          </div>
          <div className="steps-grid">
            <article className="step-card" data-reveal style={{ "--reveal-delay": "0ms" } as React.CSSProperties}>
              <div className="step-number">01 / TAP OR SCAN</div>
              <ScanLine size={30} style={{ marginTop: 32, color: "#d8ff63" }} />
              <h3>Customer interacts</h3>
              <p>They tap the NFC zone or scan the printed QR with the phone already in their hand.</p>
            </article>
            <article className="step-card" data-reveal style={{ "--reveal-delay": "110ms" } as React.CSSProperties}>
              <div className="step-number">02 / SMART REDIRECT</div>
              <Link2 size={30} style={{ marginTop: 32, color: "#d8ff63" }} />
              <h3>Tapvora resolves</h3>
              <p>The permanent card link checks its live destination without changing the physical card.</p>
            </article>
            <article className="step-card" data-reveal style={{ "--reveal-delay": "220ms" } as React.CSSProperties}>
              <div className="step-number">03 / GOOGLE REVIEW</div>
              <div style={{ marginTop: 30, color: "#d8ff63", letterSpacing: 3 }}>★★★★★</div>
              <h3>Review screen opens</h3>
              <p>Your Google Review flow opens directly, ready for the customer to share their experience.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="flow-video-section" aria-labelledby="flow-video-title">
        <div className="shell flow-video-shell">
          <div className="flow-video-heading" data-reveal>
            <span className="section-kicker">See it in action</span>
            <h2 className="display section-title" id="flow-video-title">From tap to review in seconds.</h2>
            <p>See how a quick NFC tap or QR scan takes a customer straight to the Google Review screen.</p>
          </div>
          <div className="flow-video-frame" data-reveal style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
            <video
              className="flow-video"
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
              aria-label="Demonstration of the Tapvora NFC and QR Google Review flow"
            >
              <source src="/tapvora-review-flow.mp4" type="video/mp4" />
              Your browser does not support embedded videos.
            </video>
          </div>
        </div>
      </section>

      <section className="product-film" aria-label="Tapvora product experience">
        <div className="film-glow" />
        <div className="shell film-grid">
          <div className="film-copy" data-reveal>
            <span className="section-kicker">One card. One seamless flow.</span>
            <h2 className="display section-title">A tiny interaction that feels like magic.</h2>
            <p>Tap and scan meet at the same permanent link. The destination stays under your control while the physical card stays beautifully simple.</p>
            <div className="film-signal"><Sparkles size={17} /> Live product flow</div>
          </div>
          <div className="film-stage" data-reveal style={{ "--reveal-delay": "140ms" } as React.CSSProperties}>
            <div className="film-phone">
              <div className="phone-island" />
              <div className="phone-screen">
                <div className="phone-brand"><span className="pulse-dot" /> tapvora</div>
                <div className="phone-state state-one"><Radio size={28} /><b>Card detected</b><small>Opening your review page</small></div>
                <div className="phone-state state-two"><span className="google-g">G</span><b>Ready to review</b><small>Share your experience</small><div className="phone-stars">★★★★★</div></div>
              </div>
            </div>
            <div className="film-card">
              <Image src="/tapvora-card-template-transparent.png" alt="" fill sizes="380px" />
              <span className="tap-wave wave-one" /><span className="tap-wave wave-two" /><span className="tap-wave wave-three" />
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="system">
        <div className="shell system-copy">
          <div data-reveal>
            <span className="section-kicker">Built to stay flexible</span>
            <h2 className="display section-title">Print once. Update forever.</h2>
            <p style={{ color: "var(--ink-soft)", lineHeight: 1.7 }}>
              QR and NFC carry the same permanent Tapvora URL. Change the business destination later without reprinting or rewriting the chip.
            </p>
            <div className="feature-list">
              <div className="feature-item"><span className="check"><Check size={15} /></span><div><strong>One URL for QR and NFC</strong><p>Every card has one permanent code, keeping production simple and mistake-resistant.</p></div></div>
              <div className="feature-item"><span className="check"><Check size={15} /></span><div><strong>Fast admin control</strong><p>Assign a business, paste its review URL, and activate the card in one place.</p></div></div>
              <div className="feature-item"><span className="check"><Check size={15} /></span><div><strong>Production-ready downloads</strong><p>Download phone-compatible PNGs for the QR or the exact 85 × 54 mm card artwork.</p></div></div>
            </div>
          </div>

        </div>
      </section>

      <section className="quote-cta-section">
        <div className="shell quote-cta" data-reveal>
          <div><span className="section-kicker">For your business</span><h2 className="display">Ready to make reviews easier?</h2><p>Tell us how many cards you need and where they will be used. We’ll share a clear quote with customization and delivery details.</p></div>
          <div className="quote-cta-actions"><Link className="button button-primary" href="/contact">Request a quote <ArrowRight size={17} /></Link>{whatsappUrl ? <a className="button button-whatsapp-dark" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} /> WhatsApp</a> : null}</div>
        </div>
      </section>

      <section className="testimonials-note"><div className="shell"><strong>Customer stories</strong><p>Verified customer experiences will be published here only with permission. We don’t use invented testimonials.</p></div></section>

      <footer className="site-footer">
        <div className="shell footer-row">
          <Brand />
          <span>Tap. Scan. Review. © {new Date().getFullYear()} Tapvora.</span>
          <div className="footer-links"><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/refund-policy">Refunds</Link></div>
          <span style={{ display: "inline-flex", gap: 7, alignItems: "center" }}><Radio size={15} /> {SITE_URL.replace(/^https?:\/\//, "")}</span>
        </div>
      </footer>
      {whatsappUrl ? <a className="whatsapp-float" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Contact Tapvora on WhatsApp"><MessageCircle size={23} /></a> : null}
    </main>
  );
}
