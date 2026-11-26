/* Real-football data pack: France (Ligue 1), start of the 2025/26 season.
 * Ages as of August 2025; ratings are editorial estimates. Format: "Name|POS|age|ovr|pot".
 * Smaller clubs' lists are partial and get topped up with generated players. */
(function (root) {
  'use strict';
  const C = (root.TM_COUNTRIES = root.TM_COUNTRIES || {});
  C.france = {
    country: 'France',
    leagues: [{ key: 'FRA1', name: 'Ligue 1', tier: 1 }],
    promotions: [],
    cup: 'Coupe de France',
    clSlots: { FRA1: 4 },
    clubs: [
      { name: 'Paris Saint-Germain', short: 'PSG', color: '#004170', rep: 90, league: 'FRA1', players: [
        'Lucas Chevalier|GK|23|82|87', 'Matvey Safonov|GK|26|78',
        'Marquinhos|DF|31|85', 'Willian Pacho|DF|23|83|86', 'Achraf Hakimi|DF|26|87', 'Nuno Mendes|DF|23|86|88',
        'Lucas Hernández|DF|29|80', 'Lucas Beraldo|DF|21|77|83', 'Illia Zabarnyi|DF|22|80|85',
        'Vitinha|MF|25|87', 'João Neves|MF|20|85|90', 'Fabián Ruiz|MF|29|83', 'Warren Zaïre-Emery|MF|19|80|87',
        'Lee Kang-in|MF|24|79', 'Senny Mayulu|MF|19|72|83',
        'Ousmane Dembélé|FW|28|89', 'Khvicha Kvaratskhelia|FW|24|87|89', 'Désiré Doué|FW|20|84|91', 'Bradley Barcola|FW|23|83|86',
        'Gonçalo Ramos|FW|24|79', 'Ibrahim Mbaye|FW|17|68|84'] },
      { name: 'Marseille', short: 'OM', color: '#2FAEE0', rep: 80, league: 'FRA1', players: [
        'Gerónimo Rulli|GK|33|81', 'Jeffrey de Lange|GK|27|70',
        'Leonardo Balerdi|DF|26|80', 'Nayef Aguerd|DF|29|78', 'Facundo Medina|DF|26|78', 'CJ Egan-Riley|DF|22|72|78',
        'Amir Murillo|DF|29|74', 'Ulisses Garcia|DF|29|72', 'Emerson Palmieri|DF|31|74', 'Benjamin Pavard|DF|29|81',
        'Pierre-Emile Højbjerg|MF|30|81', 'Geoffrey Kondogbia|MF|32|75', 'Arthur Vermeeren|MF|20|75|83', 'Angel Gomes|MF|24|78',
        'Bilal Nadir|MF|21|72|79', 'Matt O\'Riley|MF|24|78',
        'Mason Greenwood|FW|23|82|85', 'Pierre-Emerick Aubameyang|FW|36|78', 'Amine Gouiri|FW|25|79', 'Igor Paixão|FW|25|77',
        'Timothy Weah|FW|25|76', 'Neal Maupay|FW|29|72'] },
      { name: 'Monaco', short: 'ASM', color: '#E7202A', rep: 79, league: 'FRA1', players: [
        'Philipp Köhn|GK|27|77', 'Radosław Majecki|GK|26|73',
        'Thilo Kehrer|DF|28|78', 'Mohammed Salisu|DF|26|77', 'Eric Dier|DF|31|76', 'Vanderson|DF|24|79',
        'Caio Henrique|DF|28|76', 'Christian Mawissa|DF|20|72|80', 'Jordan Teze|DF|25|73', 'Kassoum Ouattara|DF|21|70',
        'Denis Zakaria|MF|28|80', 'Lamine Camara|MF|21|78|84', 'Aleksandr Golovin|MF|29|79', 'Maghnes Akliouche|MF|23|81|86',
        'Takumi Minamino|MF|30|78', 'Paul Pogba|MF|32|76', 'Mamadou Coulibaly|MF|21|72|79', 'Eliesse Ben Seghir|MF|20|77|85',
        'Folarin Balogun|FW|24|79', 'Ansu Fati|FW|22|74|80', 'Mika Biereth|FW|22|77|82', 'George Ilenikhena|FW|18|70|82'] },
      { name: 'Lille', short: 'LIL', color: '#E01E13', rep: 77, league: 'FRA1', players: [
        'Berke Özer|GK|25|76',
        'Aïssa Mandi|DF|33|74', 'Alexsandro Ribeiro|DF|26|79', 'Nathan Ngoy|DF|22|72|79', 'Thomas Meunier|DF|33|74',
        'Tiago Santos|DF|23|75', 'Romain Perraud|DF|28|74', 'Calvin Verdonk|DF|28|73',
        'Benjamin André|MF|35|76', 'Ngal\'ayel Mukau|MF|21|73|81', 'Ayyoub Bouaddi|MF|17|72|87', 'Nabil Bentaleb|MF|30|73',
        'Hákon Arnar Haraldsson|MF|22|79|84', 'Osame Sahraoui|FW|24|74', 'Matías Fernández-Pardo|FW|20|73|81',
        'Ethan Mbappé|MF|18|68|78', 'Olivier Giroud|FW|38|74', 'Hamza Igamane|FW|22|74|80', 'Félix Correia|FW|24|72'] },
      { name: 'Lyon', short: 'OL', color: '#1E3B85', rep: 77, league: 'FRA1', players: [
        'Dominik Greif|GK|28|75', 'Rémy Descamps|GK|29|70',
        'Moussa Niakhaté|DF|29|77', 'Clinton Mata|DF|32|74', 'Nicolás Tagliafico|DF|32|76', 'Ainsley Maitland-Niles|DF|27|73',
        'Abner Vinícius|DF|25|73', 'Ruben Kluivert|DF|24|72', 'Hans Hateboer|DF|31|70',
        'Corentin Tolisso|MF|31|77', 'Orel Mangala|MF|27|75', 'Tanner Tessmann|MF|23|74', 'Tyler Morton|MF|22|74|80',
        'Pavel Šulc|MF|24|75', 'Adam Karabec|MF|21|72|79', 'Khalis Merah|MF|19|66',
        'Malick Fofana|FW|20|78|86', 'Afonso Moreira|FW|20|72|80', 'Ernest Nuamah|FW|21|73|80', 'Martín Satriano|FW|24|73'] },
      { name: 'Nice', short: 'NIC', color: '#C40F2A', rep: 75, league: 'FRA1', players: [
        'Marcin Bułka|GK|25|79', 'Maxime Dupé|GK|32|68',
        'Dante|DF|41|70', 'Jonathan Clauss|DF|32|75', 'Melvin Bard|DF|24|75', 'Moïse Bombito|DF|25|76',
        'Antoine Mendy|DF|21|72', 'Youssouf Ndayishimiye|DF|26|74', 'Kojo Peprah Oppong|DF|21|70', 'Ali Abdi|DF|31|70',
        'Hicham Boudaoui|MF|25|75', 'Morgan Sanson|MF|31|73', 'Tom Louchet|MF|22|70', 'Charles Vanhoutte|MF|26|73',
        'Tanguy Ndombélé|MF|28|72', 'Sofiane Diop|FW|25|77', 'Jérémie Boga|FW|28|75',
        'Terem Moffi|FW|26|75', 'Mohamed-Ali Cho|FW|21|73|79', 'Kevin Carlos|FW|24|72'] },
      { name: 'Strasbourg', short: 'STR', color: '#0A4EA2', rep: 73, league: 'FRA1', players: [
        'Mike Penders|GK|20|72|82',
        'Guéla Doué|DF|23|75|80', 'Andrew Omobamidele|DF|23|73', 'Mamadou Sarr|DF|20|72|80', 'Ismaël Doukouré|DF|21|72|79',
        'Ben Chilwell|DF|28|74', 'Abakar Sylla|DF|22|70', 'Lucas Høgsberg|DF|19|68|78',
        'Félix Lemaréchal|MF|21|72|78', 'Valentín Barco|MF|21|74|80', 'Sebastian Nanasi|MF|23|74', 'Kendry Páez|MF|18|70|84',
        'Diego Moreira|FW|21|74|80', 'Julio Enciso|FW|21|74|80',
        'Emanuel Emegha|FW|22|76|82', 'Joaquín Panichelli|FW|22|70|78', 'Martial Godo|FW|22|70'] },
      { name: 'Lens', short: 'RCL', color: '#D9B300', rep: 73, league: 'FRA1', players: [
        'Robin Risser|GK|20|72|80',
        'Jonathan Gradit|DF|32|74', 'Malang Sarr|DF|26|72', 'Ruben Aguilar|DF|32|72', 'Deiver Machado|DF|32|72',
        'Samson Baidoo|DF|21|72|80', 'Ismaëlo Ganiou|DF|21|70|78',
        'Adrien Thomasson|MF|31|75', 'Mamadou Sangaré|MF|23|73', 'Saud Abdulhamid|DF|26|72', 'Florian Sotoca|MF|35|72',
        'Florian Thauvin|FW|32|77', 'Allan Saint-Maximin|FW|28|75', 'Wesley Saïd|FW|30|72', 'Odsonne Édouard|FW|27|74'] },
      { name: 'Rennes', short: 'REN', color: '#E13327', rep: 73, league: 'FRA1', players: [
        'Brice Samba|GK|31|79',
        'Anthony Rouault|DF|24|73', 'Jérémy Jacquet|DF|20|71|80', 'Lilian Brassier|DF|25|72', 'Alidu Seidu|DF|25|72',
        'Quentin Merlin|DF|23|73', 'Abdelhamid Aït Boudlal|DF|19|68|78',
        'Seko Fofana|MF|30|76', 'Valentin Rongier|MF|30|76', 'Djaoui Cissé|MF|21|71|79', 'Mahamadou Nagida|DF|20|70|79',
        'Ludovic Blas|MF|27|75', 'Mousa Al-Tamari|FW|28|75',
        'Esteban Lepaul|FW|25|74', 'Breel Embolo|FW|28|75'] },
      { name: 'Brest', short: 'SB29', color: '#E30613', rep: 70, league: 'FRA1', players: [
        'Grégoire Coudert|GK|26|70',
        'Brendan Chardonnet|DF|30|72', 'Bradley Locko|DF|23|72', 'Kenny Lala|DF|34|71', 'Soumaïla Coulibaly|DF|21|71|78',
        'Julien Le Cardinal|DF|28|70',
        'Hugo Magnetti|MF|27|72', 'Pierre Lees-Melou|MF|32|73', 'Mahdi Camara|MF|27|74', 'Kamory Doumbia|MF|22|71|78',
        'Romain Del Castillo|FW|29|74', 'Mama Baldé|FW|29|72', 'Junior Dina Ebimbe|MF|24|72', 'Ludovic Ajorque|FW|31|72'] },
      { name: 'Toulouse', short: 'TFC', color: '#5B2C83', rep: 69, league: 'FRA1', players: [
        'Guillaume Restes|GK|20|74|82',
        'Rasmus Nicolaisen|DF|28|73', 'Charlie Cresswell|DF|22|73|79', 'Mark McKenzie|DF|26|73', 'Warren Kamanzi|DF|24|71',
        'Djibril Sidibé|DF|33|70',
        'Vincent Sierro|MF|30|74', 'Cristian Cásseres Jr.|MF|25|74', 'Yann Gboho|MF|24|73', 'Aron Dønnum|FW|27|73',
        'Santiago Hidalgo|FW|20|70|78', 'Frank Magri|FW|25|72', 'Joshua King|FW|33|69', 'Zakaria Aboukhlal|FW|25|73'] },
      { name: 'Nantes', short: 'FCN', color: '#D9B500', rep: 66, league: 'FRA1', players: [
        'Anthony Lopes|GK|34|74',
        'Nicolas Pallois|DF|37|70', 'Chidozie Awaziem|DF|28|70', 'Kelvin Amian|DF|27|70', 'Nicolas Cozza|DF|26|69',
        'Tylel Tati|DF|20|68|76', 'Uroš Radaković|DF|31|70',
        'Johann Lepenant|MF|22|72|78', 'Pedro Chirivella|MF|28|71', 'Francis Coquelin|MF|34|70', 'Louis Leroux|MF|20|68',
        'Ignatius Ganago|FW|26|70', 'Matthis Abline|FW|22|73|79', 'Mostafa Mohamed|FW|27|73', 'Bahereba Guirassy|FW|19|66',
        'Yassine Benhattab|FW|22|68'] },
      { name: 'Auxerre', short: 'AJA', color: '#003A7D', rep: 64, league: 'FRA1', players: [
        'Donovan Léon|GK|33|72',
        'Jubal|DF|31|70', 'Gabriel Osho|DF|27|70', 'Clément Akpa|DF|24|69', 'Paul Joly|DF|25|69', 'Fredrik Oppegård|DF|23|69',
        'Kévin Danois|MF|21|69', 'Elisha Owusu|MF|27|71', 'Han-Noël Massey|MF|21|68', 'Lassine Sinayoko|FW|25|73',
        'Josué Casimir|FW|23|71', 'Lasso Coulibaly|MF|23|69'] },
      { name: 'Paris FC', short: 'PFC', color: '#002E5D', rep: 63, league: 'FRA1', players: [
        'Kevin Trapp|GK|35|76', 'Obed Nkambadio|GK|22|70',
        'Moustapha Mbow|DF|25|70', 'Tuomas Ollila|DF|25|69', 'Thibault De Smet|DF|27|68', 'Samir Chergui|DF|26|67',
        'Otávio|DF|31|72', 'Nhoa Sangui|DF|19|68|78',
        'Maxime Lopez|MF|27|74', 'Julien López|MF|33|68', 'Pierre-Yves Hamel|FW|31|68', 'Ilan Kebbal|MF|27|73',
        'Jean-Philippe Krasso|FW|28|70', 'Willem Geubbels|FW|23|70', 'Alimami Gory|FW|29|69'] },
      { name: 'Angers', short: 'SCO', color: '#2A2A2A', rep: 62, league: 'FRA1', players: [
        'Hervé Koffi|GK|28|70', 'Yahia Fofana|GK|24|72',
        'Jordan Lefort|DF|31|69', 'Carlens Arcus|DF|28|68', 'Emmanuel Biumla|DF|27|67', 'Florent Hanin|DF|35|66',
        'Ousmane Camara|DF|22|68',
        'Haris Belkebla|MF|31|69', 'Himad Abdelli|MF|25|71', 'Pierrick Capelle|MF|38|66', 'Jacques Ekomié|DF|21|66',
        'Lilian Raolisoa|FW|25|67', 'Sidiki Chérif|FW|18|70|82'] },
      { name: 'Le Havre', short: 'HAC', color: '#5CA8D8', rep: 62, league: 'FRA1', players: [
        'Arthur Desmas|GK|30|69',
        'Gautier Lloris|DF|30|68', 'Étienne Youté Kinkoué|DF|23|68', 'Arouna Sangante|DF|23|68', 'Loïc Nego|DF|34|68',
        'Christopher Opéri|DF|28|67', 'Yanis Zouaoui|DF|21|66',
        'Abdoulaye Touré|MF|31|70', 'Yassine Kechta|MF|23|70', 'Rassoul Ndiaye|MF|23|69', 'Simon Ebonog|MF|21|66',
        'Issa Soumaré|FW|25|68', 'André Ayew|FW|35|68'] },
      { name: 'Lorient', short: 'FCL', color: '#F7911E', rep: 61, league: 'FRA1', players: [
        'Yvon Mvogo|GK|31|72',
        'Bamo Meïté|DF|23|68', 'Montassar Talbi|DF|27|71', 'Igor Silva|DF|28|68', 'Darlin Yongwa|DF|25|68',
        'Nathaniel Adjei|DF|22|69', 'Panos Katseris|DF|24|68',
        'Laurent Abergel|MF|32|70', 'Jean-Victor Makengo|MF|26|69', 'Arthur Avom|MF|21|68', 'Théo Le Bris|FW|23|70',
        'Joel Mvuka|FW|22|69', 'Mohamed Bamba|FW|23|70', 'Tosin Aiyegun|FW|27|69', 'Pablo Pagis|FW|22|69'] },
      { name: 'Metz', short: 'FCM', color: '#7B1C2E', rep: 61, league: 'FRA1', players: [
        'Pape Sy|GK|20|66',
        'Sadibou Sané|DF|20|68|76', 'Koffi Kouao|DF|27|68', 'Fodé Ballo-Touré|DF|28|69', 'Ismaël Traoré|DF|39|64',
        'Maxime Colin|DF|33|66', 'Urie-Michel Mboula|DF|21|66',
        'Jessy Deminguet|MF|27|69', 'Boubacar Traoré|MF|23|69', 'Gauthier Hein|MF|28|70', 'Alpha Touré|MF|21|66',
        'Habib Diallo|FW|30|72', 'Cheikh Sabaly|FW|26|69', 'Giorgi Tsitaishvili|FW|24|70', 'Ablie Jallow|FW|26|68'] },
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
