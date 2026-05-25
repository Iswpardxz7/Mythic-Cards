/**
 * Navegación global fija — sesiones arriba, correo y diamantes alineados
 */
(function () {
  'use strict';

  const HUB_TABS = [
    { id: 'title', label: '🏠 Inicio' },
    { id: 'modes', label: '⚔ Modos' },
    { id: 'inventory', label: '🎒 Inventario' },
    { id: 'shop', label: '🛒 Tienda' },
    { id: 'missions', label: '📜 Misiones' },
    { id: 'wheel', label: '🎡 Ruleta' },
    { id: 'ranking', label: '🏆 Ranking' },
    { id: 'friends', label: '👥 Amigos' },
    { id: 'account', label: '👤 Cuenta' }
  ];

  const MODE_SCREENS = ['campaign', 'pve', 'pvpai', 'ranked', 'events', 'draft', 'coop', 'puzzle'];

  function buildGlobalHub() {
    if (document.getElementById('global-hub-shell')) return;

    const shell = document.createElement('header');
    shell.id = 'global-hub-shell';
    shell.className = 'global-hub-shell hidden';
    shell.innerHTML =
      '<div class="global-hub-inner">' +
      '<nav class="hub-nav-global" id="hub-nav-global" aria-label="Navegación principal"></nav>' +
      '<div class="global-hub-tools">' +
      '<button type="button" class="hub-icon-btn hub-mail-btn" id="btn-messages" title="Mensajes" onclick="openMessagesPanel()">' +
      '<span class="mail-icon-wrap" aria-hidden="true"><span class="mail-envelope"></span><span class="msg-badge" id="msg-badge">1</span></span>' +
      '</button>' +
      '</div>' +
      '<div class="global-hub-diamonds hud-diamonds" id="hud-diamonds-display">💎 0</div>' +
      '</div>';

    const nav = shell.querySelector('#hub-nav-global');
    HUB_TABS.forEach(function (tab) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hub-nav-btn hub-nav-global-btn';
      btn.setAttribute('data-tab', tab.id);
      btn.textContent = tab.label;
      btn.onclick = function () {
        if (typeof showHubTab === 'function') showHubTab(tab.id);
      };
      nav.appendChild(btn);
    });

    document.body.insertBefore(shell, document.body.firstChild);
    document.body.classList.add('has-global-hub');
  }

  window.setGlobalHubVisible = function (visible) {
    buildGlobalHub();
    const shell = document.getElementById('global-hub-shell');
    if (!shell) return;
    shell.classList.toggle('hidden', !visible);
    document.body.classList.toggle('hub-active', !!visible);
  };

  window.setHubActiveTab = function (tabId) {
    document.querySelectorAll('.hub-nav-global-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });
  };

  function patchNavigation() {
    const origHub = window.showHubTab;
    window.showHubTab = function (tab) {
      setGlobalHubVisible(tab !== 'auth');
      setHubActiveTab(tab);
      if (origHub) origHub(tab);
    };

    const origMode = window.showGameMode;
    window.showGameMode = function (mode) {
      setGlobalHubVisible(true);
      setHubActiveTab('modes');
      if (origMode) origMode(mode);
      const screen = document.getElementById('screen-' + mode);
      if (screen) {
        screen.style.display = 'flex';
        screen.style.flexDirection = 'column';
        screen.style.alignItems = 'stretch';
        screen.style.justifyContent = 'flex-start';
      }
    };

    const origBack = window.goBackToModes;
    window.goBackToModes = function () {
      if (origBack) origBack();
      else if (typeof showHubTab === 'function') showHubTab('modes');
    };

    window.showScreen = function (id) {
      document.querySelectorAll('.screen').forEach(function (s) {
        s.classList.remove('active');
        s.style.display = 'none';
      });
      const el = document.getElementById('screen-' + id);
      if (el) {
        el.classList.add('active');
        el.style.display = id === 'battle' ? 'flex' : (id === 'title' ? 'flex' : 'flex');
        el.style.flexDirection = 'column';
        el.style.alignItems = id === 'battle' ? 'stretch' : (id === 'title' ? 'center' : 'stretch');
        el.style.justifyContent = 'flex-start';
        el.style.width = '100%';
      }
      setGlobalHubVisible(id !== 'battle' && id !== 'auth');
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildGlobalHub();
    patchNavigation();

    const auth = document.getElementById('screen-auth');
    if (auth && auth.classList.contains('active')) {
      setGlobalHubVisible(false);
    } else if (typeof getCurrentUser === 'function' && getCurrentUser()) {
      setGlobalHubVisible(true);
      const active = document.querySelector('.screen.active');
      const id = active && active.id ? active.id.replace('screen-', '') : 'title';
      if (MODE_SCREENS.indexOf(id) >= 0) setHubActiveTab('modes');
      else setHubActiveTab(id);
    }
  });
})();
