import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const logoPath = path.join(root, "logo.png");
const iconsDir = path.join(root, "icons");

if (!fs.existsSync(logoPath)) {
  console.error("logo.png not found");
  process.exit(1);
}

fs.mkdirSync(iconsDir, { recursive: true });

const sizes = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "og-image.png", size: 1200, height: 630 },
];

for (const { name, size, height } of sizes) {
  const out = path.join(iconsDir, name);
  const pipeline = sharp(logoPath).resize(size, height || size, {
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 0 },
  });

  if (name === "og-image.png") {
    await pipeline
      .extend({
        top: 80,
        bottom: 80,
        left: 200,
        right: 200,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toFile(out);
  } else {
    await pipeline.png().toFile(out);
  }
  console.log("Wrote", name);
}

console.log("Done.");
