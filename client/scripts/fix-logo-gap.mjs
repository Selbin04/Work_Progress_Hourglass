import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.join(dir, "../public/_logo-src.png");
const markPath = path.join(dir, "../public/sandadd-mark.png");
const logoPath = path.join(dir, "../public/sandadd-logo.png");

const trimmed = await sharp(srcPath)
  .trim({ threshold: 25, background: "#ffffff" })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

let { data, info } = trimmed;
data = Buffer.from(data);
const W = info.width;
const H = info.height;

for (let i = 0; i < data.length; i += 4) {
  if (data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235) data[i + 3] = 0;
}

const at = (x, y) => {
  const i = (y * W + x) * 4;
  return { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
};
const ink = (x, y) => x >= 0 && y >= 0 && x < W && y < H && at(x, y).a > 28;
const isBlue = (x, y) => {
  if (!ink(x, y)) return false;
  const { r, g, b } = at(x, y);
  return b > r + 8 && b > g + 5 && b > 70;
};
const isGrey = (x, y) => {
  if (!ink(x, y) || isBlue(x, y)) return false;
  const { r, g, b } = at(x, y);
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  // grey mountain only (not near-black text which is lower)
  return mx - mn < 45 && mx > 40 && mx < 200;
};

// Split icon vs wordmark by finding the first multi-row blank band
const rowInk = Array.from({ length: H }, (_, y) => {
  for (let x = 0; x < W; x++) if (ink(x, y)) return true;
  return false;
});
let iconBottom = 0;
let seen = false;
let blank = -1;
for (let y = 0; y < H; y++) {
  if (rowInk[y]) {
    if (blank >= 0 && y - blank >= 6) {
      iconBottom = blank - 1;
      break;
    }
    blank = -1;
    seen = true;
    iconBottom = y;
  } else if (seen && blank < 0) {
    blank = y;
  }
}

// Measure blue→grey gap on lower icon body only
const gaps = [];
for (let y = Math.floor(iconBottom * 0.55); y <= iconBottom; y++) {
  let rightBlue = -1;
  let leftGrey = -1;
  for (let x = 0; x < W; x++) if (isBlue(x, y)) rightBlue = x;
  for (let x = 0; x < W; x++) {
    if (isGrey(x, y)) {
      leftGrey = x;
      break;
    }
  }
  if (rightBlue >= 0 && leftGrey > rightBlue + 1) {
    gaps.push(leftGrey - rightBlue - 1);
  }
}
if (!gaps.length) throw new Error("blue/grey gap not found");
gaps.sort((a, b) => a - b);
const baseGaps = gaps.slice(Math.floor(gaps.length * 0.7)); // lower portion samples already
const shift = baseGaps[Math.floor(baseGaps.length / 2)];

console.log({ iconBottom, shift, gapMin: gaps[0], gapMax: gaps[gaps.length - 1] });

// Rebuild full image: slide grey-mountain pixels left by `shift` in the icon band only
const out = Buffer.alloc(W * H * 4, 0);
const put = (dx, y, sx, sy) => {
  if (dx < 0 || dx >= W) return;
  const si = (sy * W + sx) * 4;
  const di = (y * W + dx) * 4;
  if (out[di + 3] >= 180) return;
  out[di] = data[si];
  out[di + 1] = data[si + 1];
  out[di + 2] = data[si + 2];
  out[di + 3] = data[si + 3] > 180 ? 255 : data[si + 3];
};

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (!ink(x, y)) continue;
    // Only slide grey mountain in the icon region
    if (y <= iconBottom && isGrey(x, y)) {
      put(x - shift, y, x, y);
    } else {
      put(x, y, x, y);
    }
  }
}

const fullPng = await sharp(out, { raw: { width: W, height: H, channels: 4 } })
  .trim()
  .png()
  .toBuffer();

await sharp(fullPng).resize({ height: 168, fit: "inside" }).png().toFile(logoPath);

// Mark = icon crop from closed full buffer
const fullMeta = await sharp(fullPng).metadata();
const { data: fdata, info: finfo } = await sharp(fullPng)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const fW = finfo.width;
const fH = finfo.height;
const fInk = (x, y) => fdata[(y * fW + x) * 4 + 3] > 28;
const fRow = Array.from({ length: fH }, (_, y) => {
  for (let x = 0; x < fW; x++) if (fInk(x, y)) return true;
  return false;
});
let fIconBottom = 0;
let fSeen = false;
let fBlank = -1;
for (let y = 0; y < fH; y++) {
  if (fRow[y]) {
    if (fBlank >= 0 && y - fBlank >= 6) {
      fIconBottom = fBlank - 1;
      break;
    }
    fBlank = -1;
    fSeen = true;
    fIconBottom = y;
  } else if (fSeen && fBlank < 0) {
    fBlank = y;
  }
}

await sharp(fullPng)
  .extract({ left: 0, top: 0, width: fW, height: fIconBottom + 1 })
  .trim()
  .resize({ height: 72, fit: "inside" })
  .png()
  .toFile(markPath);

const markMeta = await sharp(markPath).metadata();
const logoMeta = await sharp(logoPath).metadata();
console.log({
  full: [fullMeta.width, fullMeta.height],
  mark: [markMeta.width, markMeta.height],
  logo: [logoMeta.width, logoMeta.height],
});
