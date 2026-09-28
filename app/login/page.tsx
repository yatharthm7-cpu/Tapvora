import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { AuthMotionBackground } from "@/components/auth-motion-background";
import { Brand } from "@/components/brand";
import { isSupabaseConfigured, SITE_URL } from "@/lib/config";
import { loginAction } from "./actions";

export const metadata: Metadata = { title: "Admin login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const demo = !isSupabaseConfigured();

  return (
    <main className="auth-motion-page">
      <AuthMotionBackground />
      <section className="auth-motion-card" aria-labelledby="admin-login-title">
        <div className="auth-card-brand"><Brand /></div>
        <div className="auth-card-icon"><LockKeyhole size={24} /></div>
        <div className="auth-card-heading">
          <span>Private administration</span>
          <h1 id="admin-login-title">Welcome back</h1>
          <p>Sign in to manage Tapvora cards and review links.</p>
        </div>
          {error ? <div className="alert alert-error">{error}</div> : null}
          {demo ? <div className="alert alert-demo">Demo mode is active. Continue without credentials to preview the dashboard.</div> : null}
          <form action={loginAction} className="auth-motion-form">
            {!demo ? (
              <>
                <div className="field">
                  <label htmlFor="email">Email address</label>
                  <input className="input" id="email" name="email" type="email" autoComplete="email" required />
                </div>
                <div className="field">
                  <label htmlFor="password">Password</label>
                  <input className="input" id="password" name="password" type="password" autoComplete="current-password" required />
                </div>
                <div className="login-help"><Link href="/forgot-password">Forgot password?</Link></div>
              </>
            ) : null}
            <button className="button auth-submit button-wide" type="submit">
              {demo ? "Preview dashboard" : "Sign in"} <ArrowRight size={17} />
            </button>
          </form>
          <div className="auth-card-back"><Link href="/">← Back to {SITE_URL.replace(/^https?:\/\//, "")}</Link></div>
      </section>
    </main>
  );
}
