import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { SITE_URL } from "@/lib/config";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Tapvora — More reviews, one tap away",
    template: "%s — Tapvora",
  },
  description:
    "NFC and QR review cards that take customers straight to your Google Review page.",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Tapvora",
    title: "Tapvora — More reviews, one tap away",
    description:
      "NFC and QR review cards that take customers straight to your Google Review page.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>{children}</body>
    </html>
  );
}
