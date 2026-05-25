/**
 * Tienda, inventario, mazos (5), selector pre-batalla, arte de cartas
 */
(function () {
  'use strict';

  const DECK_COUNT = 5;
  const DECK_SIZE = 7;
  const RARITY_SORT = { F: 0, E: 1, D: 2, C: 3, B: 4, A: 5, S: 6, SS: 7, SSS: 8 };
  const SHOP_PRICES_BY_RANK = { F: 300, E: 400, D: 500, C: 600, B: 700, A: 800, S: 1000, SS: 2000, SSS: 4500 };

  function rankOf(cardOrRarity) {
    const rarity = typeof cardOrRarity === 'object' ? cardOrRarity?.rarity : cardOrRarity;
    if (typeof normalizeCardRarity === 'function') return normalizeCardRarity(rarity);
    const legacy = { Common: 'F', Rare: 'C', Epic: 'A', Legendary: 'S', SSS: 'SSS' };
    return legacy[rarity] || rarity || 'F';
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escAttr(s) {
    return String(s || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function getU() {
    if (window._currentAuthUser) return window._currentAuthUser;
    if (typeof window.getAuthUser === 'function') {
      const u = window.getAuthUser();
      if (u) return u;
    }
    if (typeof getAuthUser === 'function') {
      const u = getAuthUser();
      if (u) return u;
    }
    if (typeof getCurrentUser === 'function') {
      const raw = getCurrentUser();
      if (!raw) return null;
      if (typeof hydrateUserFromStorage === 'function') {
        window._currentAuthUser = hydrateUserFromStorage(Object.assign({}, raw));
        return window._currentAuthUser;
      }
      return raw;
    }
    return null;
  }

  function ensureCustomDecks(u) {
    if (!u) return;
    const refs = typeof getUserCardRefs === 'function' ? getUserCardRefs(u) : [];
    const starter = refs.slice(0, DECK_SIZE).map(c => (typeof cardRef === 'function' ? cardRef(c) : c));
    let changed = false;
    if (!Array.isArray(u.customDecks)) {
      u.customDecks = [];
      changed = true;
    }
    if (u.customDecks.length > DECK_COUNT) {
      u.customDecks = u.customDecks.slice(0, DECK_COUNT);
      changed = true;
    }
    for (let i = 0; i < DECK_COUNT; i++) {
      if (!u.customDecks[i]) {
        u.customDecks[i] = {
          id: i + 1,
          name: 'Mazo ' + (i + 1),
          cardRefs: i === 0 ? starter.slice() : []
        };
        changed = true;
      }
      if (u.customDecks[i].id !== i + 1) {
        u.customDecks[i].id = i + 1;
        changed = true;
      }
      if (!u.customDecks[i].name) {
        u.customDecks[i].name = 'Mazo ' + (i + 1);
        changed = true;
      }
      if (!Array.isArray(u.customDecks[i].cardRefs)) {
        u.customDecks[i].cardRefs = [];
        changed = true;
      }
    }
    if (!u.activeDeckId || u.activeDeckId > DECK_COUNT) {
      u.activeDeckId = 1;
      changed = true;
    }
    if (u.customDecks[0] && (!u.customDecks[0].cardRefs || !u.customDecks[0].cardRefs.length) && starter.length) {
      u.customDecks[0].cardRefs = starter.slice();
      changed = true;
    }
    if (changed && typeof persistUser === 'function') persistUser(u);
  }

  function cardArtTile(card, opts) {
    opts = opts || {};
    if (!card || typeof buildCardArtHTML !== 'function') return '';
    const inner = buildCardArtHTML(card, {
      showName: opts.showName !== false,
      showInfo: opts.showInfo !== false,
      showSeries: false
    });
    return '<div class="card-tile-visual">' + inner + '</div>';
  }

  function cardTotalPower(card) {
    const c = typeof applyAnimeStats === 'function' ? applyAnimeStats(Object.assign({}, card)) : card;
    return (c.power || 0) + (c.speed || 0) + (c.magic || 0) + (c.defense || 0) + (c.intelligence || 0);
  }

  function sortByPowerDesc(cards) {
    return cards.slice().sort((a, b) => {
      const diff = cardTotalPower(b) - cardTotalPower(a);
      if (diff !== 0) return diff;
      return (a.name || '').localeCompare(b.name || '', 'es');
    });
  }

  function normalizeSearch(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function matchesCardSearch(card, query) {
    const q = normalizeSearch(query);
    if (!q) return true;
    return normalizeSearch(card.name).includes(q);
  }

  function searchBoxHTML(id, value, handlerName) {
    return '<div class="card-search-row">' +
      '<input id="' + id + '" type="search" class="auth-input card-search-input" value="' + escAttr(value) + '" placeholder="Buscar carta..." oninput="' + handlerName + '(this.value)">' +
      '</div>';
  }

  window.ensureCustomDecks = ensureCustomDecks;

  window.getActiveDeckCards = function () {
    const u = getU();
    if (!u) return [];
    ensureCustomDecks(u);
    const deck = u.customDecks.find(d => d.id === (u.activeDeckId || 1));
    const deckRefs = (deck && deck.cardRefs) ? deck.cardRefs.filter(r => r && r.name) : [];
    const refs = deckRefs.length >= DECK_SIZE
      ? deckRefs.slice(0, DECK_SIZE)
      : (typeof getUserCardRefs === 'function' ? getUserCardRefs(u).slice(0, DECK_SIZE) : []);
    const cards = typeof resolveCardRefs === 'function' ? resolveCardRefs(refs) : [];
    return cards.filter(c => c && c.name).slice(0, DECK_SIZE);
  };

  window.setActiveDeck = function (deckId) {
    const u = getU();
    if (!u) return;
    ensureCustomDecks(u);
    u.activeDeckId = deckId;
    if (typeof persistUser === 'function') persistUser(u);
  };

  window.saveDeckCards = function (deckId, refs) {
    const u = getU();
    if (!u) return;
    ensureCustomDecks(u);
    const deck = u.customDecks.find(d => d.id === deckId);
    if (!deck) return;
    deck.cardRefs = refs.slice(0, DECK_SIZE).map(c => (typeof cardRef === 'function' ? cardRef(c) : c));
    if (typeof persistUser === 'function') persistUser(u);
    if (typeof renderInventory === 'function') renderInventory();
  };

  let invTab = 'collection';
  let shopTab = 'all';
  let invSearch = '';
  let shopSearch = '';

  window.switchInventoryTab = function (tab) {
    invTab = tab;
    renderInventory();
  };

  window.switchShopTab = function (tab) {
    shopTab = tab === 'special' ? 'special' : 'all';
    renderShop();
  };

  window.setInventorySearch = function (value) {
    invSearch = value || '';
    renderInventory();
    const input = document.getElementById('inventory-search');
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  };

  window.setShopSearch = function (value) {
    shopSearch = value || '';
    renderShop();
    const input = document.getElementById('shop-search');
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  };

  window.renderInventory = function () {
    const root = document.getElementById('inventory-grid');
    const u = getU();
    if (!root) return;

    ensureCustomDecks(u);

    const tabs =
      '<div class="inv-tabs">' +
      '<button type="button" class="inv-tab-btn ' + (invTab === 'collection' ? 'active' : '') + '" onclick="switchInventoryTab(\'collection\')">Colección</button>' +
      '<button type="button" class="inv-tab-btn ' + (invTab === 'decks' ? 'active' : '') + '" onclick="switchInventoryTab(\'decks\')">Mazos</button>' +
      '</div>';

    root.innerHTML = tabs;

    if (!u) {
      root.innerHTML += '<p class="inventory-empty">Inicia sesión para ver tu inventario.</p>';
      return;
    }

    if (invTab === 'decks') {
      if (typeof window.renderDecksMatrix === 'function') {
        root.innerHTML += window.renderDecksMatrix(u);
        if (typeof attachCardInfoListeners === 'function') attachCardInfoListeners(root);
      } else {
        root.innerHTML += renderDecksEditor(u);
        bindDeckEditor(u);
      }
      return;
    }

    root.innerHTML += searchBoxHTML('inventory-search', invSearch, 'setInventorySearch');

    const collection = sortByPowerDesc(typeof resolveCardRefs === 'function' ? resolveCardRefs(getUserCardRefs(u)) : [])
      .filter(c => matchesCardSearch(c, invSearch));
    if (!collection.length) {
      root.innerHTML += '<p class="inventory-empty">No hay cartas con ese nombre.</p>';
      return;
    }

    let html = '<div class="inventory-cards-grid">';
    collection.forEach(function(c) {
      const level = c.level || 1;
      const totalPower = cardTotalPower(c);
      html +=
        '<div class="inventory-card-tile rarity-' + rankOf(c).toLowerCase() + '">' +
        '<div class="inventory-card-art">' +
          cardArtTile(c, { showInfo: true }) +
          '<div class="card-power-badge inventory-power-badge">' + totalPower + '</div>' +
        '</div>' +
        '<div class="inventory-card-meta">' +
        '<strong>' + esc(c.name) + '</strong>' +
        '<div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin: 0.15rem 0;">' +
          '<span class="inv-rarity">' + esc(rankOf(c)) + '</span>' +
          '<span class="inv-level">Nvl. ' + level + '</span>' +
        '</div>' +
        '<span class="inv-series">' + esc(c.series || c.anime || '') + '</span>' +
        '</div></div>';
    });
    html += '</div>';
    root.innerHTML += html;
    if (typeof attachCardInfoListeners === 'function') attachCardInfoListeners(root);
  };

  function renderDecksEditor(u) {
    const active = u.activeDeckId || 1;
    const collection = sortByPowerDesc(typeof resolveCardRefs === 'function' ? resolveCardRefs(getUserCardRefs(u)) : []);
    let html = '<p class="modes-sub">Crea hasta 5 mazos de 7 cartas. Elige uno antes de cada partida.</p><div class="decks-grid">';
    u.customDecks.forEach(deck => {
      const resolved = typeof resolveCardRefs === 'function' ? resolveCardRefs(deck.cardRefs || []) : [];
      const valid = resolved.length >= DECK_SIZE;
      html +=
        '<div class="deck-slot-card ' + (deck.id === active ? 'deck-active' : '') + '">' +
        '<div class="deck-slot-head">' +
        '<input class="deck-name-input" data-deck-id="' + deck.id + '" value="' + escAttr(deck.name) + '" maxlength="24">' +
        '<span class="deck-count">' + resolved.length + '/' + DECK_SIZE + '</span>' +
        '</div>' +
        '<div class="deck-preview-row">' +
        (resolved.length
          ? resolved.slice(0, 7).map(c => '<div class="deck-mini-art">' + cardArtTile(c, { showName: false, showInfo: false }) + '</div>').join('')
          : '<span class="inv-hint">Vacío — añade cartas abajo</span>') +
        '</div>' +
        '<div class="deck-slot-actions">' +
        '<button type="button" class="btn-secondary" onclick="setActiveDeck(' + deck.id + ')">' + (deck.id === active ? '✓ Activo' : 'Usar mazo') + '</button>' +
        '<button type="button" class="btn-primary deck-edit-btn" data-deck="' + deck.id + '">Editar</button>' +
        '</div>' +
        '<div class="deck-editor hidden" id="deck-editor-' + deck.id + '">' +
        '<p class="inv-hint">Clic en cartas de tu colección para añadir/quitar (máx ' + DECK_SIZE + ')</p>' +
        '<div class="deck-pick-grid" data-deck-pick="' + deck.id + '"></div>' +
        '</div></div>';
    });
    html += '</div><h3 class="deck-pool-title">Tu colección</h3><div class="deck-pool-grid">';
    collection.forEach(c => {
      html +=
        '<button type="button" class="deck-pool-card" data-pick-name="' + escAttr(c.name) + '" data-pick-series="' + escAttr(c.series || c.anime || '') + '">' +
        cardArtTile(c, { showName: true, showInfo: true }) +
        '</button>';
    });
    html += '</div>';
    return html;
  }

  function bindDeckEditor(u) {
    document.querySelectorAll('.deck-edit-btn').forEach(btn => {
      btn.onclick = function () {
        const id = parseInt(btn.getAttribute('data-deck'), 10);
        const ed = document.getElementById('deck-editor-' + id);
        if (ed) ed.classList.toggle('hidden');
        renderDeckPickGrid(u, id);
      };
    });
    document.querySelectorAll('.deck-name-input').forEach(inp => {
      inp.onchange = function () {
        const id = parseInt(inp.getAttribute('data-deck-id'), 10);
        const deck = u.customDecks.find(d => d.id === id);
        if (deck) {
          deck.name = inp.value.trim() || ('Mazo ' + id);
          if (typeof persistUser === 'function') persistUser(u);
        }
      };
    });
  }

  function renderDeckPickGrid(u, deckId) {
    const grid = document.querySelector('[data-deck-pick="' + deckId + '"]');
    if (!grid) return;
    const deck = u.customDecks.find(d => d.id === deckId);
    if (!deck) return;
    const collection = sortByPowerDesc(typeof resolveCardRefs === 'function' ? resolveCardRefs(getUserCardRefs(u)) : []);
    const inDeck = (c) => (deck.cardRefs || []).some(r => r.name === c.name && (r.series || r.anime) === (c.series || c.anime));
    grid.innerHTML = collection.map(c => {
      const sel = inDeck(c);
      return '<button type="button" class="deck-pick-item ' + (sel ? 'selected' : '') + '" data-deck="' + deckId + '" data-name="' + escAttr(c.name) + '" data-series="' + escAttr(c.series || c.anime || '') + '">' +
        cardArtTile(c, { showName: true, showInfo: false }) + '</button>';
    }).join('');
    grid.querySelectorAll('.deck-pick-item').forEach(btn => {
      btn.onclick = function () {
        toggleDeckCard(u, deckId, btn.getAttribute('data-name'), btn.getAttribute('data-series'));
        renderDeckPickGrid(u, deckId);
        renderInventory();
      };
    });
  }

  function toggleDeckCard(u, deckId, name, series) {
    const deck = u.customDecks.find(d => d.id === deckId);
    if (!deck) return;
    if (!deck.cardRefs) deck.cardRefs = [];
    const idx = deck.cardRefs.findIndex(r => r.name === name && (r.series || r.anime) === series);
    if (idx >= 0) {
      deck.cardRefs.splice(idx, 1);
    } else {
      if (deck.cardRefs.length >= DECK_SIZE) {
        alert('Máximo ' + DECK_SIZE + ' cartas por mazo.');
        return;
      }
      const card = (typeof resolveCardRefs === 'function' ? resolveCardRefs(getUserCardRefs(u)) : [])
        .find(c => c.name === name && (c.series || c.anime) === series);
      if (card && typeof cardRef === 'function') deck.cardRefs.push(cardRef(card));
    }
    if (typeof persistUser === 'function') persistUser(u);
  }

  window.renderShop = function () {
    const grid = document.getElementById('shop-packs');
    if (!grid || typeof ALL_CARDS === 'undefined') return;

    const bySeries = {};
    const sssCards = [];
    ALL_CARDS.forEach(c => {
      if (rankOf(c) === 'SSS' || (c.series || c.anime) === 'Ediccion especial') {
        sssCards.push(c);
        return;
      }
      const s = c.series || c.anime || 'Otros';
      if (!bySeries[s]) bySeries[s] = [];
      bySeries[s].push(c);
    });

    const seriesNames = Object.keys(bySeries).sort((a, b) => a.localeCompare(b, 'es'));
    const diamonds = typeof getPlayerDiamonds === 'function' ? getPlayerDiamonds() : 0;

    let html =
      '<div class="inv-tabs shop-tabs">' +
      '<button type="button" class="inv-tab-btn ' + (shopTab === 'all' ? 'active' : '') + '" onclick="switchShopTab(\'all\')">ALL</button>' +
      '<button type="button" class="inv-tab-btn ' + (shopTab === 'special' ? 'active' : '') + '" onclick="switchShopTab(\'special\')">SPECIAL EDITION</button>' +
      '</div>' +
      searchBoxHTML('shop-search', shopSearch, 'setShopSearch');

    if (shopTab === 'special') {
      const specialCards = sssCards
        .filter(c => matchesCardSearch(c, shopSearch))
        .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es'));
      if (!specialCards.length) {
        grid.innerHTML = html + '<p class="inventory-empty">No hay cartas con ese nombre.</p>';
        return;
      }
      html += '<section class="shop-anime-row shop-sss-row"><div class="shop-anime-label"><span class="shop-anime-icon">SSS</span><h3>SPECIAL EDITION</h3></div>';
      html += '<div class="shop-anime-cards">';
      specialCards.forEach(card => {
        const displayCard = Object.assign({}, card, { rarity: rankOf(card) });
        const price = SHOP_PRICES_BY_RANK.SSS;
        const totalPower = cardTotalPower(displayCard);
        html +=
          '<div class="shop-card-tile pack-sss">' +
          '<div class="shop-card-art">' + 
            cardArtTile(displayCard, { showInfo: true, showName: true }) + 
            '<div class="card-power-badge shop-power-badge" style="position:absolute; top:6px; left:6px; z-index:20;">' + totalPower + '</div>' +
          '</div>' +
          '<div class="shop-card-info">' +
          '<span class="shop-card-total-power">Poder total: ' + totalPower.toLocaleString('es') + '</span>' +
          '<span class="shop-card-price">' + price.toLocaleString('es') + ' 💎</span>' +
          '<button type="button" class="btn-primary shop-buy-btn" onclick="buyShopCard(\'' + escAttr(card.name) + '\',\'' + escAttr(card.series || card.anime || 'Ediccion especial') + '\')">Comprar</button>' +
          '</div></div>';
      });
      html += '</div></section>';
      grid.innerHTML = html;
      if (typeof attachCardInfoListeners === 'function') attachCardInfoListeners(grid);
      return;
    }

    let shopMatches = 0;
    seriesNames.forEach(series => {
      const cards = bySeries[series].slice().filter(c => matchesCardSearch(c, shopSearch)).sort((a, b) => {
        const ra = RARITY_SORT[rankOf(a)] ?? 0;
        const rb = RARITY_SORT[rankOf(b)] ?? 0;
        if (ra !== rb) return ra - rb;
        return (a.name || '').localeCompare(b.name || '', 'es');
      });
      if (!cards.length) return;
      shopMatches += cards.length;

      html += '<section class="shop-anime-row"><div class="shop-anime-label"><span class="shop-anime-icon">📺</span><h3>' + esc(series) + '</h3></div>';
      html += '<div class="shop-anime-cards">';
      cards.forEach(card => {
        const displayCard = Object.assign({}, card, { rarity: rankOf(card) });
        const price = SHOP_PRICES_BY_RANK[displayCard.rarity] || 100;
        const totalPower = cardTotalPower(displayCard);
        const ability = typeof getCardAbilityText === 'function' ? getCardAbilityText(card) : '';
        html +=
          '<div class="shop-card-tile pack-' + displayCard.rarity.toLowerCase() + '">' +
          '<div class="shop-card-art">' + 
            cardArtTile(displayCard, { showInfo: true, showName: true }) + 
            '<div class="card-power-badge shop-power-badge" style="position:absolute; top:6px; left:6px; z-index:20;">' + totalPower + '</div>' +
          '</div>' +
          '<div class="shop-card-info">' +
          '<span class="shop-card-total-power">Poder total: ' + totalPower.toLocaleString('es') + '</span>' +
          '<span class="shop-card-price">' + price + ' 💎</span>' +
          '<button type="button" class="btn-primary shop-buy-btn" onclick="buyShopCard(\'' + escAttr(card.name) + '\',\'' + escAttr(series) + '\')">Comprar</button>' +
          '</div></div>';
      });
      html += '</div></section>';
    });

    if (!shopMatches) {
      html += '<p class="inventory-empty">No hay cartas con ese nombre.</p>';
    }

    grid.innerHTML = html;
    if (typeof attachCardInfoListeners === 'function') attachCardInfoListeners(grid);
  };

  window.promptSelectDeck = function (callback) {
    const u = getU();
    if (!u) return;
    ensureCustomDecks(u);

    const validDecks = u.customDecks.filter(d => {
      const n = (d.cardRefs || []).filter(r => r && r.name).length;
      return n >= DECK_SIZE;
    });

    if (!validDecks.length) {
      alert('Necesitas un mazo de al menos ' + DECK_SIZE + ' cartas. Ve a Inventario → Mazos.');
      return;
    }

    if (validDecks.length === 1) {
      u.activeDeckId = validDecks[0].id;
      if (typeof persistUser === 'function') persistUser(u);
      callback(getActiveDeckCards());
      return;
    }

    let modal = document.getElementById('deck-select-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'deck-select-modal';
      modal.className = 'deck-select-modal';
      document.body.appendChild(modal);
    }

    modal.innerHTML =
      '<div class="deck-select-panel">' +
      '<h3>Elige tu mazo</h3>' +
      '<p class="modes-sub">' + DECK_SIZE + ' cartas por mazo</p>' +
      '<div class="deck-select-list">' +
      validDecks.map(d => {
        const n = (d.cardRefs || []).length;
        return '<button type="button" class="deck-select-btn" data-id="' + d.id + '">' +
          '<strong>' + esc(d.name) + '</strong><span>' + n + ' cartas</span></button>';
      }).join('') +
      '</div>' +
      '<button type="button" class="btn-secondary deck-select-cancel">Cancelar</button>' +
      '</div>';
    modal.classList.add('visible');

    modal.querySelector('.deck-select-cancel').onclick = () => modal.classList.remove('visible');
    modal.querySelectorAll('.deck-select-btn').forEach(btn => {
      btn.onclick = function () {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        u.activeDeckId = id;
        if (typeof persistUser === 'function') persistUser(u);
        modal.classList.remove('visible');
        callback(getActiveDeckCards());
      };
    });
  };

  window.startCardBattle = function (afterSetup) {
    if (typeof hasBattleRoster === 'function' && !hasBattleRoster()) {
      alert('Reclama tu pack de bienvenida (7 cartas) antes de jugar.');
      return;
    }
    promptSelectDeck(function (deckCards) {
      window._battleDeckOverride = deckCards;
      if (typeof afterSetup === 'function') afterSetup();
      else if (typeof startGame === 'function') startGame();
    });
  };

  const origLoad = window.loadPlayerProfileFromAuth;
  if (origLoad) {
    window.loadPlayerProfileFromAuth = function () {
      const ok = origLoad();
      const u = getU();
      if (u) ensureCustomDecks(u);
      return ok;
    };
  }
})();
