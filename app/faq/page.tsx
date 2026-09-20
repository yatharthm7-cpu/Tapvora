import type { Metadata } from "next";
import { PublicPage } from "@/components/public-page";

export const metadata: Metadata = { title: "Frequently asked questions", description: "Answers about Tapvora NFC and QR Google Review cards, setup, compatibility, and support." };

const faqs = [
  ["Do customers need an app?", "No. A customer can tap with a compatible NFC phone or scan the QR code using the phone camera. An internet connection is required."],
  ["Do NFC and QR open the same link?", "Yes. Both carry the same permanent Tapvora URL, which redirects to the saved Google Review destination."],
  ["Can the Google Review link be changed later?", "Yes. The destination can be updated in Tapvora while the permanent URL on the physical card stays the same."],
  ["What happens if NFC is disabled?", "The printed QR code remains available as a fallback. The customer can scan it using the phone camera."],
  ["Will it work with every phone?", "QR scanning works on modern camera phones. NFC requires a compatible phone, NFC to be enabled where applicable, and correct positioning near the phone's NFC antenna."],
  ["Can Tapvora guarantee that a customer leaves a review?", "No. Tapvora makes the review destination easier to reach. The decision to leave a review and its content always belongs to the customer."],
  ["Can businesses offer rewards for reviews?", "Tapvora should be used to request genuine, unbiased reviews. Businesses should not offer incentives or selectively ask only satisfied customers."],
  ["How do I request support?", "Contact Tapvora on WhatsApp and include the business name and printed Card ID so the correct card can be identified."],
] as const;

export default function FaqPage() {
  return <PublicPage kicker="Clear answers" title="Frequently asked questions." intro="The practical details businesses usually want to know before ordering or using a Tapvora card.">
    <section className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>
  </PublicPage>;
}
