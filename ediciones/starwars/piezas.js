/* Star Wars (edición fan) · figuras, edificios, naves y objetos de las casillas.
   Todo está modelado a mano con formas sencillas: no se usa ningún modelo ni imagen oficial. */
import { THREE, std, glow, metal, basic, mesh, box, cyl, ball, cone, torus, group, lathe, slab, canvas, tex, rr, glowSprite, tokenStand } from '../../kit3d.js?v=1116b';

const GREY = '#C9CDD3', GREY2 = '#8D939C', DARK = '#1A1D24', SAND = '#D9C29A';
const gloss = c => std(c, { roughness: 0.22, metalness: 0.55, envMapIntensity: 1.5 });
const cloth = c => std(c, { roughness: 0.9, side: THREE.DoubleSide });

/* a lightsaber: metal hilt and a glowing blade with a soft halo; returns the group and the blade (for the idle pulse) */
function saber(color, len = 0.46, hiltLen = 0.1) {
  const g = new THREE.Group();
  g.add(cyl(0.014, 0.016, hiltLen, metal('#D5D9DE', 0.25), 0, 0, 0, 12), cyl(0.017, 0.017, 0.018, std(DARK), 0, hiltLen * 0.18, 0, 12), cyl(0.016, 0.016, 0.012, std(DARK), 0, -hiltLen * 0.3, 0, 12));
  const core = cyl(0.009, 0.012, len, glow('#FFFFFF', 3), 0, hiltLen / 2 + len / 2, 0, 10);
  const blade = cyl(0.02, 0.022, len + 0.02, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }), 0, hiltLen / 2 + len / 2, 0, 12);
  const tip = ball(0.02, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }), 0, hiltLen / 2 + len, 0, 10, 8);
  core.material = new THREE.MeshStandardMaterial({ color: '#FFFFFF', emissive: color, emissiveIntensity: 2.4, roughness: 0.3 });
  g.add(core, blade, tip);
  g.userData.core = core; g.userData.blade = blade;
  return g;
}

/* a standing body made of lathe profiles: legs, robe, torso, shoulders */
function arm(m, x, y, z, rz, rx = 0, len = 0.24, r = 0.032) {
  const a = new THREE.Group(); a.position.set(x, y, z);
  const up = cyl(r, r * 0.9, len, m, 0, -len / 2, 0, 10); a.add(up);
  a.rotation.set(rx, 0, rz);
  return a;
}

function vader(color) {
  const b = new THREE.Group(), black = gloss('#0A0B0E'), matte = std('#101116', { roughness: 0.75 }), steel = metal('#9AA1AB', 0.3);
  [-0.055, 0.055].forEach(x => b.add(cyl(0.048, 0.054, 0.2, black, x, 0.1, 0, 12), cyl(0.04, 0.046, 0.16, matte, x, 0.27, 0, 10)));
  b.add(lathe([[0.001, 0.2], [0.16, 0.2], [0.15, 0.3], [0.13, 0.42], [0.125, 0.47], [0.001, 0.47]], matte, 28));
  b.add(lathe([[0.001, 0.46], [0.125, 0.46], [0.142, 0.56], [0.152, 0.66], [0.12, 0.73], [0.06, 0.76], [0.001, 0.76]], black, 28));
  b.add(cyl(0.132, 0.132, 0.035, std('#22252C', { metalness: 0.6, roughness: 0.35 }), 0, 0.475, 0, 28));
  [-0.06, 0, 0.06].forEach((x, i) => b.add(box(0.038, 0.03, 0.02, steel, x, 0.475, 0.128 + (i === 1 ? 0.004 : 0))));
  const panel = box(0.1, 0.07, 0.02, std('#3A3F48', { metalness: 0.5, roughness: 0.4 }), 0, 0.62, 0.138); panel.rotation.x = -0.18; b.add(panel);
  [['#FF3B30', -0.028, 0.633], ['#2ECC71', 0, 0.633], ['#3A8DFF', 0.028, 0.633], ['#FF3B30', -0.014, 0.607], ['#E8E8E8', 0.014, 0.607]].forEach(q => { const l = box(0.016, 0.012, 0.01, glow(q[0], 2.2), q[1], q[2], 0.15); l.rotation.x = -0.18; b.add(l); });
  [-1, 1].forEach(s => { const sh = ball(0.06, black, s * 0.135, 0.71, 0, 16, 10); sh.scale.set(1.25, 0.7, 1.1); b.add(sh); });
  b.add(arm(black, -0.15, 0.7, 0, 0.18, 0.1), arm(black, 0.16, 0.7, 0.02, -0.25, -0.75));
  b.add(ball(0.03, black, -0.19, 0.46, 0.03, 10, 8));
  const cape = new THREE.Mesh(new THREE.LatheGeometry([[0.24, 0.12], [0.22, 0.3], [0.19, 0.5], [0.17, 0.66], [0.15, 0.74]].map(p => new THREE.Vector2(p[0], p[1])), 26, Math.PI * 0.42, Math.PI * 1.16), std('#050506', { roughness: 0.55, metalness: 0.2, side: THREE.DoubleSide, envMapIntensity: 0.8 }));
  b.add(cape);
  /* helmet: dome, flared skirt, cheek plates, triangular grille and the two lenses */
  const head = new THREE.Group(); head.position.y = 0.79;
  head.add(cyl(0.05, 0.06, 0.06, black, 0, -0.02, 0, 14));
  const dome = mesh(new THREE.SphereGeometry(0.1, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), black, 0, 0.07, -0.005); dome.scale.set(1, 1.05, 1.08); head.add(dome);
  head.add(lathe([[0.096, 0.07], [0.115, 0.03], [0.14, -0.01], [0.15, -0.035], [0.14, -0.04]], new THREE.MeshStandardMaterial({ color: '#0A0B0E', roughness: 0.22, metalness: 0.55, envMapIntensity: 1.5, side: THREE.DoubleSide }), 28));
  const face = mesh(new THREE.SphereGeometry(0.088, 20, 12, Math.PI / 2 - 0.95, 1.9, 0.5, 1.6), black, 0, 0.035, 0.012); face.scale.set(0.95, 1.05, 1.0); head.add(face);
  head.add(box(0.12, 0.014, 0.03, black, 0, 0.088, 0.08));
  [-1, 1].forEach(s => { const ck = box(0.012, 0.07, 0.03, std('#2A2D33', { metalness: 0.6, roughness: 0.3 }), s * 0.05, 0.005, 0.085); ck.rotation.z = s * 0.35; head.add(ck); });
  [-1, 1].forEach(s => { const lens = mesh(new THREE.SphereGeometry(0.03, 14, 10), std('#0B0D12', { roughness: 0.04, metalness: 0.95, envMapIntensity: 3.2 }), s * 0.036, 0.058, 0.086); lens.scale.set(1.3, 0.85, 0.55); lens.rotation.z = s * 0.35; head.add(lens); });
  const grille = mesh(new THREE.ConeGeometry(0.044, 0.075, 3), steel, 0, -0.005, 0.092); grille.rotation.set(0.25, 0, Math.PI); head.add(grille);
  head.add(box(0.05, 0.006, 0.01, std('#2A2D33'), 0, 0.033, 0.094));
  for (let k = 0; k < 5; k++) head.add(box(0.004, 0.04, 0.006, std('#1A1C21'), -0.016 + k * 0.008, -0.004, 0.112));
  b.add(head);
  const s = saber('#FF2B2B', 0.42); s.position.set(0.19, 0.44, 0.13); s.rotation.set(1.05, 0, -0.35); b.add(s);
  b.userData.saber = s;
  return b;
}

function maulFace() {
  const [c, x] = canvas(512, 256);
  x.fillStyle = '#B3171E'; x.fillRect(0, 0, 512, 256);
  const fx = 128; /* the face looks along +z, which is u = 0.25 on a sphere */
  x.fillStyle = '#0B0B0D';
  /* the black mask around the eyes and the stripes up the forehead */
  x.beginPath(); x.ellipse(fx - 30, 128, 26, 16, 0.2, 0, 7); x.ellipse(fx + 30, 128, 26, 16, -0.2, 0, 7); x.fill();
  x.fillRect(fx - 7, 40, 14, 80);
  [[-1, 1]].flat().forEach(s => { x.beginPath(); x.moveTo(fx + s * 14, 30); x.lineTo(fx + s * 40, 30); x.lineTo(fx + s * 30, 104); x.lineTo(fx + s * 18, 104); x.closePath(); x.fill(); });
  x.beginPath(); x.moveTo(fx - 26, 168); x.quadraticCurveTo(fx, 214, fx + 26, 168); x.lineTo(fx + 20, 200); x.quadraticCurveTo(fx, 226, fx - 20, 200); x.closePath(); x.fill();
  [-1, 1].forEach(s => { x.fillRect(fx + s * 54 - 6, 112, 12, 52); x.fillRect(fx + s * 40 - 4, 170, 8, 30); });
  x.fillStyle = '#B3171E'; x.fillRect(fx - 3, 182, 6, 30);
  /* the back of the head is black */
  x.fillStyle = '#0B0B0D'; x.fillRect(256 + 40, 0, 176, 256);
  return tex(c);
}

function maul(color) {
  const b = new THREE.Group(), robe = std('#0E0E11', { roughness: 0.85 }), robe2 = std('#17171B', { roughness: 0.8 }), skin = std('#FFFFFF', { map: maulFace(), roughness: 0.55 });
  [-0.05, 0.05].forEach(x => b.add(cyl(0.042, 0.05, 0.16, gloss('#0A0A0C'), x, 0.08, 0.01, 12)));
  b.add(lathe([[0.001, 0.12], [0.2, 0.12], [0.18, 0.24], [0.14, 0.38], [0.12, 0.46], [0.001, 0.46]], robe, 28));
  b.add(lathe([[0.001, 0.45], [0.12, 0.45], [0.135, 0.56], [0.14, 0.66], [0.1, 0.72], [0.045, 0.75], [0.001, 0.75]], robe2, 28));
  b.add(cyl(0.125, 0.125, 0.04, std('#2A1A12', { roughness: 0.6 }), 0, 0.47, 0, 28));
  const lapel = slab([[-0.06, 0], [0.06, 0], [0.0, -0.18]], 0.012, robe, 0); lapel.rotation.x = Math.PI / 2 - 0.1; lapel.position.set(0, 0.73, 0.12); b.add(lapel);
  [-1, 1].forEach(s => { const sh = ball(0.055, robe2, s * 0.12, 0.69, 0, 14, 10); sh.scale.set(1.2, 0.8, 1); b.add(sh); });
  const cloak = new THREE.Mesh(new THREE.LatheGeometry([[0.25, 0.1], [0.21, 0.3], [0.17, 0.52], [0.15, 0.7]].map(p => new THREE.Vector2(p[0], p[1])), 26, Math.PI * 0.5, Math.PI), cloth('#08080A'));
  b.add(cloak);
  b.add(arm(robe2, -0.14, 0.69, 0.02, 0.4, -0.9), arm(robe2, 0.14, 0.69, 0.02, -0.4, -0.9));
  b.add(cyl(0.04, 0.045, 0.05, skin, 0, 0.775, 0, 12));
  const head = ball(0.082, skin, 0, 0.85, 0, 28, 20); head.scale.set(0.95, 1.08, 1); b.add(head);
  [-1, 1].forEach(s => b.add(ball(0.011, glow('#FFC21A', 2.6), s * 0.028, 0.86, 0.074, 8, 6)));
  /* the crown of short horns */
  const ivory = std('#E9DCC0', { roughness: 0.5 });
  [[0, 0.93, 0.0], [0.035, 0.925, 0.03], [-0.035, 0.925, 0.03], [0.045, 0.915, -0.02], [-0.045, 0.915, -0.02], [0, 0.92, -0.05], [0.025, 0.93, -0.035], [-0.025, 0.93, -0.035], [0.055, 0.9, 0.035], [-0.055, 0.9, 0.035]].forEach((q, i) => { const h = cone(0.011, i < 3 ? 0.05 : 0.035, ivory, q[0], q[1] + 0.012, q[2], 8); h.rotation.set(q[2] * 3, 0, -q[0] * 4); b.add(h); });
  /* the double-bladed staff, held across the body */
  const staff = new THREE.Group();
  staff.add(cyl(0.016, 0.016, 0.24, metal('#2B2E33', 0.35), 0, 0, 0, 12), cyl(0.019, 0.019, 0.03, metal('#C7CBD1', 0.25), 0, 0, 0, 12));
  [-1, 1].forEach(s => { const sb = saber('#FF2626', 0.34, 0.001); sb.rotation.z = s > 0 ? 0 : Math.PI; sb.position.y = s * 0.12; staff.add(sb); });
  staff.position.set(0, 0.5, 0.2); staff.rotation.set(0.15, 0, 1.15);
  b.add(staff);
  b.userData.staff = staff;
  return b;
}

function luke(color) {
  const b = new THREE.Group(), tunic = std('#EEEAE1', { roughness: 0.85 }), pants = std('#CDBE9F', { roughness: 0.85 }), boots = std('#4A3426', { roughness: 0.6 }), skin = std('#E9C3A0', { roughness: 0.6 }), hair = std('#D7AE57', { roughness: 0.7 });
  [-0.05, 0.05].forEach(x => b.add(cyl(0.045, 0.05, 0.12, boots, x, 0.06, 0.005, 12), cyl(0.042, 0.044, 0.2, pants, x, 0.22, 0, 12)));
  b.add(lathe([[0.001, 0.3], [0.13, 0.3], [0.125, 0.38], [0.115, 0.46], [0.001, 0.46]], tunic, 26));
  b.add(lathe([[0.001, 0.45], [0.115, 0.45], [0.13, 0.56], [0.13, 0.65], [0.09, 0.7], [0.04, 0.72], [0.001, 0.72]], tunic, 26));
  /* the wrap of the tunic and the belt with its buckle and pouches */
  const fold = box(0.012, 0.2, 0.012, std('#CFC7B6', { roughness: 0.9 }), 0.0, 0.6, 0.128); fold.rotation.z = -0.5; b.add(fold);
  const collar = torus(0.05, 0.012, tunic, 0, 0.715, 0.01, 18); collar.rotation.x = Math.PI / 2; b.add(collar);
  b.add(cyl(0.122, 0.122, 0.04, std('#5A3B26', { roughness: 0.55 }), 0, 0.46, 0, 26), box(0.04, 0.032, 0.012, metal('#C9CDD3'), 0, 0.46, 0.124));
  [-0.08, 0.08].forEach(x => b.add(box(0.035, 0.035, 0.03, std('#4A3020'), x, 0.455, 0.105)));
  b.add(arm(tunic, -0.13, 0.67, 0, 0.22, 0.05, 0.25, 0.034), arm(tunic, 0.13, 0.67, 0.02, -0.4, -0.7, 0.25, 0.034));
  b.add(cyl(0.032, 0.036, 0.045, skin, 0, 0.74, 0, 12));
  const head = ball(0.075, skin, 0, 0.81, 0.005, 24, 18); head.scale.set(0.95, 1.08, 1); b.add(head);
  const cap = mesh(new THREE.SphereGeometry(0.081, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, 0, 0.82, -0.004); cap.scale.set(1.0, 1.05, 1.05); b.add(cap);
  const fringe = ball(0.05, hair, 0.02, 0.875, 0.05, 14, 10); fringe.scale.set(1.4, 0.45, 0.8); fringe.rotation.z = -0.2; b.add(fringe);
  [-1, 1].forEach(s => { b.add(ball(0.009, std('#2C4A6E', { roughness: 0.3 }), s * 0.026, 0.815, 0.07, 8, 6)); b.add(ball(0.016, hair, s * 0.073, 0.81, -0.01, 8, 6)); });
  const s = saber('#3EA0FF', 0.42); s.position.set(0.2, 0.46, 0.14); s.rotation.set(0.5, 0, -0.55); b.add(s);
  b.userData.saber = s;
  return b;
}

function yoda(color) {
  const b = new THREE.Group(), robe = std('#B8A07A', { roughness: 0.95 }), robe2 = std('#8C7350', { roughness: 0.95 }), green = std('#93A65E', { roughness: 0.65 }), white = std('#EDEDE6', { roughness: 0.9 });
  b.add(lathe([[0.001, 0.0], [0.17, 0.0], [0.16, 0.08], [0.13, 0.2], [0.11, 0.3], [0.08, 0.36], [0.001, 0.37]], robe, 26));
  const front = slab([[-0.05, 0], [0.05, 0], [0.03, -0.3], [-0.03, -0.3]], 0.008, robe2, 0); front.rotation.x = Math.PI / 2 - 0.12; front.position.set(0, 0.34, 0.11); b.add(front);
  const hood = torus(0.075, 0.03, robe2, 0, 0.35, 0, 20); hood.rotation.x = Math.PI / 2; b.add(hood);
  b.add(arm(robe, -0.11, 0.32, 0.02, 0.6, -0.4, 0.16, 0.035), arm(robe, 0.11, 0.32, 0.02, -0.5, -0.7, 0.16, 0.035));
  b.add(ball(0.022, green, -0.19, 0.22, 0.08, 10, 8));
  /* the head: big and round, long ears, heavy brow, deep eyes and a few white hairs */
  const head = new THREE.Group(); head.position.y = 0.45;
  const skull = ball(0.105, green, 0, 0, 0, 28, 20); skull.scale.set(1.05, 0.88, 0.95); head.add(skull);
  [-1, 1].forEach(s => {
    const ear = mesh(new THREE.ConeGeometry(0.05, 0.2, 12), green, s * 0.17, 0.02, -0.01); ear.rotation.set(0, 0, s * (Math.PI / 2 + 0.22)); ear.scale.set(1, 1, 0.45); head.add(ear);
    const inner = mesh(new THREE.ConeGeometry(0.03, 0.15, 10), std('#C58C7C', { roughness: 0.7 }), s * 0.17, 0.022, 0.006); inner.rotation.copy(ear.rotation); inner.scale.set(1, 1, 0.3); head.add(inner);
    const eye = ball(0.024, std('#2B1A0E', { roughness: 0.1, metalness: 0.2, envMapIntensity: 2.2 }), s * 0.04, 0.015, 0.087, 12, 10); head.add(eye);
    head.add(ball(0.006, glow('#FFFFFF', 1.2), s * 0.04 + 0.006, 0.024, 0.108, 6, 4));
    const brow = ball(0.032, green, s * 0.042, 0.04, 0.08, 10, 8); brow.scale.set(1.3, 0.5, 0.6); head.add(brow);
  });
  const nose = ball(0.016, green, 0, -0.012, 0.1, 8, 6); nose.scale.set(1.2, 0.7, 0.8); head.add(nose);
  head.add(box(0.05, 0.004, 0.01, std('#5E6B3A'), 0, -0.045, 0.092));
  [[0.07, 0.03, -0.04, -1.1], [-0.07, 0.03, -0.04, 1.1], [0.05, 0.06, -0.06, -0.8], [-0.05, 0.06, -0.06, 0.8], [0.0, 0.08, -0.07, 0.1]].forEach(q => { const h = cyl(0.004, 0.001, 0.045, white, q[0], q[1], q[2], 4); h.rotation.z = q[3]; h.material = new THREE.MeshStandardMaterial({ color: '#EDEDE6', transparent: true, opacity: 0.8 }); head.add(h); });
  b.add(head);
  /* gimer stick and a short green blade */
  const stick = cyl(0.008, 0.01, 0.42, std('#5B4026', { roughness: 0.8 }), -0.2, 0.2, 0.08, 6); stick.rotation.z = 0.08; b.add(stick);
  const s = saber('#45E05A', 0.24, 0.07); s.position.set(0.16, 0.3, 0.12); s.rotation.set(0.2, 0, -0.9); b.add(s);
  b.userData.saber = s;
  b.userData.head = head;
  return b;
}

export function makeToken(shape, color) {
  const g = tokenStand(color, '#BFC6D1', '#0D1018');
  const body = { vader, maul, luke, yoda }[shape](color);
  body.userData.baseY = 0.145; body.userData.bob = 0;
  /* the one whose turn it is shows its blade: the saber hums brighter, Maul spins his staff, Yoda tilts his head */
  const sab = body.userData.saber, staff = body.userData.staff, head = body.userData.head;
  body.userData.idle = (t, active) => {
    const k = active ? 1 : 0.45;
    [sab, ...(staff ? staff.children.filter(c => c.userData.blade) : [])].filter(Boolean).forEach(sb => { sb.userData.blade.material.opacity = (0.4 + 0.25 * Math.sin(t * 22)) * k + 0.1; sb.userData.core.material.emissiveIntensity = 1.6 + k * 1.4; });
    if (staff) staff.rotation.y = active ? t * 3 : Math.sin(t * 0.8) * 0.2;
    if (head) head.rotation.z = Math.sin(t * 0.9) * 0.08;
    body.rotation.y = Math.sin(t * 0.7) * 0.06;
  };
  body.scale.setScalar(shape === 'yoda' ? 1.05 : 1.12);
  g.add(body);
  g.userData.body = body;
  return g;
}

/* ---------- buildings: Puesto → Base → Fortaleza, in the owner's colour ---------- */
function vaporator(own, h = 0.62) {
  const v = new THREE.Group(), s = metal('#B8BEC6', 0.35), d = std('#3A3F47', { metalness: 0.5, roughness: 0.4 });
  v.add(cyl(0.07, 0.09, 0.08, d, 0, 0.04, 0, 12), cyl(0.032, 0.04, h, s, 0, h / 2 + 0.06, 0, 12));
  [0.3, 0.48, 0.66].forEach(k => v.add(torus(0.05, 0.012, d, 0, h * k + 0.06, 0, 18)));
  v.children.slice(-3).forEach(r => { r.rotation.x = Math.PI / 2; });
  for (let i = 0; i < 3; i++) { const f = box(0.012, h * 0.4, 0.1, s, 0, h * 0.55, 0); f.rotation.y = (i / 3) * Math.PI; v.add(f); }
  v.add(cyl(0.05, 0.03, 0.05, own, 0, h + 0.09, 0, 12));
  const tip = ball(0.016, glow('#FFFFFF', 3), 0, h + 0.13, 0, 8, 6); tip.userData.blink = true; v.add(tip);
  return v;
}
function domeHut(r, own, wall) {
  const g = new THREE.Group();
  const d = mesh(new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), wall, 0, 0, 0); d.scale.y = 0.82; g.add(d);
  const band = torus(r * 0.98, 0.018, own, 0, 0.02, 0, 30); band.rotation.x = Math.PI / 2; g.add(band);
  const door = new THREE.Group(); door.position.set(0, 0, r * 0.82);
  door.add(cyl(r * 0.36, r * 0.36, r * 0.36, wall, 0, r * 0.2, 0.02, 14)); door.children[0].rotation.x = Math.PI / 2;
  door.add(box(r * 0.36, r * 0.42, 0.02, std('#2A2420'), 0, r * 0.2, r * 0.2));
  g.add(door);
  return g;
}
function shuttle(own) {
  const s = new THREE.Group(), w = std('#E4E6EA', { roughness: 0.45, metalness: 0.3 });
  s.add(box(0.2, 0.06, 0.1, w, 0, 0, 0), cone(0.05, 0.08, w, 0.13, 0, 0, 10));
  s.children[1].rotation.z = -Math.PI / 2;
  const fin = box(0.012, 0.14, 0.08, w, -0.03, 0.09, 0); s.add(fin);
  [-1, 1].forEach(k => { const wing = box(0.012, 0.1, 0.07, w, -0.02, 0.03, k * 0.07); wing.rotation.x = k * 0.9; s.add(wing); });
  s.add(box(0.03, 0.04, 0.06, own, -0.1, 0.0, 0), glowSprite('#7FD3FF', 0.12));
  s.children[s.children.length - 1].position.x = -0.13;
  return s;
}

export function makeBuilding(stage, color) {
  const g = new THREE.Group(), own = std(color, { roughness: 0.5, emissive: color, emissiveIntensity: 0.45 }), wall = std('#E7D7B8', { roughness: 0.9 }), wall2 = std('#CDB892', { roughness: 0.95 }), dark = std('#2C2F36', { metalness: 0.5, roughness: 0.45 });
  const pad = (r, x, z) => { const p = new THREE.Group(); p.add(cyl(r, r * 1.05, 0.03, dark, 0, 0.015, 0, 6)); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + Math.PI / 6, l = ball(0.014, glow(color, 3), Math.cos(a) * r * 0.86, 0.035, Math.sin(a) * r * 0.86, 6, 4); l.userData.blink = true; p.add(l); } p.position.set(x, 0, z); return p; };
  const banner = (x, z, h) => {
    g.add(cyl(0.012, 0.012, h, dark, x, h / 2, z, 6));
    const f = mesh(new THREE.PlaneGeometry(0.1, 0.24).translate(0.05, -0.12, 0), new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.7, emissive: color, emissiveIntensity: 0.25 }), x + 0.005, h, z);
    f.userData.flag = true; g.add(f);
  };
  if (stage === 1) {
    g.add(pad(0.26, 0.1, 0.06));
    const v = vaporator(own, 0.6); v.position.set(-0.3, 0, -0.12); g.add(v);
    [[0.32, -0.26, 0.4], [0.42, -0.18, -0.3], [0.3, -0.12, 1.1]].forEach(q => { const c = box(0.09, 0.08, 0.09, wall2, q[0], 0.04, q[1]); c.rotation.y = q[2]; g.add(c); });
    g.add(box(0.1, 0.03, 0.1, own, 0.32, 0.095, -0.26));
    banner(-0.38, 0.28, 0.62);
  } else if (stage === 2) {
    const hut = domeHut(0.3, own, wall); hut.position.set(-0.08, 0, 0); hut.rotation.y = 0.3; g.add(hut);
    g.add(box(0.06, 0.06, 0.012, glow('#FFD58A', 2), -0.24, 0.12, 0.2));
    const small = domeHut(0.16, own, wall2); small.position.set(0.32, 0, -0.18); small.rotation.y = -0.6; g.add(small);
    const v = vaporator(own, 0.5); v.position.set(0.36, 0, 0.26); g.add(v);
    const dish = mesh(new THREE.SphereGeometry(0.09, 14, 8, 0, Math.PI * 2, 0, 1.0), new THREE.MeshStandardMaterial({ color: '#E2E4E8', side: THREE.DoubleSide, roughness: 0.4, metalness: 0.4 }), -0.08, 0.38, -0.06); dish.rotation.x = 2.2; g.add(dish, cyl(0.01, 0.014, 0.16, dark, -0.08, 0.3, -0.06, 6));
    banner(-0.42, -0.3, 0.7);
  } else {
    const big = domeHut(0.36, own, wall); big.position.set(-0.12, 0, 0.04); g.add(big);
    const tower = new THREE.Group(); tower.position.set(0.3, 0, -0.16);
    tower.add(cyl(0.12, 0.15, 0.62, wall2, 0, 0.31, 0, 16), cyl(0.17, 0.12, 0.08, dark, 0, 0.66, 0, 16), cyl(0.06, 0.08, 0.16, wall, 0, 0.78, 0, 12));
    for (let k = 0; k < 3; k++) { const r = torus(0.135, 0.012, own, 0, 0.16 + k * 0.17, 0, 24); r.rotation.x = Math.PI / 2; tower.add(r); }
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; tower.add(box(0.04, 0.03, 0.01, glow('#FFD58A', 2.2), Math.sin(a) * 0.166, 0.66, Math.cos(a) * 0.166)); tower.children[tower.children.length - 1].rotation.y = a; }
    const mast = cyl(0.008, 0.012, 0.36, dark, 0, 1.04, 0, 6); tower.add(mast);
    const tip = ball(0.022, glow(color, 4), 0, 1.23, 0, 8, 6); tip.userData.blink = true; tower.add(tip);
    g.add(tower);
    g.add(pad(0.2, 0.16, 0.36));
    const sh = shuttle(own); sh.position.set(0.16, 0.08, 0.36); sh.rotation.y = 0.6; sh.scale.setScalar(1.2); g.add(sh);
    const v = vaporator(own, 0.44); v.position.set(-0.46, 0, -0.3); g.add(v);
    banner(-0.46, 0.36, 0.86);
    const h = glowSprite(color, 2.4); h.position.set(0, 0.5, 0); h.material.opacity = 0.28; g.add(h);
  }
  return g;
}

/* ---------- ships for the four channel tiles ---------- */
function falcon() {
  const s = new THREE.Group(), hull = std('#C7CACE', { roughness: 0.55, metalness: 0.25 }), panel = std('#9EA3AA', { roughness: 0.6 }), dark = std('#3B3F46', { roughness: 0.5 });
  s.add(cyl(0.3, 0.32, 0.05, hull, 0, 0, 0, 40), cyl(0.24, 0.3, 0.03, panel, 0, 0.04, 0, 40), cyl(0.24, 0.3, 0.03, panel, 0, -0.04, 0, 40));
  s.add(cyl(0.08, 0.1, 0.03, dark, 0, 0.07, 0, 20));
  [-1, 1].forEach(k => s.add(box(0.26, 0.04, 0.08, hull, 0.34, 0, k * 0.075)));
  const tube = cyl(0.04, 0.04, 0.2, hull, 0.18, 0, 0.3, 14); tube.rotation.z = Math.PI / 2; s.add(tube);
  s.add(ball(0.05, std('#2B3038', { roughness: 0.1, metalness: 0.5 }), 0.28, 0, 0.3, 14, 10));
  const dish = mesh(new THREE.SphereGeometry(0.06, 14, 8, 0, Math.PI * 2, 0, 1.1), new THREE.MeshStandardMaterial({ color: '#D8DADD', side: THREE.DoubleSide }), -0.04, 0.12, -0.12); dish.rotation.x = 2.4; s.add(dish);
  const eng = box(0.02, 0.03, 0.42, glow('#7FD3FF', 3), -0.31, 0, 0); s.add(eng);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; s.add(box(0.06, 0.012, 0.02, dark, Math.cos(a) * 0.2, 0.058, Math.sin(a) * 0.2)); s.children[s.children.length - 1].rotation.y = -a; }
  return s;
}
function xwing() {
  const s = new THREE.Group(), hull = std('#E6E7E9', { roughness: 0.5, metalness: 0.2 }), red = std('#C8312E', { roughness: 0.5 }), dark = std('#3B3F46');
  const body = box(0.5, 0.07, 0.08, hull, 0, 0, 0); s.add(body);
  const nose = cone(0.05, 0.2, hull, 0.34, 0, 0, 4); nose.rotation.set(Math.PI / 4, 0, -Math.PI / 2); s.add(nose);
  s.add(box(0.1, 0.05, 0.06, std('#2B3038', { roughness: 0.1, metalness: 0.5 }), 0.06, 0.05, 0), box(0.2, 0.072, 0.012, red, 0.16, 0, 0.042));
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([u, v]) => {
    const w = new THREE.Group(); w.rotation.x = u * v * 0.24 + (v > 0 ? 0 : Math.PI);
    w.add(box(0.2, 0.012, 0.32, hull, -0.1, 0.035 * u, 0.18), box(0.2, 0.014, 0.05, red, -0.1, 0.035 * u, 0.14));
    const can = cyl(0.012, 0.012, 0.36, dark, 0.02, 0.035 * u, 0.34, 8); can.rotation.z = Math.PI / 2; w.add(can);
    const eng = cyl(0.035, 0.035, 0.14, hull, -0.14, 0.035 * u + 0.03 * u, 0.06, 12); eng.rotation.z = Math.PI / 2; w.add(eng);
    const fire = ball(0.028, glow('#FF8A5C', 3), -0.215, 0.035 * u + 0.03 * u, 0.06, 8, 6); w.add(fire);
    s.add(w);
  });
  s.rotation.x = 0.1;
  return s;
}
function tie() {
  const s = new THREE.Group(), grey = std('#8E949C', { roughness: 0.45, metalness: 0.4 }), panel = std('#1B1E25', { roughness: 0.5, metalness: 0.3 });
  s.add(ball(0.1, grey, 0, 0, 0, 20, 14));
  const win = mesh(new THREE.CircleGeometry(0.05, 8), std('#0C0E12', { roughness: 0.1, metalness: 0.6 }), 0.1, 0, 0); win.rotation.y = Math.PI / 2; s.add(win);
  [-1, 1].forEach(k => {
    const py = cyl(0.025, 0.035, 0.2, grey, 0, 0, k * 0.15, 10); py.rotation.x = Math.PI / 2; s.add(py);
    const wing = cyl(0.27, 0.27, 0.015, panel, 0, 0, k * 0.25, 6); wing.rotation.x = Math.PI / 2; wing.rotation.y = Math.PI / 6; s.add(wing);
    const frame = torus(0.26, 0.012, grey, 0, 0, k * 0.252, 6); frame.rotation.z = Math.PI / 6; s.add(frame);
    for (let i = 0; i < 3; i++) { const sp = box(0.5, 0.01, 0.01, grey, 0, 0, k * 0.26); sp.rotation.z = (i / 3) * Math.PI + Math.PI / 6 + Math.PI / 2; s.add(sp); }
    s.add(cyl(0.05, 0.05, 0.02, grey, 0, 0, k * 0.26, 12)); s.children[s.children.length - 1].rotation.x = Math.PI / 2;
  });
  return s;
}
function destroyer() {
  const s = new THREE.Group(), hull = std('#BFC3C9', { roughness: 0.5, metalness: 0.35 }), dark = std('#5E646C', { roughness: 0.5 });
  const top = slab([[0.46, 0], [-0.3, 0.26], [-0.3, -0.26]], 0.05, hull, 0.004); s.add(top);
  const mid = slab([[0.4, 0], [-0.28, 0.22], [-0.28, -0.22]], 0.05, dark, 0.004); mid.position.y = -0.05; s.add(mid);
  const low = slab([[0.44, 0], [-0.3, 0.24], [-0.3, -0.24]], 0.035, hull, 0.004); low.position.y = -0.09; s.add(low);
  s.add(box(0.2, 0.06, 0.24, hull, -0.18, 0.08, 0), box(0.08, 0.1, 0.08, hull, -0.22, 0.15, 0), box(0.05, 0.02, 0.22, hull, -0.22, 0.21, 0));
  [-1, 1].forEach(k => s.add(ball(0.025, hull, -0.22, 0.24, k * 0.09, 10, 8)));
  [-0.12, 0, 0.12].forEach(z => { const e = cyl(0.04, 0.04, 0.03, glow('#8FD8FF', 3), -0.31, -0.02, z, 14); e.rotation.z = Math.PI / 2; s.add(e); });
  for (let i = 0; i < 9; i++) s.add(box(0.05, 0.012, 0.012, dark, 0.3 - i * 0.06, 0.056, (Math.random() - 0.5) * (0.04 + i * 0.03)));
  return s;
}

/* ---------- props on the special tiles ---------- */
export function makeProp(t, i, ctx) {
  const p = new THREE.Group(), { anim, bannerTexture, GEO } = ctx, dark = std('#22262E', { metalness: 0.5, roughness: 0.45 }), steel = metal('#B7BEC8', 0.3);
  if (t.type === 'kickoff') {
    /* a hyperspace gate: a ring with lights and a tunnel of stretched stars turning inside */
    const gate = new THREE.Group();
    gate.add(cyl(0.12, 0.16, 0.12, dark, -0.82, 0.06, 0, 10), cyl(0.12, 0.16, 0.12, dark, 0.82, 0.06, 0, 10));
    const ring = torus(0.82, 0.07, steel, 0, 0.92, 0, 48); gate.add(ring);
    const inner = torus(0.72, 0.025, std('#3A3F48', { metalness: 0.6, roughness: 0.3 }), 0, 0.92, 0, 48); gate.add(inner);
    for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2, l = ball(0.025, glow('#FFE81F', 3), Math.cos(a) * 0.82, 0.92 + Math.sin(a) * 0.82, 0.07, 6, 4); if (k % 2) l.userData.blink = true; gate.add(l); }
    const [c, x] = canvas(256, 256);
    const gr = x.createRadialGradient(128, 128, 4, 128, 128, 128); gr.addColorStop(0, '#DFF4FF'); gr.addColorStop(0.2, '#4FA8E8'); gr.addColorStop(0.7, '#0E2550'); gr.addColorStop(1, '#050B1E'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
    x.strokeStyle = 'rgba(210,236,255,.55)'; x.lineCap = 'round';
    for (let k = 0; k < 90; k++) { const a = Math.random() * 7, r0 = 10 + Math.random() * 40, r1 = r0 + 30 + Math.random() * 70; x.lineWidth = 1 + Math.random() * 2; x.beginPath(); x.moveTo(128 + Math.cos(a) * r0, 128 + Math.sin(a) * r0); x.lineTo(128 + Math.cos(a) * r1, 128 + Math.sin(a) * r1); x.stroke(); }
    const tunnel = mesh(new THREE.CircleGeometry(0.71, 40), new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, opacity: 0.85, side: THREE.DoubleSide }), 0, 0.92, 0);
    gate.add(tunnel);
    const ban = mesh(new THREE.PlaneGeometry(1.4, 0.3), new THREE.MeshBasicMaterial({ map: bannerTexture('HIPERESPACIO', '#05070D', '#FFE81F'), side: THREE.DoubleSide, toneMapped: false }), 0, 0.1, 0.0);
    ban.position.set(0, 0.24, 0.02); gate.add(ban);
    anim.push(tm => { tunnel.rotation.z = tm * 1.8; });
    gate.position.set(0, 0, GEO.LANE - GEO.PLOT);
    p.add(gate);
    for (let k = 0; k < 3; k++) { const c2 = cyl(0.17, 0.17, 0.05, metal('#C9CED6'), -0.3 + k * 0.3, 0, 0.1 * (k % 2), 8); c2.scale.y = 1 + (k === 1 ? 3 : k); c2.position.y = 0.025 * c2.scale.y; p.add(c2); }
  } else if (t.type === 'signal') {
    /* holoprojector: a small pedestal throwing a flickering blue figure */
    p.add(cyl(0.22, 0.28, 0.1, dark, 0, 0.05, 0, 16), cyl(0.12, 0.16, 0.12, steel, 0, 0.16, 0, 16), cyl(0.06, 0.08, 0.04, glow('#7FD3FF', 3), 0, 0.24, 0, 16));
    const holoMat = new THREE.MeshBasicMaterial({ color: '#8FDFFF', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
    const beam = cone(0.26, 0.7, new THREE.MeshBasicMaterial({ color: '#7FD3FF', transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), 0, 0.6, 0, 20);
    beam.rotation.x = Math.PI; p.add(beam);
    const fig = new THREE.Group();
    fig.add(lathe([[0.001, 0], [0.11, 0], [0.09, 0.2], [0.06, 0.32], [0.001, 0.34]], holoMat, 16), ball(0.05, holoMat, 0, 0.38, 0, 12, 8));
    const hoodR = mesh(new THREE.SphereGeometry(0.062, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), holoMat, 0, 0.39, -0.008); fig.add(hoodR);
    fig.position.y = 0.3; p.add(fig);
    anim.push(tm => { const f = Math.sin(tm * 40 + i) > 0.92 ? 0.15 : 0.5; holoMat.opacity = f; fig.rotation.y = tm * 0.6; fig.position.x = Math.sin(tm * 33) > 0.97 ? 0.015 : 0; });
  } else if (t.type === 'brain') {
    /* a holocron: a glowing cube with a lattice, floating over a stone plinth */
    p.add(cyl(0.22, 0.3, 0.2, std('#5C6066', { flatShading: true, roughness: 0.8 }), 0, 0.1, 0, 6), cyl(0.18, 0.22, 0.06, std('#7A7E85', { flatShading: true }), 0, 0.23, 0, 6));
    const holo = new THREE.Group();
    holo.add(box(0.2, 0.2, 0.2, new THREE.MeshStandardMaterial({ color: '#BFEFFF', emissive: '#4FB8FF', emissiveIntensity: 2.2, roughness: 0.2, transparent: true, opacity: 0.92 })));
    holo.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.26, 0.26, 0.26)), new THREE.LineBasicMaterial({ color: '#E8FBFF' })));
    [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach(a => { const r = torus(0.17, 0.006, glow('#9FE0FF', 2), 0, 0, 0, 30); r.rotation.set(a[0] * Math.PI / 2, a[1] * Math.PI / 2, 0); holo.add(r); });
    holo.add(glowSprite('#7FD3FF', 0.9));
    holo.position.y = 0.66; p.add(holo);
    anim.push(tm => { holo.rotation.set(tm * 0.6, tm * 0.8, 0.6); holo.position.y = 0.66 + Math.sin(tm * 1.6 + i) * 0.05; });
  } else if (t.type === 'spam') {
    /* carbonite: the frozen slab standing on its sled, with the relief of someone inside */
    const slabG = new THREE.Group(), carb = std('#5D6168', { metalness: 0.75, roughness: 0.38, envMapIntensity: 1.2 }), carb2 = std('#4A4E55', { metalness: 0.75, roughness: 0.42 });
    slabG.add(box(0.5, 0.82, 0.14, carb, 0, 0.41, 0));
    slabG.add(box(0.12, 0.3, 0.02, carb2, -0.16, 0.6, 0.075), box(0.12, 0.3, 0.02, carb2, 0.16, 0.25, 0.075));
    const relief = std('#6E737B', { metalness: 0.7, roughness: 0.35 });
    const face = ball(0.07, relief, 0, 0.58, 0.075, 14, 10); face.scale.set(0.9, 1.1, 0.5); slabG.add(face);
    [[-0.12, 0.66, 0.4], [0.12, 0.64, -0.5]].forEach(q => { const hand = ball(0.045, relief, q[0], q[1], 0.08, 10, 8); hand.scale.set(0.8, 1.1, 0.5); hand.rotation.z = q[2]; slabG.add(hand); });
    const torso = ball(0.11, relief, 0, 0.38, 0.07, 14, 10); torso.scale.set(1, 1.5, 0.4); slabG.add(torso);
    [[-0.2, 0.2, '#FF4A3A'], [-0.2, 0.26, '#3A9BFF'], [0.2, 0.22, '#FF4A3A']].forEach(q => { const l = box(0.04, 0.03, 0.02, glow(q[2], 3), q[0], q[1], 0.075); l.userData.blink = true; slabG.add(l); });
    slabG.add(box(0.56, 0.06, 0.2, dark, 0, 0.03, 0));
    slabG.rotation.x = -0.12; slabG.position.y = 0.06;
    p.add(cyl(0.3, 0.32, 0.05, dark, 0, 0.025, 0, 18), slabG);
    const steam = [0, 1, 2].map(k => { const s = ball(0.06, new THREE.MeshStandardMaterial({ color: '#DCE6F0', transparent: true, opacity: 0.4, flatShading: true }), 0, 0.9, 0, 8, 6); p.add(s); return s; });
    anim.push(tm => steam.forEach((s, k) => { const u = (tm * 0.3 + k / 3) % 1; s.position.set(Math.sin(k * 2 + tm) * 0.1, 0.86 + u * 0.5, 0.05); s.scale.setScalar(0.6 + u * 1.6); s.material.opacity = 0.4 * (1 - u); }));
  } else if (t.type === 'board') {
    /* an imperial probe droid hovering over the tax tile */
    const droid = new THREE.Group(), blk = std('#121418', { metalness: 0.6, roughness: 0.35, envMapIntensity: 1.2 });
    droid.add(ball(0.16, blk, 0, 0, 0, 20, 14));
    const head = mesh(new THREE.SphereGeometry(0.12, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), blk, 0, 0.1, 0); droid.add(head);
    [[0.06, 0.12], [-0.05, 0.1], [0, -0.08]].forEach((q, k) => droid.add(cyl(0.004, 0.004, 0.3 + k * 0.08, steel, q[0], 0.3 + k * 0.04, q[1], 4)));
    [[0, 0.02, 0.15], [0.07, -0.02, 0.13], [-0.07, -0.02, 0.13]].forEach(q => { const e = ball(0.022, glow('#FF3B30', 3.4), q[0], q[1], q[2], 8, 6); e.userData.blink = true; droid.add(e); });
    const legs = [];
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2, l = new THREE.Group(); l.position.set(Math.cos(a) * 0.1, -0.12, Math.sin(a) * 0.1); l.add(cyl(0.007, 0.004, 0.3, steel, 0, -0.15, 0, 4), ball(0.014, steel, 0, -0.3, 0, 6, 4)); droid.add(l); legs.push(l); }
    droid.position.y = 0.82; p.add(droid);
    p.add(cyl(0.2, 0.26, 0.04, dark, 0, 0.02, 0, 16));
    const g2 = glowSprite('#FF3B30', 0.5); g2.position.y = 0.06; g2.material.opacity = 0.5; p.add(g2);
    anim.push(tm => { droid.position.y = 0.82 + Math.sin(tm * 1.4 + i) * 0.06; droid.rotation.y = Math.sin(tm * 0.5) * 1.2; legs.forEach((l, k) => { l.rotation.x = Math.sin(tm * 1.8 + k) * 0.25; l.rotation.z = Math.cos(tm * 1.5 + k) * 0.2; }); });
  } else if (t.type === 'channel') {
    /* the four ships, hovering over a landing stand whose lights take the owner's colour */
    const stand = new THREE.Group(), ringMat = std('#3A3F48', { roughness: 0.45, metalness: 0.5, emissive: '#000000' });
    ringMat.userData.base = '#3A3F48';
    stand.add(cyl(0.34, 0.38, 0.05, dark, 0, 0.025, 0, 6), cyl(0.3, 0.3, 0.02, ringMat, 0, 0.06, 0, 6), cyl(0.03, 0.05, 0.4, steel, 0, 0.26, 0, 8));
    p.add(stand);
    const ship = { falcon, xwing, tie, destroyer }[t.icon]();
    ship.scale.setScalar(t.icon === 'tie' ? 1.0 : t.icon === 'destroyer' ? 1.15 : 1.05);
    const holder = new THREE.Group(); holder.add(ship); holder.position.y = 0.66; p.add(holder);
    p.userData.tint = [ringMat];
    anim.push(tm => { holder.position.y = 0.66 + Math.sin(tm * 1.3 + i) * 0.04; holder.rotation.y = Math.PI / 2 + Math.sin(tm * 0.4 + i) * 0.5; holder.rotation.z = Math.sin(tm * 0.9 + i) * 0.06; });
  }
  return p;
}

/* ---------- flat icons drawn on the tiles and the decks ---------- */
export function icon(x, kind, cx, cy, s, col) {
  x.save();
  x.translate(cx, cy);
  x.scale(s / 100, s / 100);
  x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 8; x.lineCap = 'round'; x.lineJoin = 'round';
  const line = (...p) => { x.beginPath(); x.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) x.lineTo(p[i], p[i + 1]); x.stroke(); };
  const circ = (a, b, r, fill) => { x.beginPath(); x.arc(a, b, r, 0, 7); fill ? x.fill() : x.stroke(); };
  if (kind === 'kickoff') { circ(0, 0, 44); x.lineWidth = 5; for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; line(Math.cos(a) * 10, Math.sin(a) * 10, Math.cos(a) * 34, Math.sin(a) * 34); } }
  else if (kind === 'signal') { x.lineWidth = 7; line(-34, 46, 34, 46); line(-18, 46, -12, 30, 12, 30, 18, 46); x.lineWidth = 4; x.globalAlpha = 0.85; x.beginPath(); x.moveTo(-12, 30); x.lineTo(-30, -36); x.lineTo(30, -36); x.lineTo(12, 30); x.stroke(); x.globalAlpha = 1; circ(0, -12, 10, true); line(-12, 16, 0, -2, 12, 16); }
  else if (kind === 'brain') { x.lineWidth = 7; line(-30, -16, 0, -34, 30, -16, 30, 20, 0, 38, -30, 20, -30, -16); line(-30, -16, 0, 2, 30, -16); line(0, 2, 0, 38); x.lineWidth = 3; circ(0, 2, 8, true); }
  else if (kind === 'spam') { rr(x, -30, -46, 60, 92, 6); x.stroke(); x.lineWidth = 6; circ(0, -14, 11); line(-20, -34, -24, -8); line(20, -30, 24, -6); line(-14, 6, 0, 18, 14, 6); }
  else if (kind === 'board') { circ(0, -6, 26); x.lineWidth = 5; line(-10, 22, -16, 48); line(0, 22, 0, 50); line(10, 22, 16, 48); line(-14, -30, -22, -52); line(12, -30, 18, -50); circ(-8, -8, 5, true); circ(8, -8, 5, true); }
  else if (kind === 'falcon') { circ(-6, 0, 34); line(26, -12, 50, -12); line(26, 12, 50, 12); circ(-6, 0, 10); line(12, 30, 26, 44); }
  else if (kind === 'xwing') { line(-46, -40, 46, 40); line(-46, 40, 46, -40); x.lineWidth = 12; line(0, -10, 0, 10); }
  else if (kind === 'tie') { x.lineWidth = 7; line(-44, -44, -44, 44); line(44, -44, 44, 44); line(-44, 0, 44, 0); circ(0, 0, 16); x.fillStyle = '#05070D'; circ(0, 0, 9, true); }
  else if (kind === 'destroyer') { line(50, 0, -40, -34, -40, 34, 50, 0); line(-40, -10, -54, -10, -54, 10, -40, 10); line(-20, -14, -20, 14); }
  x.restore();
}

export { falcon, xwing, tie, destroyer, shuttle, vaporator, domeHut };
