import Link from "next/link";
import { Radio } from "lucide-react";

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link className="brand" href={href}>
      <span className="brand-mark"><Radio size={18} strokeWidth={2.6} /></span>
      <span>tapvora</span>
    </Link>
  );
}
