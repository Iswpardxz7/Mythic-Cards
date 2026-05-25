/**
 * MythicCards — PVP Mode v2 SUPABASE REALTIME
 * ✅ Invitaciones en tiempo real entre jugadores
 * ✅ Combate 1v1 sincronizado entre dispositivos
 * ✅ Ganador recibe 100 💎 guardado en la nube
 * ✅ Compatible 100% con el sistema de batalla existente
 */

/* ═════════════════════════════════════════════════════════════
   VARIABLES GLOBALES
═════════════════════════════════════════════════════════════ */

let pvpActiveMatch = null;
let pvpRealtimeChannel = null;  // Canal de Supabase Realtime para el match activo
let pvpInviteChannel = null;    // Canal para escuchar invitaciones entrantes

/* ═════════════════════════════════════════════════════════════
   HELPER: OBTENER SUPABASE
═════════════════════════════════════════════════════════════ */

function getPvPSupabase() {
  if (window._supabase) return window._supabase;
  if (window.supabase && window.supabase.createClient) {
    // Reusar el cliente ya creado en auth.js
    const sb = window.supabase.createClient(
      'https://wcxmpgjnxbpyzjdcglub.supabase.co',
      'sb_publishable_waAwJYdgoncI1f9xLyVCjw_7br9pKsP'
    );
    window._supabase = sb;
    return sb;
  }
  return null;
}

/* ═════════════════════════════════════════════════════════════
   HOOKEAR VICTORIA/DERROTA EN COMBATE
═════════════════════════════════════════════════════════════ */

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

/* ═════════════════════════════════════════════════════════════
   ESCUCHAR INVITACIONES ENTRANTES EN TIEMPO REAL
   (se llama cuando el usuario inicia sesión)
═════════════════════════════════════════════════════════════ */

window.startListeningPvPInvitations = function () {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) return;

  const sb = getPvPSupabase();
  if (!sb) return;

  // Desuscribirse si ya hay un canal abierto
  if (pvpInviteChannel) {
    sb.removeChannel(pvpInviteChannel);
    pvpInviteChannel = null;
  }

  // Escuchar invitaciones nuevas dirigidas a este usuario
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

  console.log('🎮 Escuchando invitaciones PVP en tiempo real...');
};

/* ═════════════════════════════════════════════════════════════
   MOSTRAR ALERTA DE INVITACIÓN ENTRANTE
═════════════════════════════════════════════════════════════ */

function showPvPInvitationAlert(invitation) {
  // Actualizar badge de mensajes si existe
  if (typeof updateMessageBadge === 'function') updateMessageBadge();

  // Mostrar notificación visual
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
    animation: slideIn 0.3s ease;
  `;
  alert.innerHTML = `
    <div style="font-weight:700;color:#f0d080;margin-bottom:0.5rem;font-size:1.1rem;">
      ⚔ ¡Reto PVP recibido!
    </div>
    <div style="color:#e2e8f0;margin-bottom:1rem;">
      <strong style="color:#c084fc;">${escAttr(invitation.from_name)}</strong> te ha desafiado a un 1v1
    </div>
    <div style="color:#94a3b8;font-size:0.85rem;margin-bottom:1rem;">
      🏆 Ganador recibe 100 💎
    </div>
    <div style="display:flex;gap:0.75rem;">
      <button onclick="acceptPvPInvitationById('${invitation.id}', '${invitation.match_id}', '${invitation.from_id}', '${escAttr(invitation.from_name)}')"
        style="flex:1;padding:0.6rem;background:linear-gradient(135deg,#4ade80,#22c55e);color:#000;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:0.9rem;">
        ✅ Aceptar
      </button>
      <button onclick="rejectPvPInvitationById('${invitation.id}', '${invitation.from_id}', '${escAttr(invitation.from_name)}')"
        style="flex:1;padding:0.6rem;background:rgba(255,255,255,0.1);color:#f87171;border:1px solid #f87171;border-radius:10px;font-weight:700;cursor:pointer;font-size:0.9rem;">
        ❌ Rechazar
      </button>
    </div>
  `;
  document.body.appendChild(alert);

  // Auto-cerrar después de 30 segundos
  setTimeout(() => {
    if (document.getElementById('pvp-live-alert')) {
      alert.remove();
    }
  }, 30000);
}

/* ═════════════════════════════════════════════════════════════
   RENDERIZAR LISTA DE AMIGOS PARA INVITAR
═════════════════════════════════════════════════════════════ */

window.renderPvPFriendsList = function () {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const container = document.getElementById('pvp-friends-list');
  if (!container || !user) return;

  const allUsers = typeof getAllUsers === 'function' ? getAllUsers() : {};
  user.friends = Array.isArray(user.friends) ? user.friends : [];

  if (user.friends.length === 0) {
    container.innerHTML = '<div class="pvp-empty">👥 No tienes amigos agregados.<br>Añade amigos en el apartado de Amigos.</div>';
    return;
  }

  const friendsList = user.friends
    .map(id => allUsers[id])
    .filter(Boolean)
    .sort((a, b) => a.username.localeCompare(b.username));

  let html = '';
  friendsList.forEach(friend => {
    html += `
      <div class="pvp-friend-card" style="display:flex;align-items:center;gap:0.85rem;padding:1rem;background:rgba(255,255,255,0.04);border-radius:14px;margin-bottom:0.75rem;border:1px solid rgba(201,168,76,0.15);">
        <div style="flex:1;min-width:0">
          <div class="pvp-friend-name" style="font-weight:700;color:#f0d080;font-size:1rem;">${escAttr(friend.username)}</div>
          <div style="color:#4ade80;font-size:0.8rem;margin-top:0.2rem;">🟢 Registrado</div>
        </div>
        <button type="button"
          style="padding:0.6rem 1.2rem;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;"
          onclick="sendPvPInvitation('${friend.id}', '${escAttr(friend.username)}')">
          ⚔ Invitar
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
};

/* ═════════════════════════════════════════════════════════════
   ENVIAR INVITACIÓN PVP (en tiempo real via Supabase)
═════════════════════════════════════════════════════════════ */

window.sendPvPInvitation = async function (friendId, friendName) {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) return;

  const sb = getPvPSupabase();
  if (!sb) { alert('❌ Error de conexión'); return; }

  const matchId = 'match_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

  // Crear la invitación en Supabase (el amigo la recibirá en tiempo real)
  const { error } = await sb.from('pvp_invitations').insert({
    from_id: user.id,
    from_name: user.username,
    to_id: friendId,
    match_id: matchId,
    status: 'pending'
  });

  if (error) {
    console.error('Error enviando invitación:', error);
    alert('❌ Error al enviar la invitación');
    return;
  }

  alert(`✅ Invitación enviada a ${friendName}\n\nEspera a que acepte el reto...`);
};

/* ═════════════════════════════════════════════════════════════
   ACEPTAR INVITACIÓN (por ID de Supabase)
═════════════════════════════════════════════════════════════ */

window.acceptPvPInvitationById = async function (invId, matchId, fromId, fromName) {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) return;

  // Cerrar la alerta visual
  const alertEl = document.getElementById('pvp-live-alert');
  if (alertEl) alertEl.remove();

  const sb = getPvPSupabase();
  if (!sb) return;

  // Marcar invitación como aceptada
  await sb.from('pvp_invitations').update({ status: 'accepted' }).eq('id', invId);

  // Crear la partida en Supabase
  const { error } = await sb.from('pvp_matches').upsert({
    id: matchId,
    player1_id: fromId,
    player1_name: fromName,
    player2_id: user.id,
    player2_name: user.username,
    status: 'ready',
    player1_card: null,
    player2_card: null,
    winner_id: null
  });

  if (error) {
    console.error('Error creando partida:', error);
    alert('❌ Error al iniciar la partida');
    return;
  }

  // Guardar match activo
  pvpActiveMatch = {
    matchId,
    player1Id: fromId,
    player1Name: fromName,
    player2Id: user.id,
    player2Name: user.username,
    myRole: 'player2'
  };

  alert(`✅ ¡Reto aceptado!\nEl combate iniciará en 5 segundos...`);

  // Countdown y luego inicio
  let t = 5;
  const interval = setInterval(() => {
    t--;
    if (t <= 0) {
      clearInterval(interval);
      startPvPBattle(matchId);
    }
  }, 1000);
};

/* ═════════════════════════════════════════════════════════════
   RECHAZAR INVITACIÓN
═════════════════════════════════════════════════════════════ */

window.rejectPvPInvitationById = async function (invId, fromId, fromName) {
  const alertEl = document.getElementById('pvp-live-alert');
  if (alertEl) alertEl.remove();

  const sb = getPvPSupabase();
  if (!sb) return;

  await sb.from('pvp_invitations').update({ status: 'rejected' }).eq('id', invId);

  console.log(`❌ Invitación de ${fromName} rechazada`);
};

/* ═════════════════════════════════════════════════════════════
   ESCUCHAR SI EL RIVAL ACEPTA (para el que envió la invitación)
═════════════════════════════════════════════════════════════ */

window.listenForPvPAcceptance = function (matchId) {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) return;

  const sb = getPvPSupabase();
  if (!sb) return;

  const channel = sb
    .channel('pvp-accept-' + matchId)
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
          pvpActiveMatch = {
            matchId: match.id,
            player1Id: match.player1_id,
            player1Name: match.player1_name,
            player2Id: match.player2_id,
            player2Name: match.player2_name,
            myRole: 'player1'
          };
          alert(`✅ ${match.player2_name} aceptó el reto!\nEl combate iniciará en 5 segundos...`);
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
};

/* ═════════════════════════════════════════════════════════════
   INICIAR COMBATE PVP
═════════════════════════════════════════════════════════════ */

window.startPvPBattle = function (matchId) {
  if (!pvpActiveMatch) {
    alert('Error: No hay match activo');
    return;
  }

  window._pvpMode    = true;
  window._pvpMatchId = matchId;

  if (typeof dealHands === 'function') dealHands();

  if (typeof window.showScreen === 'function') window.showScreen('battle');
  else if (typeof showScreen === 'function') showScreen('battle');

  if (typeof renderHand === 'function') renderHand();
  if (typeof updateStats === 'function') updateStats();
  if (typeof renderScoreTrack === 'function') renderScoreTrack();
  if (typeof updatePhase === 'function') updatePhase('⚔ Combate PVP - Elige tu carta');
  if (typeof setLog === 'function') setLog('¡Elige una carta para el combate!');

  // Suscribirse al canal del match para sincronización
  subscribeToPvPMatch(matchId);
};

/* ═════════════════════════════════════════════════════════════
   SUSCRIBIRSE AL CANAL DEL MATCH EN TIEMPO REAL
═════════════════════════════════════════════════════════════ */

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
        if (match.player1_card && match.player2_card && match.winner_id) {
          // Ambos jugaron, mostrar resultado
          handlePvPResult(match);
        }
      }
    )
    .subscribe();
}

/* ═════════════════════════════════════════════════════════════
   PROCESAR RESULTADO DEL COMBATE PVP
═════════════════════════════════════════════════════════════ */

function handlePvPResult(match) {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) return;

  const isWinner = match.winner_id === user.id;
  processPvPVictory(isWinner);
}

/* ═════════════════════════════════════════════════════════════
   PROCESAR VICTORIA/DERROTA
═════════════════════════════════════════════════════════════ */

window.processPvPVictory = async function (isWinner) {
  if (!window._pvpMode || !pvpActiveMatch) return;

  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) return;

  if (isWinner) {
    user.diamonds = (user.diamonds || 0) + 100;
    user.stats = user.stats || { wins: 0, losses: 0, totalBattles: 0 };
    user.stats.wins = (user.stats.wins || 0) + 1;
    user.stats.totalBattles = (user.stats.totalBattles || 0) + 1;

    await window.persistUser(user);
    if (typeof updateHUD === 'function') updateHUD();

    setTimeout(() => alert('🎉 ¡Ganaste el PVP! +100 💎'), 500);
  } else {
    user.stats = user.stats || { wins: 0, losses: 0, totalBattles: 0 };
    user.stats.losses = (user.stats.losses || 0) + 1;
    user.stats.totalBattles = (user.stats.totalBattles || 0) + 1;

    await window.persistUser(user);
    setTimeout(() => alert('😔 Perdiste el combate. ¡Mejor suerte la próxima!'), 500);
  }

  // Limpiar estado PVP
  const sb = getPvPSupabase();
  if (sb && pvpActiveMatch) {
    await sb.from('pvp_matches').update({ status: 'finished' }).eq('id', pvpActiveMatch.matchId);
    if (pvpRealtimeChannel) {
      sb.removeChannel(pvpRealtimeChannel);
      pvpRealtimeChannel = null;
    }
  }

  setTimeout(() => {
    window._pvpMode    = false;
    window._pvpMatchId = null;
    pvpActiveMatch     = null;
  }, 2000);
};

/* ═════════════════════════════════════════════════════════════
   RENDERIZAR INVITACIONES EN EL PANEL DE MENSAJES
   (para las invitaciones que ya llegaron antes de que el
    usuario cargara la página — fallback sin tiempo real)
═════════════════════════════════════════════════════════════ */

window.renderPvPInvitations = async function () {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) return { invitations: [], html: '' };

  const sb = getPvPSupabase();
  if (!sb) return { invitations: [], html: '' };

  const { data: invitations } = await sb
    .from('pvp_invitations')
    .select('*')
    .eq('to_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (!invitations || invitations.length === 0) {
    return { invitations: [], html: '' };
  }

  let html = '<div style="display:flex;flex-direction:column;gap:1rem;">';
  invitations.forEach(inv => {
    html += `
      <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:16px;padding:1.5rem;">
        <div style="font-weight:600;color:#f0d080;margin-bottom:0.5rem;font-size:1.1rem;">
          📨 ${escAttr(inv.from_name)} te ha invitado a un PVP
        </div>
        <div style="color:#c084fc;font-size:0.95rem;margin-bottom:1rem;">
          ⚔ Combate 1v1 · Ganador recibe 100 💎
        </div>
        <div style="display:flex;gap:0.75rem;">
          <button type="button" class="btn-primary" style="flex:1;"
            onclick="acceptPvPInvitationById('${inv.id}','${inv.match_id}','${inv.from_id}','${escAttr(inv.from_name)}')">
            ✅ Aceptar
          </button>
          <button type="button" class="btn-secondary" style="flex:1;"
            onclick="rejectPvPInvitationById('${inv.id}','${inv.from_id}','${escAttr(inv.from_name)}')">
            ❌ Rechazar
          </button>
        </div>
      </div>
    `;
  });
  html += '</div>';

  return { invitations, html };
};

/* ═════════════════════════════════════════════════════════════
   HELPER ESCAPE HTML
═════════════════════════════════════════════════════════════ */

function escAttr(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ═════════════════════════════════════════════════════════════
   AUTO-INIT: Arrancar listeners cuando el usuario esté listo
═════════════════════════════════════════════════════════════ */

// Esperar a que auth.js haya inicializado la sesión
const _pvpInitInterval = setInterval(() => {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (user) {
    clearInterval(_pvpInitInterval);
    window.startListeningPvPInvitations();
    console.log('🎮 PVP Realtime listo para:', user.username);
  }
}, 500);
