/* Juego de sagas · piezas 3D comunes que usan el tablero y todas las ediciones */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export { THREE, mergeGeometries, RoundedBoxGeometry };

export const easeIO = k => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
export const easeOut = k => 1 - Math.pow(1 - k, 3);
export const backOut = k => 1 + 2.7 * Math.pow(k - 1, 3) + 1.7 * Math.pow(k - 1, 2);
export const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; }

export const std = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.82, metalness: 0, envMapIntensity: 0.35 }, o));
export const glow = (color, k = 3) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: k, roughness: 0.4 });
export const metal = (color, rough = 0.28) => new THREE.MeshStandardMaterial({ color, metalness: 0.9, roughness: rough, envMapIntensity: 1.1 });
export const basic = (color, o = {}) => new THREE.MeshBasicMaterial(Object.assign({ color }, o));

export function mesh(geo, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; }
export function shadow(m, cast = true, receive = true) { m.traverse(o => { if (o.isMesh) { o.castShadow = cast; o.receiveShadow = receive; } }); return m; }
export const box = (w, h, d, m, x = 0, y = 0, z = 0) => mesh(new THREE.BoxGeometry(w, h, d), m, x, y, z);
export const cyl = (r0, r1, h, m, x = 0, y = 0, z = 0, seg = 14) => mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m, x, y, z);
export const ball = (r, m, x = 0, y = 0, z = 0, w = 16, h = 12) => mesh(new THREE.SphereGeometry(r, w, h), m, x, y, z);
export const cone = (r, h, m, x = 0, y = 0, z = 0, seg = 14) => mesh(new THREE.ConeGeometry(r, h, seg), m, x, y, z);
export const torus = (r, t, m, x = 0, y = 0, z = 0, seg = 32) => mesh(new THREE.TorusGeometry(r, t, 8, seg), m, x, y, z);
export const group = (...kids) => { const g = new THREE.Group(); kids.forEach(k => k && g.add(k)); return g; };

/* ---------- canvas ---------- */
export function tex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
export function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
export function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }

export function glowSprite(color, size) {
  const [c, x] = canvas(128, 128), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, color); g.addColorStop(0.25, color + 'AA'); g.addColorStop(1, color + '00');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(c), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
  s.scale.setScalar(size);
  return s;
}

/* a lathe from a list of [radius, y] points: bodies, robes, helmets */
export function lathe(points, m, seg = 24) {
  return new THREE.Mesh(new THREE.LatheGeometry(points.map(p => new THREE.Vector2(p[0], p[1])), seg), m);
}

/* a flat shape extruded upwards from a list of [x, z] points */
export function slab(points, depth, m, bevel = 0.01) {
  const s = new THREE.Shape();
  points.forEach((p, i) => (i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])));
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1 });
  g.rotateX(-Math.PI / 2);
  return new THREE.Mesh(g, m);
}

/* the round stand every player piece sits on: dark disc, a band in the player's colour and a metal rim */
export function tokenStand(color, rim = '#C9CCD3', dark = '#14161C') {
  const g = new THREE.Group(), own = std(color, { roughness: 0.35, metalness: 0.25, envMapIntensity: 0.9, emissive: color, emissiveIntensity: 0.15 });
  g.add(cyl(0.3, 0.35, 0.1, std(dark, { roughness: 0.5 }), 0, 0.05, 0, 28), cyl(0.27, 0.27, 0.05, own, 0, 0.12, 0, 28));
  const r = torus(0.3, 0.02, metal(rim), 0, 0.1, 0); r.rotation.x = Math.PI / 2; g.add(r);
  return g;
}
