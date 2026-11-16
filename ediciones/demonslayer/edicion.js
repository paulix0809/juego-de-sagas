/* Demon Slayer · edición fan no oficial del juego de sagas.
   Mismas reglas que el juego base. Cada sector es el territorio de una Luna Superior: conquistar los
   tres lugares de un sector es derrotarla. Sin logos, imágenes, música ni tipografías oficiales. */
import { makeToken, makeBuilding, makeProp, icon } from './piezas.js?v=1116b';
import { buildWorld } from './mundo.js?v=1116b';

const thousands = n => String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const money = k => {
  k = Math.round(k);
  const a = Math.abs(k), s = k < 0 ? '−' : '';
  if (a >= 1000) return s + '¥' + (a / 1000).toFixed(2).replace(/0$/, '').replace(/\.0$/, '').replace('.', ',') + 'M';
  return s + '¥' + a + 'K';
};
const score = n => thousands(n);
const mult = b => String(b).replace('.', ',');

export default {
  id: 'demonslayer',
  money, score,
  stages: ['Cabaña', 'Casa', 'Pagoda'],
  ages: ['Selección final', 'Tren Infinito', 'Distrito del Entretenimiento', 'Aldea de los Herreros', 'Castillo Infinito'],
  confetti: ['#B98CE6', '#F27BAA', '#E8DCC0', '#3FAE6A'],

  roster: [
    { name: 'Tanjiro', short: 'TANJIRO', color: '#3FAE6A', shape: 'tanjiro', persona: 'smart', blurb: 'Huele el peligro. Construye hasta el final.' },
    { name: 'Zenitsu', short: 'ZENITSU', color: '#F2C230', shape: 'zenitsu', persona: 'intern', blurb: 'Tiembla de miedo… hasta que no.' },
    { name: 'Inosuke', short: 'INOSUKE', color: '#6E8FD8', shape: 'inosuke', persona: 'spray', blurb: 'Se lanza de cabeza a todo.' },
    { name: 'Nezuko', short: 'NEZUKO', color: '#F27BAA', shape: 'nezuko', persona: 'bigname', blurb: 'Solo va a por lo más difícil.' }
  ],

  rules: {
    money,
    tiles: [
      'Finca Mariposa',
      'Casa Kyogoku', 'Casa Tokito', 'Cuervo Kasugai', 'Barrio rojo',
      { name: 'Pilar de la Llama', icon: 'flame' },
      'Bosque de la aldea', 'Aguas termales', 'Respiración', 'Vasijas de Gyokko',
      'Monte Natagumo',
      'Casa del jefe', 'Muñeco de práctica', { name: 'Pilar del Agua', icon: 'water' }, 'Forja de Kotetsu',
      'Cuervo Kasugai',
      'Vía del tren', 'Dojo Soryu', { name: 'Pilar del Insecto', icon: 'insect' }, 'Tren Infinito',
      'La katana rota',
      'Lago helado', 'Flor de loto', 'Respiración', 'Templo del Paraíso',
      { name: 'Pilar del Sonido', icon: 'sound' },
      'Bosque de bambú', 'Cuervo Kasugai', 'Puente de la luna', 'Castillo Infinito'
    ],
    sectors: {
      materials: { name: 'Luna Superior 6 · Gyutaro y Daki', color: '#E08A6E' },
      robotics: { name: 'Luna Superior 5 · Gyokko', color: '#8FD3C9' },
      lab: { name: 'Luna Superior 4 · Hantengu', color: '#CDB07A' },
      saas: { name: 'Luna Superior 3 · Akaza', color: '#D27AB0' },
      health: { name: 'Luna Superior 2 · Doma', color: '#BFD8F2' },
      security: { name: 'Luna Superior 1 · Kokushibo', color: '#A684DA' }
    },
    signals: [
      { title: '¡Caw! Demonio al norte', text: 'Tu cuervo trae una orden urgente. Vas tú.', effect: '+200 de honor' },
      { title: 'Paga del Cuerpo', text: 'El Cuerpo de Cazadores paga bien las misiones cumplidas.', effect: '+¥150K' },
      { title: 'Espada mellada', text: 'El herrero no va a estar nada contento. Toca pagar.', effect: '−¥80K' },
      { title: 'Festival de verano', text: 'Montas un puesto de comida. Todos los rivales pasan por caja.', effect: 'Cada rival te paga ¥40K' },
      { title: 'Un demonio menor', text: 'Lo derrotas, pero te destroza el haori.', effect: '−¥60K' },
      { title: 'Respiración del Trueno', text: 'Primera Forma. Un relámpago y ya estás más lejos.', effect: 'Avanza 3 casillas' },
      { title: 'Hilos invisibles', text: 'Te has metido en la telaraña sin darte cuenta.', effect: 'Directo al Monte Natagumo' },
      { title: 'Llegan los Pilares', text: 'Justo a tiempo, como siempre.', effect: '+250 de honor' },
      { title: 'Un sueño muy bonito', text: 'Un arte demoníaco te duerme. Despertar cuesta.', effect: '−150 de honor' },
      { title: 'Onigiri de la abuela', text: 'Recuperas fuerzas y alguien te deja una propina.', effect: '+¥50K y +150 de honor' },
      { title: 'Rumores en el pueblo', text: 'Cada lugar que proteges te lo agradece.', effect: '+¥30K por cada lugar tuyo' },
      { title: 'Reparaciones', text: 'Todas tus casas necesitan arreglos tras la última noche.', effect: 'Pagas ¥15K por cada nivel construido' },
      { title: 'Volver a la Finca', text: 'Te curan las heridas y cobras la paga.', effect: 'Ve a la Finca Mariposa y cobra' },
      { title: 'Rastro de olor', text: 'Tu olfato te lleva al siguiente lugar sin dueño.', effect: 'Avanza al siguiente lugar o Pilar libre' },
      { title: 'Entrenamiento de los Pilares', text: 'Cada Pilar que te apoya suma.', effect: '+100 de honor y +100 por cada Pilar tuyo' },
      { title: 'Alguien rompe algo', text: 'Se lanzó de cabeza contra la pared. Pagas tú.', effect: '−¥40K' }
    ],
    perks: {
      fee: { short: 'Llama', title: 'Respiración de la Llama', text: 'Los peajes que cobras son un 25 % más altos.' },
      cheap: { short: 'Agua', title: 'Respiración del Agua', text: 'Construir te cuesta un 25 % menos.' },
      kick: { short: 'Insecto', title: 'Respiración del Insecto', text: '+¥60K extra cada vez que pasas por la Finca.' },
      shield: { short: 'Olfato', title: 'Olfato de cazador', text: 'Te libras una vez del Monte Natagumo.' },
      pipe: { short: 'Sol', title: 'Respiración del Sol', text: 'Todo el honor que ganas es un 25 % mayor.' },
      discount: { short: 'Trueno', title: 'Respiración del Trueno', text: 'Los lugares te cuestan un 15 % menos.' },
      armor: { short: 'Bestia', title: 'Respiración de la Bestia', text: 'Los peajes que pagas son un 25 % más bajos.' }
    },
    perkCardText: 'Dominas esta técnica hasta el final de la partida.',
    brainsExtra: [
      { title: 'Concentración total', text: 'Respiras sin parar, incluso dormido.', effect: '+300 de honor' },
      { title: 'Entrenamiento con el maestro', text: 'Una lección, aplicada en todos tus lugares a la vez.', effect: '+100 de honor por cada lugar tuyo' }
    ]
  },

  fontsHref: 'https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@600;700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700;900&display=swap',
  css: {
    '--bg': '#07080C', '--bg-rgb': '7,8,12', '--panel-rgb': '14,15,22', '--card': '#11121A',
    '--text': '#F1EBDD', '--text-2': 'rgba(241,235,221,.82)', '--text-3': 'rgba(241,235,221,.58)', '--line': 'rgba(241,235,221,.14)',
    '--accent': '#E0453A', '--accent-2': '#F5D08A', '--soft': '#B98CE6', '--soft-2': '#E3CCFF', '--bad': '#FF6A5E',
    '--cta-a': '#F05A4E', '--cta-b': '#A8221A', '--cta-ink': '#FFFFFF', '--cta-glow': '224,69,58',
    '--band-signal': '#1C2030', '--band-signal-ink': '#F1EBDD', '--band-brain': '#14283A', '--band-brain-ink': '#9FD8FF',
    '--display': '"Shippori Mincho B1", Georgia, serif', '--num': '"Zen Kaku Gothic New", system-ui, sans-serif', '--sans': '"Zen Kaku Gothic New", system-ui, sans-serif',
    '--h1-case': 'none', '--h1-weight': '800', '--h1-track': '-.01em', '--h2-weight': '800', '--kicker': '#B98CE6'
  },

  sfx: ({ tone, noise }) => ({
    build: () => { noise(0.08, 0.1, 0, 2500); tone(880, 0.05, 'square', 0.03); tone(1320, 0.3, 'sine', 0.04, 0.04); },
    turn: () => { tone(392, 0.2, 'sine', 0.05); tone(587, 0.3, 'sine', 0.045, 0.12); },
    spam: () => { tone(200, 0.6, 'triangle', 0.04, 0, -90); }
  }),

  T: {
    docTitle: 'Demon Slayer · Juego de sagas (edición fan)',
    brand: 'DEMON SLAYER <small>Edición fan</small>',
    kicker: 'Cazadores contra las Lunas Superiores',
    h1: 'Demon Slayer<em>La noche más larga</em>', h1Class: 'logo-seal',
    lead: 'Treinta casillas alrededor de un monte cubierto de glicinias. Libera los territorios de las seis Lunas Superiores, levanta pagodas y llega a 5.000 de honor antes del amanecer.',
    how: [
      ['Tira y muévete', 'Cae en un lugar sin dueño y protégelo antes que nadie.'],
      ['Cabaña → Casa → Pagoda', 'Mejora tus lugares: cada nivel sube el peaje y el honor que ganas.'],
      ['Derrota a una Luna', 'Con los tres lugares de una Luna Superior, todo vale ×1,5.'],
      ['Cuervos y respiraciones', 'Los cuervos traen órdenes. Las técnicas de respiración se quedan contigo.']
    ],
    startBtn: 'Desenvainar',
    startFine: 'Una partida dura unos diez minutos. Arrastra para girar el tablero y usa la rueda para acercarte.',
    fan: 'Edición fan no oficial, hecha por diversión y sin ánimo de lucro. Demon Slayer (Kimetsu no Yaiba) y sus personajes pertenecen a Koyoharu Gotouge, Shueisha y Aniplex; este juego no está relacionado con ellos ni cuenta con su aprobación.',
    goal: s => `Primero en llegar a <b>${s}</b> de honor`,
    round: (r, m) => `Ronda ${r} / ${m}`,
    age: a => a,
    ageToast: a => `La noche avanza: <b>${a}</b>.`,
    ageLog: (n, a) => `${n} lleva la historia a <b>${a}</b>.`,
    mineTitle: 'Tus lugares', mineOther: n => `Lugares de ${n}`,
    mineEmpty: 'Aún no proteges nada. Cae en un lugar sin dueño y quédatelo.',
    logTitle: 'Diario del cazador', roll: 'Tirar dados',
    you: 'tú', human: 'humano', tagOut: 'Fuera', tagSkip: 'Atrapado',
    pipeOf: s => `de ${s} de honor`, budget: 'Yenes',
    count: (n, k) => k === 'market' ? `${n} lugar${n === 1 ? '' : 'es'}` : `${n} Pilar${n === 1 ? '' : 'es'}`,
    channelWord: 'Pilar', channelLine: f => `Pilar · peaje ${f}`, stageLine: (st, f) => `${st} · peaje ${f}`,
    th: ['Nivel', 'Peaje que cobras', 'Honor que ganas'], sectorWord: 'Territorio', setNote: b => `Con los tres lugares de esta Luna, peajes y honor ×${mult(b)}.`,
    chTh: ['Pilares tuyos', 'Peaje', 'Honor'], chNote: 'Cuantos más Pilares te apoyen, más vale cada uno.',
    close: 'Cerrar', ok: 'Vale', skip: 'Pasar', notNow: 'Ahora no',
    buy: p => `Proteger · ${p}`, buyFine: (b, s) => `Tienes ${b}. Proteger este lugar ya te da ${s} de honor.`,
    upgradeBtn: (st, c) => `Subir a ${st} · ${c}`, haveFine: b => `Tienes ${b}.`,
    deckHead: { signal: 'Orden del cuervo', brain: 'Técnica de respiración' },
    logDraw: (n, t) => `${n} saca <b>${t}</b>.`,
    floatScore: s => `${s} honor`,
    logGiveUp: (n, t) => `${n} abandona <b>${t}</b>.`, logMap: (n, t) => `${n} protege <b>${t}</b>.`,
    logScaleBack: (n, t, st) => `${n} rebaja <b>${t}</b> a ${st}.`, logUpgrade: (n, t, st) => `${n} levanta una ${st.toLowerCase()} en <b>${t}</b>.`,
    setToast: (n, s, b) => `<b>${n}</b> derrota a la ${s}. Peajes y honor ×${mult(b)}.`, setLog: (n, s) => `${n} derrota a la <b>${s}</b>.`,
    outToast: n => `<b>${n}</b> se queda sin yenes y está fuera.`, outLog: n => `${n} se queda sin yenes.`,
    dockPlaying: n => `<b>${n}</b> está jugando…`, dockDoubles: '<b>¡Dobles!</b> Vuelve a tirar.',
    dockTurn: n => n ? `<b>${n}, te toca.</b> Mejora un lugar o tira.` : '<b>Te toca.</b> Mejora un lugar o tira.',
    dockRolling: 'Tirando…', dockRolled: (n, dice, dbl) => `<b>${n}</b> saca ${dice}${dbl ? ' · dobles' : ''}`,
    logKickoff: n => `${n} pasa por la Finca Mariposa y cobra.`, logPass: (n, t) => `${n} deja pasar ${t}.`,
    noteFee: (n, o, t) => ({ log: `${n} cae en <b>${t}</b>, de ${o}.`, toast: `<b>${n}</b> cae en <b>${t}</b>. ${o} cobra el peaje.` }),
    noteShort: (n, t) => ({ log: `${n} no tiene yenes para ${t}.`, toast: `No te llegan los yenes para <b>${t}</b>.` }),
    noteSpam: n => ({ log: `${n} queda atrapado en la telaraña y pierde un turno.`, toast: `<b>${n}</b> está atrapado en el Monte Natagumo. Pierde el próximo turno.` }),
    noteShield: n => ({ log: `El olfato de ${n} le aparta de la telaraña.`, toast: `<b>${n}</b> huele la trampa a tiempo. No pierde turno.` }),
    noteSkipped: n => ({ dock: `<b>${n}</b> sigue atrapado este turno.`, log: `${n} pasa el turno en la telaraña.` }),
    noteBoard: (n, a) => ({ log: `${n} paga ${a} por la katana rota.`, toast: `<b>La katana rota.</b> El herrero le cobra ${a} a ${n}.` }),
    noteKickoff: n => `${n} cae justo en la Finca Mariposa: paga extra.`, noteDoubles: n => `${n} ha sacado dobles y repite.`,
    youAs: name => `Tú, con ${name}`, seg: { ai: 'IA', human: 'Humano', off: 'Fuera' }, pickHint: 'Toca un personaje para jugar con él',
    logStart: s => `Cae la noche. El primero en llegar a <b>${s}</b> de honor gana.`,
    why: (r, s, m) => ({ target: `ha llegado a ${s} de honor`, last: 'es el único al que le quedan yenes', bust: 'ha aguantado más que tú', rounds: `iba primero tras ${m} rondas` })[r],
    endKicker: r => `Ronda ${r} · Amanece`,
    endWin: () => 'Ha salido el sol<em>las Lunas han caído</em>', endLose: n => `${n}<em>ve salir el sol primero</em>`,
    endLeadWin: 'Has protegido a todos hasta el amanecer. ¿Otra noche?', endLeadLose: 'Ha llegado antes que tú. ¿Otra partida?',
    rankSmall: (t, b, out) => `${t} casillas · ${b}${out ? ' · fuera' : ''}`,
    again: 'Jugar otra vez', share: 'Compartir resultado', copied: 'Copiado', selectCopy: 'Selecciona y copia',
    shareText: (pos, n, s, tiles, url) => `${pos === 1 ? 'He ganado' : 'He quedado ' + pos + 'º en'} la edición Demon Slayer del juego de sagas con ${n}: ${s} de honor y ${tiles} casillas. ¿Me superas?${url ? ' ' + url : ''}`,
    helpBand: 'Cómo se juega', helpTitle: 'Las reglas', gotIt: 'Entendido',
    help: (s, k, m) => [
      '<b>Tira</b> dos dados y avanza. Con dobles vuelves a tirar.',
      'Cae en un <b>lugar o un Pilar</b> sin dueño para protegerlo. Protegerlo ya te da algo de honor.',
      'Si un rival cae en tu lugar, <b>te paga un peaje</b> y tú <b>ganas honor</b>. Si caes en uno tuyo, ganas un poco.',
      '<b>Mejora</b> tus lugares en tu turno, antes de tirar, desde el panel de la derecha: Cabaña → Casa → Pagoda.',
      'Con los tres lugares de una <b>Luna Superior</b>, todo vale ×1,5. Los <b>Pilares</b> valen más cuantos más tengas.',
      `Cada vuelta por la <b>Finca Mariposa</b> cobras ${k}. El <b>Monte Natagumo</b> te hace perder un turno y <b>La katana rota</b> se lleva el 12 % de tus yenes.`,
      `Gana el primero en llegar a <b>${s} de honor</b>. Si pasan ${m} rondas, gana quien tenga más.`
    ],
    tipFree: p => `Sin dueño · ${p}`, tipFee: f => `Peaje: ${f}`,
    tipSpecial: k => ({ kickoff: `Cobras ${k} en cada vuelta`, signal: 'Saca una orden del cuervo', brain: 'Aprende una respiración para siempre', spam: 'Pierdes el próximo turno', board: 'Pagas el 12 % de tus yenes' }),
    infoSpecial: k => ({ kickoff: `Cada vez que pasas por la Finca Mariposa cobras ${k}. Si caes justo aquí, cobras un extra.`, signal: 'Tu cuervo trae una orden: pagas, demonios, festivales. Unas ayudan, otras no, y algunas te mueven.', brain: 'Entrenas una técnica de respiración. Casi todas te acompañan el resto de la partida.', spam: 'Te quedas atrapado en la telaraña y pierdes el próximo turno, salvo que huelas la trampa.', board: 'Has roto otra katana y el herrero te cobra el 12 % de tus yenes.' }),
    specialBand: 'Casilla especial',
    noWebgl: '<h1>Este juego necesita <em>WebGL</em></h1><p class="lead">Tu navegador no ha podido arrancar el tablero 3D. Prueba con un Chrome, Safari o Firefox reciente con la aceleración por hardware activada.</p>',
    pickerBand: 'Ediciones', pickerTitle: 'Elige tu saga', pickerText: 'El mismo juego en otro universo. El tablero se vuelve a montar con la edición que elijas.',
    pickerNow: 'La que estás jugando', pickerSoon: 'Próximamente'
  },

  look: {
    fonts: { sans: '"Zen Kaku Gothic New", system-ui, sans-serif', display: '"Zen Kaku Gothic New", system-ui, sans-serif', load: ['900 40px "Zen Kaku Gothic New"', '700 40px "Zen Kaku Gothic New"', '800 40px "Shippori Mincho B1"'] },
    labelCase: 'none', nameSize: 56, nameWeight: 900, priceWeight: 900,
    colors: { ink: '#0A0A0E', cream: '#F1EBDD', price: '#F5D08A', table: '#09090D', base: '#140F0D', rim: '#C8A35A', line: '#B98CE6', highlight: '#F5D08A', coin: '#C8A35A' },
    tile: { market: ['#1A1820', '#1F1C25'], channel: ['#24181A', '#24181A'], kickoff: ['#6E4AB0', '#6E4AB0'], signal: ['#1C2030', '#1C2030'], brain: ['#14283A', '#14283A'], spam: ['#262630', '#262630'], board: ['#3A1614', '#3A1614'] },
    iconColor: { kickoff: '#F1EBDD', signal: '#E8DCC0', brain: '#9FD8FF', spam: '#E8ECF2', board: '#FF7A6A', channel: '#F5D08A' },
    specialSub: { kickoff: '+¥150K por vuelta', signal: 'Orden del cuervo', brain: 'Aprende una técnica', spam: 'Pierdes un turno', board: 'Pagas el 12 %' },
    sky: [[0, '#04050A'], [0.5, '#080A14'], [0.8, '#141A30'], [1, '#26203E']],
    fog: ['#0C0E1A', 40, 115],
    lights: { hemi: ['#B9C6FF', '#140E14', 1.0], rim: ['#B98CE6', 1.1, [-12, 8, -14]] },
    day: [[0, '#BFD0FF', 2.4, 0.95, [-9, 18, -8]], [0.35, '#C9D6FF', 2.6, 1.0, [4, 22, 6]], [0.62, '#B0B8F2', 2.4, 0.95, [10, 16, 8]], [0.85, '#FFB89A', 2.6, 1.05, [14, 8, 6]], [1, '#FFE0B0', 3.2, 1.25, [13, 12, 9]]],
    stars: { count: 2200, color: '#FFFFFF', size: 0.5, opacity: [0.95, 0.25], below: true },
    dice: { face: '#F1EBDD', pip: '#14100E', one: '#E0453A' },
    decks: { signal: { bg: '#1C2030', line: '#E8DCC0', title: 'ORDEN DEL CUERVO', side: '#E8DCC0' }, brain: { bg: '#14283A', line: '#9FD8FF', title: 'RESPIRACIÓN', side: '#E8DCC0' } },
    bloom: [0.55, 0.6, 1.4],
    exposure: 1.12,
    icon, makeToken, makeBuilding, makeProp, buildWorld
  }
};
