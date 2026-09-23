import sharp from "sharp";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const MAX_STORED_BYTES = 800 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function optimizeBusinessLogo(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Upload a PNG, JPG, or WebP logo.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("The logo must be 2 MB or smaller.");
  }

  let optimized: Buffer;
  try {
    optimized = await sharp(Buffer.from(await file.arrayBuffer()), { failOn: "error", limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 700, height: 350, fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 })
      .toBuffer();
  } catch {
    throw new Error("The uploaded logo could not be read. Try another PNG, JPG, or WebP file.");
  }

  if (optimized.length > MAX_STORED_BYTES) {
    throw new Error("The optimized logo is still too large. Use a simpler or smaller image.");
  }

  return `data:image/png;base64,${optimized.toString("base64")}`;
}
