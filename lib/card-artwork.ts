import { readFile } from "node:fs/promises";
import path from "node:path";
import * as opentype from "opentype.js";
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
let bodyFontPromise: Promise<opentype.Font> | undefined;
let headingFontPromise: Promise<opentype.Font> | undefined;

function loadFont(fontFile: string) {
  return readFile(fontFile).then((font) => opentype.parse(Uint8Array.from(font).buffer));
}

function bodyFont() {
  bodyFontPromise ??= loadFont(BODY_FONT_FILE);
  return bodyFontPromise;
}

function headingFont() {
  headingFontPromise ??= loadFont(HEADING_FONT_FILE);
  return headingFontPromise;
}

type TextPathOptions = {
  anchor?: "start" | "middle" | "end";
  letterSpacing?: number;
  strokeWidth?: number;
};

function textWidth(font: opentype.Font, text: string, fontSize: number, letterSpacing: number) {
  const glyphs = font.stringToGlyphs(text);
  const scale = fontSize / font.unitsPerEm;
  let width = 0;

  for (let index = 0; index < glyphs.length; index += 1) {
    const glyph = glyphs[index];
    if (index > 0) width += font.getKerningValue(glyphs[index - 1], glyph) * scale;
    width += (glyph.advanceWidth ?? font.unitsPerEm) * scale;
    if (index < glyphs.length - 1) width += letterSpacing;
  }

  return width;
}

function textPath(
  font: opentype.Font,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  fill: string,
  options: TextPathOptions = {},
) {
  const glyphs = font.stringToGlyphs(text);
  const letterSpacing = options.letterSpacing ?? 0;
  const scale = fontSize / font.unitsPerEm;
  const width = textWidth(font, text, fontSize, letterSpacing);
  let cursor = options.anchor === "middle" ? x - width / 2 : options.anchor === "end" ? x - width : x;
  const paths: string[] = [];

  for (let index = 0; index < glyphs.length; index += 1) {
    const glyph = glyphs[index];
    if (index > 0) cursor += font.getKerningValue(glyphs[index - 1], glyph) * scale;
    paths.push(`<path d="${glyph.getPath(cursor, y, fontSize).toPathData(2)}"/>`);
    cursor += (glyph.advanceWidth ?? font.unitsPerEm) * scale;
    if (index < glyphs.length - 1) cursor += letterSpacing;
  }

  const stroke = options.strokeWidth
    ? ` stroke="${fill}" stroke-width="${options.strokeWidth}" stroke-linejoin="round"`
    : "";
  return `<g fill="${fill}"${stroke}>${paths.join("")}</g>`;
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
};

export async function renderCardSvg(card: TapvoraCard, template: Buffer, options: CardSvgOptions = {}) {
  const pin = activationPin(card);
  const permanentUrl = `${SITE_URL}/r/${card.code}`;
  const qrSize = Math.round(CARD_WIDTH * (258 / 1574));
  const qrLeft = Math.round(CARD_WIDTH * (686 / 1574));
  const qrTop = Math.round(CARD_HEIGHT * (346 / 1000));
  const qrSvg = await QRCode.toString(permanentUrl, { type: "svg", errorCorrectionLevel: "H", margin: 2, width: qrSize, color: { dark: "#000000", light: "#ffffff" } });
  const positionedQr = qrSvg.replace("<svg", `<svg x="${qrLeft}" y="${qrTop}"`);
  const [body, heading] = await Promise.all([bodyFont(), headingFont()]);
  const templateSource = options.templateHref || `data:image/png;base64,${template.toString("base64")}`;

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="85mm" height="54mm" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#ffffff"/>
  <image href="${templateSource}" x="0" y="0" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" preserveAspectRatio="none"/>
  <rect x="${LEFT_COLUMN_COVER.left}" y="${LEFT_COLUMN_COVER.top}" width="${LEFT_COLUMN_COVER.width}" height="${LEFT_COLUMN_COVER.height}" fill="${CARD_SURFACE}"/>
  <rect x="${LEGACY_TEXT_COVER.left}" y="${LEGACY_TEXT_COVER.top}" width="${LEGACY_TEXT_COVER.width}" height="${LEGACY_TEXT_COVER.height}" fill="${CARD_SURFACE}"/>
  ${textPath(body, "YOUR FEEDBACK MATTERS", 68, 101, 15, "#52625b", { letterSpacing: 2.2, strokeWidth: 0.45 })}
  ${textPath(heading, "Enjoyed your", 68, 164, 47, "#090b0a", { letterSpacing: -1.5, strokeWidth: 2.2 })}
  ${textPath(heading, "experience?", 68, 219, 47, "#176ce6", { letterSpacing: -1.5, strokeWidth: 2.2 })}
  ${textPath(body, "Your feedback", 70, 290, 27, "#536174")}
  ${textPath(body, "helps us grow!", 70, 325, 27, "#536174")}
  <path d="M68 364.5H348" fill="none" stroke="#176ce6" stroke-width="5" stroke-linecap="round"/>
  ${textPath(body, "LEAVE US A", 68, 410, 15, "#536174", { letterSpacing: 1.5, strokeWidth: 0.45 })}
  ${textPath(heading, "Google Review", 68, 454, 34, "#090b0a", { strokeWidth: 1.8 })}
  ${textPath(body, "Tap or scan to get started", 68, 493, 17, "#536174")}
  ${textPath(body, "“Your feedback helps us improve.”", 68, 526, 15, "#687771", { strokeWidth: 0.2 })}
  ${textPath(body, "“Every review makes a difference.”", 68, 550, 15, "#687771", { strokeWidth: 0.2 })}
  ${positionedQr}
  ${textPath(body, pin, 494, 587, 18, "#13211d", { anchor: "middle", strokeWidth: 0.7 })}
  ${textPath(body, "www.tapvora.in", 948, 588, 14, "#33423d", { anchor: "end", strokeWidth: 0.45 })}
</svg>`);
}
