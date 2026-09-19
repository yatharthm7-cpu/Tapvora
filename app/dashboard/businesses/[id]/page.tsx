import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { notFound } from "next/navigation";
import { DeleteBusinessForm } from "@/components/delete-business-form";
import { getBusiness } from "@/lib/businesses";
import { updateBusinessAction } from "../actions";

export const metadata: Metadata = { title: "Manage business" };
export const dynamic = "force-dynamic";

export default async function BusinessPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string; created?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const business = await getBusiness(id);
  if (!business) notFound();
  return <div className="form-shell">
    <header className="admin-top"><div><h1>{business.name}</h1><p>{business.card_count} assigned card{business.card_count === 1 ? "" : "s"}</p></div><Link className="button button-soft" href="/dashboard/businesses"><ArrowLeft size={17} /> Back</Link></header>
    {query.error ? <div className="alert alert-error">{query.error}</div> : null}
    {query.saved || query.created ? <div className="alert alert-success">Business saved successfully.</div> : null}
    <form action={updateBusinessAction}><input type="hidden" name="id" value={business.id} /><section className="form-card"><h2>Business details</h2><p>Changing the name or review link also updates every assigned card.</p><div className="form-grid">
      <div className="field"><label htmlFor="name">Business name</label><input className="input" id="name" name="name" defaultValue={business.name} required /></div>
      <div className="field"><label htmlFor="contact_name">Contact name</label><input className="input" id="contact_name" name="contact_name" defaultValue={business.contact_name || ""} /></div>
      <div className="field field-full"><label htmlFor="review_url">Google Review URL</label><input className="input" id="review_url" name="review_url" type="url" defaultValue={business.review_url} required /></div>
      <div className="field"><label htmlFor="contact_email">Email</label><input className="input" id="contact_email" name="contact_email" type="email" defaultValue={business.contact_email || ""} /></div>
      <div className="field"><label htmlFor="contact_phone">Phone</label><input className="input" id="contact_phone" name="contact_phone" type="tel" defaultValue={business.contact_phone || ""} /></div>
      <div className="field field-full"><label htmlFor="notes">Internal notes</label><textarea className="textarea" id="notes" name="notes" rows={3} defaultValue={business.notes || ""} /></div>
    </div><div className="form-actions"><button className="button button-dark" type="submit"><Save size={16} /> Save changes</button></div></section></form>
    <section className="form-card danger-zone"><h2>Delete business</h2><p>The assigned cards will keep their current business name and review destination.</p><DeleteBusinessForm id={business.id} name={business.name} /></section>
  </div>;
}
