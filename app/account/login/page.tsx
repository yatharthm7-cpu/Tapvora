import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, Radio } from "lucide-react";
import { AuthMotionBackground } from "@/components/auth-motion-background";
import { Brand } from "@/components/brand";
import { sendCustomerLoginLinkAction } from "../actions";

export const metadata: Metadata = { title: "Business login" };

export default async function CustomerLoginPage({ searchParams }: { searchParams: Promise<{ error?: string; sent?: string }> }) {
  const query = await searchParams;
  return <main className="auth-motion-page">
    <AuthMotionBackground />
    <section className="auth-motion-card" aria-labelledby="business-login-title">
      <div className="auth-card-brand"><Brand /></div>
      <div className="auth-card-icon"><Mail size={24} /></div>
      <div className="auth-card-heading">
        <span>Tapvora for business</span>
        <h1 id="business-login-title">Manage your review link</h1>
        <p>Enter the email used when your card was activated. We’ll send a secure sign-in link—no password required.</p>
      </div>
        {query.error ? <div className="alert alert-error">{query.error}</div> : null}
        {query.sent ? <div className="alert alert-success">Check your email for the Tapvora sign-in link. It may take a minute to arrive.</div> : null}
        <form action={sendCustomerLoginLinkAction} className="auth-motion-form">
          <label><span>Registered email</span><input className="input" name="email" type="email" inputMode="email" autoComplete="email" placeholder="owner@business.com" required /></label>
          <button className="button auth-submit button-wide" type="submit">Email me a sign-in link <ArrowRight size={17} /></button>
        </form>
        <div className="auth-trust-row"><span><Radio size={15} /> Cards stay unchanged</span><span><Mail size={15} /> Verified email access</span></div>
        <p className="auth-card-note">Haven’t activated a card yet? Tap or scan your Tapvora card first.</p>
        <div className="auth-card-back"><Link href="/">← Back to Tapvora</Link></div>
    </section>
  </main>;
}
