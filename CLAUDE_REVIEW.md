# DIAL-IN Sur — Paquete de revisión para Claude

> **Propósito:** Documento maestro para que Claude (u otro revisor) evalúe el proyecto completo sin contexto previo.
> **Ruta del proyecto:** `/Users/cesarulisesmanzanillosuriel/Projects/lulula`
> **Nombre del producto:** DIAL-IN — chat IRC retro para jóvenes del Sur de Veracruz, México

---

## 1. Resumen ejecutivo

**DIAL-IN** es una app móvil (Expo/React Native) que conecta estudiantes de Minatitlán, Coatzacoalcos, Acayucan, Cosoleacaque y Jáltipan a través de **IRC real** (red Libera Chat), con estética Windows 95 / mIRC y capas modernas de gamificación (rachas, XP, badges) orientadas a Gen Z.

| Aspecto | Detalle |
|---------|---------|
| Stack app | Expo 56, React Native 0.85, TypeScript, Expo Router |
| Stack servidor | Node.js, `ws` (WebSocket), `irc-framework` |
| Protocolo chat | IRC sobre TLS → `irc.libera.chat:6697` |
| Bridge | WebSocket local `ws://localhost:8787` (configurable) |
| Persistencia | AsyncStorage (nick, ciudad, escuela, XP, rachas) |
| Estado | Prototipo funcional local; sin deploy en nube ni push notifications |

### Propuesta de valor
- Chat **real** con extraños y compañeros (no mock).
- Identidad por **ciudad + escuela** (onboarding local).
- **Pulso** en vivo: cuántos hay en la sala de tu ciudad.
- **La Sala 3PM**: ventana horaria (15:00–23:00) como after-school digital.
- **Rachas y XP** para retención diaria.
- Esencia **mIRC/IRC** intacta: nicks, `#canales`, nicklist, queries (DM), `/me`.

---

## 2. Cómo ejecutar (para el revisor)

### Prerrequisitos
- Node.js 20+ (23 funciona con warnings)
- npm
- Expo Go en teléfono o simulador iOS/Android

### Terminal 1 — Bridge IRC (obligatorio)
```bash
cd /Users/cesarulisesmanzanillosuriel/Projects/lulula
npm run server
# → WebSocket ws://localhost:8787
# → IRC tls://irc.libera.chat:6697
```

### Terminal 2 — App
```bash
cd /Users/cesarulisesmanzanillosuriel/Projects/lulula
npm start
```

### Dispositivo físico (misma WiFi)
```bash
EXPO_PUBLIC_WS_URL=ws://TU_IP_LOCAL:8787 npm start
```

### Verificar bridge sin app
```bash
node -e "
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8787');
ws.on('open', () => ws.send(JSON.stringify({type:'connect', nick:'TestReview'})));
ws.on('message', d => console.log(JSON.parse(d)));
"
```

---

## 3. Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│  Expo App (React Native)                                    │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │ Identity    │  │ Gamification     │  │ IRCContext      │ │
│  │ Context     │  │ Context          │  │ (WebSocket)     │ │
│  └─────────────┘  └──────────────────┘  └────────┬────────┘ │
│         │                  │                      │         │
│         └──────────────────┴──────────────────────┘         │
│                            │                                │
│  Screens: connect → (tabs) pulse | chats | discover | profile │
│           channel/[name]  query/[nick]                      │
└────────────────────────────┼────────────────────────────────┘
                             │ WebSocket JSON
┌────────────────────────────▼────────────────────────────────┐
│  server/index.js — IRC Bridge                               │
│  ws :8787  ←→  irc-framework  ←→  irc.libera.chat:6697    │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de datos WebSocket (cliente → servidor)
| `type` | Payload | Acción |
|--------|---------|--------|
| `connect` | `{ nick }` | Conecta a Libera |
| `join` | `{ channel }` | JOIN #canal |
| `part` | `{ channel }` | PART |
| `say` | `{ target, text }` | PRIVMSG (canal o nick) |
| `pm` | `{ nick, text }` | Mensaje privado |
| `away` | `{ status }` | AWAY message |
| `disconnect` | — | QUIT |

### Eventos servidor → cliente
`hello`, `connecting`, `registered`, `message`, `join`, `part`, `quit`, `nick`, `topic`, `nicklist`, `error`, `disconnected`

El campo `msgType` en eventos `message` distingue `chat` vs `action` (evita colisión con `type` del envelope).

---

## 4. Estructura de archivos

```
lulula/                    # nombre carpeta legacy; app = "dialin"
├── app/
│   ├── _layout.tsx                # Providers: Identity, Gamification, IRC
│   ├── index.tsx                  # Redirect según conexión/onboarding
│   ├── connect.tsx                # Onboarding multi-paso (ciudad, escuela, nick)
│   ├── (tabs)/
│   │   ├── _layout.tsx            # Tab bar: Pulso, Salas, Explorar, Perfil
│   │   ├── pulse.tsx              # ★ Pantalla principal adictiva
│   │   ├── chats.tsx              # Lista canales + DMs
│   │   ├── discover.tsx           # Salas por ciudad del Sur
│   │   └── profile.tsx            # Perfil, badges, invite, logout
│   ├── channel/[name].tsx         # Chat de canal IRC
│   └── query/[nick].tsx           # DM / query IRC
├── components/
│   ├── brand/                     # DialInLogo, RetroCard
│   ├── gamification/              # StreakFlame, LevelBar, InviteCard
│   ├── mirc/                      # UI Win95: MircWindow, NickList, etc.
│   └── RegionBootstrap.tsx        # Auto-join salas al conectar
├── constants/
│   ├── config.ts                  # WS_URL, BRAND, featured channels
│   ├── surVeracruz.ts             # ★ Ciudades, escuelas, preguntas, badges
│   └── theme.ts                   # Paleta retro + neón
├── context/
│   ├── IRCContext.tsx             # ★ Estado IRC + WebSocket
│   ├── IdentityContext.tsx        # Ciudad, escuela, onboarding
│   └── GamificationContext.tsx    # XP, rachas, badges
├── lib/irc/
│   ├── types.ts                   # Tipos TS compartidos
│   └── utils.ts                   # normalizeChannel, nick colors, etc.
├── server/
│   ├── index.js                   # ★ Bridge WebSocket ↔ IRC
│   └── package.json
├── assets/images/                 # Logo DIAL-IN (icon, splash)
├── package.json
├── app.json
└── CLAUDE_REVIEW.md               # Este archivo
```

**Archivos legacy sin uso activo:** `constants/Colors.ts`, `components/EditScreenInfo.tsx`, `components/Themed.tsx` (restos del template Expo).

---

## 5. Dominio de negocio — Sur de Veracruz

### Ciudades (`constants/surVeracruz.ts`)
| ID | Ciudad | Canal IRC |
|----|--------|-----------|
| `minatitlan` | Minatitlán | `#dialin-minatitlan` |
| `coatzacoalcos` | Coatzacoalcos | `#dialin-coatzacoalcos` |
| `acayucan` | Acayucan | `#dialin-acayucan` |
| `cosoleacaque` | Cosoleacaque | `#dialin-cosoleacaque` |
| `jaltipan` | Jáltipan | `#dialin-jaltipan` |

### Salas regionales
- `#dialin-sur` — hub general
- `#sala3pm-sur` — after-school (UI especial 15:00–23:00)
- `#confesiones-sur`, `#tareas-sur`
- `##chat` — sala global Libera (fallback con gente real)

### Escuelas
Listas por ciudad: CBTA, CBTIS, CONALEP, prepas, UA Sur, TecNM, secundarias, opción "Otra". **No hay verificación** — el usuario declara su escuela.

### Gamificación
- **XP:** +12/mensaje, +50 login diario, +30 pregunta del día, +25 invite
- **Racha:** días consecutivos de apertura
- **Badges:** first-connect, streak-3/7/30, msgs-50/200, rooms-5, invite-3, sala3pm, daily-7
- **Nivel:** `floor(xp / 100) + 1`

---

## 6. Pantallas y UX

### Onboarding (`connect.tsx`)
1. Welcome — propuesta de valor
2. Ciudad — 5 botones
3. Escuela — lista filtrada
4. Nick — input + 🎲 + preview pregunta del día
5. Modem animation → conexión real

### Pulso (`pulse.tsx`) — tab por defecto
- Streak + level bar
- Contador en vivo (nicklist del canal de ciudad)
- Sala 3PM abierta/cerrada
- Pregunta del día (postea a canal con un tap)
- Accesos rápidos: ciudad, hub Sur, confesiones
- Rivalidad Minatitlán vs Coatzacoalcos
- InviteCard viral

### Canal (`channel/[name].tsx`)
- Log estilo mIRC (`[HH:MM] <nick> texto`)
- Nicklist lateral con @ops, +voice
- Tap nick → query/DM
- `/me acción` soportado vía servidor

---

## 7. Configuración y variables de entorno

| Variable | Default | Uso |
|----------|---------|-----|
| `EXPO_PUBLIC_WS_URL` | `ws://localhost:8787` (o `10.0.2.2` Android emu) | URL del bridge |
| `EXPO_PUBLIC_WS_HOST` | platform-specific | Host sin protocolo |
| `PORT` (server) | `8787` | Puerto WebSocket |
| `IRC_HOST` | `irc.libera.chat` | Servidor IRC |
| `IRC_PORT` | `6697` | Puerto TLS |
| `IRC_TLS` | `true` | TLS on/off |

---

## 8. Limitaciones conocidas (importante para revisión)

### Infraestructura
- [ ] Bridge corre en **localhost** — no hay deploy producción
- [ ] Canales `#dialin-*` **pueden no existir** aún en Libera; el JOIN falla silenciosamente o sin usuarios hasta que alguien los cree
- [ ] Sin backend propio — no hay auth, registro de usuarios, ni ranking real por escuela

### Producto
- [ ] Escuela/ciudad es **autodeclarada** — no verificable
- [ ] "X personas de tu escuela" **no implementado** — solo conteo total del canal ciudad
- [ ] Rivalidad ciudades es **UI only** — sin contador comparativo real
- [ ] Gamificación es **100% local** (AsyncStorage) — se pierde al desinstalar
- [ ] Invite tracking es honor system — no deep links con referral real
- [ ] Sin moderación, sin reportes, sin filtros de contenido
- [ ] Confesiones-sur sin anonimato real (IRC muestra nick)

### Técnico
- [ ] `recordRoomJoin()` puede inflar XP al auto-join múltiple al conectar
- [ ] Reconnect WebSocket no automático en app si bridge cae
- [ ] Node 23 muestra EBADENGINE warnings con RN 0.85
- [ ] `expo-sharing` instalado pero InviteCard usa `Share` de RN
- [ ] Carpeta del proyecto aún se llama `whatsapp-clone`

### Seguridad
- [ ] Sin rate limiting en bridge
- [ ] Cualquiera puede conectar cualquier nick
- [ ] Sin validación de input en servidor (longitud, spam)
- [ ] WebSocket sin autenticación

---

## 9. Preguntas sugeridas para la revisión de Claude

### Producto y viralidad
1. ¿La propuesta DIAL-IN Sur es diferenciada vs WhatsApp/Telegram/Discord para el público objetivo?
2. ¿Las mecánicas de retención (racha, Sala 3PM, pregunta del día) son suficientes o éticamente problemáticas?
3. ¿Qué falta para que sea viral en escuelas secundarias/preparatorias de México?
4. ¿El onboarding de 4 pasos es demasiado largo para Gen Z?

### Arquitectura
5. ¿El bridge WebSocket → IRC es la abstracción correcta para Expo, o conviene IRC-over-WebSocket nativo / backend más robusto?
6. ¿Los tres contexts (IRC, Identity, Gamification) están bien separados o hay acoplamiento excesivo?
7. ¿Cómo escalar a 1000+ usuarios simultáneos del Sur?

### Código
8. ¿Hay bugs en el manejo de mensajes PM vs canal en `IRCContext`?
9. ¿Race conditions al auto-join en `RegionBootstrap`?
10. ¿Tipos TS y eventos WebSocket están completos y seguros?

### Seguridad y moderación
11. ¿Riesgos para menores en IRC público sin supervisión?
12. ¿Qué moderación mínima viable antes de lanzar en escuelas?

### Roadmap
13. Priorizar: deploy cloud vs push notifications vs verificación escolar vs propio servidor IRC
14. ¿Conviene renombrar repo a `dialin` y registrar marca/canales oficiales?

---

## 10. Prompt listo para copiar en Claude

```
Revisa el proyecto DIAL-IN Sur ubicado en:
/Users/cesarulisesmanzanillosuriel/Projects/lulula

Lee primero CLAUDE_REVIEW.md en la raíz del proyecto.

Luego revisa en profundidad:
- server/index.js (bridge IRC)
- context/IRCContext.tsx
- context/GamificationContext.tsx
- context/IdentityContext.tsx
- constants/surVeracruz.ts
- app/connect.tsx
- app/(tabs)/pulse.tsx
- app/channel/[name].tsx

Entrega:
1. Resumen de qué hace bien el proyecto
2. Bugs o riesgos técnicos (con archivo y línea si aplica)
3. Riesgos de producto/seguridad para menores
4. Top 10 mejoras priorizadas para lanzamiento viral en escuelas del Sur de Veracruz
5. Veredicto: ¿listo para beta escolar? ¿qué bloquea producción?

Contexto: app Expo que conecta jóvenes de Minatitlán, Coatzacoalcos, Acayucan, 
Cosoleacaque y Jáltipan a IRC real con estética mIRC retro + gamificación Gen Z.
El bridge IRC debe estar corriendo (npm run server) para probar en vivo.
```

---

## 11. Comandos útiles para revisión

```bash
# Typecheck
cd /Users/cesarulisesmanzanillosuriel/Projects/lulula && npx tsc --noEmit

# Contar líneas de código propio (sin node_modules)
find . -name '*.ts' -o -name '*.tsx' -o -name '*.js' | grep -v node_modules | xargs wc -l

# Buscar TODOs / FIXMEs
rg -i 'todo|fixme|hack' --glob '!node_modules'

# Estado git
git -C /Users/cesarulisesmanzanillosuriel/Projects/lulula status
git -C /Users/cesarulisesmanzanillosuriel/Projects/lulula log --oneline -10
```

---

## 12. Historia del proyecto (contexto de conversación)

1. **Inicio:** usuario pidió clonar WhatsApp → se creó con Expo
2. **Pivot 1:** clonar mIRC años 90 → UI Win95, datos mock
3. **Pivot 2:** hacerlo real → bridge IRC a Libera Chat, marca DIAL-IN
4. **Pivot 3:** enfoque Sur de Veracruz, jóvenes que no conocen mIRC → onboarding ciudad/escuela, Pulso, gamificación, Sala 3PM, viral loop

**Intención actual del usuario:** producto original, adictivo, viral, que conecte estudiantes de todas las escuelas de las 5 ciudades, sin perder esencia mIRC/IRC.

---

## 13. Dependencias clave

### App
`expo` ~56, `expo-router`, `react-native` 0.85, `@react-native-async-storage/async-storage`, `expo-haptics`, `expo-linear-gradient`, `expo-clipboard`, `@expo/vector-icons`

### Server
`ws` ^8.18, `irc-framework` ^4.14

---

*Generado para revisión externa. Actualizar este doc si cambia la arquitectura.*
