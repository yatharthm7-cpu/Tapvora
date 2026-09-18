import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, KeyRound } from "lucide-react";
import { Brand } from "@/components/brand";
import { requestPasswordResetAction } from "@/app/login/actions";

export const metadata: Metadata = { title: "Reset password" };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string; sent?: string }> }) {
  const params = await searchParams;
  return (
    <main className="login-page">
      <section className="login-art"><Brand /><div className="login-quote"><h1>Secure access.<br />Simple recovery.</h1><p>Request a private Supabase recovery link for your Tapvora administrator account.</p></div><span style={{ color: "#71827c", fontSize: 12 }}>Private Tapvora administration</span></section>
      <section className="login-form-side">
        <div className="login-card">
          <KeyRound size={30} /><h2>Reset password</h2><p>Enter your administrator email. If it exists, Supabase will send a recovery link.</p>
          {params.error ? <div className="alert alert-error">{params.error}</div> : null}
          {params.sent ? <div className="alert alert-success">Check your inbox for the password-reset link.</div> : null}
          <form action={requestPasswordResetAction}>
            <div className="field"><label htmlFor="email">Email address</label><input className="input" id="email" name="email" type="email" autoComplete="email" required /></div>
            <button className="button button-dark button-wide" type="submit">Send reset link <ArrowRight size={17} /></button>
          </form>
          <div className="login-back"><Link className="muted" href="/login">← Back to sign in</Link></div>
        </div>
      </section>
    </main>
  );
}
