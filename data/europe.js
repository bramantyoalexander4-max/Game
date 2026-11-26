/* Real-football data pack: Champions League 2025/26.
 * `initial` is the real 2025/26 league-phase field (36 clubs). Clubs from outside the five
 * modelled leagues are included as "Rest of Europe" sides that only play in Europe; their
 * squads are partial (ratings are editorial estimates) and get topped up with generated players.
 * In later seasons the modelled leagues send their top clubs (see each country's clSlots)
 * and these 14 sides keep the remaining places. Format: "Name|POS|age|ovr|pot". */
(function (root) {
  'use strict';
  root.TM_CONTINENTAL = {
    name: 'Champions League',
    initial: [
      'Liverpool', 'Arsenal', 'Manchester City', 'Chelsea', 'Newcastle United', 'Tottenham Hotspur',
      'Barcelona', 'Real Madrid', 'Atlético Madrid', 'Athletic Club', 'Villarreal',
      'Napoli', 'Inter', 'Atalanta', 'Juventus',
      'Bayern Munich', 'Bayer Leverkusen', 'Eintracht Frankfurt', 'Borussia Dortmund',
      'Paris Saint-Germain', 'Marseille', 'Monaco',
      'Benfica', 'Sporting CP', 'PSV', 'Ajax', 'Club Brugge', 'Union Saint-Gilloise', 'Galatasaray',
      'Olympiacos', 'Slavia Prague', 'Bodø/Glimt', 'FC Copenhagen', 'Qarabağ', 'Kairat Almaty', 'Pafos',
    ],
    guests: [
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
