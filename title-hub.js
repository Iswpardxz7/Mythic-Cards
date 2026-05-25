/**
 * Inicio: 7 cartas más poderosas del usuario con arte completo y badge de poder.
 * Si el usuario no tiene cartas, muestra las top de ALL_CARDS como preview.
 */
(function () {
  'use strict';

  function getCardTotalPower(card) {
    var c = card;
    if (typeof applyAnimeStats === 'function') {
      c = applyAnimeStats(Object.assign({}, card));
    }
    return (c.power || 0) + (c.speed || 0) + (c.magic || 0) + (c.defense || 0) + (c.intelligence || 0);
  }

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

  function setupLegendaryPreview() {
    var preview = document.getElementById('preview-cards');
    if (!preview || typeof ALL_CARDS === 'undefined') return;
    preview.innerHTML = '';

    // Try to get user's active deck first
    var userCards = [];
    if (typeof getPlayerBattlePool === 'function') {
      userCards = getPlayerBattlePool();
    }
    if (userCards.length < 7 && typeof getCurrentUser === 'function' && typeof resolveCardRefs === 'function') {
      var u = getCurrentUser();
      if (u) {
        var refs = [];
        if (u.battleRosterRefs && u.battleRosterRefs.length >= 7) refs = u.battleRosterRefs;
        else if (u.profileCardRefs && u.profileCardRefs.length >= 7) refs = u.profileCardRefs;
        if (refs.length) userCards = resolveCardRefs(refs);
      }
    }

    var pool;
    if (userCards.length >= 7) {
      // Use the active deck cards exactly
      pool = userCards.slice(0, 7);
    } else {
      // Fallback: top from ALL_CARDS by anime tier
      pool = ALL_CARDS.slice().sort(function (a, b) {
        var tierA = (typeof ANIME_TIER !== 'undefined' && ANIME_TIER[a.name] != null) ? ANIME_TIER[a.name] : 50;
        var tierB = (typeof ANIME_TIER !== 'undefined' && ANIME_TIER[b.name] != null) ? ANIME_TIER[b.name] : 50;
        return tierB - tierA;
      });
    }

    var sample = pool.slice(0, 7);
    var delays = ['2s', '2.3s', '2.6s', '2.9s', '3.2s', '3.5s', '3.8s'];

    sample.forEach(function (card, i) {
      var c = card;
      if (typeof applyAnimeStats === 'function') {
        c = applyAnimeStats(Object.assign({}, card));
      }
      var totalPwr = (c.power || 0) + (c.speed || 0) + (c.magic || 0) + (c.defense || 0) + (c.intelligence || 0);
      var src = getCardImageSrc(c);
      var rank = typeof normalizeCardRarity === 'function'
        ? normalizeCardRarity(c.rarity)
        : ({ Common: 'F', Rare: 'C', Epic: 'A', Legendary: 'S', SSS: 'SSS' }[c.rarity] || c.rarity || 'F');
      var rarity = String(rank).toLowerCase();

      var div = document.createElement('div');
      div.className = 'preview-card preview-card-legendary rarity-' + rarity;
      div.style.setProperty('--delay', delays[i]);

      // Build rich card preview with image, power badge, info btn
      div.innerHTML =
        '<div class="preview-card-inner">' +
          '<img class="preview-card-img" src="' + src + '" alt="' + (c.name || '') + '">' +
          '<div class="preview-card-overlay">' +
            '<span class="preview-card-name">' + (c.name || '') + '</span>' +
          '</div>' +
          '<div class="preview-power-badge">\u26a1' + totalPwr + '</div>' +
          (typeof buildCardArtHTML === 'function'
            ? '<button type="button" class="card-info-btn preview-info-btn" data-card-name="' + (c.name || '').replace(/"/g, '&quot;') + '" data-card-series="' + (c.series||c.anime||'').replace(/"/g, '&quot;') + '" data-card-rarity="' + (c.rarity||'').replace(/"/g, '&quot;') + '" data-card-level="' + (c.level||1) + '" data-card-index="' + (c.index !== undefined ? c.index : '') + '" aria-label="Info">\u2139</button>'
            : '') +
        '</div>';

      div.title = c.name + ' · ' + (c.rarity || '') + ' · \u26a1' + totalPwr;
      preview.appendChild(div);
    });

    // Attach info button listeners
    if (typeof attachCardInfoListeners === 'function') {
      attachCardInfoListeners(preview);
    }

    var label = document.getElementById('preview-legend-label');
    if (!label) {
      label = document.createElement('p');
      label.id = 'preview-legend-label';
      label.className = 'preview-legend-label';
      preview.parentNode.insertBefore(label, preview.nextSibling);
    }
    label.textContent = userCards.length >= 7
      ? '\u2726 TU MAZO \u2726'
      : '\u2726 CARTAS LEGENDARIAS \u2726';
  }

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(setupLegendaryPreview, 400);
  });

  var origShowHub = window.showHubTab;
  if (origShowHub) {
    window.showHubTab = function (tab) {
      origShowHub(tab);
      if (tab === 'title') setTimeout(setupLegendaryPreview, 100);
    };
  }
})();
