/* Marvel (edición fan) · figuras, edificios, vehículos y objetos de las casillas.
   Todo modelado a mano con formas sencillas: ningún modelo, logo ni imagen oficial. */
import { THREE, std, glow, metal, mesh, box, cyl, ball, cone, torus, lathe, slab, canvas, tex, rr, glowSprite, tokenStand } from '../../kit3d.js?v=1116a';

const DARK = '#1A1D24';
const gloss = (c, o = {}) => std(c, Object.assign({ roughness: 0.25, metalness: 0.65, envMapIntensity: 1.5 }, o));
const cloth = c => std(c, { roughness: 0.85 });

function limb(m, x, y, z, rz, rx = 0, len = 0.24, r = 0.034, r2) {
  const a = new THREE.Group(); a.position.set(x, y, z);
  a.add(cyl(r, r2 ?? r * 0.9, len, m, 0, -len / 2, 0, 12));
  a.rotation.set(rx, 0, rz);
  return a;
}

/* ---------- Iron Man: red and gold armour, arc reactor, a raised repulsor ---------- */
function ironman() {
  const b = new THREE.Group(), red = gloss('#B0141B'), gold = gloss('#D9A23A', { metalness: 0.8 }), dark = gloss('#3A0A0D');
  [-0.055, 0.055].forEach(x => {
    b.add(cyl(0.05, 0.055, 0.2, red, x, 0.1, 0, 14), cyl(0.046, 0.05, 0.18, red, x, 0.29, 0, 14));
    b.add(box(0.06, 0.1, 0.02, gold, x, 0.3, 0.045), box(0.05, 0.05, 0.02, gold, x, 0.16, 0.05));
    const th = ball(0.03, glow('#BFF4FF', 3), x, 0.0, 0.0, 8, 6); th.userData.blink = true; b.add(th);
  });
  b.add(lathe([[0.001, 0.37], [0.12, 0.37], [0.125, 0.46], [0.15, 0.58], [0.155, 0.66], [0.11, 0.73], [0.05, 0.75], [0.001, 0.75]], red, 28));
  b.add(cyl(0.122, 0.122, 0.04, gold, 0, 0.4, 0, 28));
  const abs = box(0.13, 0.12, 0.02, gold, 0, 0.47, 0.115); abs.rotation.x = -0.1; b.add(abs);
  [0.44, 0.48, 0.52].forEach(y => b.add(box(0.13, 0.004, 0.022, dark, 0, y, 0.118)));
  const reactor = cyl(0.04, 0.04, 0.02, glow('#BFF4FF', 4), 0, 0.63, 0.145, 20); reactor.rotation.x = Math.PI / 2; b.add(reactor);
  const rRing = torus(0.045, 0.008, metal('#C9CDD3'), 0, 0.63, 0.152, 24); b.add(rRing);
  const rGlow = glowSprite('#9FEFFF', 0.3); rGlow.position.set(0, 0.63, 0.17); b.add(rGlow);
  [-1, 1].forEach(s => { const sh = ball(0.065, red, s * 0.15, 0.69, 0, 16, 12); sh.scale.set(1.15, 0.8, 1); b.add(sh); });
  /* left arm down, right arm up with the palm open */
  const la = limb(red, -0.16, 0.68, 0, 0.18, 0.05, 0.26, 0.038); la.add(cyl(0.042, 0.04, 0.1, gold, 0, -0.2, 0, 12)); b.add(la);
  const ra = limb(red, 0.16, 0.68, 0, -1.1, -0.5, 0.26, 0.038); ra.add(cyl(0.042, 0.04, 0.1, gold, 0, -0.2, 0, 12));
  const palm = ball(0.034, red, 0, -0.27, 0, 10, 8); ra.add(palm);
  const rep = ball(0.026, glow('#CFF8FF', 4), 0, -0.3, 0, 10, 8); ra.add(rep);
  const repGlow = glowSprite('#9FEFFF', 0.35); repGlow.position.y = -0.31; ra.add(repGlow);
  b.add(ra);
  /* helmet: red shell, gold faceplate, slit eyes */
  const head = new THREE.Group(); head.position.y = 0.84;
  head.add(cyl(0.045, 0.05, 0.06, dark, 0, -0.06, 0, 12));
  const shell = ball(0.085, red, 0, 0.01, -0.005, 22, 16); shell.scale.set(0.95, 1.12, 1.05); head.add(shell);
  const face = mesh(new THREE.SphereGeometry(0.087, 22, 16, Math.PI / 2 - 0.85, 1.7, 0.45, 1.85), gold, 0, 0.005, 0.006); face.scale.set(0.95, 1.12, 1.05); head.add(face);
  [-1, 1].forEach(s => { const e = box(0.032, 0.009, 0.01, glow('#E6FCFF', 3.4), s * 0.03, 0.03, 0.088); e.rotation.z = s * -0.12; head.add(e); });
  head.add(box(0.03, 0.003, 0.01, dark, 0, -0.04, 0.09));
  b.add(head);
  b.userData.hand = { rep, glow: repGlow, arm: ra }; b.userData.reactor = rGlow;
  return b;
}

/* ---------- Captain America: blue suit, striped belly, white star, round shield ---------- */
function shieldTexture() {
  const [c, x] = canvas(256, 256);
  [['#B5121B', 128], ['#E9E9EC', 104], ['#B5121B', 80], ['#1E3D9E', 56]].forEach(q => { x.fillStyle = q[0]; x.beginPath(); x.arc(128, 128, q[1], 0, 7); x.fill(); });
  x.fillStyle = '#F2F2F4'; x.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 20 : 50; x.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); }
  x.closePath(); x.fill();
  return tex(c);
}
function captain() {
  const b = new THREE.Group(), blue = std('#1F3E8C', { roughness: 0.55 }), red = std('#A3121A', { roughness: 0.5 }), white = std('#EDEDF0', { roughness: 0.6 }), brown = std('#5A3A22', { roughness: 0.6 });
  [-0.055, 0.055].forEach(x => b.add(cyl(0.05, 0.054, 0.15, red, x, 0.075, 0.005, 12), cyl(0.046, 0.05, 0.24, blue, x, 0.27, 0, 12)));
  b.add(lathe([[0.001, 0.38], [0.12, 0.38], [0.125, 0.48], [0.001, 0.48]], white, 26));
  [0.405, 0.445].forEach(y => b.add(cyl(0.126, 0.126, 0.018, red, 0, y, 0, 26)));
  b.add(cyl(0.128, 0.128, 0.03, brown, 0, 0.39, 0, 26), box(0.04, 0.03, 0.012, metal('#D8D2C0'), 0, 0.39, 0.128));
  b.add(lathe([[0.001, 0.47], [0.125, 0.47], [0.145, 0.58], [0.155, 0.66], [0.11, 0.73], [0.05, 0.75], [0.001, 0.75]], blue, 26));
  const star = slab([...Array(10)].map((_, i) => { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.022 : 0.052; return [Math.cos(a) * r, -Math.sin(a) * r]; }), 0.008, white, 0);
  star.rotation.x = Math.PI / 2; star.position.set(0, 0.62, 0.148); b.add(star);
  [-1, 1].forEach(s => { const sh = ball(0.06, blue, s * 0.14, 0.69, 0, 14, 10); sh.scale.set(1.15, 0.8, 1); b.add(sh); });
  const la = limb(blue, -0.15, 0.68, 0.02, 0.5, -0.9, 0.24, 0.036); la.add(cyl(0.042, 0.04, 0.08, red, 0, -0.22, 0, 12)); b.add(la);
  const ra = limb(blue, 0.15, 0.68, 0, -0.2, 0.05, 0.24, 0.036); ra.add(cyl(0.042, 0.04, 0.08, red, 0, -0.22, 0, 12)); b.add(ra);
  /* the shield, strapped to the left forearm, facing out */
  const shield = new THREE.Group();
  const face = mesh(new THREE.SphereGeometry(0.2, 32, 10, 0, Math.PI * 2, 0, 0.42), new THREE.MeshStandardMaterial({ map: shieldTexture(), roughness: 0.3, metalness: 0.55, envMapIntensity: 1.3 }));
  face.rotation.x = Math.PI / 2; face.position.z = -0.17; shield.add(face);
  shield.add(torus(0.082, 0.006, metal('#C9CDD3'), 0, 0, -0.01, 30));
  shield.position.set(-0.23, 0.5, 0.17); shield.rotation.set(-0.15, -0.3, 0); b.add(shield);
  const head = new THREE.Group(); head.position.y = 0.83;
  head.add(cyl(0.04, 0.045, 0.05, std('#E8C3A0'), 0, -0.05, 0, 12));
  const helm = ball(0.082, blue, 0, 0.01, -0.004, 22, 16); helm.scale.set(0.95, 1.08, 1.02); head.add(helm);
  const jaw = mesh(new THREE.SphereGeometry(0.075, 18, 12, Math.PI / 2 - 0.9, 1.8, 1.45, 1.2), std('#E8C3A0', { roughness: 0.6 }), 0, 0.0, 0.015); head.add(jaw);
  [-1, 1].forEach(s => { const w = slab([[0, 0], [0.05, -0.02], [0.03, 0.01], [0.06, 0.0], [0.02, 0.03]], 0.004, white, 0); w.rotation.set(Math.PI / 2, 0, s > 0 ? 0 : Math.PI); w.position.set(s * 0.078, 0.03, 0.02); w.rotation.y = s * -0.4; head.add(w); head.add(ball(0.009, std('#2C3E6E'), s * 0.028, 0.025, 0.077, 8, 6)); });
  const aMark = slab([[-0.022, -0.03], [0, 0.03], [0.022, -0.03], [0.012, -0.03], [0, 0.0], [-0.012, -0.03]], 0.004, white, 0);
  aMark.rotation.x = Math.PI / 2 - 0.4; aMark.position.set(0, 0.075, 0.06); head.add(aMark);
  b.add(head);
  b.userData.shield = shield;
  return b;
}

/* ---------- Hulk: huge green body, purple torn trousers, fists ---------- */
function hulk() {
  const b = new THREE.Group(), green = std('#4E8A2E', { roughness: 0.55 }), green2 = std('#3F7424', { roughness: 0.6 }), purple = std('#5B2A7A', { roughness: 0.85 }), hair = std('#151515', { roughness: 0.7 });
  [-0.075, 0.075].forEach(x => b.add(cyl(0.06, 0.065, 0.1, green, x, 0.05, 0.01, 12)));
  b.add(lathe([[0.001, 0.08], [0.17, 0.08], [0.16, 0.15], [0.15, 0.3], [0.16, 0.38], [0.001, 0.38]], purple, 24));
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, t = cone(0.025, 0.05, purple, Math.sin(a) * 0.16, 0.07, Math.cos(a) * 0.16, 4); t.rotation.x = Math.PI; b.add(t); }
  b.add(lathe([[0.001, 0.37], [0.16, 0.37], [0.18, 0.46], [0.23, 0.6], [0.24, 0.68], [0.17, 0.74], [0.07, 0.76], [0.001, 0.76]], green, 26));
  [-1, 1].forEach(s => { const pec = ball(0.085, green2, s * 0.075, 0.6, 0.13, 14, 10); pec.scale.set(1.1, 0.75, 0.5); b.add(pec); });
  for (let r = 0; r < 3; r++) [-1, 1].forEach(s => { const ab = ball(0.035, green2, s * 0.035, 0.44 + r * 0.045, 0.14, 8, 6); ab.scale.set(1, 0.8, 0.5); b.add(ab); });
  [-1, 1].forEach(s => {
    const sh = ball(0.1, green, s * 0.22, 0.68, 0, 16, 12); sh.scale.set(1, 0.85, 0.95); b.add(sh);
    const arm = limb(green, s * 0.25, 0.66, 0.02, s * 0.35, -0.2, 0.3, 0.07, 0.06);
    arm.add(ball(0.075, green2, 0, -0.32, 0.01, 12, 10)); b.add(arm);
    b.userData['arm' + s] = arm;
  });
  b.add(cyl(0.07, 0.08, 0.05, green, 0, 0.77, 0.01, 12));
  const head = new THREE.Group(); head.position.set(0, 0.84, 0.03);
  const skull = ball(0.075, green, 0, 0, 0, 20, 14); skull.scale.set(1, 1.05, 1); head.add(skull);
  const cap = mesh(new THREE.SphereGeometry(0.079, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), hair, 0, 0.005, -0.006); head.add(cap);
  const brow = box(0.1, 0.02, 0.03, green2, 0, 0.025, 0.06); brow.rotation.x = 0.3; head.add(brow);
  [-1, 1].forEach(s => head.add(ball(0.01, std('#2F4E1A', { roughness: 0.3 }), s * 0.028, 0.008, 0.07, 8, 6)));
  head.add(box(0.05, 0.012, 0.01, std('#2A1A12'), 0, -0.035, 0.07), box(0.044, 0.006, 0.01, std('#F2F2F2'), 0, -0.035, 0.072));
  b.add(head);
  b.scale.setScalar(1.08);
  return b;
}

/* ---------- Thor: silver armour with the round discs, red cape, blond hair, the hammer ---------- */
function thor() {
  const b = new THREE.Group(), black = std('#20222A', { roughness: 0.5, metalness: 0.3 }), silver = metal('#B9BEC6', 0.3), red = std('#9C1218', { roughness: 0.7, side: THREE.DoubleSide }), skin = std('#E8C3A0', { roughness: 0.6 }), blond = std('#D9B25A', { roughness: 0.7 });
  [-0.055, 0.055].forEach(x => b.add(cyl(0.05, 0.055, 0.14, std('#3A3D44', { metalness: 0.5 }), x, 0.07, 0.005, 12), cyl(0.046, 0.05, 0.24, black, x, 0.26, 0, 12)));
  b.add(lathe([[0.001, 0.37], [0.125, 0.37], [0.13, 0.48], [0.15, 0.6], [0.155, 0.67], [0.11, 0.73], [0.05, 0.75], [0.001, 0.75]], black, 26));
  b.add(cyl(0.128, 0.128, 0.035, silver, 0, 0.4, 0, 26));
  [[-0.05, 0.62], [0.05, 0.62], [-0.05, 0.54], [0.05, 0.54], [-0.05, 0.46], [0.05, 0.46]].forEach(q => { const d = cyl(0.026, 0.026, 0.012, silver, q[0], q[1], 0.142, 18); d.rotation.x = Math.PI / 2; b.add(d); });
  [-1, 1].forEach(s => { const sh = ball(0.065, silver, s * 0.145, 0.69, 0, 14, 10); sh.scale.set(1.2, 0.75, 1); b.add(sh); });
  const cape = new THREE.Mesh(new THREE.LatheGeometry([[0.26, 0.08], [0.23, 0.3], [0.19, 0.52], [0.16, 0.7]].map(p => new THREE.Vector2(p[0], p[1])), 26, Math.PI * 0.5, Math.PI), red);
  b.add(cape);
  b.add(limb(skin, -0.16, 0.68, 0, 0.25, 0.05, 0.25, 0.036));
  const ra = limb(skin, 0.16, 0.68, 0, -0.35, -0.45, 0.25, 0.036); ra.add(cyl(0.04, 0.04, 0.08, silver, 0, -0.2, 0, 12));
  /* Mjolnir: a square head on a short wrapped handle */
  const hammer = new THREE.Group();
  hammer.add(cyl(0.014, 0.014, 0.18, std('#4A2F1F', { roughness: 0.8 }), 0, -0.04, 0, 8), box(0.14, 0.08, 0.08, std('#7A8088', { metalness: 0.6, roughness: 0.55, envMapIntensity: 0.6 }), 0, -0.15, 0));
  [-0.07, 0.07].forEach(x => hammer.add(box(0.008, 0.084, 0.084, std('#6E747C', { metalness: 0.7 }), x, -0.15, 0)));
  const spark = glowSprite('#BFE6FF', 0.5); spark.position.y = -0.15; spark.material.opacity = 0; hammer.add(spark);
  hammer.position.y = -0.24; ra.add(hammer); b.add(ra);
  const head = new THREE.Group(); head.position.y = 0.83;
  head.add(cyl(0.04, 0.045, 0.05, skin, 0, -0.05, 0, 12));
  const face = ball(0.074, skin, 0, 0.0, 0.005, 20, 16); face.scale.set(0.95, 1.08, 1); head.add(face);
  const hairCap = mesh(new THREE.SphereGeometry(0.08, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), blond, 0, 0.01, -0.006); head.add(hairCap);
  const back = lathe([[0.07, 0.03], [0.085, -0.04], [0.09, -0.14], [0.07, -0.16]], new THREE.MeshStandardMaterial({ color: '#D9B25A', roughness: 0.7, side: THREE.DoubleSide }), 20);
  back.geometry = new THREE.LatheGeometry([[0.075, 0.03], [0.088, -0.04], [0.09, -0.15], [0.07, -0.17]].map(p => new THREE.Vector2(p[0], p[1])), 20, Math.PI * 0.6, Math.PI * 0.8); head.add(back);
  const beard = mesh(new THREE.SphereGeometry(0.07, 16, 10, Math.PI / 2 - 0.9, 1.8, 1.7, 1.1), blond, 0, -0.005, 0.012); head.add(beard);
  [-1, 1].forEach(s => head.add(ball(0.009, std('#2B5FA8', { roughness: 0.3 }), s * 0.026, 0.015, 0.07, 8, 6)));
  b.add(head);
  b.userData.spark = spark; b.userData.hammerArm = ra;
  return b;
}

export function makeToken(shape, color) {
  const g = tokenStand(color, '#C9CDD3', '#14161C');
  const body = { ironman, captain, hulk, thor }[shape]();
  body.userData.baseY = shape === 'ironman' ? 0.2 : 0.145; body.userData.bob = shape === 'ironman' ? 0.03 : 0;
  const u = body.userData;
  body.userData.idle = (t, active) => {
    const k = active ? 1 : 0.4;
    if (u.hand) { u.hand.glow.material.opacity = 0.4 + 0.6 * k * (0.6 + 0.4 * Math.sin(t * 9)); u.hand.glow.scale.setScalar(0.25 + 0.25 * k); u.reactor.material.opacity = 0.6 + 0.4 * Math.sin(t * 3); }
    if (u.shield) u.shield.rotation.z = active ? t * 4 : 0;
    if (u.arm1) { const r = active ? 2.6 : 0.35; u.arm1.rotation.z = THREE.MathUtils.lerp(u.arm1.rotation.z, active ? 2.5 + Math.sin(t * 8) * 0.15 : 0.35, 0.08); u['arm-1'].rotation.z = THREE.MathUtils.lerp(u['arm-1'].rotation.z, active ? -2.5 - Math.sin(t * 8) * 0.15 : -0.35, 0.08); void r; }
    if (u.spark) { u.spark.material.opacity = active && Math.sin(t * 23) > 0.2 ? 0.9 : 0; u.hammerArm.rotation.x = active ? -2.4 : -0.45; }
    body.rotation.y = Math.sin(t * 0.7) * 0.06;
  };
  body.scale.multiplyScalar(1.12);
  g.add(body);
  g.userData.body = body;
  return g;
}

/* ---------- buildings: Base → Cuartel → Torre, in the owner's colour ---------- */
let winTex = null;
function windows() {
  if (winTex) return winTex;
  const [c, x] = canvas(64, 128);
  x.fillStyle = '#000'; x.fillRect(0, 0, 64, 128);
  for (let r = 0; r < 16; r++) for (let k = 0; k < 6; k++) if (Math.random() < 0.6) { x.fillStyle = Math.random() < 0.85 ? '#FFD995' : '#BFE4FF'; x.fillRect(4 + k * 10, 4 + r * 8, 6, 4); }
  winTex = tex(c); winTex.wrapS = winTex.wrapT = THREE.RepeatWrapping;
  return winTex;
}
export function tower(w, h, d, wallColor, lit = 1) {
  const t = windows().clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(w / 0.12)), Math.max(1, Math.round(h / 0.16)));
  return mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.5, metalness: 0.35, emissive: '#FFFFFF', emissiveMap: t, emissiveIntensity: lit }), 0, h / 2, 0);
}
export function makeBuilding(stage, color) {
  const g = new THREE.Group(), own = std(color, { roughness: 0.45, emissive: color, emissiveIntensity: 0.5 }), brick = std('#7A4A3A', { roughness: 0.9 }), dark = std('#2C2F36', { metalness: 0.5, roughness: 0.45 }), glass = '#5D6E86';
  const sign = (x, y, z, w) => { const s = box(w, 0.07, 0.02, own, x, y, z); g.add(s); };
  if (stage === 1) {
    /* a brownstone with scaffolding and a crane */
    const bs = tower(0.36, 0.36, 0.3, '#8A5A44', 0.6); bs.position.x = -0.12; g.add(bs);
    g.add(box(0.4, 0.03, 0.34, dark, -0.12, 0.375, 0));
    for (let k = 0; k < 3; k++) g.add(box(0.008, 0.42, 0.008, dark, 0.1, 0.21, -0.15 + k * 0.15), box(0.008, 0.008, 0.32, dark, 0.1, 0.12 + k * 0.12, 0));
    const crane = new THREE.Group(); crane.add(box(0.03, 0.8, 0.03, std('#E3B23C'), 0, 0.4, 0), box(0.6, 0.025, 0.03, std('#E3B23C'), 0.15, 0.8, 0), box(0.06, 0.06, 0.06, own, -0.12, 0.79, 0), cyl(0.003, 0.003, 0.28, dark, 0.38, 0.66, 0, 4));
    crane.position.set(0.3, 0, -0.2); g.add(crane);
    sign(-0.12, 0.3, 0.155, 0.22);
  } else if (stage === 2) {
    const a = tower(0.34, 0.66, 0.34, '#3E4A5E'); a.position.set(-0.1, 0, 0); g.add(a);
    const b2 = tower(0.24, 0.44, 0.26, '#8A5A44', 0.7); b2.position.set(0.24, 0, 0.06); g.add(b2);
    g.add(box(0.38, 0.04, 0.38, own, -0.1, 0.68, 0), cyl(0.05, 0.05, 0.1, dark, 0.24, 0.49, 0.06, 10));
    sign(-0.1, 0.56, 0.175, 0.3);
    const ant = cyl(0.006, 0.01, 0.26, dark, -0.1, 0.83, 0, 6); g.add(ant);
    const tip = ball(0.018, glow(color, 4), -0.1, 0.97, 0, 8, 6); tip.userData.blink = true; g.add(tip);
  } else {
    const a = tower(0.32, 1.25, 0.32, glass); a.position.set(-0.04, 0, 0); g.add(a);
    const b2 = tower(0.22, 0.8, 0.22, '#3E4A5E'); b2.position.set(0.26, 0, -0.14); g.add(b2);
    const crown = cyl(0.12, 0.19, 0.18, own, -0.04, 1.34, 0, 4); crown.rotation.y = Math.PI / 4; g.add(crown);
    g.add(cyl(0.008, 0.012, 0.36, dark, -0.04, 1.6, 0, 6));
    const pad = cyl(0.12, 0.12, 0.02, dark, 0.26, 0.81, -0.14, 16); g.add(pad);
    const ring = torus(0.1, 0.008, own, 0.26, 0.825, -0.14, 20); ring.rotation.x = Math.PI / 2; g.add(ring);
    for (let k = 0; k < 4; k++) { const l = ball(0.016, glow(color, 4), -0.04 + Math.cos(k * 1.57) * 0.12, 1.26, Math.sin(k * 1.57) * 0.12, 6, 4); l.userData.blink = true; g.add(l); }
    const h = glowSprite(color, 2.4); h.position.set(0, 0.8, 0); h.material.opacity = 0.25; g.add(h);
  }
  return g;
}

/* ---------- vehicles for the four channel tiles ---------- */
function quinjet() {
  const s = new THREE.Group(), grey = std('#3E434C', { roughness: 0.45, metalness: 0.5 }), grey2 = std('#5A606A', { roughness: 0.5, metalness: 0.4 });
  const body = slab([[0.4, 0], [0.1, 0.12], [-0.3, 0.12], [-0.34, 0], [-0.3, -0.12], [0.1, -0.12]], 0.09, grey, 0.01); body.position.y = -0.04; s.add(body);
  s.add(box(0.14, 0.04, 0.1, std('#1A2633', { roughness: 0.05, metalness: 0.6 }), 0.2, 0.065, 0));
  [-1, 1].forEach(k => {
    const w = slab([[0.12, 0], [-0.22, 0.34 * k], [-0.3, 0.34 * k], [-0.22, 0]], 0.02, grey2, 0); w.position.y = 0.0; s.add(w);
    const fin = box(0.14, 0.14, 0.012, grey2, -0.26, 0.1, k * 0.09); fin.rotation.x = k * 0.5; s.add(fin);
    const eng = cyl(0.04, 0.045, 0.12, grey, -0.3, 0.02, k * 0.07, 12); eng.rotation.z = Math.PI / 2; s.add(eng);
    s.add(ball(0.035, glow('#7FD3FF', 3), -0.37, 0.02, k * 0.07, 8, 6));
  });
  return s;
}
function helicarrier() {
  const s = new THREE.Group(), grey = std('#59616C', { roughness: 0.55, metalness: 0.4 }), deck = std('#2C3138', { roughness: 0.7 });
  s.add(box(0.7, 0.08, 0.2, grey, 0, 0, 0), box(0.72, 0.012, 0.22, deck, 0, 0.046, 0));
  s.add(box(0.5, 0.004, 0.012, std('#E8E2C8'), 0, 0.054, 0.02));
  s.add(box(0.1, 0.12, 0.05, grey, -0.05, 0.1, -0.08), cyl(0.008, 0.008, 0.1, grey, -0.05, 0.2, -0.08, 6));
  const rotors = [];
  [[0.25, 0.17], [-0.25, 0.17], [0.25, -0.17], [-0.25, -0.17]].forEach(q => {
    const pod = new THREE.Group(); pod.position.set(q[0], -0.02, q[1]);
    pod.add(torus(0.1, 0.018, grey, 0, 0, 0, 24));
    pod.children[0].rotation.x = Math.PI / 2;
    const blades = new THREE.Group(); [0, 1, 2].forEach(i => { const bl = box(0.18, 0.004, 0.02, deck); bl.rotation.y = (i * Math.PI) / 3; blades.add(bl); });
    pod.add(blades, box(0.04, 0.02, 0.12, grey, 0, 0, -Math.sign(q[1]) * 0.06)); s.add(pod); rotors.push(blades);
  });
  s.userData.rotors = rotors;
  return s;
}
function milano() {
  const s = new THREE.Group(), blue = std('#2E5DA8', { roughness: 0.45, metalness: 0.3 }), orange = std('#E07A26', { roughness: 0.45, metalness: 0.3 }), white = std('#E6E6E6', { roughness: 0.5 });
  const body = cyl(0.06, 0.09, 0.42, white, 0, 0, 0, 12); body.rotation.z = Math.PI / 2; s.add(body);
  const nose = cone(0.06, 0.16, orange, 0.29, 0, 0, 12); nose.rotation.z = -Math.PI / 2; s.add(nose);
  s.add(box(0.12, 0.05, 0.08, std('#1A2633', { roughness: 0.05, metalness: 0.6 }), 0.12, 0.06, 0));
  [-1, 1].forEach(k => {
    const w = slab([[0.06, 0], [-0.18, 0.32 * k], [-0.26, 0.3 * k], [-0.14, 0]], 0.02, blue, 0); w.position.y = -0.01; w.rotation.x = k * 0.2; s.add(w);
    s.add(box(0.1, 0.022, 0.06, orange, -0.12, 0.0, k * 0.2));
    const eng = cyl(0.04, 0.04, 0.12, white, -0.22, 0, k * 0.08, 12); eng.rotation.z = Math.PI / 2; s.add(eng, ball(0.033, glow('#FF9A3D', 3), -0.29, 0, k * 0.08, 8, 6));
  });
  return s;
}
function moto() {
  const s = new THREE.Group(), olive = std('#4A5130', { roughness: 0.6 }), chrome = metal('#D5D9DE', 0.25), tyre = std('#141414', { roughness: 0.9 });
  [-0.17, 0.17].forEach(x => { const w = torus(0.085, 0.028, tyre, x, 0, 0, 24); s.add(w); s.add(torus(0.05, 0.006, chrome, x, 0, 0, 16)); });
  s.add(box(0.26, 0.07, 0.08, olive, 0, 0.08, 0), box(0.12, 0.05, 0.1, std('#3A2A1E'), -0.06, 0.13, 0), cyl(0.04, 0.04, 0.08, chrome, 0.02, 0.04, 0, 10));
  const fork = cyl(0.008, 0.008, 0.2, chrome, 0.15, 0.08, 0, 6); fork.rotation.z = 0.4; s.add(fork, box(0.008, 0.008, 0.2, chrome, 0.12, 0.18, 0));
  const ex = cyl(0.012, 0.016, 0.24, chrome, -0.05, 0.02, 0.05, 8); ex.rotation.z = Math.PI / 2; s.add(ex);
  const star = slab([...Array(10)].map((_, i) => { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.012 : 0.03; return [Math.cos(a) * r, -Math.sin(a) * r]; }), 0.003, std('#EDEDF0'), 0);
  star.rotation.x = Math.PI / 2; star.position.set(0.02, 0.09, 0.042); s.add(star);
  return s;
}

/* ---------- props on the special tiles ---------- */
export function makeProp(t, i, ctx) {
  const p = new THREE.Group(), { anim, bannerTexture, GEO } = ctx, dark = std('#22262E', { metalness: 0.5, roughness: 0.45 }), steel = metal('#B7BEC8', 0.3);
  if (t.type === 'kickoff') {
    /* a tiny Avengers tower with the banner across the lane */
    const tw = new THREE.Group();
    const a = tower(0.3, 1.3, 0.3, '#56677E'); tw.add(a);
    const top = cyl(0.1, 0.22, 0.3, std('#56677E', { metalness: 0.5, roughness: 0.3 }), 0.04, 1.45, 0, 4); top.rotation.y = Math.PI / 4; tw.add(top);
    tw.add(cyl(0.18, 0.18, 0.02, dark, 0.2, 1.2, 0, 16), cyl(0.008, 0.01, 0.4, dark, 0, 1.8, 0, 6));
    const l = ball(0.03, glow('#FF3B30', 4), 0, 2.0, 0, 8, 6); l.userData.blink = true; tw.add(l);
    tw.position.set(-0.55, 0, 0.2); p.add(tw);
    const arch = new THREE.Group();
    [-0.92, 0.92].forEach(x => arch.add(cyl(0.05, 0.065, 1.5, steel, x, 0.75, 0, 12)));
    const ban = mesh(new THREE.PlaneGeometry(1.84, 0.38), new THREE.MeshBasicMaterial({ map: bannerTexture('¡VENGADORES, REUNÍOS!', '#14161C', '#F2C230'), side: THREE.DoubleSide, toneMapped: false }), 0, 1.3, 0);
    arch.add(ban, box(1.9, 0.04, 0.05, steel, 0, 1.5, 0), box(1.9, 0.04, 0.05, steel, 0, 1.1, 0));
    arch.position.set(0, 0, GEO.LANE - GEO.PLOT); p.add(arch);
  } else if (t.type === 'signal') {
    /* a S.H.I.E.L.D. alert beacon: a console with a turning red light */
    p.add(box(0.5, 0.3, 0.32, dark, 0, 0.15, 0), box(0.44, 0.02, 0.26, glow('#3A8DFF', 1.2), 0, 0.31, 0));
    const scr = box(0.4, 0.24, 0.02, glow('#5AB0FF', 1.4), 0, 0.5, -0.13); scr.rotation.x = -0.3; p.add(scr, cyl(0.02, 0.02, 0.3, steel, 0, 0.42, -0.15, 6));
    const beacon = new THREE.Group(); beacon.position.set(0, 0.8, 0);
    beacon.add(cyl(0.07, 0.08, 0.06, steel, 0, -0.06, 0, 16), ball(0.07, new THREE.MeshStandardMaterial({ color: '#FF4A3A', emissive: '#FF2A1A', emissiveIntensity: 2.4, transparent: true, opacity: 0.85 }), 0, 0.02, 0, 16, 12));
    const beam = cone(0.12, 0.7, new THREE.MeshBasicMaterial({ color: '#FF4A3A', transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), 0.35, 0.02, 0, 16);
    beam.rotation.z = Math.PI / 2; beacon.add(beam); p.add(beacon);
    anim.push(tm => { beacon.rotation.y = tm * 3 + i; });
  } else if (t.type === 'brain') {
    /* an infinity gem floating over a pedestal, changing colour slowly */
    p.add(cyl(0.2, 0.28, 0.24, std('#3A3540', { roughness: 0.5, metalness: 0.4 }), 0, 0.12, 0, 8), torus(0.2, 0.02, metal('#D9A23A'), 0, 0.24, 0, 24));
    p.children[1].rotation.x = Math.PI / 2;
    const gemMat = new THREE.MeshStandardMaterial({ color: '#B266FF', emissive: '#8A3DFF', emissiveIntensity: 2.2, roughness: 0.1, metalness: 0.1, flatShading: true, transparent: true, opacity: 0.95 });
    const gem = mesh(new THREE.OctahedronGeometry(0.14, 0), gemMat, 0, 0.66, 0); gem.scale.y = 1.4; p.add(gem);
    const gl = glowSprite('#B266FF', 0.9); gl.position.y = 0.66; p.add(gl);
    const GEMS = ['#8A3DFF', '#2E6BFF', '#FF2E2E', '#FF8A1F', '#2EE06A', '#F2D02E'], cA = new THREE.Color(), cB = new THREE.Color();
    anim.push(tm => { const u = (tm * 0.15 + i * 0.37) % 1 * GEMS.length, k = Math.floor(u), f = u - k; cA.set(GEMS[k]).lerp(cB.set(GEMS[(k + 1) % GEMS.length]), f); gemMat.color.copy(cA); gemMat.emissive.copy(cA); gl.material.color.copy(cA); gem.rotation.y = tm; gem.position.y = 0.66 + Math.sin(tm * 1.6 + i) * 0.05; });
  } else if (t.type === 'spam') {
    /* La Balsa: a prison cell with bars and a red alarm */
    p.add(box(0.62, 0.06, 0.5, dark, 0, 0.03, 0), box(0.62, 0.05, 0.5, dark, 0, 0.8, 0));
    for (let k = 0; k < 7; k++) p.add(cyl(0.012, 0.012, 0.74, steel, -0.27 + k * 0.09, 0.42, 0.23, 6), cyl(0.012, 0.012, 0.74, steel, -0.27 + k * 0.09, 0.42, -0.23, 6));
    for (let k = 0; k < 5; k++) p.add(cyl(0.012, 0.012, 0.74, steel, -0.29, 0.42, -0.18 + k * 0.09, 6), cyl(0.012, 0.012, 0.74, steel, 0.29, 0.42, -0.18 + k * 0.09, 6));
    const prisoner = new THREE.Group(); prisoner.add(cyl(0.07, 0.09, 0.3, std('#E07A26', { roughness: 0.8 }), 0, 0.2, 0, 12), ball(0.06, std('#E8C3A0'), 0, 0.42, 0, 12, 10)); p.add(prisoner);
    const al = ball(0.04, glow('#FF3B30', 4), 0.24, 0.86, 0.2, 8, 6); al.userData.blink = true; p.add(al);
  } else if (t.type === 'board') {
    /* collateral damage: rubble, a crushed taxi, cones and smoke */
    const conc = std('#8E8A84', { flatShading: true, roughness: 0.95 });
    [[0, 0.08, 0, 0.3], [0.2, 0.06, 0.12, 0.2], [-0.2, 0.05, -0.1, 0.22], [0.1, 0.18, -0.08, 0.16]].forEach(q => { const r = mesh(new THREE.DodecahedronGeometry(q[3] * 0.6, 0), conc, q[0], q[1], q[2]); r.rotation.set(q[0] * 5, q[1] * 9, q[2] * 4); p.add(r); });
    const taxi = new THREE.Group(), yel = std('#F2C230', { roughness: 0.45, metalness: 0.2 });
    taxi.add(box(0.36, 0.1, 0.17, yel, 0, 0.08, 0), box(0.18, 0.08, 0.15, yel, -0.02, 0.17, 0), box(0.06, 0.03, 0.04, std('#222'), -0.02, 0.23, 0));
    [-0.12, 0.12].forEach(x => [-0.09, 0.09].forEach(z => { const w = cyl(0.04, 0.04, 0.03, std('#111'), x, 0.04, z, 12); w.rotation.x = Math.PI / 2; taxi.add(w); }));
    taxi.position.set(0.3, 0.12, 0.2); taxi.rotation.set(0.5, 0.6, 0.35); p.add(taxi);
    [[-0.32, 0.25], [-0.36, -0.2], [0.4, -0.25]].forEach(q => p.add(cone(0.04, 0.12, std('#FF6A1F'), q[0], 0.06, q[1], 10)));
    const smoke = [0, 1, 2, 3].map(k => { const s = ball(0.08, new THREE.MeshStandardMaterial({ color: '#6B6B6B', transparent: true, opacity: 0.5, flatShading: true }), 0, 0.3, 0, 8, 6); p.add(s); return s; });
    anim.push(tm => smoke.forEach((s, k) => { const u = (tm * 0.25 + k / 4) % 1; s.position.set(0.05 + Math.sin(k * 2 + tm) * 0.1, 0.25 + u * 0.9, 0); s.scale.setScalar(0.6 + u * 1.8); s.material.opacity = 0.5 * (1 - u); }));
  } else if (t.type === 'channel') {
    const stand = new THREE.Group(), ringMat = std('#3A3F48', { roughness: 0.45, metalness: 0.5, emissive: '#000000' });
    ringMat.userData.base = '#3A3F48';
    stand.add(cyl(0.34, 0.38, 0.05, dark, 0, 0.025, 0, 24), cyl(0.3, 0.3, 0.02, ringMat, 0, 0.06, 0, 24));
    if (t.icon !== 'moto') stand.add(cyl(0.03, 0.05, 0.4, steel, 0, 0.26, 0, 8));
    p.add(stand);
    const v = { quinjet, helicarrier, milano, moto }[t.icon]();
    const holder = new THREE.Group(); holder.add(v); holder.position.y = t.icon === 'moto' ? 0.2 : 0.66; v.scale.setScalar(t.icon === 'moto' ? 1.6 : 1.05); p.add(holder);
    p.userData.tint = [ringMat];
    anim.push(tm => { if (t.icon !== 'moto') { holder.position.y = 0.66 + Math.sin(tm * 1.3 + i) * 0.04; holder.rotation.z = Math.sin(tm * 0.9 + i) * 0.06; } holder.rotation.y = Math.PI / 2 + Math.sin(tm * 0.4 + i) * 0.5; if (v.userData.rotors) v.userData.rotors.forEach(r => { r.rotation.y = tm * 12; }); });
  }
  return p;
}

/* ---------- flat icons ---------- */
export function icon(x, kind, cx, cy, s, col) {
  x.save(); x.translate(cx, cy); x.scale(s / 100, s / 100);
  x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 8; x.lineCap = 'round'; x.lineJoin = 'round';
  const line = (...p) => { x.beginPath(); x.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) x.lineTo(p[i], p[i + 1]); x.stroke(); };
  const circ = (a, b, r, fill) => { x.beginPath(); x.arc(a, b, r, 0, 7); fill ? x.fill() : x.stroke(); };
  if (kind === 'kickoff') { line(-14, 48, -14, -30, 0, -48, 14, -30, 14, 48); line(-30, 48, 30, 48); line(-14, -10, 14, -10); line(-14, 14, 14, 14); }
  else if (kind === 'signal') { line(0, -44, 46, 38, -46, 38, 0, -44); x.lineWidth = 10; line(0, -12, 0, 10); circ(0, 24, 5, true); }
  else if (kind === 'brain') { line(0, -46, 30, -10, 0, 46, -30, -10, 0, -46); line(-30, -10, 30, -10); line(0, -46, -10, -10, 0, 46, 10, -10, 0, -46); }
  else if (kind === 'spam') { rr(x, -40, -40, 80, 80, 6); x.stroke(); [-20, 0, 20].forEach(d => line(d, -40, d, 40)); }
  else if (kind === 'board') { line(-46, 40, 46, 40); line(-36, 40, -30, 4, -14, 14, -6, -20, 10, -6, 20, -30, 34, 40); x.lineWidth = 5; line(-6, -34, 2, -44); line(14, -40, 24, -46); }
  else if (kind === 'quinjet') { line(46, 0, -30, -40, -20, 0, -30, 40, 46, 0); }
  else if (kind === 'helicarrier') { line(-46, 0, 46, 0); [-30, 30].forEach(a => [-24, 24].forEach(b => circ(a, b, 14))); }
  else if (kind === 'milano') { line(46, 0, 0, -12, -36, -40, -26, 0, -36, 40, 0, 12, 46, 0); }
  else if (kind === 'moto') { circ(-30, 18, 18); circ(30, 18, 18); line(-30, 18, -6, -10, 20, -10, 30, 18); line(20, -10, 26, -28); }
  x.restore();
}

export { quinjet, helicarrier, milano, moto };
