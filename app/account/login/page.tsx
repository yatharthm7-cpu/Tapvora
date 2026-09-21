import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, Radio } from "lucide-react";
import { Brand } from "@/components/brand";
import { sendCustomerLoginLinkAction } from "../actions";

export const metadata: Metadata = { title: "Business login" };

export default async function CustomerLoginPage({ searchParams }: { searchParams: Promise<{ error?: string; sent?: string }> }) {
  const query = await searchParams;
  return <main className="customer-auth-page">
    <header className="activation-nav shell"><Brand /><span>Business account</span></header>
    <section className="customer-auth-shell shell">
      <div className="customer-auth-copy"><span className="eyebrow">Tapvora for business</span><h1 className="display">Manage your review link.</h1><p>Enter the email used when your card was activated. We’ll send you a secure sign-in link—no password required.</p><div className="activation-flow"><span><Radio size={18} /> Your cards stay unchanged</span><span><Mail size={18} /> Verified email access</span></div></div>
      <div className="activation-card">
        <div className="activation-card-head"><Mail size={21} /><div><h2>Business login</h2><p>We’ll send a one-time sign-in link to your registered email.</p></div></div>
        {query.error ? <div className="alert alert-error">{query.error}</div> : null}
        {query.sent ? <div className="alert alert-success">Check your email for the Tapvora sign-in link. It may take a minute to arrive.</div> : null}
        <form action={sendCustomerLoginLinkAction} className="activation-form">
          <label><span>Registered email</span><input className="input" name="email" type="email" inputMode="email" autoComplete="email" placeholder="owner@business.com" required /></label>
          <button className="button button-dark button-wide" type="submit">Email me a sign-in link <ArrowRight size={17} /></button>
        </form>
        <p className="activation-help">Haven’t activated a card yet? Tap or scan your Tapvora card first.</p>
        <div className="login-back"><Link className="muted" href="/">← Back to Tapvora</Link></div>
      </div>
    </section>
  </main>;
}
