/* Juego de sagas · interfaz y turnos. Todos los textos, colores y piezas vienen de la edición. */
import { Game, TILES, SECTORS, STAGES, PERKS, TARGET, KICKOFF, MAX_ROUNDS, SET_BONUS, money, applyEdition } from './rules.js?v=1116a';
import { createBoard } from './board3d.js?v=1116a';
import { EDITIONS, DEFAULT } from './ediciones/lista.js?v=1116a';

/* ---------- which edition: ?ed=… in the address, otherwise the last one played here ---------- */
const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } } };
const asked = new URLSearchParams(location.search).get('ed');
let edId = [asked, store.get('sagas.edicion'), DEFAULT].find(id => id && EDITIONS.some(e => e.id === id && e.ready));
const ED = (await import(`./ediciones/${edId}/edicion.js?v=1116a`)).default;
store.set('sagas.edicion', edId);
applyEdition(ED.rules);
STAGES.splice(0, 3, ...ED.stages);
const T = ED.T, score = ED.score;

document.title = T.docTitle;
document.getElementById('font-link').href = ED.fontsHref;
Object.entries(ED.css).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
document.querySelector('meta[name="description"]')?.setAttribute('content', T.lead);

const ROSTER = ED.roster;
const $ = s => document.querySelector(s);
const ARROW = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

let g = null, board = null, phase = 'idle', rollResolve = null, modalResolve = null, speed = 1, viewer = 0, overview = false, stopConfetti = null, shownAge = 0, me = 0;

/* ---------- sound ---------- */
const AC = window.AudioContext || window.webkitAudioContext;
let ac = null, muted = false;
function tone(freq, dur, type = 'sine', vol = 0.07, when = 0, slide = 0) {
  if (!ac || muted) return;
  const t = ac.currentTime + when, o = ac.createOscillator(), v = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.linearRampToValueAtTime(Math.max(40, freq + slide), t + dur);
  v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(vol, t + 0.012); v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(v).connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, vol = 0.1, when = 0, hp = 900) {
  if (!ac || muted) return;
  const n = Math.floor(ac.sampleRate * dur), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), v = ac.createGain();
  s.buffer = b; f.type = 'highpass'; f.frequency.value = hp; v.gain.value = vol;
  s.connect(f).connect(v).connect(ac.destination); s.start(ac.currentTime + when);
}
const sfx = Object.assign({
  step: () => tone(500 + Math.random() * 90, 0.06, 'triangle', 0.045),
  dice: () => { for (let i = 0; i < 7; i++) noise(0.035, 0.13, i * 0.1 + Math.random() * 0.04, 1400); },
  coin: () => { tone(880, 0.09, 'triangle', 0.06); tone(1320, 0.16, 'triangle', 0.06, 0.07); },
  pay: () => { tone(330, 0.12, 'sawtooth', 0.035); tone(220, 0.2, 'sawtooth', 0.035, 0.09); },
  pipe: () => { tone(660, 0.1, 'sine', 0.06); tone(990, 0.1, 'sine', 0.06, 0.08); tone(1320, 0.22, 'sine', 0.05, 0.16); },
  build: () => { noise(0.09, 0.14, 0, 500); tone(196, 0.22, 'triangle', 0.08); tone(784, 0.28, 'sine', 0.05, 0.1); },
  card: () => noise(0.2, 0.06, 0, 2200),
  spam: () => tone(190, 0.36, 'square', 0.04, 0, -70),
  turn: () => { tone(740, 0.08, 'sine', 0.05); tone(988, 0.12, 'sine', 0.05, 0.08); },
  win: () => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.34, 'triangle', 0.08, i * 0.12))
}, ED.sfx ? ED.sfx({ tone, noise }) : {});

/* ---------- small helpers ---------- */
const wait = ms => board.wait(ms);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const signed = n => (n > 0 ? '+' : '−') + money(Math.abs(n));
const signedScore = n => (n > 0 ? '+' : '−') + score(Math.abs(n));
const lastFloat = {};
const humans = () => g.players.filter(x => !x.ai).length;

function float(pid, text, cls) {
  const pt = board.tokenScreen(pid);
  if (!pt.ok) return;
  const now = performance.now(), lf = lastFloat[pid] || { t: 0, n: 0 };
  lf.n = now - lf.t < 900 ? lf.n + 1 : 0; lf.t = now; lastFloat[pid] = lf;
  const el = document.createElement('div');
  el.className = 'float ' + cls;
  el.textContent = text;
  el.style.left = pt.x + 'px';
  el.style.top = pt.y - lf.n * 26 + 'px';
  $('#fx').appendChild(el);
  setTimeout(() => el.remove(), 1700);
}

function toast(html, color) {
  const el = document.createElement('div');
  el.className = 'toast';
  if (color) el.style.setProperty('--c', color);
  el.innerHTML = html;
  $('#toasts').appendChild(el);
  setTimeout(() => el.classList.add('bye'), 2600);
  setTimeout(() => el.remove(), 3100);
}

function log(html, pid) {
  const el = document.createElement('li');
  if (pid !== undefined && pid !== null) el.style.setProperty('--c', g.players[pid].color);
  el.innerHTML = html;
  const ul = $('#log');
  ul.prepend(el);
  while (ul.children.length > 60) ul.lastChild.remove();
}

function dock(html, button) {
  $('#dock-msg').innerHTML = html;
  const b = $('#roll');
  b.hidden = !button;
  if (button) b.focus({ preventScroll: true });
}

/* ---------- player cards ---------- */
function buildPlayers() {
  $('#players').innerHTML = g.players.map(p => `
    <div class="pc" id="pc${p.id}" style="--c:${p.color}">
      <div class="pc-top"><i class="chip"></i><b><span class="nm-long">${esc(p.name)}</span><span class="nm-short">${esc(p.short ? p.short.charAt(0) + p.short.slice(1).toLowerCase() : p.name)}</span></b>${p.ai ? '' : `<em>${p.id === 0 ? T.you : T.human}</em>`}<span class="tag"></span></div>
      <div class="pc-pipe"><div class="bar"><i></i></div><div class="pc-nums"><span class="pv"></span><span class="pt">${T.pipeOf(score(TARGET))}</span></div></div>
      <div class="pc-row"><span>${T.budget}</span><b class="bv"></b></div>
      <div class="pc-meta"></div>
    </div>`).join('');
}

function updatePlayers() {
  const lead = Math.max(...g.players.map(p => p.pipeline));
  g.players.forEach(p => {
    const el = $('#pc' + p.id), mine = g.owned(p.id), mk = mine.filter(i => TILES[i].type === 'market').length, ch = mine.length - mk;
    el.classList.toggle('on', !g.over && g.current.id === p.id);
    el.classList.toggle('out', p.out);
    el.classList.toggle('lead', lead > 0 && p.pipeline === lead);
    el.querySelector('.bar i').style.width = Math.min(100, (p.pipeline / TARGET) * 100) + '%';
    el.querySelector('.pv').textContent = score(p.pipeline);
    el.querySelector('.bv').textContent = money(p.budget);
    el.querySelector('.tag').textContent = p.out ? T.tagOut : p.skip ? T.tagSkip : '';
    const perks = Object.keys(p.perks).map(k => `<span class="perk" title="${esc(PERKS[k].title + ': ' + PERKS[k].text)}">${esc(PERKS[k].short || PERKS[k].title.split(' ').slice(0, 2).join(' '))}</span>`).join('');
    el.querySelector('.pc-meta').innerHTML = `<span>${T.count(mk, 'market')}</span><span>${T.count(ch, 'channel')}</span>${perks}`;
  });
  $('#round').textContent = T.round(Math.min(g.round, MAX_ROUNDS), MAX_ROUNDS);
}

/* ---------- your tiles panel ---------- */
function updateMine() {
  const p = g.players[viewer], mine = g.owned(p.id), can = phase === 'ready' && g.current.id === p.id;
  $('#mine-title').textContent = p.ai ? p.name : (humans() > 1 ? T.mineOther(p.name) : T.mineTitle);
  if (!mine.length) { $('#mine').innerHTML = `<li class="empty">${T.mineEmpty}</li>`; return; }
  $('#mine').innerHTML = mine.map(i => {
    const t = TILES[i];
    if (t.type === 'channel') return `<li><i class="dot" style="background:var(--accent)"></i><div><b>${esc(t.name)}</b><span>${T.channelLine(money(g.fee(i)))}</span></div></li>`;
    const full = g.full(p.id, t.sector), pips = [1, 2, 3].map(s => `<i class="${s <= g.stage[i] ? 'on' : ''}"></i>`).join('');
    const up = g.stage[i] < 3 ? `<button class="up" data-up="${i}" ${can && g.canUpgrade(p, i) ? '' : 'disabled'}>${STAGES[g.stage[i]]} · ${money(g.upgradeCost(p, i))}</button>` : `<span class="max">${STAGES[2]}</span>`;
    return `<li><i class="dot" style="background:${SECTORS[t.sector].color}"></i><div><b>${esc(t.name)}${full ? ' <em>×' + SET_BONUS + '</em>' : ''}</b><span><span class="pips">${pips}</span>${T.stageLine(STAGES[g.stage[i] - 1], money(g.fee(i)))}</span></div>${up}</li>`;
  }).join('');
}

/* the world in the middle follows the game */
function syncWorld() {
  if (!g || !board) return;
  Object.keys(SECTORS).forEach(k => {
    let level = 0;
    const sum = {};
    g.sectorTiles(k).forEach(i => { const o = g.owner[i]; if (o !== null) { level = Math.max(level, g.stage[i]); sum[o] = (sum[o] || 0) + g.stage[i]; } });
    const top = Object.keys(sum).sort((a, b) => sum[b] - sum[a])[0];
    board.world.sector(k, level, top === undefined ? null : g.players[top].color, top !== undefined && g.full(+top, k));
  });
  const lead = [...g.players].sort((a, b) => b.pipeline - a.pipeline)[0];
  const age = board.world.leader(lead.pipeline, lead.pipeline > 0 ? lead.color : null);
  if (age !== shownAge) {
    if (age > shownAge) { toast(T.ageToast(ED.ages[age]), lead.color); sfx.pipe(); log(T.ageLog(esc(lead.name), ED.ages[age]), lead.id); }
    shownAge = age;
    $('#age').textContent = T.age(ED.ages[age]);
  }
  board.daylight((g.round - 1) / 20);
}

function updateAll() { updatePlayers(); updateMine(); syncWorld(); }

/* ---------- cards & modals ---------- */
function sectorDots(t) {
  return g.sectorTiles(t.sector).map(k => {
    const o = g.owner[k];
    return `<span class="sd" title="${esc(TILES[k].name)}"><i style="background:${o === null ? 'transparent' : g.players[o].color}"></i>${esc(TILES[k].name)}</span>`;
  }).join('');
}

function marketCard(i, p, mode) {
  const t = TILES[i], isM = t.type === 'market', sec = isM ? SECTORS[t.sector] : { name: T.channelWord, color: 'var(--accent)' };
  const o = g.owner[i], pid = o === null ? p.id : o;
  let table;
  if (isM) {
    table = `<table><thead><tr>${T.th.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${[1, 2, 3].map(s => `<tr class="${o !== null && g.stage[i] === s ? 'cur' : ''}"><td>${STAGES[s - 1]}</td><td>${money(g.fee(i, s, pid))}</td><td>${score(g.pipe(i, false, s, pid))}</td></tr>`).join('')}</tbody></table>
      <div class="sector"><span>${T.sectorWord}</span>${sectorDots(t)}</div><p class="note">${T.setNote(SET_BONUS)}</p>`;
  } else {
    table = `<table><thead><tr>${T.chTh.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${[1, 2, 3, 4].map(n => `<tr class="${o !== null && g.channels(o) === n ? 'cur' : ''}"><td>${n}</td><td>${money(30 * 2 ** (n - 1))}</td><td>${score(70 * n)}</td></tr>`).join('')}</tbody></table><p class="note">${T.chNote}</p>`;
  }
  const owner = o === null ? '' : `<p class="owner"><i style="background:${g.players[o].color}"></i>${esc(g.players[o].name)}${isM ? ' · ' + STAGES[g.stage[i] - 1] : ''}</p>`;
  let btn = `<div class="btns"><button class="cta" data-v="1">${T.close}</button></div>`;
  if (mode === 'buy') btn = `<div class="btns"><button class="cta" data-v="1">${T.buy(money(g.price(p, i)))} ${ARROW}</button><button class="ghost" data-v="0">${T.skip}</button></div><p class="fine">${T.buyFine(money(p.budget), score(isM ? Math.round(t.price * 0.4 / 5) * 5 : 60))}</p>`;
  if (mode === 'upgrade') btn = `<div class="btns"><button class="cta" data-v="1">${T.upgradeBtn(STAGES[g.stage[i]], money(g.upgradeCost(p, i)))} ${ARROW}</button><button class="ghost" data-v="0">${T.notNow}</button></div><p class="fine">${T.haveFine(money(p.budget))}</p>`;
  return `<div class="card mk" style="--s:${sec.color}"><div class="band"><span>${esc(sec.name)}</span><b>${money(t.price)}</b></div><h2>${esc(t.name)}</h2>${owner}${table}${btn}</div>`;
}

function ask(html) {
  const m = $('#modal');
  m.innerHTML = html;
  m.classList.add('show');
  const first = m.querySelector('[data-v]');
  if (first) first.focus({ preventScroll: true });
  return new Promise(res => { modalResolve = v => { modalResolve = null; m.classList.remove('show'); res(v); }; });
}
$('#modal').addEventListener('click', ev => { const b = ev.target.closest('[data-v]'); if (b && modalResolve) modalResolve(b.dataset.v === '1'); });

async function showCard(p, card, deck) {
  const html = `<div class="card ev ${deck}"><div class="band"><span>${T.deckHead[deck]}</span><b>${esc(p.name)}</b></div><h2>${esc(card.title)}</h2><p>${esc(card.text)}</p><div class="effect">${esc(card.effect)}</div>${p.ai ? '' : `<div class="btns"><button class="cta" data-v="1">${T.ok} ${ARROW}</button></div>`}</div>`;
  log(T.logDraw(esc(p.name), esc(card.title)), p.id);
  if (!p.ai) return ask(html);
  const m = $('#modal');
  m.innerHTML = html; m.classList.add('show', 'passive');
  await wait(2100);
  m.classList.remove('show', 'passive');
  await wait(200);
}

/* ---------- events ---------- */
async function showEvents(p, evs) {
  for (const e of evs) {
    const pl = e.p !== null && e.p !== undefined ? g.players[e.p] : null;
    let pause = 260;
    if (e.t === 'cash') { if (!e.amt) continue; float(e.p, signed(e.amt), e.amt > 0 ? 'pos' : 'neg'); (e.amt > 0 ? sfx.coin : sfx.pay)(); }
    else if (e.t === 'pipe') { float(e.p, T.floatScore(signedScore(e.amt)), e.amt > 0 ? 'pipe' : 'neg'); if (e.amt > 0) sfx.pipe(); }
    else if (e.t === 'own') {
      pause = 520;
      const tn = esc(TILES[e.tile].name);
      if (e.p === null) { board.setTile(e.tile, null, 0); log(T.logGiveUp(esc(g.players[e.from].name), tn), e.from); }
      else { board.setTile(e.tile, pl.color, 1, true, pl.short || pl.name); board.pulse(e.tile, 1400, pl.color); sfx.build(); log(T.logMap(esc(pl.name), tn), e.p); }
    } else if (e.t === 'stage') {
      pause = 520;
      const tn = esc(TILES[e.tile].name);
      board.setTile(e.tile, pl.color, e.stage, true, pl.short || pl.name); board.pulse(e.tile, 1200, pl.color); sfx.build();
      log(e.down ? T.logScaleBack(esc(pl.name), tn, STAGES[e.stage - 1]) : T.logUpgrade(esc(pl.name), tn, STAGES[e.stage - 1]), e.p);
    } else if (e.t === 'perk') { toast(`<b>${esc(PERKS[e.perk].title)}</b> ${esc(PERKS[e.perk].text)}`, pl.color); }
    else if (e.t === 'set') { pause = 700; toast(T.setToast(esc(pl.name), esc(SECTORS[e.sector].name), SET_BONUS), pl.color); sfx.turn(); log(T.setLog(esc(pl.name), esc(SECTORS[e.sector].name)), e.p); }
    else if (e.t === 'out') { pause = 900; board.setOut(e.p); sfx.spam(); toast(T.outToast(esc(pl.name)), pl.color); log(T.outLog(esc(pl.name)), e.p); }
    updateAll();
    await wait(pause);
  }
}

/* ---------- io: how the rules talk to the screen ---------- */
const pd = p => `<i class="pdot" style="background:${p.color}"></i>`;
const io = {
  async ready(p, rolls) {
    if (!p.ai) viewer = p.id;
    board.setActive(p.id);
    updateAll();
    await board.focus(p.pos, 800);
    if (p.ai) {
      dock(pd(p) + T.dockPlaying(esc(p.name)), false);
      await wait(420);
      for (const i of g.aiUpgrades(p)) { await showEvents(p, g.upgrade(p, i)); if (g.over) return; }
      return;
    }
    sfx.turn();
    phase = 'ready';
    updateMine();
    dock(pd(p) + (rolls ? T.dockDoubles : T.dockTurn(humans() > 1 ? esc(p.name) : null)), true);
    await new Promise(res => { rollResolve = res; });
    rollResolve = null;
    phase = 'busy';
    updateMine();
  },
  async roll(p, a, b) {
    dock(pd(p) + T.dockRolling, false);
    sfx.dice();
    await board.rollDice(a, b);
    dock(pd(p) + T.dockRolled(esc(p.name), `<span class="die">${a}</span><span class="die">${b}</span>`, a === b), false);
  },
  async move(p, path, kick, ev) {
    const dest = path[path.length - 1];
    setTimeout(() => board.hideDice(), 500 / speed);
    board.focus(dest, 175 * path.length + 400);
    let shown = false;
    await board.moveToken(p.id, path, i => { sfx.step(); if (i === 0 && kick >= 0 && !shown) { shown = true; board.world.event('birds', p.color); showEvents(p, ev); log(T.logKickoff(esc(p.name)), p.id); } });
    board.pulse(dest);
    updateAll();
    await wait(280);
  },
  async jump(p, i) { board.focus(i, 900); await board.jumpToken(p.id, i); board.pulse(i); await wait(200); },
  events: showEvents,
  async offer(p, i) {
    if (p.ai) { await wait(520); const yes = g.aiBuy(p, i); if (!yes) log(T.logPass(esc(p.name), esc(TILES[i].name)), p.id); return yes; }
    return ask(marketCard(i, p, 'buy'));
  },
  async offerUpgrade(p, i) {
    if (p.ai) { await wait(360); return g.aiUpgrades(p).includes(i); }
    return ask(marketCard(i, p, 'upgrade'));
  },
  async card(p, card, deck) { sfx.card(); board.drawCard(deck); board.world.event(deck === 'brain' ? 'learning' : 'signal', p.color); await wait(300); await showCard(p, card, deck); },
  async note(p, kind, i, extra) {
    const t = TILES[i], n = esc(p.name), tn = esc(t.name);
    if (kind === 'fee') { const o = g.players[g.owner[i]], m = T.noteFee(n, esc(o.name), tn); log(m.log, p.id); toast(m.toast, o.color); await wait(500); }
    else if (kind === 'short') { const m = T.noteShort(n, tn); log(m.log, p.id); if (!p.ai) toast(m.toast, p.color); await wait(500); }
    else if (kind === 'spam') { const m = T.noteSpam(n); sfx.spam(); board.world.event('storm', p.color); log(m.log, p.id); toast(m.toast, 'var(--bad)'); await wait(900); }
    else if (kind === 'shield') { const m = T.noteShield(n); log(m.log, p.id); toast(m.toast, p.color); await wait(800); }
    else if (kind === 'skipped') { const m = T.noteSkipped(n); board.setActive(p.id); updateAll(); await board.focus(p.pos, 700); dock(pd(p) + m.dock, false); log(m.log, p.id); await wait(1100); }
    else if (kind === 'board') { const m = T.noteBoard(n, money(extra)); board.world.event('airship', p.color); log(m.log, p.id); toast(m.toast, p.color); await wait(600); }
    else if (kind === 'kickoff') { log(T.noteKickoff(n), p.id); await wait(200); }
    else if (kind === 'doubles') { log(T.noteDoubles(n), p.id); await wait(250); }
  }
};

/* ---------- start / end ---------- */
function setupScreen() {
  $('#kicker').textContent = T.kicker;
  $('#h1').innerHTML = T.h1; $('#h1').className = T.h1Class || '';
  $('#lead').textContent = T.lead;
  $('#how').innerHTML = T.how.map(h => `<li><b>${h[0]}</b>${h[1]}</li>`).join('');
  $('#start-fine').textContent = T.startFine;
  $('#fan').textContent = T.fan;
  $('#brand').innerHTML = T.brand;
  $('#goal-text').innerHTML = T.goal(score(TARGET));
  $('#age').textContent = T.age(ED.ages[0]);
  $('#log-title').textContent = T.logTitle;
  $('#roll').innerHTML = T.roll + ' <kbd>espacio</kbd>';
  renderSlots();
  $('#slots').addEventListener('click', ev => {
    const who = ev.target.closest('.who');
    if (who) { me = +who.dataset.i; renderSlots(); return; }
    const b = ev.target.closest('button[data-m]');
    if (!b) return;
    b.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
  });
}

function renderSlots() {
  const keep = {};
  document.querySelectorAll('.seg').forEach(s => { keep[s.dataset.slot] = s.querySelector('.on').dataset.m; });
  $('#slots').innerHTML = ROSTER.map((r, i) => `
    <div class="slot ${i === me ? 'me' : ''}" style="--c:${r.color}"><button class="who" data-i="${i}" type="button" title="${T.pickHint}"><i class="chip"></i><div><b>${i === me ? T.youAs(r.name) : r.name}</b><span>${r.blurb}</span></div></button>
    ${i === me ? `<span class="fixed">${T.human}</span>` : `<div class="seg" data-slot="${i}">${['ai', 'human', 'off'].map(m => `<button data-m="${m}" class="${(keep[i] || 'ai') === m ? 'on' : ''}">${T.seg[m]}</button>`).join('')}</div>`}</div>`).join('');
}

async function startGame() {
  if (AC && !ac) { try { ac = new AC(); } catch (e) { ac = null; } }
  const cfg = [Object.assign({}, ROSTER[me], { ai: false })];
  document.querySelectorAll('.seg').forEach(s => {
    const m = s.querySelector('.on').dataset.m, r = ROSTER[+s.dataset.slot];
    if (m !== 'off') cfg.push(Object.assign({}, r, { ai: m === 'ai' }));
  });
  g = new Game(cfg);
  g.players.forEach((p, i) => { p.short = cfg[i].short; });
  window.__game = g;
  $('#start').classList.add('gone');
  document.body.classList.add('playing');
  board.autoRotate(false);
  board.shiftView(0, 900);
  buildPlayers();
  updateAll();
  board.addPlayers(g.players.map((p, i) => ({ id: p.id, color: p.color, shape: cfg[i].shape })));
  log(T.logStart(score(TARGET)));
  await board.overview(false);
  await wait(500);
  while (!g.over) await g.takeTurn(io);
  endGame();
}

function endGame() {
  phase = 'over';
  document.body.classList.add('over');
  board.setActive(null);
  updateAll();
  dock('', false);
  const rank = [...g.players].sort((a, b) => (a.out - b.out) || b.pipeline - a.pipeline || b.budget - a.budget), w = g.winner, humanWon = !w.ai;
  const why = T.why(g.reason, score(TARGET), MAX_ROUNDS);
  if (humanWon) sfx.win(); else sfx.spam();
  stopConfetti = board.celebrate(humanWon ? ED.confetti : [w.color, ED.confetti[0]]);
  board.autoRotate(true);
  board.overview(true);
  board.shiftView(0.2, 900);
  $('#end-inner').innerHTML = `
    <p class="kicker">${T.endKicker(Math.min(g.round, MAX_ROUNDS))}</p>
    <h1 class="${T.h1Class || ''}">${humanWon ? T.endWin(esc(w.name)) : T.endLose(esc(w.name))}</h1>
    <p class="lead">${esc(w.name)} ${why}. ${humanWon ? T.endLeadWin : T.endLeadLose}</p>
    <ol class="rank">${rank.map((p, i) => `<li style="--c:${p.color}" class="${p.id === w.id ? 'win' : ''}"><span>${i + 1}</span><i class="chip"></i><b>${esc(p.name)}</b><em>${score(p.pipeline)}</em><small>${T.rankSmall(g.owned(p.id).length, money(p.budget), p.out)}</small></li>`).join('')}</ol>
    <div class="btns"><button class="cta" id="again">${T.again} ${ARROW}</button><button class="ghost" id="share">${T.share}</button></div>`;
  $('#end').classList.add('show');
  $('#again').addEventListener('click', backToStart);
  $('#share').addEventListener('click', async ev => {
    const mine = g.players[0], pos = rank.indexOf(mine) + 1, here = /^https?:/.test(location.protocol) && !/^(localhost|127\.|\[::1\])/.test(location.hostname) ? location.href : '';
    const text = T.shareText(pos, esc(mine.name), score(mine.pipeline), g.owned(0).length, here);
    try {
      await navigator.clipboard.writeText(text);
      ev.target.textContent = T.copied;
    } catch (e) {
      let box = $('#share-text');
      if (!box) { box = document.createElement('textarea'); box.id = 'share-text'; box.className = 'sharebox'; box.readOnly = true; box.rows = 3; $('#end-inner').appendChild(box); }
      box.value = text; box.focus(); box.select();
      ev.target.textContent = T.selectCopy;
    }
  });
}

function backToStart() {
  if (stopConfetti) { stopConfetti(); stopConfetti = null; }
  board.reset();
  document.body.classList.remove('playing', 'over');
  $('#end').classList.remove('show');
  $('#modal').classList.remove('show', 'passive');
  $('#log').innerHTML = ''; $('#players').innerHTML = ''; $('#mine').innerHTML = '';
  $('#b-view').classList.remove('on');
  phase = 'idle'; viewer = 0; overview = false; g = null; shownAge = 0; $('#age').textContent = T.age(ED.ages[0]);
  $('#start').classList.remove('gone');
  board.overview(false);
  board.shiftView(0.2, 900);
  board.autoRotate(true);
}

/* ---------- the secret: tap the title five times in a row ---------- */
let taps = [];
function secretTap() {
  const now = performance.now();
  taps = taps.filter(t => now - t < 2500).concat(now);
  if (taps.length >= 5 && !modalResolve) { taps = []; openPicker(); }
}
document.querySelectorAll('.secret').forEach(el => el.addEventListener('click', secretTap));
async function openPicker() {
  const html = `<div class="card ev picker"><div class="band"><span>${T.pickerBand}</span><b></b></div><h2>${T.pickerTitle}</h2><p>${T.pickerText}</p>
    ${EDITIONS.map(e => `<button class="ed ${e.id === edId ? 'cur' : ''}" style="--e:${e.color}" data-ed="${e.id}" ${e.ready ? '' : 'disabled'}><i></i><div><b>${e.name}</b><span>${e.ready ? (e.id === edId ? T.pickerNow : e.blurb) : T.pickerSoon}</span></div></button>`).join('')}
    <div class="btns"><button class="ghost" data-v="0">${T.close}</button></div></div>`;
  const m = $('#modal');
  m.addEventListener('click', function pick(ev) {
    const b = ev.target.closest('[data-ed]');
    if (!b || b.disabled) return;
    m.removeEventListener('click', pick);
    if (b.dataset.ed === edId) { if (modalResolve) modalResolve(false); return; }
    store.set('sagas.edicion', b.dataset.ed);
    const u = new URL(location.href); u.searchParams.set('ed', b.dataset.ed); location.href = u.toString();
  });
  await ask(html);
}

/* ---------- input ---------- */
function roll() { if (phase === 'ready' && rollResolve && !modalResolve) rollResolve(); }
$('#roll').addEventListener('click', roll);
document.addEventListener('keydown', ev => {
  if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
  if (modalResolve) { if (ev.key === 'Escape' || ev.key === 'Backspace') { ev.preventDefault(); modalResolve(false); } return; }
  if ((ev.key === ' ' || ev.key === 'Enter') && phase === 'ready' && document.activeElement.tagName !== 'BUTTON') { ev.preventDefault(); roll(); }
});
$('#mine').addEventListener('click', async ev => {
  const b = ev.target.closest('[data-up]');
  if (!b || phase !== 'ready' || modalResolve) return;
  const p = g.current, i = +b.dataset.up;
  if (!g.canUpgrade(p, i)) return;
  phase = 'busy';
  board.focus(i, 600);
  await showEvents(p, g.upgrade(p, i));
  if (g.over) { if (rollResolve) rollResolve(); return; }
  phase = 'ready';
  updateMine();
});
$('#b-speed').addEventListener('click', ev => { speed = speed === 1 ? 2 : speed === 2 ? 4 : 1; board.speed(speed); ev.currentTarget.textContent = speed + '×'; });
$('#b-sound').addEventListener('click', ev => { muted = !muted; ev.currentTarget.classList.toggle('off', muted); ev.currentTarget.setAttribute('aria-pressed', String(!muted)); });
$('#b-view').addEventListener('click', ev => { overview = !overview; board.overview(overview); ev.currentTarget.classList.toggle('on', overview); });
$('#b-help').addEventListener('click', () => { if (!modalResolve) ask(`<div class="card ev help"><div class="band"><span>${T.helpBand}</span><b></b></div><h2>${T.helpTitle}</h2><ol>${T.help(score(TARGET), money(KICKOFF), MAX_ROUNDS).map(l => `<li>${l}</li>`).join('')}</ol><div class="btns"><button class="cta" data-v="1">${T.gotIt}</button></div></div>`); });
$('#go').addEventListener('click', startGame);

/* ---------- tile tooltip ---------- */
function tip(i, x, y) {
  const el = $('#tip');
  if (i === null || i === undefined || !g) { el.classList.remove('show'); return; }
  const t = TILES[i], o = g.owner[i];
  let body;
  if (t.type === 'market' || t.type === 'channel') {
    body = o === null ? `<span>${T.tipFree(money(t.price))}</span>` : `<span><i style="background:${g.players[o].color}"></i>${esc(g.players[o].name)}${t.type === 'market' ? ' · ' + STAGES[g.stage[i] - 1] : ''}</span><span>${T.tipFee(money(g.fee(i)))}</span>`;
    if (t.type === 'market') body = `<em style="color:${SECTORS[t.sector].color}">${esc(SECTORS[t.sector].name)}</em>` + body;
  } else body = `<span>${T.tipSpecial(money(KICKOFF))[t.type]}</span>`;
  el.innerHTML = `<b>${esc(t.name)}</b>${body}`;
  el.style.left = Math.min(window.innerWidth - 240, x + 16) + 'px';
  el.style.top = Math.max(10, y - 20) + 'px';
  el.classList.add('show');
}

function marketCardOrInfo(i) {
  const t = TILES[i];
  if (t.type === 'market' || t.type === 'channel') return marketCard(i, g.players[viewer], 'info');
  return `<div class="card ev"><div class="band"><span>${T.specialBand}</span><b></b></div><h2>${esc(t.name)}</h2><p>${T.infoSpecial(money(KICKOFF))[t.type]}</p><div class="btns"><button class="cta" data-v="1">${T.close}</button></div></div>`;
}

/* ---------- boot ---------- */
setupScreen();
try {
  board = await createBoard($('#stage'), TILES, SECTORS, ED);
} catch (e) {
  console.error(e);
  $('#start').innerHTML = `<div class="panel">${T.noWebgl}</div>`;
}
if (board) {
  window.__board = board;
  board.autoRotate(true);
  if (new URLSearchParams(location.search).has('shot')) document.body.classList.add('shot'); else board.shiftView(0.2, 1);
  board.onHover(tip);
  board.onPick((i, x, y) => { if (i !== null && g && !modalResolve && matchMedia('(pointer: coarse)').matches) { tip(i, x, y); setTimeout(() => tip(null), 2600); } else if (i !== null && g && !modalResolve && phase !== 'over') { ask(marketCardOrInfo(i)); } });
  $('#go').disabled = false;
  $('#go').innerHTML = T.startBtn + ' ' + ARROW;
  document.body.classList.add('ready');
}
