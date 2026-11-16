/* Marvel (edición fan) · el centro del tablero: Nueva York.
   Una isla de rascacielos con las ventanas encendidas, Central Park, un puente colgante, el río alrededor
   y la Torre de los Vengadores en medio. Cada sector levanta su edificio, y las cinco eras traen el
   Helitransporte, la invasión por el portal, la nave anillo y los portales de Endgame. */
import { THREE, std, glow, metal, mesh, box, cyl, ball, cone, torus, shadow, glowSprite, canvas, tex, smooth, rng, backOut } from '../../kit3d.js?v=1116a';
import { tower, quinjet, helicarrier } from './piezas.js?v=1116a';

export const SITES = { robotics: [1.7, 2.3], lab: [3.3, 2.7], saas: [-0.4, 2.7], health: [2.4, -1.4], security: [0.8, -1.7], materials: [1.75, 0.95] };
const AGE_AT = [0, 700, 1500, 2600, 3800];

export function buildWorld(ctx) {
  const { scene, root, anim, blinkers, tween } = ctx;
  const pop = g => { if (g.visible) return; g.visible = true; g.scale.setScalar(0.01); tween(650, k => g.scale.setScalar(Math.max(0.01, k)), backOut); };
  const rnd = rng(23);
  const Y0 = 0.28;
  const gy = () => Y0;

  /* ---------- water and island ---------- */
  const water = mesh(new THREE.CircleGeometry(5.5, 96).rotateX(-Math.PI / 2), std('#1B3550', { roughness: 0.15, metalness: 0.4, envMapIntensity: 1.3 }), 0, 0.15, 0);
  water.receiveShadow = true; root.add(water);
  const edge = a => 4.55 + 0.22 * Math.sin(a * 3 + 1) + 0.12 * Math.sin(a * 7 + 2);
  const isl = new THREE.Shape();
  for (let k = 0; k <= 96; k++) { const a = (k / 96) * Math.PI * 2, r = edge(a); k ? isl.lineTo(Math.cos(a) * r, Math.sin(a) * r) : isl.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const islGeo = new THREE.ExtrudeGeometry(isl, { depth: 0.12, bevelEnabled: false }); islGeo.rotateX(-Math.PI / 2);
  const island = mesh(islGeo, std('#3A3E46', { roughness: 0.9 }), 0, 0.16, 0); island.receiveShadow = true; root.add(island);
  const inside = (x, z, m = 0) => Math.hypot(x, z) < edge(Math.atan2(z, x)) - m;
  /* the street grid painted on the island */
  const [sc, sx] = canvas(1024, 1024);
  sx.fillStyle = '#4A4E57'; sx.fillRect(0, 0, 1024, 1024);
  sx.fillStyle = '#2A2D33';
  for (let k = 0; k < 1024; k += 64) { sx.fillRect(k, 0, 12, 1024); sx.fillRect(0, k + 20, 1024, 9); }
  sx.strokeStyle = 'rgba(242,194,48,.35)'; sx.lineWidth = 1.5; sx.setLineDash([6, 8]);
  for (let k = 0; k < 1024; k += 64) { sx.beginPath(); sx.moveTo(k + 6, 0); sx.lineTo(k + 6, 1024); sx.stroke(); }
  const streets = tex(sc);
  const top = mesh(new THREE.ShapeGeometry(isl).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: streets, roughness: 0.85 }), 0, Y0 + 0.002, 0);
  const uv = top.geometry.attributes.uv, pp = top.geometry.attributes.position;
  for (let k = 0; k < uv.count; k++) uv.setXY(k, (pp.getX(k) + 5.5) / 11, (pp.getZ(k) + 5.5) / 11);
  top.rotation.y = 0.3; top.receiveShadow = true; root.add(top);

  /* ---------- Central Park ---------- */
  const PARK = { x: -1.6, z: -1.9, w: 1.0, d: 2.2, r: 0.3 };
  const inPark = (x, z, m = 0) => { const c = Math.cos(-PARK.r), s = Math.sin(-PARK.r), lx = (x - PARK.x) * c - (z - PARK.z) * s, lz = (x - PARK.x) * s + (z - PARK.z) * c; return Math.abs(lx) < PARK.w / 2 + m && Math.abs(lz) < PARK.d / 2 + m; };
  const park = new THREE.Group(); park.position.set(PARK.x, Y0, PARK.z); park.rotation.y = PARK.r;
  park.add(box(PARK.w, 0.02, PARK.d, std('#3E7A3A', { roughness: 1 }), 0, 0.01, 0));
  park.add(mesh(new THREE.CircleGeometry(0.2, 24).rotateX(-Math.PI / 2), std('#2C5C86', { roughness: 0.2, metalness: 0.3 }), 0.1, 0.025, 0.4));
  const treeGeo = new THREE.IcosahedronGeometry(0.07, 0), treeMat = std('#2F6B2C', { flatShading: true, roughness: 0.9 });
  for (let k = 0; k < 46; k++) { const lx = (rnd() - 0.5) * (PARK.w - 0.1), lz = (rnd() - 0.5) * (PARK.d - 0.1); if (Math.hypot(lx - 0.1, lz - 0.4) < 0.24) continue; const tr = mesh(treeGeo, treeMat, lx, 0.08, lz); tr.scale.setScalar(0.7 + rnd() * 0.7); tr.castShadow = true; park.add(tr); }
  root.add(park);

  /* ---------- Avengers tower in the middle ---------- */
  const bx = 0.2, bz = 0.9, by = Y0;
  const hq = new THREE.Group();
  const shaft = tower(0.46, 3.0, 0.46, '#8FA6C4', 1.2); hq.add(shaft);
  hq.add(box(0.48, 0.05, 0.48, glow('#9FEFFF', 1.6), 0, 1.0, 0), box(0.48, 0.05, 0.48, glow('#9FEFFF', 1.6), 0, 2.0, 0));
  const crown = cyl(0.12, 0.32, 0.6, std('#7C8EA8', { metalness: 0.6, roughness: 0.25, envMapIntensity: 1.4 }), 0.05, 2.85, 0, 4); crown.position.y = 3.3; crown.rotation.y = Math.PI / 4; hq.add(crown);
  const deck = cyl(0.38, 0.38, 0.03, std('#2A2E36', { metalness: 0.5 }), 0.36, 2.6, 0, 24); hq.add(deck);
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2, l = ball(0.014, glow('#9FEFFF', 3), 0.32 + Math.cos(a) * 0.33, 2.32, Math.sin(a) * 0.33, 6, 4); hq.add(l); }
  hq.add(cyl(0.01, 0.014, 0.5, std('#2A2E36'), 0.05, 3.85, 0, 6));
  const beacon = ball(0.03, glow('#FF3B30', 4), 0.05, 4.12, 0, 8, 6); beacon.userData.blink = true; blinkers.push(beacon); hq.add(beacon);
  const qj = quinjet(); qj.position.set(0.36, 2.66, 0); qj.scale.setScalar(0.6); hq.add(qj);
  hq.position.set(bx, by, bz); root.add(shadow(hq));

  /* ---------- downtown: a few hundred towers of every height ---------- */
  const keep = [[bx, bz, 0.5], [2.3, -0.5, 0.35], [-2.5, 0.9, 0.35], ...Object.values(SITES).map(s => [s[0], s[1], 0.6])];
  const spots = [];
  for (let gx = -4.6; gx <= 4.6; gx += 0.36) for (let gz = -4.6; gz <= 4.6; gz += 0.36) {
    const c = Math.cos(0.3), s = Math.sin(0.3), x = gx * c - gz * s, z = gx * s + gz * c;
    if (!inside(x, z, 0.22) || inPark(x, z, 0.1) || keep.some(k => Math.hypot(x - k[0], z - k[1]) < k[2])) continue;
    if (rnd() < 0.2) continue;
    const r = Math.hypot(x - bx, z - bz), h = 0.14 + Math.pow(rnd(), 2.2) * 1.4 * smooth(4.8, 0.6, r) + rnd() * 0.18;
    spots.push([x, z, h * (Math.hypot(x - 2.2, z + 0.4) < 1.3 ? 1.5 : 1), rnd(), 0.15 + rnd() * 0.14, 0.15 + rnd() * 0.14]);
  }
  const walls = ['#5B6E8C', '#3E4D66', '#7A5444', '#9A958A', '#2E3440', '#6E7F96', '#8A6A55'];
  const wTex = (() => { const [c, x] = canvas(64, 128); x.fillStyle = '#000'; x.fillRect(0, 0, 64, 128); for (let r = 0; r < 16; r++) for (let k = 0; k < 4; k++) if (Math.random() < 0.55) { x.fillStyle = Math.random() < 0.85 ? '#FFD38A' : '#BFE4FF'; x.fillRect(4 + k * 15, 4 + r * 8, 9, 4); } const t = tex(c); return t; })();
  const cityMat = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.3, emissive: '#FFFFFF', emissiveMap: wTex, emissiveIntensity: 0.35 });
  const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), cityMat, spots.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.3), sv = new THREE.Vector3(), pv = new THREE.Vector3(), cc = new THREE.Color();
  spots.forEach((s, k) => { m4.compose(pv.set(s[0], Y0, s[1]), q, sv.set(s[4], s[2], s[5])); city.setMatrixAt(k, m4); city.setColorAt(k, cc.set(walls[Math.floor(s[3] * walls.length)])); });
  city.castShadow = true; city.receiveShadow = true; root.add(city);
  /* two landmark skyscrapers: stepped stone towers with a spire */
  [[2.3, -0.5, 2.3], [-2.5, 0.9, 1.7]].forEach(([x, z, h]) => {
    const lm = new THREE.Group();
    [[0.38, h * 0.55], [0.3, h * 0.25], [0.2, h * 0.12], [0.12, h * 0.08]].reduce((y, q) => { const t = tower(q[0], q[1], q[0], '#B7AE9C', 1); t.position.y = y; lm.add(t); return y + q[1]; }, 0);
    lm.add(cyl(0.012, 0.03, h * 0.3, metal('#D5D9DE', 0.25), 0, h * 1.15, 0, 8));
    const tip = ball(0.02, glow('#FF3B30', 4), 0, h * 1.31, 0, 6, 4); tip.userData.blink = true; blinkers.push(tip); lm.add(tip);
    lm.position.set(x, Y0, z); root.add(shadow(lm));
  });
  /* rooftop details on the tallest */
  spots.filter(s => s[2] > 0.9).slice(0, 14).forEach((s, k) => { const r = ball(0.014, glow('#FF3B30', 4), s[0], Y0 + s[2] + 0.04, s[1], 6, 4); r.userData.blink = true; blinkers.push(r); root.add(r); root.add(cyl(0.004, 0.006, 0.08, std('#222'), s[0], Y0 + s[2] + 0.02, s[1], 4)); });

  /* ---------- a suspension bridge to the rim ---------- */
  const bridge = new THREE.Group(), bmat = std('#9A8F7E', { roughness: 0.8 }), cable = new THREE.LineBasicMaterial({ color: '#C9C2B4' });
  bridge.add(box(1.4, 0.04, 0.16, std('#5A5550'), 0, 0.42, 0));
  [-0.4, 0.4].forEach(x => { bridge.add(box(0.07, 0.62, 0.2, bmat, x, 0.31, 0)); bridge.add(box(0.075, 0.08, 0.22, bmat, x, 0.6, 0)); });
  [-0.09, 0.09].forEach(z => { const pts = []; for (let k = 0; k <= 30; k++) { const x = -0.7 + (k / 30) * 1.4, y = Math.abs(x) < 0.4 ? 0.62 - 0.18 * (1 - Math.pow(x / 0.4, 2)) : 0.62 - (Math.abs(x) - 0.4) * 0.6; pts.push(new THREE.Vector3(x, y, z)); } bridge.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), cable)); });
  bridge.position.set(4.75, 0, -0.9); bridge.rotation.y = -Math.atan2(-0.9, 4.75); root.add(shadow(bridge));

  /* ---------- traffic: headlights and tail lights along the avenues ---------- */
  const carN = 60, carPos = new Float32Array(carN * 3), carGeo = new THREE.BufferGeometry(); carGeo.setAttribute('position', new THREE.BufferAttribute(carPos, 3));
  const cars = new THREE.Points(carGeo, new THREE.PointsMaterial({ color: '#FFE2A0', size: 0.07, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })); cars.frustumCulled = false; root.add(cars);
  const lanes = [...Array(carN)].map((_, k) => ({ along: rnd() < 0.5, off: (Math.floor(rnd() * 26) - 13) * 0.36 + 0.03, ph: rnd() * 10, v: (0.25 + rnd() * 0.3) * (rnd() < 0.5 ? 1 : -1) }));
  anim.push(t => { const c = Math.cos(0.3), s = Math.sin(0.3); lanes.forEach((l, k) => { let u = ((l.ph + t * l.v) % 9.2 + 9.2) % 9.2 - 4.6, gx = l.along ? u : l.off, gz = l.along ? l.off : u; const x = gx * c - gz * s, z = gx * s + gz * c; const ok = inside(x, z, 0.15) && !inPark(x, z); carPos[k * 3] = x; carPos[k * 3 + 1] = ok ? Y0 + 0.03 : -5; carPos[k * 3 + 2] = z; }); carGeo.attributes.position.needsUpdate = true; });

  /* ---------- sky that turns with the camera ---------- */
  const sky = new THREE.Group(); scene.add(sky);
  anim.push(() => { const cp = ctx.camera.position; sky.rotation.y = Math.atan2(cp.x, cp.z); });
  const moon = glowSprite('#F4F1E6', 2.2), moonCore = ball(0.42, new THREE.MeshBasicMaterial({ color: '#F4F1E6', fog: false }), 0, 0, 0, 20, 14);
  sky.add(moon, moonCore);

  /* ---------- sector sites: crane → mid-rise → tower with the leader's crown ---------- */
  const state = {};
  Object.keys(SITES).forEach(key => {
    const [x, z] = SITES[key], g = new THREE.Group(); g.position.set(x, Y0, z);
    const lot = new THREE.Group(), fence = std('#E3B23C');
    lot.add(box(0.6, 0.012, 0.5, std('#5C5248', { roughness: 1 }), 0, 0.006, 0));
    [[-0.3, 0], [0.3, 0]].forEach(q => lot.add(box(0.012, 0.08, 0.5, fence, q[0], 0.04, q[1])));
    [[0, -0.25], [0, 0.25]].forEach(q => lot.add(box(0.6, 0.08, 0.012, fence, q[0], 0.04, q[1])));
    const lv = [null, new THREE.Group(), new THREE.Group(), new THREE.Group()];
    lv[1].add(box(0.5, 0.06, 0.4, std('#8E8A84'), 0, 0.03, 0));
    const crane = new THREE.Group(); crane.add(box(0.03, 0.9, 0.03, std('#E3B23C'), 0, 0.45, 0), box(0.6, 0.025, 0.03, std('#E3B23C'), 0.15, 0.9, 0), box(0.07, 0.07, 0.07, std('#555'), -0.12, 0.88, 0));
    crane.position.set(0.22, 0, -0.15); lv[1].add(crane);
    anim.push(t => { if (lv[1].visible) crane.rotation.y = Math.sin(t * 0.3 + x) * 1.2; });
    const mid = tower(0.32, 0.6, 0.3, '#56677E', 0.9); mid.position.set(-0.08, 0, 0.02); lv[2].add(mid);
    const top3 = tower(0.26, 0.9, 0.26, '#6E83A2', 1.1); top3.position.set(-0.08, 0.6, 0.02); lv[3].add(top3);
    const capMat = std('#F2C230', { emissive: '#F2C230', emissiveIntensity: 0.6, metalness: 0.5, roughness: 0.3 });
    const cap = cyl(0.06, 0.16, 0.2, capMat, -0.08, 1.6, 0.02, 4); cap.rotation.y = Math.PI / 4; lv[3].add(cap);
    for (let i = 1; i <= 3; i++) { lv[i].visible = false; shadow(lv[i]); g.add(lv[i]); }
    const beam = cyl(0.03, 0.09, 2.4, new THREE.MeshBasicMaterial({ color: '#F2C230', transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }), -0.08, 2.9, 0.02, 10);
    beam.visible = false; g.add(beam);
    const halo = mesh(new THREE.TorusGeometry(0.62, 0.02, 6, 48), new THREE.MeshBasicMaterial({ color: '#F2C230', transparent: true, opacity: 0.8 }), 0, 0.04, 0);
    halo.rotation.x = Math.PI / 2; halo.visible = false; g.add(halo);
    anim.push(t => { if (halo.visible) { halo.scale.setScalar(1 + 0.05 * Math.sin(t * 2.5)); } if (beam.visible) beam.material.opacity = 0.12 + 0.08 * Math.sin(t * 3 + x); });
    g.add(lot); root.add(g);
    state[key] = { lot, lv, capMat, beam, halo, level: 0, color: null, full: false };
  });

  /* ---------- eras ---------- */
  /* 1 · the Helicarrier hangs over the river */
  const heli = helicarrier(); heli.scale.setScalar(4.2); heli.visible = false; sky.add(heli);
  anim.push(t => { if (!heli.visible) return; heli.position.set(-3.2 + Math.sin(t * 0.06) * 0.6, 4.2 + Math.sin(t * 0.4) * 0.08, -6.5); heli.rotation.set(0.05, 0.3, 0.02); heli.userData.rotors.forEach(r => { r.rotation.y = t * 10; }); });
  /* 2 · the invasion: a blue portal over the tower and alien sleds circling */
  const portal = new THREE.Group();
  const [pc, px] = canvas(256, 256);
  const pg = px.createRadialGradient(128, 128, 4, 128, 128, 128); pg.addColorStop(0, '#000814'); pg.addColorStop(0.55, '#0A2A6E'); pg.addColorStop(0.85, '#5FB8FF'); pg.addColorStop(1, 'rgba(95,184,255,0)'); px.fillStyle = pg; px.fillRect(0, 0, 256, 256);
  px.strokeStyle = 'rgba(160,220,255,.5)'; for (let k = 0; k < 40; k++) { px.beginPath(); px.arc(128, 128, 30 + Math.random() * 90, Math.random() * 7, Math.random() * 7 + 1); px.stroke(); }
  const vortex = mesh(new THREE.CircleGeometry(1.4, 48), new THREE.MeshBasicMaterial({ map: tex(pc), transparent: true, side: THREE.DoubleSide, depthWrite: false })); vortex.rotation.x = Math.PI / 2;
  const pbeam = cyl(0.03, 0.05, 2.0, new THREE.MeshBasicMaterial({ color: '#9FDCFF', transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }), 0, -1.0, 0, 8);
  portal.add(vortex, pbeam, glowSprite('#5FB8FF', 3));
  portal.position.set(bx + 0.05, by + 6.2, bz); portal.visible = false; root.add(portal);
  anim.push(t => { if (portal.visible) vortex.rotation.z = t * 0.8; });
  const sleds = [...Array(6)].map((_, k) => { const s = new THREE.Group(), grey = std('#6A6F74', { metalness: 0.6, roughness: 0.4 }); s.add(box(0.2, 0.04, 0.08, grey, 0, 0, 0), cone(0.04, 0.12, grey, 0.14, 0, 0, 6), box(0.04, 0.08, 0.04, std('#3A3F44'), -0.05, 0.05, 0), ball(0.025, glow('#5FB8FF', 3), -0.11, 0, 0, 6, 4)); s.children[1].rotation.z = -Math.PI / 2; s.visible = false; root.add(s); return s; });
  anim.push(t => sleds.forEach((s, k) => { if (!s.visible) return; const a = t * (0.5 + (k % 3) * 0.08) + k * 1.05, r = 1.6 + (k % 3) * 0.7; s.position.set(bx + Math.cos(a) * r, 2.4 + (k % 2) * 0.6 + Math.sin(t + k) * 0.2, bz + Math.sin(a) * r); s.rotation.y = -a - Math.PI / 2; }));
  /* 3 · the ring ship over the city */
  const ring = new THREE.Group(), rmat = std('#3A3D44', { metalness: 0.6, roughness: 0.4 });
  ring.add(torus(2.2, 0.32, rmat, 0, 0, 0, 64)); ring.children[0].rotation.x = Math.PI / 2; ring.children[0].scale.z = 0.5;
  for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2, l = ball(0.05, glow('#FF8A3D', 3), Math.cos(a) * 2.2, -0.12, Math.sin(a) * 2.2, 6, 4); ring.add(l); }
  const rbeam = cyl(0.6, 1.6, 3.4, new THREE.MeshBasicMaterial({ color: '#FFB067', transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), 0, -1.8, 0, 24, 1); ring.add(rbeam);
  ring.position.set(bx, 5.4, bz - 0.4); ring.scale.setScalar(1.15); ring.visible = false; root.add(ring);
  anim.push(t => { if (ring.visible) { ring.rotation.y = t * 0.12; ring.position.y = 5.4 + Math.sin(t * 0.4) * 0.1; } });
  /* 4 · Endgame: sparkling orange portals open all around the city */
  const sparkTex = (() => { const [c, x] = canvas(128, 128); x.strokeStyle = '#FFB347'; x.lineWidth = 6; x.shadowColor = '#FF8A1F'; x.shadowBlur = 12; x.beginPath(); x.arc(64, 64, 50, 0, 7); x.stroke(); x.lineWidth = 2; for (let k = 0; k < 60; k++) { const a = Math.random() * 7, r = 46 + Math.random() * 10; x.beginPath(); x.moveTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); x.lineTo(64 + Math.cos(a + 0.25) * (r + 6), 64 + Math.sin(a + 0.25) * (r + 6)); x.stroke(); } return tex(c); })();
  const rings = [...Array(7)].map((_, k) => { const a = (k / 7) * Math.PI * 2 + 0.3, r = 3.6, m = mesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshBasicMaterial({ map: sparkTex, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), Math.cos(a) * r, Y0 + 0.65, Math.sin(a) * r); m.rotation.y = -a + Math.PI / 2; m.visible = false; root.add(m); return m; });
  anim.push(t => rings.forEach((m, k) => { if (m.visible) m.material.rotation = t * 2 + k; }));
  sparkTex.center.set(0.5, 0.5);

  /* ---------- short scenes ---------- */
  const pulse = mesh(new THREE.TorusGeometry(1, 0.03, 6, 72), new THREE.MeshBasicMaterial({ color: '#FF3B30', transparent: true, opacity: 0, depthWrite: false }), bx, by + 0.3, bz); pulse.rotation.x = Math.PI / 2; root.add(pulse);
  const flare = glowSprite('#9FEFFF', 1.4); flare.material.opacity = 0; root.add(flare);
  const gems = [];
  anim.push(t => gems.forEach((n, k) => { const a = t * 0.7 + k * (Math.PI * 2 / 6); n.position.set(bx + Math.cos(a) * 0.7, by + 3.2 + Math.sin(t * 2 + k) * 0.1, bz + Math.sin(a) * 0.7); n.rotation.y = t * 2; }));
  const GEMC = ['#8A3DFF', '#2E6BFF', '#FF2E2E', '#FF8A1F', '#2EE06A', '#F2D02E'];
  const storm = new THREE.Group(), stormMat = new THREE.MeshStandardMaterial({ color: '#2A2F3A', flatShading: true, roughness: 1, transparent: true, opacity: 0 });
  [[0, 0, 0, 1.2], [1.2, -0.1, 0.3, 0.9], [-1.1, -0.12, -0.2, 0.9], [0.3, 0.3, -0.6, 0.8]].forEach(q => { const m = mesh(new THREE.IcosahedronGeometry(q[3], 1), stormMat, q[0], q[1], q[2]); m.scale.y = 0.5; storm.add(m); });
  const bolts = [[-0.5, 0.2], [0.6, -0.3], [0.1, 0.5]].map(p => { const bolt = new THREE.Group(), bm = new THREE.MeshBasicMaterial({ color: '#CFE8FF', transparent: true, opacity: 0 }); [[0, -0.5, 0.25], [0.14, -1.0, -0.3], [-0.04, -1.5, 0.28], [0.1, -2.0, -0.2], [0, -2.5, 0.3]].forEach(s => { const b = box(0.05, 0.56, 0.05, bm, p[0] + s[0], s[1], p[1]); b.rotation.z = s[2]; bolt.add(b); }); bolt.userData.mat = bm; storm.add(bolt); return bolt; });
  storm.position.set(0, 4.6, 0); storm.visible = false; root.add(storm);
  /* Iron Man flies a loop around the tower, leaving a trail */
  const flyer = new THREE.Group(); flyer.add(ball(0.06, std('#B0141B', { metalness: 0.6, roughness: 0.3 })), glowSprite('#FFD9A0', 0.5)); flyer.visible = false; root.add(flyer);
  const trailN = 40, trailP = new Float32Array(trailN * 3), trailGeo = new THREE.BufferGeometry(); trailGeo.setAttribute('position', new THREE.BufferAttribute(trailP, 3));
  const trail = new THREE.Points(trailGeo, new THREE.PointsMaterial({ color: '#FFC27A', size: 0.06, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })); trail.frustumCulled = false; trail.visible = false; root.add(trail);
  const jet = quinjet(); jet.scale.setScalar(1.8); jet.visible = false; root.add(shadow(jet));

  const scenes = {
    signal(color) {
      pulse.material.color.set('#FF3B30');
      tween(1600, k => { pulse.scale.setScalar(0.3 + k * 5.2); pulse.material.opacity = 0.9 * (1 - k); });
      flare.material.color.set(color || '#9FEFFF');
      tween(1500, k => { flare.position.set(bx, by + 3.6 + k * 3, bz); flare.material.opacity = Math.sin(k * Math.PI); flare.scale.setScalar(1.4 + k * 1.4); });
    },
    learning() {
      if (gems.length < 6) { const c = GEMC[gems.length], g = mesh(new THREE.OctahedronGeometry(0.09, 0), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 2.4, flatShading: true })); g.scale.y = 1.4; root.add(g); gems.push(g); g.scale.setScalar(0.01); tween(700, k => g.scale.set(Math.max(0.01, k), Math.max(0.01, k) * 1.4, Math.max(0.01, k)), backOut); }
      scenes.signal('#B266FF');
    },
    storm() {
      storm.visible = true;
      tween(4200, k => {
        stormMat.opacity = Math.min(1, k * 5, (1 - k) * 4) * 0.92;
        storm.position.x = -0.6 + k * 1.2;
        bolts.forEach((b, i) => { const t0 = 0.2 + i * 0.2, d = k - t0; b.userData.mat.opacity = d > 0 && d < 0.09 ? (Math.floor(d * 90) % 2 ? 0.25 : 1) : 0; });
      }, k => k).then(() => { storm.visible = false; });
    },
    airship() {
      jet.visible = true;
      tween(7000, k => { jet.position.set(-8 + k * 16, 3.2 + Math.sin(k * 7) * 0.12, -2.2 + k * 4.2); jet.rotation.y = -0.27; }, k => k).then(() => { jet.visible = false; });
    },
    birds() {
      flyer.visible = trail.visible = true;
      const hist = [];
      tween(4200, k => {
        const a = k * Math.PI * 4, r = 1.4 + k * 1.2, p = new THREE.Vector3(bx + Math.cos(a) * r, by + 0.6 + k * 4, bz + Math.sin(a) * r);
        flyer.position.copy(p); hist.unshift(p.clone()); if (hist.length > trailN) hist.pop();
        for (let i = 0; i < trailN; i++) { const h = hist[Math.min(i, hist.length - 1)]; trailP[i * 3] = h.x; trailP[i * 3 + 1] = h.y; trailP[i * 3 + 2] = h.z; }
        trailGeo.attributes.position.needsUpdate = true;
      }, k => k).then(() => { flyer.visible = trail.visible = false; });
    }
  };

  let era = -1;
  function applyEra(n, quiet) {
    era = n;
    const one = (o, on) => { if (on) { if (quiet) o.visible = true; else pop(o); } else o.visible = false; };
    one(heli, n >= 1);
    one(portal, n === 2); sleds.forEach(s => one(s, n === 2 || n === 3));
    one(ring, n === 3);
    rings.forEach(r => one(r, n >= 4));
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
      if (color !== s.color) { if (color) { s.capMat.color.set(color); s.capMat.emissive.set(color); s.halo.material.color.set(color); s.beam.material.color.set(color); } s.color = color; }
      s.beam.visible = !!color && s.level >= 3;
      if (full !== s.full) { s.halo.visible = !!full; s.full = full; }
    },
    leader(pipeline, color) {
      let e = 0;
      AGE_AT.forEach((v, i) => { if (pipeline >= v) e = i; });
      if (e > era) { applyEra(e); scenes.signal(color); }
      return era;
    },
    event(kind, color) { if (scenes[kind]) scenes[kind](color); },
    /* evening falls on the city: windows light up, the moon rises behind */
    daylight(t) {
      cityMat.emissiveIntensity = 0.3 + t * 1.3;
      const h = 0.6 + t * 3.2;
      moon.position.set(5.5, h, -14); moonCore.position.copy(moon.position);
      moon.material.opacity = moonCore.material.opacity = Math.min(1, t * 2);
      moonCore.material.transparent = true;
    },
    reset() {
      Object.keys(state).forEach(k => this.sector(k, 0, null, false));
      applyEra(0, true);
      gems.splice(0).forEach(n => root.remove(n));
    }
  };
  api.daylight(0);
  return api;
}
