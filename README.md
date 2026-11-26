# Touchline Manager

A football management game that runs in the browser. It has no dependencies and no build step, and works on phones and desktops.

Take charge of one of 12 fictional clubs and manage the squad, tactics, transfers and finances across as many seasons as the board allows.

## Play

Open `index.html` in a browser, or serve the folder (for example `python3 -m http.server`) and visit it. Progress saves automatically to the browser's local storage after every matchday.

## Features

- **Live match engine:** minute-by-minute commentary with possession and shots. You can pause, change speed, switch mentality and make up to 5 substitutions mid-match. Quick sim is also available.
- **Tactics:** 6 formations and defensive, balanced or attacking mentality. Tap players on the pitch and bench to swap them. Out-of-position players are penalised.
- **Squad:** player ratings, potential, age, fitness, morale, injuries, and goals and assists.
- **Transfers:** buy from rival clubs or sign free agents, take offers for your players, or release them. Players turn down clubs below their level.
- **Finances:** wages, TV and commercial income, gate receipts and prize money. Going more than £5M into debt gets you fired.
- **Seasons:** 22-matchday double round-robin. Players age, develop and retire, and youth players join each year. Club reputations shift with results, and the board judges you against its expectation.
- **Training intensity:** harder training gives faster development but more injuries and slower recovery.

## Code

- `js/engine.js`: the game rules and simulation. It doesn't touch the DOM and runs under Node.
- `js/ui.js`: rendering and input.
- `tests/sim.test.js`: a headless smoke test that plays 5 full seasons. Run it with `node tests/sim.test.js`.
