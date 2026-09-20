import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { createBusinessAction } from "../actions";

export const metadata: Metadata = { title: "Add business" };

export default async function NewBusinessPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <div className="form-shell">
    <header className="admin-top"><div><h1>Add business</h1><p>Create a reusable customer profile and Google Review destination.</p></div><Link className="button button-soft" href="/dashboard/businesses"><ArrowLeft size={17} /> Back</Link></header>
    {error ? <div className="alert alert-error">{error}</div> : null}
    <BusinessForm action={createBusinessAction} />
  </div>;
}

function BusinessForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  return <form action={action}><section className="form-card"><h2>Business details</h2><p>The review link saved here can be shared by all cards assigned to this business.</p><div className="form-grid">
    <div className="field"><label htmlFor="name">Business name</label><input className="input" id="name" name="name" required /></div>
    <div className="field"><label htmlFor="contact_name">Contact name</label><input className="input" id="contact_name" name="contact_name" /></div>
    <div className="field field-full"><label htmlFor="review_url">Google Review URL</label><input className="input" id="review_url" name="review_url" type="url" placeholder="https://g.page/r/.../review" required /></div>
    <div className="field"><label htmlFor="contact_email">Email</label><input className="input" id="contact_email" name="contact_email" type="email" /></div>
    <div className="field"><label htmlFor="contact_phone">Phone</label><input className="input" id="contact_phone" name="contact_phone" type="tel" /></div>
    <div className="field field-full"><label htmlFor="address">Business address</label><textarea className="textarea" id="address" name="address" rows={2} maxLength={500} autoComplete="street-address" placeholder="Shop number, street, area, city, state and PIN code" /></div>
    <div className="field field-full"><label htmlFor="notes">Internal notes</label><textarea className="textarea" id="notes" name="notes" rows={3} /></div>
  </div><div className="form-actions"><button className="button button-dark" type="submit"><Save size={16} /> Save business</button></div></section></form>;
}
