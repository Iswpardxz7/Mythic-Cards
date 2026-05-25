/**
 * Mensajes / Pack de bienvenida
 */
const STARTER_DIAMOND_BONUS = 100;

window.openMessagesPanel = function () {
  const modal = document.getElementById('messages-modal');
  if (modal) {
    modal.classList.add('modal-visible');
    renderMessagesPanel();
  }
};

window.closeMessagesPanel = function () {
  const modal = document.getElementById('messages-modal');
  if (modal) modal.classList.remove('modal-visible');
};

window.dismissPvPMessage = function (idx) {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) return;
  
  const messages = user.pvpMessages || [];
  if (idx >= 0 && idx < messages.length) {
    user.pvpMessages = messages.filter((_, i) => i !== idx);
    if (typeof persistUser === 'function') {
      persistUser(user);
    } else {
      const allUsers = typeof getAllUsers === 'function' ? getAllUsers() : {};
      allUsers[user.id] = user;
      saveUsers(allUsers);
    }
    renderMessagesPanel();
  }
};

window.showStarterPackModal = openMessagesPanel;
window.hideStarterPackModal = closeMessagesPanel;

function toRef(card) {
  if (typeof cardRef === 'function') return cardRef(card);
  return {
    name: card.name,
    series: card.series || card.anime || '',
    rarity: typeof normalizeCardRarity === 'function' ? normalizeCardRarity(card.rarity) : (card.rarity || 'F')
  };
}

function starterCardKey(card) {
  return (card.name || '') + '|' + (card.series || card.anime || '');
}

function uniqueStarterCards(cards) {
  const seen = new Set();
  return (cards || []).filter(card => {
    const key = starterCardKey(card);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isValidStarterPack(cards) {
  const pack = uniqueStarterCards(cards);
  if (pack.length !== 7) return false;
  const rankOf = card => typeof normalizeCardRarity === 'function' ? normalizeCardRarity(card.rarity) : (card.rarity || 'F');
  const fCount = pack.filter(card => rankOf(card) === 'F').length;
  const aCount = pack.filter(card => rankOf(card) === 'A').length;
  return fCount === 6 && aCount === 1;
}

function getPackForDisplay(user) {
  if (user.pendingStarterPack && user.pendingStarterPack.length >= 7) {
    const pack = uniqueStarterCards(user.pendingStarterPack).slice(0, 7);
    if (isValidStarterPack(pack)) return pack;
  }
  if (user.pendingStarterPackRefs && user.pendingStarterPackRefs.length >= 7 && typeof resolveCardRefs === 'function') {
    const pack = uniqueStarterCards(resolveCardRefs(user.pendingStarterPackRefs)).slice(0, 7);
    if (isValidStarterPack(pack)) return pack;
  }
  if (typeof generateStarterPackCards === 'function') {
    return generateStarterPackCards();
  }
  return [];
}

function renderMessagesPanel() {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const container = document.getElementById('messages-panel-content');
  if (!container || !user) return;

  // Mostrar invitaciones de PVP si existen
  const pvpInvitations = user.pvpInvitations || [];
  const pvpMessages = user.pvpMessages || [];
  
  let htmlContent = '';
  
  // Mostrar invitaciones de PVP
  if (pvpInvitations.length > 0) {
    htmlContent += '<div style="display:flex;flex-direction:column;gap:1rem;">';
    pvpInvitations.forEach((inv, idx) => {
      htmlContent += `
        <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:16px;padding:1.5rem;margin-bottom:1rem;">
          <div style="font-weight:600;color:#f0d080;margin-bottom:0.5rem;font-size:1.1rem;">
            📨 ${String(inv.fromName || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')} te ha invitado a un PVP
          </div>
          <div style="color:#c084fc;font-size:0.95rem;margin-bottom:1rem;">
            ⚔ Combate 1v1 • Ganador recibe 100💎
          </div>
          <div style="display:flex;gap:0.75rem;">
            <button type="button" class="btn-primary" style="flex:1;" onclick="acceptPvPInvitation(${idx})">
              ✅ Aceptar
            </button>
            <button type="button" class="btn-secondary" style="flex:1;" onclick="rejectPvPInvitation(${idx})">
              ❌ Rechazar
            </button>
          </div>
        </div>
      `;
    });
    htmlContent += '</div>';
  }
  
  // Mostrar mensajes de rechazo de PVP
  if (pvpMessages.length > 0) {
    htmlContent += '<div style="display:flex;flex-direction:column;gap:1rem;">';
    pvpMessages.forEach((msg, idx) => {
      htmlContent += `
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(201,168,76,0.15);border-radius:16px;padding:1rem;margin-bottom:1rem;">
          <div style="color:#f0d080;margin-bottom:0.5rem;">
            ${msg.message}
          </div>
          <button type="button" class="btn-secondary" style="width:100%;padding:0.5rem;" onclick="dismissPvPMessage(${idx})">
            OK
          </button>
        </div>
      `;
    });
    htmlContent += '</div>';
  }
  
  // Si hay invitaciones o mensajes, mostrarlos
  if (pvpInvitations.length > 0 || pvpMessages.length > 0) {
    container.innerHTML = htmlContent;
    return;
  }

  if (user.starterDone && typeof hasBattleRoster === 'function' && hasBattleRoster()) {
    container.innerHTML =
      '<div class="starter-pack-message">' +
      '<div class="message-icon">📬</div>' +
      '<h3>Buzón de mensajes</h3>' +
      '<p>No tienes mensajes nuevos.</p>' +
      '<button class="btn-primary" onclick="closeMessagesPanel()">Cerrar</button>' +
      '</div>';
    return;
  }

  const pack = getPackForDisplay(user);
  user.pendingStarterPack = pack;
  user.pendingStarterPackRefs = pack.map(toRef);

  container.innerHTML =
    '<div class="starter-pack-content">' +
    '<h3>🎁 Tu Pack de Bienvenida</h3>' +
    '<p class="starter-info">Has recibido 7 cartas y ' + STARTER_DIAMOND_BONUS + '💎</p>' +
    '<p class="starter-gift-text">Reclama tu regalo de inicio para comenzar con una colección poderosa.</p>' +
    '<button class="btn-primary btn-claim" onclick="claimStarterPack()">🎉 Reclamar Ahora</button>' +
    '</div>';
}

window.claimStarterPack = function () {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) return;
  if (user.starterDone && typeof hasBattleRoster === 'function' && hasBattleRoster()) {
    closeMessagesPanel();
    return;
  }

  const pack = getPackForDisplay(user);
  if (pack.length < 7) {
    alert('Las cartas aún se cargan. Espera un momento y vuelve a intentar.');
    return;
  }

  const starterCards = uniqueStarterCards(pack).slice(0, 7);
  if (!isValidStarterPack(starterCards)) {
    alert('No se pudo crear un pack con 6 cartas rango F y 1 carta rango A. Espera un momento y vuelve a intentar.');
    return;
  }

  const refs = starterCards.map(toRef);
  if (refs.length < 7) {
    alert('No se pudo crear un pack completo. Espera un momento y vuelve a intentar.');
    return;
  }
  user.profileCardRefs = refs;
  user.battleRosterRefs = refs.slice(0, 7);
  user.starterDone = true;
  user.pendingStarterPackRefs = refs;
  if (!user.starterBonusGranted) {
    user.diamonds = (user.diamonds || 0) + STARTER_DIAMOND_BONUS;
    user.starterBonusGranted = true;
  }
  delete user.pendingStarterPack;
  delete user.profileCards;
  delete user.battleRoster;

  if (typeof persistUser === 'function') {
    persistUser(user);
  } else {
    const users = getAllUsers();
    users[user.id] = typeof userToStorage === 'function' ? userToStorage(user) : user;
    saveUsers(users);
    window._currentAuthUser = typeof hydrateUserFromStorage === 'function'
      ? hydrateUserFromStorage(users[user.id])
      : user;
  }

  if (typeof updateHUD === 'function') updateHUD();
  if (typeof updateMessageBadge === 'function') updateMessageBadge();
  if (typeof updateCollectionCount === 'function') updateCollectionCount();

  const container = document.getElementById('messages-panel-content');
  if (container) {
    container.innerHTML =
      '<div class="starter-pack-message success">' +
      '<div class="message-icon">✨</div>' +
      '<h3>¡Felicidades!</h3>' +
      '<p>Has obtenido ' + STARTER_DIAMOND_BONUS + '💎 y 7 cartas poderosas.</p>' +
      '<p class="small-text">Ya puedes jugar todos los modos.</p>' +
      '<button class="btn-primary" onclick="closeMessagesPanel(); showHubTab(\'modes\');">⚔ Ir a Modos de Juego</button>' +
      '</div>';
  }
};

window.checkStarterPackStatus = function () {
  if (typeof updateMessageBadge === 'function') updateMessageBadge();
};

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(checkStarterPackStatus, 600);
});
