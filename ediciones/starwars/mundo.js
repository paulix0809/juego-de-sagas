/* Star Wars (edición fan) · el mundo del centro del tablero.
   Un planeta desierto con dos soles: dunas, mesetas, una granja de humedad, un pueblo de cúpulas,
   un reptador de arena y el esqueleto de un dragón. Cada sector tiene un asentamiento que crece,
   y el cielo cambia con las cinco eras: carreras de vainas, el Destructor Estelar, la batalla
   de cazas y, al final, la Estrella de la Muerte. */
import { THREE, std, glow, metal, mesh, box, cyl, ball, cone, torus, shadow, glowSprite, canvas, tex, smooth, rng, backOut, mergeGeometries } from '../../kit3d.js?v=1116a';
import { falcon, xwing, tie, destroyer, shuttle, vaporator, domeHut } from './piezas.js?v=1116a';

export const SITES = { robotics: [1.7, 2.3], lab: [3.3, 2.7], saas: [-0.4, 2.7], health: [2.4, -1.4], security: [0.8, -1.7], materials: [1.75, 0.95] };
const AGE_AT = [0, 700, 1500, 2600, 3800];
const SAND = '#E8B878', SAND2 = '#C98E52', ROCK = '#A4663F', ROCK2 = '#7A4A2E';

export function buildWorld(ctx) {
  const { scene, root, anim, blinkers, tween } = ctx;
  const pop = g => { if (g.visible) return; g.visible = true; g.scale.setScalar(0.01); tween(650, k => g.scale.setScalar(Math.max(0.01, k)), backOut); };
  const rnd = rng(17);

  /* ---------- terrain: dunes with three mesas ---------- */
  const MESAS = [[-2.0, -2.4, 1.35, 0.95], [1.95, -3.35, 1.0, 0.62], [-3.75, -0.35, 0.78, 0.55]];
  const dune = (x, z) => 0.5 + 0.5 * Math.sin(x * 1.5 + Math.sin(z * 0.8) * 1.6 + z * 0.4);
  const hgt = (x, z) => {
    const r = Math.hypot(x, z);
    let h = 0.05 + 0.3 * Math.pow(dune(x, z), 3) + 0.035 * Math.sin(x * 4.1 + z * 2.3) + 0.12 * Math.pow(0.5 + 0.5 * Math.sin(z * 1.1 - x * 0.6 + 1.3), 4);
    MESAS.forEach(m => { const d = Math.hypot(x - m[0], z - m[1]); h = Math.max(h, m[2] * (1 - smooth(m[3], m[3] + 0.32, d)) + 0.04 * Math.sin(x * 7 + z * 5) * (d < m[3] ? 1 : 0)); });
    return Math.max(0.02, h * smooth(5.5, 4.6, r) + 0.02);
  };
  const K = 30, S = 96, pos = [], idx = [];
  pos.push(0, hgt(0, 0), 0);
  for (let k = 1; k <= K; k++) for (let s = 0; s < S; s++) { const r = (k / K) * 5.5, a = (s / S) * Math.PI * 2 + (k % 2) * (Math.PI / S), x = r * Math.cos(a), z = r * Math.sin(a); pos.push(x, hgt(x, z), z); }
  for (let s = 0; s < S; s++) idx.push(0, 1 + ((s + 1) % S), 1 + s);
  for (let k = 1; k < K; k++) for (let s = 0; s < S; s++) { const a = 1 + (k - 1) * S + s, b = 1 + (k - 1) * S + ((s + 1) % S), c = 1 + k * S + s, d = 1 + k * S + ((s + 1) % S); idx.push(a, b, c, b, d, c); }
  let geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo = geo.toNonIndexed();
  const p = geo.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color(), c2 = new THREE.Color();
  for (let i = 0; i < p.count; i += 3) {
    const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, z = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3, h = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
    const steep = Math.max(...[0, 1, 2].map(k => p.getY(i + k))) - Math.min(...[0, 1, 2].map(k => p.getY(i + k)));
    if (h > 0.42 || steep > 0.16) { const band = Math.floor(h * 9) % 2; c.set(band ? ROCK : ROCK2).lerp(c2.set('#C08A5C'), 0.25 * dune(x * 3, z * 3)); if (steep < 0.05 && h > 0.6) c.set('#C9955F'); }
    else c.set(SAND2).lerp(c2.set(SAND), Math.min(1, dune(x, z) * 0.9 + 0.1 * Math.sin(x * 9 + z * 7)));
    for (let k = 0; k < 3; k++) { col[(i + k) * 3] = c.r; col[(i + k) * 3 + 1] = c.g; col[(i + k) * 3 + 2] = c.b; }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const land = mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95, envMapIntensity: 0.2 }), 0, 0.14, 0);
  land.castShadow = true; land.receiveShadow = true; root.add(land);
  const gy = (x, z) => hgt(x, z) + 0.14;
  const put = (g, x, z, ry = 0) => { g.position.set(x, gy(x, z) - 0.02, z); g.rotation.y = ry; return g; };

  const wall = std('#E6CDA4', { roughness: 0.92 }), wall2 = std('#C9A577', { roughness: 0.95 }), dark = std('#2C2F36', { metalness: 0.5, roughness: 0.45 }), steel = metal('#B8BEC6', 0.35), warm = glow('#FFC985', 2.2);
  const neutral = std('#9AA0A8', { roughness: 0.5, metalness: 0.4 });

  /* rocks and scrub */
  const rockGeo = new THREE.DodecahedronGeometry(0.13, 0), rockMat = std(ROCK2, { flatShading: true, roughness: 0.9 });
  for (let i = 0; i < 34; i++) { const a = rnd() * 7, r = 0.8 + rnd() * 4.3, x = r * Math.cos(a), z = r * Math.sin(a); if (Object.values(SITES).some(s => Math.hypot(x - s[0], z - s[1]) < 0.7)) continue; const m = mesh(rockGeo, rockMat, x, gy(x, z) + 0.02, z); m.scale.set(0.5 + rnd(), 0.4 + rnd() * 0.6, 0.5 + rnd()); m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); m.castShadow = true; root.add(m); }

  /* ---------- the homestead in the middle: dome entrance, sunken courtyard, vaporators ---------- */
  const bx = 0.2, bz = 0.9, by = gy(bx, bz);
  const home = new THREE.Group();
  const entry = domeHut(0.34, std('#A88D66'), wall); home.add(entry);
  const pit = new THREE.Group(); pit.position.set(-0.85, 0, -0.25);
  pit.add(cyl(0.5, 0.5, 0.06, std('#8E7656', { roughness: 1 }), 0, -0.02, 0, 32), mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.16, 32, 1, true), std('#D9C6A2', { side: THREE.DoubleSide, roughness: 0.95 }), 0, 0.06, 0), torus(0.56, 0.03, wall2, 0, 0.14, 0, 40));
  pit.children[2].rotation.x = Math.PI / 2;
  [[0.2, 0.1], [-0.18, -0.15], [0.05, -0.28]].forEach(q => pit.add(mesh(new THREE.SphereGeometry(0.12, 14, 8, 0, 7, 0, Math.PI / 2), wall, q[0], 0.0, q[1])));
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; pit.add(box(0.07, 0.05, 0.012, warm, Math.cos(a) * 0.5, 0.05, Math.sin(a) * 0.5)); pit.children[pit.children.length - 1].rotation.y = -a + Math.PI / 2; }
  home.add(pit);
  [[0.55, 0.15], [0.3, -0.5], [-0.3, 0.55], [0.75, -0.25]].forEach(q => { const v = vaporator(std('#E8E2D4'), 0.5 + rnd() * 0.2); v.position.set(q[0], 0, q[1]); home.add(v); });
  const speeder = new THREE.Group(), red = std('#B83A2E', { roughness: 0.5, metalness: 0.3 });
  speeder.add(box(0.34, 0.06, 0.16, red, 0, 0, 0), box(0.1, 0.05, 0.14, std('#2E3A44', { roughness: 0.1, metalness: 0.5 }), 0.02, 0.05, 0));
  [-1, 1].forEach(k => { const e = cyl(0.03, 0.035, 0.18, steel, -0.12, 0.05, k * 0.06, 10); e.rotation.z = Math.PI / 2; speeder.add(e); });
  speeder.position.set(0.55, 0.12, 0.55); speeder.rotation.y = 0.8; home.add(speeder);
  put(home, bx, bz, 0.3); root.add(shadow(home));
  anim.push(t => { speeder.position.y = 0.12 + Math.sin(t * 2.2) * 0.015; });

  /* ---------- the town of domes ---------- */
  const town = new THREE.Group();
  [[0, 0, 0.36, 1], [0.55, 0.25, 0.22, 0], [-0.45, 0.35, 0.2, 0], [0.35, -0.45, 0.25, 0], [-0.3, -0.5, 0.18, 0], [0.75, -0.2, 0.16, 0], [-0.75, -0.05, 0.15, 0]].forEach((q, i) => {
    const d = new THREE.Group(), r = q[2];
    d.add(cyl(r, r * 1.05, r * 0.6, i % 2 ? wall2 : wall, 0, r * 0.3, 0, 18));
    const top = mesh(new THREE.SphereGeometry(r, 18, 10, 0, 7, 0, Math.PI / 2), i % 3 ? wall : wall2, 0, r * 0.6, 0); top.scale.y = 0.7; d.add(top);
    d.add(box(r * 0.5, r * 0.5, 0.02, std('#3A2E26'), 0, r * 0.25, r * 1.0));
    d.add(box(r * 0.3, r * 0.14, 0.02, warm, r * 0.55, r * 0.42, r * 0.85));
    if (q[3]) { d.add(cyl(0.05, 0.07, 0.62, wall2, r * 0.9, 0.31, 0, 10), mesh(new THREE.SphereGeometry(0.08, 12, 8, 0, 7, 0, Math.PI / 2), wall, r * 0.9, 0.62, 0)); const l = ball(0.02, glow('#FF8A5C', 4), r * 0.9, 0.72, 0, 6, 4); l.userData.blink = true; blinkers.push(l); d.add(l); }
    d.position.set(q[0], 0, q[1]); town.add(d);
  });
  put(town, -3.0, 1.75, 0.4); root.add(shadow(town));
  const awning = mesh(new THREE.PlaneGeometry(0.4, 0.22), new THREE.MeshStandardMaterial({ color: '#B5562F', side: THREE.DoubleSide, roughness: 0.9 }), -2.55, gy(-2.55, 2.2) + 0.25, 2.2); awning.rotation.set(-1.2, 0.4, 0); root.add(awning);

  /* ---------- the bones of a giant dragon half buried in the sand ---------- */
  const bones = new THREE.Group(), bone = std('#EFE6D2', { roughness: 0.7 });
  for (let i = 0; i < 9; i++) { const r = 0.42 - Math.abs(i - 3) * 0.04, rib = torus(Math.max(0.16, r), 0.022, bone, i * 0.16 - 0.6, 0, 0, 20); rib.geometry = new THREE.TorusGeometry(Math.max(0.16, r), 0.022, 6, 20, Math.PI); rib.rotation.y = Math.PI / 2; rib.rotation.z = 0.12; bones.add(rib); }
  const spine = cyl(0.03, 0.02, 1.5, bone, 0.0, 0.4, 0, 8); spine.rotation.z = Math.PI / 2 - 0.08; bones.add(spine);
  const skull = new THREE.Group(); skull.add(box(0.36, 0.14, 0.2, bone), cone(0.08, 0.3, bone, 0.3, -0.02, 0, 6)); skull.children[1].rotation.z = -Math.PI / 2; skull.position.set(0.95, 0.12, 0.1); skull.rotation.z = -0.3; bones.add(skull);
  put(bones, 1.15, 3.95, -0.35); bones.position.y -= 0.08; root.add(shadow(bones));

  /* ---------- the sandcrawler: a rusty fortress on tracks crawling around the dunes ---------- */
  const crawler = new THREE.Group(), rust = std('#9A6B49', { roughness: 0.75, metalness: 0.35 }), rust2 = std('#7A5236', { roughness: 0.8, metalness: 0.3 });
  const hullShape = new THREE.Shape(); hullShape.moveTo(-0.45, 0); hullShape.lineTo(0.42, 0); hullShape.lineTo(0.3, 0.28); hullShape.lineTo(-0.2, 0.36); hullShape.lineTo(-0.42, 0.24); hullShape.closePath();
  const hullGeo = new THREE.ExtrudeGeometry(hullShape, { depth: 0.36, bevelEnabled: false }); hullGeo.translate(0, 0.08, -0.18);
  crawler.add(mesh(hullGeo, rust));
  [-1, 1].forEach(k => { crawler.add(box(0.86, 0.1, 0.08, dark, 0, 0.05, k * 0.2)); for (let i = 0; i < 6; i++) crawler.add(box(0.03, 0.11, 0.085, rust2, -0.38 + i * 0.15, 0.05, k * 0.2)); });
  crawler.add(box(0.2, 0.06, 0.37, rust2, 0.15, 0.2, 0), box(0.04, 0.03, 0.2, glow('#FFD24A', 2.4), 0.36, 0.22, 0), box(0.1, 0.16, 0.12, rust2, -0.18, 0.46, 0.05));
  for (let i = 0; i < 5; i++) crawler.add(box(0.02, 0.2, 0.37, rust2, -0.32 + i * 0.13, 0.25, 0));
  root.add(shadow(crawler));
  let crawlA = 2.1;
  anim.push((t) => { if (!crawler.visible) return; crawlA += 0.0006; const R = 4.85, x = Math.cos(crawlA) * R, z = Math.sin(crawlA) * R; crawler.position.set(x, gy(x, z) - 0.02 + Math.abs(Math.sin(t * 6)) * 0.004, z); crawler.rotation.y = -crawlA - Math.PI / 2; });

  /* ---------- sky: two suns, a ringed giant and a moon ---------- */
  /* the sky turns with the camera, so the suns, the giant and later the Death Star always rise behind the board */
  const sky = new THREE.Group(); scene.add(sky);
  anim.push(() => { const cp = ctx.camera.position; sky.rotation.y = Math.atan2(cp.x, cp.z); });
  const sunA = glowSprite('#FFF1C9', 2.6), sunB = glowSprite('#FFD9A0', 1.9), coreA = glowSprite('#FFFFFF', 0.9), coreB = glowSprite('#FFFFFF', 0.65);
  [sunA, sunB, coreA, coreB].forEach(s => sky.add(s));
  const giant = new THREE.Group();
  const [gc, gx] = canvas(512, 256);
  for (let y = 0; y < 256; y++) { const k = Math.sin(y * 0.09) * 0.5 + Math.sin(y * 0.031 + 1) * 0.5; gx.fillStyle = `rgb(${150 + k * 40},${120 + k * 30},${170 + k * 30})`; gx.fillRect(0, y, 512, 1); }
  const planet = mesh(new THREE.SphereGeometry(9, 48, 32), new THREE.MeshStandardMaterial({ map: tex(gc), roughness: 1, fog: false }));
  const rings = mesh(new THREE.RingGeometry(11, 16, 96), new THREE.MeshBasicMaterial({ color: '#D9C7E8', transparent: true, opacity: 0.35, side: THREE.DoubleSide, fog: false }));
  rings.rotation.x = 1.25; rings.rotation.y = 0.3;
  giant.add(planet, rings); giant.position.set(-34, 4, -52); giant.scale.setScalar(0.62); sky.add(giant);
  const moon = mesh(new THREE.SphereGeometry(2.4, 32, 20), new THREE.MeshStandardMaterial({ color: '#C9CED6', roughness: 1, fog: false })); moon.position.set(30, 6.5, -48); moon.scale.setScalar(0.55); sky.add(moon);

  /* ---------- sector settlements: pad → domes → tower, with the leader's flag ---------- */
  const state = {};
  Object.keys(SITES).forEach(key => {
    const [x, z] = SITES[key], g = new THREE.Group();
    g.position.set(x, gy(x, z) - 0.02, z);
    const lot = new THREE.Group(), rope = new THREE.MeshBasicMaterial({ color: '#F2E6CC', transparent: true, opacity: 0.45 });
    [[-0.34, -0.26], [0.34, -0.26], [0.34, 0.26], [-0.34, 0.26]].forEach(q => lot.add(cyl(0.012, 0.012, 0.16, dark, q[0], 0.08, q[1], 5)));
    lot.add(box(0.68, 0.008, 0.008, rope, 0, 0.13, -0.26), box(0.68, 0.008, 0.008, rope, 0, 0.13, 0.26), box(0.008, 0.008, 0.52, rope, -0.34, 0.13, 0), box(0.008, 0.008, 0.52, rope, 0.34, 0.13, 0));
    const lv = [null, new THREE.Group(), new THREE.Group(), new THREE.Group()];
    const lights = [];
    const padM = cyl(0.26, 0.28, 0.03, dark, 0.05, 0.015, 0.05, 6); lv[1].add(padM);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + Math.PI / 6, l = ball(0.016, glow('#FFE7A8', 3), 0.05 + Math.cos(a) * 0.23, 0.035, 0.05 + Math.sin(a) * 0.23, 6, 4); lv[1].add(l); lights.push(l); }
    const sh = shuttle(neutral); sh.position.set(0.05, 0.09, 0.05); sh.scale.setScalar(1.1); sh.rotation.y = rnd() * 6; lv[1].add(sh);
    const d1 = domeHut(0.2, std('#B9A27C'), wall); d1.position.set(-0.28, 0, -0.18); d1.rotation.y = 0.5; lv[2].add(d1);
    const v2 = vaporator(std('#E8E2D4'), 0.42); v2.position.set(0.35, 0, -0.25); lv[2].add(v2);
    const tw = new THREE.Group(); tw.add(cyl(0.09, 0.11, 0.62, wall2, 0, 0.31, 0, 14), cyl(0.13, 0.09, 0.06, dark, 0, 0.64, 0, 14), cyl(0.006, 0.01, 0.3, dark, 0, 0.82, 0, 6));
    const twl = ball(0.02, glow('#FF8A5C', 4), 0, 0.98, 0, 6, 4); twl.userData.blink = true; blinkers.push(twl); tw.add(twl);
    tw.position.set(-0.32, 0, 0.26); lv[3].add(tw);
    const dish = mesh(new THREE.SphereGeometry(0.1, 14, 8, 0, 7, 0, 1.0), new THREE.MeshStandardMaterial({ color: '#E2E4E8', side: THREE.DoubleSide, roughness: 0.4, metalness: 0.4 }), 0.36, 0.3, 0.22); dish.rotation.x = 2.2; lv[3].add(dish, cyl(0.012, 0.016, 0.22, dark, 0.36, 0.11, 0.22, 6));
    anim.push(t => { if (lv[3].visible) dish.rotation.z = Math.sin(t * 0.5 + x) * 0.6; });
    for (let i = 1; i <= 3; i++) { lv[i].visible = false; shadow(lv[i]); g.add(lv[i]); }
    const flagMat = new THREE.MeshStandardMaterial({ color: '#F2E6CC', side: THREE.DoubleSide, roughness: 0.6, emissive: '#000000' }), flag = new THREE.Group();
    const cloth = mesh(new THREE.PlaneGeometry(0.12, 0.3).translate(0.06, -0.15, 0), flagMat, 0, 0.84, 0);
    flag.add(cyl(0.012, 0.014, 0.86, dark, 0, 0.43, 0, 6), cloth); flag.position.set(-0.52, 0, 0.42); flag.visible = false;
    anim.push(t => { if (flag.visible) cloth.rotation.y = Math.sin(t * 3 + x) * 0.4; });
    const halo = mesh(new THREE.TorusGeometry(0.78, 0.022, 6, 48), new THREE.MeshBasicMaterial({ color: '#FFE81F', transparent: true, opacity: 0.8 }), 0, 0.06, 0);
    halo.rotation.x = Math.PI / 2; halo.visible = false;
    anim.push(t => { if (halo.visible) { halo.scale.setScalar(1 + 0.05 * Math.sin(t * 2.5)); halo.material.opacity = 0.55 + 0.25 * Math.sin(t * 2.5); } });
    g.add(lot, flag, halo);
    root.add(g);
    state[key] = { g, lot, lv, flag, flagMat, halo, lights, level: 0, color: null, full: false };
  });

  /* ---------- the five eras ---------- */
  const R = 5.5;
  /* 1 · pod racers on the rim and landspeeders on the dunes */
  const pod = col => { const g = new THREE.Group(), eng = std('#C9CDD3', { metalness: 0.5, roughness: 0.35 }), beam = new THREE.MeshBasicMaterial({ color: '#7FD3FF', transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
    [-1, 1].forEach(k => { const e = cyl(0.045, 0.05, 0.32, eng, 0.12, 0, k * 0.08, 10); e.rotation.z = Math.PI / 2; g.add(e, ball(0.04, glow('#FF9A3D', 3), -0.05, 0, k * 0.08, 8, 6), box(0.06, 0.012, 0.04, std(col), 0.18, 0.04, k * 0.08)); });
    g.add(box(0.2, 0.01, 0.01, beam, 0.12, 0.0, 0)); g.children[g.children.length - 1].scale.z = 14;
    g.add(box(0.1, 0.05, 0.07, std(col, { roughness: 0.4, metalness: 0.3 }), -0.25, 0, 0));
    [-1, 1].forEach(k => g.add(box(0.2, 0.004, 0.004, beam, -0.12, 0, k * 0.04)));
    shadow(g); g.visible = false; root.add(g); return g; };
  const pods = ['#D9A13A', '#3A7BD9', '#C8312E'].map(pod);
  anim.push(t => pods.forEach((g, i) => { if (!g.visible) return; const a = t * (0.42 + i * 0.05) + i * 2.1; g.position.set(Math.sin(a) * (R - 0.25 - (i % 2) * 0.22), 0.52 + Math.sin(t * 9 + i) * 0.02, Math.cos(a) * (R - 0.25 - (i % 2) * 0.22)); g.rotation.y = a + Math.PI; }));
  const speeders = [0, 1].map(i => { const s = speeder.clone(); s.visible = false; root.add(s); return s; });
  anim.push(t => speeders.forEach((s, i) => { if (!s.visible) return; const a = -t * 0.18 + i * 3, r = 3.7 + i * 0.4, x = Math.sin(a) * r, z = Math.cos(a) * r; s.position.set(x, gy(x, z) + 0.12 + Math.sin(t * 3 + i) * 0.02, z); s.rotation.y = a - Math.PI / 2 + Math.PI; }));

  /* 2 · the Star Destroyer hangs over the valley, with TIE patrols */
  const sd = destroyer(); sd.scale.setScalar(5.2); sd.visible = false; root.add(sd);
  anim.push(t => { if (!sd.visible) return; sd.position.set(-2.6 + Math.sin(t * 0.05) * 1.2, 6.6 + Math.sin(t * 0.3) * 0.08, -3.6); sd.rotation.set(0.04, 0.5 + Math.sin(t * 0.05) * 0.1, 0.02); });
  const ties = [0, 1, 2, 3].map(i => { const s = tie(); s.scale.setScalar(0.85); s.visible = false; root.add(s); return s; });
  anim.push(t => ties.forEach((s, i) => { if (!s.visible) return; const a = t * 0.32 + (i < 2 ? 0 : Math.PI) + (i % 2) * 0.12, r = 5.6 + (i % 2) * 0.35; s.position.set(Math.cos(a) * r, 3.6 + (i % 2) * 0.2 + Math.sin(t + i) * 0.1, Math.sin(a) * r); s.rotation.y = -a; }));

  /* 3 · the rebellion: X-wings chase TIEs, with laser bolts */
  const wings = [0, 1, 2].map(i => { const s = xwing(); s.scale.setScalar(0.95); s.visible = false; root.add(s); return s; });
  anim.push(t => wings.forEach((s, i) => { if (!s.visible) return; const a = t * 0.32 - 0.5 - i * 0.14, r = 5.3 + i * 0.3; s.position.set(Math.cos(a) * r, 3.4 + i * 0.25 + Math.sin(t * 1.3 + i) * 0.15, Math.sin(a) * r); s.rotation.y = -a; s.rotation.x = Math.sin(t * 2 + i) * 0.3; }));
  const boltGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.34, 6); boltGeo.rotateZ(Math.PI / 2);
  const bolts = [...Array(10)].map((_, i) => { const b = mesh(boltGeo, new THREE.MeshBasicMaterial({ color: i % 2 ? '#FF4A3A' : '#55FF6A', toneMapped: false })); b.visible = false; b.userData = { born: -9, from: null, dir: new THREE.Vector3() }; root.add(b); return b; });
  let boltT = 0, rebels = false;
  anim.push(t => {
    if (!rebels) return;
    if (t - boltT > 0.35) { boltT = t; const b = bolts.find(q => t - q.userData.born > 1.2) || bolts[0], red = Math.random() < 0.6, src = red ? wings[Math.floor(Math.random() * 3)] : ties[Math.floor(Math.random() * 4)], dst = red ? ties[Math.floor(Math.random() * 4)] : wings[Math.floor(Math.random() * 3)];
      b.material.color.set(red ? '#FF4A3A' : '#55FF6A'); b.userData.born = t; b.userData.from = src.position.clone(); b.userData.dir.copy(dst.position).sub(src.position).normalize(); b.visible = true; b.lookAt(b.position.clone().add(b.userData.dir)); b.rotation.y += Math.PI / 2; }
    bolts.forEach(b => { const age = t - b.userData.born; if (!b.userData.from || age > 1.1) { b.visible = false; return; } b.position.copy(b.userData.from).addScaledVector(b.userData.dir, age * 7); });
  });

  /* 4 · the Death Star rises over the horizon */
  const [dc, dx] = canvas(1024, 512), [ec, ex] = canvas(1024, 512);
  dx.fillStyle = '#8D939B'; dx.fillRect(0, 0, 1024, 512); ex.fillStyle = '#000'; ex.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 2600; i++) { const w = 6 + rnd() * 40, h = 3 + rnd() * 16, x = rnd() * 1024, y = rnd() * 512, k = 120 + Math.floor(rnd() * 50); dx.fillStyle = `rgb(${k},${k + 4},${k + 10})`; dx.fillRect(x, y, w, h); }
  dx.fillStyle = '#3A3E45'; dx.fillRect(0, 250, 1024, 12);
  for (let i = 0; i < 900; i++) { ex.fillStyle = rnd() < 0.8 ? '#FFE9B8' : '#BFE0FF'; ex.fillRect(rnd() * 1024, rnd() * 512, 2, 1.5); }
  const deathStar = new THREE.Group();
  const dsBody = mesh(new THREE.SphereGeometry(2.1, 64, 40), new THREE.MeshStandardMaterial({ map: tex(dc), emissiveMap: tex(ec), emissive: '#FFFFFF', emissiveIntensity: 0.9, roughness: 0.8, metalness: 0.2, fog: false }));
  const dishGroup = new THREE.Group(); dishGroup.rotation.set(0.95, 0, 0.5);
  const dishM = mesh(new THREE.CircleGeometry(0.56, 40), new THREE.MeshStandardMaterial({ color: '#4E545C', roughness: 0.75, fog: false }), 0, 2.1, 0);
  dishM.rotation.x = -Math.PI / 2; dishGroup.add(dishM);
  [[0.56, 0.035, '#30343A'], [0.32, 0.018, '#3A3F46'], [0.14, 0.014, '#3A3F46']].forEach(q => { const r = torus(q[0], q[1], new THREE.MeshStandardMaterial({ color: q[2], roughness: 0.6, fog: false }), 0, 2.11, 0, 48); r.rotation.x = Math.PI / 2; dishGroup.add(r); });
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, sp = box(0.012, 0.012, 0.4, new THREE.MeshStandardMaterial({ color: '#3A3F46', fog: false }), Math.sin(a) * 0.2, 2.15, Math.cos(a) * 0.2); sp.rotation.y = a; sp.rotation.x = -0.25; dishGroup.add(sp); }
  const focus = ball(0.06, new THREE.MeshBasicMaterial({ color: '#7DFF8A', fog: false }), 0, 2.2, 0, 10, 8); dishGroup.add(focus);
  const dsHalo = glowSprite('#7DFF8A', 1.2); dsHalo.position.y = 2.22; dishGroup.add(dsHalo);
  deathStar.add(dsBody, dishGroup);
  deathStar.position.set(3.4, 2.5, -6.2); deathStar.scale.setScalar(0.62); deathStar.visible = false; sky.add(deathStar);
  anim.push(t => { if (!deathStar.visible) return; dsBody.rotation.y = t * 0.02; const k = 0.5 + 0.5 * Math.sin(t * 1.2); focus.material.color.setRGB(0.3 + 0.2 * k, 1, 0.4 + 0.2 * k); dsHalo.material.opacity = 0.4 + 0.5 * k; });

  /* ---------- short scenes (cards, tiles) ---------- */
  const pulse = mesh(new THREE.TorusGeometry(1, 0.03, 6, 72), new THREE.MeshBasicMaterial({ color: '#7FD3FF', transparent: true, opacity: 0, depthWrite: false }), bx, by + 0.3, bz); pulse.rotation.x = Math.PI / 2; root.add(pulse);
  const flare = glowSprite('#9FE0FF', 1.4); flare.material.opacity = 0; root.add(flare);
  const nodes = [];
  anim.push(t => nodes.forEach((n, i) => { const a = t * (0.5 + (i % 3) * 0.14) + i * 1.7, r = 1.2 + (i % 4) * 0.14; n.position.set(bx + Math.cos(a) * r, by + 1.5 + Math.sin(a * 1.3 + i) * 0.4, bz + Math.sin(a) * r); }));
  /* the Force lifts a ring of stones and lets them down again */
  const lifted = [...Array(7)].map((_, i) => { const a = (i / 7) * Math.PI * 2, x = bx + Math.cos(a) * 1.25, z = bz + Math.sin(a) * 1.25, m = mesh(rockGeo, rockMat, x, gy(x, z), z); m.scale.setScalar(0.7 + (i % 3) * 0.25); m.userData.y0 = gy(x, z); m.castShadow = true; root.add(m); return m; });
  /* a sandstorm */
  const storm = new THREE.Group(), stormMat = new THREE.MeshStandardMaterial({ color: '#D8B27A', flatShading: true, roughness: 1, transparent: true, opacity: 0, depthWrite: false });
  [[0, 0, 0, 1.4], [1.3, -0.1, 0.5, 1.1], [-1.3, -0.15, -0.3, 1.2], [0.4, 0.25, -0.9, 0.9], [-0.5, 0.1, 1.0, 1.0]].forEach(q => { const m = mesh(new THREE.IcosahedronGeometry(q[3], 1), stormMat, q[0], q[1], q[2]); m.scale.y = 0.45; storm.add(m); });
  storm.position.y = 0.9; storm.visible = false; root.add(storm);
  const dustN = 160, dustP = new Float32Array(dustN * 3), dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(dustP, 3));
  const dustMat = new THREE.PointsMaterial({ color: '#F0D2A0', size: 0.06, transparent: true, opacity: 0 }), dust = new THREE.Points(dustGeo, dustMat); dust.frustumCulled = false; root.add(dust);
  /* the imperial shuttle and the X-wing flyby */
  const lambda = new THREE.Group(), white = std('#E6E8EC', { roughness: 0.4, metalness: 0.3 });
  lambda.add(box(0.5, 0.18, 0.26, white, 0, 0, 0), cone(0.14, 0.24, white, 0.36, -0.02, 0, 4), box(0.04, 0.6, 0.26, white, -0.05, 0.38, 0));
  lambda.children[1].rotation.set(Math.PI / 4, 0, -Math.PI / 2);
  [-1, 1].forEach(k => { const w = box(0.03, 0.42, 0.24, white, -0.05, -0.1, k * 0.22); w.rotation.x = k * 0.6; lambda.add(w); });
  [-0.08, 0.08].forEach(z => lambda.add(ball(0.04, glow('#8FD8FF', 3), -0.27, 0, z, 8, 6)));
  lambda.scale.setScalar(1.6); lambda.visible = false; root.add(shadow(lambda));
  const squad = new THREE.Group(); [[0, 0, 0], [-0.7, 0.15, 0.6], [-0.7, -0.1, -0.6]].forEach(q => { const s = xwing(); s.position.set(...q); squad.add(s); }); squad.visible = false; root.add(squad);
  const falconFly = falcon(); falconFly.scale.setScalar(1.4); falconFly.visible = false; root.add(falconFly);

  const scenes = {
    signal(color) {
      pulse.material.color.set(color || '#7FD3FF');
      tween(1600, k => { pulse.scale.setScalar(0.3 + k * 5.2); pulse.material.opacity = 0.9 * (1 - k); });
      flare.material.color.set(color || '#9FE0FF');
      tween(1500, k => { flare.position.set(bx, by + 1.6 + k * 4.5, bz); flare.material.opacity = Math.sin(k * Math.PI); flare.scale.setScalar(1.4 + k * 1.4); });
    },
    learning(color) {
      tween(3200, k => lifted.forEach((m, i) => { const up = Math.sin(Math.min(1, k * 1.15) * Math.PI); m.position.y = m.userData.y0 + up * (1.1 + (i % 3) * 0.25); m.rotation.y += 0.02; m.rotation.x += 0.01; }));
      scenes.signal('#7FD3FF');
      if (nodes.length >= 14) return;
      const n = ball(0.06, glow(color || '#7FD3FF', 3.2), 0, 0, 0, 8, 8);
      root.add(n); nodes.push(n); n.scale.setScalar(0.01); tween(700, k => n.scale.setScalar(Math.max(0.01, k)), backOut);
    },
    storm() {
      storm.visible = true;
      const seeds = [...Array(dustN)].map(() => [rnd() * 10 - 5, 0.3 + rnd() * 1.8, rnd() * 10 - 5, 0.5 + rnd()]);
      tween(4400, k => {
        const o = Math.min(1, k * 5, (1 - k) * 4);
        stormMat.opacity = o * 0.75; dustMat.opacity = o * 0.9;
        storm.position.x = -4 + k * 8; storm.rotation.y = k * 1.5;
        seeds.forEach((s, i) => { dustP[i * 3] = ((s[0] + k * 14 * s[3] + 5) % 10) - 5; dustP[i * 3 + 1] = s[1] + Math.sin(k * 20 + i) * 0.1; dustP[i * 3 + 2] = s[2]; });
        dustGeo.attributes.position.needsUpdate = true;
      }, k => k).then(() => { storm.visible = false; dustMat.opacity = 0; });
    },
    airship() {
      lambda.visible = true;
      tween(9000, k => { lambda.position.set(-8 + k * 16, 3.6 + Math.sin(k * 7) * 0.12, -2.2 + k * 4.2); lambda.rotation.y = -0.27; }, k => k).then(() => { lambda.visible = false; });
    },
    birds() {
      const f = era >= 3 ? falconFly : squad;
      f.visible = true;
      tween(5200, k => { f.position.set(-8 + k * 16, 3.0 + Math.sin(k * 6) * 0.25, 2.8 - k * 5); f.rotation.y = 0.32; f.rotation.x = Math.sin(k * 6) * 0.15; }, k => k).then(() => { f.visible = false; });
    }
  };

  /* ---------- eras ---------- */
  let era = -1, wagons = 1;
    function applyEra(n, quiet) {
    era = n;
    const one = (o, on) => { if (on) { if (quiet) o.visible = true; else pop(o); } else o.visible = false; };
    crawler.visible = n <= 2;
    pods.forEach(o => one(o, n === 1 || n === 2));
    speeders.forEach(o => one(o, n >= 1));
    one(sd, n >= 2);
    ties.forEach(o => one(o, n >= 2));
    wings.forEach(o => one(o, n >= 3));
    rebels = n >= 3;
    if (n >= 4 && !deathStar.visible) { deathStar.visible = true; if (!quiet) { const y0 = 2.5; tween(2600, k => { deathStar.position.y = y0 - 2.4 + 2.4 * k; deathStar.scale.setScalar(0.3 + 0.32 * k); }, backOut); } }
    else if (n < 4) deathStar.visible = false;
    if (!rebels) bolts.forEach(b => { b.visible = false; });
  }
  function refreshSite(s) {
    for (let i = 1; i <= 3; i++) { if (i <= s.level) pop(s.lv[i]); else s.lv[i].visible = false; }
    s.lot.visible = s.level === 0;
  }

  applyEra(0, true);
  const api = {
    gy,
    sector(key, level, color, full) {
      const s = state[key];
      if (!s) return;
      if (level !== s.level) { s.level = level; refreshSite(s); }
      if (color !== s.color) { s.flag.visible = !!color; if (color) { s.flagMat.color.set(color); s.flagMat.emissive.set(color); s.flagMat.emissiveIntensity = 0.3; s.halo.material.color.set(color); s.lights.forEach(l => { l.material.color.set(color); l.material.emissive.set(color); }); } s.color = color; }
      if (full !== s.full) { s.halo.visible = !!full; s.full = full; }
    },
    leader(pipeline, color) {
      wagons = Math.min(6, 1 + Math.floor(pipeline / 1000));
      let e = 0;
      AGE_AT.forEach((v, i) => { if (pipeline >= v) e = i; });
      if (e > era) { applyEra(e); scenes.signal(color || '#FFE81F'); }
      return era;
    },
    event(kind, color) { if (scenes[kind]) scenes[kind](color); },
    /* the twin suns go down as the game goes on, from white noon to a red double sunset */
    daylight(t) {
      const h = 3.6 - t * 4.2, cA = new THREE.Color('#FFF6DD').lerp(new THREE.Color('#FF6A3A'), Math.min(1, t * 1.15)), cB = new THREE.Color('#FFE2B0').lerp(new THREE.Color('#FF8A3A'), Math.min(1, t * 1.15));
      sunA.position.set(-6.2 + t * 1.5, h, -12); sunB.position.set(-4.5 + t * 1.5, h - 0.6, -11.8);
      coreA.position.copy(sunA.position); coreB.position.copy(sunB.position);
      sunA.material.color.copy(cA); sunB.material.color.copy(cB);
      const fade = t > 0.9 ? Math.max(0, 1 - (t - 0.9) * 10) : 1;
      [sunA, sunB, coreA, coreB].forEach(s => { s.material.opacity = fade; });
    },
    reset() {
      Object.keys(state).forEach(k => this.sector(k, 0, null, false));
      applyEra(0, true);
      nodes.splice(0).forEach(n => root.remove(n));
    }
  };
  api.daylight(0);
  return api;
}
