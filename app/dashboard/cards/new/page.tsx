import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Layers3 } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/config";
import { createCardsAction } from "../actions";

export const metadata: Metadata = { title: "Create cards" };

export default async function NewCardsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const isDemo = !isSupabaseConfigured();

  return (
    <div className="form-shell">
      <header className="admin-top">
        <div><h1>Create physical cards</h1><p>Generate permanent codes before printing and programming NFC.</p></div>
        <Link className="button button-soft" href="/dashboard"><ArrowLeft size={17} /> Back</Link>
      </header>
      {error ? <div className="alert alert-error">{error}</div> : null}
      {isDemo ? <div className="alert alert-demo">Connect Supabase before generating permanent card records. Preview mode does not create temporary or fictional cards.</div> : null}
      <form action={createCardsAction}>
        <section className="form-card">
          <Layers3 size={25} />
          <h2>New card batch</h2>
          <p>Each card receives a unique six-character code and starts as unused.</p>
          <div className="field">
            <label htmlFor="quantity">Number of cards</label>
            <input className="input" id="quantity" name="quantity" type="number" min="1" max="50" defaultValue="20" required />
            <span className="field-help">For the first shipment, create 20 records—one for every blank PVC card.</span>
          </div>
          <div className="form-actions">
            <Link className="button button-outline" href="/dashboard">Cancel</Link>
            <button className="button button-dark" type="submit" disabled={isDemo}>Generate permanent links</button>
          </div>
        </section>
      </form>
    </div>
  );
}
