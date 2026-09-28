import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, KeyRound } from "lucide-react";
import { AuthMotionBackground } from "@/components/auth-motion-background";
import { Brand } from "@/components/brand";
import { requestPasswordResetAction } from "@/app/login/actions";

export const metadata: Metadata = { title: "Reset password" };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string; sent?: string }> }) {
  const params = await searchParams;
  return (
    <main className="auth-motion-page">
      <AuthMotionBackground />
      <section className="auth-motion-card" aria-labelledby="reset-password-title">
        <div className="auth-card-brand"><Brand /></div>
        <div className="auth-card-icon"><KeyRound size={24} /></div>
        <div className="auth-card-heading"><span>Private administration</span><h1 id="reset-password-title">Reset password</h1><p>Enter your administrator email. If it exists, Supabase will send a secure recovery link.</p></div>
          {params.error ? <div className="alert alert-error">{params.error}</div> : null}
          {params.sent ? <div className="alert alert-success">Check your inbox for the password-reset link.</div> : null}
          <form action={requestPasswordResetAction} className="auth-motion-form">
            <div className="field"><label htmlFor="email">Email address</label><input className="input" id="email" name="email" type="email" autoComplete="email" required /></div>
            <button className="button auth-submit button-wide" type="submit">Send reset link <ArrowRight size={17} /></button>
          </form>
          <div className="auth-card-back"><Link href="/login">← Back to sign in</Link></div>
      </section>
    </main>
  );
}
