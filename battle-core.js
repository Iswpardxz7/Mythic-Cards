/**
 * Reparto de cartas y pantalla de batalla (sobrescribe inline en MythicCards.html)
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

  function getBattleCardStats(card) {
    return typeof applyAnimeStats === 'function' ? applyAnimeStats(card) : card;
  }

  function getBattleTotal(card) {
    const c = getBattleCardStats(card);
    return (c.power || 0) + (c.speed || 0) + (c.magic || 0) + (c.defense || 0) + (c.intelligence || 0);
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.dealHands = function dealHands() {
    let playerPool = [];
    if (window._battleDeckOverride && window._battleDeckOverride.length >= 7) {
      playerPool = window._battleDeckOverride.slice();
    } else if (typeof getActiveDeckCards === 'function') {
      playerPool = getActiveDeckCards();
    } else if (typeof getPlayerBattlePool === 'function') {
      playerPool = getPlayerBattlePool();
    }
    if (playerPool.length < 7 && typeof ALL_CARDS !== 'undefined') {
      playerPool = ALL_CARDS.slice();
    }

    let aiPool = [];
    if (window._draftAIPool && window._draftAIPool.length >= 7) {
      aiPool = window._draftAIPool.slice();
    } else if (typeof window._campaignAIPoolRarity === 'string' && typeof ALL_CARDS !== 'undefined') {
      const rarity = window._campaignAIPoolRarity;
      aiPool = ALL_CARDS.filter(c => {
        const cardRarity = typeof normalizeCardRarity === 'function' ? normalizeCardRarity(c.rarity) : (c.rarity || 'F');
        return cardRarity === rarity;
      });
      if (aiPool.length < 7) {
        aiPool = ALL_CARDS.slice();
      }
    } else if (typeof ALL_CARDS !== 'undefined') {
      aiPool = ALL_CARDS.slice();
    }

    const pShuf = playerPool.sort(() => Math.random() - 0.5);
    const aShuf = aiPool.sort(() => Math.random() - 0.5);
    playerDeck = pShuf.slice(0, Math.min(35, pShuf.length));
    aiDeck = aShuf.slice(0, Math.min(35, aShuf.length));
    if (aiDeck.length < 5 && typeof ALL_CARDS !== 'undefined') {
      aiDeck = ALL_CARDS.slice().sort(() => Math.random() - 0.5).slice(0, 35);
    }
    playerHand = playerDeck.splice(0, Math.min(7, playerDeck.length));
    aiHand = aiDeck.splice(0, Math.min(7, aiDeck.length));
    scores = [];
  };

  const _inlineStartGame = window.startGame;
  window.startGame = function startGame() {
    if (typeof hasBattleRoster === 'function' && !hasBattleRoster()) {
      alert('Reclama tu pack de bienvenida (7 cartas) antes de jugar.');
      return;
    }
    dealHands();
    p1Wins = 0;
    p2Wins = 0;
    round = 1;
    selectedCard = null;
    aiSelectedCard = null;
    gamePhase = 'select';
    if (typeof window.showScreen === 'function') window.showScreen('battle');
    else if (typeof showScreen === 'function') showScreen('battle');
    if (typeof renderHand === 'function') renderHand();
    if (typeof updateStats === 'function') updateStats();
    if (typeof renderScoreTrack === 'function') renderScoreTrack();
    if (typeof updatePhase === 'function') updatePhase('Selecciona tu carta');
    if (typeof setLog === 'function') setLog('¡Elige una carta de tu mano para iniciar el combate!');
    const btn = document.getElementById('btn-reveal');
    if (btn) btn.style.display = 'none';
    if (typeof renderSlots === 'function') renderSlots(null, null);
  };

  window.getTotal = function getTotal(card) {
    return getBattleTotal(card);
  };

  window.buildCardHTML = function buildCardHTML(card, revealed) {
    const c = getBattleCardStats(card);
    const rarity = typeof normalizeCardRarity === 'function'
      ? normalizeCardRarity(card.rarity)
      : ({ Common: 'F', Rare: 'C', Epic: 'A', Legendary: 'S', SSS: 'SSS' }[card.rarity] || card.rarity || 'F');
    const rarityClass = 'rarity-' + rarity;
    const totalPower = getBattleTotal(card);

    return `
      <div class="battle-card">
        <div class="card-inner${revealed ? ' flipped' : ''}">
          <div class="card-back">
            <img src="${CARD_BACK}" alt="Card Back">
          </div>
          <div class="card-face ${rarityClass}">
            <div class="card-img-wrap">
              <img src="${getCardImageSrc(card)}" alt="${escapeHTML(card.name)}" loading="lazy">
              <div class="card-power-badge battle-power-badge">${totalPower}</div>
              <div class="rarity-badge ${rarityClass}">${escapeHTML(rarity)}</div>
              <div class="type-badge">⚡ ${escapeHTML(card.type)}</div>
            </div>
            <div class="card-info">
              <div class="card-name">${escapeHTML(card.name)}</div>
              <div class="card-series">${escapeHTML(card.series)}</div>
              <div class="card-stats-mini">
                <div class="stat-mini"><div class="stat-mini-label">POW</div><div class="stat-mini-value">${c.power || 0}</div></div>
                <div class="stat-mini"><div class="stat-mini-label">SPD</div><div class="stat-mini-value">${c.speed || 0}</div></div>
                <div class="stat-mini"><div class="stat-mini-label">MAG</div><div class="stat-mini-value">${c.magic || 0}</div></div>
                <div class="stat-mini"><div class="stat-mini-label">DEF</div><div class="stat-mini-value">${c.defense || 0}</div></div>
                <div class="stat-mini"><div class="stat-mini-label">INT</div><div class="stat-mini-value">${c.intelligence || 0}</div></div>
                <div class="stat-mini"><div class="stat-mini-label">TOT</div><div class="stat-mini-value">${totalPower}</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };
})();
