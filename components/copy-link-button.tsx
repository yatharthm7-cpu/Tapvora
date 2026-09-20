"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyLinkButton({ value, label = "Copy link", className = "button button-soft button-wide" }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const resolved = value.startsWith("/") ? `${window.location.origin}${value}` : value;
    await navigator.clipboard.writeText(resolved);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return <button className={className} type="button" onClick={copy}>
    {copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : label}
  </button>;
}
