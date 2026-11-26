/* Real-football data pack: Portugal (Primeira Liga), start of the 2025/26 season.
 * Ages as of August 2025; ratings are editorial estimates. Format: "Name|POS|age|ovr|pot".
 * Many smaller clubs' lists are partial (or empty) and get topped up with generated players. */
(function (root) {
  'use strict';
  const C = (root.TM_COUNTRIES = root.TM_COUNTRIES || {});
  C.portugal = {
    country: 'Portugal',
    leagues: [{ key: 'POR1', name: 'Primeira Liga', tier: 1 }],
    promotions: [],
    cup: 'Taça de Portugal',
    clSlots: { POR1: 2 },
    clubs: [
      { name: 'Benfica', short: 'SLB', color: '#E83030', rep: 81, league: 'POR1', players: [
        'Anatoliy Trubin|GK|24|81', 'Samuel Soares|GK|23|70',
        'Nicolás Otamendi|DF|37|78', 'António Silva|DF|21|79|84', 'Tomás Araújo|DF|23|77|82', 'Amar Dedić|DF|22|76|81',
        'Samuel Dahl|DF|22|74',
        'Fredrik Aursnes|MF|29|79', 'Leandro Barreiro|MF|25|75', 'Enzo Barrenechea|MF|24|76', 'Richard Ríos|MF|25|78',
        'Georgiy Sudakov|MF|22|78|83',
        'Dodi Lukébakio|FW|27|78', 'Vangelis Pavlidis|FW|26|80', 'Andreas Schjelderup|FW|21|74|81', 'Franjo Ivanović|FW|22|74',
        'Gianluca Prestianni|FW|19|72|82',
        'Bruma|FW|30|75', 'Tiago Gouveia|FW|24|72'] },
      { name: 'Sporting CP', short: 'SCP', color: '#008057', rep: 80, league: 'POR1', players: [
        'Rui Silva|GK|31|78',
        'Gonçalo Inácio|DF|24|81', 'Ousmane Diomande|DF|21|80|86', 'Eduardo Quaresma|DF|23|76', 'Zeno Debast|DF|21|77|82',
        'Iván Fresneda|DF|20|72|79', 'Maximiliano Araújo|DF|25|77',
        'Morten Hjulmand|MF|26|81', 'Hidemasa Morita|MF|30|77', 'Daniel Bragança|MF|26|76', 'Pedro Gonçalves|MF|27|79',
        'Giorgi Kochorashvili|MF|26|74', 'João Simões|MF|18|70|82',
        'Geovany Quenda|FW|18|76|87', 'Francisco Trincão|FW|25|79', 'Luis Suárez|FW|28|78', 'Fotis Ioannidis|FW|25|76',
        'Geny Catamo|FW|24|75',
        'Matheus Reis|DF|30|74'] },
      { name: 'FC Porto', short: 'FCP', color: '#00428C', rep: 80, league: 'POR1', players: [
        'Diogo Costa|GK|25|84', 'Cláudio Ramos|GK|33|72',
        'Jan Bednarek|DF|29|75', 'Jakub Kiwior|DF|25|78', 'Nehuén Pérez|DF|25|75', 'Alberto Costa|DF|22|75|81',
        'Martim Fernandes|DF|19|74|84', 'Francisco Moura|DF|26|76', 'Zaidu Sanusi|DF|28|72', 'Dominik Prpić|DF|21|70|78',
        'Alan Varela|MF|24|79', 'Victor Froholdt|MF|19|75|86', 'Gabri Veiga|MF|23|79|84', 'Pablo Rosario|MF|28|74',
        'Stephen Eustáquio|MF|28|77', 'Rodrigo Mora|MF|18|77|89',
        'Pepê|FW|28|78', 'Borja Sainz|FW|24|74', 'William Gomes|FW|19|74|84',
        'Samu Aghehowa|FW|21|80|86', 'Luuk de Jong|FW|34|75', 'Deniz Gül|FW|21|72|80'] },
      { name: 'Braga', short: 'SCB', color: '#E30613', rep: 75, league: 'POR1', players: [
        'Lukáš Horníček|GK|23|74|80',
        'Paulo Oliveira|DF|33|73', 'Robson Bambu|DF|28|72', 'Sikou Niakaté|DF|26|73', 'Víctor Gómez|DF|25|74',
        'Bright Arrey-Mbi|DF|22|72|78',
        'João Moutinho|MF|38|74', 'Vítor Carvalho|MF|28|73', 'Florian Grillitsch|MF|30|74', 'Ricardo Horta|MF|30|79',
        'Rodrigo Zalazar|MF|26|78', 'Jean-Baptiste Gorby|MF|23|72',
        'Gabri Martínez|FW|22|74|80', 'Amine El Ouazzani|FW|24|73', 'Pau Víctor|FW|23|74|80', 'Fran Navarro|FW|27|73'] },
      { name: 'Vitória SC', short: 'VSC', color: '#1F1F1F', rep: 70, league: 'POR1', players: [
        'Bruno Varela|GK|30|73',
        'Toni Borevković|DF|28|71', 'Ricardo Mangas|DF|27|71', 'Miguel Maga|DF|23|70', 'Bruno Gaspar|DF|32|69',
        'Tiago Silva|MF|32|72', 'Oumar Camara|MF|22|70',
        'Nuno Santos|FW|30|72', 'Gustavo Silva|FW|28|71', 'Nélson Oliveira|FW|33|69', 'João Mendes|FW|22|70'] },
      { name: 'Santa Clara', short: 'CDSC', color: '#C8102E', rep: 66, league: 'POR1', players: [
        'Gabriel Batista|GK|27|70',
        'Sidney Lima|DF|26|68', 'Luís Rocha|DF|32|67', 'Paulo Victor|DF|28|67',
        'Adriano Firmino|MF|28|68', 'Serginho|MF|30|68', 'Pedro Ferreira|MF|29|66',
        'Gabriel Silva|FW|23|70', 'Vinícius Lopes|FW|26|68'] },
      { name: 'Famalicão', short: 'FAM', color: '#1B3C8C', rep: 66, league: 'POR1', players: [
        'Lazar Carević|GK|26|70',
        'Justin de Haas|DF|25|69', 'Rodrigo Pinheiro|DF|24|68',
        'Gustavo Sá|MF|21|72|80', 'Mathias de Amorim|MF|24|69', 'Zaydou Youssouf|MF|26|70',
        'Óscar Aranda|FW|23|70', 'Sorriso|FW|24|69', 'Gil Dias|FW|28|69'] },
      { name: 'Estoril Praia', short: 'EST', color: '#E0B000', rep: 65, league: 'POR1', players: [
        'Joel Robles|GK|35|70',
        'Pedro Amaral|DF|27|68', 'Ferro|DF|28|68', 'Kévin Boma|DF|22|68', 'Wagner Pina|DF|23|67',
        'Jordan Holsgrove|MF|26|69', 'Rafik Guitane|MF|26|71', 'João Carvalho|MF|28|70',
        'Yanis Begraoui|FW|24|70', 'Alejandro Marqués|FW|25|68'] },
      { name: 'Casa Pia', short: 'CPA', color: '#1E1E1E', rep: 62, league: 'POR1', players: [
        'Patrick Sequeira|GK|26|68', 'Gaizka Larrazabal|DF|27|66', 'José Fonte|DF|41|66', 'Abdu Conté|DF|27|66',
        'Rafael Brito|MF|23|67', 'Andrian Kraev|MF|26|66', 'Cassiano|FW|36|64'] },
      { name: 'Gil Vicente', short: 'GIL', color: '#C8102E', rep: 62, league: 'POR1', players: [
        'Andrew|GK|24|69', 'Zé Carlos|DF|30|66', 'Jonathan Buatu|DF|32|66', 'Pablo|FW|26|68', 'Agustín Moreno|FW|27|67'] },
      { name: 'Moreirense', short: 'MOR', color: '#00843D', rep: 62, league: 'POR1', players: [
        'Kewin Silva|GK|26|67', 'Gilberto Batista|DF|21|66', 'Alanzinho|FW|26|67', 'Guilherme Schettine|FW|29|67',
        'Kiko Bondoso|FW|29|67'] },
      { name: 'Rio Ave', short: 'RAV', color: '#0E7A3B', rep: 62, league: 'POR1', players: [
        'Cezary Miszta|GK|23|68', 'Clayton|FW|26|69', 'Marios Vrousai|FW|27|68'] },
      { name: 'Arouca', short: 'ARO', color: '#E2B800', rep: 61, league: 'POR1', players: [
        'Nico Mantl|GK|25|68', 'José Fontán|DF|25|67', 'Tiago Esgaio|DF|30|66', 'David Simão|MF|35|66', 'Jason|MF|31|67',
        'Alfonso Trezza|FW|26|67', 'Ivo Rodrigues|FW|30|66'] },
      { name: 'Nacional', short: 'CDN', color: '#2A2A2A', rep: 60, league: 'POR1', players: [
        'Lucas França|GK|29|67', 'Zé Vítor|DF|27|66', 'Jesús Ramírez|FW|27|67', 'Paulinho Bóia|FW|27|66'] },
      { name: 'Estrela da Amadora', short: 'EAM', color: '#C8102E', rep: 60, league: 'POR1', players: [
        'Bruno Brígido|GK|30|66', 'Jovane Cabral|FW|27|67', 'Rodrigo Pinho|FW|34|65'] },
      { name: 'AVS', short: 'AVS', color: '#B5121B', rep: 58, league: 'POR1', players: [
        'Guillermo Ochoa|GK|40|69'] },
      { name: 'Alverca', short: 'ALV', color: '#D2001F', rep: 58, league: 'POR1', players: [] },
      { name: 'Tondela', short: 'TON', color: '#0B7B3E', rep: 57, league: 'POR1', players: [] },
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
