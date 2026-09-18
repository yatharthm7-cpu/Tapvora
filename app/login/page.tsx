import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Brand } from "@/components/brand";
import { isSupabaseConfigured, SITE_URL } from "@/lib/config";
import { loginAction } from "./actions";

export const metadata: Metadata = { title: "Admin login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const demo = !isSupabaseConfigured();

  return (
    <main className="login-page">
      <section className="login-art">
        <Brand />
        <div className="login-quote">
          <h1>Your cards.<br />One clear view.</h1>
          <p>Create permanent links, assign businesses, update review destinations, and prepare every card for print.</p>
        </div>
        <span style={{ color: "#71827c", fontSize: 12 }}>Private Tapvora administration</span>
      </section>
      <section className="login-form-side">
        <div className="login-card">
          <LockKeyhole size={30} />
          <h2>Welcome back</h2>
          <p>Sign in to manage Tapvora cards and review links.</p>
          {error ? <div className="alert alert-error">{error}</div> : null}
          {demo ? <div className="alert alert-demo">Demo mode is active. Continue without credentials to preview the dashboard.</div> : null}
          <form action={loginAction}>
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
              </>
            ) : null}
            <button className="button button-dark button-wide" type="submit">
              {demo ? "Preview dashboard" : "Sign in"} <ArrowRight size={17} />
            </button>
          </form>
          <div style={{ marginTop: 22, textAlign: "center", fontSize: 12 }}><Link className="muted" href="/">← Back to {SITE_URL.replace(/^https?:\/\//, "")}</Link></div>
        </div>
      </section>
    </main>
  );
}
