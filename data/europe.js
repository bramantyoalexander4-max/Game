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
      { name: 'Galatasaray', short: 'GS', color: '#A90432', rep: 77, country: 'Turkey', players: [
        'Uğurcan Çakır|GK|29|79',
        'Davinson Sánchez|DF|29|77', 'Abdülkerim Bardakcı|DF|30|75', 'Wilfried Singo|DF|24|77', 'Kaan Ayhan|DF|30|73',
        'Eren Elmalı|DF|25|72', 'İsmail Jakobs|DF|25|73',
        'Lucas Torreira|MF|29|79', 'Gabriel Sara|MF|26|78', 'İlkay Gündoğan|MF|34|80', 'Mario Lemina|MF|31|74',
        'Barış Alper Yılmaz|FW|25|77', 'Yunus Akgün|FW|24|74', 'Roland Sallai|FW|28|76', 'Leroy Sané|FW|29|80',
        'Victor Osimhen|FW|26|86', 'Mauro Icardi|FW|32|76'] },
      { name: 'Club Brugge', short: 'CLB', color: '#0076C0', rep: 75, country: 'Belgium', players: [
        'Simon Mignolet|GK|37|76', 'Nordin Jackers|GK|27|70',
        'Brandon Mechele|DF|32|73', 'Joel Ordóñez|DF|21|76|83', 'Kyriani Sabbe|DF|20|71', 'Joaquin Seys|DF|20|71|79',
        'Bjorn Meijer|DF|22|72', 'Hugo Siquet|DF|23|70',
        'Hans Vanaken|MF|32|78', 'Raphael Onyedika|MF|24|77', 'Aleksandar Stanković|MF|19|72|80', 'Hugo Vetlesen|MF|25|73',
        'Christos Tzolis|FW|23|79|83', 'Carlos Forbs|FW|21|75|80', 'Nicolò Tresoldi|FW|21|73|80', 'Romeo Vermant|FW|21|70',
        'Gustaf Nilsson|FW|28|71'] },
      { name: 'Olympiacos', short: 'OLY', color: '#E5121E', rep: 74, country: 'Greece', players: [
        'Konstantinos Tzolakis|GK|22|73|79',
        'Panagiotis Retsos|DF|26|72', 'Lorenzo Pirola|DF|23|73', 'Francisco Ortega|DF|26|72', 'Rodinei|DF|33|70',
        'Costinha|DF|25|72',
        'Santiago Hezze|MF|23|73', 'Dani García|MF|35|71', 'Chiquinho|MF|30|74', 'Christos Mouzakitis|MF|18|70|82',
        'Gelson Martins|FW|30|75', 'Ayoub El Kaabi|FW|32|76', 'Daniel Podence|FW|29|76', 'Mehdi Taremi|FW|33|74'] },
      { name: 'Slavia Prague', short: 'SLA', color: '#D2001F', rep: 71, country: 'Czechia', players: [
        'Jindřich Staněk|GK|29|74',
        'Tomáš Holeš|DF|32|72', 'David Zima|DF|24|72', 'Igoh Ogbu|DF|25|71', 'David Douděra|DF|27|72',
        'Lukáš Provod|MF|29|74', 'Oscar Dorley|MF|27|71', 'Christos Zafeiris|MF|22|74|79',
        'Ivan Schranz|FW|32|72', 'Mojmír Chytil|FW|26|72', 'Tomáš Chorý|FW|30|73', 'Vasil Kušej|FW|24|70'] },
      { name: 'Union Saint-Gilloise', short: 'USG', color: '#E6B800', rep: 71, country: 'Belgium', players: [
        'Kjell Scherpen|GK|25|72',
        'Ross Sykes|DF|26|72', 'Christian Burgess|DF|33|71', 'Fedde Leysen|DF|27|72', 'Kevin Mac Allister|DF|28|72',
        'Anan Khalaili|DF|21|72|78',
        'Ousseynou Niang|FW|24|71', 'Kevin Rodríguez|FW|25|72', 'Promise David|FW|24|73', 'Mohammed Fuseini|FW|23|70'] },
      { name: 'FC Copenhagen', short: 'FCK', color: '#1F3D7A', rep: 71, country: 'Denmark', players: [
        'Dominik Kotarski|GK|25|73',
        'Gabriel Pereira|DF|24|72', 'Pantelis Hatzidiakos|DF|28|72', 'Marcos López|DF|25|71', 'Rodrigo Huescas|DF|22|72',
        'Lukas Lerager|MF|32|72', 'Viktor Claesson|MF|33|71',
        'Mohamed Elyounoussi|FW|31|73', 'Jordan Larsson|FW|28|73', 'Youssoufa Moukoko|FW|20|73|80', 'Andreas Cornelius|FW|32|70',
        'Elias Achouri|FW|26|72'] },
      { name: 'Bodø/Glimt', short: 'BOD', color: '#D9BF00', rep: 70, country: 'Norway', players: [
        'Nikita Haikin|GK|30|73',
        'Fredrik Bjørkan|DF|27|71', 'Odin Bjørtuft|DF|27|70', 'Jostein Gundersen|DF|29|70',
        'Patrick Berg|MF|27|75', 'Håkon Evjen|MF|25|73', 'Ulrik Saltnes|MF|33|70', 'Sondre Brunstad Fet|MF|28|72',
        'Jens Petter Hauge|FW|25|74', 'Kasper Høgh|FW|24|74', 'Ole Didrik Blomberg|FW|24|71'] },
      { name: 'Qarabağ', short: 'QAR', color: '#1E1E1E', rep: 68, country: 'Azerbaijan', players: [
        'Shakhruddin Magomedaliyev|GK|31|70',
        'Bahlul Mustafazade|DF|28|70', 'Elvin Cafarquliyev|DF|25|69',
        'Marko Janković|MF|30|72', 'Kady Borges|MF|29|72',
        'Abdellah Zoubir|FW|34|72', 'Leandro Andrade|FW|25|72', 'Juninho|FW|28|71', 'Toral Bayramov|FW|23|69'] },
      { name: 'Pafos', short: 'PAF', color: '#00337F', rep: 64, country: 'Cyprus', players: [
        'Neofytos Michael|GK|32|67',
        'David Luiz|DF|38|70', 'Bruno Langa|DF|27|67', 'David Goldar|DF|31|67', 'Derrick Luckassen|DF|30|67',
        'Vlad Dragomir|MF|26|69', 'Domingos Quina|MF|25|69', 'Pepê|MF|28|69',
        'Jaja|FW|25|68', 'Mislav Oršić|FW|32|71', 'Anderson Silva|FW|27|67'] },
      { name: 'Kairat Almaty', short: 'KAI', color: '#E0A400', rep: 63, country: 'Kazakhstan', players: [
        'Temirlan Anarbekov|GK|22|66', 'Sherkhan Kalmurza|GK|20|64',
        'Aleksandr Martynovich|DF|38|64', 'Ofri Arad|MF|26|66', 'Valery Gromyko|MF|28|66',
        'Dastan Satpaev|FW|17|66|80', 'Jorginho|FW|29|67', 'Edmilson|FW|27|66'] },
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
