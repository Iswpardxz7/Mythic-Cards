# ✅ Checklist de Verificación - Bug PVP Arreglado

## 📋 Antes de Probar

- [ ] Asegúrate que `pvp-mode.js` está actualizado en tu carpeta
- [ ] Asegúrate que `index.html` está actualizado en tu carpeta
- [ ] Reinicia el navegador (Ctrl+Shift+R para limpiar caché)
- [ ] Abre DevTools (F12) antes de jugar

---

## 🎮 Prueba Paso a Paso

### Paso 1: Preparación
- [ ] Abre 2 pestañas en tu navegador
- [ ] En Tab 1: Registra usuario "alice"
- [ ] En Tab 2: Registra usuario "bob"

### Paso 2: Envío de Invitación
- [ ] En Tab 1 (alice): Click en "Amigos" o "PVP"
- [ ] Busca a "bob" en la lista
- [ ] Haz click en "⚔ Invitar"
- [ ] Deberías ver: "✅ Invitación enviada a bob"

### Paso 3: Aceptación
- [ ] En Tab 2 (bob): Deberías recibir notificación
- [ ] Aparece popup: "⚔ ¡Reto PVP recibido! alice te desafió"
- [ ] Haz click en "✅ Aceptar"
- [ ] Deberías ver: "✅ ¡Aceptaste! Combate en 5 segundos..."

### Paso 4: Batalla Inicial
- [ ] Ambas pestañas muestran pantalla de batalla
- [ ] Ves tu mano de 7 cartas
- [ ] Encima dice: "⚔ PVP - Elige tu carta"

### Paso 5: Primera Selección
- [ ] En Tab 1 (alice): Haz click en cualquier carta de tu mano
- [ ] La carta se selecciona (cambio visual)
- [ ] Aparece en slot izquierdo con dorso (verso azul)
- [ ] Abajo dice: "Carta elegida: [Nombre] | Esperando a que el oponente elija..."
- [ ] **En console (F12)**: Deberías ver ✅ Carta enviada: [nombre]

### Paso 6: Segunda Selección
- [ ] En Tab 2 (bob): Haz click en una carta DIFERENTE
- [ ] La carta se selecciona en tu slot derecho (dorso visible)
- [ ] Abajo dice: "Carta elegida: [Nombre]..."
- [ ] **En console (F12)**: Deberías ver ✅ Carta enviada: [nombre]

### Paso 7: Sincronización (Lo Crítico)
- [ ] ESPERA 1-2 segundos
- [ ] En Tab 1: Deberías ver que ahora tu slot DERECHO tiene carta (dorso)
- [ ] Dice: "¡Ambos listos! Revelando en 3s..."
- [ ] En Tab 2: Deberías ver lo mismo (tu slot IZQUIERDO ahora tiene dorso)
- [ ] **Ambas pestañas tienen: Dorso Izquierdo | Dorso Derecho**

### Paso 8: Cuenta Regresiva
- [ ] Timer aparece en el centro: "3"
- [ ] Baja a "2", luego "1"
- [ ] Desaparece el timer

### Paso 9: Revelación (LA PRUEBA DEL ARREGLO)
- [ ] 🎉 **AMBAS CARTAS SE VOLTEAN SIMULTÁNEAMENTE**
- [ ] **ÉSTE ERA EL BUG** - Si pasó esto, ¡ESTÁ ARREGLADO! ✅
- [ ] Ves los detalles de ambas cartas (imagen, poder, stats)
- [ ] Se calcula ganador:
  - Alice: "🏆 ¡Victoria! Tanjiro (150) derrota a Saitama (120)"
  - Bob: "💀 Derrota. Tanjiro (150) supera a Saitama (120)"

### Paso 10: Recompensa
- [ ] **Ganador**: Popup aparece "+100 💎" 
- [ ] **Perdedor**: Popup aparece "Perdiste el combate"
- [ ] En tab de ganador: Diamantes aumentan de 500 → 600 (o similar)

### Paso 11: Siguiente Ronda
- [ ] Ambas pantallas muestran "Nueva Batalla" y "🏠 Menú"
- [ ] Ronda 2 comienza automáticamente (si ambos siguen)
- [ ] **Repite desde Paso 5**

---

## 🔴 🟡 🟢 Estados de Validación

| Estado | Indica | Acción |
|--------|--------|--------|
| 🟢 Ambas cartas se revelan | BUG ARREGLADO ✅ | Continúa probando |
| 🟡 Solo una carta se revela | Sincronización parcial | Revisa console |
| 🟡 Dorsos desaparecen antes de revelar | Timing issue | Normal, espera |
| 🔴 Las cartas nunca se revelan | BUG ACTIVO ❌ | Ver Troubleshooting |
| 🔴 Una pestaña se congela | Conexión Supabase | Reinicia |
| 🔴 No aparece invitación | Usuario no registrado | Verifica nombres |

---

## 🔧 Troubleshooting

### Problema: "Las cartas nunca se revelan"

**Paso 1: Abre la consola (F12 → Console tab)**

Escribe:
```javascript
window._pvpMode
```
- Si es `true`: Está en modo PVP ✅
- Si es `false` o undefined: No está en modo PVP ❌

**Paso 2: Verifica Supabase**
```javascript
window._supabase
```
- Si aparece un objeto con `createClient`: Supabase conectado ✅
- Si es null: No hay Supabase ❌

**Paso 3: Busca errores**
En la consola, busca mensajes rojos como:
```
❌ Error enviando resultado: ...
⚠️ sendPvPCombatResult: Sin match activo
⚠️ sendPvPCombatResult: Sin usuario actual
```

**Paso 4: Revisa las columnas de Supabase**

Vas a Supabase → Tu proyecto → SQL Editor

Ejecuta:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'pvp_matches';
```

Deberías ver:
- `player1_card` ✅
- `player2_card` ✅
- `winner_id` ✅ ← **IMPORTANTE**
- `p1_total` ✅
- `p2_total` ✅
- `last_round_result` ✅

Si falta alguna, agrégala:
```sql
ALTER TABLE pvp_matches ADD COLUMN winner_id UUID DEFAULT NULL;
ALTER TABLE pvp_matches ADD COLUMN p1_total INTEGER DEFAULT 0;
ALTER TABLE pvp_matches ADD COLUMN p2_total INTEGER DEFAULT 0;
ALTER TABLE pvp_matches ADD COLUMN last_round_result TEXT DEFAULT NULL;
```

---

### Problema: "Funciona a veces, a veces no"

**Causa probable:** Red lenta o latencia de Supabase

**Soluciones:**
1. Aumenta el delay en `revealCardsAuto()`:
```javascript
setTimeout(() => {
  setTimeout(() => doCombat(), 800); // Cambiar a 1200
}, 100);
```

2. Agrega timeout en `sendPvPCombatResult()`:
```javascript
setTimeout(() => {
  // Reintenta envío si falló
  if (!match.winner_id) window.sendPvPCombatResult(p1_total, p2Total, winner);
}, 2000);
```

---

### Problema: "Funciona en local pero no online"

**Causa:** Las URLs de Supabase no resuelven

**Arreglo:** Verifica en `pvp-mode.js` y `auth.js` que las URLs sean correctas:

```javascript
const sb = window.supabase.createClient(
  'https://wcxmpgjnxbpyzjdcglub.supabase.co',  // ← Debe ser tu proyecto
  'sb_publishable_waAwJYdgoncI1f9xLyVCjw_7br9pKsP'
);
```

Si están mal, reemplaza con tus credenciales reales de Supabase.

---

## ✨ Indicadores de Éxito

Cuando todo funciona correctamente, verás en console:

```
✅ Carta enviada: Tanjiro
✅ Carta enviada: Saitama
📤 Resultado enviado a Supabase: {p1Total: 150, p2Total: 120, winner: 'player'}
📊 Match actualizado: {winner_id: 'abc123', p1_total: 150, p2_total: 120}
📊 handlePvPResult - Match: {...}
🎯 isWinner: true | isDraw: false
✅ Victoria
```

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona:

1. **Copia los logs de console** (click derecho → Save as...)
2. **Toma screenshot del error**
3. **Anota qué paso falló**
4. **Cuéntame qué ves vs qué esperas**

Estaremos listos para arreglarlo. 🚀

---

**Versión:** Checklist v1.0
**Última actualización:** Mayo 26, 2026
