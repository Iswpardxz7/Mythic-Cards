/**
 * MythicCards — Auth v6 SUPABASE
 * ✅ Login/Registro con Supabase Auth
 * ✅ Base de datos compartida (todos los jugadores se ven entre sí)
 * ✅ Sistema de amigos funcional en red
 * ✅ Persistencia real entre dispositivos
 * ✅ Starter pack automático
 * ✅ Compatible 100% con el resto del juego
 */

/* ═══════════════════════════════════════════
   CONFIGURACIÓN SUPABASE
═══════════════════════════════════════════ */

const SUPABASE_URL = 'https://wcxmpgjnxbpyzjdcglub.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_waAwJYdgoncI1f9xLyVCjw_7br9pKsP';

// Cliente Supabase (se inicializa cuando carga el SDK)
let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;
  if (window.supabase && window.supabase.createClient) {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _supabase;
  }
  console.error('❌ Supabase SDK no cargado todavía');
  return null;
}

/* ═══════════════════════════════════════════
   ESTADO LOCAL (caché en memoria)
═══════════════════════════════════════════ */

// Caché local de usuarios para funciones que los necesiten sincrónicamente
let _usersCache = {};
let _currentUserCache = null;

/* ═══════════════════════════════════════════
   OBTENER USUARIO ACTUAL
═══════════════════════════════════════════ */

window.getCurrentUser = function () {
  return _currentUserCache;
};

/* ═══════════════════════════════════════════
   OBTENER TODOS LOS USUARIOS (desde caché)
═══════════════════════════════════════════ */

// Mantiene compatibilidad con pvp-mode.js y friends que llaman getAllUsers()
window.getAllUsers = function () {
  return _usersCache;
};

/* ═══════════════════════════════════════════
   PERSISTIR USUARIO (actualiza en Supabase y caché)
═══════════════════════════════════════════ */

window.persistUser = async function (user) {
  if (!user || !user.id) return;

  // Actualizar caché local
  _usersCache[user.id] = user;
  if (_currentUserCache && _currentUserCache.id === user.id) {
    _currentUserCache = user;
    window._currentAuthUser = user;
  }

  // Guardar en Supabase
  const sb = getSupabase();
  if (!sb) return;

  try {
    await sb.from('profiles').upsert({
      id: user.id,
      username: user.username,
      diamonds: user.diamonds || 0,
      rank: user.rank || 'F',
      rank_points: user.rankPoints || 0,
      stats: user.stats || { wins: 0, losses: 0, totalBattles: 0 },
      friends: user.friends || [],
      profile_card_refs: user.profileCardRefs || [],
      battle_roster_refs: user.battleRosterRefs || [],
      starter_done: user.starterDone || false,
      last_login: new Date().toISOString(),
      pvp_invitations: user.pvpInvitations || [],
      pvp_active_match: user.pvpActiveMatch || null,
      pvp_messages: user.pvpMessages || []
    });
  } catch (e) {
    console.error('Error guardando perfil:', e);
  }
};

// Alias para compatibilidad con código que usa saveUsers()
window.saveUsers = function (users) {
  Object.values(users).forEach(u => {
    if (u && u.id) window.persistUser(u);
  });
};

/* ═══════════════════════════════════════════
   CARGAR TODOS LOS PERFILES EN CACHÉ
═══════════════════════════════════════════ */

async function loadAllUsersToCache() {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data, error } = await sb.from('profiles').select('*');
    if (error) throw error;
    _usersCache = {};
    (data || []).forEach(profile => {
      _usersCache[profile.id] = profileToUser(profile);
    });
  } catch (e) {
    console.error('Error cargando usuarios:', e);
  }
}

/* ═══════════════════════════════════════════
   CONVERTIR PERFIL DE SUPABASE → OBJETO USER
═══════════════════════════════════════════ */

function profileToUser(profile) {
  return {
    id: profile.id,
    username: profile.username,
    email: profile.email || '',
    diamonds: profile.diamonds || 0,
    rank: profile.rank || 'F',
    rankPoints: profile.rank_points || 0,
    stats: profile.stats || { wins: 0, losses: 0, totalBattles: 0 },
    friends: profile.friends || [],
    profileCardRefs: profile.profile_card_refs || [],
    battleRosterRefs: profile.battle_roster_refs || [],
    starterDone: profile.starter_done || false,
    createdAt: profile.created_at,
    lastLogin: profile.last_login,
    pvpInvitations: profile.pvp_invitations || [],
    pvpActiveMatch: profile.pvp_active_match || null,
    pvpMessages: profile.pvp_messages || [],
    protectedAccount: profile.protected_account || false
  };
}

/* ═══════════════════════════════════════════
   TABS DE AUTH UI
═══════════════════════════════════════════ */

window.switchAuthTab = function (tab) {
  document.querySelectorAll('.auth-tab-content').forEach(el => el.classList.remove('active'));
  const tabEl = document.getElementById('auth-' + tab);
  if (tabEl) tabEl.classList.add('active');
  document.querySelectorAll('.auth-tab-btn').forEach(btn => btn.classList.remove('active'));
  const btn = document.querySelector(`[data-tab="${tab}"]`);
  if (btn) btn.classList.add('active');
  const loginMsg = document.getElementById('login-msg');
  const regMsg = document.getElementById('reg-msg');
  if (loginMsg) loginMsg.textContent = '';
  if (regMsg) regMsg.textContent = '';
};

/* ═══════════════════════════════════════════
   REGISTRO
═══════════════════════════════════════════ */

window.handleRegister = async function () {
  const username  = document.getElementById('reg-user').value.trim();
  const email     = document.getElementById('reg-email').value.trim();
  const password  = document.getElementById('reg-pass').value;
  const password2 = document.getElementById('reg-pass2').value;

  if (!username || username.length < 3)
    return showAuthMessage('reg-msg', '❌ Usuario: mínimo 3 caracteres', 'error');
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return showAuthMessage('reg-msg', '❌ Usuario: solo letras, números y _', 'error');
  if (!email || !email.includes('@'))
    return showAuthMessage('reg-msg', '❌ Email inválido', 'error');
  if (!password || password.length < 8)
    return showAuthMessage('reg-msg', '❌ Contraseña: mínimo 8 caracteres', 'error');
  if (password !== password2)
    return showAuthMessage('reg-msg', '❌ Contraseñas no coinciden', 'error');

  showAuthMessage('reg-msg', '⏳ Creando cuenta...', 'success');

  const sb = getSupabase();
  if (!sb) return showAuthMessage('reg-msg', '❌ Error de conexión', 'error');

  // Verificar username único
  const { data: existing } = await sb
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (existing) return showAuthMessage('reg-msg', '❌ Este usuario ya existe', 'error');

  // Crear cuenta en Supabase Auth
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { username } }
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return showAuthMessage('reg-msg', '❌ Este email ya está registrado', 'error');
    }
    return showAuthMessage('reg-msg', '❌ ' + error.message, 'error');
  }

  const userId = data.user.id;

  // Crear perfil en la tabla profiles
  const { error: profileError } = await sb.from('profiles').insert({
    id: userId,
    username,
    diamonds: 500,
    rank: 'F',
    rank_points: 0,
    stats: { wins: 0, losses: 0, totalBattles: 0 },
    friends: [],
    profile_card_refs: [],
    battle_roster_refs: [],
    starter_done: false,
    pvp_invitations: [],
    pvp_active_match: null,
    pvp_messages: [],
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  });

  if (profileError) {
    console.error('Error creando perfil:', profileError);
  }

  showAuthMessage('reg-msg', '✅ ¡Cuenta creada! Iniciando juego...', 'success');

  setTimeout(async () => {
    await initializeSession(data.user);
  }, 1000);
};

/* ═══════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════ */

window.handleLogin = async function () {
  const userOrEmail = document.getElementById('login-user').value.trim();
  const password    = document.getElementById('login-pass').value;

  if (!userOrEmail || !password)
    return showAuthMessage('login-msg', '❌ Completa todos los campos', 'error');

  showAuthMessage('login-msg', '⏳ Iniciando sesión...', 'success');

  const sb = getSupabase();
  if (!sb) return showAuthMessage('login-msg', '❌ Error de conexión', 'error');

  // Si escribió username en vez de email, buscar el email
  let loginEmail = userOrEmail;
  if (!userOrEmail.includes('@')) {
    const { data: profile } = await sb
      .from('profiles')
      .select('id, email_ref')
      .eq('username', userOrEmail)
      .maybeSingle();

    if (!profile) {
      // Intentar buscar directamente en auth no es posible desde cliente,
      // así que pedimos que use el email
      return showAuthMessage('login-msg', '❌ Usuario no encontrado. Usa tu email para entrar.', 'error');
    }
    // Si guardamos el email en el perfil podremos usarlo; si no, pedimos email
    if (profile.email_ref) {
      loginEmail = profile.email_ref;
    } else {
      return showAuthMessage('login-msg', '❌ Usa tu email para iniciar sesión', 'error');
    }
  }

  const { data, error } = await sb.auth.signInWithPassword({
    email: loginEmail,
    password
  });

  if (error) {
    return showAuthMessage('login-msg', '❌ Email o contraseña incorrectos', 'error');
  }

  showAuthMessage('login-msg', `✅ Bienvenido!`, 'success');

  setTimeout(async () => {
    await initializeSession(data.user);
  }, 800);
};

/* ═══════════════════════════════════════════
   INICIALIZAR SESIÓN TRAS LOGIN/REGISTRO
═══════════════════════════════════════════ */

async function initializeSession(authUser) {
  const sb = getSupabase();
  if (!sb || !authUser) return;

  // Cargar perfil del jugador
  let { data: profile, error } = await sb
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error || !profile) {
    console.error('No se encontró perfil:', error);
    showAuthScreen();
    return;
  }

  // Actualizar last_login
  await sb.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', authUser.id);

  // Convertir a objeto user del juego
  const user = profileToUser(profile);
  user.email = authUser.email;

  _currentUserCache = user;
  window._currentAuthUser = user;
  _usersCache[user.id] = user;

  // Cargar todos los usuarios al caché (para sistema de amigos y PVP)
  await loadAllUsersToCache();

  // Asegurarse de que el usuario actual también esté en caché
  _usersCache[user.id] = user;

  // Inicializar el juego
  window.initializeGameForUser();
}

/* ═══════════════════════════════════════════
   INICIALIZAR JUEGO PARA EL USUARIO
═══════════════════════════════════════════ */

window.initializeGameForUser = function () {
  const user = getCurrentUser();
  if (!user) {
    showAuthScreen();
    return;
  }

  console.log('✅ Iniciando juego para:', user.username);
  window._currentAuthUser = user;

  if (typeof initMythicMeta === 'function') {
    initMythicMeta();
  } else if (typeof loadPlayerProfileFromAuth === 'function') {
    loadPlayerProfileFromAuth();
  }

  if (typeof setGlobalHubVisible === 'function') setGlobalHubVisible(true);
  if (typeof setHubActiveTab === 'function') setHubActiveTab('title');

  hideAuthScreen();

  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });

  const titleScreen = document.getElementById('screen-title');
  if (titleScreen) {
    titleScreen.classList.add('active');
    titleScreen.style.display = 'block';
  }

  console.log('✅ Pantalla lista');
};

/* ═══════════════════════════════════════════
   LOGOUT
═══════════════════════════════════════════ */

window.logout = async function () {
  if (!confirm('¿Cerrar sesión?')) return;
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
  _currentUserCache = null;
  window._currentAuthUser = null;
  _usersCache = {};
  location.reload();
};

/* ═══════════════════════════════════════════
   ELIMINAR CUENTA
═══════════════════════════════════════════ */

window.deleteAccount = async function () {
  if (!confirm('⚠️ Eliminar tu cuenta es irreversible. ¿Estás seguro?')) return;
  if (!confirm('ÚLTIMA CONFIRMACIÓN: Perderás todas tus cartas y datos.')) return;

  const user = getCurrentUser();
  if (!user) return;
  if (user.protectedAccount) {
    alert('Esta cuenta está protegida.');
    return;
  }

  const sb = getSupabase();
  if (!sb) return;

  await sb.from('profiles').delete().eq('id', user.id);
  await sb.auth.signOut();

  _currentUserCache = null;
  window._currentAuthUser = null;
  alert('Cuenta eliminada.');
  location.reload();
};

/* ═══════════════════════════════════════════
   SISTEMA DE AMIGOS
═══════════════════════════════════════════ */

window.openFriendsPanel = function () {
  if (typeof showHubTab === 'function') showHubTab('friends');
};

window.closeFriendsPanel = function () {};

window.renderFriendsTabPanel = function () {
  const user = getCurrentUser();
  const addContainer = document.getElementById('friends-add-content');
  const listContainer = document.getElementById('friends-list-content');
  if (!user || !addContainer || !listContainer) return;

  user.friends = Array.isArray(user.friends) ? user.friends : [];

  const query = document.getElementById('friend-search-input')?.value.trim() || '';
  const allUsers = window.getAllUsers();

  // Buscar usuarios que no son amigos
  const suggestions = Object.values(allUsers)
    .filter(u => u && u.id !== user.id && !user.friends.includes(u.id))
    .sort((a, b) => a.username.localeCompare(b.username, undefined, { sensitivity: 'base' }));

  const searchResults = query
    ? suggestions.filter(u => u.username.toLowerCase().includes(query.toLowerCase()))
    : [];

  const friends = user.friends
    .map(id => allUsers[id])
    .filter(Boolean)
    .sort((a, b) => a.username.localeCompare(b.username, undefined, { sensitivity: 'base' }));

  // Tarjeta izquierda: Agregar amigos
  let addHtml = '<div class="friends-search-row">' +
    '<input id="friend-search-input" class="auth-input friends-search-input" type="search" placeholder="Buscar por nombre..." value="' + escAttr(query) + '" oninput="searchFriendResults(this.value)" style="flex:1;">' +
    '</div>' +
    '<button type="button" class="friend-button add" onclick="addFriendBySearch()" style="width:100%; margin-top:0.5rem;">Agregar</button>' +
    '<div class="friend-feedback" id="friend-feedback" style="margin-top:0.5rem;"></div>';

  if (query) {
    if (searchResults.length) {
      addHtml += '<div style="margin-top:1rem;"><strong style="color:#f0d080;">Resultados:</strong>';
      searchResults.slice(0, 5).forEach(friend => {
        addHtml += '<div class="friend-entry" style="margin-top:0.5rem;">' +
          '<div><strong>' + escAttr(friend.username) + '</strong></div>' +
          '<button type="button" class="friend-button add" style="padding:0.5rem 1rem; font-size:0.9rem;" onclick="addFriend(\'' + escAttr(friend.id) + '\')">Agregar</button>' +
          '</div>';
      });
      addHtml += '</div>';
    } else {
      addHtml += '<p style="color:#c084fc; margin-top:1rem;">No se encontraron usuarios.</p>';
    }
  } else {
    addHtml += '<div style="margin-top:1rem;"><strong style="color:#f0d080;">Sugerencias:</strong>';
    if (suggestions.length) {
      suggestions.slice(0, 5).forEach(friend => {
        addHtml += '<div class="friend-entry" style="margin-top:0.5rem;">' +
          '<div><strong>' + escAttr(friend.username) + '</strong></div>' +
          '<button type="button" class="friend-button add" style="padding:0.5rem 1rem; font-size:0.9rem;" onclick="addFriend(\'' + escAttr(friend.id) + '\')">Agregar</button>' +
          '</div>';
      });
    } else {
      addHtml += '<p style="color:#8b8b7f; margin-top:0.5rem;">No hay sugerencias.</p>';
    }
    addHtml += '</div>';
  }
  addContainer.innerHTML = addHtml;

  // Tarjeta derecha: lista de amigos
  let listHtml = '';
  if (friends.length) {
    friends.forEach(friend => {
      listHtml += '<div class="friend-entry" style="margin-bottom:0.6rem;">' +
        '<div><strong>' + escAttr(friend.username) + '</strong></div>' +
        '<button type="button" class="friend-button secondary" disabled style="padding:0.5rem 1rem; font-size:0.85rem;">✓ Amigo</button>' +
        '</div>';
    });
  } else {
    listHtml = '<p style="color:#8b8b7f; text-align:center; padding:2rem 0;">Aún no tienes amigos.<br>Agrega alguno desde la izquierda.</p>';
  }
  listContainer.innerHTML = listHtml;
};

window.searchFriendResults = function (value) {
  const searchInput = document.getElementById('friend-search-input');
  if (searchInput) searchInput.value = value || '';
  window.renderFriendsTabPanel();
};

window.addFriendBySearch = function () {
  const query = document.getElementById('friend-search-input')?.value.trim();
  if (!query) return showFriendFeedback('Escribe un nombre de usuario para buscar.');

  const allUsers = window.getAllUsers();
  const candidate = Object.values(allUsers).find(u =>
    u && u.username && u.username.toLowerCase() === query.toLowerCase()
  );

  if (!candidate) return showFriendFeedback('No se encontró ese usuario.');

  const user = getCurrentUser();
  if (!user) return;
  if (candidate.id === user.id) return showFriendFeedback('No puedes agregarte a ti mismo.');
  if (Array.isArray(user.friends) && user.friends.includes(candidate.id)) {
    return showFriendFeedback(`${candidate.username} ya es tu amigo.`);
  }

  window.addFriend(candidate.id);
  showFriendFeedback(`✅ ${candidate.username} agregado como amigo.`);
};

window.addFriend = async function (friendId) {
  const user = getCurrentUser();
  if (!user || !friendId || user.id === friendId) return;

  user.friends = Array.isArray(user.friends) ? user.friends : [];
  if (user.friends.includes(friendId)) return;

  user.friends.push(friendId);
  await window.persistUser(user);
  window.renderFriendsTabPanel();
};

function showFriendFeedback(message) {
  const feedback = document.getElementById('friend-feedback');
  if (feedback) feedback.textContent = message;
}

/* ═══════════════════════════════════════════
   CONFIGURACIÓN DE CUENTA
═══════════════════════════════════════════ */

window.renderAccountSettings = function () {
  const user = getCurrentUser();
  if (!user) return;

  const usernameField  = document.getElementById('acct-username');
  const emailField     = document.getElementById('acct-email');
  const diamondsLabel  = document.getElementById('acct-diamonds');
  const rankLabel      = document.getElementById('acct-rank');
  const statsLabel     = document.getElementById('acct-stats');
  const createdLabel   = document.getElementById('acct-created');
  const lastLoginLabel = document.getElementById('acct-last-login');

  if (usernameField)  usernameField.value = user.username || '';
  if (emailField)     emailField.value    = user.email || '';
  if (diamondsLabel)  diamondsLabel.textContent = user.diamonds || 0;
  if (rankLabel)      rankLabel.textContent = user.rank || 'F';
  if (statsLabel)     statsLabel.textContent = `${user.stats?.wins || 0} victorias · ${user.stats?.losses || 0} derrotas · ${user.stats?.totalBattles || 0} batallas`;
  if (createdLabel)   createdLabel.textContent = user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Nunca';
  if (lastLoginLabel) lastLoginLabel.textContent = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca';

  const msg = document.getElementById('account-msg');
  if (msg) msg.textContent = '';
};

window.handleSaveAccountChanges = async function () {
  const user = getCurrentUser();
  if (!user) return;

  if (user.protectedAccount) {
    return showAuthMessage('account-msg', 'Esta cuenta protegida no se puede modificar.', 'error');
  }

  const username = document.getElementById('acct-username')?.value.trim();
  const password  = document.getElementById('acct-pass')?.value || '';
  const password2 = document.getElementById('acct-pass2')?.value || '';

  if (!username || username.length < 3)
    return showAuthMessage('account-msg', '❌ Usuario: mínimo 3 caracteres', 'error');
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return showAuthMessage('account-msg', '❌ Usuario: solo letras, números y _', 'error');

  const sb = getSupabase();

  // Verificar que el nuevo username no esté en uso
  if (username !== user.username) {
    const { data: existing } = await sb
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    if (existing) return showAuthMessage('account-msg', '❌ Ese username ya está en uso', 'error');
  }

  if (password) {
    if (password.length < 8)
      return showAuthMessage('account-msg', '❌ Contraseña: mínimo 8 caracteres', 'error');
    if (password !== password2)
      return showAuthMessage('account-msg', '❌ Las contraseñas no coinciden', 'error');
    const { error } = await sb.auth.updateUser({ password });
    if (error) return showAuthMessage('account-msg', '❌ Error cambiando contraseña', 'error');
  }

  user.username = username;
  await window.persistUser(user);
  window.renderAccountSettings();
  showAuthMessage('account-msg', '✅ Cambios guardados correctamente', 'success');
};

/* ═══════════════════════════════════════════
   UI HELPERS
═══════════════════════════════════════════ */

function showAuthMessage(elementId, message, type) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.style.color = type === 'success' ? '#4ade80' : '#f87171';
}

function hideAuthScreen() {
  const el = document.getElementById('screen-auth');
  if (el) {
    el.classList.remove('active');
    el.classList.add('auth-hidden');
    el.style.display = 'none';
  }
}

function showAuthScreen() {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    if (s.id !== 'screen-auth') s.style.display = 'none';
  });
  const el = document.getElementById('screen-auth');
  if (el) {
    el.classList.remove('auth-hidden');
    el.classList.add('active');
    el.style.display = 'flex';
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escAttr(value) {
  return escapeHtml(value);
}

/* ═══════════════════════════════════════════
   AUTO-INIT
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async function () {
  console.log('🔐 Auth v6 Supabase iniciando...');

  // Esperar a que el SDK de Supabase cargue
  let intentos = 0;
  while (!window.supabase && intentos < 20) {
    await new Promise(r => setTimeout(r, 100));
    intentos++;
  }

  const sb = getSupabase();
  if (!sb) {
    console.error('❌ Supabase no disponible');
    showAuthScreen();
    return;
  }

  // Verificar si hay sesión activa
  const { data: { session } } = await sb.auth.getSession();

  if (session && session.user) {
    console.log('✅ Sesión activa:', session.user.email);
    await initializeSession(session.user);
  } else {
    console.log('📝 Sin sesión — mostrando login');
    showAuthScreen();
  }

  // Escuchar cambios de sesión (por si el token expira)
  sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT') {
      _currentUserCache = null;
      window._currentAuthUser = null;
      showAuthScreen();
    }
  });
});
