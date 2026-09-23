import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import sharp from "sharp";
import type { OverlayOptions } from "sharp";
import { SITE_URL } from "./config";
import type { TapvoraCard } from "./types";

const CARD_WIDTH = 1004;
const CARD_HEIGHT = 638;
const ACTIVATION_PIN_PATTERN = /^[A-F0-9]{8}$/;
const BRAND_COVER = { left: 40, top: 48, width: 350, height: 170 };
const CARD_SURFACE = "#f7f8f9";
const BRAND_FONT_FILE = path.join(process.cwd(), "public", "fonts", "SpaceGrotesk-Variable.ttf");
let artworkFontDataPromise: Promise<string> | undefined;
let brandFontDataPromise: Promise<string> | undefined;

function artworkFontData() {
  artworkFontDataPromise ??= readFile(path.join(process.cwd(), "public", "fonts", "Geist-Regular.ttf"))
    .then((font) => font.toString("base64"));
  return artworkFontDataPromise;
}

function brandFontData() {
  brandFontDataPromise ??= readFile(BRAND_FONT_FILE).then((font) => font.toString("base64"));
  return brandFontDataPromise;
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

function escapeMarkup(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeXml(value: string) {
  return escapeMarkup(value).replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

function brandingName(card: TapvoraCard) {
  const name = (card.card_brand_name || card.business_name || "").trim().slice(0, 60);
  return name || null;
}

function logoBuffer(card: TapvoraCard) {
  const match = card.card_logo_data?.match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/);
  return match ? Buffer.from(match[1], "base64") : null;
}

function brandLines(name: string, maxChars: number) {
  if (name.length <= maxChars) return [name];
  const words = name.split(/\s+/);
  let first = "";
  while (words.length) {
    const candidate = first ? `${first} ${words[0]}` : words[0];
    if (candidate.length > maxChars && first) break;
    first = candidate;
    words.shift();
    if (first.length >= maxChars) break;
  }
  if (!first) first = name.slice(0, maxChars);
  let second = words.join(" ") || name.slice(first.length).trim();
  if (second.length > maxChars) second = `${second.slice(0, maxChars - 1).trim()}…`;
  return second ? [first, second] : [first];
}

function brandType(name: string, hasLogo: boolean) {
  const lines = brandLines(name, hasLogo ? 14 : 26);
  const longestLine = Math.max(...lines.map((line) => line.length));
  const fontSize = hasLogo
    ? longestLine > 12 ? 22 : longestLine > 9 ? 24 : 27
    : longestLine > 23 ? 23 : longestLine > 17 ? 26 : 30;

  return { lines, fontSize };
}

async function prepareLogo(logo: Buffer, logoOnly: boolean) {
  return sharp(logo)
    .trim({ threshold: 12 })
    .resize({
      width: logoOnly ? 310 : 150,
      height: logoOnly ? 118 : 108,
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function brandingOverlays(card: TapvoraCard) {
  const logo = logoBuffer(card);
  const name = brandingName(card);
  if (!logo && !name) return [];
  const hasLogo = Boolean(logo);
  const displayName = hasLogo ? null : name;
  const textLeft = 66;
  const textWidth = 298;
  const typography = displayName ? brandType(displayName, false) : null;
  const cover = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${BRAND_COVER.width}" height="${BRAND_COVER.height}"><rect width="100%" height="100%" fill="${CARD_SURFACE}"/></svg>`);
  const overlays: OverlayOptions[] = [
    { input: cover, left: BRAND_COVER.left, top: BRAND_COVER.top },
  ];

  if (logo) {
    const preparedLogo = await prepareLogo(logo, true);
    overlays.push({ input: preparedLogo, left: 57, top: 60 });
  }

  if (displayName && typography) {
    const brandNameOverlay = {
      input: {
        text: {
          text: `<span foreground="#0f1f1b" weight="700">${typography.lines.map(escapeMarkup).join("\n")}</span>`,
          font: `Space Grotesk ${typography.fontSize}`,
          fontfile: BRAND_FONT_FILE,
          width: textWidth,
          align: "left",
          spacing: 1,
          rgba: true,
        },
      },
      left: textLeft,
      top: typography.lines.length > 1 ? 78 : 94,
    } satisfies OverlayOptions;
    overlays.push(brandNameOverlay);
  }

  const poweredLeft = hasLogo ? 152 : textLeft;
  const poweredWidth = hasLogo ? 120 : textWidth;
  overlays.push({
    input: {
      text: {
        text: '<span foreground="#50615b">Powered by <b>Tapvora</b></span>',
        font: "Geist 9",
        fontfile: path.join(process.cwd(), "public", "fonts", "Geist-Regular.ttf"),
        width: poweredWidth,
        align: hasLogo ? "centre" : "left",
        rgba: true,
      },
    },
    left: poweredLeft,
    top: hasLogo ? 177 : 172,
  });

  return overlays;
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
  const branding = await brandingOverlays(card);

  return sharp(template)
    .resize(CARD_WIDTH, CARD_HEIGHT, { fit: "fill" })
    .composite([
      ...branding,
      { input: qr, left: Math.round(CARD_WIDTH * (686 / 1574)), top: Math.round(CARD_HEIGHT * (346 / 1000)) },
      { input: label, left: 413, top: 568 },
      { input: label, left: 414, top: 568 },
    ])
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .withMetadata({ density: 300 })
    .toBuffer();
}

type CardSvgOptions = {
  templateHref?: string;
  fontHref?: string;
  brandFontHref?: string;
  logoHref?: string;
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
  const brandFontSource = options.brandFontHref || `data:font/truetype;base64,${await brandFontData()}`;
  const templateSource = options.templateHref || `data:image/png;base64,${template.toString("base64")}`;
  const logo = logoBuffer(card);
  const name = brandingName(card);
  const hasLogo = Boolean(logo);
  const hasBranding = Boolean(hasLogo || name);
  const displayName = hasLogo ? null : name;
  const textX = 66;
  const typography = displayName ? brandType(displayName, false) : null;
  const preparedLogo = logo ? await prepareLogo(logo, true) : null;
  const logoSource = options.logoHref || (preparedLogo ? `data:image/png;base64,${preparedLogo.toString("base64")}` : "");
  const logoElement = hasLogo
    ? `<image href="${logoSource}" x="57" y="60" width="310" height="118" preserveAspectRatio="xMidYMid meet"/>`
    : "";
  const nameSpans = typography
    ? typography.lines.map((line, index) => `<tspan x="${textX}" dy="${index ? Math.round(typography.fontSize * 1.18) : 0}">${escapeXml(line)}</tspan>`).join("")
    : "";
  const nameY = typography?.lines.length === 1 ? 122 : 105;
  const nameElement = typography
    ? `<text x="${textX}" y="${nameY}" font-family="TapvoraBrand, Arial, sans-serif" font-size="${typography.fontSize}" font-weight="700" letter-spacing="-0.5" fill="#0f1f1b">${nameSpans}</text>`
    : "";
  const poweredX = hasLogo ? 212 : textX;
  const poweredAnchor = hasLogo ? ' text-anchor="middle"' : "";
  const poweredY = hasLogo ? 186 : 181;
  const brandingElements = hasBranding ? `
  <rect x="${BRAND_COVER.left}" y="${BRAND_COVER.top}" width="${BRAND_COVER.width}" height="${BRAND_COVER.height}" fill="${CARD_SURFACE}"/>
  ${logoElement}
  ${nameElement}
  <text x="${poweredX}" y="${poweredY}"${poweredAnchor} font-family="TapvoraGeist, Arial, sans-serif" font-size="11" fill="#50615b">Powered by <tspan font-weight="800">Tapvora</tspan></text>` : "";

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="85mm" height="54mm" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <defs>
    <style>
      @font-face { font-family: TapvoraGeist; src: url("${fontSource}") format("truetype"); }
      @font-face { font-family: TapvoraBrand; src: url("${brandFontSource}") format("truetype"); font-weight: 300 700; }
    </style>
  </defs>
  <rect x="0" y="0" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#ffffff"/>
  <image href="${templateSource}" x="0" y="0" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" preserveAspectRatio="none"/>
  ${brandingElements}
  ${positionedQr}
  <text x="494" y="587" text-anchor="middle" font-family="TapvoraGeist, Arial, sans-serif" font-size="18" font-weight="800" fill="#13211d" stroke="#13211d" stroke-width="0.35">${pin}</text>
</svg>`);
}
