import Link from "next/link";
import { CreditCard, ExternalLink, LayoutDashboard, LogOut, Plus } from "lucide-react";
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
          <Link className="side-link" href="/dashboard"><CreditCard size={18} /><span>All cards</span></Link>
          <Link className="side-link" href="/dashboard/cards/new"><Plus size={18} /><span>Create cards</span></Link>
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
    </div>
  );
}
