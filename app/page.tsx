import Link from "next/link";
import {
  ArrowRight,
  Check,
  CreditCard,
  Link2,
  Radio,
  RefreshCw,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { SITE_URL } from "@/lib/config";

export default function HomePage() {
  return (
    <main>
      <header className="shell site-nav">
        <Brand />
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#system">The system</a>
          <Link className="button button-dark button-small" href="/login">
            Admin login <ArrowRight size={15} />
          </Link>
        </nav>
      </header>

      <section className="hero">
        <div className="shell hero-grid">
          <div>
            <span className="eyebrow">NFC + QR review cards</span>
            <h1 className="display">More reviews.<br /><em>One tap away.</em></h1>
            <p className="hero-copy">
              A beautifully simple card that sends customers straight to your Google Review page—by tap or scan.
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href="#how-it-works">See how it works <ArrowRight size={17} /></a>
              <Link className="button button-outline" href="/dashboard">Open dashboard</Link>
            </div>
            <div className="micro-proof">
              <span><i /> No app needed</span>
              <span><i /> Editable destination</span>
              <span><i /> Works with iPhone & Android</span>
            </div>
          </div>

          <div className="card-stage" aria-label="Tapvora review card preview">
            <div className="product-card">
              <div className="stars">★★★★★</div>
              <h2>Enjoyed your experience?</h2>
              <p>Your feedback helps us grow.</p>
              <div className="card-actions">
                <div>
                  <div className="fake-qr" />
                  <p style={{ marginTop: 8, fontWeight: 800 }}>SCAN HERE</p>
                </div>
                <div className="tap-area">
                  <span className="tap-rings">)))</span>
                  <span>TAP HERE</span>
                  <span style={{ color: "#d8ff63" }}>LEAVE A REVIEW</span>
                </div>
              </div>
            </div>
            <div className="float-note one"><span className="float-icon"><RefreshCw size={17} /></span> Change the link anytime</div>
            <div className="float-note two"><span className="float-icon"><ShieldCheck size={17} /></span> Permanent card URL</div>
          </div>
        </div>
      </section>

      <section className="section section-dark" id="how-it-works">
        <div className="shell">
          <div className="section-kicker">Frictionless by design</div>
          <h2 className="display section-title">From a happy customer to a Google Review in seconds.</h2>
          <p className="section-lead">No searching, no instructions, no app download. The shortest possible path to the review screen.</p>
          <div className="steps-grid">
            <article className="step-card">
              <div className="step-number">01 / TAP OR SCAN</div>
              <ScanLine size={30} style={{ marginTop: 32, color: "#d8ff63" }} />
              <h3>Customer interacts</h3>
              <p>They tap the NFC zone or scan the printed QR with the phone already in their hand.</p>
            </article>
            <article className="step-card">
              <div className="step-number">02 / SMART REDIRECT</div>
              <Link2 size={30} style={{ marginTop: 32, color: "#d8ff63" }} />
              <h3>Tapvora resolves</h3>
              <p>The permanent card link checks its live destination without changing the physical card.</p>
            </article>
            <article className="step-card">
              <div className="step-number">03 / GOOGLE REVIEW</div>
              <div style={{ marginTop: 30, color: "#d8ff63", letterSpacing: 3 }}>★★★★★</div>
              <h3>Review screen opens</h3>
              <p>Your Google Review flow opens directly, ready for the customer to share their experience.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="system">
        <div className="shell feature-grid">
          <div>
            <span className="section-kicker">Built to stay flexible</span>
            <h2 className="display section-title">Print once. Update forever.</h2>
            <p style={{ color: "var(--ink-soft)", lineHeight: 1.7 }}>
              QR and NFC carry the same permanent Tapvora URL. Change the business destination later without reprinting or rewriting the chip.
            </p>
            <div className="feature-list">
              <div className="feature-item"><span className="check"><Check size={15} /></span><div><strong>One URL for QR and NFC</strong><p>Every card has one permanent code, keeping production simple and mistake-resistant.</p></div></div>
              <div className="feature-item"><span className="check"><Check size={15} /></span><div><strong>Fast admin control</strong><p>Assign a business, paste its review URL, and activate the card in one place.</p></div></div>
              <div className="feature-item"><span className="check"><Check size={15} /></span><div><strong>Production-ready downloads</strong><p>Download the QR alone or an exact 85.6 × 54 mm card artwork file.</p></div></div>
            </div>
          </div>

          <div className="mini-dashboard" aria-label="Dashboard preview">
            <div className="mini-dashboard-head"><span className="mini-logo">tapvora / cards</span><span className="mini-dot" /></div>
            <div className="mini-dashboard-body">
              <div className="mini-empty">
                <span className="mini-empty-icon"><CreditCard size={23} /></span>
                <strong>No card activity to display</strong>
                <p>Live totals appear here only after cards are created and connected.</p>
              </div>
              <div className="mini-flow">
                <span><i>1</i>Create a permanent card link</span>
                <span><i>2</i>Add the verified Google Review URL</span>
                <span><i>3</i>Activate only after testing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="shell footer-row">
          <Brand />
          <span>Tap. Scan. Review. © {new Date().getFullYear()} Tapvora.</span>
          <span style={{ display: "inline-flex", gap: 7, alignItems: "center" }}><Radio size={15} /> {SITE_URL.replace(/^https?:\/\//, "")}</span>
        </div>
      </footer>
    </main>
  );
}
