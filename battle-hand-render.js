/**
 * Override renderHand to show card art with power badges and info buttons
 */
(function () {
  'use strict';

  // Función global para obtener imagen de carta
  window.getCardImageSrc = window.getCardImageSrc || function(card) {
    if (!card || !card.image) return '';
    var image = String(card.image || '');
    if (
      image.indexOf('data:') === 0 ||
      image.indexOf('http://') === 0 ||
      image.indexOf('https://') === 0 ||
      image.match(/\.(png|jpe?g|gif|webp)(\?.*)?$/i)
    ) {
      return encodeURI(image);
    }
    return 'data:image/png;base64,' + image;
  };

  function getCardImageSrc(card) {
    if (!card || !card.image) return '';
    var image = String(card.image || '');
    if (
      image.indexOf('data:') === 0 ||
      image.indexOf('http://') === 0 ||
      image.indexOf('https://') === 0 ||
      image.match(/\.(png|jpe?g|gif|webp)(\?.*)?$/i)
    ) {
      return encodeURI(image);
    }
    return 'data:image/png;base64,' + image;
  }

  window.renderHand = function renderHand() {
    var hand = document.getElementById('player-hand');
    if (!hand) return;
    hand.innerHTML = '';

    playerHand.forEach(function (card, i) {
      var div = document.createElement('div');
      div.className = 'hand-card' + (selectedCard === card ? ' selected' : '');
      div.dataset.index = i;

      var src = getCardImageSrc(card);
      var c = typeof applyAnimeStats === 'function' ? applyAnimeStats(card) : card;
      var totalPower = (c.power || 0) + (c.speed || 0) + (c.magic || 0) + (c.defense || 0) + (c.intelligence || 0);
      var rank = typeof normalizeCardRarity === 'function'
        ? normalizeCardRarity(card.rarity)
        : ({ Common: 'F', Rare: 'C', Epic: 'A', Legendary: 'S', SSS: 'SSS' }[card.rarity] || card.rarity || 'F');
      var rarity = String(rank).toLowerCase();
      var safeName = (card.name || '').replace(/"/g, '&quot;');
      var safeSeries = (card.series || card.anime || '').replace(/"/g, '&quot;');
      var safeRarity = String(rank).replace(/"/g, '&quot;');
      var safeLevel = card.level || 1;
      var safeIndex = card.index !== undefined ? card.index : '';

      div.innerHTML =
        '<div class="card-art-frame rarity-' + rarity + '">' +
          '<img class="card-art" src="' + src + '" alt="' + safeName + '" loading="lazy">' +
          '<div class="card-power-badge">' + totalPower + '</div>' +
          '<button type="button" class="card-info-btn" data-card-name="' + safeName + '" data-card-series="' + safeSeries + '" data-card-rarity="' + safeRarity + '" data-card-level="' + safeLevel + '" data-card-index="' + safeIndex + '" aria-label="Info">\u2139</button>' +
        '</div>' +
        '<div class="hand-card-name">' + (card.name || '') + '</div>';

      if (typeof gamePhase !== 'undefined' && gamePhase === 'select') {
        div.onclick = function () { selectCard(card, div); };
      }
      hand.appendChild(div);
    });

    if (typeof attachCardInfoListeners === 'function') {
      attachCardInfoListeners(hand);
    }
  };
})();
