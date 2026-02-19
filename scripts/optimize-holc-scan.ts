/**
 * Optimizes the 43MB holc-scan.jpg into web-friendly sizes:
 * - holc-scan-2k.jpg (2048px wide, ~400KB) — default view
 * - holc-scan-4k.jpg (4096px wide, ~1.5MB) — zoom detail
 *
 * Usage: npx tsx scripts/optimize-holc-scan.ts
 */
import sharp from "sharp";
import { existsSync, mkdirSync } from "fs";
import { resolve } from "path";

const SOURCE = resolve("holc-scan.jpg");
const OUT_DIR = resolve("public/archive");

async function main() {
  if (!existsSync(SOURCE)) {
    console.error(`Source file not found: ${SOURCE}`);
    process.exit(1);
  }

  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  const meta = await sharp(SOURCE).metadata();
  console.log(
    `Source: ${meta.width}x${meta.height}, ${meta.format}, ${meta.size ? Math.round(meta.size / 1024 / 1024) + "MB" : "unknown size"}`,
  );

  // 2K version — default view
  console.log("Generating 2K version...");
  await sharp(SOURCE)
    .resize(2048)
    .jpeg({ quality: 75, progressive: true, mozjpeg: true })
    .toFile(resolve(OUT_DIR, "holc-scan-2k.jpg"));

  const info2k = await sharp(resolve(OUT_DIR, "holc-scan-2k.jpg")).metadata();
  console.log(
    `  → holc-scan-2k.jpg: ${info2k.width}x${info2k.height}, ${info2k.size ? Math.round(info2k.size / 1024) + "KB" : "unknown"}`,
  );

  // 4K version — zoom detail
  console.log("Generating 4K version...");
  await sharp(SOURCE)
    .resize(4096)
    .jpeg({ quality: 80, progressive: true, mozjpeg: true })
    .toFile(resolve(OUT_DIR, "holc-scan-4k.jpg"));

  const info4k = await sharp(resolve(OUT_DIR, "holc-scan-4k.jpg")).metadata();
  console.log(
    `  → holc-scan-4k.jpg: ${info4k.width}x${info4k.height}, ${info4k.size ? Math.round(info4k.size / 1024) + "KB" : "unknown"}`,
  );

  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
