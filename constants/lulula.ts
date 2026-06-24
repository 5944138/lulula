/** Lulula — cerdita mascota y logo oficial */

export type LululaMood = 'happy' | 'wink' | 'phone' | 'play' | 'think' | 'excited';

/** @deprecated use LululaMood */
export type LolaMood = LululaMood;

export const LULULA = {
  name: 'Lulula',
  fullName: 'Lulula',
  species: 'cerdita',
  personality: 'Caótica, adorable, imposible de ignorar.',
  catchphrase: '¡Oink viral! Entra, juega, comparte.',
  colors: {
    body: '#FF9EC7',
    bodyLight: '#FFB8D9',
    snout: '#FFC9E3',
    blush: '#FF6B9D44',
    ear: '#FF85B8',
    eye: '#2D1B2E',
    highlight: '#FFFFFF',
    phone: '#BF00FF',
  },
} as const;

/** @deprecated use LULULA */
export const LOLA = LULULA;

export const LULULA_GREETINGS = [
  '¡Hola! Soy Lulula. ¿Viral o qué?',
  'Oink oink — hoy brillo más que tu feed.',
  'Gana monedas, compra skins, presume a Lulula.',
  'Chat en vivo + arcade. Todo en una cerdita.',
  '¿Impostor o constructor? Yo soy icono.',
];

export function getDailyGreeting(): string {
  const day = Math.floor(Date.now() / 86400000);
  return LULULA_GREETINGS[day % LULULA_GREETINGS.length];
}
