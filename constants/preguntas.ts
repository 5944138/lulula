/** 30 preguntas — una por día, rotación por fecha (CDMX) */

export const PREGUNTAS: readonly string[] = [
  'Si pudieras gritarle una palabra a tu yo de hace 5 años, ¿cuál sería?',
  'En una palabra: ¿qué extrañas de Minatitlán de cuando eras niño?',
  '¿Qué palabra describe cómo te sientes hoy y no le has dicho a nadie?',
  'Una palabra para alguien que ya no está.',
  'Si el Coatzacoalcos pudiera hablar esta noche, ¿qué diría?',
  '¿Qué olor de la Mina te regresa a un lugar que ya no existe?',
  'En una palabra: ¿qué te dio la ciudad que ningún otro lado te ha dado?',
  '¿Qué palabra le pondrías al verano en Minatitlán cuando todo el mundo está afuera?',
  'Si tu cuadra entera gritara lo mismo a medianoche, ¿qué sería?',
  'Una palabra para el profe o la profe que nunca olvidaste.',
  '¿Qué guardas en el pecho que solo sale cuando llueve en la Mina?',
  'En una palabra: ¿qué significa "estar en casa" para ti hoy?',
  '¿Qué palabra usarías para describir la última vez que te reíste de verdad?',
  'Si pudieras renombrar Minatitlán por una noche, ¿cómo se llamaría?',
  'Una palabra para el antojo que te pega a las 11pm y no hay quien te entienda.',
  '¿Qué canción vive en tu cabeza aunque no la hayas escuchado en años? Dila en UNA palabra.',
  'En una palabra: ¿qué le dirías al Minatitlán de tu generación?',
  '¿Qué palabra te quedó clavada de una despedida que no supiste decir?',
  'Si todo el puerto respirara al mismo tiempo, ¿qué palabra saldría?',
  'Una palabra para el amor que no fue pero te marcó.',
  '¿Qué extrañas del mercado, la plaza o la esquina donde siempre te veías?',
  'En una palabra: ¿qué te da miedo admitir en voz alta?',
  '¿Qué palabra resumiría tu relación con esta ciudad: amor, rabia o las dos?',
  'Una palabra para lo que sueñas cuando piensas en irte… o en quedarte.',
  'Si los árboles del boulevard supieran tus secretos, ¿cuál repetirían?',
  '¿Qué palabra describe el silencio de Minatitlán a las 3 de la mañana?',
  'En una palabra: ¿qué le pedirías al río si te escuchara?',
  '¿Qué palabra usarías para el amigo que ya no habla contigo pero aún lo extrañas?',
  'Una palabra para el futuro que te imaginas lejos del calor de aquí.',
  'Si toda la Mina respondiera honestamente esta pregunta, ¿qué palabra ganaría? ¿Cuál es la tuya?',
];

export function preguntaIndexForDate(date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const y = parts.find((p) => p.type === 'year')?.value ?? '2026';
  const m = parts.find((p) => p.type === 'month')?.value ?? '01';
  const d = parts.find((p) => p.type === 'day')?.value ?? '01';
  const days = Math.floor(Date.parse(`${y}-${m}-${d}T12:00:00Z`) / 86_400_000);
  return ((days % PREGUNTAS.length) + PREGUNTAS.length) % PREGUNTAS.length;
}

export function preguntaDelDia(date = new Date()): string {
  return PREGUNTAS[preguntaIndexForDate(date)];
}

export function fechaLabelMX(date = new Date()): string {
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
