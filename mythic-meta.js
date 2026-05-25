/**
 * MythicCards — Meta game (economía, tienda, misiones, ruleta, inventario, cartas)
 */
(function () {
  'use strict';

  // Función global para obtener imagen de carta
  window.getCardImageSrc = window.getCardImageSrc || function(card) {
    if (!card || !card.image) return '';
    const image = String(card.image || '');
    if (
      image.startsWith('data:') ||
      image.startsWith('http://') ||
      image.startsWith('https://') ||
      image.match(/\.(png|jpe?g|gif|webp)(\?.*)?$/i)
    ) {
      return encodeURI(image);
    }
    return 'data:image/png;base64,' + image;
  };

  const RARITY_ORDER = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
  const LEGACY_RARITY_MAP = { Common: 'F', Rare: 'C', Epic: 'A', Legendary: 'S', SSS: 'SSS' };
  const SHOP_PRICES = { F: 300, E: 400, D: 500, C: 600, B: 700, A: 800, S: 1000, SS: 2000, SSS: 4500 };
  const WHEEL_COST = 50;
  const STARTER_BONUS_DIAMONDS = 100;
  const FUSION_COPIES_PER_LEVEL = 20;
  const MAX_CARD_LEVEL = RARITY_ORDER.length;
  const LEGACY_SAVE_KEY = 'mythic_cards_save_v3';

  const RANK_TIERS = [
    { name: 'F', min: 0 },
    { name: 'E', min: 500 },
    { name: 'D', min: 1500 },
    { name: 'C', min: 3500 },
    { name: 'B', min: 7000 },
    { name: 'A', min: 12000 },
    { name: 'S', min: 20000 },
    { name: 'SS', min: 30000 },
    { name: 'SSS', min: 45000 }
  ];

  const WHEEL_SEGMENTS = [
    { label: '25D', type: 'diamonds', amount: 25, weight: 22, color: '#1b2644' },
    { label: 'Carta\nF', type: 'card', rarity: 'F', weight: 30, color: '#2f3e46' },
    { label: '75D', type: 'diamonds', amount: 75, weight: 18, color: '#1f4e5f' },
    { label: 'Carta\nC', type: 'card', rarity: 'C', weight: 16, color: '#2a5245' },
    { label: '50D', type: 'diamonds', amount: 50, weight: 24, color: '#1e3a5f' },
    { label: 'Carta\nE', type: 'card', rarity: 'E', weight: 28, color: '#374151' },
    { label: 'Carta\nB', type: 'card', rarity: 'B', weight: 14, color: '#4b2d6f' },
    { label: '100D', type: 'diamonds', amount: 100, weight: 14, color: '#1e4d3a' },
    { label: 'Carta\nD', type: 'card', rarity: 'D', weight: 26, color: '#3d4b5c' },
    { label: '200D', type: 'diamonds', amount: 200, weight: 10, color: '#4a3728' },
    { label: 'Carta\nA', type: 'card', rarity: 'A', weight: 12, color: '#581c87' },
    { label: 'Carta\nS', type: 'card', rarity: 'S', weight: 4, color: '#78350f' },
    { label: '150D', type: 'diamonds', amount: 150, weight: 12, color: '#2b3c42' }
  ];

  const DAILY_MISSIONS_DEF = [
    { id: 'win_1', title: 'Gana 1 batalla', desc: 'Victoria en cualquier modo', target: 1, reward: 25, track: 'wins' },
    { id: 'win_3', title: 'Gana 3 batallas', desc: 'Demuestra tu poder', target: 3, reward: 50, track: 'wins' },
    { id: 'battle_5', title: 'Juega 5 batallas', desc: 'Completa 5 partidas', target: 5, reward: 40, track: 'battles' },
    { id: 'battle_10', title: 'Juega 10 batallas', desc: 'Guerrero incansable', target: 10, reward: 80, track: 'battles' },
    { id: 'rounds_20', title: '20 rondas jugadas', desc: 'Suma rondas en combate', target: 20, reward: 35, track: 'rounds' },
    { id: 'shop_1', title: 'Compra 1 carta', desc: 'En la tienda', target: 1, reward: 30, track: 'shopBuys' },
    { id: 'wheel_1', title: 'Gira la ruleta', desc: '1 giro en la ruleta', target: 1, reward: 40, track: 'wheelSpins' },
    { id: 'wheel_3', title: 'Gira 3 veces', desc: 'La suerte te sonríe', target: 3, reward: 70, track: 'wheelSpins' },
    { id: 'campaign_1', title: 'Misión de campaña', desc: 'Completa 1 misión', target: 1, reward: 45, track: 'campaign' },
    { id: 'pve_1', title: 'Derrota un jefe PvE', desc: 'Modo retos', target: 1, reward: 50, track: 'pveWins' },
    { id: 'ranked_1', title: 'Partida ranked', desc: 'Juega clasificatoria', target: 1, reward: 55, track: 'rankedPlays' },
    { id: 'draft_1', title: 'Juega un draft', desc: 'Modo arena', target: 1, reward: 45, track: 'draftPlays' },
    { id: 'quiz_1', title: 'Intenta el quiz', desc: 'Modo puzzles', target: 1, reward: 35, track: 'quizPlays' },
    { id: 'coop_1', title: 'Partida cooperativa', desc: 'Modo coop', target: 1, reward: 50, track: 'coopPlays' },
    { id: 'upgrade_1', title: 'Mejora una carta', desc: 'En inventario', target: 1, reward: 60, track: 'upgrades' },
    { id: 'collect_10', title: '10 cartas en colección', desc: 'Amplía tu mazo', target: 10, reward: 40, track: 'collectionSize' },
    { id: 'collect_20', title: '20 cartas en colección', desc: 'Coleccionista', target: 20, reward: 90, track: 'collectionSize' },
    { id: 'diamonds_spend_100', title: 'Gasta 100💎', desc: 'En tienda o ruleta', target: 100, reward: 50, track: 'diamondsSpent' },
    { id: 'login_daily', title: 'Inicio del día', desc: 'Entra al juego hoy', target: 1, reward: 20, track: 'login' },
    { id: 'perfect_quiz', title: 'Quiz perfecto', desc: '10/10 en quiz anime', target: 1, reward: 100, track: 'quizPerfect' }
  ];

  let wheelRotation = 0;
  let wheelSpinning = false;

  /* ─── Perfil ─── */
  function ensurePlayerProfile() {
    if (!window.playerProfile) {
      window.playerProfile = {
        playerName: 'Invitado',
        diamonds: 0,
        rankingPoints: 0,
        stats: { wins: 0, losses: 0, totalBattles: 0 },
        collection: [],
        battleRoster: []
      };
    }
    return window.playerProfile;
  }

  function getAuthUser() {
    if (window._currentAuthUser) return window._currentAuthUser;
    if (typeof getCurrentUser === 'function') {
      const raw = getCurrentUser();
      if (!raw) return null;
      if (!window._currentAuthUser && typeof hydrateUserFromStorage === 'function') {
        window._currentAuthUser = hydrateUserFromStorage(Object.assign({}, raw));
        return window._currentAuthUser;
      }
      return raw;
    }
    return null;
  }

  function normalizeRarity(rarity) {
    const raw = String(rarity || 'F').trim();
    if (RARITY_ORDER.includes(raw)) return raw;
    return LEGACY_RARITY_MAP[raw] || 'F';
  }

  function rarityIndex(rarity) {
    const idx = RARITY_ORDER.indexOf(normalizeRarity(rarity));
    return idx >= 0 ? idx : 0;
  }

  function getCardProgressLevel(card) {
    const level = Math.max(1, Number(card?.level) || 1);
    const rarityLevel = rarityIndex(card?.rarity) + 1;
    return Math.max(1, Math.min(MAX_CARD_LEVEL, Math.max(level, rarityLevel)));
  }

  function rarityForProgressLevel(level) {
    const idx = Math.max(0, Math.min(RARITY_ORDER.length - 1, Math.round(Number(level) || 1) - 1));
    return RARITY_ORDER[idx];
  }

  function applyProgressToRef(ref, level) {
    if (!ref) return ref;
    const nextLevel = Math.max(1, Math.min(MAX_CARD_LEVEL, Math.round(Number(level) || 1)));
    ref.level = nextLevel;
    ref.rarity = rarityForProgressLevel(nextLevel);
    return ref;
  }

  window.normalizeCardRarity = normalizeRarity;

  function sameCardIdentity(ref, name, series) {
    return ref && ref.name === name && ((ref.series || ref.anime || '') === series);
  }

  function getFusionPlan(totalCopies, progressLevel) {
    const remainingLevels = Math.max(0, MAX_CARD_LEVEL - progressLevel);
    const duplicateCopies = Math.max(0, totalCopies - 1);
    const duplicatesPerLevel = FUSION_COPIES_PER_LEVEL - 1;
    const levels = Math.min(remainingLevels, Math.floor(duplicateCopies / duplicatesPerLevel));
    return {
      levels,
      duplicatesToConsume: levels * duplicatesPerLevel,
      totalCopiesToUse: levels > 0 ? 1 + levels * duplicatesPerLevel : 0,
      missingCopies: levels > 0 ? 0 : Math.max(0, FUSION_COPIES_PER_LEVEL - totalCopies)
    };
  }

  function cardRef(card) {
    const level = getCardProgressLevel(card);
    return {
      name: card.name,
      series: card.series || card.anime || '',
      rarity: rarityForProgressLevel(level),
      level
    };
  }

  function findCardInAll(name, series) {
    if (typeof ALL_CARDS === 'undefined') return null;
    const aliases = {
      'tensei shitara slime datta ken': 'Luminous Valentine'
    };
    const lookupName = aliases[String(name || '').trim().toLowerCase()] || name;
    
    // 1. Coincidencia exacta
    let found = ALL_CARDS.find(c =>
      c.name === lookupName && (c.series === series || c.anime === series)
    );
    
    // 2. Coincidencia normalizando textos vacíos o nulos
    if (!found) {
      const normSeries = (series || '').trim().toLowerCase();
      found = ALL_CARDS.find(c => {
        const cSeries = (c.series || c.anime || '').trim().toLowerCase();
        return c.name === lookupName && cSeries === normSeries;
      });
    }
    
    // 3. Fallback absoluto: buscar sólo por nombre (los nombres de personajes son únicos en el catálogo)
    if (!found) {
      found = ALL_CARDS.find(c => c.name === lookupName);
    }
    
    return found || null;
  }


  function resolveCardRef(ref) {
    if (!ref || !ref.name) return null;
    const base = findCardInAll(ref.name, ref.series || ref.anime);
    if (!base) return null;
    const c = Object.assign({}, base);
    c.rarity = normalizeRarity(ref.rarity || c.rarity);
    c.level = ref.level || 1;
    applyProgressToRef(c, getCardProgressLevel(c));
    if (typeof applyAnimeStats === 'function') return applyAnimeStats(c);
    return c;
  }

  function resolveCardRefs(refs) {
    return (refs || []).map((ref, idx) => {
      const c = resolveCardRef(ref);
      if (c) c.index = idx;
      return c;
    }).filter(Boolean);
  }

  function getUserCardRefs(u) {
    if (!u) return [];
    if (Array.isArray(u.profileCardRefs) && u.profileCardRefs.length) {
      return u.profileCardRefs;
    }
    if (Array.isArray(u.profileCards) && u.profileCards.length) {
      return u.profileCards.map(c => (c.image ? cardRef(c) : c));
    }
    return [];
  }

  function userToStorage(user) {
    const refs = getUserCardRefs(user);
    const stored = Object.assign({}, user);
    stored.profileCardRefs = refs;
    stored.battleRosterRefs = (user.battleRosterRefs && user.battleRosterRefs.length >= 7)
      ? user.battleRosterRefs.map(cardRef)
      : refs.slice(0, 7).map(cardRef);
    if (user.customDecks) {
      stored.customDecks = user.customDecks.map(d => ({
        id: d.id,
        name: d.name,
        cardRefs: (d.cardRefs || []).map(c => cardRef(c))
      }));
    }
    if (user.activeDeckId) stored.activeDeckId = user.activeDeckId;
    if (user.pendingStarterPack && user.pendingStarterPack.length) {
      stored.pendingStarterPackRefs = user.pendingStarterPack.map(cardRef);
    } else if (user.pendingStarterPackRefs) {
      stored.pendingStarterPackRefs = user.pendingStarterPackRefs;
    }
    delete stored.profileCards;
    delete stored.battleRoster;
    delete stored.pendingStarterPack;
    return stored;
  }

  function hydrateUserFromStorage(user) {
    if (!user) return user;
    const refs = getUserCardRefs(user);
    user.profileCardRefs = refs;
    if (user.pendingStarterPackRefs && !user.pendingStarterPack) {
      user.pendingStarterPack = resolveCardRefs(user.pendingStarterPackRefs);
    }
    const profile = ensurePlayerProfile();
    profile.collection = resolveCardRefs(refs);
    profile.battleRoster = resolveCardRefs(
      user.battleRosterRefs && user.battleRosterRefs.length >= 7
        ? user.battleRosterRefs
        : refs.slice(0, 7)
    );
    return user;
  }

  function persistUser(user) {
    if (!user || typeof getAllUsers !== 'function' || typeof saveUsers !== 'function') return;
    try {
      const users = getAllUsers();
      users[user.id] = userToStorage(user);
      saveUsers(users);
      window._currentAuthUser = hydrateUserFromStorage(user);
    } catch (e) {
      console.error('Error guardando usuario (¿localStorage lleno?):', e);
    }
  }

  function grantStarterPackIfNeeded(u) {
    if (!u) return false;
    const currentRefs = getUserCardRefs(u);
    if (u.starterDone && currentRefs.length >= 7) return true;

    let pack = [];
    if (!u.starterDone && u.pendingStarterPackRefs && u.pendingStarterPackRefs.length >= 7) {
      pack = uniqueCards(resolveCardRefs(u.pendingStarterPackRefs)).slice(0, 7);
    } else if (!u.starterDone && u.pendingStarterPack && u.pendingStarterPack.length >= 7) {
      pack = uniqueCards(u.pendingStarterPack).slice(0, 7);
    }
    if (!isValidStarterPack(pack)) pack = generateStarterPackCards();
    if (pack.length < 7) return false;

    u.profileCardRefs = pack.map(cardRef);
    u.battleRosterRefs = u.profileCardRefs.slice(0, 7);
    if (!u.starterDone && !u.starterBonusGranted) {
      u.diamonds = (u.diamonds || 0) + STARTER_BONUS_DIAMONDS;
      u.starterBonusGranted = true;
    }
    ensurePlayerProfile().diamonds = u.diamonds || 0;
    u.starterDone = true;
    delete u.pendingStarterPack;
    delete u.pendingStarterPackRefs;
    delete u.profileCards;
    delete u.battleRoster;
    persistUser(u);
    return true;
  }

  function syncLegacySaveDiamonds(amount) {
    try {
      const s = JSON.parse(localStorage.getItem(LEGACY_SAVE_KEY) || '{}');
      s.diamonds = amount;
      localStorage.setItem(LEGACY_SAVE_KEY, JSON.stringify(s));
    } catch (e) { /* ignore */ }
  }

  function getRankName(points) {
    let rank = RANK_TIERS[0].name;
    for (const t of RANK_TIERS) {
      if (points >= t.min) rank = t.name;
    }
    return rank;
  }

  window.getPlayerDiamonds = function () {
    const u = getAuthUser();
    if (u) return u.diamonds || 0;
    return ensurePlayerProfile().diamonds || 0;
  };

  window.chargePlayerDiamonds = function (n) {
    const amount = Math.max(0, parseInt(n, 10) || 0);
    const u = getAuthUser();
    if (u) {
      u.diamonds = Math.max(0, (u.diamonds || 0) - amount);
      ensurePlayerProfile().diamonds = u.diamonds;
      persistUser(u);
      syncLegacySaveDiamonds(u.diamonds);
      recordMissionProgress('diamondsSpent', amount);
      updateHUD();
      return u.diamonds;
    }
    const p = ensurePlayerProfile();
    p.diamonds = Math.max(0, (p.diamonds || 0) - amount);
    updateHUD();
    return p.diamonds;
  };

  window.addDiamonds = function (n) {
    const amount = Math.max(0, parseInt(n, 10) || 0);
    if (!amount) return;
    const u = getAuthUser();
    if (u) {
      u.diamonds = (u.diamonds || 0) + amount;
      ensurePlayerProfile().diamonds = u.diamonds;
      persistUser(u);
      syncLegacySaveDiamonds(u.diamonds);
    } else {
      ensurePlayerProfile().diamonds = (ensurePlayerProfile().diamonds || 0) + amount;
    }
    updateHUD();
    const el = document.getElementById('hud-diamonds-display');
    if (el) {
      el.classList.add('pulse');
      setTimeout(() => el.classList.remove('pulse'), 600);
    }
  };

  window.savePlayerProfileToAuth = function () {
    const profile = ensurePlayerProfile();
    const u = getAuthUser();
    if (!u) return;
    u.diamonds = profile.diamonds != null ? profile.diamonds : u.diamonds;
    profile.diamonds = u.diamonds;
    u.rankPoints = profile.rankingPoints || u.rankPoints || 0;
    u.rank = getRankName(u.rankPoints);
    u.stats = profile.stats || u.stats;
    const refs = getUserCardRefs(u);
    if (profile.collection && profile.collection.length) {
      u.profileCardRefs = profile.collection.map(cardRef);
    } else {
      u.profileCardRefs = refs;
    }
    u.battleRosterRefs = (profile.battleRoster && profile.battleRoster.length >= 7)
      ? profile.battleRoster.map(cardRef)
      : u.profileCardRefs.slice(0, 7);
    profile.collection = resolveCardRefs(u.profileCardRefs);
    profile.battleRoster = resolveCardRefs(u.battleRosterRefs);
    persistUser(u);
    syncLegacySaveDiamonds(u.diamonds);
  };

  window.loadPlayerProfileFromAuth = function () {
    const u = getAuthUser();
    if (!u) return false;
    const profile = ensurePlayerProfile();
    profile.playerName = u.username;
    profile.diamonds = u.diamonds != null ? u.diamonds : 500;
    profile.rankingPoints = u.rankPoints || 0;
    profile.stats = u.stats || { wins: 0, losses: 0, totalBattles: 0 };
    hydrateUserFromStorage(u);
    if (!u.dailyMissions || u.dailyMissions.date !== todayKey()) {
      resetDailyMissions(u);
    }
    grantStarterPackIfNeeded(u);
    syncLegacySaveDiamonds(profile.diamonds);
    updateHUD();
    updateMessageBadge();
    return true;
  };

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function resetDailyMissions(user) {
    user.dailyMissions = {
      date: todayKey(),
      progress: {},
      claimed: {}
    };
    recordMissionProgress('login', 1, user);
    const size = (user.profileCards || []).length;
    if (size >= 10) recordMissionProgress('collectionSize', size, user);
    if (size >= 20) recordMissionProgress('collectionSize', size, user);
  }

  window.recordMissionProgress = function (track, amount, userOpt) {
    const u = userOpt || getAuthUser();
    if (!u) return;
    if (!u.dailyMissions || u.dailyMissions.date !== todayKey()) resetDailyMissions(u);
    const inc = typeof amount === 'number' ? amount : 1;
    u.dailyMissions.progress[track] = (u.dailyMissions.progress[track] || 0) + inc;
    if (track === 'collectionSize') {
      const sz = getUserCardRefs(u).length;
      u.dailyMissions.progress.collectionSize = Math.max(u.dailyMissions.progress.collectionSize || 0, sz);
    }
    persistUser(u);
    if (document.getElementById('screen-missions')?.classList.contains('active')) renderMissions();
  };

  /* ─── Cartas ─── */
  function getCardImageSrc(card) {
    if (!card || !card.image) return '';
    const image = String(card.image || '');
    if (
      image.startsWith('data:') ||
      image.startsWith('http://') ||
      image.startsWith('https://') ||
      image.match(/\.(png|jpe?g|gif|webp)(\?.*)?$/i)
    ) {
      return encodeURI(image);
    }
    return 'data:image/png;base64,' + image;
  }

  function cloneCard(card) {
    const c = Object.assign({}, card);
    c.rarity = normalizeRarity(c.rarity);
    if (typeof applyAnimeStats === 'function') return applyAnimeStats(c);
    return c;
  }

  window.buildCardArtHTML = function (card, opts) {
    opts = opts || {};
    if (!card) return '';
    const src = getCardImageSrc(card);
    const displayRarity = normalizeRarity(card.rarity);
    const rarity = displayRarity.toLowerCase();
    const name = card.name || '';
    const series = card.series || card.anime || '';
    const level = card.level || 1;
    const index = card.index !== undefined ? card.index : '';
    const infoBtn = opts.showInfo !== false
      ? `<button type="button" class="card-info-btn" data-card-name="${escapeAttr(name)}" data-card-series="${escapeAttr(series)}" data-card-rarity="${escapeAttr(displayRarity)}" data-card-level="${level}" data-card-index="${index}" aria-label="Info">ℹ</button>`
      : '';
    return `
      <div class="card-art-frame rarity-${rarity}">
        <img class="card-art" src="${src}" alt="${escapeAttr(name)}" loading="lazy">
        ${opts.showName !== false ? `<div class="card-art-name rarity-${rarity}">${escapeHtml(name)}</div>` : ''}
        ${infoBtn}
      </div>
      ${opts.showSeries ? `<div class="card-art-series">${escapeHtml(series)}</div>` : ''}
    `;
  };

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeAttr(s) {
    return String(s || '').replace(/"/g, '&quot;');
  }

  function cardKey(card) {
    return (card.name || '') + '|' + (card.series || card.anime || '');
  }

  function uniqueCards(cards) {
    const seen = new Set();
    return (cards || []).filter(card => {
      const key = cardKey(card);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function shuffled(cards) {
    return (cards || []).slice().sort(() => Math.random() - 0.5);
  }

  function pushUniqueCards(deck, source, count) {
    const used = new Set(deck.map(cardKey));
    for (const card of shuffled(source)) {
      if (deck.length >= count) break;
      const key = cardKey(card);
      if (!key || used.has(key)) continue;
      used.add(key);
      deck.push(cloneCard(card));
    }
    return deck;
  }

  function seriesKey(card) {
    return card.series || card.anime || 'Otros';
  }

  function pickVariedCards(source, count, usedCards, usedSeries) {
    const picked = [];
    const cardSet = usedCards || new Set();
    const seriesSet = usedSeries || new Set();
    const pool = uniqueCards(source);

    function tryPick(preferNewSeries) {
      for (const card of shuffled(pool)) {
        const key = cardKey(card);
        const series = seriesKey(card);
        if (!key || cardSet.has(key)) continue;
        if (preferNewSeries && seriesSet.has(series)) continue;
        cardSet.add(key);
        seriesSet.add(series);
        picked.push(cloneCard(card));
        return true;
      }
      return false;
    }

    while (picked.length < count && tryPick(true)) {}
    while (picked.length < count && tryPick(false)) {}
    return picked;
  }

  function isValidStarterPack(pack) {
    const cards = uniqueCards(pack);
    if (cards.length !== 7) return false;
    const fCount = cards.filter(c => normalizeRarity(c.rarity) === 'F').length;
    const aCount = cards.filter(c => normalizeRarity(c.rarity) === 'A').length;
    return fCount === 6 && aCount === 1;
  }

  window.generateStarterPackCards = function () {
    const all = typeof ALL_CARDS !== 'undefined' ? ALL_CARDS : [];
    if (!all.length) return [];
    const uniqueAll = uniqueCards(all);
    const aCards = uniqueAll.filter(c => normalizeRarity(c.rarity) === 'A');
    const fCards = uniqueAll.filter(c => normalizeRarity(c.rarity) === 'F');
    if (aCards.length < 1 || fCards.length < 6) return [];

    const usedCards = new Set();
    const usedSeries = new Set();
    const aCard = pickVariedCards(aCards, 1, usedCards, usedSeries);
    const fPackCards = pickVariedCards(fCards, 6, usedCards, usedSeries);
    const deck = fPackCards.concat(aCard);
    return shuffled(deck).slice(0, 7);
  };

  window.hasBattleRoster = function () {
    const u = getAuthUser();
    if (!u || !u.starterDone) return false;
    if (getUserCardRefs(u).length >= 7) return true;
    grantStarterPackIfNeeded(u);
    return getUserCardRefs(u).length >= 7;
  };

  window.getPlayerBattlePool = function () {
    const u = getAuthUser();
    if (!u) return [];
    const refs = (u.battleRosterRefs && u.battleRosterRefs.length >= 7)
      ? u.battleRosterRefs
      : getUserCardRefs(u).slice(0, 7);
    return resolveCardRefs(refs);
  };

  window.addCardToCollection = function (card) {
    const c = cloneCard(card);
    const profile = ensurePlayerProfile();
    const u = getAuthUser();
    if (u) {
      const refs = getUserCardRefs(u);
      refs.push(cardRef(c));
      u.profileCardRefs = refs;
      if (refs.length >= 7 && (!u.battleRosterRefs || u.battleRosterRefs.length < 7)) {
        u.battleRosterRefs = refs.slice(0, 7).map(cardRef);
      }
      profile.collection = resolveCardRefs(refs);
      profile.battleRoster = resolveCardRefs(u.battleRosterRefs || refs.slice(0, 7));
      persistUser(u);
    } else {
      profile.collection = profile.collection || [];
      profile.collection.push(c);
    }
    savePlayerProfileToAuth();
    updateCollectionCount();
    const sz = profile.collection.length;
    recordMissionProgress('collectionSize', sz);
    if (sz >= 10) recordMissionProgress('collectionSize', 10);
    if (sz >= 20) recordMissionProgress('collectionSize', 20);
    return c;
  };

  function updateCollectionCount() {
    const el = document.getElementById('collection-count');
    if (!el) return;
    const u = getAuthUser();
    const n = u ? getUserCardRefs(u).length : 0;
    if (!u || !u.starterDone) {
      el.textContent = 'Reclama tu pack de bienvenida (7 cartas)';
    } else {
      el.textContent = `Colección: ${n} cartas`;
    }
  }

  /* ─── HUD ─── */
  window.updateHUD = function () {
    const d = getPlayerDiamonds();
    const u = getAuthUser();
    const wins = u?.stats?.wins || 0;
    const rank = u ? getRankName(u.rankPoints || 0) : 'F';

    const map = {
      'hud-diamonds-display': `💎 ${d.toLocaleString()}`,
      'title-diamonds': d.toLocaleString(),
      'title-wins': String(wins),
      'title-rank': rank,
      'acct-diamonds': String(d),
      'acct-rank': rank
    };
    Object.keys(map).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = map[id];
    });
    if (u && typeof renderAccountSettings === 'function') {
      const onAccount = document.getElementById('screen-account')?.classList.contains('active');
      if (onAccount) renderAccountSettings();
    }
    updateCollectionCount();
    updateMessageBadge();
  };

  window.updateMessageBadge = function () {
    const badge = document.getElementById('msg-badge');
    if (!badge) return;
    const u = getAuthUser();
    const hasStarter = u && !u.starterDone;
    const hasPvPInvitations = u && u.pvpInvitations && u.pvpInvitations.length > 0;
    const hasPvPMessages = u && u.pvpMessages && u.pvpMessages.length > 0;
    const show = hasStarter || hasPvPInvitations || hasPvPMessages;
    badge.style.display = show ? 'inline-block' : 'none';
    if (show) {
      const count = (hasStarter ? 1 : 0) + (u.pvpInvitations ? u.pvpInvitations.length : 0) + (u.pvpMessages ? u.pvpMessages.length : 0);
      badge.textContent = count > 0 ? Math.min(count, 9) : '';
    } else {
      badge.textContent = '';
    }
  };

  window.goBackToModes = function () {
    if (typeof showHubTab === 'function') showHubTab('modes');
  };

  /* ─── Tienda ─── */
  window.renderShop = function () {
    const grid = document.getElementById('shop-packs');
    if (!grid || typeof ALL_CARDS === 'undefined') return;
    const getShopTotalPower = (card) => {
      const c = typeof applyAnimeStats === 'function' ? applyAnimeStats(Object.assign({}, card)) : card;
      return (c.power || 0) + (c.speed || 0) + (c.magic || 0) + (c.defense || 0) + (c.intelligence || 0);
    };
    const bySeries = {};
    const sssCards = [];
    ALL_CARDS.forEach(c => {
      if (normalizeRarity(c.rarity) === 'SSS' || (c.series || c.anime) === 'Ediccion especial') {
        sssCards.push(c);
        return;
      }
      const s = c.series || 'Otros';
      if (!bySeries[s]) bySeries[s] = [];
      bySeries[s].push(c);
    });
    const seriesNames = Object.keys(bySeries).sort();
    let html = `<p class="shop-intro">Compra cartas por anime. Saldo: <strong style="color:#67e8f9">${getPlayerDiamonds()} 💎</strong></p>`;
    if (sssCards.length) {
      html += `<div class="shop-anime-section shop-sss-section"><h3 class="shop-anime-title">RANGO SSS</h3><div class="shop-anime-grid">`;
      sssCards
        .slice()
        .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
        .forEach(card => {
          const price = SHOP_PRICES.SSS;
          const displayCard = Object.assign({}, card, { rarity: normalizeRarity(card.rarity) });
          const totalPower = getShopTotalPower(displayCard);
          const art = buildCardArtHTML(displayCard, { showName: true, showInfo: true, showSeries: false });
          html += `
            <div class="shop-card-item pack-card pack-sss">
              <div class="shop-card-art">
                ${art}
                <div class="card-power-badge shop-power-badge" style="position:absolute; top:6px; left:6px; z-index:20;">${totalPower}</div>
              </div>
              <div class="shop-card-total-power">Poder total: ${totalPower}</div>
              <div class="pack-price">${price.toLocaleString()} 💎</div>
              <button type="button" class="btn-primary shop-buy-btn" onclick="buyShopCard('${escapeAttr(card.name)}','${escapeAttr(card.series || card.anime || 'Ediccion especial')}')">Comprar</button>
            </div>`;
        });
      html += '</div></div>';
    }
    seriesNames.forEach(series => {
      html += `<div class="shop-anime-section"><h3 class="shop-anime-title">📺 ${escapeHtml(series)}</h3><div class="shop-anime-grid">`;
      bySeries[series].forEach(card => {
        const displayCard = Object.assign({}, card, { rarity: normalizeRarity(card.rarity) });
        const price = SHOP_PRICES[displayCard.rarity] || 100;
        const totalPower = getShopTotalPower(displayCard);
        const art = buildCardArtHTML(displayCard, { showName: true, showInfo: true, showSeries: false });
        html += `
          <div class="shop-card-item pack-card pack-${displayCard.rarity.toLowerCase()}">
            <div class="shop-card-art">
              ${art}
              <div class="card-power-badge shop-power-badge" style="position:absolute; top:6px; left:6px; z-index:20;">${totalPower}</div>
            </div>
            <div class="shop-card-total-power">Poder total: ${totalPower}</div>
            <div class="pack-price">${price} 💎</div>
            <button type="button" class="btn-primary shop-buy-btn" onclick="buyShopCard('${escapeAttr(card.name)}','${escapeAttr(series)}')">Comprar</button>
          </div>`;
      });
      html += '</div></div>';
    });
    grid.innerHTML = html;
    if (typeof attachCardInfoListeners === 'function') attachCardInfoListeners(grid);
  };

  window.buyShopCard = function (name, series) {
    const card = ALL_CARDS.find(c => c.name === name && (c.series === series || c.anime === series));
    if (!card) return;
    const normalizedRank = normalizeRarity(card.rarity);
    const price = SHOP_PRICES[normalizedRank] || 100;
    if (getPlayerDiamonds() < price) {
      alert(`Necesitas ${price} 💎`);
      return;
    }
    chargePlayerDiamonds(price);
    addCardToCollection(Object.assign({}, card, { rarity: normalizedRank }));
    recordMissionProgress('shopBuys', 1);
    alert(`¡${card.name} añadida a tu inventario!`);
    renderShop();
    updateHUD();
  };

  /* ─── Misiones ─── */
  window.renderMissions = function () {
    const list = document.getElementById('missions-list');
    const u = getAuthUser();
    if (!list) return;
    if (!u) {
      list.innerHTML = '<p>Inicia sesión para ver misiones.</p>';
      return;
    }
    if (!u.dailyMissions || u.dailyMissions.date !== todayKey()) resetDailyMissions(u);

    list.innerHTML = DAILY_MISSIONS_DEF.map(m => {
      const prog = getMissionProgress(u, m);
      const done = prog >= m.target;
      const claimed = !!u.dailyMissions.claimed[m.id];
      const pct = Math.min(100, Math.round((prog / m.target) * 100));
      return `
        <div class="mission-item ${done ? 'complete' : ''} ${claimed ? 'claimed' : ''}">
          <div>
            <strong>${escapeHtml(m.title)}</strong>
            <div style="font-size:0.8rem;color:#9ca3af">${escapeHtml(m.desc)}</div>
            <div class="mission-progress-bar"><div class="mission-progress-fill" style="width:${pct}%"></div></div>
            <div style="font-size:0.75rem;color:#6b7280;margin-top:4px">${Math.min(prog, m.target)} / ${m.target}</div>
          </div>
          <div style="text-align:right">
            <div class="mission-reward">+${m.reward} 💎</div>
            ${claimed
              ? '<span style="color:#6b7280;font-size:0.8rem">Reclamado</span>'
              : done
                ? `<button class="btn-primary" style="margin-top:0.5rem;padding:0.4rem 0.8rem;font-size:0.8rem" onclick="claimDailyMission('${m.id}')">Reclamar</button>`
                : '<span style="color:#6b7280;font-size:0.8rem">En progreso</span>'}
          </div>
        </div>`;
    }).join('');
  };

  function getMissionProgress(u, m) {
    const p = u.dailyMissions?.progress || {};
    if (m.track === 'collectionSize') return getUserCardRefs(u).length;
    if (m.track === 'wins') return u.stats?.wins || 0;
    if (m.track === 'battles') return u.stats?.totalBattles || 0;
    return p[m.track] || 0;
  }

  window.claimDailyMission = function (id) {
    const u = getAuthUser();
    const def = DAILY_MISSIONS_DEF.find(m => m.id === id);
    if (!u || !def) return;
    const prog = getMissionProgress(u, def);
    if (prog < def.target) return alert('Aún no completas esta misión.');
    if (u.dailyMissions.claimed[id]) return;
    u.dailyMissions.claimed[id] = true;
    persistUser(u);
    addDiamonds(def.reward);
    alert(`+${def.reward} 💎 añadidos a tu cuenta.`);
    renderMissions();
  };

  /* ─── Ruleta ─── */
  function pickWeightedSegment() {
    const total = WHEEL_SEGMENTS.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * total;
    for (const seg of WHEEL_SEGMENTS) {
      r -= seg.weight;
      if (r <= 0) return seg;
    }
    return WHEEL_SEGMENTS[0];
  }

  function drawWheel(canvas, rotation) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 4;
    ctx.clearRect(0, 0, w, h);
    const n = WHEEL_SEGMENTS.length;
    const arc = (2 * Math.PI) / n;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    WHEEL_SEGMENTS.forEach((seg, i) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.fillStyle = seg.color;
      ctx.arc(0, 0, r, i * arc, (i + 1) * arc);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,215,0,0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.save();
      ctx.rotate(i * arc + arc / 2);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Rajdhani,sans-serif';
      ctx.textAlign = 'center';
      const lines = seg.label.split('\n');
      lines.forEach((line, li) => ctx.fillText(line, r * 0.62, 4 + li * 13));
      ctx.restore();
    });
    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
    ctx.fillStyle = '#1a0530';
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  window.initWheel = function () {
    const canvas = document.getElementById('wheel-canvas');
    const btn = document.getElementById('wheel-spin-btn');
    if (!canvas) return;
    canvas.width = 300;
    canvas.height = 300;
    drawWheel(canvas, wheelRotation);
    if (btn && !btn._bound) {
      btn._bound = true;
      btn.onclick = spinWheel;
    }
    if (btn) btn.textContent = `Girar (${WHEEL_COST} 💎)`;
  };

  function spinWheel() {
    if (wheelSpinning) return;
    if (getPlayerDiamonds() < WHEEL_COST) {
      alert(`Necesitas ${WHEEL_COST} 💎 para girar.`);
      return;
    }
    chargePlayerDiamonds(WHEEL_COST);
    recordMissionProgress('wheelSpins', 1);
    wheelSpinning = true;
    const canvas = document.getElementById('wheel-canvas');
    const seg = pickWeightedSegment();
    const segIndex = WHEEL_SEGMENTS.indexOf(seg);
    const n = WHEEL_SEGMENTS.length;
    const arc = (2 * Math.PI) / n;
    const targetAngle = -(segIndex * arc + arc / 2) + Math.PI / 2;
    const spins = 5 + Math.random() * 3;
    const finalRot = wheelRotation + spins * 2 * Math.PI + (targetAngle - (wheelRotation % (2 * Math.PI)));
    const start = wheelRotation;
    const duration = 4000;
    const t0 = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - t0) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      wheelRotation = start + (finalRot - start) * ease;
      drawWheel(canvas, wheelRotation);
      if (t < 1) requestAnimationFrame(frame);
      else {
        wheelSpinning = false;
        applyWheelPrize(seg);
      }
    }
    requestAnimationFrame(frame);
  }

  function applyWheelPrize(seg) {
    if (seg.type === 'diamonds') {
      addDiamonds(seg.amount);
      alert(`¡Ganaste ${seg.amount} 💎!`);
    } else if (seg.type === 'card') {
      const rank = normalizeRarity(seg.rarity);
      const pool = ALL_CARDS.filter(c => normalizeRarity(c.rarity) === rank);
      if (pool.length) {
        const card = pool[Math.floor(Math.random() * pool.length)];
        addCardToCollection(Object.assign({}, card, { rarity: rank }));
        alert(`Carta rango ${rank}: ${card.name}!`);
      }
    }
    updateHUD();
  }

  /* ─── Ranking ─── */
  window.renderRanking = function () {
    const body = document.getElementById('ranking-body');
    if (!body) return;
    const u = getAuthUser();
    const rows = [];
    const special = typeof getAllUsers === 'function'
      ? Object.values(getAllUsers()).find(user => user && user.id === 'user_core_iwspardxz7')
      : null;

    if (special) {
      rows.push({
        name: special.username || 'Iwspardxz7',
        wins: special.stats?.wins || 999999,
        rank: special.rank || getRankName(special.rankPoints || 0),
        points: special.rankPoints || 999999,
        crown: true
      });
    }

    if (u && (!special || u.id !== special.id)) {
      rows.push({
        name: u.username,
        wins: u.stats?.wins || 0,
        rank: getRankName(u.rankPoints || 0),
        points: u.rankPoints || 0,
        crown: false
      });
    }

    rows.sort((a, b) => (b.points || 0) - (a.points || 0));
    body.innerHTML = rows.map((r, idx) => `
      <tr class="${r.crown ? 'ranking-bot-row' : ''}">
        <td>${idx + 1}</td>
        <td>${escapeHtml(r.name)}${r.crown ? ' &#128081;' : ''}</td>
        <td>${r.wins.toLocaleString('es')}</td>
        <td>${escapeHtml(r.rank)}</td>
        <td>${r.points.toLocaleString('es')}</td>
      </tr>
    `).join('');
  };

  function groupInventory(cards) {
    const groups = {};
    cards.forEach(c => {
      const k = cardKey(c);
      if (!groups[k]) groups[k] = { card: c, copies: [], keys: [] };
      groups[k].copies.push(c);
      if (getCardProgressLevel(c) > getCardProgressLevel(groups[k].card)) {
        groups[k].card = c;
      }
    });
    return Object.values(groups);
  }
  window.groupInventory = groupInventory;

  function nextRarity(r) {
    const i = RARITY_ORDER.indexOf(normalizeRarity(r));
    if (i < 0 || i >= RARITY_ORDER.length - 1) return null;
    return RARITY_ORDER[i + 1];
  }

  window.renderInventory = function () {
    const el = document.getElementById('inventory-grid');
    const u = getAuthUser();
    if (!el) return;
    const collection = resolveCardRefs(getUserCardRefs(u));
    if (!u || !collection.length) {
      el.innerHTML = '<p class="inventory-empty">No tienes cartas. Reclama el pack de bienvenida o visita la tienda.</p>';
      return;
    }
    const groups = groupInventory(collection);
    el.innerHTML = groups.map(g => {
      const c = typeof applyAnimeStats === 'function' ? applyAnimeStats(Object.assign({}, g.card)) : g.card;
      const count = g.copies.length;
      const progressLevel = getCardProgressLevel(c);
      const nr = nextRarity(c.rarity);
      const fusionPlan = getFusionPlan(count, progressLevel);
      const canUpgrade = fusionPlan.levels > 0;
      const targetLevel = progressLevel + fusionPlan.levels;
      const targetRarity = rarityForProgressLevel(targetLevel);
      const rarity = normalizeRarity(c.rarity).toLowerCase();
      const power = c.power || 0;
      const src = getCardImageSrc(c);
      const totalPwr = (c.power || 0) + (c.speed || 0) + (c.magic || 0) + (c.defense || 0) + (c.intelligence || 0);
      // Full card art HTML with image filling frame
      const art = buildCardArtHTML(c, { showName: true, showInfo: true });
      return `
        <div class="inventory-card-item rarity-${rarity}">
          <div class="inv-card-header">
            <span class="inv-card-name rarity-${rarity}">${escapeHtml(c.name)}</span>
            <span class="inv-power-badge">⚡${totalPwr}</span>
          </div>
          <div class="inventory-card-art">
            <div class="inv-art-wrap">${art}</div>
          </div>
          <div class="inventory-card-meta">
            <div class="inv-meta-row">
              <span class="inv-rarity rarity-tag-${rarity}">${c.rarity}</span>
              <span class="inv-copies">${count}×</span>
            </div>
            <span class="inv-series">${escapeHtml(c.series || '')}</span>
            <div class="inv-stats-mini">
              <span>💥${c.power||0}</span>
              <span>⚡${c.speed||0}</span>
              <span>✨${c.magic||0}</span>
              <span>🛡${c.defense||0}</span>
            </div>
            ${canUpgrade
              ? `<button type="button" class="btn-secondary inv-upgrade-btn" onclick="upgradeInventoryCard('${escapeAttr(c.name)}','${escapeAttr(c.series || c.anime || '')}')">Fusionar ${fusionPlan.totalCopiesToUse} copias -> ${targetRarity}</button>`
              : nr
                ? `<span class="inv-hint">Necesitas ${FUSION_COPIES_PER_LEVEL} copias para subir a ${nr}${fusionPlan.missingCopies ? ` (${fusionPlan.missingCopies} faltantes)` : ''}</span>`
                : '<span class="inv-hint inv-hint-max">Rango maximo SSS</span>'}
          </div>
        </div>`;
    }).join('');
    if (typeof attachCardInfoListeners === 'function') attachCardInfoListeners(el);
  };

  window.upgradeInventoryCard = function (name, series) {
    const u = getAuthUser();
    if (!u) return;
    const refs = getUserCardRefs(u);
    const matchingIndices = [];
    refs.forEach((c, i) => {
      if (sameCardIdentity(c, name, series)) matchingIndices.push(i);
    });
    if (matchingIndices.length < FUSION_COPIES_PER_LEVEL) {
      return alert(`Necesitas ${FUSION_COPIES_PER_LEVEL} copias de esta carta para subirla al siguiente rango.`);
    }
    const mainIndex = matchingIndices
      .slice()
      .sort((a, b) => getCardProgressLevel(refs[b]) - getCardProgressLevel(refs[a]) || a - b)[0];
    upgradeCardWithDuplicate(mainIndex);
  };

  /* ─── Batallas / stats ─── */
  window.onBattleWin = function () {
    const u = getAuthUser();
    if (u) {
      u.stats = u.stats || { wins: 0, losses: 0, totalBattles: 0 };
      u.stats.wins = (u.stats.wins || 0) + 1;
      u.stats.totalBattles = (u.stats.totalBattles || 0) + 1;
      u.rankPoints = (u.rankPoints || 0) + 25;
      u.rank = getRankName(u.rankPoints);
      ensurePlayerProfile().stats = u.stats;
      ensurePlayerProfile().rankingPoints = u.rankPoints;
      persistUser(u);
      recordMissionProgress('wins', 1);
      recordMissionProgress('battles', 1);
    }
    updateHUD();
  };

  window.onBattleLoss = function () {
    const u = getAuthUser();
    if (u) {
      u.stats = u.stats || { wins: 0, losses: 0, totalBattles: 0 };
      u.stats.losses = (u.stats.losses || 0) + 1;
      u.stats.totalBattles = (u.stats.totalBattles || 0) + 1;
      persistUser(u);
      recordMissionProgress('battles', 1);
    }
    updateHUD();
  };

  window.onRoundPlayed = function () {
    recordMissionProgress('rounds', 1);
  };

  window.onBattleComplete = function () {
    recordMissionProgress('battles', 0);
  };

  /* ─── Init ─── */
  window.initMythicMeta = function () {
    loadPlayerProfileFromAuth();
    updateHUD();
    const btn = document.getElementById('wheel-spin-btn');
    if (btn && !btn._bound) initWheel();
  };

  window.getAuthUser = getAuthUser;
  window.getUserCardRefs = getUserCardRefs;
  window.cardRef = cardRef;
  window.resolveCardRefs = resolveCardRefs;
  window.userToStorage = userToStorage;
  window.hydrateUserFromStorage = hydrateUserFromStorage;
  window.persistUser = persistUser;

  window.attachCardInfoListeners = function (root) {
    if (!root) return;
    root.querySelectorAll('.card-info-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const name = btn.getAttribute('data-card-name');
        const series = btn.getAttribute('data-card-series') || '';
        const rarity = normalizeRarity(btn.getAttribute('data-card-rarity'));
        const levelVal = parseInt(btn.getAttribute('data-card-level') || '1', 10);
        const indexVal = btn.getAttribute('data-card-index');

        const u = getAuthUser();
        let card = null;

        // Try to resolve exact card copy from profileCardRefs if we have an index
        if (u && indexVal !== null && indexVal !== '') {
          const idx = parseInt(indexVal, 10);
          if (u.profileCardRefs && u.profileCardRefs[idx]) {
            const ref = u.profileCardRefs[idx];
            card = resolveCardRef(ref);
            if (card) {
              card.index = idx;
            }
          }
        }

        // If card not found yet, try searching by name and series in profile collection
        // Do not do this if we are clicking from the shop (we want to see the base card we are buying)
        const isShop = btn.closest && btn.closest('.shop-card-tile');
        if (!card && u && !isShop) {
          const refs = getUserCardRefs(u);
          const idx = refs.findIndex(r => r.name === name && (r.series === series || r.anime === series || (!r.series && !series)));
          if (idx !== -1) {
            card = resolveCardRef(refs[idx]);
            if (card) {
              card.index = idx;
            }
          }
        }

        // Fallback to ALL_CARDS
        if (!card) {
          const base = (typeof ALL_CARDS !== 'undefined' ? ALL_CARDS : []).find(c => c.name === name);
          if (base) {
            card = Object.assign({}, base);
            card.rarity = rarity;
            card.level = levelVal;
            if (typeof applyAnimeStats === 'function') {
              card = applyAnimeStats(card);
            }
          }
        }

        if (card) {
          showCardInfoModal(card);
        }
      };
    });
  };

  function showCardInfoModal(card) {
    const existing = document.getElementById('card-info-modal');
    if (existing) existing.remove();

    const c = typeof applyAnimeStats === 'function' ? applyAnimeStats(card) : card;
    const src = getCardImageSrc(c);
    const ability = typeof getCardAbilityText === 'function' ? getCardAbilityText(c) : '';
    const rarity = normalizeRarity(c.rarity).toLowerCase();
    const totalPower = (c.power || 0) + (c.speed || 0) + (c.magic || 0) + (c.defense || 0) + (c.intelligence || 0);
    const tier = c.animeTier || (typeof ANIME_TIER !== 'undefined' ? ANIME_TIER[c.name] : null) || '?';

    const u = getAuthUser();
    let cardIndex = c.index;
    if (u && (cardIndex === undefined || cardIndex === null || cardIndex === '')) {
      const idx = u.profileCardRefs?.findIndex(r => r.name === c.name && (r.series === c.series || r.anime === c.series));
      if (idx !== undefined && idx !== -1) {
        cardIndex = idx;
      }
    }

    let dupCount = 0;
    const progressLevel = getCardProgressLevel(c);
    let fusionPlan = getFusionPlan(1, progressLevel);
    const numericCardIndex = parseInt(cardIndex, 10);
    if (u && cardIndex !== undefined && cardIndex !== null && cardIndex !== '') {
      const refs = getUserCardRefs(u);
      dupCount = refs.filter((ref, idx) => 
        idx !== numericCardIndex && 
        sameCardIdentity(ref, c.name, c.series || c.anime || '')
      ).length;
      fusionPlan = getFusionPlan(dupCount + 1, progressLevel);
    }

    const isBattle = document.getElementById('screen-battle')?.classList.contains('active');
    let upgradeBtnHTML = '';
    if (!isBattle && u && cardIndex !== undefined && cardIndex !== null && cardIndex !== '') {
      if (fusionPlan.levels > 0) {
        const targetRarity = rarityForProgressLevel(progressLevel + fusionPlan.levels);
        upgradeBtnHTML = `
          <button type="button" class="card-modal-upgrade-btn active" onclick="upgradeCardWithDuplicate(${numericCardIndex})">
            Fusionar ${fusionPlan.totalCopiesToUse} copias -> ${targetRarity} <span class="upgrade-dup-badge">${dupCount} duplicadas</span>
          </button>
        `;
      } else if (progressLevel >= MAX_CARD_LEVEL) {
        upgradeBtnHTML = `
          <button type="button" class="card-modal-upgrade-btn disabled" disabled>
            Rango maximo SSS <span class="upgrade-dup-badge">${dupCount} disponibles</span>
          </button>
        `;
      } else {
        upgradeBtnHTML = `
          <button type="button" class="card-modal-upgrade-btn disabled" disabled>
            Necesitas ${FUSION_COPIES_PER_LEVEL} copias <span class="upgrade-dup-badge">${fusionPlan.missingCopies} faltantes</span>
          </button>
        `;
      }
    }

    const modal = document.createElement('div');
    modal.id = 'card-info-modal';
    modal.className = 'card-info-modal-overlay';
    modal.innerHTML = `
      <div class="card-info-modal-content">
        <button type="button" class="card-info-modal-close" onclick="document.getElementById('card-info-modal').remove()">✕</button>
        <div class="card-info-modal-card rarity-${rarity}">
          <div class="card-info-modal-power-badge">${totalPower}</div>
          <img class="card-info-modal-img" src="${src}" alt="${escapeAttr(c.name)}">
          <button type="button" class="card-info-modal-info-icon">ℹ</button>
        </div>
        <div class="card-info-modal-details">
          <div class="card-info-modal-level">Nivel de Carta: <strong>Nvl. ${c.level || 1}</strong></div>
          <h2 class="card-info-modal-name">${escapeHtml(c.name)}</h2>
          <div class="card-info-modal-series">${escapeHtml(c.series || c.anime || '')}</div>
          <div class="card-info-modal-rarity rarity-${rarity}">${normalizeRarity(c.rarity)}</div>
          <div class="card-info-modal-tier">Tier: ${tier}</div>
          <div class="card-info-modal-ability">
            <span class="card-info-modal-ability-label">🔮 Habilidad:</span>
            <span>${escapeHtml(ability)}</span>
          </div>
          <div class="card-info-modal-stats">
            <div class="stat-row"><span class="stat-label">⚔ Poder</span><div class="stat-bar"><div class="stat-fill" style="width:${Math.min(100, (c.power||0)/20)}%;background:#ef4444"></div></div><span class="stat-val">${c.power || 0}</span></div>
            <div class="stat-row"><span class="stat-label">💨 Velocidad</span><div class="stat-bar"><div class="stat-fill" style="width:${Math.min(100, (c.speed||0)/20)}%;background:#3b82f6"></div></div><span class="stat-val">${c.speed || 0}</span></div>
            <div class="stat-row"><span class="stat-label">✨ Magia</span><div class="stat-bar"><div class="stat-fill" style="width:${Math.min(100, (c.magic||0)/20)}%;background:#a855f7"></div></div><span class="stat-val">${c.magic || 0}</span></div>
            <div class="stat-row"><span class="stat-label">🛡 Defensa</span><div class="stat-bar"><div class="stat-fill" style="width:${Math.min(100, (c.defense||0)/20)}%;background:#22c55e"></div></div><span class="stat-val">${c.defense || 0}</span></div>
            <div class="stat-row"><span class="stat-label">🧠 Inteligencia</span><div class="stat-bar"><div class="stat-fill" style="width:${Math.min(100, (c.intelligence||0)/20)}%;background:#eab308"></div></div><span class="stat-val">${c.intelligence || 0}</span></div>
          </div>
          ${upgradeBtnHTML}
        </div>
      </div>
    `;
    modal.addEventListener('click', function(ev) {
      if (ev.target === modal) modal.remove();
    });
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('visible'));
  }

  window.showCardInfoModal = showCardInfoModal;

  function syncDeckCardProgress(u, name, series, newLevel, newRarity) {
    if (!u) return;
    const match = (ref) => sameCardIdentity(ref, name, series);
    const applyProgress = (ref) => {
      if (!match(ref)) return;
      ref.level = newLevel;
      ref.rarity = newRarity;
    };

    // Sync custom decks
    if (Array.isArray(u.customDecks)) {
      u.customDecks.forEach(deck => {
        if (Array.isArray(deck.cardRefs)) {
          deck.cardRefs.forEach(applyProgress);
        }
      });
    }

    // Sync battle roster
    if (Array.isArray(u.battleRosterRefs)) {
      u.battleRosterRefs.forEach(applyProgress);
    }

    // Sync playerHand (in active combat hand, if populated)
    if (typeof playerHand !== 'undefined' && Array.isArray(playerHand)) {
      playerHand.forEach(c => {
        if (sameCardIdentity(c, name, series)) {
          c.level = newLevel;
          c.rarity = newRarity;
          if (typeof applyAnimeStats === 'function') {
            Object.assign(c, applyAnimeStats(c));
          }
        }
      });
    }
  }

  window.upgradeCardWithDuplicate = function (cardIndex) {
    const u = getAuthUser();
    if (!u) return alert('Debes iniciar sesión para fusionar cartas.');
    
    if (document.getElementById('screen-battle')?.classList.contains('active')) {
      return alert('No puedes fusionar duplicados durante una batalla activa.');
    }

    if (!u.profileCardRefs || !u.profileCardRefs[cardIndex]) {
      return alert('Carta principal no encontrada.');
    }

    const mainCardRef = u.profileCardRefs[cardIndex];
    const name = mainCardRef.name;
    const series = mainCardRef.series || mainCardRef.anime || '';

    const oldLevel = getCardProgressLevel(mainCardRef);
    const duplicateIndices = u.profileCardRefs
      .map((ref, idx) => ({ ref, idx }))
      .filter(item =>
        item.idx !== cardIndex &&
        sameCardIdentity(item.ref, name, series)
      )
      .map(item => item.idx);
    const fusionPlan = getFusionPlan(duplicateIndices.length + 1, oldLevel);

    if (oldLevel >= MAX_CARD_LEVEL) {
      return alert('Esta carta ya esta en rango SSS con estadisticas maximas.');
    }

    if (fusionPlan.levels <= 0) {
      return alert(`Necesitas ${FUSION_COPIES_PER_LEVEL} copias de esta carta para subirla al siguiente rango.`);
    }

    // Consume only complete fusion batches, keeping leftovers for future upgrades.
    const removeIndices = duplicateIndices
      .sort((a, b) => {
        const progressDiff = getCardProgressLevel(u.profileCardRefs[a]) - getCardProgressLevel(u.profileCardRefs[b]);
        return progressDiff || b - a;
      })
      .slice(0, fusionPlan.duplicatesToConsume)
      .sort((a, b) => b - a);
    removeIndices.forEach(idx => u.profileCardRefs.splice(idx, 1));

    const newLevel = Math.min(MAX_CARD_LEVEL, oldLevel + fusionPlan.levels);
    const oldRarity = mainCardRef.rarity || rarityForProgressLevel(oldLevel);
    const newRarity = rarityForProgressLevel(newLevel);
    applyProgressToRef(mainCardRef, newLevel);

    // Sync across decks, hand, etc.
    syncDeckCardProgress(u, name, series, newLevel, newRarity);

    // Save and persist
    u.battleRosterRefs = u.battleRosterRefs || [];
    ensurePlayerProfile().collection = resolveCardRefs(u.profileCardRefs);
    ensurePlayerProfile().battleRoster = resolveCardRefs(u.battleRosterRefs);
    persistUser(u);
    savePlayerProfileToAuth();
    recordMissionProgress('upgrades', 1);

    // Remove current card info modal
    const infoModal = document.getElementById('card-info-modal');
    if (infoModal) infoModal.remove();

    // Show glorious success modal
    showGloriousUpgradeSuccessModal(mainCardRef, oldLevel, newLevel, {
      fusedCopies: fusionPlan.duplicatesToConsume,
      totalCopiesUsed: fusionPlan.totalCopiesToUse,
      oldRarity,
      newRarity
    });

    // Re-render inventory / collection tab
    if (typeof renderInventory === 'function') renderInventory();
    if (typeof updateHUD === 'function') updateHUD();
  };

  window.showGloriousUpgradeSuccessModal = function (cardRef, oldLevel, newLevel, details) {
    const existing = document.getElementById('upgrade-success-modal');
    if (existing) existing.remove();

    // Fully resolve base card reference to retrieve base properties such as the card image!
    const baseCard = (typeof resolveCardRef === 'function' ? resolveCardRef(cardRef) : null) || cardRef;

    details = details || {};
    const oldRarity = details.oldRarity || rarityForProgressLevel(oldLevel);
    const newRarity = details.newRarity || rarityForProgressLevel(newLevel);
    const fusedCopies = Number(details.fusedCopies) || Math.max(1, newLevel - oldLevel);
    const totalCopiesUsed = Number(details.totalCopiesUsed) || (fusedCopies + 1);

    // Calculate old and new stats
    const oldCard = applyAnimeStats(Object.assign({}, baseCard, { rarity: oldRarity, level: oldLevel }));
    const newCard = applyAnimeStats(Object.assign({}, baseCard, { rarity: newRarity, level: newLevel }));
    const src = getCardImageSrc(newCard);
    const abilityText = typeof getCardAbilityText === 'function' ? getCardAbilityText(newCard) : '';
    const rarity = normalizeRarity(newCard.rarity).toLowerCase();

    const overlay = document.createElement('div');
    overlay.id = 'upgrade-success-modal';
    overlay.className = 'upgrade-success-overlay';
    overlay.innerHTML = `
      <div class="upgrade-success-content">
        <h1 class="upgrade-success-title">FUSIÓN EXITOSA</h1>
        <div class="upgrade-success-sub">${totalCopiesUsed} COPIAS USADAS (${fusedCopies} DUPLICADAS) - ${oldRarity} -> ${newRarity}</div>
        
        <div class="upgrade-success-flex">
          <div class="upgrade-success-left">
            <div class="card-info-modal-card rarity-${rarity}" style="width: 130px; margin: 0;">
              <div class="card-info-modal-power-badge">${(newCard.power||0)+(newCard.speed||0)+(newCard.magic||0)+(newCard.defense||0)+(newCard.intelligence||0)}</div>
              <img class="card-info-modal-img" src="${src}" alt="${escapeAttr(newCard.name)}">
            </div>
          </div>
          
          <div class="upgrade-success-right">
            <div class="upgrade-success-name">
              ${escapeHtml(newCard.name)}: Nvl. ${oldLevel} ➔ <strong>Nvl. ${newLevel}</strong>
            </div>

            <div class="upgrade-success-comparison">
              <div class="comparison-row">
                <span class="comparison-label">⚔ Poder</span>
                <span class="comparison-values">${oldCard.power || 0} ➔ ${newCard.power || 0} <span class="comparison-diff">(+${(newCard.power || 0) - (oldCard.power || 0)})</span></span>
              </div>
              <div class="comparison-row">
                <span class="comparison-label">💨 Velocidad</span>
                <span class="comparison-values">${oldCard.speed || 0} ➔ ${newCard.speed || 0} <span class="comparison-diff">(+${(newCard.speed || 0) - (oldCard.speed || 0)})</span></span>
              </div>
              <div class="comparison-row">
                <span class="comparison-label">✨ Magia</span>
                <span class="comparison-values">${oldCard.magic || 0} ➔ ${newCard.magic || 0} <span class="comparison-diff">(+${(newCard.magic || 0) - (oldCard.magic || 0)})</span></span>
              </div>
              <div class="comparison-row">
                <span class="comparison-label">🛡 Defensa</span>
                <span class="comparison-values">${oldCard.defense || 0} ➔ ${newCard.defense || 0} <span class="comparison-diff">(+${(newCard.defense || 0) - (oldCard.defense || 0)})</span></span>
              </div>
              <div class="comparison-row">
                <span class="comparison-label">🧠 Inteligencia</span>
                <span class="comparison-values">${oldCard.intelligence || 0} ➔ ${newCard.intelligence || 0} <span class="comparison-diff">(+${(newCard.intelligence || 0) - (oldCard.intelligence || 0)})</span></span>
              </div>
            </div>

            <div class="upgrade-success-ability">
              <strong>🔮 Habilidad Nvl. ${newLevel}:</strong><br>
              ${escapeHtml(abilityText)}
            </div>
          </div>
        </div>

        <button type="button" class="btn-primary upgrade-success-btn" onclick="document.getElementById('upgrade-success-modal').remove()">Aceptar</button>
      </div>
    `;
    overlay.addEventListener('click', function(ev) {
      if (ev.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));
  };

})();
