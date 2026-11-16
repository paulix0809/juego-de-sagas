/* Star Wars · edición fan no oficial del juego de sagas.
   Mismas reglas que el juego base; aquí van los nombres, las cartas, los personajes, los textos,
   los colores y las piezas 3D. Sin logos, imágenes, música ni tipografías oficiales. */
import { makeToken, makeBuilding, makeProp, icon } from './piezas.js?v=1116a';
import { buildWorld } from './mundo.js?v=1116a';

const thousands = n => String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const money = k => {
  k = Math.round(k);
  const a = Math.abs(k), s = k < 0 ? '−' : '';
  if (a >= 1000) return s + (a / 1000).toFixed(2).replace(/0$/, '').replace(/\.0$/, '').replace('.', ',') + 'M cr';
  return s + a + 'K cr';
};
const score = n => thousands(n);
const mult = b => String(b).replace('.', ',');

export default {
  id: 'starwars',
  money, score,
  stages: ['Puesto', 'Base', 'Fortaleza'],
  ages: ['La República', 'Las Guerras Clon', 'El Imperio', 'La Rebelión', 'La Estrella de la Muerte'],
  confetti: ['#FFE81F', '#ECE8DC', '#7FC8FF', '#FF4F4F'],

  /* the four characters: name on the cards, short name on the tiles, colour, 3D piece and how the AI plays */
  roster: [
    { name: 'Darth Vader', short: 'VADER', color: '#FF4F4F', shape: 'vader', persona: 'bigname', blurb: 'Solo quiere los mundos más caros.' },
    { name: 'Darth Maul', short: 'MAUL', color: '#FF9B3D', shape: 'maul', persona: 'spray', blurb: 'Lo conquista todo. No construye nada.' },
    { name: 'Luke Skywalker', short: 'LUKE', color: '#3FA2FF', shape: 'luke', persona: 'intern', blurb: 'Granjero de Tatooine. Impredecible.' },
    { name: 'Yoda', short: 'YODA', color: '#67D483', shape: 'yoda', persona: 'smart', blurb: 'Paciente es. Hasta la fortaleza construye.' }
  ],

  rules: {
    money,
    tiles: [
      'Hiperespacio',
      'Jakku', 'Tatooine', 'Transmisión', 'Dagobah',
      { name: 'Halcón Milenario', icon: 'falcon' },
      'Hoth', 'Yavin 4', 'Holocrón', 'Endor',
      'Carbonita',
      'Kashyyyk', 'Scarif', { name: 'Ala-X', icon: 'xwing' }, 'Bespin',
      'Transmisión',
      'Geonosis', 'Kamino', { name: 'Caza TIE', icon: 'tie' }, 'Naboo',
      'Impuesto imperial',
      'Moraband', 'Mustafar', 'Holocrón', 'Exegol',
      { name: 'Destructor Estelar', icon: 'destroyer' },
      'Corellia', 'Transmisión', 'Alderaan', 'Coruscant'
    ],
    sectors: {
      materials: { name: 'Borde Exterior', color: '#E2C08D' },
      robotics: { name: 'Bases rebeldes', color: '#A9D8EE' },
      lab: { name: 'Rutas comerciales', color: '#5FC3A8' },
      saas: { name: 'Guerras Clon', color: '#93A4F5' },
      health: { name: 'Mundos Sith', color: '#B678E6' },
      security: { name: 'Núcleo Galáctico', color: '#F3D36B' }
    },
    /* same order and the same effects as the base game's signal cards */
    signals: [
      { title: 'Un sistema pide protección', text: 'Un planeta del Borde Exterior se ha quedado sin escudos. Necesitan a alguien ya, y saben tu nombre.', effect: '+200 de poder' },
      { title: 'Botín de los Hutt', text: 'Jabba paga bien por un trabajo bien hecho. Y hoy le has caído en gracia.', effect: '+150K cr' },
      { title: 'Los droides no eran estos', text: 'Compras un lote de droides de segunda mano. La mitad solo habla bocce.', effect: '−80K cr' },
      { title: 'Carrera de vainas', text: 'Organizas la gran carrera del año. Todos los rivales pagan la entrada.', effect: 'Cada rival te paga 40K cr' },
      { title: 'Cazarrecompensas', text: 'Alguien ha puesto precio a tu cabeza. Quitártelo de encima sale caro.', effect: '−60K cr' },
      { title: 'Salto a la velocidad de la luz', text: '¡Agárrate! Las estrellas se estiran y apareces más lejos.', effect: 'Avanza 3 casillas' },
      { title: 'Tengo un mal presentimiento', text: 'Era una trampa. Te congelan en carbonita antes de que puedas decir nada.', effect: 'Directo a la Carbonita' },
      { title: 'Un contrabandista vuelve', text: 'Solo había venido a cobrar, pero aparece en el último momento para ayudarte.', effect: '+250 de poder' },
      { title: 'El hiperimpulsor falla', text: '¡No es culpa mía! Llegas tarde a la cita con la flota.', effect: '−150 de poder' },
      { title: 'Eres mi única esperanza', text: 'Un mensaje grabado en un droide. Y viene con recursos.', effect: '+50K cr y +150 de poder' },
      { title: 'La ruta de Kessel', text: 'Una ruta de contrabando que solo tú conoces. Cada planeta tuyo saca tajada.', effect: '+30K cr por cada planeta tuyo' },
      { title: 'Revisión de la flota', text: 'Todos los cazas piden mantenimiento la misma semana. Cómo no.', effect: 'Pagas 15K cr por cada nivel construido' },
      { title: 'Ruta despejada', text: 'El navicomputador marca un salto directo a casa.', effect: 'Ve al Hiperespacio y cobra' },
      { title: 'Los planos robados', text: 'Los espías han encontrado un objetivo sin dueño. Ve antes que nadie.', effect: 'Avanza al siguiente planeta o nave libre' },
      { title: 'Escuadrón Rojo, al ataque', text: 'Todos los pilotos a sus puestos. Cada nave tuya suma.', effect: '+100 de poder y +100 por cada nave tuya' },
      { title: 'Alguien tocó un botón', text: 'Nadie sabe cuál. Nadie quiere saberlo. Toca pagar los daños.', effect: '−40K cr' }
    ],
    perks: {
      fee: { short: 'Miedo', title: 'Miedo al lado oscuro', text: 'Los peajes que cobras son un 25 % más altos.' },
      cheap: { short: 'Ingenieros', title: 'Ingenieros de Bespin', text: 'Construir te cuesta un 25 % menos.' },
      kick: { short: 'Alianza', title: 'Apoyo de la Alianza', text: '+60K cr extra cada vez que pasas por el Hiperespacio.' },
      shield: { short: 'Escudo', title: 'Escudo deflector', text: 'Te libras una vez de la Carbonita.' },
      pipe: { short: 'La Fuerza', title: 'Usa la Fuerza', text: 'Todo el poder que ganas es un 25 % mayor.' },
      discount: { short: 'Truco Jedi', title: 'Truco mental Jedi', text: 'Los planetas te cuestan un 15 % menos.' },
      armor: { short: 'Beskar', title: 'Armadura de beskar', text: 'Los peajes que pagas son un 25 % más bajos.' }
    },
    perkCardText: 'Lo aprendes en el holocrón y te acompaña el resto de la partida.',
    brainsExtra: [
      { title: 'Siempre en movimiento está el futuro', text: 'Pero hoy lo ves claro.', effect: '+300 de poder' },
      { title: 'Entrenamiento con el maestro', text: 'Una lección, aplicada en todos tus mundos a la vez.', effect: '+100 de poder por cada planeta tuyo' }
    ]
  },

  fontsHref: 'https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;500;700;800;900&family=Exo+2:wght@500;600;700;800;900&display=swap',
  css: {
    '--bg': '#03050B', '--bg-rgb': '3,5,11', '--panel-rgb': '9,12,22', '--card': '#0A0E1A',
    '--text': '#ECE8DC', '--text-2': 'rgba(236,232,220,.82)', '--text-3': 'rgba(236,232,220,.58)', '--line': 'rgba(236,232,220,.14)',
    '--accent': '#FFE81F', '--accent-2': '#FFE81F', '--soft': '#7FC8FF', '--soft-2': '#CDEBFF', '--bad': '#FF5A4E',
    '--cta-a': '#FFF27A', '--cta-b': '#E8C300', '--cta-ink': '#110E00', '--cta-glow': '232,195,0',
    '--band-signal': '#13284A', '--band-signal-ink': '#9FDBFF', '--band-brain': '#0F3346', '--band-brain-ink': '#9FE0FF',
    '--display': '"Libre Franklin", system-ui, sans-serif', '--num': '"Exo 2", "Libre Franklin", system-ui, sans-serif', '--sans': '"Libre Franklin", system-ui, sans-serif',
    '--h1-case': 'uppercase', '--h1-weight': '900', '--h1-track': '.01em', '--h2-weight': '800', '--kicker': '#4BD5EE'
  },

  sfx: ({ tone, noise }) => ({
    build: () => { noise(0.22, 0.07, 0, 300); tone(98, 0.5, 'sawtooth', 0.05, 0, 30); tone(147, 0.5, 'sawtooth', 0.03, 0.02, -15); },
    turn: () => { tone(220, 0.25, 'sawtooth', 0.025, 0, 20); tone(110, 0.3, 'sine', 0.05); },
    spam: () => { tone(160, 0.5, 'square', 0.035, 0, -110); noise(0.3, 0.05, 0.05, 2000); }
  }),

  T: {
    docTitle: 'Star Wars · Juego de sagas (edición fan)',
    brand: 'STAR WARS <small>Edición fan</small>',
    kicker: 'Hace mucho tiempo, en una galaxia muy, muy lejana…',
    h1: 'STAR WARS<em>La conquista de la galaxia</em>', h1Class: 'logo-type',
    lead: 'Treinta casillas alrededor de un planeta desierto con dos soles. Conquista planetas, conviértelos en fortalezas y llega a 5.000 de poder antes que el resto.',
    how: [
      ['Tira y muévete', 'Cae en un planeta libre y conquístalo antes que nadie.'],
      ['Puesto → Base → Fortaleza', 'Mejora tus planetas: cada nivel sube el peaje y el poder que ganas.'],
      ['Domina el sector', 'Con los tres planetas de un sector, todo vale ×1,5.'],
      ['Transmisiones y holocrones', 'Las transmisiones sacuden la partida. Los holocrones te enseñan para siempre.']
    ],
    startBtn: 'Empezar la conquista',
    startFine: 'Una partida dura unos diez minutos. Arrastra para girar el tablero y usa la rueda para acercarte.',
    fan: 'Edición fan no oficial, hecha por diversión y sin ánimo de lucro. Star Wars y sus personajes pertenecen a Lucasfilm Ltd. y a The Walt Disney Company; este juego no está relacionado con ellos ni cuenta con su aprobación.',
    goal: s => `Primero en llegar a <b>${s}</b> de poder`,
    round: (r, m) => `Ronda ${r} / ${m}`,
    age: a => a,
    ageToast: a => `La galaxia entra en una nueva era: <b>${a}</b>.`,
    ageLog: (n, a) => `${n} lleva la galaxia a <b>${a}</b>.`,
    mineTitle: 'Tus dominios', mineOther: n => `Dominios de ${n}`,
    mineEmpty: 'Aún no has conquistado nada. Cae en un planeta libre y quédatelo.',
    logTitle: 'Diario de a bordo', roll: 'Tirar dados',
    you: 'tú', human: 'humano', tagOut: 'Fuera', tagSkip: 'Congelado',
    pipeOf: s => `de ${s} de poder`, budget: 'Créditos',
    count: (n, k) => k === 'market' ? `${n} planeta${n === 1 ? '' : 's'}` : `${n} nave${n === 1 ? '' : 's'}`,
    channelWord: 'Nave', channelLine: f => `Nave · peaje ${f}`, stageLine: (st, f) => `${st} · peaje ${f}`,
    th: ['Nivel', 'Peaje que cobras', 'Poder que ganas'], sectorWord: 'Sector', setNote: b => `Con los tres planetas, peajes y poder ×${mult(b)}.`,
    chTh: ['Naves tuyas', 'Peaje', 'Poder'], chNote: 'Cuantas más naves tengas, más vale cada una.',
    close: 'Cerrar', ok: 'Vale', skip: 'Pasar', notNow: 'Ahora no',
    buy: p => `Conquistar · ${p}`, buyFine: (b, s) => `Tienes ${b}. Conquistar ya te da ${s} de poder.`,
    upgradeBtn: (st, c) => `Subir a ${st} · ${c}`, haveFine: b => `Tienes ${b}.`,
    deckHead: { signal: 'Transmisión', brain: 'Holocrón · lección aprendida' },
    logDraw: (n, t) => `${n} saca <b>${t}</b>.`,
    floatScore: s => `${s} poder`,
    logGiveUp: (n, t) => `${n} abandona <b>${t}</b>.`, logMap: (n, t) => `${n} conquista <b>${t}</b>.`,
    logScaleBack: (n, t, st) => `${n} rebaja <b>${t}</b> a ${st}.`, logUpgrade: (n, t, st) => `${n} convierte <b>${t}</b> en ${st}.`,
    setToast: (n, s, b) => `<b>${n}</b> domina todo el sector ${s}. Peajes y poder ×${mult(b)}.`, setLog: (n, s) => `${n} domina el sector <b>${s}</b>.`,
    outToast: n => `<b>${n}</b> se queda sin créditos y está fuera.`, outLog: n => `${n} se queda sin créditos.`,
    dockPlaying: n => `<b>${n}</b> está jugando…`, dockDoubles: '<b>¡Dobles!</b> Vuelve a tirar.',
    dockTurn: n => n ? `<b>${n}, te toca.</b> Mejora un planeta o tira.` : '<b>Te toca.</b> Mejora un planeta o tira.',
    dockRolling: 'Tirando…', dockRolled: (n, dice, dbl) => `<b>${n}</b> saca ${dice}${dbl ? ' · dobles' : ''}`,
    logKickoff: n => `${n} pasa por el Hiperespacio y cobra créditos.`, logPass: (n, t) => `${n} deja pasar ${t}.`,
    noteFee: (n, o, t) => ({ log: `${n} cae en <b>${t}</b>, de ${o}.`, toast: `<b>${n}</b> cae en <b>${t}</b>. ${o} cobra el peaje.` }),
    noteShort: (n, t) => ({ log: `${n} no tiene créditos para ${t}.`, toast: `No te llegan los créditos para <b>${t}</b>.` }),
    noteSpam: n => ({ log: `${n} queda congelado en carbonita y pierde un turno.`, toast: `<b>${n}</b> está congelado en carbonita. Pierde el próximo turno.` }),
    noteShield: n => ({ log: `El escudo deflector salva a ${n} de la carbonita.`, toast: `<b>${n}</b> usa el escudo deflector. No pierde turno.` }),
    noteSkipped: n => ({ dock: `<b>${n}</b> sigue congelado este turno.`, log: `${n} pasa el turno en carbonita.` }),
    noteBoard: (n, a) => ({ log: `${n} paga ${a} al Imperio.`, toast: `<b>Impuesto imperial.</b> ${n} paga ${a}.` }),
    noteKickoff: n => `${n} cae justo en el Hiperespacio: créditos extra.`, noteDoubles: n => `${n} ha sacado dobles y repite.`,
    youAs: name => `Tú, con ${name}`, seg: { ai: 'IA', human: 'Humano', off: 'Fuera' }, pickHint: 'Toca un personaje para jugar con él',
    logStart: s => `Empieza la conquista. El primero en llegar a <b>${s}</b> de poder gana.`,
    why: (r, s, m) => ({ target: `ha llegado a ${s} de poder`, last: 'es el único al que le quedan créditos', bust: 'ha aguantado más que tú', rounds: `iba primero tras ${m} rondas` })[r],
    endKicker: r => `Ronda ${r} · Tablero final`,
    endWin: () => 'LA GALAXIA<em>es tuya</em>', endLose: n => `${n}<em>se queda la galaxia</em>`,
    endLeadWin: 'Que la Fuerza te acompañe. También en la próxima.', endLeadLose: 'Ha llegado antes que tú. ¿Otra partida?',
    rankSmall: (t, b, out) => `${t} casillas · ${b}${out ? ' · fuera' : ''}`,
    again: 'Jugar otra vez', share: 'Compartir resultado', copied: 'Copiado', selectCopy: 'Selecciona y copia',
    shareText: (pos, n, s, tiles, url) => `${pos === 1 ? 'He ganado' : 'He quedado ' + pos + 'º en'} la edición Star Wars del juego de sagas con ${n}: ${s} de poder y ${tiles} casillas. ¿Me superas?${url ? ' ' + url : ''}`,
    helpBand: 'Cómo se juega', helpTitle: 'Las reglas', gotIt: 'Entendido',
    help: (s, k, m) => [
      '<b>Tira</b> dos dados y avanza. Con dobles vuelves a tirar.',
      'Cae en un <b>planeta o una nave</b> sin dueño para conquistarlo. Conquistar ya te da algo de poder.',
      'Si un rival cae en tu planeta, <b>te paga un peaje</b> y tú <b>ganas poder</b>. Si caes en uno tuyo, ganas un poco.',
      '<b>Mejora</b> tus planetas en tu turno, antes de tirar, desde el panel de la derecha: Puesto → Base → Fortaleza.',
      'Con los tres planetas de un <b>sector</b>, todo vale ×1,5. Las <b>naves</b> valen más cuantas más tengas.',
      `Cada vuelta por el <b>Hiperespacio</b> cobras ${k}. La <b>Carbonita</b> te hace perder un turno y el <b>Impuesto imperial</b> se lleva el 12 % de tus créditos.`,
      `Gana el primero en llegar a <b>${s} de poder</b>. Si pasan ${m} rondas, gana quien tenga más.`
    ],
    tipFree: p => `Sin dueño · ${p}`, tipFee: f => `Peaje: ${f}`,
    tipSpecial: k => ({ kickoff: `Cobras ${k} en cada vuelta`, signal: 'Saca una transmisión', brain: 'Aprende una lección para siempre', spam: 'Pierdes el próximo turno', board: 'Pagas el 12 % de tus créditos' }),
    infoSpecial: k => ({ kickoff: `Cada vez que pasas por el Hiperespacio cobras ${k}. Si caes justo aquí, cobras un extra.`, signal: 'Saca una transmisión: botines, emboscadas, saltos a la velocidad de la luz. Unas ayudan, otras no, y algunas te mueven.', brain: 'Abre un holocrón. Casi todas sus lecciones te acompañan el resto de la partida.', spam: 'Te congelan en carbonita y pierdes el próximo turno, salvo que tengas un escudo deflector.', board: 'El Imperio cobra sus impuestos: pagas el 12 % de tus créditos.' }),
    specialBand: 'Casilla especial',
    noWebgl: '<h1>Este juego necesita <em>WebGL</em></h1><p class="lead">Tu navegador no ha podido arrancar el tablero 3D. Prueba con un Chrome, Safari o Firefox reciente con la aceleración por hardware activada.</p>',
    pickerBand: 'Ediciones secretas', pickerTitle: 'Elige tu saga', pickerText: 'El mismo juego en otro universo. El tablero se vuelve a montar con la edición que elijas.',
    pickerNow: 'La que estás jugando', pickerSoon: 'Próximamente'
  },

  look: {
    fonts: { sans: '"Libre Franklin", system-ui, sans-serif', display: '"Exo 2", "Libre Franklin", sans-serif', load: ['800 40px "Libre Franklin"', '700 40px "Exo 2"', '800 40px "Exo 2"'] },
    labelCase: 'upper', nameSize: 58, priceWeight: 700,
    colors: { ink: '#05070D', cream: '#ECE8DC', price: '#FFE81F', table: '#06080F', base: '#0B101B', rim: '#B9C2D0', line: '#FFE81F', highlight: '#FFE81F', coin: '#C9CED6' },
    coinSides: 8,
    tile: { market: ['#121A2A', '#162033'], channel: ['#1A1F2B', '#1A1F2B'], kickoff: ['#E8C300', '#E8C300'], signal: ['#13284A', '#13284A'], brain: ['#0F3346', '#0F3346'], spam: ['#2A2E36', '#2A2E36'], board: ['#3A1518', '#3A1518'] },
    iconColor: { kickoff: '#05070D', signal: '#7FD3FF', brain: '#9FE0FF', spam: '#C7CCD6', board: '#FF6B5E', channel: '#FFE81F' },
    specialSub: { kickoff: '+150K cr por vuelta', signal: 'Saca una carta', brain: 'Aprende una lección', spam: 'Pierdes un turno', board: 'Pagas el 12 %' },
    sky: [[0, '#020309'], [0.5, '#04060E'], [0.8, '#0A1024'], [1, '#121A36']],
    fog: ['#070B16', 42, 120],
    lights: { hemi: ['#D6DEFF', '#2A1A0C', 1.15], rim: ['#6FA8FF', 1.0, [-12, 8, -14]] },
    day: [[0, '#FFF1D6', 3.2, 1.2, [13, 21, 9]], [0.35, '#FFE6B8', 3.4, 1.25, [4, 25, 6]], [0.62, '#FFB15C', 2.8, 1.0, [-10, 14, 8]], [0.82, '#FF7A4A', 1.9, 0.82, [-15, 7, 6]], [1, '#8FB3FF', 1.05, 0.62, [-9, 18, -8]]],
    stars: { count: 2600, color: '#FFFFFF', size: 0.5, opacity: [0.75, 1], below: true },
    dice: { face: '#E9ECF1', pip: '#0B0F1A', one: '#E5484D' },
    decks: { signal: { bg: '#0F1E3A', line: '#7FD3FF', title: 'TRANSMISIÓN', side: '#DCE2EA' }, brain: { bg: '#0B2A3A', line: '#9FE0FF', title: 'HOLOCRÓN', side: '#DCE2EA' } },
    bloom: [0.5, 0.6, 1.45],
    exposure: 1.1,
    icon, makeToken, makeBuilding, makeProp, buildWorld
  }
};
