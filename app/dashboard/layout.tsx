import Link from "next/link";
import { Building2, ExternalLink, LayoutDashboard, LogOut, Plus, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <Brand href="/dashboard" />
        <nav className="side-nav" aria-label="Dashboard navigation">
          <Link className="side-link active" href="/dashboard"><LayoutDashboard size={18} /><span>Overview</span></Link>
          <Link className="side-link" href="/dashboard/businesses"><Building2 size={18} /><span>Businesses</span></Link>
          <Link className="side-link" href="/dashboard/cards/new"><Plus size={18} /><span>Create cards</span></Link>
          <Link className="side-link" href="/dashboard/account"><ShieldCheck size={18} /><span>Account security</span></Link>
          <Link className="side-link" href="/" target="_blank"><ExternalLink size={18} /><span>Public website</span></Link>
        </nav>
        <div className="sidebar-bottom">
          {admin.demo ? <div className="demo-chip">Preview mode · connect Supabase to go live</div> : null}
          <form action={logoutAction}>
            <button className="logout-button" type="submit"><LogOut size={17} /><span>Sign out</span></button>
          </form>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
      <nav className="mobile-dashboard-nav" aria-label="Mobile dashboard navigation">
        <Link href="/dashboard"><LayoutDashboard size={20} /><span>Overview</span></Link>
        <Link href="/dashboard/businesses"><Building2 size={20} /><span>Businesses</span></Link>
        <Link className="mobile-nav-create" href="/dashboard/cards/new"><Plus size={22} /><span>New card</span></Link>
        <Link href="/dashboard/account"><ShieldCheck size={20} /><span>Account</span></Link>
      </nav>
    </div>
  );
}
