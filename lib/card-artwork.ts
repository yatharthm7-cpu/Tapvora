import path from "node:path";
import QRCode from "qrcode";
import sharp from "sharp";
import { SITE_URL } from "./config";
import type { TapvoraCard } from "./types";

const CARD_WIDTH = 1004;
const CARD_HEIGHT = 638;
const ACTIVATION_PIN_PATTERN = /^[A-F0-9]{8}$/;

function activationLabel(card: TapvoraCard) {
  const pin = card.activation_pin?.trim().toUpperCase() || "";
  if (!ACTIVATION_PIN_PATTERN.test(pin)) {
    throw new Error("This card does not have a valid activation PIN.");
  }

  return {
    text: {
      text: `<span foreground="#13211d"><b>${pin}</b></span>`,
      font: "Geist 16",
      fontfile: path.join(process.cwd(), "public", "fonts", "Geist-Regular.ttf"),
      width: 160,
      align: "centre" as const,
      rgba: true,
    },
  };
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
  const label = activationLabel(card);

  return sharp(template)
    .resize(CARD_WIDTH, CARD_HEIGHT, { fit: "fill" })
    .composite([
      { input: qr, left: Math.round(CARD_WIDTH * (686 / 1574)), top: Math.round(CARD_HEIGHT * (346 / 1000)) },
      { input: label, left: 413, top: 568 },
      { input: label, left: 414, top: 568 },
    ])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .withMetadata({ density: 300 })
    .toBuffer();
}
