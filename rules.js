/* Juego de sagas · las reglas (sin dibujo). El dinero va en miles (K). Mismas reglas que Closed Won. */

export const TARGET = 5000;      // pipeline needed to win ($5M)
export const START = 600;        // starting budget
export const KICKOFF = 150;      // budget collected every lap
export const MAX_ROUNDS = 30;
export const N = 30;

export const SECTORS = {
  materials: { name: 'Heavy Materials', color: '#D8CFBD' },
  robotics: { name: 'Robotics', color: '#D6A45E' },
  lab: { name: 'Lab & Science', color: '#8DB89F' },
  saas: { name: 'Vertical SaaS', color: '#7FA6B8' },
  health: { name: 'Health', color: '#C97B63' },
  security: { name: 'Security & Infra', color: '#A88BB0' }
};

export const STAGES = ['Mapped', 'Reach', 'Booked'];
export const FEE = [0.15, 0.45, 1.0];        // share of price a rival pays, by stage
export const PIPE_RIVAL = [1, 2.4, 4.8];       // pipeline the owner books when a rival lands
export const PIPE_OWN = [0.3, 0.8, 1.6];     // pipeline booked when you work your own market
export const SET_BONUS = 1.5;                // owning the whole sector

const M = (name, sector, price) => ({ type: 'market', name, sector, price });
const C = (name, icon) => ({ type: 'channel', name, icon, price: 150 });

export const TILES = [
  { type: 'kickoff', name: 'Kickoff' },
  M('Cement', 'materials', 80), M('Glassworks', 'materials', 90), { type: 'signal', name: 'Signal' }, M('Steel Foundries', 'materials', 100),
  C('Email', 'mail'),
  M('Cobots', 'robotics', 120), M('Machine Vision', 'robotics', 130), { type: 'brain', name: 'GTM Brain' }, M('CNC Tooling', 'robotics', 140),
  { type: 'spam', name: 'Spam Folder' },
  M('Scientific Cameras', 'lab', 160), M('Lab Automation', 'lab', 170), C('LinkedIn', 'chat'), M('Spectrometry', 'lab', 180),
  { type: 'signal', name: 'Signal' },
  M('Dental Software', 'saas', 200), M('Construction ERP', 'saas', 210), C('Phone', 'phone'), M('Fleet Telematics', 'saas', 220),
  { type: 'board', name: 'Board Meeting' },
  M('Behavioral Health', 'health', 240), M('Clinical Staffing', 'health', 250), { type: 'brain', name: 'GTM Brain' }, M('MedTech Devices', 'health', 260),
  C('Events', 'tent'),
  M('SOC Automation', 'security', 290), { type: 'signal', name: 'Signal' }, M('Industrial IoT', 'security', 300), M('Cold Chain', 'security', 320)
];

const r5 = n => Math.round(n / 5) * 5;
let fmt = k => {
  k = Math.round(k);
  const a = Math.abs(k), s = k < 0 ? '−' : '';
  if (a >= 1000) return s + '$' + (a / 1000).toFixed(2).replace(/0$/, '').replace(/\.0$/, '') + 'M';
  return s + '$' + a + 'K';
};
export const money = k => fmt(k);

/* an edition renames everything (tiles, sectors, cards, perks) and sets how money is written; the numbers stay */
export function applyEdition(ed) {
  if (ed.money) fmt = ed.money;
  ed.tiles.forEach((v, i) => { if (typeof v === 'string') TILES[i].name = v; else Object.assign(TILES[i], v); });
  Object.keys(ed.sectors).forEach(k => Object.assign(SECTORS[k], ed.sectors[k]));
  ed.signals.forEach((c, i) => Object.assign(SIGNALS[i], c));
  Object.keys(ed.perks).forEach(k => Object.assign(PERKS[k], ed.perks[k]));
  Object.keys(PERKS).forEach((k, i) => Object.assign(BRAINS[i], { title: PERKS[k].title, text: ed.perkCardText, effect: PERKS[k].text }));
  ed.brainsExtra.forEach((c, i) => Object.assign(BRAINS[Object.keys(PERKS).length + i], c));
}

/* ---------- cards ---------- */
/* fn(g, p, ev) mutates the game, pushes events and may return a move: {by}, {to}, {jump} */
export const SIGNALS = [
  { title: 'Unplanned shutdown', text: 'A plant in your ICP just went dark. They need answers this week, and you already know their name.', effect: '+$200K pipeline', fn: (g, p, ev) => { g.gain(p, 200, 'signal', ev); } },
  { title: 'Funding round in your niche', text: 'Fresh capital, fresh budgets. Your timing is suddenly perfect.', effect: '+$150K budget', fn: (g, p, ev) => { g.cash(p, 150, 'signal', ev); } },
  { title: 'The bought list bounced', text: 'A third of the “verified” emails belong to people who retired. Verified turned out to be a mood.', effect: '−$80K budget', fn: (g, p, ev) => { g.charge(p, 80, null, 'signal', ev); } },
  { title: 'Trade show season', text: 'Everyone wants a slot on your panel. They pay for the privilege.', effect: 'Every rival pays you $40K', fn: (g, p, ev) => { g.alive().forEach(o => { if (o !== p) g.charge(o, 40, p, 'trade show', ev); }); } },
  { title: 'A rival blasts your niche', text: 'Ten thousand emails land on your buyers overnight. Now everybody is “not interested”.', effect: '−$60K budget', fn: (g, p, ev) => { g.charge(p, 60, null, 'signal', ev); } },
  { title: 'Intent spike', text: 'Three target accounts just read your pricing page twice.', effect: 'Move forward 3 tiles', fn: () => ({ by: 3 }) },
  { title: 'Domain flagged', text: 'Somebody on your team “just tried” the 12-step sequence nobody reads.', effect: 'Go straight to the Spam Folder', fn: () => ({ jump: 10 }) },
  { title: 'Your champion changes jobs', text: 'She moves to a bigger plant and takes your number with her.', effect: '+$250K pipeline', fn: (g, p, ev) => { g.gain(p, 250, 'signal', ev); } },
  { title: 'No-shows', text: 'A third of this week’s meetings never dial in. Plants have emergencies; calendars lose.', effect: '−$150K pipeline', fn: (g, p, ev) => { g.gain(p, -150, 'signal', ev); } },
  { title: 'Warm referral', text: 'A plant manager tells another plant manager. Nothing beats that.', effect: '+$50K budget, +$150K pipeline', fn: (g, p, ev) => { g.cash(p, 50, 'referral', ev); g.gain(p, 150, 'referral', ev); } },
  { title: 'Native-language sequence lands', text: 'Replies arrive in four languages, and none of them is “unsubscribe”.', effect: '+$30K per market you own', fn: (g, p, ev) => { g.cash(p, 30 * g.owned(p.id).length || 30, 'native copy', ev); } },
  { title: 'Tooling renewals', text: 'Every tool in the stack renews in the same week. Of course.', effect: 'Pay $15K per stage you have built', fn: (g, p, ev) => { const n = g.owned(p.id).reduce((s, i) => s + g.stage[i], 0); g.charge(p, Math.max(15, 15 * n), null, 'renewals', ev); } },
  { title: 'New quarter', text: 'The board signs off the next budget early.', effect: 'Advance to Kickoff and collect', fn: () => ({ to: 0 }) },
  { title: 'New VP of Ops at a target account', text: 'New leaders buy in their first ninety days. Go meet them.', effect: 'Advance to the next unmapped market', fn: (g, p, ev) => { for (let k = 1; k < N; k++) { const i = (p.pos + k) % N; if ((TILES[i].type === 'market' || TILES[i].type === 'channel') && g.owner[i] === null) return { to: i }; } g.cash(p, 100, 'signal', ev); } },
  { title: '6.45% reply rate', text: 'Sharp list, sharp copy, a human reading every message before it goes.', effect: '+$100K pipeline, +$100K per channel you own', fn: (g, p, ev) => { g.gain(p, 100 + 100 * g.channels(p.id), 'reply rate', ev); } },
  { title: 'The intern sent the wrong deck', text: 'Forty slides. Slide 3 is the org chart. It went to your biggest account.', effect: '−$40K budget', fn: (g, p, ev) => { g.charge(p, 40, null, 'signal', ev); } }
];

export const PERKS = {
  fee: { title: 'Native subject lines', text: 'Fees you collect are 25% higher.' },
  cheap: { title: 'ICP shift to ops titles', text: 'Your upgrades cost 25% less.' },
  kick: { title: 'Replies handled within the hour', text: '+$60K extra budget every Kickoff.' },
  shield: { title: 'Deliverability shield', text: 'Ignore the Spam Folder once.' },
  pipe: { title: 'Every meeting traced to the signal', text: 'All pipeline you book is 25% bigger.' },
  discount: { title: 'TAM mapped to the name', text: 'Markets cost you 15% less.' },
  armor: { title: 'Enriched data', text: 'Fees you pay are 25% lower.' }
};

const perkCard = k => ({
  perk: k, title: PERKS[k].title, text: 'Logged in the brain. It stays with you for the rest of the game.', effect: PERKS[k].text,
  fn: (g, p, ev) => {
    if (p.perks[k]) { g.gain(p, 150, 'brain', ev); return; }
    p.perks[k] = true;
    ev.push({ t: 'perk', p: p.id, perk: k });
  }
});

export const BRAINS = [
  ...Object.keys(PERKS).map(perkCard),
  { title: 'Next play: re-engage the no-shows', text: 'The brain remembers who went quiet, and why.', effect: '+$300K pipeline', fn: (g, p, ev) => { g.gain(p, 300, 'brain', ev); } },
  { title: 'Suggestion: double down on what replied', text: 'One learning, applied everywhere at once.', effect: '+$100K pipeline per market you own', fn: (g, p, ev) => { g.gain(p, Math.max(100, 100 * g.owned(p.id).filter(i => TILES[i].type === 'market').length), 'brain', ev); } }
];

/* ---------- game ---------- */
export class Game {
  constructor(cfg, rnd = Math.random) {
    this.rnd = rnd;
    this.players = cfg.map((c, i) => ({
      id: i, name: c.name, color: c.color, ai: !!c.ai, persona: c.persona || 'intern',
      budget: START, pipeline: 0, pos: 0, skip: false, out: false, perks: {}, laps: 0,
      stats: { fees: 0, paid: 0, built: 0, cards: 0 }
    }));
    this.owner = Array(N).fill(null);
    this.stage = Array(N).fill(0);
    this.turn = 0;
    this.round = 1;
    this.over = false;
    this.winner = null;
    this.reason = '';
    this.decks = { signal: [], brain: [] };
  }

  get current() { return this.players[this.turn]; }
  alive() { return this.players.filter(p => !p.out); }
  owned(pid) { const a = []; for (let i = 0; i < N; i++) if (this.owner[i] === pid) a.push(i); return a; }
  channels(pid) { return this.owned(pid).filter(i => TILES[i].type === 'channel').length; }
  sectorTiles(sector) { const a = []; TILES.forEach((t, i) => { if (t.sector === sector) a.push(i); }); return a; }
  full(pid, sector) { return this.sectorTiles(sector).every(i => this.owner[i] === pid); }
  price(p, i) { return r5(TILES[i].price * (p.perks.discount ? 0.85 : 1)); }
  upgradeCost(p, i) { return r5(TILES[i].price * 0.6 * (p.perks.cheap ? 0.75 : 1)); }
  canUpgrade(p, i) { return this.owner[i] === p.id && TILES[i].type === 'market' && this.stage[i] < 3 && p.budget >= this.upgradeCost(p, i); }

  /* what a rival pays for landing on tile i, for a given stage (defaults to the current one) */
  fee(i, stage = this.stage[i], pid = this.owner[i]) {
    const t = TILES[i], o = pid === null ? null : this.players[pid];
    let f;
    if (t.type === 'channel') f = 30 * 2 ** (Math.max(1, o ? this.channels(o.id) : 1) - 1);
    else f = t.price * FEE[stage - 1] * (o && this.full(o.id, t.sector) ? SET_BONUS : 1);
    if (o && o.perks.fee) f *= 1.25;
    return r5(f);
  }

  /* pipeline booked on tile i: own = the owner visiting, otherwise a rival landing */
  pipe(i, own, stage = this.stage[i], pid = this.owner[i]) {
    const t = TILES[i];
    if (t.type === 'channel') { const n = Math.max(1, pid === null ? 1 : this.channels(pid)); return own ? 30 * n : 70 * n; }
    return r5(t.price * (own ? PIPE_OWN : PIPE_RIVAL)[stage - 1] * (pid !== null && this.full(pid, t.sector) ? SET_BONUS : 1));
  }

  gain(p, amt, why, ev) {
    if (amt > 0 && p.perks.pipe) amt = r5(amt * 1.25);
    const before = p.pipeline;
    p.pipeline = Math.max(0, p.pipeline + amt);
    if (p.pipeline !== before) ev.push({ t: 'pipe', p: p.id, amt: p.pipeline - before, why });
  }

  cash(p, amt, why, ev) { p.budget += amt; ev.push({ t: 'cash', p: p.id, amt, why }); }

  /* take money from p (to another player or the bank); sells assets if needed, eliminates if still short */
  charge(p, amt, to, why, ev) {
    p.budget -= amt;
    p.stats.paid += amt;
    ev.push({ t: 'cash', p: p.id, amt: -amt, why });
    while (p.budget < 0) {
      const mine = this.owned(p.id);
      if (!mine.length) break;
      const byPrice = (a, b) => TILES[a].price - TILES[b].price;
      const up = mine.filter(i => this.stage[i] > 1).sort(byPrice)[0];
      if (up !== undefined) {
        this.stage[up]--;
        const back = r5(TILES[up].price * 0.3);
        p.budget += back;
        ev.push({ t: 'stage', tile: up, stage: this.stage[up], p: p.id, down: true }, { t: 'cash', p: p.id, amt: back, why: 'sold' });
      } else {
        const s = mine.sort(byPrice)[0];
        this.owner[s] = null;
        this.stage[s] = 0;
        const back = r5(TILES[s].price * 0.5);
        p.budget += back;
        ev.push({ t: 'own', tile: s, p: null, from: p.id }, { t: 'cash', p: p.id, amt: back, why: 'sold' });
      }
    }
    let paid = amt;
    if (p.budget < 0) {
      paid = amt + p.budget;
      p.budget = 0;
      p.out = true;
      ev.push({ t: 'out', p: p.id });
    }
    if (to) {
      to.budget += paid;
      to.stats.fees += paid;
      ev.push({ t: 'cash', p: to.id, amt: paid, why });
    }
    return paid;
  }

  buy(p, i) {
    const ev = [], t = TILES[i];
    p.budget -= this.price(p, i);
    ev.push({ t: 'cash', p: p.id, amt: -this.price(p, i), why: 'map' });
    this.owner[i] = p.id;
    this.stage[i] = 1;
    p.stats.built++;
    ev.push({ t: 'own', tile: i, p: p.id });
    this.gain(p, t.type === 'market' ? r5(t.price * 0.4) : 60, 'map', ev);
    if (t.type === 'market' && this.full(p.id, t.sector)) ev.push({ t: 'set', p: p.id, sector: t.sector });
    this.checkOver();
    return ev;
  }

  upgrade(p, i) {
    const ev = [], cost = this.upgradeCost(p, i);
    p.budget -= cost;
    ev.push({ t: 'cash', p: p.id, amt: -cost, why: 'upgrade' });
    this.stage[i]++;
    p.stats.built++;
    ev.push({ t: 'stage', tile: i, stage: this.stage[i], p: p.id });
    this.gain(p, r5(TILES[i].price * 0.5), 'upgrade', ev);
    this.checkOver();
    return ev;
  }

  settle(p, i) {
    const ev = [], o = this.players[this.owner[i]];
    let f = this.fee(i);
    if (p.perks.armor) f = r5(f * 0.75);
    this.charge(p, f, o, 'fee', ev);
    this.gain(o, this.pipe(i, false), 'booked', ev);
    this.checkOver();
    return ev;
  }

  visit(p, i) {
    const ev = [];
    this.gain(p, this.pipe(i, true), 'worked', ev);
    this.checkOver();
    return ev;
  }

  draw(deck) {
    const src = deck === 'signal' ? SIGNALS : BRAINS;
    if (!this.decks[deck].length) {
      const a = src.map((_, i) => i);
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      this.decks[deck] = a;
    }
    return src[this.decks[deck].pop()];
  }

  roll() { return [1 + Math.floor(this.rnd() * 6), 1 + Math.floor(this.rnd() * 6)]; }

  checkOver() {
    if (this.over) return true;
    const alive = this.alive();
    const top = [...alive].sort((a, b) => b.pipeline - a.pipeline || b.budget - a.budget)[0];
    const humans = this.players.filter(p => !p.ai);
    if (top.pipeline >= TARGET) this.reason = 'target';
    else if (alive.length === 1) this.reason = 'last';
    else if (humans.length && humans.every(p => p.out)) this.reason = 'bust';
    else if (this.round > MAX_ROUNDS) this.reason = 'rounds';
    else return false;
    this.over = true;
    this.winner = top;
    return true;
  }

  endTurn() {
    if (this.over) return;
    do {
      this.turn = (this.turn + 1) % this.players.length;
      if (this.turn === 0) this.round++;
    } while (this.players[this.turn].out);
    this.checkOver();
  }

  /* ---------- AI ---------- */
  aiBuy(p, i) {
    const t = TILES[i], price = this.price(p, i), left = p.budget - price;
    if (left < 0) return false;
    if (t.type === 'market' && this.sectorTiles(t.sector).every(k => k === i || this.owner[k] === p.id)) return true;
    if (p.persona === 'spray') return left >= 30;
    if (p.persona === 'bigname') return (t.price >= 150) && left >= 160;
    if (p.persona === 'smart') return left >= 70;
    return left >= 60 && this.rnd() < 0.6;
  }

  aiUpgrades(p) {
    const list = this.owned(p.id).filter(i => TILES[i].type === 'market' && this.stage[i] < 3)
      .sort((a, b) => (this.full(p.id, TILES[b].sector) - this.full(p.id, TILES[a].sector)) || TILES[b].price - TILES[a].price);
    const reserve = { spray: 520, bigname: 200, smart: 110, intern: 90 }[p.persona] || 100;
    const out = [];
    let budget = p.budget;
    for (const i of list) {
      const cost = this.upgradeCost(p, i);
      if (budget - cost < reserve) continue;
      if (p.persona === 'intern' && this.rnd() < 0.55) continue;
      out.push(i);
      budget -= cost;
      if (out.length >= 2) break;
    }
    return out;
  }

  /* ---------- turn flow (io supplies animation and decisions) ---------- */
  async moveBy(p, steps, io) {
    const path = [], ev = [];
    let kick = -1;
    for (let s = 0; s < steps; s++) {
      p.pos = (p.pos + 1) % N;
      path.push(p.pos);
      if (p.pos === 0) {
        p.laps++;
        kick = s;
        this.cash(p, KICKOFF + (p.perks.kick ? 60 : 0), 'kickoff', ev);
      }
    }
    await io.move(p, path, kick, ev);
  }

  async resolve(p, io, depth = 0) {
    const i = p.pos, t = TILES[i];
    if (t.type === 'market' || t.type === 'channel') {
      if (this.owner[i] === null) {
        const price = this.price(p, i);
        if (p.budget >= price) {
          if (await io.offer(p, i, price)) await io.events(p, this.buy(p, i), i);
        } else await io.note(p, 'short', i);
      } else if (this.owner[i] === p.id) {
        await io.events(p, this.visit(p, i), i);
        if (!this.over && this.canUpgrade(p, i) && await io.offerUpgrade(p, i, this.upgradeCost(p, i))) await io.events(p, this.upgrade(p, i), i);
      } else {
        await io.note(p, 'fee', i);
        await io.events(p, this.settle(p, i), i);
      }
    } else if (t.type === 'signal' || t.type === 'brain') {
      const card = this.draw(t.type), ev = [];
      p.stats.cards++;
      await io.card(p, card, t.type);
      const mv = card.fn(this, p, ev) || null;
      this.checkOver();
      await io.events(p, ev, i);
      if (mv && !this.over && !p.out) {
        if (mv.jump !== undefined) { p.pos = mv.jump; await io.jump(p, mv.jump); }
        else await this.moveBy(p, mv.by !== undefined ? mv.by : (mv.to - p.pos + N) % N, io);
        if (depth < 2) await this.resolve(p, io, depth + 1);
      }
    } else if (t.type === 'spam') {
      if (p.perks.shield) { delete p.perks.shield; await io.note(p, 'shield', i); }
      else { p.skip = true; await io.note(p, 'spam', i); }
    } else if (t.type === 'board') {
      const ev = [], due = Math.max(40, r5(p.budget * 0.12));
      await io.note(p, 'board', i, due);
      this.charge(p, due, null, 'board', ev);
      this.checkOver();
      await io.events(p, ev, i);
    } else if (t.type === 'kickoff') {
      const ev = [];
      this.cash(p, 75, 'kickoff', ev);
      await io.note(p, 'kickoff', i);
      await io.events(p, ev, i);
    }
  }

  async takeTurn(io) {
    const p = this.current;
    if (p.skip) {
      p.skip = false;
      await io.note(p, 'skipped', p.pos);
      return this.endTurn();
    }
    let rolls = 0, again = true;
    while (again && !this.over && !p.out) {
      await io.ready(p, rolls);
      if (this.over) break;
      const [a, b] = this.roll();
      rolls++;
      await io.roll(p, a, b);
      await this.moveBy(p, a + b, io);
      if (!this.over) await this.resolve(p, io);
      again = a === b && rolls < 3 && !p.skip && !p.out && !this.over;
      if (again) await io.note(p, 'doubles', p.pos);
    }
    this.endTurn();
  }
}

/* ---------- headless io for simulations ---------- */
export function autoIO(g) {
  const nop = async () => {};
  return {
    ready: async p => { for (const i of g.aiUpgrades(p)) g.upgrade(p, i); },
    roll: nop, move: nop, jump: nop, events: nop, card: nop, note: nop,
    offer: async (p, i) => g.aiBuy(p, i),
    offerUpgrade: async p => p.persona !== 'spray'
  };
}
