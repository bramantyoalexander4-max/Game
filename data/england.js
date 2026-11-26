/* Real-football data pack: English Premier League & Championship, start of the 2025/26 season.
 * Squads reflect the summer 2025 transfer window as best known; ages are as of August 2025.
 * Ratings (ovr/pot, on the game's 1-99 scale) are editorial estimates, not official data.
 * Format per player: "Name|POS|age|ovr|pot" — POS is GK, DF, MF or FW; pot is optional.
 * Clubs with incomplete lists are topped up with generated players when a game starts.
 * Edit freely to update squads or ratings. */
(function (root) {
  'use strict';
  const D = (root.TM_DATASETS = root.TM_DATASETS || {});
  D.england = {
    id: 'england',
    name: 'Real football — England 2025/26',
    short: 'England 2025/26',
    note: 'Real clubs and players as of the start of the 2025/26 season. Squads may be out of date and ratings are estimates.',
    divNames: ['Premier League', 'Championship'],
    promoted: 3,
    cupName: 'National Cup',
    startYear: 2025,
    autoEconomy: true,
    clubs: [
      // ---------------- Premier League ----------------
      { name: 'Arsenal', short: 'ARS', color: '#EF0107', rep: 90, div: 1, players: [
        'David Raya|GK|29|86', 'Kepa Arrizabalaga|GK|30|79',
        'William Saliba|DF|24|88|89', 'Gabriel Magalhães|DF|27|87', 'Ben White|DF|27|82', 'Jurriën Timber|DF|24|83|85',
        'Riccardo Calafiori|DF|23|81|85', 'Myles Lewis-Skelly|DF|18|76|88', 'Cristhian Mosquera|DF|21|76|84', 'Piero Hincapié|DF|23|80|85',
        'Martin Ødegaard|MF|26|87', 'Declan Rice|MF|26|87', 'Martín Zubimendi|MF|26|85', 'Mikel Merino|MF|29|83',
        'Christian Nørgaard|MF|31|79', 'Eberechi Eze|MF|27|84', 'Ethan Nwaneri|MF|18|77|89',
        'Bukayo Saka|FW|23|88|90', 'Gabriel Martinelli|FW|24|82', 'Leandro Trossard|FW|30|81', 'Viktor Gyökeres|FW|27|86',
        'Kai Havertz|FW|26|82', 'Noni Madueke|FW|23|80|84', 'Gabriel Jesus|FW|28|78'] },
      { name: 'Liverpool', short: 'LIV', color: '#C8102E', rep: 91, div: 1, players: [
        'Alisson|GK|32|88', 'Giorgi Mamardashvili|GK|24|82|86',
        'Virgil van Dijk|DF|34|88', 'Ibrahima Konaté|DF|26|85', 'Joe Gomez|DF|28|78', 'Jeremie Frimpong|DF|24|83|85',
        'Conor Bradley|DF|22|77|82', 'Milos Kerkez|DF|21|80|85', 'Andy Robertson|DF|31|82', 'Giovanni Leoni|DF|18|70|85',
        'Alexis Mac Allister|MF|26|86', 'Ryan Gravenberch|MF|23|85|88', 'Dominik Szoboszlai|MF|24|84|86', 'Florian Wirtz|MF|22|87|92',
        'Curtis Jones|MF|24|80', 'Wataru Endo|MF|32|77',
        'Mohamed Salah|FW|33|89', 'Cody Gakpo|FW|26|84', 'Alexander Isak|FW|25|88', 'Hugo Ekitiké|FW|23|83|87',
        'Federico Chiesa|FW|27|78', 'Rio Ngumoha|FW|16|66|86'] },
      { name: 'Manchester City', short: 'MCI', color: '#6CABDD', rep: 90, div: 1, players: [
        'Gianluigi Donnarumma|GK|26|88', 'James Trafford|GK|22|78|84', 'Stefan Ortega|GK|32|79',
        'Rúben Dias|DF|28|87', 'Joško Gvardiol|DF|23|85|88', 'John Stones|DF|31|82', 'Nathan Aké|DF|30|81',
        'Rico Lewis|DF|20|79|85', 'Matheus Nunes|DF|26|80', 'Abdukodir Khusanov|DF|21|76|84', 'Rayan Aït-Nouri|DF|24|82|84',
        'Vitor Reis|DF|19|70|82',
        'Rodri|MF|29|89', 'Tijjani Reijnders|MF|27|85', 'Bernardo Silva|MF|30|85', 'Phil Foden|MF|25|86|87',
        'Mateo Kovačić|MF|31|81', 'Nico González|MF|23|80|83', 'Rayan Cherki|MF|21|82|88', 'Oscar Bobb|MF|22|75|82',
        'Savinho|FW|21|80|86', 'Jérémy Doku|FW|23|81|84', 'Omar Marmoush|FW|26|83', 'Erling Haaland|FW|25|91'] },
      { name: 'Chelsea', short: 'CHE', color: '#034694', rep: 87, div: 1, players: [
        'Robert Sánchez|GK|27|80', 'Filip Jørgensen|GK|23|77|83',
        'Levi Colwill|DF|22|82|87', 'Wesley Fofana|DF|24|80', 'Trevoh Chalobah|DF|26|80', 'Benoît Badiashile|DF|24|78',
        'Tosin Adarabioyo|DF|27|78', 'Reece James|DF|25|83', 'Malo Gusto|DF|22|80|84', 'Marc Cucurella|DF|27|83',
        'Jorrel Hato|DF|19|76|86', 'Josh Acheampong|DF|19|70|82',
        'Moisés Caicedo|MF|23|87|89', 'Enzo Fernández|MF|24|85|87', 'Roméo Lavia|MF|21|77|84', 'Cole Palmer|MF|23|87|90',
        'Andrey Santos|MF|21|76|83', 'Dário Essugo|MF|20|72|82',
        'Estêvão|FW|18|79|92', 'Pedro Neto|FW|25|82', 'Jamie Gittens|FW|20|78|86', 'Alejandro Garnacho|FW|21|79|86',
        'João Pedro|FW|23|82|85', 'Liam Delap|FW|22|78|84', 'Marc Guiu|FW|19|70|80', 'Tyrique George|FW|19|72|81'] },
      { name: 'Manchester United', short: 'MUN', color: '#DA291C', rep: 85, div: 1, players: [
        'Senne Lammens|GK|23|76|83', 'Altay Bayındır|GK|27|74',
        'Lisandro Martínez|DF|27|83', 'Matthijs de Ligt|DF|25|82', 'Harry Maguire|DF|32|78', 'Leny Yoro|DF|19|77|88',
        'Luke Shaw|DF|30|78', 'Diogo Dalot|DF|26|80', 'Noussair Mazraoui|DF|27|79', 'Patrick Dorgu|DF|20|76|83',
        'Ayden Heaven|DF|18|68|80', 'Tyrell Malacia|DF|25|72',
        'Bruno Fernandes|MF|30|86', 'Casemiro|MF|33|79', 'Manuel Ugarte|MF|24|78', 'Kobbie Mainoo|MF|20|79|87',
        'Mason Mount|MF|26|78', 'Amad Diallo|FW|23|80|85',
        'Matheus Cunha|FW|26|83', 'Bryan Mbeumo|FW|25|83', 'Benjamin Šeško|FW|22|80|87', 'Joshua Zirkzee|FW|24|76',
        'Chido Obi|FW|17|64|82'] },
      { name: 'Tottenham Hotspur', short: 'TOT', color: '#132257', rep: 84, div: 1, players: [
        'Guglielmo Vicario|GK|28|84', 'Antonín Kinský|GK|22|73|80',
        'Cristian Romero|DF|27|85', 'Micky van de Ven|DF|24|84|86', 'Pedro Porro|DF|25|82', 'Destiny Udogie|DF|22|80|84',
        'Djed Spence|DF|24|77', 'Radu Drăgușin|DF|23|77', 'Kevin Danso|DF|26|79', 'Ben Davies|DF|32|75', 'Kota Takai|DF|21|70|80',
        'João Palhinha|MF|30|82', 'Rodrigo Bentancur|MF|28|80', 'Pape Matar Sarr|MF|22|79|84', 'Yves Bissouma|MF|28|78',
        'Lucas Bergvall|MF|19|76|87', 'Archie Gray|MF|19|75|85', 'James Maddison|MF|28|82', 'Xavi Simons|MF|22|83|88',
        'Mohammed Kudus|FW|25|83', 'Dejan Kulusevski|FW|25|82', 'Wilson Odobert|FW|20|75|82',
        'Dominic Solanke|FW|27|81', 'Richarlison|FW|28|77', 'Brennan Johnson|FW|24|79', 'Mathys Tel|FW|20|76|85',
        'Randal Kolo Muani|FW|26|80'] },
      { name: 'Newcastle United', short: 'NEW', color: '#241F20', rep: 84, div: 1, players: [
        'Nick Pope|GK|33|82', 'Aaron Ramsdale|GK|27|78',
        'Kieran Trippier|DF|34|79', 'Tino Livramento|DF|22|80|85', 'Sven Botman|DF|25|81', 'Fabian Schär|DF|33|80',
        'Dan Burn|DF|33|79', 'Malick Thiaw|DF|24|80', 'Lewis Hall|DF|20|78|84', 'Emil Krafth|DF|31|72',
        'Bruno Guimarães|MF|27|86', 'Sandro Tonali|MF|25|85', 'Joelinton|MF|29|82', 'Joe Willock|MF|25|76',
        'Jacob Ramsey|MF|24|77', 'Lewis Miley|MF|19|72|82',
        'Nick Woltemade|FW|23|80|85', 'Yoane Wissa|FW|28|80', 'Anthony Gordon|FW|24|83', 'Harvey Barnes|FW|27|79',
        'Anthony Elanga|FW|23|80', 'Jacob Murphy|FW|30|78', 'William Osula|FW|22|72|79'] },
      { name: 'Aston Villa', short: 'AVL', color: '#670E36', rep: 82, div: 1, players: [
        'Emiliano Martínez|GK|32|85', 'Marco Bizot|GK|34|74',
        'Ezri Konsa|DF|27|82', 'Pau Torres|DF|28|82', 'Tyrone Mings|DF|32|77', 'Matty Cash|DF|28|79', 'Lucas Digne|DF|32|78',
        'Ian Maatsen|DF|23|78|82', 'Andrés García|DF|22|74|79', 'Lamare Bogarde|DF|21|72|80', 'Victor Lindelöf|DF|31|76',
        'Youri Tielemans|MF|28|83', 'Boubacar Kamara|MF|25|82', 'Amadou Onana|MF|24|81|83', 'John McGinn|MF|30|80',
        'Morgan Rogers|MF|23|82|86', 'Ross Barkley|MF|31|75', 'Harvey Elliott|MF|22|78|83', 'Emiliano Buendía|MF|28|78',
        'Jadon Sancho|FW|25|77', 'Ollie Watkins|FW|29|83', 'Evann Guessand|FW|24|78', 'Donyell Malen|FW|26|79'] },
      { name: 'Brighton & Hove Albion', short: 'BHA', color: '#0057B8', rep: 78, div: 1, players: [
        'Bart Verbruggen|GK|23|79|83', 'Jason Steele|GK|34|70',
        'Jan Paul van Hecke|DF|25|80', 'Lewis Dunk|DF|33|79', 'Igor Julio|DF|27|77', 'Adam Webster|DF|30|75',
        'Joël Veltman|DF|33|75', 'Ferdi Kadıoğlu|DF|25|79', 'Maxim De Cuyper|DF|24|77', 'Olivier Boscagli|DF|27|76',
        'Diego Coppola|DF|21|72|80',
        'Carlos Baleba|MF|21|81|87', 'Mats Wieffer|MF|26|78', 'Yasin Ayari|MF|21|76|82', 'Jack Hinshelwood|MF|20|75|82',
        'James Milner|MF|39|70', 'Diego Gómez|MF|22|76|82', 'Matt O\'Riley|MF|24|78', 'Brajan Gruda|MF|21|74|82',
        'Kaoru Mitoma|FW|28|82', 'Yankuba Minteh|FW|21|78|85', 'Georginio Rutter|FW|23|78|82', 'Solly March|FW|31|76',
        'Danny Welbeck|FW|34|76', 'Stefanos Tzimas|FW|19|72|82', 'Charalampos Kostoulas|FW|18|68|82'] },
      { name: 'Nottingham Forest', short: 'NFO', color: '#DD0000', rep: 78, div: 1, players: [
        'Matz Sels|GK|33|82', 'John Victor|GK|29|72',
        'Murillo|DF|23|81|85', 'Nikola Milenković|DF|27|81', 'Ola Aina|DF|28|79', 'Neco Williams|DF|24|78',
        'Nicolò Savona|DF|22|75|81', 'Morato|DF|24|75', 'Willy Boly|DF|34|72', 'Zach Abbott|DF|19|66|76',
        'Elliot Anderson|MF|22|82|87', 'Ibrahim Sangaré|MF|27|78', 'Nicolás Domínguez|MF|27|77', 'Ryan Yates|MF|27|74',
        'Morgan Gibbs-White|MF|25|83', 'Douglas Luiz|MF|27|78', 'James McAtee|MF|22|75|81',
        'Callum Hudson-Odoi|FW|24|78', 'Omari Hutchinson|FW|21|76|83', 'Dan Ndoye|FW|24|79',
        'Chris Wood|FW|33|81', 'Igor Jesus|FW|24|77', 'Arnaud Kalimuendo|FW|23|78|82', 'Taiwo Awoniyi|FW|28|72'] },
      { name: 'Crystal Palace', short: 'CRY', color: '#1B458F', rep: 77, div: 1, players: [
        'Dean Henderson|GK|28|81', 'Walter Benítez|GK|32|74',
        'Marc Guéhi|DF|25|83', 'Maxence Lacroix|DF|25|80', 'Chris Richards|DF|25|77', 'Chadi Riad|DF|22|73|79',
        'Daniel Muñoz|DF|29|80', 'Tyrick Mitchell|DF|25|78', 'Borna Sosa|DF|27|73', 'Nathaniel Clyne|DF|34|70',
        'Adam Wharton|MF|21|81|87', 'Jefferson Lerma|MF|30|77', 'Will Hughes|MF|30|76', 'Daichi Kamada|MF|28|77',
        'Cheick Doucouré|MF|25|76', 'Justin Devenny|MF|21|70|76',
        'Yéremy Pino|FW|22|78|83', 'Ismaïla Sarr|FW|27|80', 'Jean-Philippe Mateta|FW|28|81', 'Eddie Nketiah|FW|26|75',
        'Christantus Uche|FW|22|72|78'] },
      { name: 'AFC Bournemouth', short: 'BOU', color: '#B50E12', rep: 76, div: 1, players: [
        'Đorđe Petrović|GK|25|79', 'Will Dennis|GK|25|65',
        'Marcos Senesi|DF|28|79', 'James Hill|DF|23|72', 'Adam Smith|DF|34|72', 'Álex Jiménez|DF|20|74|82',
        'Adrien Truffert|DF|23|76|81', 'Bafodé Diakité|DF|24|76', 'Julio Soler|DF|20|70|80', 'Veljko Milosavljević|DF|18|66|80',
        'Tyler Adams|MF|26|78', 'Lewis Cook|MF|28|76', 'Alex Scott|MF|21|76|82', 'Ryan Christie|MF|30|75',
        'Hamed Traorè|MF|25|74', 'Marcus Tavernier|MF|26|78', 'David Brooks|MF|28|75',
        'Justin Kluivert|FW|26|79', 'Antoine Semenyo|FW|25|81', 'Amine Adli|FW|25|76', 'Ben Doak|FW|19|74|83',
        'Evanilson|FW|25|78', 'Enes Ünal|FW|28|74', 'Eli Junior Kroupi|FW|19|70|82'] },
      { name: 'Everton', short: 'EVE', color: '#003399', rep: 76, div: 1, players: [
        'Jordan Pickford|GK|31|83', 'Mark Travers|GK|26|72',
        'James Tarkowski|DF|32|79', 'Jarrad Branthwaite|DF|23|80|85', 'Michael Keane|DF|32|75', 'Vitaliy Mykolenko|DF|26|76',
        'Jake O\'Brien|DF|24|75', 'Nathan Patterson|DF|23|73', 'Seamus Coleman|DF|36|68', 'Adam Aznou|DF|19|66|78',
        'Idrissa Gueye|MF|35|76', 'James Garner|MF|24|77', 'Tim Iroegbunam|MF|22|72|78', 'Kiernan Dewsbury-Hall|MF|26|77',
        'Merlin Röhl|MF|22|72|79', 'Carlos Alcaraz|MF|22|74|79', 'Jack Grealish|MF|29|80',
        'Iliman Ndiaye|FW|25|80', 'Dwight McNeil|FW|25|77', 'Tyler Dibling|FW|19|74|85', 'Thierno Barry|FW|22|75|81',
        'Beto|FW|27|74'] },
      { name: 'Fulham', short: 'FUL', color: '#1A1A1A', rep: 76, div: 1, players: [
        'Bernd Leno|GK|33|81', 'Benjamin Lecomte|GK|34|70',
        'Joachim Andersen|DF|29|79', 'Calvin Bassey|DF|25|77', 'Issa Diop|DF|28|75', 'Kenny Tete|DF|29|76',
        'Timothy Castagne|DF|29|76', 'Antonee Robinson|DF|27|80', 'Jorge Cuenca|DF|25|72', 'Ryan Sessegnon|DF|25|72',
        'Sander Berge|MF|27|77', 'Saša Lukić|MF|29|76', 'Harrison Reed|MF|30|74', 'Tom Cairney|MF|34|73',
        'Emile Smith Rowe|MF|25|78', 'Andreas Pereira|MF|29|78', 'Alex Iwobi|MF|29|79', 'Josh King|MF|18|66|80',
        'Adama Traoré|FW|29|76', 'Harry Wilson|FW|28|78', 'Samuel Chukwueze|FW|26|76', 'Kevin|FW|22|74|81',
        'Raúl Jiménez|FW|34|77', 'Rodrigo Muniz|FW|24|76'] },
      { name: 'Brentford', short: 'BRE', color: '#E30613', rep: 75, div: 1, players: [
        'Caoimhín Kelleher|GK|26|80', 'Hákon Valdimarsson|GK|23|70',
        'Nathan Collins|DF|24|79', 'Ethan Pinnock|DF|32|76', 'Kristoffer Ajer|DF|27|75', 'Sepp van den Berg|DF|23|76|80',
        'Rico Henry|DF|28|75', 'Aaron Hickey|DF|23|74', 'Michael Kayode|DF|21|74|80',
        'Mikkel Damsgaard|MF|25|78', 'Vitaly Janelt|MF|27|75', 'Yehor Yarmolyuk|MF|21|73|79', 'Jordan Henderson|MF|35|75',
        'Mathias Jensen|MF|29|75', 'Fábio Carvalho|MF|23|74', 'Antoni Milambo|MF|20|72|81',
        'Keane Lewis-Potter|FW|24|76', 'Kevin Schade|FW|23|76', 'Dango Ouattara|FW|23|77', 'Igor Thiago|FW|24|77',
        'Gustavo Nunes|FW|19|68|78'] },
      { name: 'West Ham United', short: 'WHU', color: '#7A263A', rep: 75, div: 1, players: [
        'Alphonse Areola|GK|32|78', 'Mads Hermansen|GK|25|76',
        'Max Kilman|DF|28|78', 'Konstantinos Mavropanos|DF|27|77', 'Jean-Clair Todibo|DF|25|77', 'Aaron Wan-Bissaka|DF|27|78',
        'El Hadji Malick Diouf|DF|20|74|82', 'Kyle Walker-Peters|DF|28|75', 'Oliver Scarles|DF|19|66|78',
        'Tomáš Souček|MF|30|78', 'Lucas Paquetá|MF|27|81', 'Mateus Fernandes|MF|21|74|81', 'Soungoutou Magassa|MF|21|72|80',
        'Guido Rodríguez|MF|31|75', 'James Ward-Prowse|MF|30|74',
        'Crysencio Summerville|FW|23|77|82', 'Jarrod Bowen|FW|28|82', 'Niclas Füllkrug|FW|32|76', 'Callum Wilson|FW|33|74'] },
      { name: 'Wolverhampton Wanderers', short: 'WOL', color: '#FDB913', rep: 73, div: 1, players: [
        'José Sá|GK|32|78', 'Sam Johnstone|GK|32|74',
        'Emmanuel Agbadou|DF|28|76', 'Toti Gomes|DF|26|75', 'Santiago Bueno|DF|26|74', 'Yerson Mosquera|DF|24|75',
        'Ladislav Krejčí|DF|26|75', 'Matt Doherty|DF|33|72', 'Jackson Tchatchoua|DF|23|73', 'Hugo Bueno|DF|22|72',
        'David Møller Wolfe|DF|23|72',
        'André|MF|24|77', 'João Gomes|MF|24|79', 'Marshall Munetsi|MF|29|75', 'Jean-Ricner Bellegarde|MF|27|76',
        'Fer López|MF|21|72|80',
        'Rodrigo Gomes|FW|22|73|79', 'Hwang Hee-chan|FW|29|75', 'Jørgen Strand Larsen|FW|25|78', 'Tolu Arokodare|FW|24|73'] },
      { name: 'Leeds United', short: 'LEE', color: '#1D428A', rep: 71, div: 1, players: [
        'Lucas Perri|GK|27|76', 'Illan Meslier|GK|25|73', 'Karl Darlow|GK|34|68',
        'Pascal Struijk|DF|26|75', 'Joe Rodon|DF|27|76', 'Jaka Bijol|DF|26|77', 'Jayden Bogle|DF|25|74',
        'Gabriel Gudmundsson|DF|26|74', 'Sebastiaan Bornauw|DF|26|73', 'James Justin|DF|27|73', 'Sam Byram|DF|31|70',
        'Ethan Ampadu|MF|24|76', 'Anton Stach|MF|26|76', 'Sean Longstaff|MF|27|75', 'Ilia Gruev|MF|25|72',
        'Ao Tanaka|MF|26|74', 'Brenden Aaronson|MF|24|74', 'Facundo Buonanotte|MF|20|73|80',
        'Daniel James|FW|27|75', 'Wilfried Gnonto|FW|21|74|80', 'Noah Okafor|FW|25|75',
        'Dominic Calvert-Lewin|FW|28|76', 'Lukas Nmecha|FW|26|74', 'Joël Piroe|FW|26|74'] },
      { name: 'Burnley', short: 'BUR', color: '#6C1D45', rep: 70, div: 1, players: [
        'Martin Dúbravka|GK|36|74', 'Max Weiß|GK|21|68|76',
        'Kyle Walker|DF|35|77', 'Maxime Estève|DF|23|76|80', 'Hjalmar Ekdal|DF|26|73', 'Axel Tuanzebe|DF|27|72',
        'Quilindschy Hartman|DF|23|73|78', 'Lucas Pires|DF|24|72', 'Connor Roberts|DF|29|72', 'Bashir Humphreys|DF|22|71|77',
        'Joe Worrall|DF|28|71',
        'Josh Cullen|MF|29|74', 'Josh Laurent|MF|30|73', 'Lesley Ugochukwu|MF|21|72|79', 'Hannibal Mejbri|MF|22|72|78',
        'Florentino Luís|MF|25|75',
        'Jaidon Anthony|FW|25|74', 'Loum Tchaouna|FW|21|72|79', 'Marcus Edwards|FW|26|73', 'Mike Trésor|FW|26|73',
        'Lyle Foster|FW|24|73', 'Zian Flemming|FW|27|74', 'Armando Broja|FW|23|72', 'Ashley Barnes|FW|35|66'] },
      { name: 'Sunderland', short: 'SUN', color: '#EB172B', rep: 70, div: 1, players: [
        'Robin Roefs|GK|22|75|81', 'Anthony Patterson|GK|25|70',
        'Dan Ballard|DF|25|74', 'Omar Alderete|DF|28|74', 'Nordi Mukiele|DF|27|76', 'Trai Hume|DF|23|73',
        'Reinildo Mandava|DF|31|75', 'Luke O\'Nien|DF|30|69', 'Lutsharel Geertruida|DF|25|75', 'Dennis Cirkin|DF|23|70',
        'Arthur Masuaku|DF|31|70',
        'Granit Xhaka|MF|32|82', 'Noah Sadiki|MF|20|74|82', 'Enzo Le Fée|MF|25|76', 'Habib Diarra|MF|21|75|82',
        'Chris Rigg|MF|18|70|84', 'Dan Neil|MF|23|71',
        'Chemsdine Talbi|FW|20|73|80', 'Simon Adingra|FW|23|76', 'Bertrand Traoré|FW|29|74', 'Romaine Mundle|FW|22|69|75',
        'Wilson Isidor|FW|25|75', 'Eliezer Mayenda|FW|20|70|78', 'Brian Brobbey|FW|23|75'] },

      // ---------------- Championship ----------------
      { name: 'Leicester City', short: 'LEI', color: '#003090', rep: 70, div: 2, players: [
        'Jakub Stolarczyk|GK|24|72|76', 'Jannik Vestergaard|DF|32|73', 'Ricardo Pereira|DF|31|74', 'Victor Kristiansen|DF|22|72|78',
        'Caleb Okoli|DF|23|72|78', 'Hamza Choudhury|DF|27|70', 'Harry Winks|MF|29|74', 'Oliver Skipp|MF|24|73',
        'Boubakary Soumaré|MF|26|72', 'Jordan James|MF|21|70|77', 'Abdul Fatawu|FW|21|74|80', 'Stephy Mavididi|FW|27|75',
        'Jordan Ayew|FW|33|72', 'Patson Daka|FW|26|72'] },
      { name: 'Ipswich Town', short: 'IPS', color: '#3A64A3', rep: 69, div: 2, players: [
        'Christian Walton|GK|29|70', 'Alex Palmer|GK|28|71', 'Dara O\'Shea|DF|26|73', 'Leif Davis|DF|25|75',
        'Cédric Kipré|DF|28|71', 'Jacob Greaves|DF|25|72', 'Darnell Furlong|DF|29|70', 'Ben Johnson|DF|25|70',
        'Jens Cajuste|MF|26|73', 'Azor Matusiwa|MF|27|71', 'Jack Taylor|MF|27|70', 'Marcelino Núñez|MF|25|72',
        'Kasey McAteer|MF|23|70', 'Jaden Philogene|FW|23|73|78', 'Sindre Walle Egeli|FW|19|70|80', 'Jack Clarke|FW|24|74',
        'George Hirst|FW|26|70', 'Chuba Akpom|FW|29|70', 'Ivan Azón|FW|22|70|76', 'Wes Burns|FW|30|70'] },
      { name: 'Southampton', short: 'SOU', color: '#D71920', rep: 68, div: 2, players: [
        'Gavin Bazunu|GK|23|70|75', 'Alex McCarthy|GK|35|66', 'Taylor Harwood-Bellis|DF|23|74|79', 'Jack Stephens|DF|31|70',
        'Ryan Manning|DF|29|71', 'Nathan Wood|DF|23|70', 'Ronnie Edwards|DF|22|70|77', 'Flynn Downes|MF|26|72',
        'Will Smallbone|MF|25|71', 'Shea Charles|MF|21|70|77', 'Finn Azaz|MF|25|72', 'Joe Aribo|MF|29|70',
        'Adam Armstrong|FW|28|73', 'Ross Stewart|FW|29|69', 'Cameron Archer|FW|23|71|76', 'Léo Scienza|FW|26|72',
        'Ryan Fraser|FW|31|68', 'Jay Robinson|FW|18|66|78'] },
      { name: 'Sheffield United', short: 'SHU', color: '#EE2737', rep: 67, div: 2, players: [
        'Michael Cooper|GK|25|70', 'Harrison Burrows|DF|23|70', 'Jack Robinson|DF|31|68', 'Japhet Tanganga|DF|26|70',
        'Gustavo Hamer|MF|27|73', 'Vinícius Souza|MF|26|72', 'Sydie Peck|MF|21|68|75', 'Callum O\'Hare|MF|27|70',
        'Tom Davies|MF|27|67', 'Tyrese Campbell|FW|25|70', 'Rhian Brewster|FW|25|66', 'Andre Brooks|FW|22|68|75'] },
      { name: 'Middlesbrough', short: 'MID', color: '#E11B22', rep: 66, div: 2, players: [
        'Sol Brynn|GK|24|68', 'Seny Dieng|GK|30|68', 'Dael Fry|DF|27|70', 'Rav van den Berg|DF|21|70|77',
        'Luke Ayling|DF|33|67', 'Alfie Jones|DF|28|69', 'Hayden Hackney|MF|23|72|78', 'Aidan Morris|MF|23|70',
        'Riley McGree|MF|26|70', 'Morgan Whittaker|FW|24|71', 'Delano Burgzorg|FW|26|69', 'Tommy Conway|FW|22|70|75'] },
      { name: 'Coventry City', short: 'COV', color: '#59CBE8', rep: 66, div: 2, players: [
        'Oliver Dovin|GK|22|68|75', 'Carl Rushworth|GK|23|68', 'Bobby Thomas|DF|24|69', 'Luis Binks|DF|24|68',
        'Milan van Ewijk|DF|25|70', 'Jay Dasilva|DF|27|69', 'Jake Bidwell|DF|32|66', 'Victor Torp|MF|26|70',
        'Ben Sheaf|MF|27|69', 'Jack Rudoni|MF|24|71', 'Matt Grimes|MF|30|70', 'Ephron Mason-Clark|FW|25|69',
        'Haji Wright|FW|27|72', 'Brandon Thomas-Asante|FW|26|69', 'Tatsuhiro Sakamoto|FW|28|69', 'Ellis Simms|FW|24|69'] },
      { name: 'West Bromwich Albion', short: 'WBA', color: '#122F67', rep: 65, div: 2, players: [
        'Josh Griffiths|GK|23|67', 'Kyle Bartley|DF|34|66', 'Torbjørn Heggem|DF|26|70', 'Jayson Molumby|MF|26|69',
        'Alex Mowatt|MF|30|68', 'Ousmane Diakité|MF|24|68', 'Isaac Price|MF|21|68|75', 'Karlan Grant|FW|27|68',
        'Josh Maja|FW|26|70', 'Mikey Johnston|FW|26|69', 'Jed Wallace|FW|31|68'] },
      { name: 'Norwich City', short: 'NOR', color: '#00A650', rep: 64, div: 2, players: [
        'Vladan Kovačević|GK|27|70', 'Shane Duffy|DF|33|67', 'Jack Stacey|DF|29|67', 'Kellen Fisher|DF|21|66|75',
        'Kenny McLean|MF|33|68', 'Anis Ben Slimane|MF|24|69', 'Emiliano Marcondes|MF|30|67', 'Ante Crnac|FW|21|70|77',
        'Josh Sargent|FW|25|73', 'Borja Sainz|FW|24|72', 'Oscar Schwartau|FW|18|66|78'] },
      { name: 'Birmingham City', short: 'BIR', color: '#1B3C8C', rep: 64, div: 2, players: [
        'Ryan Allsop|GK|33|64', 'James Beadle|GK|21|66|75', 'Christoph Klarer|DF|25|69', 'Alfons Sampsted|DF|27|66',
        'Phillip Neumann|DF|28|67', 'Tomoki Iwata|MF|28|69', 'Paik Seung-ho|MF|28|68', 'Krystian Bielik|MF|27|69',
        'Willum Þór Willumsson|MF|27|68', 'Kanya Fujimoto|MF|21|65|73', 'Jay Stansfield|FW|22|71|78', 'Marvin Ducksch|FW|31|69',
        'Demarai Gray|FW|29|70', 'Lyndon Dykes|FW|29|67', 'Kyogo Furuhashi|FW|30|69'] },
      { name: 'Bristol City', short: 'BRC', color: '#E31B23', rep: 63, div: 2, players: [
        'Max O\'Leary|GK|28|67', 'Radek Vítek|GK|21|67|76', 'Rob Dickie|DF|29|67', 'Zak Vyner|DF|28|68',
        'Ross McCrorie|DF|27|68', 'Cameron Pring|DF|27|66', 'Jason Knight|MF|24|70', 'Max Bird|MF|25|68',
        'Joe Williams|MF|28|66', 'Scott Twine|MF|26|69', 'Mark Sykes|MF|28|66', 'Anis Mehmeti|FW|24|70',
        'Sinclair Armstrong|FW|22|67|73', 'Nahki Wells|FW|35|65', 'Yu Hirakawa|FW|24|66'] },
      { name: 'Millwall', short: 'MIL', color: '#001D5E', rep: 62, div: 2, players: [
        'Lukas Jensen|GK|26|67', 'Jake Cooper|DF|30|68', 'Ryan Leonard|DF|33|64', 'Joe Bryan|DF|31|65',
        'Danny McNamara|DF|26|66', 'George Saville|MF|32|66', 'Casper De Norre|MF|28|67', 'Billy Mitchell|MF|24|67',
        'Femi Azeez|FW|24|68', 'Mihailo Ivanović|FW|21|67|74', 'Macaulay Langstaff|FW|28|66', 'Camiel Neghli|FW|24|67'] },
      { name: 'Hull City', short: 'HUL', color: '#F5A12D', rep: 62, div: 2, players: [
        'Ivor Pandur|GK|25|66', 'Ryan Giles|DF|25|67', 'Charlie Hughes|DF|21|66|74', 'Regan Slater|MF|25|66',
        'Kasey Palmer|MF|28|67', 'Matt Crooks|MF|31|66', 'Joe Gelhardt|FW|23|66|72', 'Oli McBurnie|FW|29|67',
        'Abu Kamara|FW|22|66|72'] },
      { name: 'Stoke City', short: 'STK', color: '#E03A3E', rep: 62, div: 2, players: [
        'Viktor Johansson|GK|26|68', 'Ben Wilmot|DF|26|68', 'Junior Tchamadeu|DF|21|66|74', 'Eric Bocat|DF|25|66',
        'Bae Jun-ho|MF|22|68|75', 'Lewis Baker|MF|30|67', 'Tatsuki Seko|MF|27|66', 'Million Manhoef|FW|23|69|75',
        'Sam Gallagher|FW|29|67', 'Tom Cannon|FW|22|67|74'] },
      { name: 'Swansea City', short: 'SWA', color: '#8A8D8F', rep: 61, div: 2, players: [
        'Lawrence Vigouroux|GK|31|67', 'Ben Cabango|DF|25|68', 'Harry Darling|DF|26|68', 'Josh Key|DF|25|66',
        'Josh Tymon|DF|26|67', 'Jay Fulton|MF|31|65', 'Gonçalo Franco|MF|24|67', 'Žan Vipotnik|FW|23|68',
        'Liam Cullen|FW|26|66', 'Ronald|FW|23|68', 'Eom Ji-sung|FW|23|66'] },
      { name: 'Watford', short: 'WAT', color: '#FBEE23', rep: 61, div: 2, players: [
        'Egil Selvik|GK|27|66', 'Mattie Pollock|DF|23|69|74', 'Ryan Porteous|DF|26|67', 'Imrân Louza|MF|26|70',
        'Edo Kayembe|MF|27|68', 'Moussa Sissoko|MF|35|67', 'Kwadwo Baah|FW|22|68|75', 'Rocco Vata|FW|20|66|74',
        'Vakoun Bayo|FW|28|66', 'Mamadou Doumbia|FW|19|64|74'] },
      { name: 'Blackburn Rovers', short: 'BLB', color: '#009EE0', rep: 61, div: 2, players: [
        'Aynsley Pears|GK|27|66', 'Balázs Tóth|GK|28|65', 'Hayden Carter|DF|25|67', 'Callum Brittain|DF|27|66',
        'Scott Wharton|DF|27|65', 'Sondre Tronstad|MF|30|67', 'Lewis Travis|MF|27|66', 'Todd Cantwell|MF|27|68',
        'Ryan Hedges|FW|30|66', 'Andreas Weimann|FW|34|64', 'Yuki Ohashi|FW|29|67', 'Makhtar Gueye|FW|27|66'] },
      { name: 'Preston North End', short: 'PNE', color: '#0D1B4C', rep: 61, div: 2, players: [
        'Daniel Iversen|GK|28|68', 'Jordan Storey|DF|28|66', 'Liam Lindsay|DF|29|65', 'Andrew Hughes|DF|33|64',
        'Ben Whiteman|MF|29|67', 'Ali McCann|MF|25|65', 'Mads Frøkjær-Jensen|MF|26|68', 'Milutin Osmajić|FW|26|68',
        'Will Keane|FW|32|64', 'Lewis Dobbin|FW|22|65|72'] },
      { name: 'Queens Park Rangers', short: 'QPR', color: '#1D5BA4', rep: 60, div: 2, players: [
        'Paul Nardi|GK|31|67', 'Jimmy Dunne|DF|27|67', 'Kenneth Paal|DF|28|67', 'Steve Cook|DF|34|64',
        'Jack Colback|MF|35|63', 'Sam Field|MF|27|65', 'Ilias Chair|MF|27|71', 'Paul Smyth|FW|27|66',
        'Karamoko Dembélé|FW|22|66|72', 'Rumarn Burrell|FW|24|64', 'Koki Saito|FW|24|67'] },
      { name: 'Derby County', short: 'DER', color: '#141414', rep: 60, div: 2, players: [
        'Jacob Widell Zetterström|GK|27|67', 'Curtis Nelson|DF|32|65', 'Sondre Langås|DF|24|66', 'Craig Forsyth|DF|36|62',
        'Ebou Adams|MF|29|65', 'David Ozoh|MF|20|64|74', 'Liam Thompson|MF|22|63', 'Jerry Yates|FW|28|65',
        'Kayden Jackson|FW|31|63', 'Carlton Morris|FW|29|67'] },
      { name: 'Wrexham', short: 'WRE', color: '#D71A28', rep: 60, div: 2, players: [
        'Danny Ward|GK|32|66', 'Max Cleworth|DF|22|64', 'Dominic Hyam|DF|29|67', 'Callum Doyle|DF|21|69|76',
        'Ryan Barnett|DF|25|64', 'Liberato Cacace|DF|24|67', 'George Thomason|MF|24|65', 'Ollie Rathbone|MF|28|66',
        'Elliot Lee|MF|30|64', 'Josh Windass|FW|31|67', 'Kieffer Moore|FW|33|68', 'Sam Smith|FW|27|64',
        'Nathan Broadhead|FW|27|67', 'Jay Rodriguez|FW|36|63'] },
      { name: 'Portsmouth', short: 'POR', color: '#001489', rep: 59, div: 2, players: [
        'Nicolas Schmid|GK|28|67', 'Conor Shaughnessy|DF|29|66', 'Regan Poole|DF|26|65', 'Connor Ogilvie|DF|29|64',
        'Marlon Pack|MF|34|66', 'Andre Dozzell|MF|26|65', 'Freddie Potts|MF|21|65|72', 'Josh Murphy|FW|30|67',
        'Callum Lang|FW|26|66', 'Colby Bishop|FW|28|66', 'Mark O\'Mahony|FW|20|63|72', 'Adrian Segečić|FW|21|65|74'] },
      { name: 'Oxford United', short: 'OXF', color: '#E8B400', rep: 58, div: 2, players: [
        'Jamie Cumming|GK|26|66', 'Elliott Moore|DF|28|64', 'Ciaron Brown|DF|27|65', 'Hidde ter Avest|DF|27|63',
        'Cameron Brannagan|MF|29|66', 'Tyler Goodrham|MF|21|64|72', 'Will Vaulks|MF|32|63', 'Przemysław Płacheta|FW|27|65',
        'Mark Harris|FW|26|64', 'Siriki Dembélé|FW|28|65', 'Will Lankshear|FW|20|64|74', 'Ole Romeny|FW|25|66'] },
      { name: 'Sheffield Wednesday', short: 'SHW', color: '#0E4DA4', rep: 57, div: 2, players: [
        'Pierce Charles|GK|20|64|74', 'Dominic Iorfa|DF|30|65', 'Max Lowe|DF|28|64', 'Barry Bannan|MF|35|66',
        'Svante Ingelsson|MF|27|65', 'Nathaniel Chalobah|MF|30|65', 'Michael Smith|FW|33|63', 'Bailey Cadamarteri|FW|20|63|72'] },
      { name: 'Charlton Athletic', short: 'CHA', color: '#D4021D', rep: 57, div: 2, players: [
        'Thomas Kaminski|GK|32|65', 'Lloyd Jones|DF|29|63', 'Macaulay Gillesphey|DF|29|63', 'Kayne Ramsay|DF|24|62',
        'Conor Coventry|MF|25|63', 'Greg Docherty|MF|28|64', 'Sonny Carey|MF|24|63', 'Luke Berry|MF|33|61',
        'Miles Leaburn|FW|21|64|72', 'Tyreece Campbell|FW|22|64|71', 'Isaac Olaofe|FW|25|63'] },
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
