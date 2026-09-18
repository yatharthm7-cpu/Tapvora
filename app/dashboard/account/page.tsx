import type { Metadata } from "next";
import { KeyRound, Save, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { updatePasswordAction } from "@/app/login/actions";

export const metadata: Metadata = { title: "Account security" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const [admin, params] = await Promise.all([requireAdmin(), searchParams]);
  return (
    <>
      <header className="admin-top"><div><h1>Account security</h1><p>Manage the password for your private Tapvora administrator account.</p></div><span className="security-badge"><ShieldCheck size={17} /> Supabase protected</span></header>
      {params.error ? <div className="alert alert-error">{params.error}</div> : null}
      {params.saved ? <div className="alert alert-success">Your password has been updated.</div> : null}
      <div className="form-shell">
        <section className="form-card">
          <KeyRound size={26} /><h2>Change password</h2><p>Signed in as {admin.email}. Use a unique password that you do not use anywhere else.</p>
          {admin.demo ? <div className="alert alert-demo">Password changes are unavailable in demo mode.</div> : (
            <form action={updatePasswordAction}>
              <div className="form-grid">
                <div className="field"><label htmlFor="password">New password</label><input className="input" id="password" name="password" type="password" minLength={10} autoComplete="new-password" required /><span className="field-help">At least 10 characters, including a letter and a number.</span></div>
                <div className="field"><label htmlFor="confirmation">Confirm new password</label><input className="input" id="confirmation" name="confirmation" type="password" minLength={10} autoComplete="new-password" required /></div>
              </div>
              <div className="form-actions"><button className="button button-dark" type="submit"><Save size={16} /> Update password</button></div>
            </form>
          )}
        </section>
      </div>
    </>
  );
}
