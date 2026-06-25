# Lulula — Documento para revisión por IA

> **Propósito:** Este archivo está diseñado para que ChatGPT, Claude, Gemini, Grok u otra IA lean el proyecto **sin contexto previo** y den una opinión honesta sobre producto, viralidad, técnica y estrategia.
>
> **Repositorio:** https://github.com/5944138/lulula  
> **Ruta local:** `/Users/cesarulisesmanzanillosuriel/Projects/lulula`  
> **Versión del doc:** Junio 2026

---

## Cómo usar este documento

### Opción A — Pegar en cualquier chat de IA

Copia todo este archivo (o las secciones 1–8 + 12) y añade al final:

```
Basándote SOLO en este documento, dame tu opinión honesta como si fueras:
- Un CEO de producto consumer (nivel Meta/TikTok)
- Un inversor pre-seed
- Un diseñador de producto

Quiero saber:
1. ¿Es realmente único o es un frankenstein de features?
2. ¿Qué tiene potencial viral real vs qué es humo?
3. Los 3 mayores riesgos que matarían el producto
4. Las 3 mejores apuestas para duplicar down
5. Veredicto: ¿invertirías 6 meses de tu vida en esto? ¿por qué?
Sé brutalmente honesto. No me halagues.
```

### Opción B — IA con acceso al código

Si la IA puede leer archivos del repo, pídele que lea **este documento primero** y luego revise:

| Prioridad | Archivo | Por qué |
|-----------|---------|---------|
| 1 | `constants/oinkSignal.ts` | Mecánica hero: LA SEÑAL OINK |
| 2 | `context/OinkSignalContext.tsx` | Lógica del Drop global |
| 3 | `context/IRCContext.tsx` | Corazón técnico — WebSocket ↔ IRC |
| 4 | `app/(tabs)/chats.tsx` | Home "El Wire" |
| 5 | `app/login.tsx` | Onboarding estilo WhatsApp |
| 6 | `server/index.js` | Bridge IRC + auth OTP |
| 7 | `app/_layout.tsx` | Árbol de providers / arquitectura |

---

## 1. Resumen ejecutivo

**Lulula** es una app móvil/web (Expo + React Native) que parece **WhatsApp por fuera** y es **mIRC por dentro**. El diferenciador no es el chat: es que **el chat IRC real ES el videojuego**.

| Aspecto | Detalle |
|---------|---------|
| **Marca** | Lulula — cerdita mascota, estética retro-neón |
| **Tagline** | *La cerdita viral. Chat, juegos, caos.* |
| **Manifiesto** | *WhatsApp abre la puerta. mIRC es el motor. LA SEÑAL es el alma.* |
| **Stack app** | Expo 56, React Native 0.85, TypeScript, Expo Router |
| **Stack servidor** | Node.js, WebSocket (`ws`), `irc-framework`, Twilio opcional |
| **Chat** | IRC real sobre TLS → `irc.libera.chat:6697` |
| **Bridge** | WebSocket `ws://localhost:8787` (configurable) |
| **Auth** | Teléfono + OTP (Twilio en prod, modo dev en consola) |
| **Estado** | Prototipo funcional local; sin deploy en nube; sin App Store |

### Elevator pitch (30 segundos)

> Imagina si Fortnite hiciera eventos en vivo, pero en vez de disparar, **escribes en IRC**. Lulula es la única app donde entrar con tu número (como WhatsApp), elegir tu ciudad, y competir con el planeta mandando **una palabra** en un chat real cada 5 minutos. Por fuera es familiar. Por dentro es 1997. Y el wire es el juego.

---

## 2. El problema que intenta resolver

- **Gen Z** no conoce IRC pero sí extraña conexión *real* (no algoritmo, no performative social media).
- WhatsApp/Discord son cerrados, sin eventos globales, sin "el wire como arena".
- Los juegos sociales (Among Us, etc.) son instancias aisladas, no un protocolo abierto con extraños.
- La nostalgia de mIRC existe pero es inaccesible para móvil y para quien no sabe qué es un `/join`.

### La apuesta

Usar **familiaridad (WhatsApp UX)** como puente hacia **lo irreplicable (IRC público + mecánicas de juego)**.

---

## 3. Arquitectura de experiencia (dualidad)

```
┌─────────────────────────────────────────────────────────┐
│  CAPA 1 — WHATSAPP (entrada, confianza, adopción)       │
│  Login teléfono → OTP → lista de chats → headers verdes │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  CAPA 2 — mIRC (alma, autenticidad, poder users)          │
│  Ventana Win95 · nicklist · /me · canales reales Libera   │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  CAPA 3 — LULULA (juego, retención, viralidad)            │
│  7 mecánicas donde IRC = input del gameplay             │
└─────────────────────────────────────────────────────────┘
```

### Tabs principales

| Tab | Nombre UI | Función |
|-----|-----------|---------|
| 1 | **El Wire** | Home — lista de chats + hero vivo + eventos LIVE |
| 2 | **Estados** | Pulse retro — todas las mecánicas en vista mIRC |
| 3 | **Juegos** | Arcade (Lulula Run, Fall Oink, etc.) |
| 4 | **Comunidades** | Descubrir salas |
| 5 | **Ajustes** | Perfil, economía |

---

## 4. Las 7 mecánicas únicas (IRC = juego)

### 📡 LA SEÑAL OINK — *El rey. La jugada de CEO.*

| Campo | Valor |
|-------|-------|
| **Ciclo** | Cada 5 minutos |
| **Fases** | 20s countdown → 60s LIVE → 14s reveal |
| **Input** | Una palabra en IRC, o `/senal palabra` (3× peso) |
| **Pregunta** | Rotativa — ej: *"Si el planeta solo pudiera gritar UNA palabra ahora, ¿cuál?"* |
| **Competencia** | Tu ciudad vs ciudades rivales; palabra más repetida gana |
| **Recompensa** | Monedas, historia grabada, share viral |
| **Adicción** | FOMO (60s, sin replay), appointment viewing, fullscreen auto |

**Por qué importa:** Unifica todo el producto en UN momento memorable. Es el "live event" de Fortnite aplicado al chat.

---

### 🧠 MENTE COLECTIVA — Deseos arquetípicos del wire

| Campo | Valor |
|-------|-------|
| **Ciclo** | Cada 7 minutos |
| **Concepto** | El planeta "siente" un deseo: CONEXIÓN, AMOR, LIBERTAD, PODER, CAOS, PAZ |
| **Input** | Mensajes IRC con keywords del deseo, o `/deseo palabra` |
| **Meta** | Llegar a 100 puntos de resonancia como ciudad |
| **Extra** | Muro de confesiones, rachas, rival en tiempo real |

---

### 🌊 OINK WAVE — Partida live multijugador

| Campo | Valor |
|-------|-------|
| **Ciclo** | Cada 5 minutos |
| **Tipos** | Emoji storm, oink flood, phrase lock, city siege |
| **Input** | Mensajes en canal de ciudad durante ventana live |
| **Competencia** | Tu ciudad vs ciudad rival simulada |

---

### 🎙️ SNOUTCAST — Radio de un solo micrófono

| Campo | Valor |
|-------|-------|
| **Comando** | `/hog` (también `/air`, `/enelaire`) |
| **Duración** | 90 segundos "EN EL AIRE" |
| **Input** | Un broadcaster por ciudad; reacciones 🐷 en IRC |
| **UX** | Barra LIVE estilo Instagram Stories |

---

### 🌀 LA DIMENSIÓN OINK — Arte colectivo + lore

| Campo | Valor |
|-------|-------|
| **Input** | Cada mensaje IRC pinta un pixel en canvas 24×24 |
| **Extra** | Wire Legends (historia desbloqueable por mensajes) |
| **Evento** | Posesión de Lulula — glitch narrativo |

---

### 👾 CERDO GLITCH — Boss fight cooperativo (ARG)

| Campo | Valor |
|-------|-------|
| **Spawn** | ~cada 25 minutos |
| **Mecánica** | La ciudad debe escribir en IRC, en orden: L-U-L-U-L-A |
| **Ventana** | 3 minutos o el wire se "corrompe" |
| **Extra** | Oink Oracle — profecías del caos del chat |

---

### 🎮 Arcade clásico

Juegos standalone: Lulula Run, Fall Oink, Oink Us, Lulula Craft, Lulula Verse.  
Monetización: Oink Coins 🪙, Perlas 💎, Game Pass, tienda `/shop`.

---

## 5. Mundo y comunidades

### 12 ciudades globales

Tokyo, New York, London, Mexico City, Seoul, Lagos, Berlin, Mumbai, São Paulo, Paris, Dubai, Jakarta.

Cada una con canal IRC dedicado: `#lulula-tokyo`, `#lulula-cdmx`, etc.

### Tribus (identidad social, reemplaza "escuela")

Gamers, Music Heads, Devs, Creators, Night Owls, Chaos Agents, Study Grind, Vibe Check, Sports, Anime, Crypto, Just Browsing.

### Canales globales

- `##chat` — sala Libera con gente real siempre (fallback garantizado)
- `#lulula-world`, `#lulula-lounge`, `#sala3pm`, `#confessions`, `#afterdark`

---

## 6. Stack técnico

### App (cliente)

```
Expo 56 · React Native 0.85 · TypeScript · Expo Router
AsyncStorage · expo-haptics · expo-linear-gradient
react-native-reanimated · react-native-safe-area-context
```

### Servidor (bridge)

```
Node.js · ws (WebSocket) · irc-framework · dotenv
Twilio (SMS OTP opcional) · HTTP REST para auth
Puerto default: 8787
```

### Arquitectura de providers (estado global)

```
AuthProvider
  → IdentityProvider
    → EconomyProvider
      → GamificationProvider
        → IRCProvider
          → OinkWaveProvider
            → OinkDimensionProvider
              → SnoutCastProvider
                → GlitchPigProvider
                  → CollectiveMindProvider
                    → OinkSignalProvider
```

### Flujo WebSocket (cliente ↔ bridge ↔ IRC)

| Cliente envía | Acción |
|---------------|--------|
| `connect` + nick | Conecta a Libera |
| `join` + channel | JOIN #canal |
| `say` + target + text | PRIVMSG |
| `pm` + nick + text | Mensaje privado |
| `away` + status | AWAY |

| Servidor envía | Contenido |
|----------------|-----------|
| `registered` | Conexión OK |
| `message` | Chat con `msgType`: chat / action |
| `join`, `part`, `quit`, `nick` | Presencia |
| `nicklist`, `topic` | Estado del canal |

---

## 7. Flujo de usuario

1. **Boot** → splash Lulula
2. **Login** (`/login`) — términos → teléfono → OTP → nombre → ciudad + tribu → animación modem mIRC
3. **El Wire** (`/(tabs)/chats`) — hero vivo, eventos LIVE fijados arriba
4. **Canal** (`/channel/[name]`) — header WhatsApp + ventana mIRC + banners de eventos
5. **Estados** (`/(tabs)/pulse`) — hub retro de todas las mecánicas

### Comandos IRC especiales en Lulula

| Comando | Mecánica |
|---------|----------|
| `/senal palabra` | LA SEÑAL OINK |
| `/deseo palabra` | Mente Colectiva |
| `/hog` | SnoutCast — tomar el aire |
| `/me acción` | Acción mIRC clásica |

---

## 8. Autenticación

- **Producción:** Twilio SMS OTP (`server/auth.js`)
- **Desarrollo:** OTP impreso en consola del servidor + hint en UI
- **Sesión:** token en AsyncStorage
- **Sin verificación de identidad real** más allá del teléfono

---

## 9. Monetización (diseñada, no validada)

| Elemento | Descripción |
|----------|-------------|
| Oink Coins 🪙 | Moneda blanda — ganar en eventos |
| Perlas 💎 | Moneda premium |
| Game Pass | Acceso arcade |
| Tienda | `/shop` — cosméticos, boosts |

**Estado:** economía local (AsyncStorage). Sin pagos reales integrados aún.

---

## 10. Cómo ejecutar (para revisor humano o IA con terminal)

```bash
cd /Users/cesarulisesmanzanillosuriel/Projects/lulula
npm install
cd server && npm install && cd ..

# Arranca bridge + app web
npm run dev

# Abre en navegador:
# http://127.0.0.1:8082/login
# (puerto 8082 — evita choque con otros proyectos Expo en 8081)
```

**OTP en dev:** mirar consola del servidor `[bridge]` tras enviar teléfono.

**Móvil:** `npm run dev:mobile` + Expo Go (misma WiFi, `EXPO_PUBLIC_WS_URL=ws://TU_IP:8787`).

---

## 11. Lo que SÍ funciona hoy

- [x] Login completo estilo WhatsApp (teléfono + OTP dev)
- [x] Conexión IRC real a Libera Chat
- [x] Lista de chats con eventos LIVE
- [x] Chat de canal con nicklist, /me, emojis
- [x] 7 mecánicas de juego sobre mensajes IRC
- [x] LA SEÑAL OINK con fullscreen drop cada 5 min
- [x] Gamificación local (XP, rachas, niveles)
- [x] 5 juegos arcade
- [x] Economía local (monedas)
- [x] TypeScript compila sin errores críticos

---

## 12. Limitaciones conocidas (importante para opinión honesta)

### Infraestructura
- [ ] Sin deploy en nube — bridge es localhost
- [ ] Canales `#lulula-*` pueden estar vacíos en Libera hasta que haya masa crítica
- [ ] Sin push notifications
- [ ] Sin backend de rankings globales reales (mucho es simulado localmente)
- [ ] WebSocket sin autenticación fuerte

### Producto
- [ ] **Riesgo de frankenstein:** 7 mecánicas + arcade + WhatsApp + mIRC — ¿demasiado?
- [ ] Onboarding largo (teléfono → OTP → perfil → ciudad → tribu → sync)
- [ ] Dependencia de IRC público (moderación, spam, contenido adulto posible)
- [ ] Competencia global "simulada" — no hay servidor de matchmaking real
- [ ] Sin validación con usuarios reales documentada
- [ ] IRC es desconocido para Gen Z — la curva de aprendizaje existe

### Seguridad / menores
- [ ] Sin moderación integrada
- [ ] Sin reportes
- [ ] Sin filtros de contenido
- [ ] IRC muestra nick real — no hay anonimato en confesiones
- [ ] Cualquiera puede usar cualquier nick

### Técnico
- [ ] Muchos providers anidados — complejidad de estado
- [ ] Gamificación 100% local — se pierde al desinstalar
- [ ] Algunos eventos usan timers client-side (pueden desincronizarse entre usuarios)

---

## 13. Comparación vs competencia

| Producto | Similitud | Diferencia clave de Lulula |
|----------|-----------|----------------------------|
| **WhatsApp** | UX de entrada, lista de chats | Lulula tiene IRC real + eventos globales |
| **Discord** | Comunidades, canales | Lulula usa protocolo abierto + game mechanics en el chat |
| **Telegram** | Grupos, canales | Lulula no es messenger — es arena de juego social |
| **Twitch** | Live events | En Lulula TÚ eres el contenido escribiendo en IRC |
| **Fortnite** | Eventos programados | Lulula hace drops de palabras, no battle royale |
| **Nostalgia mIRC** | Estética, comandos | Lulula lo hace accesible en móvil con onboarding moderno |

**Moat propuesto:** La combinación WhatsApp-entry + IRC-real + game-mechanics-on-wire es difícil de copiar sin los tres pilares.

---

## 14. Historia / evolución del producto

1. Clone de WhatsApp (Expo)
2. Pivot a clon mIRC años 90 (UI Win95)
3. IRC real vía bridge a Libera Chat
4. Rebrand a **Lulula** (cerdita viral, ciudades globales)
5. Entrada idéntica a WhatsApp (teléfono + OTP)
6. Capas de juego: Oink Wave → Dimensión → SnoutCast → Glitch → Mente Colectiva
7. **LA SEÑAL OINK** como mecánica unificadora (The Drop)

**Intención actual del fundador:** producto de primer nivel, viral, único en el mundo. Competir con la creatividad de los mejores productos consumer. Dar control total al desarrollo para crear algo que no exista.

---

## 15. Preguntas que queremos que la IA responda

### Producto y estrategia
1. ¿Cuál de las 7 mecánicas debería ser LA ÚNICA si tuvieras que matar las demás?
2. ¿LA SEÑAL OINK es suficiente como hook viral o necesita simplificación?
3. ¿El positioning "WhatsApp por fuera, mIRC por dentro" es comprensible en 5 segundos?
4. ¿Qué público exacto adoptaría esto primero? (país, edad, psychographic)
5. ¿Es demasiado complejo para el usuario promedio?

### Viralidad y retención
6. ¿Qué loop viral falta? (invites, shares, network effects)
7. ¿Los ciclos de 5–7 minutos son correctos o agotan?
8. ¿Cómo harías el onboarding para que el primer "wow" llegue en <60 segundos?

### Técnica y escalabilidad
9. ¿El bridge WebSocket → IRC escala? ¿Alternativa?
10. ¿Los 8 providers anidados son mantenibles?
11. ¿Qué debería construirse primero: backend global real vs App Store launch?

### Inversión y veredicto
12. ¿Invertirías $50K en esto? ¿Qué milestones exigirías?
13. ¿Qué matarías del roadmap en las próximas 2 semanas?
14. Califica del 1 al 10: unicidad, ejecutabilidad, potencial viral, claridad de mercado.

---

## 16. Prompts listos para copiar

### Para ChatGPT / Gemini / Grok

```
Lee el siguiente documento de producto llamado LULULA.
[PEGA AQUÍ TODO AI_REVIEW.md]

Eres un panel de 3 expertos: CEO de TikTok, diseñador de Fortnite, y VC de a16z.
Debaten entre ellos y luego dan un veredicto unificado.
Sé específico. No digas "depende" sin dar recomendación concreta.
```

### Para Claude (con acceso al repo)

```
Proyecto: Lulula
Repo: https://github.com/5944138/lulula
Lee primero AI_REVIEW.md en la raíz.

Luego revisa el código de:
- context/OinkSignalContext.tsx
- context/IRCContext.tsx
- app/(tabs)/chats.tsx
- server/index.js

Entrega:
1. Opinión de producto (unicidad, foco, riesgo de frankenstein)
2. Bugs técnicos prioritarios
3. Plan de 30 días para llegar a beta con 100 usuarios reales
4. Veredicto final en una frase estilo Steve Jobs
```

### Para opinión rápida (solo pitch)

```
Producto: Lulula — app que parece WhatsApp pero el chat IRC real es el videojuego.
Cada 5 min hay un "Drop" global: el planeta pide UNA palabra en chat en 60 segundos.
Ciudades compiten. Por dentro es mIRC años 90. Stack: Expo + Node bridge a Libera IRC.
¿Es una idea de $100M o un proyecto de nicho? ¿Qué harías diferente?
```

---

## 17. Métricas de éxito sugeridas (para que la IA evalúe si son correctas)

| Métrica | Meta beta | Por qué |
|---------|-----------|---------|
| D1 retention | >40% | Eventos cada 5 min deben traer de vuelta |
| Señales participadas / usuario / día | >3 | Core loop |
| Mensajes IRC / sesión | >15 | Prueba de engagement real |
| Shares post-Señal | >10% de ganadores | Loop viral |
| Tiempo a primer mensaje IRC | <3 min post-login | Onboarding OK |

---

## 18. Archivos clave del repositorio

```
lulula/
├── AI_REVIEW.md              ← ESTE DOCUMENTO
├── README.md
├── app/
│   ├── login.tsx             ← Onboarding WhatsApp
│   ├── (tabs)/chats.tsx      ← El Wire (home)
│   ├── (tabs)/pulse.tsx      ← Estados / hub mecánicas
│   ├── channel/[name].tsx    ← Chat mIRC dentro de WA chrome
│   └── _layout.tsx           ← Providers
├── constants/
│   ├── oinkSignal.ts         ← LA SEÑAL OINK
│   ├── collectiveMind.ts     ← Mente Colectiva
│   ├── oinkWave.ts           ← Oink Wave
│   ├── snoutCast.ts          ← SnoutCast
│   ├── glitchPig.ts          ← Cerdo Glitch
│   ├── oinkDimension.ts      ← Dimensión Oink
│   └── world.ts              ← Ciudades y tribus
├── context/                  ← Lógica de cada mecánica
├── components/
│   ├── wire/WireHero.tsx
│   ├── oinksignal/SignalDrop.tsx
│   └── mirc/                 ← UI Win95
└── server/
    ├── index.js              ← Bridge IRC + HTTP auth
    └── auth.js               ← OTP Twilio
```

---

## 19. Una frase para que la IA no se pierda

> **Lulula no es WhatsApp con temática de cerdo. Es la única app donde un evento global en vivo ocurre en IRC real, y tu ciudad gana o pierde según lo que escribes en el chat en 60 segundos.**

---

*Documento generado para revisión externa por IA. Actualizar cuando cambie la arquitectura o la mecánica hero.*
