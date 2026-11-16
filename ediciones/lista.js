/* Las ediciones del juego. «ready» = ya se puede jugar; las demás salen en el selector como «próximamente». */
export const DEFAULT = 'starwars';
export const EDITIONS = [
  { id: 'starwars', name: 'Star Wars', color: '#FFE81F', blurb: 'La conquista de la galaxia', ready: true },
  { id: 'marvel', name: 'Marvel', color: '#E23636', blurb: 'Los Vengadores', ready: false },
  { id: 'demonslayer', name: 'Demon Slayer', color: '#2E8B6E', blurb: 'Cazadores contra Lunas Superiores', ready: false }
];
