/* Demon Slayer (edición fan) · figuras, casas, Pilares y objetos de las casillas.
   Todo modelado a mano con formas sencillas: ningún modelo, logo ni imagen oficial. */
import { THREE, std, glow, metal, mesh, box, cyl, ball, cone, torus, lathe, slab, canvas, tex, rr, glowSprite, tokenStand } from '../../kit3d.js?v=1116b';

const UNI = '#1B1D26', WHITE = '#ECE8DE', SKIN = '#EBC9A8';
const mat = (c, o = {}) => std(c, Object.assign({ roughness: 0.8 }, o));

function pattern(kind) {
  const [c, x] = canvas(512, 256);
  if (kind === 'checker') { for (let i = 0; i < 16; i++) for (let j = 0; j < 8; j++) { x.fillStyle = (i + j) % 2 ? '#14161A' : '#1F7A55'; x.fillRect(i * 32, j * 32, 32, 32); } }
  else if (kind === 'scales') { x.fillStyle = '#F2B52E'; x.fillRect(0, 0, 512, 256); x.fillStyle = '#FFFFFF'; for (let j = 0; j < 8; j++) for (let i = 0; i < 17; i++) { const ox = i * 32 - (j % 2) * 16; x.beginPath(); x.moveTo(ox, j * 32 + 30); x.lineTo(ox + 16, j * 32 + 4); x.lineTo(ox + 32, j * 32 + 30); x.closePath(); x.fill(); } }
  else if (kind === 'hemp') { x.fillStyle = '#F4A6BF'; x.fillRect(0, 0, 512, 256); x.strokeStyle = '#C9547E'; x.lineWidth = 2; for (let j = 0; j < 6; j++) for (let i = 0; i < 12; i++) { const cx = i * 44 + (j % 2) * 22, cy = j * 44; for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * 22, cy + Math.sin(a) * 22); x.stroke(); } x.beginPath(); for (let k = 0; k <= 6; k++) { const a = (k / 6) * Math.PI * 2; x.lineTo(cx + Math.cos(a) * 22, cy + Math.sin(a) * 22); } x.stroke(); } }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

function limb(m, x, y, z, rz, rx = 0, len = 0.24, r = 0.034) {
  const a = new THREE.Group(); a.position.set(x, y, z);
  a.add(cyl(r, r * 0.9, len, m, 0, -len / 2, 0, 12));
  a.rotation.set(rx, 0, rz);
  return a;
}

/* legs in the slayer uniform: dark trousers, white leg wraps, straw sandals */
function legs(b, pants = UNI) {
  [-0.055, 0.055].forEach(x => {
    b.add(cyl(0.05, 0.055, 0.04, mat('#B89A6A'), x, 0.02, 0.01, 12));
    b.add(cyl(0.045, 0.05, 0.13, mat(WHITE), x, 0.1, 0, 12));
    b.add(cyl(0.06, 0.05, 0.16, mat(pants), x, 0.24, 0, 12));
  });
}
/* the haori: an open coat hanging from the shoulders, patterned */
function haori(b, map, repeat = [3, 1]) {
  map.repeat.set(repeat[0], repeat[1]);
  const m = new THREE.MeshStandardMaterial({ map, roughness: 0.85, side: THREE.DoubleSide });
  const coat = new THREE.Mesh(new THREE.LatheGeometry([[0.2, 0.2], [0.185, 0.32], [0.165, 0.46], [0.16, 0.6], [0.15, 0.7]].map(p => new THREE.Vector2(p[0], p[1])), 28, Math.PI * 0.26, Math.PI * 1.48), m);
  b.add(coat);
  return m;
}
function katana(blade = '#14161A', glowColor = null, len = 0.36) {
  const k = new THREE.Group();
  k.add(cyl(0.012, 0.012, 0.09, mat('#1A1A1A'), 0, 0, 0, 8), cyl(0.03, 0.03, 0.008, metal('#B8A06A'), 0, 0.05, 0, 12));
  const b = box(0.022, len, 0.006, std(blade, { metalness: 0.7, roughness: 0.25 }), 0.004, 0.05 + len / 2, 0); k.add(b);
  k.add(box(0.008, len, 0.007, std('#D8DCE2', { metalness: 0.9, roughness: 0.2 }), 0.014, 0.05 + len / 2, 0));
  if (glowColor) { const g = box(0.04, len, 0.02, new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }), 0.004, 0.05 + len / 2, 0); k.add(g); k.userData.glow = g; }
  return k;
}
function spikyHair(head, color, tip, n = 9, r = 0.08) {
  const m = mat(color, { roughness: 0.7 }), mt = mat(tip, { roughness: 0.7 });
  const cap = mesh(new THREE.SphereGeometry(r, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), m, 0, 0.01, -0.008); head.add(cap);
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 1.6 + Math.PI * 0.7, sp = cone(0.03, 0.09, i % 2 ? mt : m, Math.cos(a) * r * 0.8, 0.05, Math.sin(a) * r * 0.8, 6); sp.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); head.add(sp); }
  [-0.03, 0, 0.03].forEach((x, i) => { const f = cone(0.022, 0.06, i === 1 ? mt : m, x, 0.03, 0.07, 6); f.rotation.x = 2.3; head.add(f); });
}
function face(head, eyes = '#7A2A1E', r = 0.072) {
  const f = ball(r, mat(SKIN, { roughness: 0.6 }), 0, 0, 0.004, 20, 16); f.scale.set(0.95, 1.06, 1); head.add(f);
  [-1, 1].forEach(s => { head.add(ball(0.013, std(eyes, { roughness: 0.2 }), s * 0.026, 0.004, r - 0.006, 10, 8)); head.add(ball(0.004, glow('#FFFFFF', 1), s * 0.026 + 0.004, 0.01, r + 0.004, 6, 4)); });
}

function tanjiro() {
  const b = new THREE.Group(); legs(b);
  b.add(lathe([[0.001, 0.32], [0.12, 0.32], [0.125, 0.46], [0.14, 0.6], [0.145, 0.67], [0.1, 0.72], [0.045, 0.74], [0.001, 0.74]], mat(UNI), 26));
  b.add(cyl(0.126, 0.126, 0.03, mat(WHITE), 0, 0.36, 0, 26));
  const sleeve = haori(b, pattern('checker'), [4, 2]);
  b.add(limb(sleeve, -0.15, 0.68, 0, 0.25, 0.05, 0.24, 0.045), limb(sleeve, 0.15, 0.68, 0.02, -0.5, -0.9, 0.24, 0.045));
  /* the wooden box on his back */
  const crate = new THREE.Group(), wood = mat('#B88A55');
  crate.add(box(0.2, 0.3, 0.12, wood), box(0.21, 0.02, 0.13, mat('#6B4A2A'), 0, 0.14, 0), box(0.21, 0.02, 0.13, mat('#6B4A2A'), 0, -0.14, 0), box(0.02, 0.3, 0.13, mat('#6B4A2A'), 0, 0, 0));
  crate.position.set(0, 0.55, -0.2); b.add(crate);
  [-0.06, 0.06].forEach(x => { const st = box(0.012, 0.32, 0.01, mat('#3A2A1A'), x, 0.6, 0.13); st.rotation.x = -0.12; b.add(st); });
  const head = new THREE.Group(); head.position.y = 0.82;
  head.add(cyl(0.035, 0.04, 0.05, mat(SKIN), 0, -0.06, 0, 10));
  face(head, '#7A2A1E');
  spikyHair(head, '#5A1A12', '#9A2E1E');
  head.add(box(0.025, 0.018, 0.004, mat('#A8382A'), -0.025, 0.045, 0.069));
  [-1, 1].forEach(s => { const card = box(0.004, 0.035, 0.02, mat('#F2EEE4'), s * 0.074, -0.03, 0.0); head.add(card); head.add(ball(0.007, mat('#C8321E'), s * 0.077, -0.03, 0, 6, 4)); });
  b.add(head);
  const k = katana('#14161A', '#4FB8FF'); k.position.set(0.24, 0.42, 0.18); k.rotation.set(0.9, 0, -0.5); b.add(k);
  b.userData.blade = k.userData.glow;
  return b;
}
function zenitsu() {
  const b = new THREE.Group(); legs(b);
  b.add(lathe([[0.001, 0.32], [0.12, 0.32], [0.125, 0.46], [0.14, 0.6], [0.145, 0.67], [0.1, 0.72], [0.045, 0.74], [0.001, 0.74]], mat(UNI), 26));
  b.add(cyl(0.126, 0.126, 0.03, mat(WHITE), 0, 0.36, 0, 26));
  haori(b, pattern('scales'), [5, 2]);
  b.add(limb(mat('#F2B52E'), -0.15, 0.68, 0.02, 0.4, -0.8), limb(mat('#F2B52E'), 0.15, 0.68, 0.02, -0.4, -0.8));
  const head = new THREE.Group(); head.position.y = 0.82;
  head.add(cyl(0.035, 0.04, 0.05, mat(SKIN), 0, -0.06, 0, 10));
  face(head, '#C9861E');
  spikyHair(head, '#F2C230', '#E8822A', 11);
  b.add(head);
  /* crouched, hand on the hilt, ready for the first form */
  const k = katana('#C9A030', '#FFE45A', 0.34); k.position.set(-0.02, 0.4, 0.17); k.rotation.set(1.45, 0, 1.4); b.add(k);
  b.userData.blade = k.userData.glow; b.userData.zap = true;
  return b;
}
function inosuke() {
  const b = new THREE.Group(), skin = mat(SKIN, { roughness: 0.6 }), fur = mat('#8C8478', { roughness: 1, flatShading: true });
  [-0.055, 0.055].forEach(x => { b.add(cyl(0.05, 0.055, 0.04, mat('#B89A6A'), x, 0.02, 0.01, 12), cyl(0.045, 0.05, 0.13, mat(WHITE), x, 0.1, 0, 12), cyl(0.065, 0.055, 0.17, mat('#4A5266'), x, 0.24, 0, 12)); });
  b.add(lathe([[0.001, 0.3], [0.18, 0.3], [0.16, 0.36], [0.13, 0.42], [0.001, 0.42]], fur, 14));
  for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, t = cone(0.03, 0.07, fur, Math.sin(a) * 0.17, 0.29, Math.cos(a) * 0.17, 4); t.rotation.x = Math.PI; b.add(t); }
  b.add(lathe([[0.001, 0.41], [0.12, 0.41], [0.13, 0.5], [0.155, 0.62], [0.16, 0.68], [0.11, 0.73], [0.045, 0.75], [0.001, 0.75]], skin, 26));
  [-1, 1].forEach(s => { const pec = ball(0.06, skin, s * 0.06, 0.62, 0.11, 12, 10); pec.scale.set(1.1, 0.7, 0.5); b.add(pec); });
  b.add(limb(skin, -0.16, 0.68, 0.02, 0.6, -0.6, 0.24, 0.036), limb(skin, 0.16, 0.68, 0.02, -0.6, -0.6, 0.24, 0.036));
  /* the boar head: snout, nostrils, ears and bright eyes */
  const head = new THREE.Group(); head.position.y = 0.85;
  const skull = ball(0.09, fur, 0, 0, 0, 16, 12); skull.scale.set(0.95, 1, 1.15); head.add(skull);
  const snout = cyl(0.05, 0.065, 0.1, mat('#7A7066', { flatShading: true }), 0, -0.02, 0.1, 10); snout.rotation.x = Math.PI / 2; head.add(snout);
  head.add(cyl(0.046, 0.046, 0.01, mat('#C9A6A0'), 0, -0.02, 0.152, 14)); head.children[head.children.length - 1].rotation.x = Math.PI / 2;
  [-1, 1].forEach(s => { head.add(ball(0.009, mat('#2A1A1A'), s * 0.017, -0.02, 0.158, 6, 4)); const ear = cone(0.03, 0.07, fur, s * 0.07, 0.08, -0.01, 5); ear.rotation.z = -s * 0.5; head.add(ear); head.add(ball(0.016, glow('#7FD3FF', 1.6), s * 0.04, 0.03, 0.085, 8, 6)); const tusk = cone(0.008, 0.04, mat('#F2EEE4'), s * 0.045, -0.05, 0.12, 6); tusk.rotation.x = -0.4; head.add(tusk); });
  b.add(head);
  const jag = (side) => { const k = new THREE.Group(), steel = std('#7F8FB0', { metalness: 0.7, roughness: 0.35 }); k.add(cyl(0.012, 0.012, 0.08, mat('#2A2A2A'), 0, 0, 0, 8), box(0.025, 0.32, 0.006, steel, 0, 0.2, 0)); for (let i = 0; i < 6; i++) { const tooth = cone(0.012, 0.03, steel, 0.018, 0.08 + i * 0.05, 0, 3); tooth.rotation.z = -Math.PI / 2; k.add(tooth); } const g = box(0.05, 0.32, 0.02, new THREE.MeshBasicMaterial({ color: '#9FB8FF', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }), 0, 0.2, 0); k.add(g); k.userData.glow = g; k.position.set(side * 0.27, 0.48, 0.16); k.rotation.set(0.6, 0, side * -0.9); return k; };
  const l = jag(-1), r = jag(1); b.add(l, r);
  b.userData.blades = [l.userData.glow, r.userData.glow];
  return b;
}
function nezuko() {
  const b = new THREE.Group(), kimono = new THREE.MeshStandardMaterial({ map: pattern('hemp'), roughness: 0.85 });
  kimono.map.repeat.set(3, 2);
  b.add(lathe([[0.001, 0.0], [0.13, 0.0], [0.12, 0.2], [0.11, 0.4], [0.12, 0.5], [0.13, 0.58], [0.09, 0.64], [0.04, 0.66], [0.001, 0.66]], kimono, 26));
  b.add(cyl(0.118, 0.118, 0.07, mat('#3A2A2E'), 0, 0.42, 0, 26), cyl(0.12, 0.12, 0.012, mat('#E8B04A'), 0, 0.42, 0, 26));
  const coat = new THREE.Mesh(new THREE.LatheGeometry([[0.17, 0.12], [0.15, 0.3], [0.14, 0.5], [0.13, 0.62]].map(p => new THREE.Vector2(p[0], p[1])), 26, Math.PI * 0.33, Math.PI * 1.34), mat('#4A2E26', { side: THREE.DoubleSide }));
  b.add(coat);
  b.add(limb(mat('#4A2E26'), -0.13, 0.6, 0.02, 0.35, -0.3, 0.2, 0.03), limb(mat('#4A2E26'), 0.13, 0.6, 0.02, -0.35, -0.3, 0.2, 0.03));
  const head = new THREE.Group(); head.position.y = 0.74;
  head.add(cyl(0.03, 0.035, 0.04, mat(SKIN), 0, -0.05, 0, 10));
  face(head, '#E0578E', 0.068);
  const hair = mat('#16121A', { roughness: 0.6 });
  const cap = mesh(new THREE.SphereGeometry(0.075, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), hair, 0, 0.012, -0.006); head.add(cap);
  const longHair = new THREE.Mesh(new THREE.LatheGeometry([[0.07, 0.02], [0.085, -0.08], [0.1, -0.28], [0.095, -0.4]].map(p => new THREE.Vector2(p[0], p[1])), 20, Math.PI * 0.62, Math.PI * 0.76), new THREE.MeshStandardMaterial({ color: '#16121A', roughness: 0.6, side: THREE.DoubleSide }));
  head.add(longHair);
  const tips = new THREE.Mesh(new THREE.LatheGeometry([[0.1, -0.32], [0.098, -0.42]].map(p => new THREE.Vector2(p[0], p[1])), 20, Math.PI * 0.62, Math.PI * 0.76), new THREE.MeshStandardMaterial({ color: '#E8742A', roughness: 0.6, side: THREE.DoubleSide }));
  head.add(tips);
  const bamboo = cyl(0.016, 0.016, 0.12, mat('#7FA84A', { roughness: 0.5 }), 0, -0.03, 0.066, 10); bamboo.rotation.z = Math.PI / 2; head.add(bamboo);
  [-0.045, 0.045].forEach(x => { const knot = cyl(0.018, 0.018, 0.006, mat('#5E8A34'), x, -0.03, 0.066, 10); knot.rotation.z = Math.PI / 2; head.add(knot); });
  const tie = torus(0.075, 0.005, mat('#B8322A'), 0, -0.03, 0, 24); tie.rotation.x = Math.PI / 2; head.add(tie);
  [-1, 1].forEach(s => { const bow = cone(0.022, 0.05, mat('#F27BAA'), s * 0.03, 0.07, -0.05, 6); bow.rotation.z = s * Math.PI / 2; head.add(bow); });
  b.add(head);
  const flame = glowSprite('#FF5AA5', 0.9); flame.position.set(0, 0.35, 0); flame.material.opacity = 0; b.add(flame);
  b.userData.flame = flame;
  return b;
}

export function makeToken(shape, color) {
  const g = tokenStand(color, '#C8A35A', '#120D0B');
  const body = { tanjiro, zenitsu, inosuke, nezuko }[shape]();
  body.userData.baseY = 0.145; body.userData.bob = 0;
  const u = body.userData;
  body.userData.idle = (t, active) => {
    if (u.blade) u.blade.material.opacity = active ? (u.zap ? (Math.sin(t * 30) > 0 ? 0.8 : 0.2) : 0.35 + 0.25 * Math.sin(t * 6)) : 0;
    if (u.blades) u.blades.forEach((g2, k) => { g2.material.opacity = active ? 0.3 + 0.3 * Math.sin(t * 8 + k * 3) : 0; });
    if (u.flame) { u.flame.material.opacity = active ? 0.6 + 0.3 * Math.sin(t * 7) : 0; u.flame.scale.setScalar(0.8 + 0.2 * Math.sin(t * 5)); }
    body.rotation.y = Math.sin(t * 0.7) * 0.06;
  };
  body.scale.setScalar(shape === 'nezuko' ? 1.05 : 1.12);
  g.add(body);
  g.userData.body = body;
  return g;
}

/* ---------- Japanese houses: Cabaña → Casa → Pagoda, in the owner's colour ---------- */
const ROOF = '#2E3440', WALL = '#E9DFC9', WOOD = '#5A3A24';
export function roof(w, d, h, m, over = 1.25) { const r = cone(Math.max(w, d) * 0.72 * over, h, m, 0, 0, 0, 4); r.rotation.y = Math.PI / 4; r.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d)); return r; }
export function house(w, d, h, own) {
  const g = new THREE.Group(), wall = mat(WALL, { roughness: 0.9 }), wood = mat(WOOD), tiles = mat(ROOF, { roughness: 0.6, metalness: 0.2 });
  g.add(box(w, 0.04, d, mat('#6E6A62'), 0, 0.02, 0), box(w * 0.92, h, d * 0.92, wall, 0, 0.04 + h / 2, 0));
  [-1, 1].forEach(s => { g.add(box(0.02, h, 0.02, wood, s * w * 0.46, 0.04 + h / 2, d * 0.46), box(0.02, h, 0.02, wood, s * w * 0.46, 0.04 + h / 2, -d * 0.46)); });
  g.add(box(w * 0.94, 0.02, d * 0.94, wood, 0, 0.04 + h * 0.55, 0));
  const r = roof(w * 1.1, d * 1.1, h * 0.7, tiles); r.position.y = 0.04 + h + h * 0.35; g.add(r);
  g.add(box(w * 0.3, h * 0.55, 0.01, glow('#FFD58A', 1.2), w * 0.2, 0.04 + h * 0.4, d * 0.465));
  if (own) { const noren = box(w * 0.26, h * 0.3, 0.008, own, -w * 0.2, 0.04 + h * 0.7, d * 0.47); g.add(noren); }
  return g;
}
function lantern(color, x, y, z, s = 1) {
  const l = new THREE.Group();
  const body = ball(0.05 * s, new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.6, roughness: 0.6 }), 0, 0, 0, 12, 10); body.scale.y = 1.3; l.add(body);
  l.add(cyl(0.025 * s, 0.025 * s, 0.015 * s, mat('#1A1A1A'), 0, 0.065 * s, 0, 10), cyl(0.025 * s, 0.025 * s, 0.015 * s, mat('#1A1A1A'), 0, -0.065 * s, 0, 10));
  l.position.set(x, y, z); return l;
}
export function makeBuilding(stage, color) {
  const g = new THREE.Group(), own = std(color, { roughness: 0.6, emissive: color, emissiveIntensity: 0.4 });
  const flag = (x, z, h) => { g.add(cyl(0.01, 0.01, h, mat(WOOD), x, h / 2, z, 6)); const f = mesh(new THREE.PlaneGeometry(0.09, 0.26).translate(0.045, -0.13, 0), new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.7, emissive: color, emissiveIntensity: 0.25 }), x + 0.005, h, z); f.userData.flag = true; g.add(f); };
  if (stage === 1) {
    const hut = new THREE.Group(), straw = mat('#B8975A', { flatShading: true });
    hut.add(box(0.32, 0.18, 0.26, mat('#8A6A48'), 0, 0.09, 0));
    const r = roof(0.42, 0.36, 0.22, straw); r.position.y = 0.29; hut.add(r);
    hut.add(box(0.08, 0.12, 0.01, mat('#2A1E14'), 0, 0.06, 0.131), box(0.06, 0.04, 0.008, own, 0.1, 0.12, 0.132));
    hut.position.set(-0.08, 0, 0.02); g.add(hut);
    const fire = new THREE.Group(); fire.add(cyl(0.06, 0.07, 0.02, mat('#3A3A3A'), 0, 0.01, 0, 8), cone(0.035, 0.1, glow('#FF8A3D', 3), 0, 0.06, 0, 6), glowSprite('#FF8A3D', 0.5)); fire.children[2].position.y = 0.08; fire.position.set(0.3, 0, 0.22); g.add(fire);
    flag(-0.36, -0.25, 0.6);
  } else if (stage === 2) {
    const h = house(0.5, 0.36, 0.24, own); h.position.set(-0.04, 0, 0.02); g.add(h);
    g.add(lantern(color, 0.32, 0.2, 0.24), cyl(0.008, 0.008, 0.16, mat(WOOD), 0.32, 0.08, 0.24, 6));
    flag(-0.4, -0.28, 0.72);
  } else {
    /* a three-tier pagoda with the owner's lanterns */
    const p = new THREE.Group(), wall = mat(WALL, { roughness: 0.9 }), tiles = mat(ROOF, { roughness: 0.6, metalness: 0.2 }), red = mat('#A8322A');
    p.add(box(0.46, 0.06, 0.46, mat('#6E6A62'), 0, 0.03, 0));
    let y = 0.06;
    [[0.34, 0.2], [0.27, 0.16], [0.2, 0.14]].forEach(([w, h], k) => {
      p.add(box(w, h, w, k ? wall : red, 0, y + h / 2, 0));
      const r = roof(w * 1.55, w * 1.55, h * 0.55, tiles, 1.2); r.position.y = y + h + h * 0.22; p.add(r);
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b2]) => p.add(lantern(color, a * w * 0.72, y + h - 0.02, b2 * w * 0.72, 0.6)));
      y += h + h * 0.4;
    });
    p.add(cyl(0.01, 0.014, 0.26, metal('#C8A35A'), 0, y + 0.1, 0, 6));
    [0, 1, 2].forEach(k => p.add(torus(0.025, 0.006, metal('#C8A35A'), 0, y + 0.04 + k * 0.05, 0, 12)));
    p.position.set(-0.04, 0, 0); g.add(p);
    const h2 = glowSprite(color, 2.2); h2.position.set(0, 0.5, 0); h2.material.opacity = 0.25; g.add(h2);
    flag(-0.42, 0.32, 0.9);
  }
  return g;
}

/* ---------- the four Hashira: a sword stand with each one's blade and emblem ---------- */
function hashira(kind) {
  const s = new THREE.Group(), wood = mat('#3A2414', { roughness: 0.6 }), lacquer = std('#14100E', { roughness: 0.3, metalness: 0.2 });
  s.add(box(0.5, 0.05, 0.16, lacquer, 0, 0.025, 0));
  [-0.18, 0.18].forEach(x => { s.add(box(0.04, 0.24, 0.06, lacquer, x, 0.14, 0)); s.add(box(0.06, 0.03, 0.08, wood, x, 0.21, 0)); });
  const col = { flame: '#FF6A1F', water: '#3FA2FF', insect: '#B98CFF', sound: '#F2C230' }[kind];
  const sword = katana(col === '#F2C230' ? '#C9C2B4' : col, null, 0.42); sword.rotation.z = Math.PI / 2; sword.position.set(0.24, 0.25, 0); s.add(sword);
  const em = new THREE.Group(); em.position.y = 0.62;
  if (kind === 'flame') [0, 1, 2].forEach(k => { const f = cone(0.06 - k * 0.012, 0.22 - k * 0.04, glow(['#FF4A1F', '#FF8A3D', '#FFD27A'][k], 2.6), 0, 0.06 + k * 0.02, 0, 7); em.add(f); });
  else if (kind === 'water') { for (let k = 0; k < 3; k++) { const w = torus(0.12 - k * 0.03, 0.012, glow('#5AB8FF', 2.2), 0, k * 0.05, 0, 30); w.rotation.x = Math.PI / 2; em.add(w); } em.add(ball(0.03, glow('#BFE6FF', 3), 0, 0.1, 0, 8, 6)); }
  else if (kind === 'insect') { [-1, 1].forEach(sd => { const wg = mesh(new THREE.CircleGeometry(0.09, 3), new THREE.MeshStandardMaterial({ color: '#B98CFF', emissive: '#8A5AE0', emissiveIntensity: 1.6, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }), sd * 0.07, 0.03, 0); wg.rotation.z = sd * 0.5; em.add(wg); em.userData['w' + sd] = wg; }); em.add(cyl(0.01, 0.01, 0.12, mat('#2A1A3A'), 0, 0.03, 0, 6)); }
  else { [-1, 1].forEach(sd => { const cl = box(0.05, 0.18, 0.012, std('#C9C2B4', { metalness: 0.8, roughness: 0.25 }), sd * 0.06, 0.04, 0); cl.rotation.z = sd * 0.3; em.add(cl); }); em.add(ball(0.025, glow('#FF4AB8', 3), 0, 0.14, 0, 8, 6)); }
  em.add(glowSprite(col, 0.7)); s.add(em);
  s.userData.emblem = em; s.userData.kind = kind;
  return s;
}

/* ---------- props on the special tiles ---------- */
function butterfly(color = '#B98CFF') {
  const b = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.3, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
  [-1, 1].forEach(s => { const w = new THREE.Group(); w.add(mesh(new THREE.CircleGeometry(0.035, 3).translate(0.03, 0, 0), m)); w.scale.x = s; w.userData.s = s; b.add(w); });
  b.userData.flap = t => b.children.forEach(w => { w.rotation.y = w.userData.s * Math.sin(t * 18) * 0.9; });
  return b;
}
export { butterfly };
function crow() {
  const c = new THREE.Group(), blk = std('#101014', { roughness: 0.5, metalness: 0.2, envMapIntensity: 0.8 });
  const body = ball(0.08, blk, 0, 0, 0, 14, 10); body.scale.set(1.5, 0.9, 0.9); c.add(body);
  c.add(ball(0.05, blk, 0.12, 0.05, 0, 12, 10), cone(0.018, 0.07, mat('#3A3A3A'), 0.19, 0.04, 0, 6));
  c.children[2].rotation.z = -Math.PI / 2;
  c.add(ball(0.008, glow('#F2C230', 1.4), 0.15, 0.065, 0.03, 6, 4), ball(0.008, glow('#F2C230', 1.4), 0.15, 0.065, -0.03, 6, 4));
  const tail = cone(0.04, 0.1, blk, -0.15, 0, 0, 4); tail.rotation.z = Math.PI / 2; tail.scale.z = 0.3; c.add(tail);
  const wings = [-1, 1].map(s => { const w = mesh(new THREE.PlaneGeometry(0.16, 0.08).translate(0, 0, 0.04), new THREE.MeshStandardMaterial({ color: '#101014', side: THREE.DoubleSide }), 0, 0.03, s * 0.04); w.rotation.x = Math.PI / 2 * s; w.userData.s = s; c.add(w); return w; });
  c.add(box(0.03, 0.02, 0.012, mat('#E8E2D0'), 0.03, -0.06, 0.05));
  c.userData.wings = wings;
  return c;
}
export { crow };

export function makeProp(t, i, ctx) {
  const p = new THREE.Group(), { anim, bannerTexture, GEO } = ctx, wood = mat('#4A2E1C'), red = mat('#A8322A');
  if (t.type === 'kickoff') {
    /* the gate of the Butterfly Mansion, with butterflies around it */
    const gate = new THREE.Group();
    [-0.85, 0.85].forEach(x => gate.add(cyl(0.06, 0.07, 1.5, red, x, 0.75, 0, 12), cyl(0.09, 0.09, 0.06, mat('#2A2A2A'), x, 0.03, 0, 12)));
    gate.add(box(2.1, 0.08, 0.12, mat('#1A1A1A'), 0, 1.55, 0), box(1.9, 0.06, 0.08, red, 0, 1.35, 0));
    const curve = box(2.3, 0.05, 0.16, mat('#1A1A1A'), 0, 1.62, 0); gate.add(curve);
    const ban = mesh(new THREE.PlaneGeometry(1.4, 0.3), new THREE.MeshBasicMaterial({ map: bannerTexture('FINCA MARIPOSA', '#1A1220', '#D9B8FF'), side: THREE.DoubleSide, toneMapped: false }), 0, 1.15, 0.02);
    gate.add(ban);
    gate.position.set(0, 0, GEO.LANE - GEO.PLOT); p.add(gate);
    const flies = [0, 1, 2, 3, 4].map(k => { const b = butterfly(['#B98CFF', '#8FD3FF', '#F27BAA'][k % 3]); p.add(b); return b; });
    anim.push(tm => flies.forEach((b, k) => { const a = tm * 0.8 + k * 1.3; b.position.set(Math.cos(a) * 0.6, 0.6 + Math.sin(tm * 1.7 + k) * 0.25, 0.4 + Math.sin(a) * 0.4); b.rotation.y = -a; b.userData.flap(tm + k); }));
  } else if (t.type === 'signal') {
    /* a kasugai crow on a post, flapping now and then */
    p.add(cyl(0.025, 0.03, 0.62, wood, 0, 0.31, 0, 8), box(0.24, 0.025, 0.04, wood, 0, 0.62, 0));
    const c = crow(); c.position.set(0, 0.7, 0); c.rotation.y = Math.PI / 2; p.add(c);
    anim.push(tm => { const flap = Math.sin(tm * 0.7 + i) > 0.7; c.userData.wings.forEach(w => { w.rotation.x = (Math.PI / 2) * w.userData.s + (flap ? Math.sin(tm * 20) * 0.7 : 0.1) * w.userData.s; }); c.position.y = 0.7 + (flap ? 0.05 : 0); c.rotation.z = Math.sin(tm * 2 + i) * 0.1; });
  } else if (t.type === 'brain') {
    /* the boulder cut in half, with a sacred rope and a ring of breath around it */
    const rock = mat('#6E7378', { flatShading: true, roughness: 0.9 });
    const half = (s) => { const h = mesh(new THREE.SphereGeometry(0.3, 10, 8, 0, Math.PI), rock, s * 0.05, 0.28, 0); h.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; h.scale.y = 1.1; return h; };
    p.add(half(1), half(-1));
    const rope = torus(0.3, 0.02, mat('#E8DCC0'), 0, 0.38, 0, 24); rope.rotation.x = Math.PI / 2; p.add(rope);
    [-0.12, 0, 0.12].forEach(x => p.add(box(0.03, 0.08, 0.004, mat('#F2EEE4'), x, 0.32, 0.3)));
    const swirl = torus(0.45, 0.012, new THREE.MeshBasicMaterial({ color: '#7FD3FF', transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }), 0, 0.5, 0, 40);
    swirl.rotation.x = Math.PI / 2 - 0.3; p.add(swirl);
    anim.push(tm => { swirl.rotation.z = tm * 1.4; swirl.position.y = 0.5 + Math.sin(tm * 1.2 + i) * 0.1; swirl.material.color.setHSL(0.55 + 0.05 * Math.sin(tm * 0.5), 0.8, 0.65); });
  } else if (t.type === 'spam') {
    /* Mount Natagumo: a spider web strung between two dead trees */
    const bark = mat('#3A3430', { flatShading: true });
    [-0.36, 0.36].forEach((x, k) => { const tr = cyl(0.03, 0.05, 0.9, bark, x, 0.45, 0, 6); tr.rotation.z = k ? -0.12 : 0.12; p.add(tr); });
    const pts = [], cx = 0, cy = 0.55, web = new THREE.LineBasicMaterial({ color: '#E8ECF2', transparent: true, opacity: 0.85 });
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; pts.push(new THREE.Vector3(cx, cy, 0.02), new THREE.Vector3(cx + Math.cos(a) * 0.34, cy + Math.sin(a) * 0.34, 0.02)); }
    for (let r = 0.08; r < 0.34; r += 0.07) for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, b2 = ((k + 1) / 8) * Math.PI * 2; pts.push(new THREE.Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0.02), new THREE.Vector3(cx + Math.cos(b2) * r, cy + Math.sin(b2) * r, 0.02)); }
    p.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), web));
    const spider = new THREE.Group(); spider.add(ball(0.035, std('#E8E4F0', { roughness: 0.4 })), ball(0.02, std('#E8E4F0'), 0, 0.03, 0.02, 8, 6));
    for (let k = 0; k < 8; k++) { const l = box(0.08, 0.006, 0.006, mat('#C9C2D8'), (k < 4 ? -1 : 1) * 0.04, 0, -0.03 + (k % 4) * 0.02); l.rotation.z = (k < 4 ? 1 : -1) * 0.5; spider.add(l); }
    spider.add(ball(0.006, glow('#FF3B6E', 3), -0.008, 0.035, 0.035, 6, 4), ball(0.006, glow('#FF3B6E', 3), 0.008, 0.035, 0.035, 6, 4));
    p.add(spider);
    anim.push(tm => { spider.position.set(Math.sin(tm * 0.6 + i) * 0.12, 0.55 + Math.cos(tm * 0.8) * 0.12, 0.04); });
  } else if (t.type === 'board') {
    /* the broken sword: an anvil, a snapped blade and the swordsmith's mask */
    const iron = std('#3A3D44', { metalness: 0.7, roughness: 0.4 });
    p.add(box(0.12, 0.2, 0.14, mat('#4A2E1C'), 0, 0.1, 0), box(0.36, 0.08, 0.16, iron, 0, 0.24, 0), cone(0.08, 0.14, iron, 0.24, 0.24, 0, 4));
    p.children[2].rotation.z = -Math.PI / 2;
    const b1 = box(0.02, 0.26, 0.006, std('#14161A', { metalness: 0.7, roughness: 0.25 }), -0.06, 0.29, 0.02); b1.rotation.z = Math.PI / 2 - 0.2; p.add(b1);
    const b2 = box(0.02, 0.14, 0.006, std('#14161A', { metalness: 0.7, roughness: 0.25 }), 0.26, 0.04, 0.16); b2.rotation.set(Math.PI / 2, 0, 0.6); p.add(b2);
    const mask = new THREE.Group(), white = mat('#F2EEE4', { roughness: 0.5 });
    const m0 = ball(0.12, white, 0, 0, 0, 16, 12); m0.scale.z = 0.5; mask.add(m0);
    [-1, 1].forEach(s => { mask.add(ball(0.02, mat('#1A1A1A'), s * 0.04, 0.03, 0.055, 8, 6)); const brow = box(0.05, 0.008, 0.01, mat('#1A1A1A'), s * 0.045, 0.07, 0.055); brow.rotation.z = s * 0.4; mask.add(brow); });
    const mouth = cyl(0.015, 0.025, 0.06, white, 0.02, -0.04, 0.07, 10); mouth.rotation.x = Math.PI / 2; mask.add(mouth);
    mask.add(ball(0.012, mat('#E07A6A'), -0.07, -0.02, 0.05, 6, 4), ball(0.012, mat('#E07A6A'), 0.07, -0.02, 0.05, 6, 4));
    mask.position.set(-0.24, 0.55, -0.05); mask.rotation.set(0.1, 0.4, 0.1); p.add(mask);
    p.add(cyl(0.008, 0.008, 0.42, mat(WOOD), -0.24, 0.24, -0.08, 6));
    anim.push(tm => { mask.rotation.z = 0.1 + Math.sin(tm * 6 + i) * 0.06; });
  } else if (t.type === 'channel') {
    const stand = new THREE.Group(), ringMat = std('#3A2A22', { roughness: 0.45, metalness: 0.4, emissive: '#000000' });
    ringMat.userData.base = '#3A2A22';
    stand.add(cyl(0.34, 0.38, 0.05, mat('#14100E'), 0, 0.025, 0, 24), cyl(0.3, 0.3, 0.02, ringMat, 0, 0.06, 0, 24));
    p.add(stand);
    const h = hashira(t.icon); h.position.y = 0.07; p.add(h);
    p.userData.tint = [ringMat];
    anim.push(tm => { const em = h.userData.emblem; em.rotation.y = tm * 0.8 + i; em.position.y = 0.62 + Math.sin(tm * 1.4 + i) * 0.04; if (h.userData.kind === 'insect') [-1, 1].forEach(sd => { em.userData['w' + sd].rotation.y = sd * Math.sin(tm * 10) * 0.7; }); });
  }
  return p;
}

/* ---------- flat icons ---------- */
export function icon(x, kind, cx, cy, s, col) {
  x.save(); x.translate(cx, cy); x.scale(s / 100, s / 100);
  x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 8; x.lineCap = 'round'; x.lineJoin = 'round';
  const line = (...p) => { x.beginPath(); x.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) x.lineTo(p[i], p[i + 1]); x.stroke(); };
  const circ = (a, b, r, fill) => { x.beginPath(); x.arc(a, b, r, 0, 7); fill ? x.fill() : x.stroke(); };
  const wing = (sx) => { x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(sx * 50, -50, sx * 44, -6); x.quadraticCurveTo(sx * 46, 30, 0, 6); x.stroke(); };
  if (kind === 'kickoff' || kind === 'insect') { wing(1); wing(-1); line(0, -20, 0, 24); line(0, -20, -8, -36); line(0, -20, 8, -36); }
  else if (kind === 'signal') { x.beginPath(); x.ellipse(-4, 6, 30, 18, -0.2, 0, 7); x.fill(); circ(26, -10, 13, true); line(36, -10, 54, -6); line(-30, 10, -50, 22); }
  else if (kind === 'brain' || kind === 'water') { [0, 1, 2].forEach(k => { x.beginPath(); x.arc(0, 0, 14 + k * 15, Math.PI * 0.2 + k * 0.6, Math.PI * 1.7 + k * 0.6); x.stroke(); }); }
  else if (kind === 'spam') { for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; line(0, 0, Math.cos(a) * 46, Math.sin(a) * 46); } x.lineWidth = 4; [16, 30, 44].forEach(r => { x.beginPath(); for (let k = 0; k <= 8; k++) { const a = (k / 8) * Math.PI * 2; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.stroke(); }); }
  else if (kind === 'board') { line(-44, 30, -4, -10); line(6, -20, 40, -46); x.lineWidth = 12; line(-50, 36, -40, 26); line(-10, 4, 4, -10); }
  else if (kind === 'flame') { x.beginPath(); x.moveTo(0, 46); x.bezierCurveTo(-44, 30, -30, -10, -10, -46); x.bezierCurveTo(-6, -20, 10, -16, 14, -34); x.bezierCurveTo(40, -6, 40, 30, 0, 46); x.stroke(); }
  else if (kind === 'sound') { line(-30, 40, -30, -30, 30, -44, 30, 26); circ(-40, 40, 12, true); circ(20, 26, 12, true); }
  x.restore();
}
