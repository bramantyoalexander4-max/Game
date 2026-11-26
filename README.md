# Touchline Manager

A football management game that runs in the browser. It has no dependencies and no build step, and works on phones and desktops.

Take charge of a club and manage the squad, tactics, transfers and finances across as many seasons as the board allows. There are two game worlds:

- **England 2025/26:** the real Premier League (20 clubs) and Championship (24 clubs), with 761 real players as of the start of the 2025/26 season. Three clubs go up and three go down each season. The season is 38 or 46 matchdays plus a 6-round cup.
- **Fictional:** 24 invented clubs in two divisions of 12, with randomly generated players.

> The real-football data in `data/england.js` is an unofficial, best-effort snapshot. Squads may be out of date (transfers after summer 2025 aren't included), ages are approximate, and the ratings are editorial estimates rather than official figures. Partially known Championship squads are topped up with generated players. No club crests or logos are used, only names and kit colours. Edit the file to update squads or ratings: each player is `"Name|POS|age|rating|potential"`.

## Play

Open `index.html` in a browser, or serve the folder (for example `python3 -m http.server`) and visit it. Progress saves automatically to the browser's local storage after every matchday.

## Features

- **Live match engine:** minute-by-minute commentary with possession and shots. You can pause, change speed, switch mentality and make up to 5 substitutions mid-match. Quick sim is also available.
- **Tactics:** 6 formations and defensive, balanced or attacking mentality. Tap players on the pitch and bench to swap them. Out-of-position players are penalised.
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

## Code

- `data/england.js`: the real-football data pack. Other packs can be added the same way, by registering on `TM_DATASETS`.
- `js/engine.js`: the game rules and simulation. It doesn't touch the DOM and runs under Node.
- `js/ui.js`: rendering and input.
- `tests/sim.test.js`: a headless smoke test that plays 5 full seasons and checks the table, the cup and promotion/relegation. Run it with `node tests/sim.test.js [clubIndex] [seed] [fictional|england]`.
