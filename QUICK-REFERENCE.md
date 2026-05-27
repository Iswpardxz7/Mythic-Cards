# 🚀 Quick Reference - Cambios PVP Exactos

## 📦 Archivos Modificados

```
✅ pvp-mode.js     - 3 cambios principales
✅ index.html      - 1 cambio en doCombat()
```

---

## 🔧 Cambio 1: pvp-mode.js - Línea ~410

**AGREGADA FUNCIÓN NUEVA:**

```javascript
window.sendPvPCombatResult = async function (player1Total, player2Total, winnerRole) {
  // Envía el resultado de cada ronda a Supabase
  // Calcula winner_id basado en quién ganó
  // Guarda p1_total, p2_total, last_round_result
}
```

**Ubicación:** Después de `sendPvPCardSelection()`

**Propósito:** Sincronizar resultado de cada ronda a la BD

---

## 🔧 Cambio 2: pvp-mode.js - Función subscribeToPvPMatch()

**ANTES:**
```javascript
if (match.player1_card && match.player2_card && match.winner_id) {
  handlePvPResult(match);
}
```

**DESPUÉS:**
```javascript
if (
  match.player1_card && 
  match.player2_card && 
  (match.winner_id !== undefined || match.last_round_result)
) {
  console.log('✅ Ambos jugadores tienen cartas + resultado disponible');
  handlePvPResult(match);
}
```

**Por qué:** Acepta `null` como `winner_id` (empates) y valida mejor

---

## 🔧 Cambio 3: pvp-mode.js - Función handlePvPResult()

**ANTES:**
```javascript
function handlePvPResult(match) {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) return;

  const isWinner = match.winner_id === user.id;
  processPvPVictory(isWinner);
}
```

**DESPUÉS:**
```javascript
function handlePvPResult(match) {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) return;

  console.log('📊 handlePvPResult - Match:', match);

  const isWinner = match.winner_id === user.id;
  const isDraw = match.winner_id === null && match.p1_total !== undefined && match.p2_total !== undefined;

  console.log('🎯 isWinner:', isWinner, '| isDraw:', isDraw, '| winner_id:', match.winner_id);

  if (isDraw) {
    console.log('⚖️ Empate');
    processPvPRoundResult('draw');
  } else if (isWinner) {
    console.log('✅ Victoria');
    processPvPRoundResult('win');
  } else {
    console.log('❌ Derrota');
    processPvPRoundResult('loss');
  }
}
```

**Por qué:** 
- Maneja empates correctamente
- Diferencia entre ronda y fin del juego
- Mejor debugging con logs

---

## 🔧 Cambio 4: index.html - Función doCombat() (Línea ~4805)

**AGREGADAS LÍNEAS (después de calcular ganador):**

```javascript
// 🎮 SINCRONIZAR RESULTADO A SUPABASE EN PVP
if (window._pvpMode && typeof window.sendPvPCombatResult === 'function') {
  window.sendPvPCombatResult(p1Total, p2Total, winner);
  console.log('📤 Resultado enviado a Supabase:', { p1Total, p2Total, winner });
}
```

**Ubicación:** Después de `setLog(logMsg);` y antes de `spawnParticles(winner);`

**Por qué:** Dispara automáticamente el envío del resultado a Supabase cuando termina cada ronda

---

## 🔄 Flujo Sincronización Antes vs Después

### ❌ ANTES (Buggeado):
```
selectCard() 
→ sendPvPCardSelection() 
→ Polling 
→ revealCardsAuto() 
→ doCombat() 
→ ❌ NADA (resultado no se sincroniza)
→ handlePvPResult() nunca se llama
→ Las cartas NO se desbloquean en el otro navegador
```

### ✅ DESPUÉS (Arreglado):
```
selectCard() 
→ sendPvPCardSelection() ✅ Carta en BD
→ Polling detecta ambas cartas 
→ revealCardsAuto() 
→ doCombat() 
→ sendPvPCombatResult() ✅ RESULTADO en BD
→ Supabase Realtime notifica al otro jugador
→ handlePvPResult() se ejecuta ✅
→ Las cartas se desbloquean en ambas pestañas ✅
```

---

## 📋 Checklist de Implementación

- [x] `pvp-mode.js` - Función `sendPvPCombatResult()` agregada
- [x] `pvp-mode.js` - `subscribeToPvPMatch()` mejorado
- [x] `pvp-mode.js` - `handlePvPResult()` mejorado con empates
- [x] `index.html` - `doCombat()` llama a `sendPvPCombatResult()`
- [x] Documentación completa
- [x] Checklist de pruebas

---

## 🧪 Prueba Rápida (1 minuto)

1. Abre 2 tabs
2. Registra "user1" y "user2"
3. user1 invita a user2
4. user2 acepta
5. user1 elige carta
6. user2 elige carta diferente
7. **¿Las 2 cartas se revelan al mismo tiempo? ✅ = FUNCIONA**

---

## 🆘 Si no funciona

1. Abre F12 → Console
2. Busca mensajes rojos o advertencias
3. Verifica que `pvp-mode.js` e `index.html` fueron actualizados
4. Reinicia navegador (Ctrl+Shift+R)
5. Verifica en Supabase que `pvp_matches` tenga columna `winner_id`

---

## 📞 Debugging Rápido en Console

```javascript
// Ver si estamos en PVP
window._pvpMode

// Ver datos del match
pvpActiveMatch

// Forzar envío de resultado (para testing)
sendPvPCombatResult(150, 120, 'player')

// Ver último log
console.log('Todo bien')
```

---

**¡Listo!** Los cambios son mínimos pero críticos. 🎮✨
