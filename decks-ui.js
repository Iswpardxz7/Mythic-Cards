/**
 * Mazos: 5 columnas x 7 filas, selector de cartas, activar/borrar mazo
 */
(function () {
  'use strict';

  const DECK_SIZE = 7;
  let pickerDeckId = null;
  let pickerSlot = null;

  function normalizeSearch(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function cardTotalPower(card) {
    if (!card) return 0;
    return (card.power || 0) + (card.speed || 0) + (card.magic || 0) + (card.defense || 0) + (card.intelligence || 0);
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escAttr(s) {
    return String(s || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function getU() {
    if (window._currentAuthUser) return window._currentAuthUser;
    if (typeof getAuthUser === 'function') return getAuthUser();
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

  function cardMini(card) {
    if (!card || typeof buildCardArtHTML !== 'function') return '';
    // deck-slot-visual: posicion absoluta que rellena el boton
    return '<div class="deck-slot-visual">' +
      '<div class="card-power-badge deck-slot-power-badge">' + cardTotalPower(card) + '</div>' +
      '<div class="card-tile-visual">' +
      buildCardArtHTML(card, { showName: false, showInfo: true }) +
      '</div></div>';
  }

  function deckSlotsResolved(deck) {
    const refs = deck.cardRefs || [];
    const out = [];
    for (let i = 0; i < DECK_SIZE; i++) {
      const r = refs[i];
      if (r && r.name && typeof resolveCardRefs === 'function') {
        const c = resolveCardRefs([r])[0];
        out.push(c || null);
      } else {
        out.push(null);
      }
    }
    return out;
  }

  window.renderDecksMatrix = function (u) {
    if (!u) return '<p class="inventory-empty">Inicia sesión para ver tus mazos.</p>';
    if (typeof ensureCustomDecks === 'function') ensureCustomDecks(u);
    const active = u.activeDeckId || 1;

    let html = '<p class="modes-sub">5 mazos · 7 cartas por mazo · Pulsa + o una carta para cambiar</p>';
    html += '<div class="decks-matrix">';

    u.customDecks.forEach(function (deck) {
      const slots = deckSlotsResolved(deck);
      const filled = slots.filter(Boolean).length;
      const isActive = deck.id === active;
      html += '<div class="deck-column' + (isActive ? ' deck-column-active' : '') + '">';
      html += '<div class="deck-column-title">Mazo ' + deck.id + '</div>';
      html += '<span class="deck-fill-count">' + filled + '/' + DECK_SIZE + '</span>';
      for (let row = 0; row < DECK_SIZE; row++) {
        const card = slots[row];
        html += '<div class="deck-slot-btn' + (card ? ' filled' : '') + '" role="button" tabindex="0" onclick="openDeckSlotPicker(' + deck.id + ',' + row + ')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();openDeckSlotPicker(' + deck.id + ',' + row + ')}">';
        html += card ? cardMini(card) : '<span class="deck-slot-plus">+</span>';
        html += '</div>';
      }
      html += '<button type="button" class="btn-primary deck-select-btn" onclick="selectDeckForBattle(' + deck.id + ')">' +
        (isActive ? '✓ Mazo activo' : 'Seleccionar mazo') + '</button>';
      html += '<button type="button" class="btn-secondary deck-clear-btn" onclick="clearDeck(' + deck.id + ')">Borrar mazo</button>';
      html += '</div>';
    });

    html += '</div>';
    setTimeout(function () {
      const root = document.getElementById('inventory-grid');
      if (root && typeof attachCardInfoListeners === 'function') attachCardInfoListeners(root);
    }, 0);
    return html;
  };

  window.filterDeckCardPicker = function (value) {
    const q = normalizeSearch(value);
    const modal = document.getElementById('deck-card-picker-modal');
    if (!modal) return;
    modal.querySelectorAll('.deck-picker-card').forEach(function (item) {
      const haystack = item.getAttribute('data-search') || '';
      item.style.display = !q || haystack.indexOf(q) !== -1 ? '' : 'none';
    });
  };

  window.openDeckSlotPicker = function (deckId, slotIndex) {
    const u = getU();
    if (!u) return;
    pickerDeckId = deckId;
    pickerSlot = slotIndex;
    const collection = typeof resolveCardRefs === 'function'
      ? resolveCardRefs(typeof getUserCardRefs === 'function' ? getUserCardRefs(u) : [])
      : [];

    let modal = document.getElementById('deck-card-picker-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'deck-card-picker-modal';
      modal.className = 'deck-card-picker-modal';
      document.body.appendChild(modal);
    }

    // Agrupa cartas para mostrar copias
    let groups;
    if (typeof groupInventory === 'function') {
      groups = groupInventory(collection);
    } else {
      // Fallback: mostrar todas sin agrupar
      groups = collection.map(function(c) { return { card: c, copies: [c] }; });
    }

    if (!groups || !groups.length) {
      modal.innerHTML = '<div class="deck-picker-panel"><button type="button" class="deck-picker-back" onclick="closeDeckCardPicker()">← Volver a mazos</button><p style="color:#9ca3af;text-align:center;padding:2rem">No tienes cartas en tu colección.</p></div>';
      modal.classList.add('visible');
      modal.style.display = 'flex';
      return;
    }

    let grid = '';
    groups.forEach(function (g) {
      const c = g.card || g;
      const count = (g.copies && g.copies.length) ? g.copies.length : 1;
      const series = c.series || c.anime || '';
      const search = normalizeSearch([c.name, series, c.rarity || ''].join(' '));
      grid += '<div class="deck-picker-card" role="button" tabindex="0" data-name="' + escAttr(c.name) + '" data-series="' + escAttr(series) + '" data-search="' + escAttr(search) + '" onclick="assignCardToDeckSlot(this.getAttribute(\'data-name\'), this.getAttribute(\'data-series\'))" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();assignCardToDeckSlot(this.getAttribute(\'data-name\'), this.getAttribute(\'data-series\'))}">' +
        '<div class="card-tile-visual" style="aspect-ratio:5/7;position:relative;">' +
        '<div class="card-power-badge deck-picker-power-badge">' + cardTotalPower(c) + '</div>' +
        buildCardArtHTML(c, { showName: true, showInfo: true }) +
        (count > 1 ? '<div style="position:absolute;top:2px;right:2px;background:#0a0512;border:1px solid #fbbf24;color:#fbbf24;font-size:0.65rem;font-weight:bold;padding:1px 5px;border-radius:8px;z-index:20;">×' + count + '</div>' : '') +
        '</div></div>';
    });

    modal.innerHTML = '<div class="deck-picker-panel">' +
      '<button type="button" class="deck-picker-back" onclick="closeDeckCardPicker()">← Volver a mazos</button>' +
      '<h3>Carta para Mazo ' + deckId + ' · Casilla ' + (slotIndex + 1) + '</h3>' +
      '<div class="deck-picker-search-row"><input id="deck-picker-search" type="search" class="auth-input deck-picker-search-input" placeholder="Buscar carta..." oninput="filterDeckCardPicker(this.value)"></div>' +
      '<div class="deck-picker-grid">' + grid + '</div></div>';
    modal.classList.add('visible');
    modal.style.display = 'flex';
    if (typeof attachCardInfoListeners === 'function') attachCardInfoListeners(modal);
  };

  window.closeDeckCardPicker = function () {
    const modal = document.getElementById('deck-card-picker-modal');
    if (modal) {
      modal.classList.remove('visible');
      modal.style.display = 'none';
    }
    pickerDeckId = null;
    pickerSlot = null;
    if (typeof renderInventory === 'function') renderInventory();
  };

  window.assignCardToDeckSlot = function (name, series) {
    const u = getU();
    if (!u || pickerDeckId == null || pickerSlot == null) return;
    if (typeof ensureCustomDecks === 'function') ensureCustomDecks(u);
    const deck = u.customDecks.find(function (d) { return d.id === pickerDeckId; });
    if (!deck || typeof cardRef !== 'function') return;
    const card = (typeof resolveCardRefs === 'function' ? resolveCardRefs(
      typeof getUserCardRefs === 'function' ? getUserCardRefs(u) : []
    ) : []).find(function (c) {
      return c.name === name && (c.series === series || c.anime === series);
    });
    if (!card) return;
    if (!deck.cardRefs) deck.cardRefs = [];
    while (deck.cardRefs.length < DECK_SIZE) deck.cardRefs.push(null);
    deck.cardRefs[pickerSlot] = cardRef(card);
    if (typeof persistUser === 'function') persistUser(u);
    closeDeckCardPicker();
  };

  window.selectDeckForBattle = function (deckId) {
    const u = getU();
    if (!u) return;
    if (typeof ensureCustomDecks === 'function') ensureCustomDecks(u);
    const deck = u.customDecks.find(function (d) { return d.id === deckId; });
    const filled = (deck && deck.cardRefs) ? deck.cardRefs.filter(function (r) { return r && r.name; }).length : 0;
    if (filled < DECK_SIZE) {
      alert('Necesitas 7 cartas en este mazo. Rellena los 7 espacios.');
      return;
    }
    u.activeDeckId = deckId;
    if (typeof persistUser === 'function') persistUser(u);
    if (typeof renderInventory === 'function') renderInventory();
    alert('Mazo ' + deckId + ' listo para batalla.');
  };

  window.clearDeck = function (deckId) {
    const u = getU();
    if (!u || !confirm('¿Borrar todo el mazo ' + deckId + '?')) return;
    if (typeof ensureCustomDecks === 'function') ensureCustomDecks(u);
    const deck = u.customDecks.find(function (d) { return d.id === deckId; });
    if (deck) {
      deck.cardRefs = [];
      if (typeof persistUser === 'function') persistUser(u);
      if (typeof renderInventory === 'function') renderInventory();
    }
  };

})();
