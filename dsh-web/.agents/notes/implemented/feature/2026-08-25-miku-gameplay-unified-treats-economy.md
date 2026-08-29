# Agent Note: Miku gameplay on the unified treats economy (wallet removed)

Status: implemented

## Problem

The miku gameplay ran two unrelated currencies. The panel's 小鱼干 (treat) stock feeds the petting/feeding economy (granted by completed turns and wall-clock time, capped at 20, consumed by feeding), while the gameplay block had its own coin system: `work` success +3 coins / fail -1, `passiveIncome` 1 coin/min, a shop priced in coins with a coins-to-gamecoins exchange item, and a lottery whose prize tiers ran to 1,000,000 coins. The only place coins ever surfaced was the wallet page — the shop was gated on grinding coins, feeding treats were unrelated to purchases, and the wallet itself was an extra page no other screen referenced.

## Decision

The gameplay economy now runs on one currency — the shared 小鱼干 ledger — and the wallet is removed.

- Client: the `wallet` page, its 钱包 action, the `.gameplayWallet` CSS and the `pet.gameplay.wallet` / `currency.coins` / `currency.gamecoins` locale keys are deleted; `PetGameplayStateView` drops `currencies` (treats ride the panel stock, not the view); the shop is the only money surface and shows prices in 小鱼干/Treats.
- Host bridge: the engine keeps its generic currency record as the lazy-settle work area; `service.ts` drains the `treats` key into the shared ledger after every gameplay verb (`grantTreats` capped at the stock cap, `spendTreats` refusing unaffordable buys). Shop items with `currency: "treats"` check and pay from `ledger.snapshot.treats.treats`; lottery prizes in treats grant into the same cap. Legacy coins/gamecoins in old persisted data are no longer displayed or used (the engine path stays generic, nothing consumes it).
- Manifest (miku): `work` success +1 treat, fail no deduction; `passiveIncome` 1 treat / 30 min; shop: bread 2 treats, red-bean bun 4 treats, the gamecoin exchange item removed, the lottery 3 treats a draw with treat prizes 5/10/20/50/100 for the original probabilities. Market dist regenerated from `assets/miku`; the installed `$DSH_HOME/pets/miku` copy is synced (the registry loads once at plugin start, so the host takes it on the next service restart).
- Docs: the README pair's gameplay paragraphs describe the unified currency and the wallet-free menu card.

## Alternatives considered

- **Keep the coin engine invisible (wallet gone, coins still accumulate)**: coins would become a silent bookkeeping trail with no sink and no view; work rewards would be meaningless while the shop costs treats — rejected.
- **Drop work rewards, passive income and the lottery along with coins**: lighter, but the mini-game loses its earn loop and the lottery's entertainment value; keeping treats as the single currency preserves both with one balance.
- **Price the shop in treats but keep coin rewards**: two competing economies again, with the shop starved by the treat cap and coins unused — rejected.

## Consequences

One balance (cap 20) now feeds feeding, purchases and rewards: 打工 is the main earner, the lottery is bounded by the stock cap (a prize larger than the cap truncates to it), and the store is immediately usable from the panel's existing stock. The gameplay state view shrank (no currencies); persisted gameplay states keep any legacy coin data untouched (harmless, invisible). Client behavior ships on bundle refresh; host manifest and data changes need one service restart (registry loads once). The Workshop market dist is regenerated; the installed miku copy is synced for that restart.

## Testing

Ledger unit tests cover grant/spend with the cap and the unaffordable refusal; the route spec (real HTTP routes, fresh service) was rewritten for the treats flow: insufficient funds on an empty stock, work ticks earn to the 20 cap, buying bread spends 2 and raises hunger by 40, the lottery costs 3 and prizes 5 (capped back at 20), and persistence shows empty gameplay currencies with treats in the shared ledger. Client tests cover the wallet-free card (no 钱包 anywhere, shop navigation) and the 小鱼干不足 / 中奖 +5 小鱼干 floats. Package tests: 434 passed. Live GUI after bundle refresh: the wallet is gone and no page errors; the shop still served the pre-restart manifest (old prices, missing locale keys degrade to the key text) — host restart required for the manifest and buy routing.
