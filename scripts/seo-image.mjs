// scripts/seo-image.mjs
// Generate: node scripts/seo-image.mjs --prompt "<12-22 words>" --out public/blog/<slug>/<keyword-name>.webp
// Compress: node scripts/seo-image.mjs --input /tmp/raw.png --out public/blog/<slug>/<keyword-name>.webp
// Options:  --quality 82 (lower it if the file is over budget), --model <openrouter-image-model>
import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import sharp from "sharp";

const { values: a } = parseArgs({
  options: {
    prompt: { type: "string" },
    input: { type: "string" },
    out: { type: "string" },
    quality: { type: "string", default: "82" },
    model: { type: "string", default: "google/gemini-2.5-flash-image" },
  },
});
if (!a.out || (!a.prompt && !a.input) || !a.out.endsWith(".webp")) {
  console.error("Usage: --prompt <text> | --input <file>, plus --out <path.webp>");
  process.exit(1);
}

let raw;
if (a.input) {
  raw = await fs.readFile(a.input);
} else {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY is not set");
    process.exit(1);
  }
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: a.model,
      messages: [{ role: "user", content: a.prompt }],
      modalities: ["image", "text"],
      image_config: { aspect_ratio: "16:9" },
    }),
  });
  const data = await res.json();
  const url = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!res.ok || !url) {
    console.error(`Generation failed (${res.status}): ${JSON.stringify(data).slice(0, 300)}`);
    process.exit(1);
  }
  raw = Buffer.from(url.replace(/^data:image\/\w+;base64,/, ""), "base64");
}

await fs.mkdir(path.dirname(a.out), { recursive: true });
const q = Number(a.quality);
const img = sharp(raw).resize({ width: 1536, withoutEnlargement: true });
const buf = await img.webp({ quality: q }).toBuffer();
await fs.writeFile(a.out, buf);
const { width, height } = await sharp(buf).metadata();
console.log(`${a.out} ${width}x${height} ${Math.round(buf.length / 1024)} KB`);
