import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import sharp from "sharp";
import { SITE_URL } from "./config";
import type { TapvoraCard } from "./types";

const CARD_WIDTH = 1004;
const CARD_HEIGHT = 638;
const ACTIVATION_PIN_PATTERN = /^[A-F0-9]{8}$/;
const LEFT_COLUMN_COVER = { left: 40, top: 48, width: 350, height: 548 };
const LEGACY_TEXT_COVER = { left: 390, top: 470, width: 35, height: 125 };
const CARD_SURFACE = "#f7f8f9";
const BODY_FONT_FILE = path.join(process.cwd(), "public", "fonts", "Geist-Regular.ttf");
const HEADING_FONT_FILE = path.join(process.cwd(), "public", "fonts", "SpaceGrotesk-Variable.ttf");
let bodyFontDataPromise: Promise<string> | undefined;
let headingFontDataPromise: Promise<string> | undefined;

function bodyFontData() {
  bodyFontDataPromise ??= readFile(BODY_FONT_FILE).then((font) => font.toString("base64"));
  return bodyFontDataPromise;
}

function headingFontData() {
  headingFontDataPromise ??= readFile(HEADING_FONT_FILE).then((font) => font.toString("base64"));
  return headingFontDataPromise;
}

function activationPin(card: TapvoraCard) {
  const pin = card.activation_pin?.trim().toUpperCase() || "";
  if (!ACTIVATION_PIN_PATTERN.test(pin)) throw new Error("This card does not have a valid activation PIN.");
  return pin;
}

export async function renderCardPng(card: TapvoraCard, template: Buffer) {
  const svg = await renderCardSvg(card, template);
  return sharp(svg, { density: 300 })
    .resize(CARD_WIDTH, CARD_HEIGHT, { fit: "fill" })
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .withMetadata({ density: 300 })
    .toBuffer();
}

type CardSvgOptions = {
  templateHref?: string;
  fontHref?: string;
  headingFontHref?: string;
};

export async function renderCardSvg(card: TapvoraCard, template: Buffer, options: CardSvgOptions = {}) {
  const pin = activationPin(card);
  const permanentUrl = `${SITE_URL}/r/${card.code}`;
  const qrSize = Math.round(CARD_WIDTH * (258 / 1574));
  const qrLeft = Math.round(CARD_WIDTH * (686 / 1574));
  const qrTop = Math.round(CARD_HEIGHT * (346 / 1000));
  const qrSvg = await QRCode.toString(permanentUrl, { type: "svg", errorCorrectionLevel: "H", margin: 2, width: qrSize, color: { dark: "#000000", light: "#ffffff" } });
  const positionedQr = qrSvg.replace("<svg", `<svg x="${qrLeft}" y="${qrTop}"`);
  const bodyFontSource = options.fontHref || `data:font/truetype;base64,${await bodyFontData()}`;
  const headingFontSource = options.headingFontHref || `data:font/truetype;base64,${await headingFontData()}`;
  const templateSource = options.templateHref || `data:image/png;base64,${template.toString("base64")}`;

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="85mm" height="54mm" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <defs>
    <style>
      @font-face { font-family: CardBody; src: url("${bodyFontSource}") format("truetype"); }
      @font-face { font-family: CardHeading; src: url("${headingFontSource}") format("truetype"); font-weight: 300 700; }
    </style>
  </defs>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#ffffff"/>
  <image href="${templateSource}" x="0" y="0" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" preserveAspectRatio="none"/>
  <rect x="${LEFT_COLUMN_COVER.left}" y="${LEFT_COLUMN_COVER.top}" width="${LEFT_COLUMN_COVER.width}" height="${LEFT_COLUMN_COVER.height}" fill="${CARD_SURFACE}"/>
  <rect x="${LEGACY_TEXT_COVER.left}" y="${LEGACY_TEXT_COVER.top}" width="${LEGACY_TEXT_COVER.width}" height="${LEGACY_TEXT_COVER.height}" fill="${CARD_SURFACE}"/>
  <text x="68" y="101" font-family="CardBody, Arial, sans-serif" font-size="15" font-weight="800" letter-spacing="2.2" fill="#52625b">YOUR FEEDBACK MATTERS</text>
  <text x="68" y="164" font-family="CardHeading, Arial, sans-serif" font-size="47" font-weight="700" letter-spacing="-1.5" fill="#090b0a">Enjoyed your</text>
  <text x="68" y="219" font-family="CardHeading, Arial, sans-serif" font-size="47" font-weight="700" letter-spacing="-1.5" fill="#176ce6">experience?</text>
  <text x="70" y="290" font-family="CardBody, Arial, sans-serif" font-size="27" fill="#536174">Your feedback</text>
  <text x="70" y="325" font-family="CardBody, Arial, sans-serif" font-size="27" fill="#536174">helps us grow!</text>
  <path d="M68 364.5H348" fill="none" stroke="#176ce6" stroke-width="5" stroke-linecap="round"/>
  <text x="68" y="410" font-family="CardBody, Arial, sans-serif" font-size="15" font-weight="800" letter-spacing="1.5" fill="#536174">LEAVE US A</text>
  <text x="68" y="454" font-family="CardHeading, Arial, sans-serif" font-size="34" font-weight="700" fill="#090b0a">Google Review</text>
  <text x="68" y="493" font-family="CardBody, Arial, sans-serif" font-size="17" fill="#536174">Tap or scan to get started</text>
  <text x="68" y="526" font-family="CardBody, Arial, sans-serif" font-size="14" font-style="italic" fill="#687771">“Your feedback helps us improve.”</text>
  <text x="68" y="550" font-family="CardBody, Arial, sans-serif" font-size="14" font-style="italic" fill="#687771">“Every review makes a difference.”</text>
  ${positionedQr}
  <text x="494" y="587" text-anchor="middle" font-family="CardBody, Arial, sans-serif" font-size="18" font-weight="800" fill="#13211d" stroke="#13211d" stroke-width="0.35">${pin}</text>
  <text x="948" y="588" text-anchor="end" font-family="CardBody, Arial, sans-serif" font-size="14" font-weight="800" fill="#33423d">www.tapvora.in</text>
</svg>`);
}
