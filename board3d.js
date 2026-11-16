/* Juego de sagas · el tablero 3D. Lo que cambia con cada edición (colores, letras, fichas,
   edificios, objetos de las casillas especiales y el mundo del centro) lo pone la edición (ED.look). */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { easeIO, easeOut, backOut, rng, std, glow, metal, mesh, shadow, tex, canvas, rr, glowSprite, RoundedBoxGeometry } from './kit3d.js?v=1116a';

const N = 30, D = (Math.PI * 2) / N;
const R_IN = 5.62, R_OUT = 9.8, Y = 0.25, LANE = 9.12, LABEL = 7.68, PLOT = 6.28;
export const GEO = { N, D, R_IN, R_OUT, Y, LANE, LABEL, PLOT };

function ringSeg(r0, r1, a0, a1) {
  const s = new THREE.Shape();
  s.absarc(0, 0, r1, a0, a1, false);
  s.absarc(0, 0, r0, a1, a0, true);
  s.closePath();
  return s;
}
function extrude(shape, depth, bevel = 0.025) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 10 });
  g.rotateX(-Math.PI / 2);
  return g;
}

function wrapName(name) {
  const w = name.split(' ');
  if (w.length === 1) return [name];
  let best = null;
  for (let i = 1; i < w.length; i++) {
    const a = w.slice(0, i).join(' '), b = w.slice(i).join(' ');
    const score = Math.max(a.length, b.length);
    if (!best || score < best.score) best = { score, lines: [a, b] };
  }
  return best.lines;
}

export async function createBoard(cv, TILES, SECTORS, ED) {
  const L = ED.look, C = L.colors, SANS = L.fonts.sans, DISPLAY = L.fonts.display;
  try { await Promise.all(L.fonts.load.map(f => document.fonts.load(f))); } catch (e) { /* system fonts */ }

  /* ---------- canvas textures ---------- */
  function labelTexture(t, sector, owner) {
    const [c, x] = canvas(384, 448);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    const fit = (lines, size, weight, maxW, fam = SANS) => { do { x.font = `${weight} ${size}px ${fam}`; size -= 2; } while (Math.max(...lines.map(l => x.measureText(l).width)) > maxW && size > 18); return size + 2; };
    const ownerPill = () => {
      const s = owner.name.toUpperCase();
      fit([s], 38, 800, 292);
      const w = x.measureText(s).width + 60;
      rr(x, (384 - w) / 2, 336, w, 72, 36);
      x.fillStyle = owner.color; x.fill();
      x.lineWidth = 5; x.strokeStyle = C.ink; x.stroke();
      x.fillStyle = C.ink; x.fillText(s, 192, 374);
    };
    const name = L.labelCase === 'upper' ? t.name.toUpperCase() : t.name;
    if (t.type === 'market') {
      x.font = `800 23px ${SANS}`;
      const s = sector.name.toUpperCase();
      fit([s], 23, 800, 330);
      const w = x.measureText(s).width + 44;
      rr(x, (384 - w) / 2, 22, w, 42, 21);
      x.fillStyle = sector.color; x.fill();
      x.fillStyle = C.ink; x.fillText(s, 192, 44);
      const lines = wrapName(name), size = fit(lines, L.nameSize || 66, L.nameWeight || 800, 356, L.nameFont === 'display' ? DISPLAY : SANS);
      x.fillStyle = C.cream;
      lines.forEach((l, i) => x.fillText(l, 192, 190 + (i - (lines.length - 1) / 2) * size * 1.08));
      if (owner) ownerPill();
      else { const p = ED.money(t.price); fit([p], 76, L.priceWeight || 600, 340, DISPLAY); x.fillStyle = C.price; x.fillText(p, 192, 378); }
    } else {
      const kind = t.type === 'channel' ? t.icon : t.type;
      L.icon(x, kind, 192, 118, 150, L.iconColor[t.type] || C.price);
      const lines = wrapName(name), size = fit(lines, 58, 800, 350, L.nameFont === 'display' ? DISPLAY : SANS);
      x.fillStyle = t.type === 'kickoff' ? C.ink : C.cream;
      lines.forEach((l, i) => x.fillText(l, 192, 268 + (i - (lines.length - 1) / 2) * size * 1.08));
      const sub = t.type === 'channel' ? ED.money(t.price) : L.specialSub[t.type];
      fit([sub], t.type === 'channel' ? 64 : 36, 600, 340, t.type === 'channel' ? DISPLAY : SANS);
      x.fillStyle = t.type === 'kickoff' ? C.ink : C.price;
      if (owner && t.type === 'channel') ownerPill(); else x.fillText(sub, 192, 384);
    }
    return tex(c);
  }

  function diceTexture(n) {
    const [c, x] = canvas(160, 160), d = L.dice;
    x.fillStyle = d.face; x.fillRect(0, 0, 160, 160);
    const g = x.createRadialGradient(60, 50, 10, 80, 80, 120);
    g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(0,0,0,.25)');
    x.fillStyle = g; x.fillRect(0, 0, 160, 160);
    const P = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] }[n];
    P.forEach(p => { x.beginPath(); x.arc(80 + p[0] * 40, 80 + p[1] * 40, n === 1 ? 24 : 15, 0, 7); x.fillStyle = n === 1 ? d.one : d.pip; x.fill(); });
    return tex(c);
  }

  function deckTexture(kind) {
    const [c, x] = canvas(300, 420), d = L.decks[kind];
    x.fillStyle = d.bg; x.fillRect(0, 0, 300, 420);
    x.strokeStyle = d.line; x.lineWidth = 5; rr(x, 16, 16, 268, 388, 18); x.stroke();
    x.lineWidth = 1.5; x.globalAlpha = 0.35;
    for (let i = 0; i < 9; i++) { x.beginPath(); x.arc(150, 190, 24 + i * 22, 0, 7); x.stroke(); }
    x.globalAlpha = 1;
    L.icon(x, kind, 150, 180, 150, d.line);
    x.textAlign = 'center'; x.fillStyle = C.cream;
    let s = 34; do { x.font = `800 ${s}px ${SANS}`; s -= 2; } while (x.measureText(d.title).width > 250 && s > 16);
    x.fillText(d.title, 150, 340);
    return tex(c);
  }

  function bannerTexture(text, bg, fg) {
    const [c, x] = canvas(512, 128);
    x.fillStyle = bg; x.fillRect(0, 0, 512, 128);
    x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle';
    let s = 72; do { x.font = `800 ${s}px ${DISPLAY}`; s -= 2; } while (x.measureText(text).width > 470 && s > 20);
    x.fillText(text, 256, 68);
    return tex(c);
  }

  function skyTexture() {
    const [c, x] = canvas(16, 512), g = x.createLinearGradient(0, 0, 0, 512);
    L.sky.forEach(s => g.addColorStop(s[0], s[1]));
    x.fillStyle = g; x.fillRect(0, 0, 16, 512);
    return tex(c);
  }

  /* ---------- renderer, scene, camera ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = L.exposure || 1.12;

  const scene = new THREE.Scene();
  scene.background = skyTexture();
  scene.fog = new THREE.Fog(L.fog[0], L.fog[1], L.fog[2]);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 400);
  const target = new THREE.Vector3(0, 0.3, 0);
  const controls = new OrbitControls(camera, cv);
  controls.target.copy(target);
  controls.enablePan = false; controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.minDistance = 11; controls.maxDistance = 44; controls.minPolarAngle = 0.25; controls.maxPolarAngle = 1.2;
  controls.rotateSpeed = 0.6; controls.zoomSpeed = 0.7;
  const cam = { theta: 0, phi: 0.84, dist: 27 };
  const applyCam = () => { const s = Math.sin(cam.phi); camera.position.set(target.x + cam.dist * s * Math.sin(cam.theta), target.y + cam.dist * Math.cos(cam.phi), target.z + cam.dist * s * Math.cos(cam.theta)); camera.lookAt(target); };
  applyCam();
  let dragging = false, lastUser = 0;
  controls.addEventListener('start', () => { dragging = true; });
  controls.addEventListener('end', () => { dragging = false; lastUser = performance.now(); });

  /* lights */
  const hemi = new THREE.HemisphereLight(L.lights.hemi[0], L.lights.hemi[1], L.lights.hemi[2]);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(L.day[0][1], L.day[0][2]);
  sun.position.set(...L.day[0][4]); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.025;
  Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 70 });
  scene.add(sun);
  const rim = new THREE.DirectionalLight(L.lights.rim[0], L.lights.rim[1]); rim.position.set(...L.lights.rim[2]); scene.add(rim);

  const anim = [], blinkers = [], flags = [];
  const root = new THREE.Group();
  scene.add(root);

  /* tween engine (used by everything below, including the edition's world) */
  const tweens = [];
  let speed = 1;
  const tween = (ms, fn, ease = easeIO) => new Promise(res => tweens.push({ t0: performance.now(), ms: Math.max(1, ms / speed), fn, ease, res }));
  const wait = ms => new Promise(r => setTimeout(r, ms / speed));
  function stepTweens(now) {
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i], k = Math.min(1, (now - tw.t0) / tw.ms);
      tw.fn(tw.ease(k));
      if (k >= 1) { tweens.splice(i, 1); tw.res(); }
    }
  }
  const ctx = { scene, root, anim, blinkers, flags, tween, renderer, camera, bannerTexture, GEO };

  /* table */
  const table = mesh(new THREE.CircleGeometry(80, 72).rotateX(-Math.PI / 2), std(C.table, { roughness: 1 }), 0, -0.72, 0);
  table.receiveShadow = true; root.add(table);
  const lineMat = new THREE.MeshBasicMaterial({ color: C.line, transparent: true, opacity: 0.16 });
  [11.7, 12.9, 14.6, 17, 20.2, 24.5].forEach((r, i) => root.add(mesh(new THREE.RingGeometry(r, r + 0.03 + i * 0.006, 160).rotateX(-Math.PI / 2), lineMat, 0, -0.7, 0)));
  for (let i = 0; i < 120; i++) { const a = (i / 120) * Math.PI * 2, long = i % 10 === 0, m = mesh(new THREE.PlaneGeometry(0.03, long ? 0.6 : 0.26).rotateX(-Math.PI / 2), lineMat, Math.sin(a) * (11.9 + (long ? 0.17 : 0)), -0.7, Math.cos(a) * (11.9 + (long ? 0.17 : 0))); m.rotation.y = a; root.add(m); }

  /* base and rims */
  const base = mesh(new THREE.CylinderGeometry(10.55, 10.95, 0.72, 128), std(C.base, { roughness: 0.42, metalness: 0.35, envMapIntensity: 0.7 }), 0, -0.36, 0);
  base.castShadow = true; base.receiveShadow = true; root.add(base);
  const rimMat = metal(C.rim);
  [[10.5, 0.085, 0.02], [5.5, 0.07, 0.27], [9.96, 0.03, 0.05]].forEach(r => { const t = mesh(new THREE.TorusGeometry(r[0], r[1], 10, 180), rimMat, 0, r[2], 0); t.rotation.x = Math.PI / 2; root.add(t); });
  root.add(mesh(new THREE.CylinderGeometry(5.5, 5.5, 0.26, 96, 1, true), std(C.base, { side: THREE.DoubleSide }), 0, 0.13, 0));
  for (let i = 0; i < N; i++) { const a = (i + 0.5) * D; root.add(mesh(new THREE.SphereGeometry(0.06, 10, 8), rimMat, Math.sin(a) * 10.22, 0.04, Math.cos(a) * 10.22)); }
  if (L.decorateBase) L.decorateBase(ctx);

  /* the world in the middle of the board: it belongs to the edition */
  const world = L.buildWorld(ctx);

  /* tiles */
  const a0 = -Math.PI / 2 - D / 2 + 0.007, a1 = -Math.PI / 2 + D / 2 - 0.007;
  const tileGeo = extrude(ringSeg(R_IN, R_OUT, a0, a1), 0.2);
  const plotGeo = extrude(ringSeg(5.76, 6.86, a0 + 0.014, a1 - 0.014), 0.035, 0.012);
  const laneGeo = extrude(ringSeg(LANE - 0.03, LANE + 0.03, a0 + 0.03, a1 - 0.03), 0.004, 0);
  const ringGeo = extrude(ringSeg(8.5, 9.76, a0 + 0.012, a1 - 0.012), 0.012, 0);
  const hiGeo = extrude(ringSeg(R_IN + 0.04, R_OUT - 0.04, a0 + 0.008, a1 - 0.008), 0.01, 0);
  const labelGeo = new THREE.PlaneGeometry(1.36, 1.586).rotateX(-Math.PI / 2);
  const tiles = [], pickable = [];
  const local = (i, lx, y, lz) => { const a = -i * D; return new THREE.Vector3(lx * Math.cos(a) + lz * Math.sin(a), y, -lx * Math.sin(a) + lz * Math.cos(a)); };
  ctx.local = local;

  TILES.forEach((t, i) => {
    const g = new THREE.Group();
    g.rotation.y = -i * D;
    const shiny = t.type === 'kickoff';
    const m = mesh(tileGeo, std(L.tile[t.type][i % 2], { roughness: shiny ? 0.4 : 0.7, metalness: shiny ? 0.5 : 0.08, envMapIntensity: 0.6 }), 0, 0.025, 0);
    m.receiveShadow = true; m.castShadow = true; m.userData.tile = i;
    pickable.push(m);
    g.add(m);
    g.add(mesh(laneGeo, new THREE.MeshBasicMaterial({ color: C.cream, transparent: true, opacity: shiny ? 0 : 0.16 }), 0, Y, 0));
    const lab = mesh(labelGeo, new THREE.MeshBasicMaterial({ map: labelTexture(t, SECTORS[t.sector]), transparent: true, depthWrite: false, toneMapped: false }), 0, Y + 0.006, LABEL);
    g.add(lab);
    const ring = mesh(ringGeo, std('#ffffff', { roughness: 0.55, emissive: '#000000', transparent: true, opacity: 0.92 }), 0, Y - 0.004, 0);
    ring.receiveShadow = true; ring.visible = false; g.add(ring);
    const holder = new THREE.Group(); holder.position.set(0, Y + 0.02, PLOT); g.add(holder);
    const rec = { t, group: g, mesh: m, ring, holder, lab, base: L.tile[t.type][i % 2], plot: null, prop: null, stage: 0, owner: null };
    if (t.type === 'market') {
      rec.plot = mesh(plotGeo, std(SECTORS[t.sector].color, { roughness: 0.85 }), 0, Y - 0.005, 0);
      rec.plot.receiveShadow = true; g.add(rec.plot);
      const gem = mesh(new THREE.OctahedronGeometry(0.09, 0), std(SECTORS[t.sector].color, { roughness: 0.25, metalness: 0.4, envMapIntensity: 1 }), 0, Y + 0.1, 9.42);
      gem.castShadow = true; g.add(gem);
      anim.push(tm => { gem.rotation.y = tm * 1.2 + i; gem.position.y = Y + 0.12 + Math.sin(tm * 2 + i) * 0.02; });
    } else {
      const p = L.makeProp(t, i, ctx);
      p.userData.tint = p.userData.tint || [];
      holder.add(shadow(p));
      p.traverse(o => { if (o.userData.blink) blinkers.push(o); if (o.userData.flag) flags.push(o); });
      rec.prop = p;
    }
    root.add(g);
    tiles.push(rec);
  });

  /* landing highlight */
  const hi = mesh(hiGeo, new THREE.MeshBasicMaterial({ color: C.highlight, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }), 0, Y + 0.012, 0);
  const hiGroup = new THREE.Group(); hiGroup.add(hi); root.add(hiGroup);
  let hiUntil = 0;
  anim.push(t => { const left = hiUntil - performance.now(); hi.material.opacity = left > 0 ? (0.22 + 0.16 * Math.sin(t * 9)) * Math.min(1, left / 400) : 0; });

  /* a ring in the owner's colour bursts from the tile when it is taken */
  const shockMesh = mesh(new THREE.TorusGeometry(1, 0.045, 8, 56), new THREE.MeshBasicMaterial({ color: C.highlight, transparent: true, opacity: 0, depthWrite: false }));
  shockMesh.rotation.x = Math.PI / 2; root.add(shockMesh);
  function shock(i, color) {
    shockMesh.position.copy(local(i, 0, Y + 0.09, 7.9));
    shockMesh.material.color.set(color);
    tween(850, k => { shockMesh.scale.setScalar(0.25 + k * 1.9); shockMesh.material.opacity = 0.95 * (1 - k); }, easeOut);
  }

  /* card decks and coin stacks on the table */
  const decks = {};
  [['signal', 0.62], ['brain', -0.62]].forEach(d => {
    const g = new THREE.Group(), side = std(L.decks[d[0]].side || C.cream), top = new THREE.MeshStandardMaterial({ map: deckTexture(d[0]), roughness: 0.6 });
    const body = mesh(new RoundedBoxGeometry(1.5, 0.34, 2.1, 2, 0.04), [side, side, top, side, side, side], 0, 0.17, 0);
    const card = mesh(new RoundedBoxGeometry(1.5, 0.02, 2.1, 1, 0.01), [side, side, top, side, side, side], 0, 0.36, 0);
    g.add(body, card);
    g.position.set(Math.sin(d[1]) * 13.4, -0.7, Math.cos(d[1]) * 13.4); g.rotation.y = d[1];
    root.add(shadow(g));
    decks[d[0]] = { g, card };
  });
  const coinMat = metal(C.coin), rc = rng(5);
  [[0.25, 12.6], [-0.2, 12.9], [1.05, 13.1], [-1.02, 13.3]].forEach(s => { for (let k = 0; k < 3; k++) { const n = 2 + Math.floor(rc() * 6), a = s[0] + (k - 1) * 0.045, r = s[1] + (k % 2) * 0.5; const st = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06 * n, L.coinSides || 20), coinMat, Math.sin(a) * r, -0.7 + 0.03 * n, Math.cos(a) * r); st.castShadow = true; root.add(st); } });

  /* stars */
  const SC = L.stars.count, sp = new Float32Array(SC * 3), rs = rng(3);
  for (let i = 0; i < SC; i++) { const a = rs() * Math.PI * 2, e = (L.stars.below ? -0.4 : 0.05) + rs() * 1.4, r = 160; sp[i * 3] = r * Math.cos(e) * Math.cos(a); sp[i * 3 + 1] = r * Math.sin(e) - 10; sp[i * 3 + 2] = r * Math.cos(e) * Math.sin(a); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const starsMat = new THREE.PointsMaterial({ color: L.stars.color, size: L.stars.size, fog: false, transparent: true, opacity: L.stars.opacity[0], sizeAttenuation: true });
  scene.add(new THREE.Points(sg, starsMat));

  /* the light follows the game: the edition gives the stops (start, middle, end) */
  const DAY = L.day;
  const cA = new THREE.Color(), cB = new THREE.Color();
  let dayT = 0, dayNow = 0;
  function applyDay(t) {
    let i = 0;
    while (i < DAY.length - 2 && t > DAY[i + 1][0]) i++;
    const a = DAY[i], b = DAY[i + 1], k = Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0])));
    sun.color.copy(cA.set(a[1])).lerp(cB.set(b[1]), k);
    sun.intensity = a[2] + (b[2] - a[2]) * k;
    hemi.intensity = a[3] + (b[3] - a[3]) * k;
    sun.position.set(a[4][0] + (b[4][0] - a[4][0]) * k, a[4][1] + (b[4][1] - a[4][1]) * k, a[4][2] + (b[4][2] - a[4][2]) * k);
    starsMat.opacity = L.stars.opacity[0] + (L.stars.opacity[1] - L.stars.opacity[0]) * t;
    if (world.daylight) world.daylight(t);
  }
  anim.push(() => { if (Math.abs(dayT - dayNow) > 0.0005) { dayNow += (dayT - dayNow) * 0.02; applyDay(dayNow); } });

  /* dice */
  const diceMats = [3, 4, 1, 6, 2, 5].map(n => new THREE.MeshStandardMaterial({ map: diceTexture(n), roughness: 0.35, envMapIntensity: 0.8, metalness: L.dice.metal || 0 }));
  const dice = [0, 1].map(() => { const d = mesh(new RoundedBoxGeometry(0.62, 0.62, 0.62, 4, 0.09), diceMats); d.castShadow = true; d.visible = false; root.add(d); return d; });
  const faceQ = { 1: [0, 0, 0], 6: [Math.PI, 0, 0], 2: [-Math.PI / 2, 0, 0], 5: [Math.PI / 2, 0, 0], 3: [0, 0, Math.PI / 2], 4: [0, 0, -Math.PI / 2] };

  /* tokens */
  const tokens = {};
  const SLOTS = [[-0.34, -0.24], [0.34, -0.24], [-0.34, 0.3], [0.34, 0.3]];
  const slot = (i, pid) => local(i, SLOTS[pid % 4][0], Y + 0.01, LANE + SLOTS[pid % 4][1]);
  const activeRing = mesh(new THREE.TorusGeometry(0.44, 0.03, 8, 40), new THREE.MeshBasicMaterial({ color: C.highlight, transparent: true, opacity: 0.9 }));
  activeRing.rotation.x = Math.PI / 2; activeRing.visible = false; root.add(activeRing);
  let activeId = null;
  anim.push(t => { if (activeId !== null && tokens[activeId]) { const p = tokens[activeId].g.position; activeRing.position.set(p.x, Y + 0.04, p.z); activeRing.scale.setScalar(1 + 0.12 * Math.sin(t * 5)); activeRing.material.opacity = 0.6 + 0.3 * Math.sin(t * 5); } });
  /* pieces face the camera while they wait, and the one whose turn it is does its idle move */
  const toCam = new THREE.Vector3();
  anim.push(t => Object.values(tokens).forEach((tk, i) => {
    const b = tk.g.userData.body;
    if (tk.out || tk.moving) return;
    toCam.copy(camera.position).sub(tk.g.position);
    const want = Math.atan2(toCam.x, toCam.z);
    let d = want - tk.g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d));
    tk.g.rotation.y += d * 0.06;
    b.position.y = (b.userData.baseY ?? 0.66) + Math.sin(t * 2.2 + i) * (b.userData.bob ?? 0.03);
    if (b.userData.idle) b.userData.idle(t, activeId === tk.id);
  }));

  let confetti = null;

  /* ---------- post-processing ---------- */
  let composer = null;
  try {
    const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 });
    composer = new EffectComposer(renderer, rt);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), ...(L.bloom || [0.42, 0.6, 1.7])));
    composer.addPass(new OutputPass());
  } catch (e) { composer = null; }

  let shift = 0;
  function resize() {
    const w = cv.clientWidth || window.innerWidth, h = cv.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    if (composer) composer.setSize(w, h);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 52 : 36;
    if (w / h >= 0.8) camera.setViewOffset(w, h, -w * shift, h * 0.075, w, h); else camera.setViewOffset(w, h, 0, h * 0.12, w, h);
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();
  let lastFrame = 0;
  function update(render) {
    const now = performance.now(), t = clock.getElapsedTime();
    lastFrame = now;
    stepTweens(now);
    anim.forEach(f => f(t));
    blinkers.forEach((b, i) => { b.material.emissiveIntensity = Math.sin(t * 3 + i * 1.7) > 0.3 ? 4.5 : 0.6; });
    flags.forEach((f, i) => { f.rotation.y = Math.sin(t * 3 + i) * 0.35; });
    if (confetti) confetti(now);
    controls.update();
    if (render) { if (composer) composer.render(); else renderer.render(scene, camera); }
  }
  renderer.setAnimationLoop(() => update(true));
  setInterval(() => { if (performance.now() - lastFrame > 250) update(false); }, 120);

  /* ---------- picking ---------- */
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  let hoverCb = null, pickCb = null, downAt = null;
  const tileAt = ev => { const r = cv.getBoundingClientRect(); ptr.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, camera); const h = ray.intersectObjects(pickable, false)[0]; return h ? h.object.userData.tile : null; };
  cv.addEventListener('pointermove', ev => { if (hoverCb && !dragging) hoverCb(tileAt(ev), ev.clientX, ev.clientY); });
  cv.addEventListener('pointerleave', () => { if (hoverCb) hoverCb(null); });
  cv.addEventListener('pointerdown', ev => { downAt = [ev.clientX, ev.clientY]; });
  cv.addEventListener('pointerup', ev => { if (downAt && Math.hypot(ev.clientX - downAt[0], ev.clientY - downAt[1]) < 6 && pickCb) pickCb(tileAt(ev), ev.clientX, ev.clientY); downAt = null; });

  const toScreen = v => { const p = v.clone().project(camera), r = cv.getBoundingClientRect(); return { x: r.left + (p.x * 0.5 + 0.5) * r.width, y: r.top + (-p.y * 0.5 + 0.5) * r.height, ok: p.z < 1 }; };

  function focus(i, ms = 900) {
    if (dragging || performance.now() - lastUser < 2500) return Promise.resolve();
    const from = controls.getAzimuthalAngle(), phi = controls.getPolarAngle(), dist = controls.getDistance();
    let d = (-i * D - from) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    if (Math.abs(d) < 0.02) return Promise.resolve();
    return tween(ms, k => { if (dragging) return; cam.theta = from + d * k; cam.phi = phi; cam.dist = dist; applyCam(); });
  }

  function rebuild(rec, color, animate) {
    while (rec.holder.children.length) rec.holder.remove(rec.holder.children[0]);
    if (rec.t.type !== 'market' || !rec.stage) return;
    const b = shadow(L.makeBuilding(rec.stage, color, ctx));
    b.traverse(o => { if (o.userData.blink) blinkers.push(o); if (o.userData.flag) flags.push(o); });
    rec.holder.add(b);
    if (animate) { b.scale.set(1, 0.01, 1); tween(620, k => { b.scale.set(0.6 + 0.4 * k, k, 0.6 + 0.4 * k); }, backOut); }
  }

  const api = {
    /* for screenshots: move the camera by hand (theta, phi, distance) */
    look(theta, phi, dist, y = 0.3, x = 0, z = 0) { controls.autoRotate = false; controls.minDistance = Math.min(11, dist); target.set(x, y, z); controls.target.copy(target); cam.theta = theta; cam.phi = phi; cam.dist = dist; applyCam(); controls.update(); },
    speed: k => { speed = k; },
    wait,
    autoRotate(on) { controls.autoRotate = on; controls.autoRotateSpeed = 0.55; },
    world,
    daylight(t) { dayT = Math.min(1, Math.max(0, t)); },
    shiftView(to, ms = 900) { const from = shift; return tween(ms, k => { shift = from + (to - from) * k; resize(); }); },
    tileScreen: i => toScreen(local(i, 0, Y + 0.6, LABEL)),
    tokenScreen: id => { const p = tokens[id].g.position.clone(); p.y += 1.3; return toScreen(p); },
    onHover: f => { hoverCb = f; },
    onPick: f => { pickCb = f; },
    focus,
    setActive(id) { activeId = id; activeRing.visible = id !== null; },
    reset() {
      Object.keys(tokens).forEach(k => { root.remove(tokens[k].g); delete tokens[k]; });
      tiles.forEach((rec, i) => api.setTile(i, null, 0, false));
      dice.forEach(d => { d.visible = false; });
      activeId = null; activeRing.visible = false; hiUntil = 0;
      world.reset(); dayT = 0;
    },
    overview(on) {
      const phi = controls.getPolarAngle(), dist = controls.getDistance(), th = controls.getAzimuthalAngle();
      const p1 = on ? 0.42 : 0.84, d1 = on ? 37 : (camera.aspect < 0.8 ? 31 : 27);
      return tween(900, k => { cam.theta = th; cam.phi = phi + (p1 - phi) * k; cam.dist = dist + (d1 - dist) * k; applyCam(); });
    },
    addPlayers(list) {
      list.forEach(p => {
        const g = L.makeToken(p.shape, p.color, ctx);
        g.position.copy(slot(0, p.id));
        root.add(shadow(g));
        g.traverse(o => { if (o.userData.blink) blinkers.push(o); });
        tokens[p.id] = { id: p.id, g, color: p.color };
        g.scale.setScalar(0.01);
        tween(600, k => g.scale.setScalar(Math.max(0.01, k)), backOut);
      });
    },
    async moveToken(id, path, onStep) {
      const tk = tokens[id];
      tk.moving = true;
      for (const i of path) {
        const from = tk.g.position.clone(), to = slot(i, id);
        tk.g.rotation.y = Math.atan2(to.x - from.x, to.z - from.z);
        await tween(175, k => { tk.g.position.lerpVectors(from, to, k); tk.g.position.y = to.y + Math.sin(k * Math.PI) * 0.6; const s = 1 + Math.sin(k * Math.PI) * 0.14; tk.g.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s)); }, k => k);
        tk.g.scale.setScalar(1);
        if (onStep) onStep(i);
      }
      tk.moving = false;
    },
    async jumpToken(id, i) {
      const tk = tokens[id], from = tk.g.position.clone(), to = slot(i, id);
      tk.moving = true;
      await tween(900, k => { tk.g.position.lerpVectors(from, to, k); tk.g.position.y = to.y + Math.sin(k * Math.PI) * 5; tk.g.rotation.y += 0.3; });
      tk.moving = false;
    },
    setOut(id) { const tk = tokens[id]; tk.out = true; tween(700, k => { tk.g.scale.setScalar(1 - k * 0.999); tk.g.position.y = Y + k * 2; }).then(() => { tk.g.visible = false; }); },
    async rollDice(a, b) {
      const th = controls.getAzimuthalAngle();
      const jobs = dice.map((d, n) => {
        const ang = th + (n ? 0.09 : -0.09) + (Math.random() - 0.5) * 0.04, r = LABEL + (Math.random() - 0.5) * 0.5;
        const rest = new THREE.Vector3(Math.sin(ang) * r, Y + 0.32, Math.cos(ang) * r);
        const start = new THREE.Vector3(Math.sin(th) * (r + 5) + (n ? 1.2 : -1.2), 5.5, Math.cos(th) * (r + 5));
        const e = faceQ[n ? b : a], qT = new THREE.Quaternion().setFromEuler(new THREE.Euler(e[0], e[1], e[2]));
        qT.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * 6.28));
        const axis = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), qs = new THREE.Quaternion();
        d.visible = true; d.scale.setScalar(1);
        return tween(1050, k => {
          const e2 = easeOut(k);
          d.position.lerpVectors(start, rest, e2);
          d.position.y = rest.y + Math.abs(Math.cos(k * Math.PI * 2.5)) * Math.pow(1 - k, 1.6) * 3.4 + (1 - e2) * 0.8;
          qs.setFromAxisAngle(axis, (1 - e2) * 15);
          d.quaternion.copy(qT).multiply(qs);
        }, k => k);
      });
      await Promise.all(jobs);
      await wait(380);
    },
    hideDice() { dice.forEach(d => { if (d.visible) tween(260, k => d.scale.setScalar(1 - k * 0.98)).then(() => { d.visible = false; }); }); },
    setTile(i, color, stage, animate = true, name = '') {
      const rec = tiles[i], changed = rec.stage !== stage || rec.owner !== color, newOwner = rec.owner !== color;
      rec.owner = color; rec.stage = stage;
      rec.ring.visible = !!color;
      if (color) { rec.ring.material.color.set(color); rec.ring.material.emissive.set(color); rec.ring.material.emissiveIntensity = 0.2; }
      if (newOwner) {
        rec.mesh.material.color.set(rec.base);
        if (color) rec.mesh.material.color.lerp(new THREE.Color(color), 0.22);
        const old = rec.lab.material.map;
        rec.lab.material.map = labelTexture(rec.t, SECTORS[rec.t.sector], color ? { name, color } : null);
        rec.lab.material.needsUpdate = true;
        if (old) old.dispose();
        rec.ring.material.opacity = 0.92;
        if (color && animate) { rec.ring.material.opacity = 0; tween(600, k => { rec.ring.material.opacity = 0.92 * k; }); shock(i, color); }
      }
      if (rec.t.type === 'channel' && rec.prop) {
        rec.prop.userData.tint.forEach(m => { m.color.set(color || m.userData.base); if (m.emissive) { m.emissive.set(color || '#000000'); m.emissiveIntensity = color ? 0.5 : 0; } });
        if (animate && changed) { rec.prop.scale.setScalar(0.7); tween(500, k => rec.prop.scale.setScalar(0.7 + 0.3 * k), backOut); }
      } else if (changed) rebuild(rec, color, animate);
    },
    pulse(i, ms = 1800, color) { hi.material.color.set(color || C.highlight); hiGroup.rotation.y = -i * D; hiUntil = performance.now() + ms / speed; },
    drawCard(kind) {
      const d = decks[kind];
      return tween(520, k => { d.card.position.y = 0.36 + Math.sin(k * Math.PI) * 1.6; d.card.rotation.z = Math.sin(k * Math.PI) * 0.5; d.card.rotation.x = k * Math.PI * 2; }).then(() => { d.card.rotation.set(0, 0, 0); });
    },
    celebrate(colors) {
      const n = 420, geo = new THREE.PlaneGeometry(0.16, 0.09), im = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false }), n);
      const ps = [], c = new THREE.Color(), m4 = new THREE.Matrix4(), e = new THREE.Euler(), q = new THREE.Quaternion(), v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
      for (let i = 0; i < n; i++) { ps.push({ x: (Math.random() - 0.5) * 18, y: 6 + Math.random() * 12, z: (Math.random() - 0.5) * 18, vy: 1.6 + Math.random() * 2.4, r: Math.random() * 6, w: 1 + Math.random() * 4, sx: (Math.random() - 0.5) * 1.2 }); im.setColorAt(i, c.set(colors[i % colors.length])); }
      root.add(im);
      let last = performance.now();
      confetti = now => {
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        ps.forEach((p, i) => { p.y -= p.vy * dt; p.r += p.w * dt; p.x += Math.sin(p.r) * p.sx * dt; if (p.y < 0.2) p.y = 14 + Math.random() * 4; e.set(p.r, p.r * 0.7, p.r * 1.3); m4.compose(v.set(p.x, p.y, p.z), q.setFromEuler(e), one); im.setMatrixAt(i, m4); });
        im.instanceMatrix.needsUpdate = true;
      };
      return () => { root.remove(im); confetti = null; };
    }
  };
  return api;
}
