import QRCode from "qrcode";
import sharp from "sharp";
import { SITE_URL } from "./config";
import type { TapvoraCard } from "./types";

const CARD_WIDTH = 1004;
const CARD_HEIGHT = 638;

function activationLabel(card: TapvoraCard) {
  const pin = card.activation_pin || "--------";
  const serial = `TV-${String(card.card_number).padStart(4, "0")}`;
  return Buffer.from(`<svg width="218" height="70" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="216" height="68" rx="13" fill="#ffffff" stroke="#1572e8" stroke-width="2"/>
    <text x="109" y="22" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#40514b" letter-spacing="1">ACTIVATE ${serial}</text>
    <text x="109" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="#13211d" letter-spacing="2">PIN ${pin}</text>
  </svg>`);
}

export async function renderCardPng(card: TapvoraCard, template: Buffer) {
  const permanentUrl = `${SITE_URL}/r/${card.code}`;
  const qrSize = Math.round(CARD_WIDTH * (258 / 1574));
  const qr = await QRCode.toBuffer(permanentUrl, {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 2,
    width: qrSize,
    color: { dark: "#000000", light: "#ffffff" },
  });

  return sharp(template)
    .resize(CARD_WIDTH, CARD_HEIGHT, { fit: "fill" })
    .composite([
      { input: qr, left: Math.round(CARD_WIDTH * (686 / 1574)), top: Math.round(CARD_HEIGHT * (346 / 1000)) },
      { input: activationLabel(card), left: 772, top: 492 },
    ])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .withMetadata({ density: 300 })
    .toBuffer();
}
