/* Demon Slayer (edición fan) · el centro del tablero: un monte de noche.
   Colinas de pinos, glicinias en flor que protegen del demonio, un pueblo con farolillos, un torii,
   un río y la luna llena. La partida es una noche: empieza a oscuras y termina al amanecer.
   Las eras traen el Tren Infinito, el Distrito del Entretenimiento, la Aldea de los Herreros
   y el Castillo Infinito flotando bajo la luna roja. */
import { THREE, std, glow, metal, mesh, box, cyl, ball, cone, torus, shadow, glowSprite, canvas, tex, smooth, rng, backOut, mergeGeometries } from '../../kit3d.js?v=1116b';
import { house, roof, butterfly, crow } from './piezas.js?v=1116b';

export const SITES = { robotics: [1.7, 2.3], lab: [3.3, 2.7], saas: [-0.4, 2.7], health: [2.4, -1.4], security: [0.8, -1.7], materials: [1.75, 0.95] };
const AGE_AT = [0, 700, 1500, 2600, 3800];
const mat = (c, o = {}) => std(c, Object.assign({ roughness: 0.85 }, o));

export function buildWorld(ctx) {
  const { scene, root, anim, blinkers, tween } = ctx;
  const pop = g => { if (g.visible) return; g.visible = true; g.scale.setScalar(0.01); tween(650, k => g.scale.setScalar(Math.max(0.01, k)), backOut); };
  const rnd = rng(31);

  /* ---------- terrain: forested hills, a river, two peaks at the back ---------- */
  const river = new THREE.CatmullRomCurve3([[-1.5, -1.5], [-0.9, -0.3], [-1.9, 0.9], [-1.5, 2.2], [-2.6, 3.3], [-3.5, 4.4]].map(p => new THREE.Vector3(p[0], 0, p[1]))).getPoints(48);
  const riverDist = (x, z) => { let d = 9; for (const p of river) d = Math.min(d, Math.hypot(p.x - x, p.z - z)); return d; };
  const noise = (x, z) => 0.5 + 0.5 * Math.sin(x * 1.7 + Math.sin(z * 2.3) * 1.3) * Math.cos(z * 1.3 + x * 0.7);
  const hgt = (x, z) => {
    const r = Math.hypot(x, z);
    let h = 0.1 + 0.14 * noise(x, z);
    h += 3.0 * Math.exp(-((x + 1.9) ** 2 + (z + 2.4) ** 2) / 1.4);
    h += 2.0 * Math.exp(-((x - 1.8) ** 2 + (z + 3.1) ** 2) / 1.0);
    h += 1.1 * Math.exp(-((x + 3.6) ** 2 + (z + 0.4) ** 2) / 0.9);
    h += 0.45 * Math.exp(-((x - 0.2) ** 2 + (z - 0.9) ** 2) / 0.5);
    const d = riverDist(x, z);
    if (d < 0.42 && h < 1.2) h = THREE.MathUtils.lerp(0.02, h, smooth(0.12, 0.42, d));
    return h * smooth(5.5, 4.7, r) + 0.02;
  };
  const K = 28, S = 90, pos = [], idx = [];
  pos.push(0, hgt(0, 0), 0);
  for (let k = 1; k <= K; k++) for (let s = 0; s < S; s++) { const r = (k / K) * 5.5, a = (s / S) * Math.PI * 2 + (k % 2) * (Math.PI / S), x = r * Math.cos(a), z = r * Math.sin(a); pos.push(x, hgt(x, z), z); }
  for (let s = 0; s < S; s++) idx.push(0, 1 + ((s + 1) % S), 1 + s);
  for (let k = 1; k < K; k++) for (let s = 0; s < S; s++) { const a = 1 + (k - 1) * S + s, b = 1 + (k - 1) * S + ((s + 1) % S), c = 1 + k * S + s, d = 1 + k * S + ((s + 1) % S); idx.push(a, b, c, b, d, c); }
  let geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo = geo.toNonIndexed();
  const p = geo.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color(), c2 = new THREE.Color();
  for (let i = 0; i < p.count; i += 3) {
    const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, z = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3, h = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3, n = noise(x * 2.1, z * 2.1);
    if (riverDist(x, z) < 0.2 && h < 0.3) c.set('#2E5A78').lerp(c2.set('#4A86A8'), n * 0.5);
    else if (h > 2.0) c.set('#E8ECF2').lerp(c2.set('#C9D2DE'), n * 0.4);
    else if (h > 1.0) c.set('#4E5A5E').lerp(c2.set('#6E7A7E'), n * 0.7);
    else if (h > 0.4) c.set('#1E4434').lerp(c2.set('#285A42'), n);
    else c.set('#2A5A40').lerp(c2.set('#3E7452'), n);
    for (let k = 0; k < 3; k++) { col[(i + k) * 3] = c.r; col[(i + k) * 3 + 1] = c.g; col[(i + k) * 3 + 2] = c.b; }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const land = mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.92, envMapIntensity: 0.25 }), 0, 0.14, 0);
  land.castShadow = true; land.receiveShadow = true; root.add(land);
  const gy = (x, z) => hgt(x, z) + 0.14;
  const put = (g, x, z, ry = 0) => { g.position.set(x, gy(x, z) - 0.02, z); g.rotation.y = ry; return g; };
  const bx = 0.2, bz = 0.9, by = gy(bx, bz);
  const village = [[-3.3, 1.7], [-3.0, 2.4], [-3.7, 2.2], [-2.7, 1.3], [3.6, 1.6], [3.0, 1.9]];

  /* pines */
  const tc = (r, h, y) => { const g = new THREE.ConeGeometry(r, h, 6); g.translate(0, y, 0); return g; };
  const treeGeo = mergeGeometries([tc(0.24, 0.4, 0.3), tc(0.18, 0.36, 0.52), tc(0.11, 0.3, 0.74)]);
  const trunkGeo = new THREE.CylinderGeometry(0.035, 0.05, 0.16, 5); trunkGeo.translate(0, 0.07, 0);
  const blocked = [[bx, bz, 1.0], ...village.map(v => [v[0], v[1], 0.45]), [-0.4, -0.6, 0.6]].concat(Object.values(SITES).map(s => [s[0], s[1], 0.8]));
  const spots = []; let guard = 0;
  while (spots.length < 170 && guard++ < 5000) { const a = rnd() * 7, r = Math.sqrt(rnd()) * 5.2, x = r * Math.cos(a), z = r * Math.sin(a), h = hgt(x, z); if (h > 1.4 || riverDist(x, z) < 0.42 || blocked.some(b => Math.hypot(x - b[0], z - b[1]) < b[2])) continue; spots.push([x, z, 0.7 + rnd() * 0.8, rnd()]); }
  const trees = new THREE.InstancedMesh(treeGeo, new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9, envMapIntensity: 0.2 }), spots.length);
  const trunks = new THREE.InstancedMesh(trunkGeo, mat('#2E2018'), spots.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), v = new THREE.Vector3();
  spots.forEach((s, i) => { q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), s[3] * 6); m4.compose(v.set(s[0], gy(s[0], s[1]) - 0.02, s[1]), q, sc.setScalar(s[2])); trees.setMatrixAt(i, m4); trunks.setMatrixAt(i, m4); trees.setColorAt(i, c.set('#133426').lerp(c2.set('#24543C'), s[3])); });
  trees.castShadow = trunks.castShadow = true; trees.receiveShadow = true; root.add(trees, trunks);

  /* wisteria: twisted trunks with hanging purple blossoms that glow softly at night */
  const flowerGeo = new THREE.ConeGeometry(0.05, 0.26, 5); flowerGeo.rotateX(Math.PI); flowerGeo.translate(0, -0.08, 0);
  const wisteria = (x, z, s = 1) => {
    const w = new THREE.Group(), bark = mat('#4A3A30', { flatShading: true });
    const tr = cyl(0.05 * s, 0.08 * s, 0.6 * s, bark, 0, 0.3 * s, 0, 6); tr.rotation.z = 0.15; w.add(tr);
    const canopy = ball(0.36 * s, std('#8A6AC0', { flatShading: true, roughness: 0.8, emissive: '#5A3A9A', emissiveIntensity: 0.35 }), 0.05, 0.74 * s, 0, 8, 6); canopy.scale.y = 0.5; w.add(canopy);
    const fl = new THREE.InstancedMesh(flowerGeo, new THREE.MeshStandardMaterial({ color: '#C9A0F2', emissive: '#8A5AD9', emissiveIntensity: 1.0, roughness: 0.7 }), 40);
    for (let k = 0; k < 40; k++) { const a = rnd() * 7, r = Math.sqrt(rnd()) * 0.36 * s; m4.compose(v.set(0.05 + Math.cos(a) * r, 0.62 * s, Math.sin(a) * r), q.identity(), sc.set(1, 0.7 + rnd() * 0.8, 1).multiplyScalar(s)); fl.setMatrixAt(k, m4); fl.setColorAt(k, c.set('#C9A0F2').lerp(c2.set('#8A5AD9'), rnd())); }
    w.add(fl);
    return put(w, x, z, rnd() * 6);
  };
  const wisterias = [[-0.4, -0.6, 1.2], [1.0, 0.2, 0.9], [-0.7, 1.9, 0.9], [2.6, 0.5, 0.8], [-2.3, -0.1, 0.8], [0.2, -3.6, 0.9], [-3.9, 3.2, 0.7], [4.2, -0.9, 0.7]].map(q2 => { const w = wisteria(q2[0], q2[1], q2[2]); root.add(shadow(w)); return w; });

  /* the shrine on the hill in the middle: a big wisteria, a torii and stone lanterns */
  const shrine = new THREE.Group(), red = mat('#B3261E', { roughness: 0.6 }), stone = mat('#8A8E92', { flatShading: true });
  shrine.add(cyl(0.7, 0.8, 0.08, stone, 0, 0.04, 0, 10));
  const big = wisteria(0, 0, 1.8); big.position.set(0, 0.06, 0); shrine.add(big);
  const torii = new THREE.Group();
  [-0.28, 0.28].forEach(x => torii.add(cyl(0.035, 0.04, 0.56, red, x, 0.28, 0, 10)));
  torii.add(box(0.8, 0.05, 0.07, mat('#1A1A1A'), 0, 0.6, 0), box(0.7, 0.04, 0.05, red, 0, 0.5, 0));
  torii.position.set(0.6, 0, 0.75); torii.rotation.y = 0.6; shrine.add(torii);
  [[-0.5, 0.6], [0.95, 0.15]].forEach(q2 => { const l = new THREE.Group(); l.add(cyl(0.05, 0.07, 0.04, stone, 0, 0.02, 0, 6), cyl(0.025, 0.025, 0.14, stone, 0, 0.1, 0, 6), box(0.1, 0.08, 0.1, stone, 0, 0.21, 0), box(0.06, 0.05, 0.11, glow('#FFC985', 2.2), 0, 0.21, 0), cone(0.1, 0.07, stone, 0, 0.29, 0, 4)); l.position.set(q2[0], 0, q2[1]); shrine.add(l); });
  put(shrine, bx, bz); root.add(shadow(shrine));

  /* the village */
  const vg = new THREE.Group();
  village.forEach((q2, k) => { const h = house(0.36 + (k % 2) * 0.1, 0.28, 0.18); h.position.set(q2[0], gy(q2[0], q2[1]) - 0.02, q2[1]); h.rotation.y = rnd() * 6; vg.add(h); });
  root.add(shadow(vg));
  const bridge = new THREE.Group(); bridge.add(box(0.9, 0.05, 0.24, red, 0, 0.2, 0)); [-0.12, 0.12].forEach(z => bridge.add(box(0.9, 0.04, 0.02, red, 0, 0.3, z))); [-0.35, -0.12, 0.12, 0.35].forEach(x => [-0.12, 0.12].forEach(z => bridge.add(cyl(0.012, 0.012, 0.12, red, x, 0.25, z, 6))));
  bridge.position.set(-1.72, 0.14, 1.55); bridge.rotation.y = -0.25; root.add(shadow(bridge));

  /* fireflies and drifting petals */
  const fN = 130, fp = new Float32Array(fN * 3), fs = [];
  for (let i = 0; i < fN; i++) { const a = rnd() * 7, r = rnd() * 9.6; fs.push([r * Math.cos(a), 0.4 + rnd() * 2.4, r * Math.sin(a), rnd() * 7, 0.3 + rnd() * 0.6]); }
  const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(fp, 3));
  const fMat = new THREE.PointsMaterial({ color: '#E3C9FF', size: 0.07, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  root.add(new THREE.Points(fg, fMat));
  anim.push(t => { fs.forEach((f, i) => { fp[i * 3] = f[0] + Math.sin(t * f[4] + f[3]) * 0.4; fp[i * 3 + 1] = f[1] + Math.sin(t * f[4] * 1.7 + f[3]) * 0.3 - ((t * 0.08 + f[3]) % 1) * 0.3; fp[i * 3 + 2] = f[2] + Math.cos(t * f[4] + f[3]) * 0.4; }); fg.attributes.position.needsUpdate = true; });

  /* ---------- the moon, behind the board ---------- */
  const sky = new THREE.Group(); scene.add(sky);
  anim.push(() => { const cp = ctx.camera.position; sky.rotation.y = Math.atan2(cp.x, cp.z); });
  const [mc, mx] = canvas(256, 256);
  mx.fillStyle = '#F4EBD0'; mx.fillRect(0, 0, 256, 256);
  for (let k = 0; k < 26; k++) { mx.fillStyle = `rgba(160,150,130,${0.15 + Math.random() * 0.2})`; mx.beginPath(); mx.arc(Math.random() * 256, Math.random() * 256, 8 + Math.random() * 30, 0, 7); mx.fill(); }
  const moonMat = new THREE.MeshBasicMaterial({ map: tex(mc), color: '#FFFFFF', fog: false });
  const moon = ball(1.1, moonMat, 0, 0, 0, 32, 20), moonGlow = glowSprite('#FFF2CC', 5);
  const moonG = new THREE.Group(); moonG.add(moon, moonGlow); moonG.position.set(-3.4, 2.6, -11.5); sky.add(moonG);

  /* ---------- sector sites: camp → house → pagoda, with the leader's banner ---------- */
  const state = {};
  Object.keys(SITES).forEach(key => {
    const [x, z] = SITES[key], g = new THREE.Group();
    g.position.set(x, gy(x, z) - 0.02, z);
    const lot = new THREE.Group(), rope = new THREE.MeshBasicMaterial({ color: '#E8DCC0', transparent: true, opacity: 0.5 });
    [[-0.34, -0.26], [0.34, -0.26], [0.34, 0.26], [-0.34, 0.26]].forEach(q2 => lot.add(cyl(0.012, 0.012, 0.16, mat('#4A2E1C'), q2[0], 0.08, q2[1], 5)));
    lot.add(box(0.68, 0.008, 0.008, rope, 0, 0.13, -0.26), box(0.68, 0.008, 0.008, rope, 0, 0.13, 0.26), box(0.008, 0.008, 0.52, rope, -0.34, 0.13, 0), box(0.008, 0.008, 0.52, rope, 0.34, 0.13, 0));
    const lv = [null, new THREE.Group(), new THREE.Group(), new THREE.Group()];
    const tent = cone(0.22, 0.3, mat('#C9B88E', { flatShading: true }), -0.15, 0.15, 0, 4); tent.rotation.y = Math.PI / 4; lv[1].add(tent);
    const fire = new THREE.Group(); fire.add(cone(0.035, 0.1, glow('#FF8A3D', 3), 0, 0.05, 0, 6), glowSprite('#FF8A3D', 0.45)); fire.position.set(0.2, 0, 0.1); lv[1].add(fire);
    const h = house(0.44, 0.32, 0.2); h.position.set(0.05, 0, -0.05); lv[2].add(h);
    const pag = new THREE.Group(); let y = 0; [[0.24, 0.16], [0.19, 0.13], [0.14, 0.11]].forEach(([w, hh]) => { pag.add(box(w, hh, w, mat('#E9DFC9'), 0, y + hh / 2, 0)); const r = roof(w * 1.6, w * 1.6, hh * 0.5, mat('#2E3440', { roughness: 0.6 })); r.position.y = y + hh + hh * 0.2; pag.add(r); y += hh * 1.4; });
    pag.position.set(-0.3, 0, 0.2); lv[3].add(pag);
    const lampMats = [];
    [[-0.1, 0.3], [0.3, 0.3], [0.35, -0.25]].forEach(q2 => { const m = new THREE.MeshStandardMaterial({ color: '#FF5A3A', emissive: '#FF5A3A', emissiveIntensity: 1.6 }); lampMats.push(m); const l = ball(0.04, m, q2[0], 0.3, q2[1], 10, 8); l.scale.y = 1.3; lv[3].add(l, cyl(0.006, 0.006, 0.26, mat('#4A2E1C'), q2[0], 0.13, q2[1], 4)); });
    for (let i = 1; i <= 3; i++) { lv[i].visible = false; shadow(lv[i]); g.add(lv[i]); }
    const flagMat = new THREE.MeshStandardMaterial({ color: '#E8DCC0', side: THREE.DoubleSide, roughness: 0.6, emissive: '#000000' }), flag = new THREE.Group();
    const cloth = mesh(new THREE.PlaneGeometry(0.1, 0.3).translate(0.05, -0.15, 0), flagMat, 0, 0.84, 0);
    flag.add(cyl(0.012, 0.014, 0.86, mat('#4A2E1C'), 0, 0.43, 0, 6), cloth); flag.position.set(-0.52, 0, 0.42); flag.visible = false;
    anim.push(t => { if (flag.visible) cloth.rotation.y = Math.sin(t * 3 + x) * 0.4; });
    const halo = mesh(new THREE.TorusGeometry(0.78, 0.022, 6, 48), new THREE.MeshBasicMaterial({ color: '#B98CE6', transparent: true, opacity: 0.8 }), 0, 0.06, 0);
    halo.rotation.x = Math.PI / 2; halo.visible = false;
    anim.push(t => { if (halo.visible) { halo.scale.setScalar(1 + 0.05 * Math.sin(t * 2.5)); halo.material.opacity = 0.55 + 0.25 * Math.sin(t * 2.5); } });
    g.add(lot, flag, halo); root.add(g);
    state[key] = { lot, lv, flag, flagMat, halo, lampMats, level: 0, color: null, full: false };
  });

  /* ---------- eras ---------- */
  const R = 5.5;
  /* 1 · the Infinity Train runs round the rim, puffing smoke */
  const train = [], green = mat('#2E5A44', { roughness: 0.5, metalness: 0.2 }), black = std('#15161A', { roughness: 0.4, metalness: 0.5 });
  for (let i = 0; i < 5; i++) {
    const w = new THREE.Group();
    if (i === 0) { const boiler = cyl(0.08, 0.08, 0.3, black, 0.04, 0.14, 0, 14); boiler.rotation.z = Math.PI / 2; w.add(boiler, box(0.12, 0.18, 0.15, black, -0.12, 0.16, 0), cyl(0.03, 0.04, 0.1, black, 0.12, 0.26, 0, 10), box(0.36, 0.03, 0.17, mat('#7A1A16'), 0, 0.04, 0), ball(0.025, glow('#FFD58A', 4), 0.2, 0.15, 0, 6, 4)); }
    else w.add(box(0.32, 0.15, 0.15, green, 0, 0.12, 0), box(0.33, 0.02, 0.16, black, 0, 0.21, 0), box(0.26, 0.04, 0.152, glow('#FFD58A', 1.2), 0, 0.14, 0), box(0.34, 0.03, 0.15, black, 0, 0.035, 0));
    w.visible = false; shadow(w); root.add(w); train.push(w);
  }
  const puffs = [0, 1, 2, 3, 4].map(() => { const s = ball(0.08, new THREE.MeshStandardMaterial({ color: '#DCDCDC', transparent: true, opacity: 0.6, flatShading: true }), 0, 0, 0, 8, 6); s.visible = false; root.add(s); return s; });
  anim.push(t => { train.forEach((w, i) => { if (!w.visible) return; const a = t * 0.2 - i * 0.068; w.position.set(Math.sin(a) * R, 0.3, Math.cos(a) * R); w.rotation.y = a; }); const loco = train[0]; puffs.forEach((s, k) => { s.visible = loco.visible; if (!loco.visible) return; const u = (t * 0.6 + k / 5) % 1, a = t * 0.2 - u * 0.25; s.position.set(Math.sin(a) * R, 0.62 + u * 0.8, Math.cos(a) * R); s.scale.setScalar(0.5 + u * 1.6); s.material.opacity = 0.6 * (1 - u); }); });
  /* 2 · the Entertainment District: strings of red lanterns and paper lanterns rising */
  const district = new THREE.Group();
  village.slice(0, 4).forEach((v1, k) => { const v2 = village[(k + 1) % 4]; for (let s = 0; s <= 6; s++) { const u = s / 6, x = v1[0] + (v2[0] - v1[0]) * u, z = v1[1] + (v2[1] - v1[1]) * u, y = Math.max(gy(v1[0], v1[1]), gy(v2[0], v2[1])) + 0.42 - Math.sin(u * Math.PI) * 0.12; const l = ball(0.035, new THREE.MeshStandardMaterial({ color: '#FF4A2A', emissive: '#FF3A1A', emissiveIntensity: 2 }), x, y, z, 8, 6); l.scale.y = 1.3; district.add(l); } });
  district.visible = false; root.add(district);
  const floaters = [...Array(14)].map((_, k) => { const l = ball(0.05, new THREE.MeshStandardMaterial({ color: '#FFB067', emissive: '#FF8A3D', emissiveIntensity: 2.2 }), 0, 0, 0, 8, 6); l.scale.y = 1.25; l.visible = false; root.add(l); l.userData = { a: rnd() * 7, r: 1 + rnd() * 3.5, ph: rnd() }; return l; });
  anim.push(t => floaters.forEach(l => { if (!l.visible) return; const u = (t * 0.05 + l.userData.ph) % 1; l.position.set(Math.cos(l.userData.a) * l.userData.r, 0.5 + u * 6, Math.sin(l.userData.a) * l.userData.r); l.material.opacity = 1; }));
  /* 3 · the Swordsmith Village: steam from the hot springs, forge glow and sparks */
  const smith = new THREE.Group();
  const spring = mesh(new THREE.CircleGeometry(0.4, 24).rotateX(-Math.PI / 2), std('#7FC8D9', { roughness: 0.1, metalness: 0.3, emissive: '#2A6A7A', emissiveIntensity: 0.4 }), 0, 0.03, 0);
  smith.add(spring, torus(0.4, 0.06, mat('#6E7378', { flatShading: true }), 0, 0.03, 0, 18));
  smith.children[1].rotation.x = Math.PI / 2;
  const steam = [0, 1, 2, 3, 4, 5].map(k => { const s = ball(0.1, new THREE.MeshStandardMaterial({ color: '#E8ECF2', transparent: true, opacity: 0.45, flatShading: true, depthWrite: false }), 0, 0, 0, 8, 6); smith.add(s); return s; });
  const forge = new THREE.Group(); forge.add(box(0.3, 0.22, 0.26, mat('#4A3A30'), 0, 0.11, 0), box(0.12, 0.1, 0.02, glow('#FF6A1F', 3), 0, 0.1, 0.131), glowSprite('#FF6A1F', 0.8)); forge.children[2].position.set(0, 0.12, 0.2); forge.position.set(0.7, 0, 0.1); smith.add(forge);
  put(smith, -0.4, -0.6 + 1.2); smith.position.set(-1.0, gy(-1.0, -0.7) - 0.02, -0.7); smith.visible = false; root.add(smith);
  anim.push(t => { if (!smith.visible) return; steam.forEach((s, k) => { const u = (t * 0.25 + k / 6) % 1; s.position.set(Math.sin(k * 2.3) * 0.2, 0.1 + u * 1.0, Math.cos(k * 2.3) * 0.2); s.scale.setScalar(0.5 + u * 2); s.material.opacity = 0.45 * (1 - u); }); });
  /* 4 · the Infinity Castle: impossible rooms floating and turning in the sky */
  const castle = new THREE.Group();
  for (let k = 0; k < 9; k++) {
    const room = house(0.5 + rnd() * 0.3, 0.4, 0.22, null);
    const a = (k / 9) * Math.PI * 2, r = 1.2 + (k % 3) * 0.7;
    room.position.set(Math.cos(a) * r, 4.4 + (k % 4) * 0.55, Math.sin(a) * r);
    room.rotation.set(k % 2 ? Math.PI : 0.3 * (k % 3), a, (k % 3) * 0.6);
    castle.add(room);
  }
  [-1.6, 1.6].forEach(x => { const st = box(0.12, 0.04, 1.4, mat('#4A2E1C'), x, 4.9, 0); st.rotation.x = 0.6; castle.add(st); });
  castle.position.set(bx, 0, bz); castle.visible = false; root.add(castle);
  anim.push(t => { if (!castle.visible) return; castle.rotation.y = t * 0.06; castle.children.forEach((r, k) => { r.position.y += Math.sin(t * 0.8 + k) * 0.0015; }); });

  /* ---------- short scenes ---------- */
  const pulse = mesh(new THREE.TorusGeometry(1, 0.03, 6, 72), new THREE.MeshBasicMaterial({ color: '#E8DCC0', transparent: true, opacity: 0, depthWrite: false }), bx, by + 0.3, bz); pulse.rotation.x = Math.PI / 2; root.add(pulse);
  /* a breathing technique: a ribbon of light spiralling up round the shrine */
  const breathN = 160, breathP = new Float32Array(breathN * 3), breathGeo = new THREE.BufferGeometry(); breathGeo.setAttribute('position', new THREE.BufferAttribute(breathP, 3));
  const breathMat = new THREE.PointsMaterial({ color: '#7FD3FF', size: 0.09, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const breath = new THREE.Points(breathGeo, breathMat); breath.frustumCulled = false; root.add(breath);
  const crows = new THREE.Group(); [[0, 0, 0], [-0.5, 0.15, 0.4], [-0.6, -0.1, -0.4]].forEach(q2 => { const cr = crow(); cr.position.set(...q2); cr.scale.setScalar(1.6); crows.add(cr); }); crows.visible = false; root.add(crows);
  const flies = new THREE.Group(); for (let k = 0; k < 18; k++) { const b = butterfly(['#B98CFF', '#8FD3FF', '#F27BAA'][k % 3]); b.scale.setScalar(2); b.position.set((rnd() - 0.5) * 2, (rnd() - 0.5) * 1, (rnd() - 0.5) * 2); flies.add(b); } flies.visible = false; root.add(flies);
  anim.push(t => { if (flies.visible) flies.children.forEach((b, k) => b.userData.flap(t + k)); if (crows.visible) crows.children.forEach((cr, k) => cr.userData.wings.forEach(w => { w.rotation.x = (Math.PI / 2) * w.userData.s + Math.sin(t * 12 + k) * 0.8 * w.userData.s; })); });
  const storm = new THREE.Group(), stormMat = new THREE.MeshStandardMaterial({ color: '#1A1C26', flatShading: true, roughness: 1, transparent: true, opacity: 0 });
  [[0, 0, 0, 1.2], [1.2, -0.1, 0.3, 0.9], [-1.1, -0.12, -0.2, 0.9], [0.3, 0.3, -0.6, 0.8]].forEach(q2 => { const m = mesh(new THREE.IcosahedronGeometry(q2[3], 1), stormMat, q2[0], q2[1], q2[2]); m.scale.y = 0.5; storm.add(m); });
  const bolts = [[-0.5, 0.2], [0.6, -0.3], [0.1, 0.5]].map(p2 => { const bolt = new THREE.Group(), bm = new THREE.MeshBasicMaterial({ color: '#FFE45A', transparent: true, opacity: 0 }); [[0, -0.5, 0.25], [0.14, -1.0, -0.3], [-0.04, -1.5, 0.28], [0.1, -2.0, -0.2]].forEach(s => { const b = box(0.05, 0.56, 0.05, bm, p2[0] + s[0], s[1], p2[1]); b.rotation.z = s[2]; bolt.add(b); }); bolt.userData.mat = bm; storm.add(bolt); return bolt; });
  storm.position.set(0, 4.3, 0); storm.visible = false; root.add(storm);

  const scenes = {
    signal(color) {
      pulse.material.color.set(color || '#E8DCC0');
      tween(1600, k => { pulse.scale.setScalar(0.3 + k * 5.2); pulse.material.opacity = 0.9 * (1 - k); });
      crows.visible = true;
      tween(4200, k => { crows.position.set(-6 + k * 12, 2.8 + Math.sin(k * 6) * 0.2, 2.2 - k * 3.8); crows.rotation.y = -0.3; }, k => k).then(() => { crows.visible = false; });
    },
    learning(color) {
      breathMat.color.set(color || '#7FD3FF');
      tween(3200, k => {
        breathMat.opacity = Math.min(1, k * 4, (1 - k) * 3);
        for (let i = 0; i < breathN; i++) { const u = i / breathN, a = u * Math.PI * 6 + k * 8, r = 0.9 - u * 0.4, y = by + u * 3 * Math.min(1, k * 1.5); breathP[i * 3] = bx + Math.cos(a) * r; breathP[i * 3 + 1] = y; breathP[i * 3 + 2] = bz + Math.sin(a) * r; }
        breathGeo.attributes.position.needsUpdate = true;
      }, k => k);
    },
    storm() {
      storm.visible = true;
      tween(4200, k => {
        stormMat.opacity = Math.min(1, k * 5, (1 - k) * 4) * 0.92;
        storm.position.x = -0.6 + k * 1.2;
        bolts.forEach((b, i) => { const t0 = 0.2 + i * 0.2, d = k - t0; b.userData.mat.opacity = d > 0 && d < 0.09 ? (Math.floor(d * 90) % 2 ? 0.25 : 1) : 0; });
      }, k => k).then(() => { storm.visible = false; });
    },
    airship() { scenes.signal('#E0453A'); },
    birds() {
      flies.visible = true;
      tween(5200, k => { flies.position.set(-6 + k * 12, 1.6 + Math.sin(k * 6) * 0.3, 2.4 - k * 4); flies.rotation.y = k * 2; }, k => k).then(() => { flies.visible = false; });
    }
  };

  let era = -1;
  function applyEra(n, quiet) {
    era = n;
    const one = (o, on) => { if (on) { if (quiet) o.visible = true; else pop(o); } else o.visible = false; };
    train.forEach(w => one(w, n >= 1));
    one(district, n >= 2); floaters.forEach(l => one(l, n >= 2));
    one(smith, n >= 3);
    one(castle, n >= 4);
    moonMat.color.set(n >= 4 ? '#FF6A5A' : '#FFFFFF'); moonGlow.material.color.set(n >= 4 ? '#FF4A3A' : '#FFF2CC');
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
      if (color !== s.color) { s.flag.visible = !!color; if (color) { s.flagMat.color.set(color); s.flagMat.emissive.set(color); s.flagMat.emissiveIntensity = 0.3; s.halo.material.color.set(color); s.lampMats.forEach(m => { m.color.set(color); m.emissive.set(color); }); } s.color = color; }
      if (full !== s.full) { s.halo.visible = !!full; s.full = full; }
    },
    leader(pipeline, color) {
      let e = 0;
      AGE_AT.forEach((v2, i) => { if (pipeline >= v2) e = i; });
      if (e > era) { applyEra(e); scenes.signal(color); }
      return era;
    },
    event(kind, color) { if (scenes[kind]) scenes[kind](color); },
    /* the night goes by: the moon sinks behind the board and dawn comes at the end */
    daylight(t) {
      moonG.position.y = 2.6 - t * 2.4;
      fMat.opacity = 0.9 * (1 - Math.max(0, t - 0.8) * 4);
    },
    reset() {
      Object.keys(state).forEach(k => this.sector(k, 0, null, false));
      applyEra(0, true);
    }
  };
  api.daylight(0);
  return api;
}
