// news-image-20261124 — "The World in One Day"
// A newspaper front page summing up Tuesday 24 November 2026.
// Draws the whole image with a hand-rolled rasteriser (no libraries,
// no network) and writes it to $MAKEFUN_OUTPUT_DIR/entry.png.
// Deterministic: the same bytes on every run.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";

// ---------------------------------------------------------------------------
// Canvas
// ---------------------------------------------------------------------------

const W = 1024;
const H = 1024;
const buf = new Uint8Array(W * H * 3);

type RGB = [number, number, number];

const PAPER: RGB = [246, 241, 229];
const INK: RGB = [20, 20, 20];
const WHITE: RGB = [255, 255, 255];
const RED: RGB = [179, 38, 30];
const NAVY: RGB = [31, 58, 95];
const TEAL: RGB = [15, 118, 110];
const OCHRE: RGB = [180, 83, 9];
const SLATE: RGB = [51, 65, 85];
const GREY: RGB = [100, 100, 96];
const LIGHTGREY: RGB = [214, 210, 198];
const GOLD: RGB = [212, 160, 23];
const ORANGE: RGB = [234, 88, 12];
const SKY: RGB = [186, 220, 235];
const GREEN: RGB = [34, 120, 60];
const DARKBAND: RGB = [24, 24, 24];

function setPixel(x: number, y: number, c: RGB): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  buf[i] = c[0];
  buf[i + 1] = c[1];
  buf[i + 2] = c[2];
}

function fillRect(x: number, y: number, w: number, h: number, c: RGB): void {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(W, Math.ceil(x + w));
  const y1 = Math.min(H, Math.ceil(y + h));
  for (let yy = y0; yy < y1; yy++) {
    for (let xx = x0; xx < x1; xx++) {
      const i = (yy * W + xx) * 3;
      buf[i] = c[0];
      buf[i + 1] = c[1];
      buf[i + 2] = c[2];
    }
  }
}

function hline(x0: number, x1: number, y: number, c: RGB): void {
  if (y < 0 || y >= H) return;
  const a = Math.max(0, Math.min(x0, x1));
  const b = Math.min(W - 1, Math.max(x0, x1));
  for (let x = a; x <= b; x++) setPixel(x, y, c);
}

function drawLine(x0: number, y0: number, x1: number, y1: number, w: number, c: RGB): void {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;
  const r = Math.max(0, Math.floor(w / 2));
  for (;;) {
    fillRect(x - r, y - r, w, w, c);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

function fillCircle(cx: number, cy: number, r: number, c: RGB): void {
  for (let dy = -r; dy <= r; dy++) {
    const dx = Math.floor(Math.sqrt(r * r - dy * dy));
    hline(cx - dx, cx + dx, cy + dy, c);
  }
}

function ringCircle(cx: number, cy: number, r: number, t: number, c: RGB): void {
  for (let dy = -r; dy <= r; dy++) {
    const outer = Math.floor(Math.sqrt(r * r - dy * dy));
    const innerR = Math.max(0, r - t);
    const inner = Math.floor(Math.sqrt(innerR * innerR - dy * dy));
    if (dy * dy > innerR * innerR) {
      hline(cx - outer, cx + outer, cy + dy, c);
    } else {
      hline(cx - outer, cx - inner, cy + dy, c);
      hline(cx + inner, cx + outer, cy + dy, c);
    }
  }
}

// Scanline polygon fill. Points are [x, y] pairs.
function fillPoly(pts: Array<[number, number]>, c: RGB): void {
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [, y] of pts) {
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  for (let y = Math.ceil(minY); y <= Math.floor(maxY); y++) {
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[(i + 1) % pts.length];
      if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) {
        xs.push(x0 + ((y - y0) * (x1 - x0)) / (y1 - y0));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      hline(Math.ceil(xs[k]), Math.floor(xs[k + 1]), y, c);
    }
  }
}

function star(cx: number, cy: number, rOuter: number, rInner: number, points: number, c: RGB): void {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    pts.push([Math.round(cx + r * Math.cos(a)), Math.round(cy + r * Math.sin(a))]);
  }
  fillPoly(pts, c);
}

// ---------------------------------------------------------------------------
// 5x7 bitmap font. Each glyph is 7 rows; each row is a 5-bit number,
// bit 4 = leftmost pixel. Authored by hand for this entry.
// ---------------------------------------------------------------------------

const FONT: Record<string, number[]> = {
  A: [14, 17, 17, 31, 17, 17, 17],
  B: [30, 17, 17, 30, 17, 17, 30],
  C: [14, 17, 16, 16, 16, 17, 14],
  D: [30, 17, 17, 17, 17, 17, 30],
  E: [31, 16, 16, 30, 16, 16, 31],
  F: [31, 16, 16, 30, 16, 16, 16],
  G: [14, 17, 16, 23, 17, 17, 15],
  H: [17, 17, 17, 31, 17, 17, 17],
  I: [14, 4, 4, 4, 4, 4, 14],
  J: [7, 2, 2, 2, 2, 18, 12],
  K: [17, 18, 20, 24, 20, 18, 17],
  L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17],
  N: [17, 25, 21, 19, 17, 17, 17],
  O: [14, 17, 17, 17, 17, 17, 14],
  P: [30, 17, 17, 30, 16, 16, 16],
  Q: [14, 17, 17, 17, 21, 18, 13],
  R: [30, 17, 17, 30, 20, 18, 17],
  S: [15, 16, 16, 14, 1, 1, 30],
  T: [31, 4, 4, 4, 4, 4, 4],
  U: [17, 17, 17, 17, 17, 17, 14],
  V: [17, 17, 17, 17, 17, 10, 4],
  W: [17, 17, 17, 21, 21, 21, 10],
  X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4],
  Z: [31, 1, 2, 4, 8, 16, 31],
  "0": [14, 17, 19, 21, 25, 17, 14],
  "1": [4, 12, 4, 4, 4, 4, 14],
  "2": [14, 17, 1, 6, 8, 16, 31],
  "3": [31, 2, 4, 2, 1, 17, 14],
  "4": [2, 6, 10, 18, 31, 2, 2],
  "5": [31, 16, 30, 1, 1, 17, 14],
  "6": [6, 8, 16, 30, 17, 17, 14],
  "7": [31, 1, 2, 4, 8, 8, 8],
  "8": [14, 17, 17, 14, 17, 17, 14],
  "9": [14, 17, 17, 15, 1, 2, 12],
  " ": [0, 0, 0, 0, 0, 0, 0],
  ".": [0, 0, 0, 0, 0, 12, 12],
  ",": [0, 0, 0, 0, 12, 4, 8],
  ":": [0, 12, 12, 0, 12, 12, 0],
  ";": [0, 12, 12, 0, 12, 4, 8],
  "!": [4, 4, 4, 4, 4, 0, 4],
  "?": [14, 17, 1, 6, 4, 0, 4],
  "'": [4, 4, 8, 0, 0, 0, 0],
  '"': [10, 10, 0, 0, 0, 0, 0],
  "-": [0, 0, 0, 14, 0, 0, 0],
  "(": [2, 4, 8, 8, 8, 4, 2],
  ")": [8, 4, 2, 2, 2, 4, 8],
  "/": [1, 2, 2, 4, 8, 8, 16],
  "%": [25, 26, 2, 4, 8, 11, 19],
  "&": [12, 18, 20, 8, 21, 18, 13],
  "+": [0, 4, 4, 14, 4, 4, 0],
  "=": [0, 0, 31, 0, 31, 0, 0],
  "\u00d7": [0, 17, 10, 4, 10, 17, 0],
  $: [4, 15, 20, 14, 5, 30, 4],
  "#": [10, 10, 31, 10, 31, 10, 10],
  "@": [14, 17, 23, 21, 22, 16, 14],
  "\u2022": [0, 0, 12, 12, 0, 0, 0],
  "\u2014": [0, 0, 0, 31, 0, 0, 0],
  "*": [4, 21, 14, 21, 4, 0, 0],
  "\u2192": [0, 4, 2, 31, 2, 4, 0],
  "\u2605": [4, 4, 14, 31, 14, 21, 17],
  "\u2665": [10, 31, 31, 14, 4, 0, 0],
  _: [0, 0, 0, 0, 0, 0, 31],
  "[": [14, 8, 8, 8, 8, 8, 14],
  "]": [14, 2, 2, 2, 2, 2, 14],
};

function drawChar(x: number, y: number, ch: string, scale: number, c: RGB): void {
  const g = FONT[ch];
  if (!g) return;
  for (let r = 0; r < 7; r++) {
    const row = g[r];
    for (let col = 0; col < 5; col++) {
      if (row & (1 << (4 - col))) {
        fillRect(x + col * scale, y + r * scale, scale, scale, c);
      }
    }
  }
}

function textWidth(s: string, scale: number): number {
  return s.length * 6 * scale - scale;
}

function drawText(x: number, y: number, s: string, scale: number, c: RGB): void {
  for (let i = 0; i < s.length; i++) {
    drawChar(x + i * 6 * scale, y, s[i], scale, c);
  }
}

function drawTextCentered(cx: number, y: number, s: string, scale: number, c: RGB): void {
  drawText(cx - Math.floor(textWidth(s, scale) / 2), y, s, scale, c);
}

// Greedy word wrap. Returns lines that fit maxW pixels at the given scale.
function wrapText(s: string, scale: number, maxW: number): string[] {
  const words = s.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const trial = cur ? cur + " " + w : w;
    if (textWidth(trial, scale) <= maxW) {
      cur = trial;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ---------------------------------------------------------------------------
// PNG encoder (stdlib only: zlib deflate + hand-rolled CRC32)
// ---------------------------------------------------------------------------

const CRC_TABLE: number[] = (() => {
  const t: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t.push(c >>> 0);
  }
  return t;
})();

function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  const crc = crc32(out.subarray(4, 8 + data.length));
  dv.setUint32(8 + data.length, crc);
  return out;
}

function encodePNG(): Uint8Array {
  const raw = new Uint8Array(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    raw.set(buf.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, W);
  dv.setUint32(4, H);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const parts = [sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", new Uint8Array(0))];
  const total = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Pictograms (flat vector drawings)
// ---------------------------------------------------------------------------

function drawFootball(cx: number, cy: number, r: number): void {
  fillCircle(cx, cy, r, INK);
  fillCircle(cx, cy, r - 4, WHITE);
  // centre pentagon
  const pr = Math.round(r * 0.32);
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    pts.push([Math.round(cx + pr * Math.cos(a)), Math.round(cy + pr * Math.sin(a))]);
  }
  fillPoly(pts, INK);
  // spokes to the rim
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const x1 = Math.round(cx + pr * Math.cos(a));
    const y1 = Math.round(cy + pr * Math.sin(a));
    const x2 = Math.round(cx + (r - 5) * Math.cos(a));
    const y2 = Math.round(cy + (r - 5) * Math.sin(a));
    drawLine(x1, y1, x2, y2, 3, INK);
  }
}

function drawCourthouse(cx: number, cy: number, s: number): void {
  // s = half-width of the building
  fillPoly(
    [
      [cx - s, cy - 18],
      [cx + s, cy - 18],
      [cx, cy - 52],
    ],
    NAVY,
  );
  fillRect(cx - s, cy - 18, s * 2, 10, NAVY);
  for (let i = -1; i <= 1; i++) {
    fillRect(cx + i * Math.round(s * 0.55) - 7, cy - 8, 14, 58, NAVY);
  }
  fillRect(cx - s, cy + 50, s * 2, 8, NAVY);
  fillRect(cx - s - 8, cy + 58, s * 2 + 16, 8, NAVY);
  fillRect(cx - 14, cy + 12, 28, 38, WHITE);
  fillRect(cx - 14, cy + 12, 28, 6, RED);
}

function drawTanker(cx: number, cy: number, s: number): void {
  // hull
  fillPoly(
    [
      [cx - s, cy],
      [cx + s, cy],
      [cx + s - 18, cy + 34],
      [cx - s + 18, cy + 34],
    ],
    SLATE,
  );
  fillRect(cx - s, cy - 4, s * 2, 6, RED);
  // containers, sized to the hull
  const cw = Math.floor((2 * s - 40) / 3);
  fillRect(cx - s + 8, cy - 30, cw, 26, OCHRE);
  fillRect(cx - s + 12 + cw, cy - 30, cw, 26, TEAL);
  fillRect(cx - s + 16 + 2 * cw, cy - 30, cw, 26, GOLD);
  // bridge
  fillRect(cx + s - 28, cy - 48, 24, 44, WHITE);
  fillRect(cx + s - 28, cy - 48, 24, 8, NAVY);
  fillRect(cx + s - 24, cy - 36, 16, 6, SKY);
  // explosion starburst above the deck
  star(cx - 20, cy - 62, 30, 12, 8, GOLD);
  star(cx - 20, cy - 62, 18, 8, 8, ORANGE);
  fillCircle(cx - 20, cy - 62, 7, WHITE);
  // smoke
  fillCircle(cx + 34, cy - 66, 12, GREY);
  fillCircle(cx + 52, cy - 76, 9, LIGHTGREY);
  // waves
  for (let k = 0; k < 3; k++) {
    const wy = cy + 44 + k * 9;
    for (let x = cx - s - 8; x < cx + s + 8; x += 2) {
      const yy = wy + Math.round(3 * Math.sin((x - cx) / 14 + k));
      setPixel(x, yy, TEAL);
      setPixel(x, yy + 1, TEAL);
    }
  }
}

function drawRocket(cx: number, cy: number, s: number): void {
  // flame
  fillPoly(
    [
      [cx - 12, cy + s],
      [cx + 12, cy + s],
      [cx, cy + s + 52],
    ],
    ORANGE,
  );
  fillPoly(
    [
      [cx - 6, cy + s],
      [cx + 6, cy + s],
      [cx, cy + s + 32],
    ],
    GOLD,
  );
  // fins
  fillPoly(
    [
      [cx - 22, cy + s - 6],
      [cx - 22, cy + s - 42],
      [cx - 46, cy + s + 2],
    ],
    RED,
  );
  fillPoly(
    [
      [cx + 22, cy + s - 6],
      [cx + 22, cy + s - 42],
      [cx + 46, cy + s + 2],
    ],
    RED,
  );
  // body
  fillRect(cx - 22, cy - s + 26, 44, s * 2 - 26, WHITE);
  fillPoly(
    [
      [cx - 22, cy - s + 26],
      [cx + 22, cy - s + 26],
      [cx, cy - s - 22],
    ],
    RED,
  );
  ringCircle(cx, cy - 6, 13, 3, NAVY);
  fillCircle(cx, cy - 6, 10, SKY);
  fillRect(cx - 22, cy + s - 26, 44, 8, NAVY);
}

function drawHelicopter(cx: number, cy: number, s: number): void {
  // main rotor
  drawLine(cx - s - 26, cy - 52, cx + s + 26, cy - 52, 5, INK);
  fillRect(cx - 3, cy - 52, 6, 16, INK);
  // tail boom
  fillRect(cx + 18, cy - 18, s + 26, 12, SLATE);
  fillPoly(
    [
      [cx + s + 44, cy - 18],
      [cx + s + 44, cy - 6],
      [cx + s + 62, cy - 30],
      [cx + s + 62, cy - 44],
    ],
    SLATE,
  );
  fillCircle(cx + s + 56, cy - 24, 9, INK);
  fillCircle(cx + s + 56, cy - 24, 4, WHITE);
  // body
  fillCircle(cx - 20, cy, 34, NAVY);
  fillRect(cx - 20, cy - 34, 44, 68, NAVY);
  fillCircle(cx + 24, cy, 34, NAVY);
  // cockpit window
  fillPoly(
    [
      [cx - 48, cy - 12],
      [cx - 30, cy - 12],
      [cx - 30, cy + 8],
      [cx - 48, cy + 8],
    ],
    SKY,
  );
  fillRect(cx - 22, cy - 12, 12, 20, SKY);
  fillRect(cx + 4, cy - 12, 12, 20, SKY);
  // skids
  drawLine(cx - 52, cy + 52, cx + 44, cy + 52, 4, INK);
  drawLine(cx - 34, cy + 34, cx - 34, cy + 52, 4, INK);
  drawLine(cx + 26, cy + 34, cx + 26, cy + 52, 4, INK);
  // red cross marking
  fillRect(cx + 34, cy - 6, 16, 5, RED);
  fillRect(cx + 40, cy - 12, 5, 16, RED);
}

// ---------------------------------------------------------------------------
// Layout — the front page
// ---------------------------------------------------------------------------

const MARGIN = 28;
const PAGE_W = W - MARGIN * 2;

function kicker(x: number, y: number, text: string, c: RGB): void {
  fillRect(x, y - 2, 10, 10, c);
  drawText(x + 16, y - 2, text, 2, c);
}

function panel(x: number, y: number, w: number, h: number): void {
  fillRect(x, y, w, h, WHITE);
  // border
  fillRect(x, y, w, 3, INK);
  fillRect(x, y + h - 3, w, 3, INK);
  fillRect(x, y, 3, h, INK);
  fillRect(x + w - 3, y, 3, h, INK);
}

function drawPage(): void {
  fillRect(0, 0, W, H, PAPER);

  // ---- masthead ----
  drawTextCentered(W / 2, 34, "THE WORLD IN ONE DAY", 6, INK);
  fillRect(MARGIN, 96, PAGE_W, 4, RED);
  drawTextCentered(W / 2, 110, "TUESDAY, 24 NOVEMBER 2026", 4, RED);
  fillRect(MARGIN, 152, PAGE_W, 3, INK);

  // ---- lead story: Arsenal 1-1 Dortmund ----
  const leadY = 168;
  const leadH = 244;
  panel(MARGIN, leadY, PAGE_W, leadH);
  kicker(MARGIN + 18, leadY + 22, "SPORT — CHAMPIONS LEAGUE, LONDON", RED);
  // football pictogram, left
  drawFootball(MARGIN + 118, leadY + 148, 62);
  // scoreboard under the ball
  fillRect(MARGIN + 44, leadY + 216, 148, 26, DARKBAND);
  drawTextCentered(MARGIN + 118, leadY + 222, "ARS 1-1 BVB", 2, WHITE);
  // headline + sub, right
  const tx = MARGIN + 236;
  const tw = PAGE_W - 236 - 18;
  const head = wrapText("ARSENAL HELD 1-1 BY DORTMUND", 3, tw);
  let hy = leadY + 62;
  for (const line of head) {
    drawText(tx, hy, line, 3, INK);
    hy += 26;
  }
  const sub = wrapText(
    "GYOKERES 10' - BEIER 55' - GUNNERS' PERFECT UCL RECORD ENDS AT THE EMIRATES",
    2,
    tw,
  );
  hy += 10;
  for (const line of sub) {
    drawText(tx, hy, line, 2, SLATE);
    hy += 18;
  }
  drawText(tx, leadY + 208, "29 SHOTS, NO WINNER - DORTMUND UNBEATEN IN 9", 2, GREY);

  // ---- rows 2-3: pictogram on the left, text on the right ----
  const row2Y = 426;
  const rowH = 222;
  const colW = Math.floor((PAGE_W - 16) / 2);
  const col2X = MARGIN + colW + 16;

  function sidePanel(
    x: number,
    y: number,
    kick: string,
    kc: RGB,
    drawPic: () => void,
    head: string,
    sub: string,
  ): void {
    panel(x, y, colW, rowH);
    kicker(x + 16, y + 20, kick, kc);
    drawPic();
    const tx2 = x + 158;
    const tw2 = colW - 158 - 16;
    const hl = wrapText(head, 3, tw2);
    let yy = y + 54;
    for (const line of hl) {
      drawText(tx2, yy, line, 3, INK);
      yy += 24;
    }
    const sl = wrapText(sub, 2, tw2);
    yy += 8;
    for (const line of sl) {
      drawText(tx2, yy, line, 2, SLATE);
      yy += 16;
    }
  }

  sidePanel(
    MARGIN,
    row2Y,
    "TECH — US COURT, NEW YORK",
    NAVY,
    () => drawCourthouse(MARGIN + 79, row2Y + 128, 52),
    "HUAWEI GUILTY IN US TRIAL",
    "GUILTY ON 10 OF 12 COUNTS - FRAUD AND TRADE-SECRET THEFT. ACQUITTED OF RACKETEERING.",
  );

  sidePanel(
    col2X,
    row2Y,
    "MIDDLE EAST — ENERGY",
    OCHRE,
    () => drawTanker(col2X + 79, row2Y + 124, 58),
    "FOUR TANKERS HIT BY MINES IN HORMUZ",
    "IRGC SAYS SHIPS STRUCK IN THE STRAIT - OIL ROUTE ON EDGE.",
  );

  const row3Y = 662;

  sidePanel(
    MARGIN,
    row3Y,
    "SPACE — CHINA",
    TEAL,
    () => drawRocket(MARGIN + 79, row3Y + 118, 30),
    "SHENZHOU-24 LIFTS OFF WITH PAKISTAN'S FIRST ASTRONAUT",
    "FIRST FOREIGN CREW MEMBER ABOARD CHINA'S TIANGONG STATION.",
  );

  sidePanel(
    col2X,
    row3Y,
    "TURKIYE — TRAGEDY",
    SLATE,
    () => drawHelicopter(col2X + 60, row3Y + 122, 24),
    "MILITARY HELICOPTER CRASH KILLS FIVE",
    "AIR FORCE AS-532 DOWN AFTER TAKE-OFF FROM ESKISEHIR.",
  );

  // ---- ticker ----
  const tickY = 898;
  fillRect(MARGIN, tickY, PAGE_W, 64, DARKBAND);
  drawText(MARGIN + 14, tickY + 12, "LATEST:", 2, GOLD);
  const tick =
    "CARTAGENA: 25 HELD HOSTAGE IN SUPERMARKET SIEGE \u2022 REAL MADRID 5-1 PSV \u2022 MAN CITY 2-2 NAPOLI \u2022 TRUMP AWARDS GIULIANI MEDAL OF FREEDOM \u2022 RIYADH TOWER HIT, 11 HURT \u2022 FLOP TESTNET OPENS";
  const tickLines = wrapText(tick, 2, PAGE_W - 28 - 116);
  let ty = tickY + 12;
  for (const line of tickLines.slice(0, 3)) {
    drawText(MARGIN + 130, ty, line, 2, WHITE);
    ty += 18;
  }

  // ---- footer ----
  drawTextCentered(W / 2, 976, "24 NOVEMBER 2026 — THE WORLD IN ONE DAY", 2, GREY);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
  mkdirSync(outDir, { recursive: true });
  drawPage();
  const png = encodePNG();
  writeFileSync(join(outDir, "entry.png"), png);
}

main();
