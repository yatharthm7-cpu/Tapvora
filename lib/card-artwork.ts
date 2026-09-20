import QRCode from "qrcode";
import sharp from "sharp";
import { SITE_URL } from "./config";
import type { TapvoraCard } from "./types";

const CARD_WIDTH = 1004;
const CARD_HEIGHT = 638;

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
    .composite([{ input: qr, left: Math.round(CARD_WIDTH * (686 / 1574)), top: Math.round(CARD_HEIGHT * (346 / 1000)) }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .withMetadata({ density: 300 })
    .toBuffer();
}
