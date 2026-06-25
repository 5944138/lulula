# La Señal · Minatitlán

**Un ritual diario.** Cada noche a las **21:00** (CDMX), una pregunta. **60 segundos.** Una palabra. Minatitlán responde.

## Correr

```bash
npm install && cd server && npm install && cd ..
npm run dev
# http://127.0.0.1:8082
```

`npm run dev` activa `SIGNAL_TEST_MODE` — ciclo completo cada **3 minutos** para probar sin esperar a las 9pm.

Producción:

```bash
SIGNAL_HOUR=21 npm run server
```

## Opcional

- `DATABASE_URL` + `pg` → guarda cada Señal en tabla `senales`
- `SIGNAL_TEST_MODE=true` → ciclo de prueba cada 3 min

## Una pantalla

1. ¿Cómo te llamas?
2. Cuenta regresiva → LIVE → tarjeta compartible

Sin IRC. Sin teléfono. Sin tabs.
