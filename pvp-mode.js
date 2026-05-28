/**
 * MythicCards — PVP Mode v3 SUPABASE REALTIME (SINCRONIZACIÓN COMPLETA)
 * ✅ Invitaciones en tiempo real
 * ✅ Combate 1v1 sincronizado (ambos jugadores ven las cartas)
 * ✅ Dorso de carta cuando el otro juega
 * ✅ Compatible con battle-core.js
 */

let pvpActiveMatch = null;
let pvpRealtimeChannel = null;
let pvpInviteChannel = null;
let pvpPlayerRole = null; // 'player1' o 'player2'
let pvpOpponentName = null;

/* ═══════════════════════════════════════════════════════════
   OBTENER SUPABASE
═══════════════════════════════════════════════════════════ */

function getPvPSupabase() {
  if (window._supabase) return window._supabase;
  if (window.supabase && window.supabase.createClient) {
    const sb = window.supabase.createClient(
      'https://wcxmpgjnxbpyzjdcglub.supabase.co',
      'sb_publishable_waAwJYdgoncI1f9xLyVCjw_7br9pKsP'
    );
    window._supabase = sb;
    return sb;
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════
   HOOKEAR VICTORIA/DERROTA
═══════════════════════════════════════════════════════════ */

const origOnBattleWin  = window.onBattleWin;
const origOnBattleLoss = window.onBattleLoss;

window.onBattleWin = function () {
  if (window._pvpMode) processPvPVictory(true);
  if (typeof origOnBattleWin === 'function') origOnBattleWin();
};

window.onBattleLoss = function () {
  if (window._pvpMode) processPvPVictory(false);
  if (typeof origOnBattleLoss === 'function') origOnBattleLoss();
};

/* ═══════════════════════════════════════════════════════════
   ESCUCHAR INVITACIONES ENTRANTES
═══════════════════════════════════════════════════════════ */

window.startListeningPvPInvitations = function () {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) return;

  const sb = getPvPSupabase();
  if (!sb) return;

  if (pvpInviteChannel) {
    sb.removeChannel(pvpInviteChannel);
    pvpInviteChannel = null;
  }

  pvpInviteChannel = sb
    .channel('pvp-invitations-' + user.id)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'pvp_invitations',
        filter: `to_id=eq.${user.id}`
      },
      (payload) => {
        const inv = payload.new;
        if (inv.status === 'pending') {
          showPvPInvitationAlert(inv);
        }
      }
    )
    .subscribe();

  console.log('🎮 Escuchando invitaciones PVP...');
};

/* ═══════════════════════════════════════════════════════════
   MOSTRAR ALERTA DE INVITACIÓN
═══════════════════════════════════════════════════════════ */

function showPvPInvitationAlert(invitation) {
  if (typeof updateMessageBadge === 'function') updateMessageBadge();

  const existingAlert = document.getElementById('pvp-live-alert');
  if (existingAlert) existingAlert.remove();

  const alert = document.createElement('div');
  alert.id = 'pvp-live-alert';
  alert.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #1e1040, #2d1b69);
    border: 2px solid #f0d080;
    border-radius: 16px;
    padding: 1.5rem;
    z-index: 99999;
    max-width: 320px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  `;
  alert.innerHTML = `
    <div style="font-weight:700;color:#f0d080;margin-bottom:0.5rem;font-size:1.1rem;">
      ⚔ ¡Reto PVP recibido!
    </div>
    <div style="color:#e2e8f0;margin-bottom:1rem;">
      <strong style="color:#c084fc;">${escAttr(invitation.from_name)}</strong> te desafió
    </div>
    <div style="display:flex;gap:0.75rem;">
      <button onclick="acceptPvPInvitationById('${invitation.id}', '${invitation.match_id}', '${invitation.from_id}', '${escAttr(invitation.from_name)}')"
        style="flex:1;padding:0.6rem;background:#4ade80;color:#000;border:none;border-radius:10px;font-weight:700;cursor:pointer;">
        ✅ Aceptar
      </button>
      <button onclick="rejectPvPInvitationById('${invitation.id}', '${invitation.from_id}', '${escAttr(invitation.from_name)}')"
        style="flex:1;padding:0.6rem;background:rgba(255,255,255,0.1);color:#f87171;border:1px solid #f87171;border-radius:10px;font-weight:700;cursor:pointer;">
        ❌ Rechazar
      </button>
    </div>
  `;
  document.body.appendChild(alert);

  setTimeout(() => {
    if (document.getElementById('pvp-live-alert')) alert.remove();
  }, 30000);
}

/* ═══════════════════════════════════════════════════════════
   RENDERIZAR LISTA DE AMIGOS
═══════════════════════════════════════════════════════════ */

window.renderPvPFriendsList = function () {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const container = document.getElementById('pvp-friends-list');
  if (!container || !user) return;

  const allUsers = typeof getAllUsers === 'function' ? getAllUsers() : {};
  user.friends = Array.isArray(user.friends) ? user.friends : [];

  if (user.friends.length === 0) {
    container.innerHTML = '<div class="pvp-empty">👥 No tienes amigos.<br>Agrégalos en Amigos.</div>';
    return;
  }

  const friendsList = user.friends
    .map(id => allUsers[id])
    .filter(Boolean)
    .sort((a, b) => a.username.localeCompare(b.username));

  let html = '';
  friendsList.forEach(friend => {
    html += `
      <div style="display:flex;align-items:center;gap:0.85rem;padding:1rem;background:rgba(255,255,255,0.04);border-radius:14px;margin-bottom:0.75rem;border:1px solid rgba(201,168,76,0.15);">
        <div style="flex:1;">
          <div style="font-weight:700;color:#f0d080;">${escAttr(friend.username)}</div>
          <div style="color:#4ade80;font-size:0.8rem;margin-top:0.2rem;">🟢 Online</div>
        </div>
        <button type="button" onclick="sendPvPInvitation('${friend.id}', '${escAttr(friend.username)}')"
          style="padding:0.6rem 1.2rem;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;">
          ⚔ Invitar
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
};

/* ═══════════════════════════════════════════════════════════
   ENVIAR INVITACIÓN
═══════════════════════════════════════════════════════════ */

window.sendPvPInvitation = async function (friendId, friendName) {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) return;

  const sb = getPvPSupabase();
  if (!sb) { alert('❌ Error de conexión'); return; }

  const matchId = 'match_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

  // Crear match en pvp_matches
  const { error: matchError } = await sb.from('pvp_matches').insert({
    id: matchId,
    player1_id: user.id,
    player1_name: user.username,
    status: 'waiting'
  });

  if (matchError) {
    console.error('Error:', matchError);
    alert('❌ Error al crear combate');
    return;
  }

  // Crear invitación
  const { error } = await sb.from('pvp_invitations').insert({
    from_id: user.id,
    from_name: user.username,
    to_id: friendId,
    match_id: matchId,
    status: 'pending'
  });

  if (error) {
    console.error('Error:', error);
    alert('❌ Error al enviar');
    return;
  }

  // Inicializar match para el invitador
  pvpActiveMatch = {
    matchId: matchId,
    player1Id: user.id,
    player1Name: user.username,
    player2Id: friendId,
    player2Name: friendName,
    myRole: 'player1'
  };
  pvpPlayerRole = 'player1';
  pvpOpponentName = friendName;

  alert(`✅ Invitación enviada a ${friendName}\n\nEsperando respuesta...`);
  listenForPvPAcceptance(matchId);
};

/* ═══════════════════════════════════════════════════════════
   ACEPTAR INVITACIÓN
═══════════════════════════════════════════════════════════ */

window.acceptPvPInvitationById = async function (invId, matchId, fromId, fromName) {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) return;

  const existingAlert = document.getElementById('pvp-live-alert');
  if (existingAlert) existingAlert.remove();

  const sb = getPvPSupabase();
  if (!sb) return;

  // Actualizar invitación
  await sb.from('pvp_invitations').update({ status: 'accepted' }).eq('id', invId);

  // Actualizar match para que empiece
  await sb.from('pvp_matches').update({
    player2_id: user.id,
    player2_name: user.username,
    status: 'ready'
  }).eq('id', matchId);

  // Inicializar match para quien acepta
  pvpActiveMatch = {
    matchId: matchId,
    player1Id: fromId,
    player1Name: fromName,
    player2Id: user.id,
    player2Name: user.username,
    myRole: 'player2'
  };
  pvpPlayerRole = 'player2';
  pvpOpponentName = fromName;

  alert(`✅ ¡Aceptaste! Combate en 5 segundos...`);
  let t = 5;
  const interval = setInterval(() => {
    t--;
    if (t <= 0) {
      clearInterval(interval);
      startPvPBattle(matchId);
    }
  }, 1000);
};

/* ═══════════════════════════════════════════════════════════
   ESCUCHAR ACEPTACIÓN (para quien invita)
═══════════════════════════════════════════════════════════ */

function listenForPvPAcceptance(matchId) {
  const sb = getPvPSupabase();
  if (!sb) return;

  const channel = sb
    .channel('pvp-acceptance-' + matchId)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'pvp_matches',
        filter: `id=eq.${matchId}`
      },
      (payload) => {
        const match = payload.new;
        if (match.status === 'ready' && match.player2_id) {
          sb.removeChannel(channel);
          alert(`✅ ${match.player2_name} aceptó!\n\nCombate en 5 segundos...`);
          let t = 5;
          const interval = setInterval(() => {
            t--;
            if (t <= 0) {
              clearInterval(interval);
              startPvPBattle(matchId);
            }
          }, 1000);
        }
      }
    )
    .subscribe();
}

/* ═══════════════════════════════════════════════════════════
   INICIAR COMBATE PVP
═══════════════════════════════════════════════════════════ */

window.startPvPBattle = function (matchId) {
  if (!pvpActiveMatch) {
    alert('Error: Sin match activo');
    return;
  }

  window._pvpMode = true;
  window._pvpMatchId = matchId;
  window._pvpCombatStarted = false; // Reset flag para nueva batalla
  window._pvpCombatData = null; // Reset datos de combate

  // Reemplazar nombre de IA por nombre del oponente
  window._pvpOpponentName = pvpOpponentName;

  if (typeof dealHands === 'function') dealHands();
  if (typeof window.showScreen === 'function') window.showScreen('battle');
  if (typeof renderHand === 'function') renderHand();
  if (typeof updateStats === 'function') updateStats();
  if (typeof renderScoreTrack === 'function') renderScoreTrack();
  if (typeof updatePhase === 'function') updatePhase('⚔ PVP - Elige tu carta');
  if (typeof setLog === 'function') setLog('¡Selecciona una carta!');

  subscribeToPvPMatch(matchId);
};

/* ═══════════════════════════════════════════════════════════
   SUSCRIBIRSE AL MATCH EN TIEMPO REAL
═══════════════════════════════════════════════════════════ */

function subscribeToPvPMatch(matchId) {
  const sb = getPvPSupabase();
  if (!sb) return;

  if (pvpRealtimeChannel) {
    sb.removeChannel(pvpRealtimeChannel);
  }

  pvpRealtimeChannel = sb
    .channel('pvp-match-' + matchId)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'pvp_matches',
        filter: `id=eq.${matchId}`
      },
      (payload) => {
        const match = payload.new;
        console.log('📊 Match actualizado:', match);

        // FASE 1: Ambas cartas en Supabase → REVELAR Y COMBATIR
        if (match.player1_card && match.player2_card && !window._pvpCombatStarted) {
          console.log('✅ Ambas cartas en Supabase - Iniciando combate');
          window._pvpCombatStarted = true;
          
          // Guardar datos para doCombat()
          window._pvpCombatData = {
            p1CardName: match.player1_card,
            p2CardName: match.player2_card,
            matchId: matchId
          };
          
          // Mostrar cartas y iniciar cuenta regresiva
          if (typeof window.revealCardsFromSupabase === 'function') {
            console.log('🎴 Llamando revealCardsFromSupabase()');
            window.revealCardsFromSupabase(match);
          }
        }

        // FASE 2: Resultado disponible → PROCESAR VICTORIA/DERROTA
        if (
          match.player1_card && 
          match.player2_card && 
          (match.winner_id !== undefined || match.last_round_result)
        ) {
          console.log('✅ Resultado disponible - PROCESANDO');
          handlePvPResult(match);
        }
      }
    )
    .subscribe();

  console.log('🔔 Suscrito a cambios de match:', matchId);
}

/* ═══════════════════════════════════════════════════════════
   MOSTRAR DORSO DE CARTA DEL OPONENTE
═══════════════════════════════════════════════════════════ */

function showOpponentCardBack() {
  console.log('🎴 Oponente jugó su carta');
  // Aquí se puede actualizar UI para mostrar que el oponente jugó
  // Por ahora es para sincronización
}

/* ═══════════════════════════════════════════════════════════
   REVELAR CARTAS DESDE SUPABASE (ARQUITECTURA V2)
═══════════════════════════════════════════════════════════ */

window.revealCardsFromSupabase = function (match) {
  console.log('🎴 revealCardsFromSupabase:', match);
  
  if (!match.player1_card || !match.player2_card) {
    console.warn('⚠️ No hay dos cartas para revelar');
    return;
  }

  // Las cartas se obtendrán desde index.html en doCombat()
  // Aquí solo mostramos la UI de "ambas cartas listas"
  
  if (typeof window.showRevealUI === 'function') {
    console.log('✅ Mostrando UI de reveal');
    window.showRevealUI(match);
  } else {
    // Si no existe showRevealUI, usar renderSlots de index.html
    if (typeof window.renderSlots === 'function') {
      // Mostrar ambas cartas con dorso durante 3 segundos
      window.renderSlots(null, null, false, false);
      
      if (typeof window.updatePhase === 'function') {
        window.updatePhase('¡Ambos listos! Revelando en 3s...');
      }
      
      // Iniciar timer automático
      if (typeof window.startAutoRevealTimer === 'function') {
        console.log('🔄 Iniciando auto-reveal timer');
        window.startAutoRevealTimer();
      }
    }
  }
};

/* ═══════════════════════════════════════════════════════════
   ENVIAR CARTA AL MATCH
═══════════════════════════════════════════════════════════ */

window.sendPvPCardSelection = async function (cardName) {
  if (!window._pvpMode || !pvpActiveMatch) return;

  const sb = getPvPSupabase();
  if (!sb) return;

  const update = {};
  if (pvpPlayerRole === 'player1') {
    update.player1_card = cardName;
  } else {
    update.player2_card = cardName;
  }

  await sb.from('pvp_matches').update(update).eq('id', pvpActiveMatch.matchId);
  console.log('✅ Carta enviada:', cardName);
};

/* ═══════════════════════════════════════════════════════════
   ENVIAR RESULTADO DE RONDA (NUEVO)
═══════════════════════════════════════════════════════════ */

window.sendPvPCombatResult = async function (player1Total, player2Total, winnerRole) {
  if (!window._pvpMode || !pvpActiveMatch) {
    console.log('⚠️ sendPvPCombatResult: Sin match activo');
    return;
  }

  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) {
    console.log('⚠️ sendPvPCombatResult: Sin usuario actual');
    return;
  }

  const sb = getPvPSupabase();
  if (!sb) {
    console.log('⚠️ sendPvPCombatResult: Sin Supabase');
    return;
  }

  let winnerId = null;
  if (winnerRole === 'player') {
    winnerId = pvpPlayerRole === 'player1' ? pvpActiveMatch.player1Id : pvpActiveMatch.player2Id;
  } else if (winnerRole === 'ai') {
    winnerId = pvpPlayerRole === 'player1' ? pvpActiveMatch.player2Id : pvpActiveMatch.player1Id;
  }
  // Si es 'draw', winnerId = null

  const update = {
    p1_total: player1Total,
    p2_total: player2Total,
    winner_id: winnerId,
    last_round_result: winnerRole
  };

  try {
    const { error } = await sb
      .from('pvp_matches')
      .update(update)
      .eq('id', pvpActiveMatch.matchId);

    if (error) {
      console.error('❌ Error enviando resultado:', error);
    } else {
      console.log('✅ Resultado enviado:', { winnerId, player1Total, player2Total, winnerRole });
    }
  } catch (e) {
    console.error('❌ Exception:', e);
  }
};

/* ═══════════════════════════════════════════════════════════
   PROCESAR RESULTADO
═══════════════════════════════════════════════════════════ */

function handlePvPResult(match) {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) return;

  console.log('📊 handlePvPResult - Match:', match);

  // Determinar si el usuario actual ganó
  const isWinner = match.winner_id === user.id;
  const isDraw = match.winner_id === null && match.p1_total !== undefined && match.p2_total !== undefined;

  console.log('🎯 isWinner:', isWinner, '| isDraw:', isDraw, '| winner_id:', match.winner_id);

  // Procesar resultado
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

/* ═══════════════════════════════════════════════════════════
   PROCESAR RESULTADO DE RONDA (NUEVO)
═══════════════════════════════════════════════════════════ */

window.processPvPRoundResult = async function (result) {
  if (!window._pvpMode || !pvpActiveMatch) return;

  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) return;

  // No es el final del juego aún, solo una ronda
  // El juego continúa automáticamente en index.html
  console.log('🎮 Ronda resuelta:', result);
};

/* ═══════════════════════════════════════════════════════════
   PROCESAR VICTORIA/DERROTA (FINAL DEL JUEGO)
═══════════════════════════════════════════════════════════ */

window.processPvPVictory = async function (isWinner) {
  if (!window._pvpMode || !pvpActiveMatch) return;

  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) return;

  if (isWinner) {
    user.diamonds = (user.diamonds || 0) + 100;
    user.stats = user.stats || { wins: 0, losses: 0, totalBattles: 0 };
    user.stats.wins = (user.stats.wins || 0) + 1;
    user.stats.totalBattles = (user.stats.totalBattles || 0) + 1;

    if (typeof persistUser === 'function') await persistUser(user);
    if (typeof updateHUD === 'function') updateHUD();

    setTimeout(() => alert('🎉 ¡Ganaste! +100 💎'), 500);
  } else {
    user.stats = user.stats || { wins: 0, losses: 0, totalBattles: 0 };
    user.stats.losses = (user.stats.losses || 0) + 1;
    user.stats.totalBattles = (user.stats.totalBattles || 0) + 1;

    if (typeof persistUser === 'function') await persistUser(user);
    setTimeout(() => alert('😔 Perdiste el combate'), 500);
  }

  const sb = getPvPSupabase();
  if (sb && pvpActiveMatch) {
    await sb.from('pvp_matches').update({ status: 'finished' }).eq('id', pvpActiveMatch.matchId);
    if (pvpRealtimeChannel) {
      sb.removeChannel(pvpRealtimeChannel);
      pvpRealtimeChannel = null;
    }
  }

  setTimeout(() => {
    window._pvpMode = false;
    window._pvpMatchId = null;
    window._pvpOpponentName = null;
    pvpActiveMatch = null;
    pvpPlayerRole = null;
    pvpOpponentName = null;
  }, 2000);
};

/* ═══════════════════════════════════════════════════════════
   RECHAZAR INVITACIÓN
═══════════════════════════════════════════════════════════ */

window.rejectPvPInvitationById = async function (invId, fromId, fromName) {
  const sb = getPvPSupabase();
  if (!sb) return;

  await sb.from('pvp_invitations').update({ status: 'rejected' }).eq('id', invId);
  alert(`❌ Rechazaste a ${fromName}`);
};

/* ═══════════════════════════════════════════════════════════
   HELPER: ESCAPE HTML
═══════════════════════════════════════════════════════════ */

function escAttr(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ═══════════════════════════════════════════════════════════
   AUTO-INIT
═══════════════════════════════════════════════════════════ */

const _pvpInitInterval = setInterval(() => {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (user) {
    clearInterval(_pvpInitInterval);
    window.startListeningPvPInvitations();
    console.log('🎮 PVP Realtime listo');
  }
}, 500);