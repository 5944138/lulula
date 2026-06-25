/** Wire Legends — historia colectiva que tu ciudad desbloquea escribiendo en el IRC */

export type LegendChapter = {
  id: number;
  title: string;
  subtitle: string;
  /** Mensajes en la sala de ciudad necesarios para desbloquear */
  threshold: number;
  lines: string[];
  reward: string;
};

export const WIRE_LEGENDS: LegendChapter[] = [
  {
    id: 1,
    title: 'El Primer Oink',
    subtitle: 'Antes del algoritmo, solo había texto verde',
    threshold: 12,
    reward: '+20 🪙 al desbloquear',
    lines: [
      '> CONEXIÓN ESTABLECIDA — AÑO ??',
      '> Un cerdo cruzó el cable coaxial.',
      '> Nadie sabía si era virus o profecía.',
      '> Los primeros escribieron "oink" por reflejo.',
      '> El reflejo respondió.',
      '> Así nació Lulula — no como app, sino como eco.',
    ],
  },
  {
    id: 2,
    title: 'Las Ciudades Despiertan',
    subtitle: 'Tokyo parpadeó. CDMX contestó.',
    threshold: 35,
    reward: 'Capítulo 2 en La Dimensión',
    lines: [
      '> Cada ciudad abrió un canal propio.',
      '> No era geografía — era VIBRA.',
      '> Quien escribía de noche encontraba tribu.',
      '> Los impostores fingían tareas. Los night owls fingían dormir.',
      '> El wire no olvida.',
    ],
  },
  {
    id: 3,
    title: 'La Oink Wave',
    subtitle: 'Cuando el chat dejó de ser chat',
    threshold: 60,
    reward: 'Título: Portador del Hocico',
    lines: [
      '> Llegó la primera Wave.',
      '> Los mensajes dejaron de ser palabras.',
      '> Se volvieron jugadas.',
      '> Las ciudades pelearon con emojis como armas.',
      '> El ganador no fue el más rápido — fue el más caótico.',
      '> [TÚ ESTÁS AQUÍ]',
    ],
  },
  {
    id: 4,
    title: 'La Dimensión Oink',
    subtitle: 'Detrás del WhatsApp hay un universo',
    threshold: 100,
    reward: 'Canvas legendario desbloqueado',
    lines: [
      '> Alguien miró demasiado tiempo la lista de chats.',
      '> La lista miró de vuelta.',
      '> Cada mensaje pintó un píxel en la oscuridad.',
      '> El canvas creció sin permiso.',
      '> Si lees esto, ya entraste.',
      '> Bienvenido a la otra capa.',
    ],
  },
];

export const POSSESSION_LINES = [
  'Lulula susurra: el próximo mensaje define tu tribu.',
  'Un cerdo cruza tu pantalla. No cierres los ojos.',
  'El wire tiene hambre. Alimenta con oink.',
  'Alguien en tu ciudad acaba de mentir. El chat lo sabe.',
  'Esta noche el algoritmo duerme. Solo queda IRC.',
  'Tu ciudad necesita 3 oinks sincronizados. Ahora.',
];

export function getPossessionLine(seed: number): string {
  return POSSESSION_LINES[Math.abs(seed) % POSSESSION_LINES.length];
}
