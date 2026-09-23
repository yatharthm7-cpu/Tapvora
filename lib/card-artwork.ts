import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import sharp from "sharp";
import { SITE_URL } from "./config";
import type { TapvoraCard } from "./types";

const CARD_WIDTH = 1004;
const CARD_HEIGHT = 638;
const ACTIVATION_PIN_PATTERN = /^[A-F0-9]{8}$/;
let artworkFontDataPromise: Promise<string> | undefined;

function artworkFontData() {
  artworkFontDataPromise ??= readFile(path.join(process.cwd(), "public", "fonts", "Geist-Regular.ttf"))
    .then((font) => font.toString("base64"));
  return artworkFontDataPromise;
}

function activationPin(card: TapvoraCard) {
  const pin = card.activation_pin?.trim().toUpperCase() || "";
  if (!ACTIVATION_PIN_PATTERN.test(pin)) {
    throw new Error("This card does not have a valid activation PIN.");
  }

  return pin;
}

function activationLabel(card: TapvoraCard) {
  const pin = activationPin(card);

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

type CardSvgOptions = {
  templateHref?: string;
  fontHref?: string;
};

export async function renderCardSvg(card: TapvoraCard, template: Buffer, options: CardSvgOptions = {}) {
  const pin = activationPin(card);
  const permanentUrl = `${SITE_URL}/r/${card.code}`;
  const qrSize = Math.round(CARD_WIDTH * (258 / 1574));
  const qrLeft = Math.round(CARD_WIDTH * (686 / 1574));
  const qrTop = Math.round(CARD_HEIGHT * (346 / 1000));
  const qrSvg = await QRCode.toString(permanentUrl, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 2,
    width: qrSize,
    color: { dark: "#000000", light: "#ffffff" },
  });
  const positionedQr = qrSvg.replace(
    "<svg",
    `<svg x="${qrLeft}" y="${qrTop}"`,
  );
  const fontSource = options.fontHref || `data:font/truetype;base64,${await artworkFontData()}`;
  const templateSource = options.templateHref || `data:image/png;base64,${template.toString("base64")}`;

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="85mm" height="54mm" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <defs>
    <style>
      @font-face { font-family: TapvoraGeist; src: url("${fontSource}") format("truetype"); }
    </style>
  </defs>
  <image href="${templateSource}" x="0" y="0" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" preserveAspectRatio="none"/>
  ${positionedQr}
  <text x="494" y="587" text-anchor="middle" font-family="TapvoraGeist, Arial, sans-serif" font-size="18" font-weight="800" fill="#13211d" stroke="#13211d" stroke-width="0.35">${pin}</text>
</svg>`);
}
