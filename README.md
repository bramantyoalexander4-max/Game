# Touchline Manager

A football management game that runs in the browser. It has no dependencies and no build step, and works on phones and desktops.

Take charge of a club and manage the squad, tactics, transfers and finances across as many seasons as the board allows. There are two game worlds:

- **Europe 2025/26:** 286 real clubs in 17 leagues across 16 countries, all running at the same time:
  - England (Premier League and Championship, 3 up, 3 down), Spain, Italy, France, Germany, the Netherlands and Portugal, with about 2,800 real players as of the start of the 2025/26 season.
  - Turkey, Belgium, Greece, Czechia, Denmark, Norway, Azerbaijan, Cyprus and Kazakhstan, with real club lists. Only the big clubs' best-known players are real; the rest of each squad is generated.
  - Each country has its own cup.
  - You can manage **any club or any national team**.
  - **Champions League:** the real 36-club 2025/26 field, as at the start of 2025/26. It has an 8-game league phase, then a knockout play-off, round of 16, quarter-finals, semi-finals and final. Knockout ties are single matches, a simplification.
  - **Qualification:** from the second season, the top 5 in England and Spain and the top 4 in Italy, Germany and France, the top 2 in the Netherlands, Portugal, Turkey and Belgium, and the champions of Greece, Czechia, Denmark, Norway, Azerbaijan and Cyprus qualify.
  - **Simplifications:** only England has a second tier, so the other leagues have no relegation. Smaller leagues play each other 3 or 4 times. A season is 65 weeks, plus 7 tournament weeks in tournament summers. Nationalities are best-known and may contain mistakes; generated players get random nationalities, mostly local.
- **National teams (Europe world):** every player has a nationality, and 52 nations can field a team (37 are selectable at the start).
  - Pick "A national team" on the start screen to manage a country: call up 23 players, set tactics and play 6 matches during the international breaks.
  - Each summer there's a tournament: the World Cup in 2026 and 2030, the Euros in 2028. Qualifying groups of 4 lead to a 24-team finals with 6 groups, then a round of 16. There are no tournaments in odd years, so those seasons are friendlies.
  - The federation sets a target from your world ranking. Missing it by one stage earns a warning; a second miss, or missing by two stages, gets you sacked.
  - In club careers the internationals run in the background, and you can follow them in League → International.
- **World 2025/26:** everything in the Europe world, plus Scotland, Austria, Switzerland, Brazil, Argentina, the USA (MLS), Mexico, Saudi Arabia, Japan, South Korea and Indonesia (Super League). That's 27 countries and 488 clubs.
  - Each country has its own cup, and every club and national team is manageable.
  - Stars include Messi at Inter Miami, Neymar at Santos, Ronaldo and Benzema in Saudi Arabia, and Son at LAFC. Squads outside the big leagues are mostly generated.
  - It's the biggest world, so it runs slower on older phones.
- **Copa Libertadores and AFC Champions League (World world):** 16 clubs each, qualifying through their leagues.
  - The Libertadores takes 8 clubs from Brazil and 8 from Argentina. The AFC Champions League takes 4 each from Saudi Arabia, Japan, South Korea and Indonesia.
  - Four groups of four, home and away, then quarter-finals, semi-finals and a final.
  - They're played in the same weeks as the Champions League, so the season doesn't get longer.
- **Indonesia:** an 18-club Super League. The national team uses its naturalised internationals (Idzes, Audero, Paes, Verdonk, Diks, Hilgers, Romeny, Haye and others).
- **👑 Legends market (Transfers → Legends):** 45 all-time greats at their peak (age 27), such as Pelé, Maradona, Ronaldinho, Beckham, Zidane, Ronaldo Nazário, Cruyff and Maldini.
  - Each legend can be signed once per career, and only by you.
  - Legends cost **Legend Points**, not money. You earn points by winning: +3 a win, +1 a draw, +60 a league title, +40 promotion, +30 a domestic cup, +80 the Champions League, +60 a Libertadores or AFC title, +15 Champions League qualification, +25 for beating the board's target, and +15 when your player wins the Golden Boy. Prices run from 40 points (Bambang Pamungkas) to 296 (Pelé, Maradona).
  - Legends age normally, but they have retired from international football and are never called up.
  - The ratings are playful estimates of each player at his best.
- **Nations League:** in years without a World Cup or Euro, European national teams play the Nations League instead of friendlies.
  - Leagues A, B and C have groups of 4 over the 6 international breaks.
  - Group winners go up and bottom sides go down, in equal numbers so the leagues keep their size.
  - The 4 League A group winners play Finals (semi-finals and a final) in the summer.
  - Other nations play friendlies.
- **England only:** just the Premier League and Championship.
- **Fictional:** 24 invented clubs in two divisions of 12, with randomly generated players.

> The real-football data in `data/` (`england.js`, `spain.js`, `italy.js`, `france.js`, `germany.js`, `netherlands.js`, `portugal.js`, `others.js`, `world.js`, `europe.js`, `nations.js`, `legends.js`) is an unofficial, best-effort snapshot. Squads may be out of date (transfers after summer 2025 aren't included), ages are approximate, and the ratings are editorial estimates rather than official figures. Partially known squads, mostly smaller clubs, are topped up with generated players. No club crests or logos are used, only names and kit colours. Edit the file to update squads or ratings: each player is `"Name|POS|age|rating|potential"`.

## Play

Open `index.html` in a browser, or serve the folder (for example `python3 -m http.server`) and visit it. Progress saves automatically to the browser's local storage after every matchday. Saves are gzip-compressed where the browser supports it.

## Features

- **Live match engine:** minute-by-minute commentary with possession and shots. You can pause, change speed, switch mentality and make up to 5 substitutions mid-match. Quick sim is also available. Goals get a full-screen celebration (the match pauses briefly at normal speeds), and your phone vibrates — a long buzz pattern for your goals, a short one for goals against. Live matches also have sound: a crowd murmur throughout, the referee's whistle at kick-off, half-time and full-time, an "ooh" for near misses, jeers for red cards, a huge roar and horns for your goals, and a groan for goals against. All sounds are generated in the browser, so no audio files are needed. The menu screens have relaxed background music, generated live so each loop has a fresh melody; it fades out when a live match starts and comes back afterwards. Vibration, match sounds and menu music can each be switched off under Club → Game.
- **Tactics:** 6 formations, defensive/balanced/attacking mentality, pressing (low block, normal or high press) and tempo (patient, normal or direct). The **📋 Tactics & subs** button during a match pauses the game and opens one panel where you can change formation, mentality, pressing, tempo and substitutions, and swap players' positions on the pitch by tapping one player and then another. AI teams chase games they're losing and protect leads late on. Tap players on the pitch and bench to swap them. Out-of-position players are penalised.
- **Squad:** player ratings, potential, age, fitness, morale, injuries, and goals and assists.
- **Transfers:** buy from rival clubs or sign free agents, take offers for your players, or release them. Players turn down clubs below their level.
- **Finances:** wages, TV and commercial income, gate receipts and prize money. Going more than £5M into debt gets you fired.
- **Two divisions:** 24 clubs in two divisions of 12. Each season the bottom 2 of Division 1 swap places with the top 2 of Division 2.
- **Shield Cup:** a 5-round knockout for all 24 clubs, played between league matchdays. The 8 top-rated Division 1 clubs get a first-round bye, draws go to penalties, and every round won pays prize money. Winning it saves your job after a bad league season.
- **Seasons:** 22 league matchdays (a double round-robin) plus the cup rounds. Players age, develop and retire, and youth players join each year. Club reputations shift with results, and the board judges you against its expectation.
- **Contracts:** every player has a deal running to a set season. In a player's last 2 seasons you can offer an extension, choosing the length and wage (lowball, meet his demand, or generous). Rejected offers block talks for 3 weeks. Expired contracts mean the player leaves on a free. Rival clubs renew or lose their own players too, and sell players in their final year cheaply.
- **Youth academy:** an upgradeable academy (levels 1-5) takes in new 15-16-year-old prospects each summer. Higher levels bring more and better prospects, faster development and more accurate potential estimates, at higher running costs. Promote prospects to the first team, or lose them at 19.
- **Wonderkids:** rare players aged 21 or under with elite potential (84–96), marked 🌟. A few start at clubs across both divisions, and more come through rival youth intakes and your academy (higher academy levels find more). Every player has a personality (Professional, Determined, Balanced, Temperamental or Lazy) that speeds up or slows down development. Lazy talents can lose potential. Regular playing time makes young players develop faster, and benched wonderkids get frustrated. Rival players' potential is only a rumoured range until you pay for a scout report. Big clubs bid for your wonderkids (accept or reject on the Home screen) and buy them from smaller rivals. A Golden Boy award goes to the best player aged 21 or under each season.
- **Training intensity:** harder training gives faster development but more injuries and slower recovery.

## Android app

`android/` is a small native Android project. It shows the game in a full-screen WebView, and saves are kept on the phone. The game files are copied from the repository root at build time, so there's only one copy of the game.

```
cd android
# needs a JDK 17+ and the Android SDK (platform 34, build-tools 34); set ANDROID_HOME or android/local.properties
./gradlew assembleDebug            # → app/build/outputs/apk/debug/app-debug.apk
```

For a release build, create `android/release.keystore` (alias `touchline`) and set `TOUCHLINE_STORE_PASSWORD` and `TOUCHLINE_KEY_PASSWORD` before running `./gradlew assembleRelease`. Keystores are git-ignored.

## Code

- `data/*.js`: the real-football country packs, registered on `TM_COUNTRIES`, and the Champions League pack, `TM_CONTINENTAL`. The engine builds the game worlds from whichever packs are loaded.
- `js/engine.js`: the game rules and simulation. It doesn't touch the DOM and runs under Node.
- `js/ui.js`: rendering and input.
- `tests/sim.test.js`: a headless smoke test that plays 5 full seasons and checks the table, the cup and promotion/relegation. Run it with `node tests/sim.test.js [clubIndex] [seed] [fictional|england|europe|world] [NATION_CODE]`. Pass a nation code such as ESP to test national-team mode.
