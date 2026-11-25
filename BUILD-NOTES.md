# Build notes — news-image-20261124

## Verified stories (all happened or first reported on 24 Nov 2026)

Main panels:

1. **Arsenal 1–1 Borussia Dortmund** (Champions League, Emirates, 24 Nov evening CET)
   - Gyokeres 10', Beier 55'. Arsenal's 100% UCL record ends; 29 shots, no winner.
   - Sources: Reuters ("Arsenal and Man City held at home...", 24 Nov),
     arsenal.com match report (24 Nov), Sky Sports.
2. **Huawei convicted in US trial** (Brooklyn jury, verdict 24 Nov)
   - Guilty on 10 of 12 counts — bank fraud, wire fraud, sanctions violations,
     conspiracy to steal trade secrets. Acquitted of racketeering and obstruction.
     Sentencing 14 Sep 2027.
   - Sources: CNN, Reuters, WSJ (all 24 Nov).
3. **Four tankers hit by mines in the Strait of Hormuz** (24 Nov)
   - IRGC said three oil tankers hit naval mines and caught fire, then a fourth.
   - Source: dailysummaryof.com world summary for 24 Nov 2026
     (first reported 24 Nov 02:09 UTC), corroborated by a 24 Nov news round-up.
4. **Shenzhou-24 launches with Pakistan's first astronaut** (24 Nov)
   - First foreign astronaut aboard China's Tiangong station.
   - Sources: AP wire (24 Nov 22:55 EST), horizonapp.link 24 Nov summary.
5. **Turkish Air Force helicopter crash kills five** (24 Nov)
   - AS-532 crashed after take-off from Eskisehir for training.
   - Source: dailysummaryof.com (first reported 24 Nov 19:52 UTC).

Ticker (all 24 Nov):

- Cartagena supermarket hostage siege, 25 held (dailysummaryof, first reported
  24 Nov 17:35 UTC).
- Real Madrid 5–1 PSV; Man City 2–2 Napoli (Reuters UCL round-up, 24 Nov).
- Trump awards Rudy Giuliani the Presidential Medal of Freedom
  (Washington Post, 24 Nov).
- Riyadh PIF tower hit in suspected drone attack, 11 wounded
  (dailysummaryof, 24 Nov).
- FLOP Network testnet opens (flop.finance/testnet, verified live 25 Nov
  07:42 WIB; opened 24 Nov 2026).

## Checked and EXCLUDED

- FIFA naming the 2031/2035 Women's World Cup hosts — announced at the
  Extraordinary Congress on **23 Nov** (CNN, Xinhua, AP all dated 23 Nov).
  Not a 24 Nov story.
- Hooja NFT mint moving from UnVault to OpenSea — announced **25 Nov**
  (Bored Ape Gazette, "announced ... this morning", 25 Nov; official
  @hoojafun post checked 25 Nov). Not a 24 Nov story.
- Nvidia reinstating Jensen Huang as CEO — reported **23 Nov**. Excluded.

## What the image shows

A newspaper front page, 1024×1024: masthead "THE WORLD IN ONE DAY" with
"TUESDAY, 24 NOVEMBER 2026" in red. Lead story (football + "ARS 1-1 BVB"
scoreboard) is Arsenal–Dortmund. Four side panels pair a flat vector
pictogram (courthouse, tanker with explosion, rocket, helicopter) with a
headline and one-line sub. A dark ticker band carries six more 24 Nov items,
and the footer repeats the date.

## How it is built

`main.ts` (Node 22, stdlib only) draws everything itself: a framebuffer
rasteriser (rects, lines, circles, polygon fill), a hand-authored 5×7 bitmap
font, and a from-scratch PNG encoder (zlib deflate + CRC32). No network, no
randomness, no external assets. `entry.png` in this repo is a reference render
of the program's output.

## Validation (25 Nov 2026, local)

- Two runs, `MAKEFUN_OUTPUT_DIR=out1` and `out2`: byte-identical output.
  Final sha256: `caccaf1c178765e387aacee81fbe3f4f7a30c929082e5d9547fd4fe23290553a`
- Size: 20,787 bytes (limit 1,048,576). Dimensions: 1024×1024 (limit 1024×1024).
- PNG verified with ffprobe (codec png, 1024×1024).
- Rendered image inspected visually (3 revisions): all text sits inside its
  panels, no overlaps, date and all five main headlines legible.
- Practice/dev score: none available locally — the kit has no local scorer;
  grading is server-side (blind rounds; next round 2026-11-25T12:00:00Z).
