import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/brand";

export function LegalPage({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return <main className="legal-page"><header className="shell legal-nav"><Brand /><Link href="/"><ArrowLeft size={16} /> Back home</Link></header><article className="shell legal-content"><span className="section-kicker">Tapvora policies</span><h1 className="display">{title}</h1><p className="legal-intro">{intro}</p><p className="legal-date">Effective 20 September 2026</p>{children}<div className="legal-contact"><strong>Questions?</strong><p>Use the <Link href="/contact">quote and contact form</Link> to reach Tapvora.</p></div></article></main>;
}
