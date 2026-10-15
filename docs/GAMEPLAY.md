# Gameplay

## Build a team

Buy from five shop offers. Your trainer level limits deployed Pokémon; the bench holds nine. Three matching copies at the same star level combine into the next star level, up to three stars. Two- and three-star units represent three and nine copies. Only distinct deployed species count toward synergies.

Type identities include Fire's area pressure and healing suppression, Grass's sustain and spell/control resistance, Water's shields and burn resistance, and Electric's faster casting and shield pressure. Protect carries with tanks, keep healers within two hexes of a wounded frontline, and spread or change lanes to counter area attacks and beams. Read a Pokémon's inspection card for its actual ability, role and mana rules.

## Economy

Round income is 5 base gold, bank interest, streak income and 1 gold for a trainer-battle victory. Winning wild rounds also give a 2-gold clear bonus. Passive XP is 2 per fought round. Refresh costs 2 gold; 4 XP costs 4 gold.

| Saved gold | Interest per round |
| --- | --- |
| 0–9 | 0 |
| 10–19 | +1 |
| 20–29 | +2 |
| 30–39 | +3 |
| 40–49 | +4 |
| 50+ | +5 |

Interest uses the bank before round income is credited. Meowth's five coins show these thresholds; hovering or focusing the treasury explains the next one. Purchases, refreshes, XP and sales update the markers immediately. This follows TFT's standard ten-gold thresholds and five-gold cap described in [Riot's economy guide](https://www.leagueoflegends.com/pl-pl/news/game-updates/nietypowe-zrodla-zlota-przychod-w-tft-jak-zarzadzac-zlotem-i-przedmiotami/); this prototype defines its own payout timing and balance.

Win and loss streaks grant +1 at three, +2 at five and +3 at six or more. Wild rounds preserve streaks; draws reset them. Hover the wallet and review the round result for income details.

## Selling

Drag an owned board or bench Pokémon onto the shop. The shop turns gray and displays its name, actual refund and any resulting interest-tier increase. Release to sell; move away or cancel to keep the unit. Held items return to inventory and copies return to the shared pool. Refunds in this prototype are the unit's cost multiplied by its represented copies: cost × 1/3/9 at one/two/three stars. A normal click on the shop never sells a selected unit.

## Items

Six components combine into 21 recipes. Each unit has three held slots; two components on a unit automatically combine. You can also combine two selected components in the tray. Completed items remain held until selling; merges keep equipment and return overflow. Every surviving trainer receives the same seeded component after a wild round, and bots equip through the same rules.

The item bag sits beside the bench inside the arena and shows your unequipped item count. You begin with three components; wild-round results name each new component and confirm it was added to the bag, including after a loss. Use the bag's **?** button for acquisition, crafting and equipment instructions.

Between battles, drag an item onto an owned board or bench Pokémon, or select an item and click a highlighted Pokémon. The bag shows its stats and previews an automatic combination when targeting a unit with a component. Full units are marked unless a valid combination frees the required slot. Equipped item badges and the selected Pokémon's slot count show where items went. Equipment locks during combat; Escape cancels selection.

## Phone controls

Phone play uses landscape. In portrait, a rotate prompt blocks game input and pauses battle simulation; rotating back resumes the match. The battlefield sits above the horizontal reserves and shop, with Battle at the end of the bench. Synergies and an always-visible compact item tray sit on the left; Items opens the detailed bag. Common landscape phone sizes fit without page scrolling.

Tap a Pokémon and then a highlighted tile to position it, or drag directly. Swipe the reserves sideways to browse; drag a reserve upward toward the board to deploy it. Use the selection bar to inspect, return to reserves, sell or cancel. Tap a synergy for its bonuses. Item selection or dragging collapses the detailed bag so targets remain unobstructed. Shop swipes browse without buying; cancelled gestures preserve units and items.

## League rounds

Three wild warmups lead into stage 2. Later stages contain three trainer battles, a shared draft, two more trainer battles and a wild round. Lower-health trainers draft first. Draft units are free and come from the shared pool; make bench space or combine an upgrade before picking.

There are 29/22/18/12/10 copies of each cost-1/2/3/4/5 species. Owned units, shop offers and draft choices all reserve stock. Trainer pairings rotate through opponents; an odd lobby uses one ghost board without damaging the ghost's owner twice. Losing costs health according to stage and surviving enemy stars. Eliminated trainers release their stock. The league ends when you are eliminated or every rival is eliminated, with a final placement.


## Desktop combat feedback and inspection

Hover a board or bench Pokémon to inspect it beside the arena. Right-click to pin the card; use Unpin or Escape to release it. During battle, the card updates HP, mana, shields, statuses and its current target. The inspected Pokémon has a gold ground ring; its recent attack target gets a dashed coral ring. Click a held item badge or a held-item row for its stats; hover or right-click a bag item for its component recipes. Inspection never pauses a live battle.

Basic hits use ivory numbers, abilities use larger amber SKILL numbers, and healing uses green + HEAL numbers with recovery ripples and a source tether. Cast labels name both the caster and ability; a target circle and dashed trace show where the skill is going. Blue shield bars sit above health bars. These are presentation changes; battle rules and item balance are unchanged.


For a reproducible full-board check, open **Game menu → Battle sandbox → 8v8 mixed teams + items**. It uses the sandbox seed, eight 2-star Pokémon and sixteen held items per side, and runs on the main battlefield without changing your adventure. In crowded desktop fights, numbers combine recent impacts per Pokémon and channel; **×N** indicates how many events the total includes. Recovery remains a separate green total. Labels avoid each other and live health/mana/shield bars, while cast names move into the left water margin.


The desktop **Combat** meter ranks your team by cumulative health damage or effective healing. Switch Damage/Healing or toggle to the opponent. Bars scale to that team's leader; hover a row for its team share and click to inspect the Pokémon. Knocked-out units keep their totals. Healing includes self-healing and regeneration, excludes overhealing, and damage excludes shield absorption. The meter pauses, rewinds and resets with replay controls, and retains final totals after a fight. Collapse it to give inspection more space.
