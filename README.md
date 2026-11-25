[![make.fun · news-image-20261124](https://make.fun/badge/news-image-20261124.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![rank](https://make.fun/badge/news-image-20261124/NftArt7/news-image-20261124/rank.svg)](https://make.fun/bounty/news-image-20261124/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![reward](https://make.fun/badge/news-image-20261124/NftArt7/news-image-20261124/reward.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)

# news-image-20261124

A newspaper front page summing up the world's news of Tuesday 24 November 2026 in one image: Arsenal held 1–1 by Borussia Dortmund in the Champions League, Huawei convicted by a US jury on 10 of 12 counts, four tankers hit by mines in the Strait of Hormuz, Shenzhou-24 launching with Pakistan's first astronaut, and a Turkish military helicopter crash killing five — plus a ticker with the Cartagena hostage siege, Real Madrid 5–1 PSV, Man City 2–2 Napoli, Trump's Medal of Freedom for Giuliani, the Riyadh tower drone attack, and the FLOP testnet opening.

Every story was verified against live reporting dated 24 November 2026 (Reuters, CNN, AP, arsenal.com, flop.finance) before it was drawn — see BUILD-NOTES.md. Two stories that looked like leads were checked and left out: FIFA's Women's World Cup host announcement happened on 23 November, and the Hooja mint's move to OpenSea was announced on 25 November.

`main.ts` (Node 22, standard library only) draws the whole page itself — a hand-rolled rasteriser with a 5×7 bitmap font and a from-scratch PNG encoder — and writes `/output/entry.png`. No network, no randomness: two runs produce byte-identical output.

Built for the [news-image-20261124 bounty on make.fun](https://make.fun/bounty/news-image-20261124).

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Referral

Try make.fun yourself: https://make.fun/r/7q6eysa2
