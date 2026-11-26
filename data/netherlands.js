/* Real-football data pack: Netherlands (Eredivisie), start of the 2025/26 season.
 * Ages as of August 2025; ratings are editorial estimates. Format: "Name|POS|age|ovr|pot".
 * Many smaller clubs' lists are partial (or empty) and get topped up with generated players. */
(function (root) {
  'use strict';
  const C = (root.TM_COUNTRIES = root.TM_COUNTRIES || {});
  C.netherlands = {
    country: 'Netherlands',
    leagues: [{ key: 'NED1', name: 'Eredivisie', tier: 1 }],
    promotions: [],
    cup: 'KNVB Cup',
    clSlots: { NED1: 2 },
    clubs: [
      { name: 'PSV', short: 'PSV', color: '#ED1C24', rep: 78, league: 'NED1', players: [
        'Matěj Kovář|GK|25|75',
        'Ryan Flamingo|DF|22|75|80', 'Armando Obispo|DF|26|72', 'Sergiño Dest|DF|24|76', 'Mauro Júnior|DF|26|74',
        'Anass Salah-Eddine|DF|23|72', 'Kiliann Sildillia|DF|23|71',
        'Jerdy Schouten|MF|28|77', 'Joey Veerman|MF|26|78', 'Ismael Saibari|MF|24|78', 'Guus Til|MF|27|75',
        'Paul Wanner|MF|19|74|84',
        'Ivan Perišić|FW|36|74', 'Ricardo Pepi|FW|22|75|80', 'Couhaib Driouech|FW|23|74', 'Dennis Man|FW|27|75',
        'Ruben van Bommel|FW|20|72|80',
        'Esmir Bajraktarević|FW|20|72|82', 'Noah Fernandez|DF|17|66|80'] },
      { name: 'Ajax', short: 'AJX', color: '#D2122E', rep: 76, league: 'NED1', players: [
        'Vítězslav Jaroš|GK|24|74', 'Remko Pasveer|GK|41|68',
        'Josip Šutalo|DF|25|76', 'Youri Baas|DF|22|75|81', 'Lucas Rosa|DF|25|72', 'Anton Gaaei|DF|22|73',
        'Owen Wijndal|DF|25|71', 'Jorthy Mokio|DF|17|70|82',
        'Kenneth Taylor|MF|23|77|82', 'Youri Regeer|MF|21|72', 'Branco van den Boomen|MF|30|73', 'Davy Klaassen|MF|32|72',
        'Oscar Gloukh|MF|21|77|84',
        'Mika Godts|FW|20|75|83', 'Steven Berghuis|FW|33|74', 'Wout Weghorst|FW|32|73', 'Kasper Dolberg|FW|27|76',
        'Raúl Moro|FW|22|72'] },
      { name: 'Feyenoord', short: 'FEY', color: '#E1001A', rep: 77, league: 'NED1', players: [
        'Timon Wellenreuther|GK|29|76', 'Justin Bijlow|GK|27|76',
        'Gernot Trauner|DF|33|76', 'Thomas Beelen|DF|24|74', 'Jordan Lotomba|DF|26|74', 'Gijs Smal|DF|26|73',
        'Givairo Read|DF|19|72|82', 'Tsuyoshi Watanabe|DF|28|75', 'Jeyland Mitchell|DF|20|70|78',
        'Quinten Timber|MF|24|79', 'Hwang In-beom|MF|28|79', 'Jakub Moder|MF|26|74', 'Oussama Targhalline|MF|23|74',
        'Sem Steijn|MF|23|75|80', 'Calvin Stengs|MF|26|76', 'Luciano Valente|MF|21|74|80',
        'Anis Hadj Moussa|FW|23|77|82', 'Ayase Ueda|FW|26|75', 'Leo Sauer|FW|19|70|82', 'Gaoussou Diarra|FW|22|70',
        'Casper Tengstedt|FW|25|72'] },
      { name: 'AZ Alkmaar', short: 'AZ', color: '#DB0021', rep: 73, league: 'NED1', players: [
        'Rome-Jayden Owusu-Oduro|GK|21|72|80',
        'Alexandre Penetra|DF|24|73', 'Wouter Goes|DF|21|72|79', 'Seiya Maikuma|DF|27|73', 'Denso Kasius|DF|23|72',
        'Mees de Wit|DF|27|72', 'Maxim Dekker|DF|21|70|78',
        'Sven Mijnans|MF|25|76', 'Kees Smit|MF|19|75|86', 'Jordy Clasie|MF|34|73', 'Peer Koopmeiners|MF|25|72',
        'Troy Parrott|FW|23|75', 'Ibrahim Sadiq|FW|25|73', 'Mexx Meerdink|FW|22|71', 'Jayden Addai|FW|20|72|80',
        'Zico Buurmeester|MF|20|70|78'] },
      { name: 'FC Twente', short: 'TWE', color: '#E30613', rep: 72, league: 'NED1', players: [
        'Lars Unnerstall|GK|35|74', 'Przemysław Tytoń|GK|38|66',
        'Mees Hilgers|DF|24|74', 'Robin Pröpper|DF|31|72', 'Bart van Rooij|DF|23|72', 'Max Bruns|DF|22|72|78',
        'Michel Vlap|MF|28|74', 'Carel Eiting|MF|27|71', 'Thomas van den Belt|MF|24|71', 'Ramiz Zerrouki|MF|27|72',
        'Sam Lammers|FW|28|74', 'Daan Rots|FW|23|74', 'Mats Rots|DF|20|70|78', 'Ricky van Wolfswinkel|FW|36|68'] },
      { name: 'FC Utrecht', short: 'UTR', color: '#CC0000', rep: 71, league: 'NED1', players: [
        'Vasilis Barkas|GK|31|73',
        'Mike van der Hoorn|DF|32|71', 'Nick Viergever|DF|35|70', 'Siebe Horemans|DF|27|71', 'Souffian El Karouani|DF|24|74',
        'Niklas Vesterlund|DF|25|70', 'Mike Eerdhuijzen|DF|25|70',
        'Jens Toornstra|MF|36|70', 'Can Bozdoğan|MF|24|72', 'Victor Jensen|MF|25|72', 'Dani de Wit|MF|27|72',
        'Gjivai Zechiël|MF|20|70|78', 'Yoann Cathline|FW|23|72',
        'Sébastien Haller|FW|31|73', 'Miguel Rodríguez|FW|21|70|78', 'David Min|FW|26|70', 'Noah Ohio|FW|22|70'] },
      { name: 'NEC Nijmegen', short: 'NEC', color: '#1A7A3C', rep: 67, league: 'NED1', players: [
        'Stijn van Gassel|GK|29|69',
        'Philippe Sandler|DF|28|70', 'Iván Márquez|DF|31|69', 'Bram Nuytinck|DF|35|67', 'Brayann Pereira|DF|21|68',
        'Mees Hoedemakers|MF|27|70', 'Kodai Sano|MF|21|70|78', 'Dirk Proper|MF|23|70', 'Sami Ouaissa|FW|21|70|77',
        'Lasse Schöne|MF|39|66', 'Vito van Crooij|FW|29|70', 'Koki Ogawa|FW|28|70', 'Başar Önal|FW|21|68'] },
      { name: 'Go Ahead Eagles', short: 'GAE', color: '#E8A200', rep: 66, league: 'NED1', players: [
        'Jari De Busser|GK|26|70',
        'Mats Deijl|DF|28|70', 'Joris Kramer|DF|29|68', 'Gerrit Nauber|DF|33|67',
        'Evert Linthorst|MF|25|70', 'Jakob Breum|MF|22|70', 'Enric Llansana|MF|24|69', 'Calvin Twigt|MF|27|67',
        'Milan Smit|FW|23|70', 'Victor Edvardsen|FW|29|70'] },
      { name: 'Heerenveen', short: 'HEE', color: '#0057A6', rep: 65, league: 'NED1', players: [
        'Andries Noppert|GK|31|72',
        'Hristiyan Petrov|DF|25|68', 'Mats Köhlert|DF|27|69',
        'Luuk Brouwers|MF|27|70', 'Levi Smans|MF|22|69', 'Simon Olsson|MF|27|68',
        'Ilias Sebaoui|FW|21|70|77', 'Dylan Vente|FW|26|71', 'Jacob Trenskow|FW|25|69'] },
      { name: 'Sparta Rotterdam', short: 'SPA', color: '#C8102E', rep: 64, league: 'NED1', players: [
        'Nick Olij|GK|30|70',
        'Marvin Young|DF|21|68', 'Bart Vriends|DF|34|66', 'Saïd Bakari|DF|31|66', 'Shurandy Sambo|DF|24|67',
        'Patrick van Aanholt|DF|34|69',
        'Joshua Kitolano|MF|24|69', 'Julian Baas|MF|23|68', 'Pelle Clement|MF|29|68',
        'Tobias Lauritsen|FW|27|70', 'Charles-Andreas Brym|FW|27|68'] },
      { name: 'Fortuna Sittard', short: 'FOR', color: '#D9B300', rep: 63, league: 'NED1', players: [
        'Mattijs Branderhorst|GK|31|69',
        'Ivo Pinto|DF|35|66', 'Shawn Adewoye|DF|25|67', 'Syb van Ottele|DF|24|66',
        'Ezequiel Bullaude|MF|25|69', 'Alen Halilović|MF|29|68', 'Justin Lonwijk|MF|26|68', 'Mohamed Ihattaren|MF|23|70',
        'Kristoffer Peterson|FW|30|69', 'Kaj Sierhuis|FW|27|69'] },
      { name: 'FC Groningen', short: 'GRO', color: '#00A651', rep: 63, league: 'NED1', players: [
        'Etienne Vaessen|GK|30|70',
        'Marco Rente|DF|28|68', 'Thijmen Blokzijl|DF|20|67|75', 'Wouter Prins|DF|23|66', 'Marvin Peersman|DF|34|64',
        'Stije Resink|MF|22|68', 'Tika de Jonge|MF|25|67', 'Laros Duarte|MF|28|67',
        'Thom van Bergen|FW|21|69|77', 'Brynjólfur Willumsson|FW|24|69', 'Jorg Schreuders|FW|23|67'] },
      { name: 'PEC Zwolle', short: 'PEC', color: '#0072BC', rep: 61, league: 'NED1', players: [
        'Tom de Graaff|GK|21|67',
        'Anselmo García MacNulty|DF|22|66', 'Simon Graves|DF|26|66', 'Sherel Floranus|DF|27|67', 'Thomas Lam|DF|31|66',
        'Ryan Thomas|MF|30|69', 'Odysseus Velanas|MF|24|67', 'Kaj de Rooij|FW|24|66', 'Dylan Mbayo|FW|23|66'] },
      { name: 'Heracles Almelo', short: 'HER', color: '#1F1F1F', rep: 61, league: 'NED1', players: [
        'Fabian de Keijzer|GK|24|68',
        'Damon Mirani|DF|28|66', 'Ivan Mesík|DF|24|67', 'Mimeirhel Benita|DF|21|66', 'Jetro Willems|DF|31|67',
        'Brian De Keersmaecker|MF|25|68', 'Mario Engels|MF|32|68', 'Thomas Bruns|MF|33|67',
        'Jizz Hornkamp|FW|27|68', 'Luka Kulenović|FW|26|67'] },
      { name: 'NAC Breda', short: 'NAC', color: '#D4AF00', rep: 60, league: 'NED1', players: [
        'Daniel Bielica|GK|25|68',
        'Boy Kemper|DF|23|66', 'Jan Van den Bergh|DF|31|66', 'Leo Greiml|DF|24|67',
        'Fredrik Oldrup Jensen|MF|31|67', 'Clint Leemans|MF|30|67', 'Dominik Janošek|MF|26|67',
        'Sana Fernandes|FW|18|67|80', 'Kamal Sowah|FW|25|68', 'Elías Már Ómarsson|FW|26|66'] },
      { name: 'Excelsior', short: 'EXC', color: '#B5121B', rep: 58, league: 'NED1', players: [
        'Arthur Zagré|DF|24|64', 'Noah Naujoks|MF|23|64', 'Lewis Schouten|MF|23|63', 'Derensili Sanches Fernandes|FW|24|64'] },
      { name: 'FC Volendam', short: 'VOL', color: '#F26522', rep: 58, league: 'NED1', players: [
        'Yannick Leliendal|DF|24|64', 'Nordin Bukala|MF|22|63', 'Robert Mühren|FW|36|66', 'Henk Veerman|FW|34|65',
        'Brandley Kuwas|FW|33|64'] },
      { name: 'Telstar', short: 'TEL', color: '#00529F', rep: 57, league: 'NED1', players: [
        'Ronald Koeman Jr.|GK|30|64', 'Cedric Hatenboer|DF|27|62', 'Jeff Hardeveld|DF|30|62', 'Danny Bakker|MF|30|62',
        'Tyrese Noslin|FW|23|63'] },
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
