/* Marvel · edición fan no oficial del juego de sagas.
   Mismas reglas que el juego base; aquí van los nombres, las cartas, los personajes, los textos,
   los colores y las piezas 3D. Sin logos, imágenes, música ni tipografías oficiales. */
import { makeToken, makeBuilding, makeProp, icon } from './piezas.js?v=1116a';
import { buildWorld } from './mundo.js?v=1116a';

const thousands = n => String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const money = k => {
  k = Math.round(k);
  const a = Math.abs(k), s = k < 0 ? '−' : '';
  if (a >= 1000) return s + '$' + (a / 1000).toFixed(2).replace(/0$/, '').replace(/\.0$/, '').replace('.', ',') + 'M';
  return s + '$' + a + 'K';
};
const score = n => thousands(n);
const mult = b => String(b).replace('.', ',');

export default {
  id: 'marvel',
  money, score,
  stages: ['Base', 'Cuartel', 'Torre'],
  ages: ['Los inicios', 'La Iniciativa', 'La invasión', 'La Guerra del Infinito', 'Endgame'],
  confetti: ['#E23636', '#F2C230', '#FFFFFF', '#3D6BFF'],

  roster: [
    { name: 'Iron Man', short: 'IRON MAN', color: '#E23636', shape: 'ironman', persona: 'bigname', blurb: 'Solo compra lo más caro. Puede.' },
    { name: 'Capitán América', short: 'CAP', color: '#3D6BFF', shape: 'captain', persona: 'smart', blurb: 'Con plan. Construye hasta el final.' },
    { name: 'Hulk', short: 'HULK', color: '#5BC94A', shape: 'hulk', persona: 'spray', blurb: 'Lo aplasta todo. No construye nada.' },
    { name: 'Thor', short: 'THOR', color: '#7FE0FF', shape: 'thor', persona: 'intern', blurb: 'Dios del trueno. Impredecible.' }
  ],

  rules: {
    money,
    tiles: [
      'Torre Vengadores',
      'Hell’s Kitchen', 'Queens', 'Alerta S.H.I.E.L.D.', 'Harlem',
      { name: 'Quinjet', icon: 'quinjet' },
      'El Triskelion', 'Base de Hydra', 'Gema del Infinito', 'Complejo Vengadores',
      'La Balsa',
      'Sanctum Sanctorum', 'Kamar-Taj', { name: 'Helitransporte', icon: 'helicarrier' }, 'Dimensión Oscura',
      'Alerta S.H.I.E.L.D.',
      'Sokovia', 'Madripur', { name: 'Milano', icon: 'milano' }, 'Latveria',
      'Daños colaterales',
      'Birnin Zana', 'Monte Bashenga', 'Gema del Infinito', 'Tierras Jabari',
      { name: 'Moto del Capi', icon: 'moto' },
      'Knowhere', 'Alerta S.H.I.E.L.D.', 'Titán', 'Asgard'
    ],
    sectors: {
      materials: { name: 'Calles de Nueva York', color: '#E9C46A' },
      robotics: { name: 'Bases secretas', color: '#A9B4C6' },
      lab: { name: 'Mundos místicos', color: '#F29A5C' },
      saas: { name: 'Tierras lejanas', color: '#C9A27A' },
      health: { name: 'Wakanda', color: '#A88BEB' },
      security: { name: 'El cosmos', color: '#E879B5' }
    },
    signals: [
      { title: 'Llamada de Fury', text: 'Nick Fury necesita al equipo. Y tú respondes el primero.', effect: '+200 de gloria' },
      { title: 'Contrato de Industrias Stark', text: 'Tony firma sin leer. Te toca una parte.', effect: '+$150K' },
      { title: 'Te copian el traje', text: 'Alguien vende tu traje en una esquina. Toca pagar abogados.', effect: '−$80K' },
      { title: 'Gala benéfica en la Torre', text: 'Todo el mundo quiere ir. Los rivales pagan la entrada.', effect: 'Cada rival te paga $40K' },
      { title: 'Ataque de Hydra', text: 'Han reventado tu laboratorio. Corta una cabeza y salen dos facturas.', effect: '−$60K' },
      { title: 'Supervelocidad', text: 'Corres tanto que llegas antes de salir.', effect: 'Avanza 3 casillas' },
      { title: 'Acuerdos de Sokovia', text: 'Firmaste sin leer la letra pequeña. Directo a la cárcel.', effect: 'Directo a La Balsa' },
      { title: '¡Vengadores, reuníos!', text: 'Todo el equipo aparece a la vez. Es tu momento.', effect: '+250 de gloria' },
      { title: 'El chasquido', text: 'Parte de tu gloria se convierte en polvo.', effect: '−150 de gloria' },
      { title: 'Un gran poder', text: '… conlleva una gran responsabilidad. Y algo de dinero.', effect: '+$50K y +150 de gloria' },
      { title: 'Merchandising', text: 'Tu cara sale en camisetas. Cada lugar tuyo vende.', effect: '+$30K por cada lugar tuyo' },
      { title: 'Revisión de armaduras', text: 'Todas las armaduras piden mantenimiento la misma semana.', effect: 'Pagas $15K por cada nivel construido' },
      { title: 'Shawarma', text: 'Después de la batalla, todos a comer. Vuelves a la Torre.', effect: 'Ve a la Torre y cobra' },
      { title: 'Un portal de Strange', text: 'Un círculo de chispas te deja en el siguiente sitio sin dueño.', effect: 'Avanza al siguiente lugar o vehículo libre' },
      { title: 'Apoyo aéreo', text: 'Cada vehículo tuyo entra en la batalla.', effect: '+100 de gloria y +100 por cada vehículo tuyo' },
      { title: 'Alguien rompe la cuarta pared', text: 'Y de paso, tu salón. Pagas los daños.', effect: '−$40K' }
    ],
    perks: {
      fee: { short: 'Gema Poder', title: 'Gema del Poder', text: 'Los peajes que cobras son un 25 % más altos.' },
      cheap: { short: 'Gema Realidad', title: 'Gema de la Realidad', text: 'Construir te cuesta un 25 % menos.' },
      kick: { short: 'Gema Tiempo', title: 'Gema del Tiempo', text: '+$60K extra cada vez que pasas por la Torre.' },
      shield: { short: 'Gema Espacio', title: 'Gema del Espacio', text: 'Te libras una vez de La Balsa.' },
      pipe: { short: 'Gema Mente', title: 'Gema de la Mente', text: 'Toda la gloria que ganas es un 25 % mayor.' },
      discount: { short: 'Gema Alma', title: 'Gema del Alma', text: 'Los lugares te cuestan un 15 % menos.' },
      armor: { short: 'Vibranium', title: 'Escudo de vibranium', text: 'Los peajes que pagas son un 25 % más bajos.' }
    },
    perkCardText: 'La gema es tuya hasta el final de la partida.',
    brainsExtra: [
      { title: 'El guantelete brilla', text: 'Todas las gemas a la vez. Solo un momento.', effect: '+300 de gloria' },
      { title: 'Entrenamiento en Kamar-Taj', text: 'Una lección, aplicada en todos tus lugares a la vez.', effect: '+100 de gloria por cada lugar tuyo' }
    ]
  },

  fontsHref: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@500;600;700;800&display=swap',
  css: {
    '--bg': '#0A0B0F', '--bg-rgb': '10,11,15', '--panel-rgb': '18,19,26', '--card': '#14151C',
    '--text': '#F2F0EC', '--text-2': 'rgba(242,240,236,.82)', '--text-3': 'rgba(242,240,236,.58)', '--line': 'rgba(242,240,236,.14)',
    '--accent': '#E23636', '--accent-2': '#F2C230', '--soft': '#5AB0FF', '--soft-2': '#CFE6FF', '--bad': '#FF6A5E',
    '--cta-a': '#FF5A4E', '--cta-b': '#B8141B', '--cta-ink': '#FFFFFF', '--cta-glow': '226,54,54',
    '--band-signal': '#1A2A44', '--band-signal-ink': '#9FD0FF', '--band-brain': '#2A1A44', '--band-brain-ink': '#D3B3FF',
    '--display': '"Bebas Neue", "Barlow Condensed", system-ui, sans-serif', '--num': '"Barlow Condensed", system-ui, sans-serif', '--sans': 'Barlow, system-ui, sans-serif',
    '--h1-case': 'uppercase', '--h1-weight': '400', '--h1-track': '.01em', '--h2-weight': '400', '--h2-case': 'uppercase', '--kicker': '#F2C230'
  },

  sfx: ({ tone, noise }) => ({
    build: () => { noise(0.12, 0.12, 0, 400); tone(140, 0.3, 'square', 0.04, 0, -40); tone(560, 0.2, 'triangle', 0.05, 0.08); },
    turn: () => { tone(523, 0.1, 'triangle', 0.05); tone(784, 0.16, 'triangle', 0.05, 0.09); },
    spam: () => { tone(110, 0.5, 'sawtooth', 0.04, 0, -40); noise(0.2, 0.05, 0.1, 1800); }
  }),

  T: {
    docTitle: 'Marvel · Juego de sagas (edición fan)',
    brand: 'MARVEL <small>Edición fan</small>',
    kicker: 'Si no podemos proteger la Tierra, la vengaremos',
    h1: 'MARVEL<em>La batalla por Nueva York</em>', h1Class: 'logo-box',
    lead: 'Treinta casillas alrededor de Nueva York. Ficha lugares de todo el universo, conviértelos en torres y llega a 5.000 de gloria antes que el resto del equipo.',
    how: [
      ['Tira y muévete', 'Cae en un lugar sin dueño y fíchalo antes que nadie.'],
      ['Base → Cuartel → Torre', 'Mejora tus lugares: cada nivel sube el peaje y la gloria que ganas.'],
      ['Domina el sector', 'Con los tres lugares de un sector, todo vale ×1,5.'],
      ['Alertas y gemas', 'Las alertas de S.H.I.E.L.D. sacuden la partida. Las gemas del Infinito se quedan contigo.']
    ],
    startBtn: '¡Vengadores, reuníos!',
    startFine: 'Una partida dura unos diez minutos. Arrastra para girar el tablero y usa la rueda para acercarte.',
    fan: 'Edición fan no oficial, hecha por diversión y sin ánimo de lucro. Marvel y sus personajes pertenecen a Marvel Entertainment y a The Walt Disney Company; este juego no está relacionado con ellos ni cuenta con su aprobación.',
    goal: s => `Primero en llegar a <b>${s}</b> de gloria`,
    round: (r, m) => `Ronda ${r} / ${m}`,
    age: a => a,
    ageToast: a => `Nueva fase: <b>${a}</b>.`,
    ageLog: (n, a) => `${n} lleva la ciudad a <b>${a}</b>.`,
    mineTitle: 'Tus lugares', mineOther: n => `Lugares de ${n}`,
    mineEmpty: 'Aún no tienes nada. Cae en un lugar sin dueño y fíchalo.',
    logTitle: 'Informe de misión', roll: 'Tirar dados',
    you: 'tú', human: 'humano', tagOut: 'Fuera', tagSkip: 'En La Balsa',
    pipeOf: s => `de ${s} de gloria`, budget: 'Dinero',
    count: (n, k) => k === 'market' ? `${n} lugar${n === 1 ? '' : 'es'}` : `${n} vehículo${n === 1 ? '' : 's'}`,
    channelWord: 'Vehículo', channelLine: f => `Vehículo · peaje ${f}`, stageLine: (st, f) => `${st} · peaje ${f}`,
    th: ['Nivel', 'Peaje que cobras', 'Gloria que ganas'], sectorWord: 'Sector', setNote: b => `Con los tres lugares, peajes y gloria ×${mult(b)}.`,
    chTh: ['Vehículos tuyos', 'Peaje', 'Gloria'], chNote: 'Cuantos más vehículos tengas, más vale cada uno.',
    close: 'Cerrar', ok: 'Vale', skip: 'Pasar', notNow: 'Ahora no',
    buy: p => `Fichar · ${p}`, buyFine: (b, s) => `Tienes ${b}. Fichar ya te da ${s} de gloria.`,
    upgradeBtn: (st, c) => `Subir a ${st} · ${c}`, haveFine: b => `Tienes ${b}.`,
    deckHead: { signal: 'Alerta S.H.I.E.L.D.', brain: 'Gema del Infinito' },
    logDraw: (n, t) => `${n} saca <b>${t}</b>.`,
    floatScore: s => `${s} gloria`,
    logGiveUp: (n, t) => `${n} abandona <b>${t}</b>.`, logMap: (n, t) => `${n} ficha <b>${t}</b>.`,
    logScaleBack: (n, t, st) => `${n} rebaja <b>${t}</b> a ${st}.`, logUpgrade: (n, t, st) => `${n} convierte <b>${t}</b> en ${st}.`,
    setToast: (n, s, b) => `<b>${n}</b> domina todo el sector ${s}. Peajes y gloria ×${mult(b)}.`, setLog: (n, s) => `${n} domina el sector <b>${s}</b>.`,
    outToast: n => `<b>${n}</b> se queda sin dinero y está fuera.`, outLog: n => `${n} se queda sin dinero.`,
    dockPlaying: n => `<b>${n}</b> está jugando…`, dockDoubles: '<b>¡Dobles!</b> Vuelve a tirar.',
    dockTurn: n => n ? `<b>${n}, te toca.</b> Mejora un lugar o tira.` : '<b>Te toca.</b> Mejora un lugar o tira.',
    dockRolling: 'Tirando…', dockRolled: (n, dice, dbl) => `<b>${n}</b> saca ${dice}${dbl ? ' · dobles' : ''}`,
    logKickoff: n => `${n} pasa por la Torre y cobra.`, logPass: (n, t) => `${n} deja pasar ${t}.`,
    noteFee: (n, o, t) => ({ log: `${n} cae en <b>${t}</b>, de ${o}.`, toast: `<b>${n}</b> cae en <b>${t}</b>. ${o} cobra el peaje.` }),
    noteShort: (n, t) => ({ log: `${n} no tiene dinero para ${t}.`, toast: `No te llega el dinero para <b>${t}</b>.` }),
    noteSpam: n => ({ log: `${n} acaba en La Balsa y pierde un turno.`, toast: `<b>${n}</b> está encerrado en La Balsa. Pierde el próximo turno.` }),
    noteShield: n => ({ log: `La Gema del Espacio saca a ${n} de La Balsa.`, toast: `<b>${n}</b> usa la Gema del Espacio. No pierde turno.` }),
    noteSkipped: n => ({ dock: `<b>${n}</b> sigue en La Balsa este turno.`, log: `${n} pasa el turno en La Balsa.` }),
    noteBoard: (n, a) => ({ log: `${n} paga ${a} en daños colaterales.`, toast: `<b>Daños colaterales.</b> ${n} paga ${a} por lo que ha roto.` }),
    noteKickoff: n => `${n} cae justo en la Torre: dinero extra.`, noteDoubles: n => `${n} ha sacado dobles y repite.`,
    youAs: name => `Tú, con ${name}`, seg: { ai: 'IA', human: 'Humano', off: 'Fuera' }, pickHint: 'Toca un personaje para jugar con él',
    logStart: s => `Empieza la batalla. El primero en llegar a <b>${s}</b> de gloria gana.`,
    why: (r, s, m) => ({ target: `ha llegado a ${s} de gloria`, last: 'es el único al que le queda dinero', bust: 'ha aguantado más que tú', rounds: `iba primero tras ${m} rondas` })[r],
    endKicker: r => `Ronda ${r} · Tablero final`,
    endWin: () => 'NUEVA YORK<em>te da las gracias</em>', endLose: n => `${n}<em>salva el día</em>`,
    endLeadWin: 'Eres el héroe que la ciudad necesitaba. ¿Otra?', endLeadLose: 'Ha llegado antes que tú. ¿Otra partida?',
    rankSmall: (t, b, out) => `${t} casillas · ${b}${out ? ' · fuera' : ''}`,
    again: 'Jugar otra vez', share: 'Compartir resultado', copied: 'Copiado', selectCopy: 'Selecciona y copia',
    shareText: (pos, n, s, tiles, url) => `${pos === 1 ? 'He ganado' : 'He quedado ' + pos + 'º en'} la edición Marvel del juego de sagas con ${n}: ${s} de gloria y ${tiles} casillas. ¿Me superas?${url ? ' ' + url : ''}`,
    helpBand: 'Cómo se juega', helpTitle: 'Las reglas', gotIt: 'Entendido',
    help: (s, k, m) => [
      '<b>Tira</b> dos dados y avanza. Con dobles vuelves a tirar.',
      'Cae en un <b>lugar o un vehículo</b> sin dueño para ficharlo. Fichar ya te da algo de gloria.',
      'Si un rival cae en tu lugar, <b>te paga un peaje</b> y tú <b>ganas gloria</b>. Si caes en uno tuyo, ganas un poco.',
      '<b>Mejora</b> tus lugares en tu turno, antes de tirar, desde el panel de la derecha: Base → Cuartel → Torre.',
      'Con los tres lugares de un <b>sector</b>, todo vale ×1,5. Los <b>vehículos</b> valen más cuantos más tengas.',
      `Cada vuelta por la <b>Torre Vengadores</b> cobras ${k}. <b>La Balsa</b> te hace perder un turno y los <b>Daños colaterales</b> se llevan el 12 % de tu dinero.`,
      `Gana el primero en llegar a <b>${s} de gloria</b>. Si pasan ${m} rondas, gana quien tenga más.`
    ],
    tipFree: p => `Sin dueño · ${p}`, tipFee: f => `Peaje: ${f}`,
    tipSpecial: k => ({ kickoff: `Cobras ${k} en cada vuelta`, signal: 'Saca una alerta', brain: 'Consigue una gema para siempre', spam: 'Pierdes el próximo turno', board: 'Pagas el 12 % de tu dinero' }),
    infoSpecial: k => ({ kickoff: `Cada vez que pasas por la Torre cobras ${k}. Si caes justo aquí, cobras un extra.`, signal: 'Saca una alerta de S.H.I.E.L.D.: contratos, ataques, portales. Unas ayudan, otras no, y algunas te mueven.', brain: 'Consigue una gema del Infinito. Casi todas te dan una ventaja el resto de la partida.', spam: 'Te encierran en La Balsa y pierdes el próximo turno, salvo que tengas la Gema del Espacio.', board: 'Has roto media manzana: pagas el 12 % de tu dinero.' }),
    specialBand: 'Casilla especial',
    noWebgl: '<h1>Este juego necesita <em>WebGL</em></h1><p class="lead">Tu navegador no ha podido arrancar el tablero 3D. Prueba con un Chrome, Safari o Firefox reciente con la aceleración por hardware activada.</p>',
    pickerBand: 'Ediciones secretas', pickerTitle: 'Elige tu saga', pickerText: 'El mismo juego en otro universo. El tablero se vuelve a montar con la edición que elijas.',
    pickerNow: 'La que estás jugando', pickerSoon: 'Próximamente'
  },

  look: {
    fonts: { sans: 'Barlow, system-ui, sans-serif', display: '"Barlow Condensed", system-ui, sans-serif', load: ['800 40px Barlow', '700 40px "Barlow Condensed"', '400 40px "Bebas Neue"'] },
    labelCase: 'upper', nameSize: 60, priceWeight: 700,
    colors: { ink: '#0A0B0F', cream: '#F2F0EC', price: '#F2C230', table: '#0B0C10', base: '#14161D', rim: '#B8121B', line: '#E23636', highlight: '#F2C230', coin: '#D9A23A' },
    tile: { market: ['#1A1C24', '#1E2029'], channel: ['#22242C', '#22242C'], kickoff: ['#C8141E', '#C8141E'], signal: ['#1A2A44', '#1A2A44'], brain: ['#2A1A44', '#2A1A44'], spam: ['#2C2F36', '#2C2F36'], board: ['#3A2A14', '#3A2A14'] },
    iconColor: { kickoff: '#FFFFFF', signal: '#FF4A3A', brain: '#D3B3FF', spam: '#C7CCD6', board: '#F2C230', channel: '#F2C230' },
    specialSub: { kickoff: '+$150K por vuelta', signal: 'Saca una alerta', brain: 'Consigue una gema', spam: 'Pierdes un turno', board: 'Pagas el 12 %' },
    sky: [[0, '#05060A'], [0.5, '#0A0C14'], [0.8, '#151A2C'], [1, '#232A44']],
    fog: ['#0B0E18', 42, 120],
    lights: { hemi: ['#E6ECFF', '#1A1410', 1.15], rim: ['#7FA8FF', 1.0, [-12, 8, -14]] },
    day: [[0, '#FFF3DE', 3.2, 1.25, [13, 21, 9]], [0.35, '#FFE9C8', 3.3, 1.2, [4, 25, 6]], [0.62, '#FFB070', 2.6, 1.0, [-10, 14, 8]], [0.82, '#FF8A5C', 1.7, 0.8, [-15, 7, 6]], [1, '#9FB8FF', 1.0, 0.6, [-9, 18, -8]]],
    stars: { count: 900, color: '#FFFFFF', size: 0.45, opacity: [0.3, 0.9] },
    dice: { face: '#F2F0EC', pip: '#14151C', one: '#E23636' },
    decks: { signal: { bg: '#1A2A44', line: '#FF4A3A', title: 'ALERTA S.H.I.E.L.D.', side: '#E6E6EA' }, brain: { bg: '#2A1A44', line: '#D3B3FF', title: 'GEMAS DEL INFINITO', side: '#E6E6EA' } },
    bloom: [0.5, 0.6, 1.45],
    exposure: 1.1,
    icon, makeToken, makeBuilding, makeProp, buildWorld
  }
};
