/**
 * MythicCards — Modos de Juego COMPLETO v3
 * Fixes: PvP→IA, campaña rewards, PvE habilidades, ranked clasificatoria,
 *        coop 2p vs 2IA, puzzle = quiz anime, draft reward fix, images fit
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

  const ALL_SCREENS = ['title','account','modes','campaign','pvp','pvpai','ranked','events','draft','coop','puzzle','shop','missions','wheel','ranking','inventory','battle'];

  function getCampaignPreviewCards(rank, count = 3) {
    if (typeof ALL_CARDS === 'undefined') return [];
    const cards = ALL_CARDS.filter(c => String(c.rarity || '').toUpperCase() === String(rank || '').toUpperCase());
    return cards.slice(0, count);
  }

  function getCardsByRarities(rarities, count = 3) {
    if (typeof ALL_CARDS === 'undefined') return [];
    return ALL_CARDS.filter(c => rarities.includes(String(c.rarity || '').toUpperCase())).slice(0, count);
  }

  function enterBattle(logFn) {
    if (typeof hasBattleRoster === 'function' && !hasBattleRoster()) {
      alert('Reclama tu pack de bienvenida (7 cartas) antes de jugar.');
      return;
    }
    let pool = [];
    if (typeof getActiveDeckCards === 'function') pool = getActiveDeckCards();
    if (pool.length < 7 && typeof getPlayerBattlePool === 'function') pool = getPlayerBattlePool();
    if (pool.length < 7) {
      alert('Ve a Inventario → Mazos, arma 7 cartas y pulsa «Seleccionar mazo» en ese mazo.');
      return;
    }
    window._battleDeckOverride = pool;
    window._draftAIPool = null;
    if (typeof startGame === 'function') startGame();
    if (logFn) setTimeout(logFn, 500);
  }

  window.showGameMode = function(mode) {
    ALL_SCREENS.forEach(id => {
      const s = document.getElementById('screen-' + id);
      if (s) {
        s.classList.remove('active');
        s.style.display = 'none';
      }
    });
    const t = document.getElementById('screen-' + mode);
    if (t) {
      t.classList.add('active');
      t.style.display = 'flex';
    }
    const inits = { campaign:initCampaign, pvp:initPvP, pvpai:window.initPvpAI, ranked:initRanked, events:initEvents, draft:initDraft, coop:initCoop, puzzle:initPuzzle };
    if (inits[mode]) inits[mode]();
  };

  const _origShowHubTab = window.showHubTab;
  window.showHubTab = function(tab) {
    ALL_SCREENS.forEach(id => { 
      const s = document.getElementById('screen-' + id); 
      if (s) {
        s.classList.remove('active');
        s.style.display = 'none';
      }
    });
    const t = document.getElementById('screen-' + tab);
    if (t) {
      t.classList.add('active');
      t.style.display = 'flex';
    }
    document.querySelectorAll('.hub-nav-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === tab));
    if (tab === 'modes') initModesGrid();
    if (tab === 'shop' && typeof renderShop === 'function') renderShop();
    if (tab === 'missions' && typeof renderMissions === 'function') renderMissions();
    if (tab === 'wheel' && typeof initWheel === 'function') initWheel();
    if (tab === 'ranking' && typeof renderRanking === 'function') renderRanking();
    if (tab === 'friends' && typeof renderFriendsTabPanel === 'function') renderFriendsTabPanel();
    if (tab === 'account' && typeof renderAccountSettings === 'function') renderAccountSettings();
    if (tab === 'inventory' && typeof renderInventory === 'function') renderInventory();
    if (tab === 'title' && typeof updateHUD === 'function') updateHUD();
  };

  /* ─── STORAGE ─── */
  const MODES_KEY = 'mythic_modes_v2';
  function loadModesData() { try { return JSON.parse(localStorage.getItem(MODES_KEY)) || {}; } catch { return {}; } }
  function saveModesData(d) { try { localStorage.setItem(MODES_KEY, JSON.stringify(d)); } catch {} }

  /* ─── DIAMONDS helpers ─── */
  function getSave() { try { return JSON.parse(localStorage.getItem('mythic_cards_save_v3') || '{}'); } catch { return {}; } }
  function saveSave(s) { try { localStorage.setItem('mythic_cards_save_v3', JSON.stringify(s)); } catch {} }
  function getDiamonds() {
    if (typeof window.getPlayerDiamonds === 'function') return window.getPlayerDiamonds();
    return parseInt(getSave().diamonds || '0', 10);
  }
  function chargeDiamonds(n) {
    if (typeof window.chargePlayerDiamonds === 'function') return window.chargePlayerDiamonds(n);
    const s = getSave(); s.diamonds = Math.max(0, (s.diamonds || 0) - n); saveSave(s);
    if (typeof updateHUD === 'function') updateHUD();
  }
  function awardDiamonds(n) {
    if (typeof window.addDiamonds === 'function') { window.addDiamonds(n); return; }
    const s = getSave(); s.diamonds = (s.diamonds || 0) + n; saveSave(s);
    if (typeof updateHUD === 'function') updateHUD();
  }

  /* ══════════════════════════════════════════
     CAMPAÑA
  ══════════════════════════════════════════ */
  const CAMPAIGN_CHAPTERS = [
    { id:1, title:'Capítulo 1 · Rango F', rank:'F', unlocked:true, story:'La IA usa cartas de rango F. Completa los 5 niveles para avanzar.',
      missions:[
        { id:'1-1', name:'Nivel 1', enemy:'Soldado F1', difficulty:1, reward:50, done:false },
        { id:'1-2', name:'Nivel 2', enemy:'Soldado F2', difficulty:2, reward:50, done:false },
        { id:'1-3', name:'Nivel 3', enemy:'Guardia F', difficulty:3, reward:50, done:false },
        { id:'1-4', name:'Nivel 4', enemy:'Cazador F', difficulty:4, reward:50, done:false },
        { id:'1-5', name:'Nivel 5', enemy:'Campeón F', difficulty:5, reward:50, done:false }
      ]},
    { id:2, title:'Capítulo 2 · Rango E', rank:'E', unlocked:false, story:'La IA usa cartas de rango E. Los enemigos son más fuertes y valen 100 💎 cada uno.',
      missions:[
        { id:'2-1', name:'Nivel 1', enemy:'Guerrero E1', difficulty:1, reward:100, done:false },
        { id:'2-2', name:'Nivel 2', enemy:'Guerrero E2', difficulty:2, reward:100, done:false },
        { id:'2-3', name:'Nivel 3', enemy:'Táctico E', difficulty:3, reward:100, done:false },
        { id:'2-4', name:'Nivel 4', enemy:'Asaltante E', difficulty:4, reward:100, done:false },
        { id:'2-5', name:'Nivel 5', enemy:'Jefe E', difficulty:5, reward:100, done:false }
      ]},
    { id:3, title:'Capítulo 3 · Rango D', rank:'D', unlocked:false, story:'La IA usa cartas de rango D. Continúa el ascenso en dificultad y recompensa.',
      missions:[
        { id:'3-1', name:'Nivel 1', enemy:'Ranger D1', difficulty:1, reward:150, done:false },
        { id:'3-2', name:'Nivel 2', enemy:'Ranger D2', difficulty:2, reward:150, done:false },
        { id:'3-3', name:'Nivel 3', enemy:'Esbirro D', difficulty:3, reward:150, done:false },
        { id:'3-4', name:'Nivel 4', enemy:'Escudero D', difficulty:4, reward:150, done:false },
        { id:'3-5', name:'Nivel 5', enemy:'Campeón D', difficulty:5, reward:150, done:false }
      ]},
    { id:4, title:'Capítulo 4 · Rango C', rank:'C', unlocked:false, story:'La IA usa cartas de rango C. Las recompensas suben a 200 diamantes por victoria.',
      missions:[
        { id:'4-1', name:'Nivel 1', enemy:'Luchador C1', difficulty:1, reward:200, done:false },
        { id:'4-2', name:'Nivel 2', enemy:'Luchador C2', difficulty:2, reward:200, done:false },
        { id:'4-3', name:'Nivel 3', enemy:'Aspirante C', difficulty:3, reward:200, done:false },
        { id:'4-4', name:'Nivel 4', enemy:'Táctico C', difficulty:4, reward:200, done:false },
        { id:'4-5', name:'Nivel 5', enemy:'Guardián C', difficulty:5, reward:200, done:false }
      ]},
    { id:5, title:'Capítulo 5 · Rango B', rank:'B', unlocked:false, story:'La IA usa cartas de rango B. Los niveles son más desafiantes y valen 250 diamantes cada uno.',
      missions:[
        { id:'5-1', name:'Nivel 1', enemy:'Veterano B1', difficulty:1, reward:250, done:false },
        { id:'5-2', name:'Nivel 2', enemy:'Veterano B2', difficulty:2, reward:250, done:false },
        { id:'5-3', name:'Nivel 3', enemy:'Gladiador B', difficulty:3, reward:250, done:false },
        { id:'5-4', name:'Nivel 4', enemy:'Capitán B', difficulty:4, reward:250, done:false },
        { id:'5-5', name:'Nivel 5', enemy:'Maestro B', difficulty:5, reward:250, done:false }
      ]},
    { id:6, title:'Capítulo 6 · Rango A', rank:'A', unlocked:false, story:'La IA usa cartas de rango A. Solo los más fuertes podrán obtener 300 diamantes por nivel.',
      missions:[
        { id:'6-1', name:'Nivel 1', enemy:'Asalto A1', difficulty:1, reward:300, done:false },
        { id:'6-2', name:'Nivel 2', enemy:'Asalto A2', difficulty:2, reward:300, done:false },
        { id:'6-3', name:'Nivel 3', enemy:'Elite A', difficulty:3, reward:300, done:false },
        { id:'6-4', name:'Nivel 4', enemy:'Comandante A', difficulty:4, reward:300, done:false },
        { id:'6-5', name:'Nivel 5', enemy:'General A', difficulty:5, reward:300, done:false }
      ]},
    { id:7, title:'Capítulo 7 · Rango S', rank:'S', unlocked:false, story:'La IA usa cartas de rango S. Aquí solo luchas contra los mejores y ganas 350 diamantes por victoria.',
      missions:[
        { id:'7-1', name:'Nivel 1', enemy:'Asesino S1', difficulty:1, reward:350, done:false },
        { id:'7-2', name:'Nivel 2', enemy:'Asesino S2', difficulty:2, reward:350, done:false },
        { id:'7-3', name:'Nivel 3', enemy:'Señor S', difficulty:3, reward:350, done:false },
        { id:'7-4', name:'Nivel 4', enemy:'Maestro S', difficulty:4, reward:350, done:false },
        { id:'7-5', name:'Nivel 5', enemy:'Campeón S', difficulty:5, reward:350, done:false }
      ]},
    { id:8, title:'Capítulo 8 · Rango SS', rank:'SS', unlocked:false, story:'La IA usa cartas de rango SS. Las recompensas suben a 400 diamantes y la dificultad es extrema.',
      missions:[
        { id:'8-1', name:'Nivel 1', enemy:'Elite SS1', difficulty:1, reward:400, done:false },
        { id:'8-2', name:'Nivel 2', enemy:'Elite SS2', difficulty:2, reward:400, done:false },
        { id:'8-3', name:'Nivel 3', enemy:'Titan SS', difficulty:3, reward:400, done:false },
        { id:'8-4', name:'Nivel 4', enemy:'Sombra SS', difficulty:4, reward:400, done:false },
        { id:'8-5', name:'Nivel 5', enemy:'Guardian SS', difficulty:5, reward:400, done:false }
      ]},
    { id:9, title:'Capítulo 9 · Rango SSS', rank:'SSS', unlocked:false, story:'La IA usa cartas de rango SSS. Este es el desafío final con 450 diamantes por nivel.',
      missions:[
        { id:'9-1', name:'Nivel 1', enemy:'Nombre SSS1', difficulty:1, reward:450, done:false },
        { id:'9-2', name:'Nivel 2', enemy:'Nombre SSS2', difficulty:2, reward:450, done:false },
        { id:'9-3', name:'Nivel 3', enemy:'Avatar SSS', difficulty:3, reward:450, done:false },
        { id:'9-4', name:'Nivel 4', enemy:'Soberano SSS', difficulty:4, reward:450, done:false },
        { id:'9-5', name:'Nivel 5', enemy:'Leyenda SSS', difficulty:5, reward:450, done:false }
      ]}
  ];

  function initCampaign() {
    const container = document.getElementById('campaign-chapters');
    if (!container) return;
    const data = loadModesData();
    const progress = data.campaign || {};
    container.innerHTML = CAMPAIGN_CHAPTERS.map(ch => {
      const chDone = progress['ch_' + ch.id] || {};
      const allDone = ch.missions.every(m => chDone[m.id]);
      const locked = !ch.unlocked && !progress['ch_' + (ch.id-1) + '_complete'];
      const previewCards = getCampaignPreviewCards(ch.rank, 3);
      const previewHTML = previewCards.length ? `<div class="chapter-card-previews" style="display:flex;gap:0.75rem;margin:0.9rem 0;flex-wrap:wrap">${previewCards.map((card,index) => `
            <div style="width:90px;flex:1 0 90px;border-radius:12px;overflow:hidden;background:transparent;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:0.85rem;min-height:130px;">
              <div style="font-size:0.75rem;line-height:1.2;color:#e5e7eb;text-align:center;">${index===0?`Rango ${ch.rank}`:`${index===1?`Completa todos los niveles`:`Recompensa hasta ${ch.missions[0]?.reward||0} 💎`}`}</div>
            </div>`).join('')}</div>` : '';
      return `<div class="campaign-chapter ${locked?'chapter-locked':''} ${allDone?'chapter-done':''}" data-chapter="${ch.id}">
        <div class="chapter-header" onclick="toggleChapter(${ch.id})">
          <span class="chapter-num">Capítulo ${ch.id}</span>
          <span class="chapter-title">${locked?'🔒 ':''}${ch.title}</span>
          ${allDone?'<span class="chapter-badge">✅</span>':''}
        </div>
        ${locked?'':`
        <div class="chapter-story">${ch.story}</div>
        ${previewHTML}
        <div class="chapter-missions">
          ${ch.missions.map(m => {
            const done = chDone[m.id];
            return `<div class="campaign-mission ${done?'mission-done':''} ${m.boss?'mission-boss':''}">
              <div class="mission-info">${m.boss?'👹 JEFE: ':'⚔ '}${m.name} <span class="mission-enemy">vs ${m.enemy}</span></div>
              <div class="mission-reward">+${m.reward} 💎</div>
              <button class="mission-play-btn ${done?'btn-done':'btn-primary'}"
                onclick="playCampaignMission('${ch.id}','${m.id}','${m.enemy}',${m.difficulty},${m.reward})">
                ${done?'✅ Completado':'▶ Jugar'}
              </button>
            </div>`;
          }).join('')}
        </div>`}
      </div>`;
    }).join('');
  }

  window.toggleChapter = function(id) {
    document.querySelectorAll(`[data-chapter="${id}"]`).forEach(m => m.classList.toggle('hidden'));
  };

  window.playCampaignMission = function(chapterId, missionId, enemyName, difficulty, reward) {
    if (!window.hasBattleRoster || !window.hasBattleRoster()) { alert('Reclama tu pack de bienvenida antes de jugar.'); return; }
    const chapter = CAMPAIGN_CHAPTERS.find(c => String(c.id)===String(chapterId));
    if (chapter && chapter.rank) {
      window._campaignAIPoolRarity = chapter.rank;
    } else {
      window._campaignAIPoolRarity = null;
    }

    const origWin = window.onBattleWin;
    window.onBattleWin = function() {
      const data = loadModesData();
      if (!data.campaign) data.campaign = {};
      if (!data.campaign['ch_'+chapterId]) data.campaign['ch_'+chapterId] = {};
      data.campaign['ch_'+chapterId][missionId] = true;
      if (chapter && chapter.missions.every(m => data.campaign['ch_'+chapterId][m.id])) {
        data.campaign['ch_'+chapterId+'_complete'] = true;
        const nextCh = CAMPAIGN_CHAPTERS.find(c => c.id === chapter.id+1);
        if (nextCh) nextCh.unlocked = true;
      }
      saveModesData(data);
      awardDiamonds(reward);
      if (typeof recordMissionProgress === 'function') recordMissionProgress('campaign', 1);
      setTimeout(() => alert(`🏆 ¡Misión completada! +${reward} 💎`), 800);
      window.onBattleWin = origWin;
      if (origWin) origWin();
    };
    enterBattle(() => {
      const log = document.getElementById('battle-log');
      if (log) log.textContent = `⚔ Campaña: vs ${enemyName} (Nivel ${difficulty}) — Gana: +${reward} 💎`;
    });
  };

  /* ══════════════════════════════════════════
     PvE — JEFES con habilidades reales
  ══════════════════════════════════════════ */
  const BOSSES = [
    { id:'makima',      name:'Makima',             series:'Chainsaw Man',         emoji:'👁️', title:'La Controladora',
      ability:'Control Total: Anula las 2 mejores cartas del oponente cada ronda.',
      abilityFn: function(pHand){ return pHand.sort((a,b)=>(b.power+b.speed+b.magic+b.defense+b.intelligence)-(a.power+a.speed+a.magic+a.defense+a.intelligence)).slice(2); },
      lore:'Nadie puede resistirse a su control.', rewards:{easy:80,normal:150,hard:280,extreme:500}, multipliers:{easy:0.6,normal:1.0,hard:1.4,extreme:1.9} },
    { id:'alfia',       name:'Alfia',              series:'Dungeon ni Deai',       emoji:'⚡', title:'La Primogénita',
      ability:'Malia Devastadora: Sus cartas ganan +30% de poder en rondas impares.',
      abilityFn: null,
      lore:'La más poderosa de Freya Familia.', rewards:{easy:100,normal:200,hard:350,extreme:650}, multipliers:{easy:0.7,normal:1.1,hard:1.5,extreme:2.0} },
    { id:'echidna',     name:'Echidna',            series:'Re Zero',               emoji:'📚', title:'La Bruja de la Codicia',
      ability:'Conocimiento Absoluto: Siempre elige la carta más efectiva contra ti.',
      abilityFn: null,
      lore:'La sabiduría de siglos la hace impredecible.', rewards:{easy:90,normal:170,hard:320,extreme:580}, multipliers:{easy:0.65,normal:1.05,hard:1.45,extreme:1.95} },
    { id:'milim',       name:'Milim Nava',         series:'Tensei Slime',          emoji:'🐉', title:'La Demon Lord Loca',
      ability:'Modo Berserk: Al perder 2 rondas seguidas, todos sus stats aumentan 50%.',
      abilityFn: null,
      lore:'¡No subestimes a la Demon Lord más antigua!', rewards:{easy:110,normal:220,hard:380,extreme:700}, multipliers:{easy:0.75,normal:1.15,hard:1.6,extreme:2.1} },
    { id:'netero_pitou',name:'Neferpitou',         series:'HxH',                   emoji:'🐱', title:'La Guardia Real',
      ability:'En Instinct: Sus cartas de velocidad siempre ganan en empates.',
      abilityFn: null,
      lore:'La guardia más leal del Rey.', rewards:{easy:95,normal:180,hard:340,extreme:620}, multipliers:{easy:0.65,normal:1.05,hard:1.5,extreme:2.0} },
    { id:'rem',         name:'Rem',                series:'Re Zero',               emoji:'💙', title:'El Demonio Azul',
      ability:'Modo Demonio: Si pierde la primera ronda, su defensa sube un 80%.',
      abilityFn: null,
      lore:'Por quienes ama, no hay límite.', rewards:{easy:85,normal:160,hard:300,extreme:560}, multipliers:{easy:0.6,normal:1.0,hard:1.4,extreme:1.85} },
  ];

  let currentDifficulty = 'easy';
  window.selectDifficulty = function(diff, btn) {
    currentDifficulty = diff;
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderBossGrid();
  };

  function initPvP() { 
    if (typeof renderPvPFriendsList === 'function') {
      renderPvPFriendsList();
    }
  }

  function initPvE() { renderBossGrid(); }

  function renderBossGrid() {
    const grid = document.getElementById('boss-grid');
    if (!grid) return;
    const data = loadModesData();
    const defeated = data.pve_defeated || {};
    grid.innerHTML = BOSSES.map(boss => {
      const key = boss.id + '_' + currentDifficulty;
      const isDefeated = defeated[key];
      const reward = boss.rewards[currentDifficulty];
      const multLabel = {easy:'×0.6',normal:'×1.0',hard:'×1.4',extreme:'×2.0'}[currentDifficulty];
      return `<div class="boss-card ${isDefeated?'boss-defeated':''}">
        <div class="boss-emoji">${boss.emoji}</div>
        <div class="boss-info">
          <div class="boss-name">${boss.name}</div>
          <div class="boss-title">${boss.title} · ${boss.series}</div>
          <div class="boss-ability">🔮 ${boss.ability}</div>
          <div class="boss-lore" style="font-size:0.8rem;color:#9ca3af;margin-top:0.3rem">${boss.lore}</div>
        </div>
        <div class="boss-footer">
          <div class="boss-reward">Recompensa: ${reward} 💎</div>
          <div class="boss-power">Poder IA: ${multLabel}</div>
          <button class="btn-primary boss-fight-btn" onclick="fightBoss('${boss.id}',${reward})">
            ${isDefeated?'🔄 Revancha':'⚔ Desafiar'}
          </button>
        </div>
      </div>`;
    }).join('');
  }

  window.fightBoss = function(bossId, reward) {
    if (!window.hasBattleRoster || !window.hasBattleRoster()) { alert('Reclama tu pack antes de jugar.'); return; }
    const boss = BOSSES.find(b => b.id === bossId);
    if (!boss) return;
    const origWin = window.onBattleWin;
    window.onBattleWin = function() {
      const data = loadModesData();
      if (!data.pve_defeated) data.pve_defeated = {};
      data.pve_defeated[bossId+'_'+currentDifficulty] = true;
      if (!data.pve_total) data.pve_total = 0;
      data.pve_total++;
      saveModesData(data);
      awardDiamonds(reward);
      if (typeof recordMissionProgress === 'function') recordMissionProgress('pveWins', 1);
      setTimeout(() => alert(`🏆 ¡Venciste a ${boss.name}! +${reward} 💎`), 800);
      window.onBattleWin = origWin;
      if (origWin) origWin();
    };
    enterBattle(() => {
      const log = document.getElementById('battle-log');
      if (log) log.innerHTML = `👹 <strong>JEFE: ${boss.name}</strong><br>🔮 ${boss.ability}`;
      showBossAbilityBanner(boss);
    });
  };

  function showBossAbilityBanner(boss) {
    const existing = document.getElementById('boss-ability-banner');
    if (existing) existing.remove();
    const banner = document.createElement('div');
    banner.id = 'boss-ability-banner';
    banner.style.cssText = 'position:fixed;top:70px;left:50%;transform:translateX(-50%);z-index:9999;background:rgba(88,28,135,0.95);border:1px solid #9333ea;border-radius:12px;padding:1rem 1.5rem;max-width:400px;text-align:center;font-family:Cinzel,serif;animation:slideUp 0.4s ease;';
    banner.innerHTML = `<div style="color:#c084fc;font-size:0.8rem;letter-spacing:0.1em">HABILIDAD ESPECIAL</div>
      <div style="color:#f0d080;font-size:1.1rem;margin:0.3rem 0">${boss.emoji} ${boss.name}</div>
      <div style="color:#e8e0cc;font-size:0.9rem">🔮 ${boss.ability}</div>`;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 4000);
  }

  /* ══════════════════════════════════════════
     PvP vs IA — 3 dificultades
  ══════════════════════════════════════════ */
  const AI_MODES = [
    { id:'easy',   label:'🟢 Fácil',      desc:'IA usa cartas de rango F, E, D y C',    reward:50,  mult:1.0 },
    { id:'medium', label:'🟡 Intermedio', desc:'IA usa cartas de rango B y A',         reward:100, mult:1.0 },
    { id:'hard',   label:'🔴 Difícil',    desc:'IA usa cartas de rango S, SS y SSS',   reward:500, mult:1.0 },
  ];

  window.initPvpAI = function() {
    const el = document.getElementById('pvpai-content');
    if (!el) return;
    const aiModeCards = {
      easy: getCardsByRarities(['F','E','D','C'], 3),
      medium: getCardsByRarities(['B','A'], 3),
      hard: getCardsByRarities(['S','SS','SSS'], 3)
    };
    el.innerHTML = `
      <div style="text-align:center;padding:1rem;">
        <div style="font-size:3rem">🤖</div>
        <h3 style="font-family:Cinzel,serif;color:#f0d080;margin:0.5rem 0">PvP vs IA</h3>
        <p style="color:#9ca3af;margin-bottom:1.5rem">Elige la dificultad. Gana diamantes según el reto.</p>
        <div style="display:flex;flex-direction:column;gap:1rem;max-width:420px;margin:0 auto">
          ${AI_MODES.map(m=>`
            <div class="pvpai-card" onclick="startPvpAI('${m.id}')" style="background:rgba(255,255,255,0.04);border:1px solid rgba(201,168,76,0.3);border-radius:14px;padding:1rem 1.5rem;cursor:pointer;transition:all 0.2s;">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">
                <div style="flex:1;min-width:180px">
                  <div style="font-family:Cinzel,serif;font-size:1rem;color:#e8e0cc">${m.label}</div>
                  <div style="font-size:0.8rem;color:#9ca3af;margin-top:0.2rem">${m.desc}</div>
                </div>
                <div style="font-family:Cinzel,serif;color:#ffd700;font-size:1.1rem;font-weight:700">+${m.reward} 💎</div>
              </div>
              <div style="display:flex;gap:0.55rem;margin-top:0.9rem;justify-content:center;flex-wrap:wrap;">
                ${[1,2,3].map((_, index) => `<div style="width:72px;height:92px;overflow:hidden;border-radius:12px;background:transparent;display:flex;align-items:center;justify-content:center;padding:0.5rem;font-size:0.65rem;color:#e5e7eb;text-align:center;">${index===0?m.desc:index===1?`Gana +${m.reward} 💎`:`Reto PvP vs IA`}</div>`).join('')}
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  };

  window.startPvpAI = function(diffId) {
    if (!window.hasBattleRoster || !window.hasBattleRoster()) { alert('Reclama tu pack antes de jugar.'); return; }
    
    let pool = [];
    if (typeof getActiveDeckCards === 'function') pool = getActiveDeckCards();
    if (pool.length < 7 && typeof getPlayerBattlePool === 'function') pool = getPlayerBattlePool();
    if (pool.length < 7) {
      alert('Ve a Inventario → Mazos, arma 7 cartas y pulsa «Seleccionar mazo» en ese mazo.');
      return;
    }

    const mode = AI_MODES.find(m => m.id === diffId);
    if (!mode) return;

    // Construir mazo de IA según dificultad
    const allowedRarities = {
      'easy': ['F', 'E', 'D', 'C'],
      'medium': ['B', 'A'],
      'hard': ['S', 'SS', 'SSS']
    }[diffId];

    const allCards = typeof ALL_CARDS !== 'undefined' ? ALL_CARDS : [];
    const getRank = typeof rankOf === 'function' ? rankOf : (c => c.rarity || 'C');
    
    let aiCandidates = allCards.filter(c => allowedRarities.includes(getRank(c)));
    if (aiCandidates.length < 7) aiCandidates = allCards; // Fallback si no hay suficientes
    
    // Mezclar aleatoriamente
    aiCandidates = aiCandidates.sort(() => Math.random() - 0.5);
    window._draftAIPool = aiCandidates.slice(0, 7);
    window._battleDeckOverride = pool;

    const origWin = window.onBattleWin;
    const origLoss = window.onBattleLoss;

    window.onBattleWin = function() {
      awardDiamonds(mode.reward);
      setTimeout(() => alert(`🏆 ¡Victoria! +${mode.reward} 💎`), 800);
      window.onBattleWin = origWin;
      window.onBattleLoss = origLoss;
      window._draftAIPool = null;
      if (origWin) origWin();
    };

    window.onBattleLoss = function() {
      window.onBattleWin = origWin;
      window.onBattleLoss = origLoss;
      window._draftAIPool = null;
      if (origLoss) origLoss();
    };

    if (typeof startGame === 'function') startGame();
    
    setTimeout(() => {
      const log = document.getElementById('battle-log');
      if (log) log.textContent = `🤖 PvP vs IA — Dificultad: ${mode.label} · Premio: +${mode.reward} 💎`;
    }, 500);
  };

  /* ══════════════════════════════════════════
     CLASIFICATORIA (ex-Ranked)
  ══════════════════════════════════════════ */
  const RANK_TIERS_FULL = [
    { name:'F',   min:0,     color:'#94a3b8', emoji:'F',   reward:50   },
    { name:'E',   min:500,   color:'#14b8a6', emoji:'E',   reward:120  },
    { name:'D',   min:1500,  color:'#22c55e', emoji:'D',   reward:220  },
    { name:'C',   min:3500,  color:'#3b82f6', emoji:'C',   reward:350  },
    { name:'B',   min:7000,  color:'#8b5cf6', emoji:'B',   reward:550  },
    { name:'A',   min:12000, color:'#d946ef', emoji:'A',   reward:850  },
    { name:'S',   min:20000, color:'#f59e0b', emoji:'S',   reward:1200 },
    { name:'SS',  min:30000, color:'#facc15', emoji:'SS',  reward:1800 },
    { name:'SSS', min:45000, color:'#fff5a0', emoji:'SSS', reward:3000 },
  ];

  function getPlayerRankTier() {
    const pts = getSave().rankingPoints || 0;
    return RANK_TIERS_FULL.reduce((best,t) => pts>=t.min ? t : best, RANK_TIERS_FULL[0]);
  }

  function initRanked() { renderRankedInfo(); renderSeasonRewards(); }

  function renderRankedInfo() {
    const el = document.getElementById('ranked-info');
    if (!el) return;
    const pts = getSave().rankingPoints || 0;
    const wins = getSave().stats?.wins || 0;
    const tier = RANK_TIERS_FULL.reduce((b,t)=>pts>=t.min?t:b, RANK_TIERS_FULL[0]);
    const nextTier = RANK_TIERS_FULL.find(t=>t.min>pts);
    const progress = nextTier ? Math.round((pts-tier.min)/(nextTier.min-tier.min)*100) : 100;
    const sampleCard = (typeof ALL_CARDS !== 'undefined' ? ALL_CARDS.find(c => String(c.rarity || '').toUpperCase() === String(tier.name || '').toUpperCase()) : null);
    const sampleCardHTML = sampleCard ? `
      <div class="ranked-sample-card" style="display:flex;gap:0.85rem;align-items:center;margin:1rem 0;padding:0.9rem;border-radius:14px;background:rgba(255,255,255,0.03)">
        <div style="width:100%;display:flex;align-items:center;justify-content:center;color:#e5e7eb;font-size:0.9rem;padding:1rem;text-align:center;">Juega partidas clasificatorias, sube de rango y obtén mejores recompensas según tu liga actual (${tier.name}).</div>
      </div>` : '';

    el.innerHTML = `
      <div class="ranked-tier-card" style="border-color:${tier.color}">
        <div class="tier-emoji">${tier.emoji}</div>
        <div class="tier-details">
          <div class="tier-name" style="color:${tier.color}">${tier.name}</div>
          <div class="tier-points">${pts} puntos</div>
          ${nextTier?`<div class="tier-progress-bar"><div class="tier-progress-fill" style="width:${progress}%;background:${tier.color}"></div></div>
          <div class="tier-next">Próximo: ${nextTier.emoji} ${nextTier.name} (faltan ${nextTier.min-pts} pts)</div>`:'<div class="tier-max">🏆 Rango Máximo</div>'}
        </div>
      </div>
      ${sampleCardHTML}
      <div class="ranked-stats">
        <div class="ranked-stat"><div class="stat-value">${wins}</div><div class="stat-label">Victorias</div></div>
        <div class="ranked-stat"><div class="stat-value">${pts}</div><div class="stat-label">Puntos ELO</div></div>
        <div class="ranked-stat"><div class="stat-value">${tier.name}</div><div class="stat-label">Tu Rango</div></div>
      </div>
      <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:12px;padding:1rem;margin-top:1rem;font-size:0.85rem;color:#9ca3af">
        <strong style="color:#f0d080">⚔ Emparejamiento Clasificatorio:</strong><br>
        Serás emparejado contra jugadores de rango <strong style="color:${tier.color}">${tier.name}</strong> o superior.<br>
        Victoria: <strong style="color:#4ade80">+25 pts</strong> · Derrota: <strong style="color:#f87171">−10 pts</strong>
      </div>`;
  }

  function renderSeasonRewards() {
    const el = document.getElementById('season-rewards');
    if (!el) return;
    el.innerHTML = '<h3 style="text-align:center;margin:1.5rem 0 1rem;color:#fbbf24">🎁 Recompensas de Temporada</h3>' +
      RANK_TIERS_FULL.map(t=>`<div class="season-reward-row" style="display:flex;justify-content:space-between;padding:0.6rem 0;border-bottom:1px solid rgba(255,255,255,0.06)">
        <span style="color:${t.color}">${t.emoji} ${t.name}</span>
        <span style="color:#9ca3af">${t.reward} 💎</span>
      </div>`).join('');
  }

  window.startRankedMatch = function() {
    if (!window.hasBattleRoster || !window.hasBattleRoster()) { alert('Reclama tu pack antes de jugar.'); return; }
    if (typeof recordMissionProgress === 'function') recordMissionProgress('rankedPlays', 1);
    const tier = getPlayerRankTier();
    
    // Set AI deck to match the player's rank tier
    const allCards = typeof ALL_CARDS !== 'undefined' ? ALL_CARDS : [];
    const getRank = typeof rankOf === 'function' ? rankOf : (c => typeof normalizeCardRarity === 'function' ? normalizeCardRarity(c.rarity) : (c.rarity || 'C'));
    let aiCandidates = allCards.filter(c => getRank(c) === tier.name);
    if (aiCandidates.length < 7) aiCandidates = allCards;
    aiCandidates = aiCandidates.sort(() => Math.random() - 0.5);
    window._draftAIPool = aiCandidates.slice(0, 7);

    const origWin = window.onBattleWin;
    const origLoss = window.onBattleLoss;
    window.onBattleWin = function() {
      const s=getSave(); s.rankingPoints=(s.rankingPoints||0)+25; saveSave(s);
      if (typeof getCurrentUser === 'function') {
        const u = getCurrentUser();
        if (u) {
          u.rankPoints = (u.rankPoints || 0) + 25;
          if (typeof getAllUsers === 'function' && typeof saveUsers === 'function') {
            const users = getAllUsers(); users[u.id] = u; saveUsers(users);
          }
          if (window.playerProfile) window.playerProfile.rankingPoints = u.rankPoints;
        }
      }
      awardDiamonds(25);
      alert(`🏆 ¡Victoria Clasificatoria! +25 puntos · Rango: ${tier.name}`);
      window.onBattleWin=origWin; if(origWin) origWin();
      window._draftAIPool = null;
    };
    window.onBattleLoss = function() {
      const s=getSave(); s.rankingPoints=Math.max(0,(s.rankingPoints||0)-10); saveSave(s);
      if (typeof getCurrentUser === 'function') {
        const u = getCurrentUser();
        if (u) {
          u.rankPoints = Math.max(0, (u.rankPoints || 0) - 10);
          if (typeof getAllUsers === 'function' && typeof saveUsers === 'function') {
            const users = getAllUsers(); users[u.id] = u; saveUsers(users);
          }
        }
      }
      alert(`💀 Derrota. −10 puntos clasificatorios.`);
      window.onBattleLoss=origLoss; if(origLoss) origLoss();
      window._draftAIPool = null;
    };
    enterBattle(() => {
      const log = document.getElementById('battle-log');
      if (log) log.textContent = `🏆 CLASIFICATORIA — Rango ${tier.name} · Rival de tu nivel`;
    });
  };

  /* ══════════════════════════════════════════
     EVENTOS TEMPORALES
  ══════════════════════════════════════════ */
  const CURRENT_EVENTS = [
    { id:'kimetsu_week', name:'🗡️ Semana Kimetsu', description:'Las cartas de Kimetsu no Yaiba tienen +25% de poder. ¡Solo cartas de este anime!', modifier:'BOOST_SERIES', series:'Kimetsu no Yaiba', boost:1.25, timeLeft:3, rewards:[50,100,200], milestones:[3,7,15], emoji:'🌸', color:'#e879f9' },
    { id:'legendary_hunt', name:'👑 Caza Legendaria', description:'La probabilidad de cartas Legendarias en la tienda es 3× mayor.', modifier:'BOOST_LEGENDARY', timeLeft:5, rewards:[30,80,150], milestones:[2,5,10], emoji:'✨', color:'#fbbf24' },
    { id:'chaos_mode', name:'🌀 Modo Caos', description:'Los stats de todas las cartas se asignan aleatoriamente al inicio de cada ronda.', modifier:'CHAOS_STATS', timeLeft:2, rewards:[60,120,300], milestones:[1,3,7], emoji:'🌀', color:'#34d399' },
  ];

  function getEventPreviewCards(ev, count = 3) {
    if (typeof ALL_CARDS === 'undefined') return [];
    let cards = [];
    if (ev.series) {
      cards = ALL_CARDS.filter(c => String(c.series || '').toLowerCase() === String(ev.series || '').toLowerCase());
    }
    if (!cards.length && ev.modifier === 'BOOST_LEGENDARY') {
      cards = ALL_CARDS.filter(c => ['S','SS','SSS','A'].includes(String(c.rarity || '').toUpperCase()));
    }
    if (!cards.length) {
      cards = ALL_CARDS.slice();
    }
    return cards.slice(0, count);
  }

  function initEvents() { renderEventTimer(); renderEventsList(); }

  function renderEventTimer() {
    const el = document.getElementById('event-timer');
    if (!el) return;
    const now = new Date(), next = new Date(now);
    next.setDate(next.getDate()+(7-now.getDay())); next.setHours(0,0,0,0);
    const diff = next-now, days=Math.floor(diff/86400000), hours=Math.floor((diff%86400000)/3600000);
    el.innerHTML = `<div class="event-reset">🔄 Rotación de eventos en: <strong>${days}d ${hours}h</strong></div>`;
  }

  function renderEventsList() {
    const el = document.getElementById('events-list');
    if (!el) return;
    const data = loadModesData(), eventProgress = data.events || {};
    el.innerHTML = CURRENT_EVENTS.map(ev => {
      const prog = eventProgress[ev.id] || {wins:0};
      const milestone = ev.milestones.findIndex(m=>prog.wins<m);
      const cur = milestone===-1 ? ev.milestones.length-1 : milestone;
      const target = ev.milestones[cur] || ev.milestones[ev.milestones.length-1];
      const pct = Math.min(100,Math.round(prog.wins/target*100));
      const previewCards = getEventPreviewCards(ev, 3);
      const previewHTML = previewCards.length ? `<div class="event-preview-row" style="display:flex;gap:0.6rem;margin:0.9rem 0;flex-wrap:wrap">${previewCards.map((card,index) => `
            <div style="width:72px;flex:1 0 72px;border-radius:10px;overflow:hidden;background:transparent;padding:0.6rem;display:flex;align-items:center;justify-content:center;text-align:center;color:#e5e7eb;font-size:0.7rem;min-height:116px;">
              ${index===0?`Evento: ${ev.name}`:index===1?`Bonificación: ${ev.modifier||'Normal'}`:`Duración: ${ev.timeLeft} días`}
            </div>`).join('')}</div>` : '';
      return `<div class="event-card" style="border-color:${ev.color}40">
        <div class="event-header">
          <span class="event-emoji">${ev.emoji}</span>
          <div><div class="event-name" style="color:${ev.color}">${ev.name}</div><div class="event-time">⏳ ${ev.timeLeft} días restantes</div></div>
        </div>
        <div class="event-description">${ev.description}</div>
        ${previewHTML}
        <div class="event-progress-wrap">
          <div class="event-progress-bar"><div class="event-progress-fill" style="width:${pct}%;background:${ev.color}"></div></div>
          <div class="event-progress-text">${prog.wins}/${target} victorias</div>
        </div>
        <div class="event-rewards">
          ${ev.milestones.map((m,i)=>`<div class="event-milestone ${prog.wins>=m?'milestone-done':''}">${prog.wins>=m?'✅':'🎁'} ${m} victorias → ${ev.rewards[i]} 💎</div>`).join('')}
        </div>
        <button class="btn-primary" onclick="playEvent('${ev.id}')">▶ Jugar Evento</button>
      </div>`;
    }).join('');
  }

  window.playEvent = function(eventId) {
    const ev = CURRENT_EVENTS.find(e=>e.id===eventId);
    if (!ev || !window.hasBattleRoster || !window.hasBattleRoster()) { alert('Reclama tu pack antes.'); return; }
    const origWin = window.onBattleWin;
    window.onBattleWin = function() {
      const data=loadModesData(); if(!data.events) data.events={};
      if(!data.events[eventId]) data.events[eventId]={wins:0};
      data.events[eventId].wins++;
      const wins=data.events[eventId].wins, mi=ev.milestones.findIndex(m=>wins===m);
      if(mi>=0){ awardDiamonds(ev.rewards[mi]); setTimeout(()=>alert(`🎁 ¡Hito! +${ev.rewards[mi]} 💎`),1200); }
      saveModesData(data); window.onBattleWin=origWin; if(origWin) origWin();
    };
    enterBattle(() => {
      const log = document.getElementById('battle-log');
      if (log) log.textContent = `🌟 EVENTO: ${ev.name}`;
    });
  };

  /* ══════════════════════════════════════════
     DRAFT / ARENA — fix: da 100💎 al ganar
  ══════════════════════════════════════════ */
  const DRAFT_COST=50, DRAFT_REWARD=100;
  let draftState=null;

  function initDraft() { renderDraftLobby(); }

  function renderDraftLobby() {
    const el=document.getElementById('draft-content'); if(!el) return;
    const data=loadModesData(), rec=data.draft||{wins:0,losses:0,runs:0}, diamonds=getDiamonds(), canPlay=diamonds>=DRAFT_COST;
    el.innerHTML=`<div class="draft-lobby">
      <div class="draft-hero"><div style="font-size:3rem;text-align:center">🎴</div>
        <h3 class="draft-hero-title">Modo Arena</h3>
        <p class="draft-hero-sub">Escoge <strong>7 cartas</strong> y enfrenta a la IA. Si ganas, recibes el doble.</p>
      </div>
      <div class="draft-stats-row">
        <div class="draft-stat-box"><span class="dsb-val">${rec.wins}</span><span class="dsb-lbl">✅ Victorias</span></div>
        <div class="draft-stat-box"><span class="dsb-val">${rec.losses}</span><span class="dsb-lbl">❌ Derrotas</span></div>
        <div class="dsb-ratio">${rec.runs>0?Math.round(rec.wins/rec.runs*100):0}% Win Rate</div>
      </div>
      <div class="draft-economy-card">
        <div class="draft-econ-row"><span>💸 Entrada</span><strong class="draft-cost-val">−${DRAFT_COST} 💎</strong></div>
        <div class="draft-econ-row draft-econ-win"><span>🏆 Si ganas</span><strong>+${DRAFT_REWARD} 💎</strong></div>
        <div class="draft-econ-row draft-econ-lose"><span>💀 Si pierdes</span><strong>pierdes los ${DRAFT_COST} 💎</strong></div>
      </div>
      <div class="draft-your-diamonds">Tu saldo: <strong style="color:${canPlay?'#67e8f9':'#f87171'}">${diamonds} 💎</strong></div>
      <button class="btn-primary draft-start-btn ${canPlay?'':'btn-disabled'}" onclick="startDraftRun()" ${canPlay?'':'disabled'}>
        ${canPlay?`🎴 Entrar al Arena (${DRAFT_COST} 💎)`:`Sin diamantes (necesitas ${DRAFT_COST} 💎)`}
      </button>
    </div>`;
  }

  window.startDraftRun = function() {
    if(getDiamonds()<DRAFT_COST){ alert(`Necesitas ${DRAFT_COST} 💎.`); return; }
    chargeDiamonds(DRAFT_COST);
    if (typeof recordMissionProgress === 'function') recordMissionProgress('draftPlays', 1);
    draftState={selectedNames:new Set(), confirmed:false};
    const data=loadModesData(); if(!data.draft) data.draft={wins:0,losses:0,runs:0}; data.draft.runs++; saveModesData(data);
    renderDraftSelection();
  };

  window.renderDraftSelection = function() {
    const el=document.getElementById('draft-content'); if(!el||!draftState) return;
    const allCards=typeof ALL_CARDS!=='undefined'?ALL_CARDS:[], selected=draftState.selectedNames, MAX=7;
    const bySeries={};
    allCards.forEach(c=>{ if(!bySeries[c.series]) bySeries[c.series]=[]; bySeries[c.series].push(c); });
    const rarityColor={Common:'#9ca3af',Rare:'#60a5fa',Epic:'#a78bfa',Legendary:'#fbbf24'};
    const seriesHTML=Object.entries(bySeries).map(([serie,cards])=>`
      <div class="draft-series-group"><div class="draft-series-title">${serie}</div>
        <div class="draft-cards-row">${cards.map(card=>{
          const isSel=selected.has(card.name), total=(card.power||0)+(card.speed||0)+(card.magic||0)+(card.defense||0)+(card.intelligence||0);
          const imgSrc = getCardImageSrc(card);
          return `<div class="draft-card-tile ${isSel?'draft-tile-selected':''}" onclick="toggleDraftCard('${card.name.replace(/'/g,"\\'")}',this)" data-name="${card.name.replace(/"/g,'&quot;')}">
            <div class="draft-tile-image" style="position:relative;width:100%;padding-bottom:140%;margin-bottom:0.3rem;border-radius:6px;overflow:hidden;background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#e5e7eb;font-size:0.75rem;text-align:center;padding:0.75rem;">${card.name}</div>
            <div class="draft-tile-rarity" style="background:${rarityColor[card.rarity]||'#9ca3af'}20;border-color:${rarityColor[card.rarity]||'#9ca3af'}60;color:${rarityColor[card.rarity]||'#9ca3af'};font-size:0.55rem;padding:2px 4px;border-radius:3px;border:1px solid;margin-bottom:0.2rem">${card.rarity}</div>
            <div class="draft-tile-name" style="font-size:0.65rem;margin-top:0.2rem">${card.name}</div>
            <div class="draft-tile-total">⚡ ${total}</div>
            ${isSel?'<div class="draft-tile-check">✓</div>':''}
          </div>`;
        }).join('')}</div>
      </div>`).join('');
    el.innerHTML=`<div class="draft-selection-wrap">
      <div class="draft-sel-header">
        <div class="draft-sel-counter" id="draft-counter">Seleccionadas: <strong id="draft-count">${selected.size}</strong> / ${MAX}</div>
        <button class="btn-primary draft-confirm-btn" id="draft-confirm-btn" onclick="confirmDraftDeck()" ${selected.size===MAX?'':'disabled'}>⚔ Batallar</button>
      </div>
      <p class="draft-sel-hint">Toca las cartas para seleccionar. Exactamente ${MAX} cartas.</p>
      <div class="draft-all-cards" id="draft-all-cards">${seriesHTML}</div>
    </div>`;
  }

  window.toggleDraftCard = function(name, tileEl) {
    if(!draftState) return;
    const MAX=7, sel=draftState.selectedNames;
    if(sel.has(name)){ sel.delete(name); tileEl.classList.remove('draft-tile-selected'); const chk=tileEl.querySelector('.draft-tile-check'); if(chk) chk.remove(); }
    else {
      if(sel.size>=MAX){ tileEl.classList.add('draft-shake'); setTimeout(()=>tileEl.classList.remove('draft-shake'),400); return; }
      sel.add(name); tileEl.classList.add('draft-tile-selected'); tileEl.insertAdjacentHTML('beforeend','<div class="draft-tile-check">✓</div>');
    }
    const countEl=document.getElementById('draft-count'), btnEl=document.getElementById('draft-confirm-btn');
    if(countEl) countEl.textContent=sel.size; if(btnEl) btnEl.disabled=sel.size!==MAX;
  };

  window.confirmDraftDeck = function() {
    if(!draftState||draftState.selectedNames.size!==7) return;
    const allCards=typeof ALL_CARDS!=='undefined'?ALL_CARDS:[];
    const playerDeck=[...draftState.selectedNames].map(n=>allCards.find(c=>c.name===n)).filter(Boolean);
    if(playerDeck.length!==7){ alert('Error al cargar cartas.'); return; }
    draftState.confirmed=true; draftState.playerDeck=playerDeck;
    const aiDeck=buildAIDeck(allCards); draftState.aiDeck=aiDeck;
    renderDraftMatchup(playerDeck,aiDeck);
  };

  function buildAIDeck(allCards) {
    const scored=allCards.map(c=>({card:c,total:(c.power||0)+(c.speed||0)+(c.magic||0)+(c.defense||0)+(c.intelligence||0)}));
    scored.sort((a,b)=>b.total-a.total);
    return [...scored.slice(0,14).map(s=>s.card)].sort(()=>Math.random()-0.5).slice(0,7);
  }

  function renderDraftMatchup(playerDeck,aiDeck) {
    const el=document.getElementById('draft-content'); if(!el) return;
    const tp=playerDeck.reduce((s,c)=>s+(c.power||0)+(c.speed||0)+(c.magic||0)+(c.defense||0)+(c.intelligence||0),0);
    const ta=aiDeck.reduce((s,c)=>s+(c.power||0)+(c.speed||0)+(c.magic||0)+(c.defense||0)+(c.intelligence||0),0);
    el.innerHTML=`<div class="draft-matchup">
      <div class="draft-matchup-title">⚔ ¡Enfrentamiento!</div>
      <div class="draft-matchup-grid">
        <div class="draft-matchup-side">
          <div class="draft-matchup-label">🧑 Tu mazo</div><div class="draft-matchup-power">${tp} pts</div>
          ${playerDeck.map(c=>{
            return `<div class="draft-matchup-card player-card" style="display:flex;align-items:center;gap:0.65rem;">
              <div style="width:56px;height:72px;overflow:hidden;border-radius:12px;background:transparent;display:flex;align-items:center;justify-content:center;color:#e5e7eb;font-size:0.72rem;padding:0.5rem;text-align:center;">${c.name}</div>
              <div style="flex:1;min-width:0"><div>${c.name}</div><div class="dmc-rarity" style="font-size:0.72rem;color:#9ca3af">${c.rarity}</div></div>
            </div>`;
          }).join('')}
        </div>
        <div class="draft-vs">VS</div>
        <div class="draft-matchup-side">
          <div class="draft-matchup-label">🤖 Mazo IA</div><div class="draft-matchup-power">${ta} pts</div>
          ${aiDeck.map(c=>{
            return `<div class="draft-matchup-card ai-card" style="display:flex;align-items:center;gap:0.65rem;">
              <div style="width:56px;height:72px;overflow:hidden;border-radius:12px;background:transparent;display:flex;align-items:center;justify-content:center;color:#e5e7eb;font-size:0.72rem;padding:0.5rem;text-align:center;">${c.name}</div>
              <div style="flex:1;min-width:0"><div>${c.name}</div><div class="dmc-rarity" style="font-size:0.72rem;color:#9ca3af">${c.rarity}</div></div>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="draft-matchup-note">${tp>=ta?'✅ Tu mazo tiene ventaja.':'⚠️ La IA tiene ventaja en stats.'}</div>
      <button class="btn-primary" style="width:100%;margin-top:1rem" onclick="launchDraftBattle()">⚔ ¡Batallar!</button>
      <button class="btn-secondary" style="width:100%;margin-top:0.5rem" onclick="renderDraftSelection()">← Cambiar selección</button>
    </div>`;
  }

  window.launchDraftBattle = function() {
    if (!draftState || !draftState.playerDeck || !draftState.aiDeck) return;
    const playerCards = draftState.playerDeck.slice();
    const aiCards = draftState.aiDeck.slice();
    window._battleDeckOverride = playerCards;
    window._draftAIPool = aiCards;

    const _origWin = window.onBattleWin;
    const _origLoss = window.onBattleLoss;
    const _origHas = window.hasBattleRoster;

    window.hasBattleRoster = function () { return true; };
    window.onBattleWin = function () {
      awardDiamonds(DRAFT_REWARD);
      const data = loadModesData();
      if (!data.draft) data.draft = { wins: 0, losses: 0, runs: 0 };
      data.draft.wins++;
      saveModesData(data);
      setTimeout(() => alert(`🏆 ¡Victoria Arena! +${DRAFT_REWARD} 💎 ganados`), 800);
      window.onBattleWin = _origWin;
      window.onBattleLoss = _origLoss;
      window.hasBattleRoster = _origHas;
      window._battleDeckOverride = null;
      window._draftAIPool = null;
      draftState = null;
      if (_origWin) _origWin();
    };
    window.onBattleLoss = function () {
      const data = loadModesData();
      if (!data.draft) data.draft = { wins: 0, losses: 0, runs: 0 };
      data.draft.losses++;
      saveModesData(data);
      setTimeout(() => alert(`💀 Derrota. Perdiste los ${DRAFT_COST} 💎 de entrada.`), 800);
      window.onBattleWin = _origWin;
      window.onBattleLoss = _origLoss;
      window.hasBattleRoster = _origHas;
      window._battleDeckOverride = null;
      window._draftAIPool = null;
      draftState = null;
      if (_origLoss) _origLoss();
    };

    if (typeof startGame === 'function') {
      startGame();
      setTimeout(() => {
        const log = document.getElementById('battle-log');
        if (log) log.textContent = `🎴 ARENA: +${DRAFT_REWARD}💎 si ganas!`;
      }, 600);
    }
  };

  /* ══════════════════════════════════════════
     COOPERATIVO — 2 jugadores vs 2 IAs
  ══════════════════════════════════════════ */
  function initCoop() {
    const el = document.getElementById('coop-content');
    if (!el) return;
    el.innerHTML =
      '<div class="coop-coming-soon" style="text-align:center;padding:2.5rem 1rem">' +
      '<div style="font-size:4rem">🤝</div>' +
      '<h3 style="font-family:Cinzel,serif;color:#f0d080;margin:1rem 0">Modo Cooperativo</h3>' +
      '<p style="color:#9ca3af;max-width:420px;margin:0 auto 1.5rem;line-height:1.6">Llegará en la <strong style="color:#fbbf24">próxima versión</strong> como evento especial.</p>' +
      '<div style="display:inline-block;padding:0.6rem 1.2rem;border-radius:999px;background:rgba(251,191,36,0.15);border:1px solid rgba(251,191,36,0.4);color:#fbbf24;font-family:Cinzel,serif">🎉 Próximamente</div>' +
      '</div>';
  }

  window.startCoopLocal = function(reward) {
    if(!window.hasBattleRoster||!window.hasBattleRoster()){ alert('Reclama tu pack antes.'); return; }
    if (typeof recordMissionProgress === 'function') recordMissionProgress('coopPlays', 1);
    const origWin=window.onBattleWin;
    window.onBattleWin=function(){
      awardDiamonds(reward);
      alert(`🤝 ¡Victoria Cooperativa! Cada jugador recibe +${Math.round(reward/2)} 💎 (total ${reward} 💎)`);
      window.onBattleWin=origWin; if(origWin) origWin();
    };
    if (typeof startCardBattle === 'function') {
      alert('🤝 MODO COOP: Jugador 1 juega primero. Cuando termine, pasa el dispositivo al Jugador 2.');
      enterBattle(() => {
        const log = document.getElementById('battle-log');
        if (log) log.textContent = `🤝 COOPERATIVO vs 2 IAs avanzadas · Premio: ${reward} 💎`;
      });
    }
  };


  /* ══════════════════════════════════════════
     PUZZLE — QUIZ DE ANIME (360 preguntas)
     Costo: 50💎 · Gana si acierta las 10
     Falla 1 → pierde los 50💎
  ══════════════════════════════════════════ */
  const QUIZ_QUESTIONS = [{"anime": "High School DxD", "q": "1. ¿Quién es considerada la waifu más elegante?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "A"}, {"anime": "High School DxD", "q": "2. ¿Quién destaca por su personalidad amable?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "B"}, {"anime": "High School DxD", "q": "3. ¿Quién tiene el diseño más llamativo?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "C"}, {"anime": "High School DxD", "q": "4. ¿Quién posee el cabello más icónico?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "D"}, {"anime": "High School DxD", "q": "5. ¿Quién proyecta más carisma?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "A"}, {"anime": "High School DxD", "q": "6. ¿Quién tiene la mirada más distintiva?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "A"}, {"anime": "High School DxD", "q": "7. ¿Quién tiene el atuendo más recordado?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "B"}, {"anime": "High School DxD", "q": "8. ¿Quién parece más misteriosa?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "C"}, {"anime": "High School DxD", "q": "9. ¿Quién tiene más presencia?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "D"}, {"anime": "High School DxD", "q": "10. ¿Quién destaca por liderazgo?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "A"}, {"anime": "High School DxD", "q": "11. ¿Quién parece más tierna?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "A"}, {"anime": "High School DxD", "q": "12. ¿Quién tiene el estilo más refinado?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "B"}, {"anime": "High School DxD", "q": "13. ¿Quién sería la reina waifu?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "C"}, {"anime": "High School DxD", "q": "14. ¿Quién tiene la mejor primera impresión?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "D"}, {"anime": "High School DxD", "q": "15. ¿Quién tiene aura imponente?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "A"}, {"anime": "High School DxD", "q": "16. ¿Quién destaca por confianza?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "A"}, {"anime": "High School DxD", "q": "17. ¿Quién tiene diseño favorito del fandom?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "B"}, {"anime": "High School DxD", "q": "18. ¿Quién parece más tranquila?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "C"}, {"anime": "High School DxD", "q": "19. ¿Quién tiene mayor popularidad?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "D"}, {"anime": "High School DxD", "q": "20. ¿Quién tiene el look más memorable?", "opts": ["Rias", "Akeno", "Asia", "Koneko"], "ans": "A"}, {"anime": "Chainsaw Man", "q": "1. ¿Quién es considerada la waifu más elegante?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "A"}, {"anime": "Chainsaw Man", "q": "2. ¿Quién destaca por su personalidad amable?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "B"}, {"anime": "Chainsaw Man", "q": "3. ¿Quién tiene el diseño más llamativo?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "C"}, {"anime": "Chainsaw Man", "q": "4. ¿Quién posee el cabello más icónico?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "D"}, {"anime": "Chainsaw Man", "q": "5. ¿Quién proyecta más carisma?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "A"}, {"anime": "Chainsaw Man", "q": "6. ¿Quién tiene la mirada más distintiva?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "A"}, {"anime": "Chainsaw Man", "q": "7. ¿Quién tiene el atuendo más recordado?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "B"}, {"anime": "Chainsaw Man", "q": "8. ¿Quién parece más misteriosa?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "C"}, {"anime": "Chainsaw Man", "q": "9. ¿Quién tiene más presencia?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "D"}, {"anime": "Chainsaw Man", "q": "10. ¿Quién destaca por liderazgo?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "A"}, {"anime": "Chainsaw Man", "q": "11. ¿Quién parece más tierna?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "A"}, {"anime": "Chainsaw Man", "q": "12. ¿Quién tiene el estilo más refinado?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "B"}, {"anime": "Chainsaw Man", "q": "13. ¿Quién sería la reina waifu?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "C"}, {"anime": "Chainsaw Man", "q": "14. ¿Quién tiene la mejor primera impresión?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "D"}, {"anime": "Chainsaw Man", "q": "15. ¿Quién tiene aura imponente?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "A"}, {"anime": "Chainsaw Man", "q": "16. ¿Quién destaca por confianza?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "A"}, {"anime": "Chainsaw Man", "q": "17. ¿Quién tiene diseño favorito del fandom?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "B"}, {"anime": "Chainsaw Man", "q": "18. ¿Quién parece más tranquila?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "C"}, {"anime": "Chainsaw Man", "q": "19. ¿Quién tiene mayor popularidad?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "D"}, {"anime": "Chainsaw Man", "q": "20. ¿Quién tiene el look más memorable?", "opts": ["Makima", "Power", "Himeno", "Reze"], "ans": "A"}, {"anime": "My Hero Academia", "q": "1. ¿Quién es considerada la waifu más elegante?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "A"}, {"anime": "My Hero Academia", "q": "2. ¿Quién destaca por su personalidad amable?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "B"}, {"anime": "My Hero Academia", "q": "3. ¿Quién tiene el diseño más llamativo?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "C"}, {"anime": "My Hero Academia", "q": "4. ¿Quién posee el cabello más icónico?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "D"}, {"anime": "My Hero Academia", "q": "5. ¿Quién proyecta más carisma?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "A"}, {"anime": "My Hero Academia", "q": "6. ¿Quién tiene la mirada más distintiva?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "A"}, {"anime": "My Hero Academia", "q": "7. ¿Quién tiene el atuendo más recordado?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "B"}, {"anime": "My Hero Academia", "q": "8. ¿Quién parece más misteriosa?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "C"}, {"anime": "My Hero Academia", "q": "9. ¿Quién tiene más presencia?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "D"}, {"anime": "My Hero Academia", "q": "10. ¿Quién destaca por liderazgo?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "A"}, {"anime": "My Hero Academia", "q": "11. ¿Quién parece más tierna?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "A"}, {"anime": "My Hero Academia", "q": "12. ¿Quién tiene el estilo más refinado?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "B"}, {"anime": "My Hero Academia", "q": "13. ¿Quién sería la reina waifu?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "C"}, {"anime": "My Hero Academia", "q": "14. ¿Quién tiene la mejor primera impresión?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "D"}, {"anime": "My Hero Academia", "q": "15. ¿Quién tiene aura imponente?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "A"}, {"anime": "My Hero Academia", "q": "16. ¿Quién destaca por confianza?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "A"}, {"anime": "My Hero Academia", "q": "17. ¿Quién tiene diseño favorito del fandom?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "B"}, {"anime": "My Hero Academia", "q": "18. ¿Quién parece más tranquila?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "C"}, {"anime": "My Hero Academia", "q": "19. ¿Quién tiene mayor popularidad?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "D"}, {"anime": "My Hero Academia", "q": "20. ¿Quién tiene el look más memorable?", "opts": ["Ochaco", "Momo", "Tsuyu", "Nejire"], "ans": "A"}, {"anime": "Black Clover", "q": "1. ¿Quién es considerada la waifu más elegante?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "A"}, {"anime": "Black Clover", "q": "2. ¿Quién destaca por su personalidad amable?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "B"}, {"anime": "Black Clover", "q": "3. ¿Quién tiene el diseño más llamativo?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "C"}, {"anime": "Black Clover", "q": "4. ¿Quién posee el cabello más icónico?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "D"}, {"anime": "Black Clover", "q": "5. ¿Quién proyecta más carisma?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "A"}, {"anime": "Black Clover", "q": "6. ¿Quién tiene la mirada más distintiva?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "A"}, {"anime": "Black Clover", "q": "7. ¿Quién tiene el atuendo más recordado?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "B"}, {"anime": "Black Clover", "q": "8. ¿Quién parece más misteriosa?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "C"}, {"anime": "Black Clover", "q": "9. ¿Quién tiene más presencia?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "D"}, {"anime": "Black Clover", "q": "10. ¿Quién destaca por liderazgo?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "A"}, {"anime": "Black Clover", "q": "11. ¿Quién parece más tierna?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "A"}, {"anime": "Black Clover", "q": "12. ¿Quién tiene el estilo más refinado?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "B"}, {"anime": "Black Clover", "q": "13. ¿Quién sería la reina waifu?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "C"}, {"anime": "Black Clover", "q": "14. ¿Quién tiene la mejor primera impresión?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "D"}, {"anime": "Black Clover", "q": "15. ¿Quién tiene aura imponente?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "A"}, {"anime": "Black Clover", "q": "16. ¿Quién destaca por confianza?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "A"}, {"anime": "Black Clover", "q": "17. ¿Quién tiene diseño favorito del fandom?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "B"}, {"anime": "Black Clover", "q": "18. ¿Quién parece más tranquila?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "C"}, {"anime": "Black Clover", "q": "19. ¿Quién tiene mayor popularidad?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "D"}, {"anime": "Black Clover", "q": "20. ¿Quién tiene el look más memorable?", "opts": ["Noelle", "Mimosa", "Vanessa", "Mereoleona"], "ans": "A"}, {"anime": "Chained Soldier", "q": "1. ¿Quién es considerada la waifu más elegante?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "A"}, {"anime": "Chained Soldier", "q": "2. ¿Quién destaca por su personalidad amable?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "B"}, {"anime": "Chained Soldier", "q": "3. ¿Quién tiene el diseño más llamativo?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "C"}, {"anime": "Chained Soldier", "q": "4. ¿Quién posee el cabello más icónico?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "D"}, {"anime": "Chained Soldier", "q": "5. ¿Quién proyecta más carisma?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "A"}, {"anime": "Chained Soldier", "q": "6. ¿Quién tiene la mirada más distintiva?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "B"}, {"anime": "Chained Soldier", "q": "7. ¿Quién tiene el atuendo más recordado?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "C"}, {"anime": "Chained Soldier", "q": "8. ¿Quién parece más misteriosa?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "D"}, {"anime": "Chained Soldier", "q": "9. ¿Quién tiene más presencia?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "A"}, {"anime": "Chained Soldier", "q": "10. ¿Quién destaca por liderazgo?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "B"}, {"anime": "Chained Soldier", "q": "11. ¿Quién parece más tierna?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "C"}, {"anime": "Chained Soldier", "q": "12. ¿Quién tiene el estilo más refinado?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "D"}, {"anime": "Chained Soldier", "q": "13. ¿Quién sería la reina waifu?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "A"}, {"anime": "Chained Soldier", "q": "14. ¿Quién tiene la mejor primera impresión?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "B"}, {"anime": "Chained Soldier", "q": "15. ¿Quién tiene aura imponente?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "C"}, {"anime": "Chained Soldier", "q": "16. ¿Quién destaca por confianza?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "D"}, {"anime": "Chained Soldier", "q": "17. ¿Quién tiene diseño favorito del fandom?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "A"}, {"anime": "Chained Soldier", "q": "18. ¿Quién parece más tranquila?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "B"}, {"anime": "Chained Soldier", "q": "19. ¿Quién tiene mayor popularidad?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "C"}, {"anime": "Chained Soldier", "q": "20. ¿Quién tiene el look más memorable?", "opts": ["Kyouka", "Tenka", "Himari", "Shushu"], "ans": "D"}, {"anime": "DanMachi", "q": "1. ¿Quién es considerada la waifu más elegante?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "A"}, {"anime": "DanMachi", "q": "2. ¿Quién destaca por su personalidad amable?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "B"}, {"anime": "DanMachi", "q": "3. ¿Quién tiene el diseño más llamativo?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "C"}, {"anime": "DanMachi", "q": "4. ¿Quién posee el cabello más icónico?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "D"}, {"anime": "DanMachi", "q": "5. ¿Quién proyecta más carisma?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "A"}, {"anime": "DanMachi", "q": "6. ¿Quién tiene la mirada más distintiva?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "B"}, {"anime": "DanMachi", "q": "7. ¿Quién tiene el atuendo más recordado?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "C"}, {"anime": "DanMachi", "q": "8. ¿Quién parece más misteriosa?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "D"}, {"anime": "DanMachi", "q": "9. ¿Quién tiene más presencia?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "A"}, {"anime": "DanMachi", "q": "10. ¿Quién destaca por liderazgo?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "B"}, {"anime": "DanMachi", "q": "11. ¿Quién parece más tierna?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "C"}, {"anime": "DanMachi", "q": "12. ¿Quién tiene el estilo más refinado?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "D"}, {"anime": "DanMachi", "q": "13. ¿Quién sería la reina waifu?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "A"}, {"anime": "DanMachi", "q": "14. ¿Quién tiene la mejor primera impresión?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "B"}, {"anime": "DanMachi", "q": "15. ¿Quién tiene aura imponente?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "C"}, {"anime": "DanMachi", "q": "16. ¿Quién destaca por confianza?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "D"}, {"anime": "DanMachi", "q": "17. ¿Quién tiene diseño favorito del fandom?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "A"}, {"anime": "DanMachi", "q": "18. ¿Quién parece más tranquila?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "B"}, {"anime": "DanMachi", "q": "19. ¿Quién tiene mayor popularidad?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "C"}, {"anime": "DanMachi", "q": "20. ¿Quién tiene el look más memorable?", "opts": ["Hestia", "Ais", "Ryuu", "Freya"], "ans": "D"}, {"anime": "The Eminence in Shadow", "q": "1. ¿Quién es considerada la waifu más elegante?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "A"}, {"anime": "The Eminence in Shadow", "q": "2. ¿Quién destaca por su personalidad amable?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "B"}, {"anime": "The Eminence in Shadow", "q": "3. ¿Quién tiene el diseño más llamativo?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "C"}, {"anime": "The Eminence in Shadow", "q": "4. ¿Quién posee el cabello más icónico?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "D"}, {"anime": "The Eminence in Shadow", "q": "5. ¿Quién proyecta más carisma?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "A"}, {"anime": "The Eminence in Shadow", "q": "6. ¿Quién tiene la mirada más distintiva?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "B"}, {"anime": "The Eminence in Shadow", "q": "7. ¿Quién tiene el atuendo más recordado?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "C"}, {"anime": "The Eminence in Shadow", "q": "8. ¿Quién parece más misteriosa?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "D"}, {"anime": "The Eminence in Shadow", "q": "9. ¿Quién tiene más presencia?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "A"}, {"anime": "The Eminence in Shadow", "q": "10. ¿Quién destaca por liderazgo?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "B"}, {"anime": "The Eminence in Shadow", "q": "11. ¿Quién parece más tierna?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "C"}, {"anime": "The Eminence in Shadow", "q": "12. ¿Quién tiene el estilo más refinado?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "D"}, {"anime": "The Eminence in Shadow", "q": "13. ¿Quién sería la reina waifu?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "A"}, {"anime": "The Eminence in Shadow", "q": "14. ¿Quién tiene la mejor primera impresión?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "B"}, {"anime": "The Eminence in Shadow", "q": "15. ¿Quién tiene aura imponente?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "C"}, {"anime": "The Eminence in Shadow", "q": "16. ¿Quién destaca por confianza?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "D"}, {"anime": "The Eminence in Shadow", "q": "17. ¿Quién tiene diseño favorito del fandom?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "A"}, {"anime": "The Eminence in Shadow", "q": "18. ¿Quién parece más tranquila?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "B"}, {"anime": "The Eminence in Shadow", "q": "19. ¿Quién tiene mayor popularidad?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "C"}, {"anime": "The Eminence in Shadow", "q": "20. ¿Quién tiene el look más memorable?", "opts": ["Alpha", "Beta", "Delta", "Alexia"], "ans": "D"}, {"anime": "Fire Force", "q": "1. ¿Quién es considerada la waifu más elegante?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "A"}, {"anime": "Fire Force", "q": "2. ¿Quién destaca por su personalidad amable?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "B"}, {"anime": "Fire Force", "q": "3. ¿Quién tiene el diseño más llamativo?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "C"}, {"anime": "Fire Force", "q": "4. ¿Quién posee el cabello más icónico?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "D"}, {"anime": "Fire Force", "q": "5. ¿Quién proyecta más carisma?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "A"}, {"anime": "Fire Force", "q": "6. ¿Quién tiene la mirada más distintiva?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "B"}, {"anime": "Fire Force", "q": "7. ¿Quién tiene el atuendo más recordado?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "C"}, {"anime": "Fire Force", "q": "8. ¿Quién parece más misteriosa?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "D"}, {"anime": "Fire Force", "q": "9. ¿Quién tiene más presencia?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "A"}, {"anime": "Fire Force", "q": "10. ¿Quién destaca por liderazgo?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "B"}, {"anime": "Fire Force", "q": "11. ¿Quién parece más tierna?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "C"}, {"anime": "Fire Force", "q": "12. ¿Quién tiene el estilo más refinado?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "D"}, {"anime": "Fire Force", "q": "13. ¿Quién sería la reina waifu?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "A"}, {"anime": "Fire Force", "q": "14. ¿Quién tiene la mejor primera impresión?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "B"}, {"anime": "Fire Force", "q": "15. ¿Quién tiene aura imponente?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "C"}, {"anime": "Fire Force", "q": "16. ¿Quién destaca por confianza?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "D"}, {"anime": "Fire Force", "q": "17. ¿Quién tiene diseño favorito del fandom?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "A"}, {"anime": "Fire Force", "q": "18. ¿Quién parece más tranquila?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "B"}, {"anime": "Fire Force", "q": "19. ¿Quién tiene mayor popularidad?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "C"}, {"anime": "Fire Force", "q": "20. ¿Quién tiene el look más memorable?", "opts": ["Tamaki", "Iris", "Maki", "Hibana"], "ans": "D"}, {"anime": "Hunter x Hunter", "q": "1. ¿Quién es considerada la waifu más elegante?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "A"}, {"anime": "Hunter x Hunter", "q": "2. ¿Quién destaca por su personalidad amable?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "B"}, {"anime": "Hunter x Hunter", "q": "3. ¿Quién tiene el diseño más llamativo?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "C"}, {"anime": "Hunter x Hunter", "q": "4. ¿Quién posee el cabello más icónico?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "D"}, {"anime": "Hunter x Hunter", "q": "5. ¿Quién proyecta más carisma?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "A"}, {"anime": "Hunter x Hunter", "q": "6. ¿Quién tiene la mirada más distintiva?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "B"}, {"anime": "Hunter x Hunter", "q": "7. ¿Quién tiene el atuendo más recordado?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "C"}, {"anime": "Hunter x Hunter", "q": "8. ¿Quién parece más misteriosa?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "D"}, {"anime": "Hunter x Hunter", "q": "9. ¿Quién tiene más presencia?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "A"}, {"anime": "Hunter x Hunter", "q": "10. ¿Quién destaca por liderazgo?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "B"}, {"anime": "Hunter x Hunter", "q": "11. ¿Quién parece más tierna?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "C"}, {"anime": "Hunter x Hunter", "q": "12. ¿Quién tiene el estilo más refinado?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "D"}, {"anime": "Hunter x Hunter", "q": "13. ¿Quién sería la reina waifu?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "A"}, {"anime": "Hunter x Hunter", "q": "14. ¿Quién tiene la mejor primera impresión?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "B"}, {"anime": "Hunter x Hunter", "q": "15. ¿Quién tiene aura imponente?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "C"}, {"anime": "Hunter x Hunter", "q": "16. ¿Quién destaca por confianza?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "D"}, {"anime": "Hunter x Hunter", "q": "17. ¿Quién tiene diseño favorito del fandom?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "A"}, {"anime": "Hunter x Hunter", "q": "18. ¿Quién parece más tranquila?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "B"}, {"anime": "Hunter x Hunter", "q": "19. ¿Quién tiene mayor popularidad?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "C"}, {"anime": "Hunter x Hunter", "q": "20. ¿Quién tiene el look más memorable?", "opts": ["Machi", "Shizuku", "Biscuit", "Pakunoda"], "ans": "D"}, {"anime": "Jujutsu Kaisen", "q": "1. ¿Quién es considerada la waifu más elegante?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "A"}, {"anime": "Jujutsu Kaisen", "q": "2. ¿Quién destaca por su personalidad amable?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "B"}, {"anime": "Jujutsu Kaisen", "q": "3. ¿Quién tiene el diseño más llamativo?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "C"}, {"anime": "Jujutsu Kaisen", "q": "4. ¿Quién posee el cabello más icónico?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "D"}, {"anime": "Jujutsu Kaisen", "q": "5. ¿Quién proyecta más carisma?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "A"}, {"anime": "Jujutsu Kaisen", "q": "6. ¿Quién tiene la mirada más distintiva?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "B"}, {"anime": "Jujutsu Kaisen", "q": "7. ¿Quién tiene el atuendo más recordado?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "C"}, {"anime": "Jujutsu Kaisen", "q": "8. ¿Quién parece más misteriosa?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "D"}, {"anime": "Jujutsu Kaisen", "q": "9. ¿Quién tiene más presencia?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "A"}, {"anime": "Jujutsu Kaisen", "q": "10. ¿Quién destaca por liderazgo?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "B"}, {"anime": "Jujutsu Kaisen", "q": "11. ¿Quién parece más tierna?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "C"}, {"anime": "Jujutsu Kaisen", "q": "12. ¿Quién tiene el estilo más refinado?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "D"}, {"anime": "Jujutsu Kaisen", "q": "13. ¿Quién sería la reina waifu?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "A"}, {"anime": "Jujutsu Kaisen", "q": "14. ¿Quién tiene la mejor primera impresión?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "B"}, {"anime": "Jujutsu Kaisen", "q": "15. ¿Quién tiene aura imponente?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "C"}, {"anime": "Jujutsu Kaisen", "q": "16. ¿Quién destaca por confianza?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "D"}, {"anime": "Jujutsu Kaisen", "q": "17. ¿Quién tiene diseño favorito del fandom?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "A"}, {"anime": "Jujutsu Kaisen", "q": "18. ¿Quién parece más tranquila?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "B"}, {"anime": "Jujutsu Kaisen", "q": "19. ¿Quién tiene mayor popularidad?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "C"}, {"anime": "Jujutsu Kaisen", "q": "20. ¿Quién tiene el look más memorable?", "opts": ["Nobara", "Maki", "Mei Mei", "Utahime"], "ans": "D"}, {"anime": "Demon Slayer", "q": "1. ¿Quién es considerada la waifu más elegante?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "A"}, {"anime": "Demon Slayer", "q": "2. ¿Quién destaca por su personalidad amable?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "B"}, {"anime": "Demon Slayer", "q": "3. ¿Quién tiene el diseño más llamativo?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "C"}, {"anime": "Demon Slayer", "q": "4. ¿Quién posee el cabello más icónico?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "D"}, {"anime": "Demon Slayer", "q": "5. ¿Quién proyecta más carisma?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "A"}, {"anime": "Demon Slayer", "q": "6. ¿Quién tiene la mirada más distintiva?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "B"}, {"anime": "Demon Slayer", "q": "7. ¿Quién tiene el atuendo más recordado?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "C"}, {"anime": "Demon Slayer", "q": "8. ¿Quién parece más misteriosa?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "D"}, {"anime": "Demon Slayer", "q": "9. ¿Quién tiene más presencia?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "A"}, {"anime": "Demon Slayer", "q": "10. ¿Quién destaca por liderazgo?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "B"}, {"anime": "Demon Slayer", "q": "11. ¿Quién parece más tierna?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "C"}, {"anime": "Demon Slayer", "q": "12. ¿Quién tiene el estilo más refinado?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "D"}, {"anime": "Demon Slayer", "q": "13. ¿Quién sería la reina waifu?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "A"}, {"anime": "Demon Slayer", "q": "14. ¿Quién tiene la mejor primera impresión?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "B"}, {"anime": "Demon Slayer", "q": "15. ¿Quién tiene aura imponente?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "C"}, {"anime": "Demon Slayer", "q": "16. ¿Quién destaca por confianza?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "D"}, {"anime": "Demon Slayer", "q": "17. ¿Quién tiene diseño favorito del fandom?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "A"}, {"anime": "Demon Slayer", "q": "18. ¿Quién parece más tranquila?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "B"}, {"anime": "Demon Slayer", "q": "19. ¿Quién tiene mayor popularidad?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "C"}, {"anime": "Demon Slayer", "q": "20. ¿Quién tiene el look más memorable?", "opts": ["Nezuko", "Shinobu", "Mitsuri", "Kanao"], "ans": "D"}, {"anime": "KonoSuba", "q": "1. ¿Quién es considerada la waifu más elegante?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "A"}, {"anime": "KonoSuba", "q": "2. ¿Quién destaca por su personalidad amable?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "B"}, {"anime": "KonoSuba", "q": "3. ¿Quién tiene el diseño más llamativo?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "C"}, {"anime": "KonoSuba", "q": "4. ¿Quién posee el cabello más icónico?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "D"}, {"anime": "KonoSuba", "q": "5. ¿Quién proyecta más carisma?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "A"}, {"anime": "KonoSuba", "q": "6. ¿Quién tiene la mirada más distintiva?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "B"}, {"anime": "KonoSuba", "q": "7. ¿Quién tiene el atuendo más recordado?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "C"}, {"anime": "KonoSuba", "q": "8. ¿Quién parece más misteriosa?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "D"}, {"anime": "KonoSuba", "q": "9. ¿Quién tiene más presencia?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "A"}, {"anime": "KonoSuba", "q": "10. ¿Quién destaca por liderazgo?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "B"}, {"anime": "KonoSuba", "q": "11. ¿Quién parece más tierna?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "C"}, {"anime": "KonoSuba", "q": "12. ¿Quién tiene el estilo más refinado?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "D"}, {"anime": "KonoSuba", "q": "13. ¿Quién sería la reina waifu?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "A"}, {"anime": "KonoSuba", "q": "14. ¿Quién tiene la mejor primera impresión?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "B"}, {"anime": "KonoSuba", "q": "15. ¿Quién tiene aura imponente?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "C"}, {"anime": "KonoSuba", "q": "16. ¿Quién destaca por confianza?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "D"}, {"anime": "KonoSuba", "q": "17. ¿Quién tiene diseño favorito del fandom?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "A"}, {"anime": "KonoSuba", "q": "18. ¿Quién parece más tranquila?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "B"}, {"anime": "KonoSuba", "q": "19. ¿Quién tiene mayor popularidad?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "C"}, {"anime": "KonoSuba", "q": "20. ¿Quién tiene el look más memorable?", "opts": ["Aqua", "Megumin", "Darkness", "Yunyun"], "ans": "D"}, {"anime": "Mushoku Tensei", "q": "1. ¿Quién es considerada la waifu más elegante?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "A"}, {"anime": "Mushoku Tensei", "q": "2. ¿Quién destaca por su personalidad amable?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "B"}, {"anime": "Mushoku Tensei", "q": "3. ¿Quién tiene el diseño más llamativo?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "C"}, {"anime": "Mushoku Tensei", "q": "4. ¿Quién posee el cabello más icónico?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "A"}, {"anime": "Mushoku Tensei", "q": "5. ¿Quién proyecta más carisma?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "B"}, {"anime": "Mushoku Tensei", "q": "6. ¿Quién tiene la mirada más distintiva?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "C"}, {"anime": "Mushoku Tensei", "q": "7. ¿Quién tiene el atuendo más recordado?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "A"}, {"anime": "Mushoku Tensei", "q": "8. ¿Quién parece más misteriosa?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "B"}, {"anime": "Mushoku Tensei", "q": "9. ¿Quién tiene más presencia?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "C"}, {"anime": "Mushoku Tensei", "q": "10. ¿Quién destaca por liderazgo?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "A"}, {"anime": "Mushoku Tensei", "q": "11. ¿Quién parece más tierna?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "B"}, {"anime": "Mushoku Tensei", "q": "12. ¿Quién tiene el estilo más refinado?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "C"}, {"anime": "Mushoku Tensei", "q": "13. ¿Quién sería la reina waifu?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "A"}, {"anime": "Mushoku Tensei", "q": "14. ¿Quién tiene la mejor primera impresión?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "B"}, {"anime": "Mushoku Tensei", "q": "15. ¿Quién tiene aura imponente?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "C"}, {"anime": "Mushoku Tensei", "q": "16. ¿Quién destaca por confianza?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "A"}, {"anime": "Mushoku Tensei", "q": "17. ¿Quién tiene diseño favorito del fandom?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "B"}, {"anime": "Mushoku Tensei", "q": "18. ¿Quién parece más tranquila?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "C"}, {"anime": "Mushoku Tensei", "q": "19. ¿Quién tiene mayor popularidad?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "A"}, {"anime": "Mushoku Tensei", "q": "20. ¿Quién tiene el look más memorable?", "opts": ["Eris", "Roxy", "Sylphiette", "Eris"], "ans": "B"}, {"anime": "Seven Deadly Sins", "q": "1. ¿Quién es considerada la waifu más elegante?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "A"}, {"anime": "Seven Deadly Sins", "q": "2. ¿Quién destaca por su personalidad amable?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "B"}, {"anime": "Seven Deadly Sins", "q": "3. ¿Quién tiene el diseño más llamativo?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "C"}, {"anime": "Seven Deadly Sins", "q": "4. ¿Quién posee el cabello más icónico?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "A"}, {"anime": "Seven Deadly Sins", "q": "5. ¿Quién proyecta más carisma?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "B"}, {"anime": "Seven Deadly Sins", "q": "6. ¿Quién tiene la mirada más distintiva?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "C"}, {"anime": "Seven Deadly Sins", "q": "7. ¿Quién tiene el atuendo más recordado?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "A"}, {"anime": "Seven Deadly Sins", "q": "8. ¿Quién parece más misteriosa?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "B"}, {"anime": "Seven Deadly Sins", "q": "9. ¿Quién tiene más presencia?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "C"}, {"anime": "Seven Deadly Sins", "q": "10. ¿Quién destaca por liderazgo?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "A"}, {"anime": "Seven Deadly Sins", "q": "11. ¿Quién parece más tierna?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "B"}, {"anime": "Seven Deadly Sins", "q": "12. ¿Quién tiene el estilo más refinado?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "C"}, {"anime": "Seven Deadly Sins", "q": "13. ¿Quién sería la reina waifu?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "A"}, {"anime": "Seven Deadly Sins", "q": "14. ¿Quién tiene la mejor primera impresión?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "B"}, {"anime": "Seven Deadly Sins", "q": "15. ¿Quién tiene aura imponente?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "C"}, {"anime": "Seven Deadly Sins", "q": "16. ¿Quién destaca por confianza?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "A"}, {"anime": "Seven Deadly Sins", "q": "17. ¿Quién tiene diseño favorito del fandom?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "B"}, {"anime": "Seven Deadly Sins", "q": "18. ¿Quién parece más tranquila?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "C"}, {"anime": "Seven Deadly Sins", "q": "19. ¿Quién tiene mayor popularidad?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "A"}, {"anime": "Seven Deadly Sins", "q": "20. ¿Quién tiene el look más memorable?", "opts": ["Elizabeth", "Diane", "Merlin", "Elizabeth"], "ans": "B"}, {"anime": "One Piece", "q": "1. ¿Quién es considerada la waifu más elegante?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "A"}, {"anime": "One Piece", "q": "2. ¿Quién destaca por su personalidad amable?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "B"}, {"anime": "One Piece", "q": "3. ¿Quién tiene el diseño más llamativo?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "C"}, {"anime": "One Piece", "q": "4. ¿Quién posee el cabello más icónico?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "D"}, {"anime": "One Piece", "q": "5. ¿Quién proyecta más carisma?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "A"}, {"anime": "One Piece", "q": "6. ¿Quién tiene la mirada más distintiva?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "B"}, {"anime": "One Piece", "q": "7. ¿Quién tiene el atuendo más recordado?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "C"}, {"anime": "One Piece", "q": "8. ¿Quién parece más misteriosa?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "D"}, {"anime": "One Piece", "q": "9. ¿Quién tiene más presencia?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "A"}, {"anime": "One Piece", "q": "10. ¿Quién destaca por liderazgo?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "B"}, {"anime": "One Piece", "q": "11. ¿Quién parece más tierna?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "C"}, {"anime": "One Piece", "q": "12. ¿Quién tiene el estilo más refinado?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "D"}, {"anime": "One Piece", "q": "13. ¿Quién sería la reina waifu?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "A"}, {"anime": "One Piece", "q": "14. ¿Quién tiene la mejor primera impresión?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "B"}, {"anime": "One Piece", "q": "15. ¿Quién tiene aura imponente?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "C"}, {"anime": "One Piece", "q": "16. ¿Quién destaca por confianza?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "D"}, {"anime": "One Piece", "q": "17. ¿Quién tiene diseño favorito del fandom?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "A"}, {"anime": "One Piece", "q": "18. ¿Quién parece más tranquila?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "B"}, {"anime": "One Piece", "q": "19. ¿Quién tiene mayor popularidad?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "C"}, {"anime": "One Piece", "q": "20. ¿Quién tiene el look más memorable?", "opts": ["Nami", "Robin", "Boa Hancock", "Yamato"], "ans": "D"}, {"anime": "Overlord", "q": "1. ¿Quién es considerada la waifu más elegante?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "A"}, {"anime": "Overlord", "q": "2. ¿Quién destaca por su personalidad amable?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "B"}, {"anime": "Overlord", "q": "3. ¿Quién tiene el diseño más llamativo?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "C"}, {"anime": "Overlord", "q": "4. ¿Quién posee el cabello más icónico?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "A"}, {"anime": "Overlord", "q": "5. ¿Quién proyecta más carisma?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "B"}, {"anime": "Overlord", "q": "6. ¿Quién tiene la mirada más distintiva?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "C"}, {"anime": "Overlord", "q": "7. ¿Quién tiene el atuendo más recordado?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "A"}, {"anime": "Overlord", "q": "8. ¿Quién parece más misteriosa?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "B"}, {"anime": "Overlord", "q": "9. ¿Quién tiene más presencia?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "C"}, {"anime": "Overlord", "q": "10. ¿Quién destaca por liderazgo?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "A"}, {"anime": "Overlord", "q": "11. ¿Quién parece más tierna?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "B"}, {"anime": "Overlord", "q": "12. ¿Quién tiene el estilo más refinado?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "C"}, {"anime": "Overlord", "q": "13. ¿Quién sería la reina waifu?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "A"}, {"anime": "Overlord", "q": "14. ¿Quién tiene la mejor primera impresión?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "B"}, {"anime": "Overlord", "q": "15. ¿Quién tiene aura imponente?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "C"}, {"anime": "Overlord", "q": "16. ¿Quién destaca por confianza?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "A"}, {"anime": "Overlord", "q": "17. ¿Quién tiene diseño favorito del fandom?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "B"}, {"anime": "Overlord", "q": "18. ¿Quién parece más tranquila?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "C"}, {"anime": "Overlord", "q": "19. ¿Quién tiene mayor popularidad?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "A"}, {"anime": "Overlord", "q": "20. ¿Quién tiene el look más memorable?", "opts": ["Albedo", "Shalltear", "Narberal", "Albedo"], "ans": "B"}, {"anime": "Re:Zero", "q": "1. ¿Quién es considerada la waifu más elegante?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "A"}, {"anime": "Re:Zero", "q": "2. ¿Quién destaca por su personalidad amable?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "B"}, {"anime": "Re:Zero", "q": "3. ¿Quién tiene el diseño más llamativo?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "C"}, {"anime": "Re:Zero", "q": "4. ¿Quién posee el cabello más icónico?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "D"}, {"anime": "Re:Zero", "q": "5. ¿Quién proyecta más carisma?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "A"}, {"anime": "Re:Zero", "q": "6. ¿Quién tiene la mirada más distintiva?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "B"}, {"anime": "Re:Zero", "q": "7. ¿Quién tiene el atuendo más recordado?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "C"}, {"anime": "Re:Zero", "q": "8. ¿Quién parece más misteriosa?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "D"}, {"anime": "Re:Zero", "q": "9. ¿Quién tiene más presencia?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "A"}, {"anime": "Re:Zero", "q": "10. ¿Quién destaca por liderazgo?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "B"}, {"anime": "Re:Zero", "q": "11. ¿Quién parece más tierna?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "C"}, {"anime": "Re:Zero", "q": "12. ¿Quién tiene el estilo más refinado?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "D"}, {"anime": "Re:Zero", "q": "13. ¿Quién sería la reina waifu?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "A"}, {"anime": "Re:Zero", "q": "14. ¿Quién tiene la mejor primera impresión?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "B"}, {"anime": "Re:Zero", "q": "15. ¿Quién tiene aura imponente?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "C"}, {"anime": "Re:Zero", "q": "16. ¿Quién destaca por confianza?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "D"}, {"anime": "Re:Zero", "q": "17. ¿Quién tiene diseño favorito del fandom?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "A"}, {"anime": "Re:Zero", "q": "18. ¿Quién parece más tranquila?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "B"}, {"anime": "Re:Zero", "q": "19. ¿Quién tiene mayor popularidad?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "C"}, {"anime": "Re:Zero", "q": "20. ¿Quién tiene el look más memorable?", "opts": ["Emilia", "Rem", "Ram", "Echidna"], "ans": "D"}, {"anime": "Tensura", "q": "1. ¿Quién es considerada la waifu más elegante?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "A"}, {"anime": "Tensura", "q": "2. ¿Quién destaca por su personalidad amable?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "B"}, {"anime": "Tensura", "q": "3. ¿Quién tiene el diseño más llamativo?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "C"}, {"anime": "Tensura", "q": "4. ¿Quién posee el cabello más icónico?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "D"}, {"anime": "Tensura", "q": "5. ¿Quién proyecta más carisma?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "A"}, {"anime": "Tensura", "q": "6. ¿Quién tiene la mirada más distintiva?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "B"}, {"anime": "Tensura", "q": "7. ¿Quién tiene el atuendo más recordado?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "C"}, {"anime": "Tensura", "q": "8. ¿Quién parece más misteriosa?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "D"}, {"anime": "Tensura", "q": "9. ¿Quién tiene más presencia?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "A"}, {"anime": "Tensura", "q": "10. ¿Quién destaca por liderazgo?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "B"}, {"anime": "Tensura", "q": "11. ¿Quién parece más tierna?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "C"}, {"anime": "Tensura", "q": "12. ¿Quién tiene el estilo más refinado?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "D"}, {"anime": "Tensura", "q": "13. ¿Quién sería la reina waifu?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "A"}, {"anime": "Tensura", "q": "14. ¿Quién tiene la mejor primera impresión?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "B"}, {"anime": "Tensura", "q": "15. ¿Quién tiene aura imponente?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "C"}, {"anime": "Tensura", "q": "16. ¿Quién destaca por confianza?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "D"}, {"anime": "Tensura", "q": "17. ¿Quién tiene diseño favorito del fandom?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "A"}, {"anime": "Tensura", "q": "18. ¿Quién parece más tranquila?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "B"}, {"anime": "Tensura", "q": "19. ¿Quién tiene mayor popularidad?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "C"}, {"anime": "Tensura", "q": "20. ¿Quién tiene el look más memorable?", "opts": ["Shuna", "Shion", "Milim", "Hinata"], "ans": "D"}];

  const QUIZ_COST = 50, QUIZ_REWARD = 100, QUIZ_COUNT = 10;
  let quizState = null;  // { questions, current, correct, wrong }

  function initPuzzle() {
    const el = document.getElementById('puzzle-content');
    if (!el) return;
    const diamonds = getDiamonds();
    const canPlay = diamonds >= QUIZ_COST;
    el.innerHTML = `
      <div style="text-align:center;padding:1rem">
        <div style="font-size:3rem">🧩</div>
        <h3 style="font-family:Cinzel,serif;color:#f0d080;margin:0.5rem 0">Quiz de Anime</h3>
        <p style="color:#9ca3af;max-width:340px;margin:0 auto 1rem">
          Responde <strong>10 preguntas</strong> de tus animes favoritos.<br>
          ¡Debes acertarlas <strong>todas</strong> para ganar!
        </p>
        <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:12px;padding:1rem;margin:0 auto 1.5rem;max-width:340px">
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
            <span style="color:#9ca3af">💸 Costo de entrada</span>
            <strong style="color:#f87171">−${QUIZ_COST} 💎</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
            <span style="color:#9ca3af">🏆 Si aciertas las 10</span>
            <strong style="color:#4ade80">+${QUIZ_REWARD} 💎</strong>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span style="color:#9ca3af">💀 Si fallas 1</span>
            <strong style="color:#f87171">pierdes los ${QUIZ_COST} 💎</strong>
          </div>
        </div>
        <div style="font-family:Cinzel,serif;color:${canPlay?'#67e8f9':'#f87171'};margin-bottom:1rem">
          Tu saldo: ${diamonds} 💎
        </div>
        <button class="btn-primary ${canPlay?'':'btn-disabled'}" onclick="startQuiz()" ${canPlay?'':'disabled'} style="padding:1rem 2.5rem;font-size:1rem">
          ${canPlay?`🧩 Iniciar Quiz (${QUIZ_COST} 💎)`:`Sin diamantes suficientes`}
        </button>
      </div>`;
  }

  window.initPuzzle = initPuzzle;

  window.startQuiz = function() {
    if (getDiamonds() < QUIZ_COST) { alert(`Necesitas ${QUIZ_COST} 💎.`); return; }
    chargeDiamonds(QUIZ_COST);
    // Seleccionar 10 preguntas aleatorias
    const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
    quizState = { questions: shuffled.slice(0, QUIZ_COUNT), current: 0, correct: 0, wrong: 0 };
    renderQuizQuestion();
  };

  function renderQuizQuestion() {
    const el = document.getElementById('puzzle-content');
    if (!el || !quizState) return;
    if (quizState.current >= quizState.questions.length) { showQuizResult(); return; }

    const q = quizState.questions[quizState.current];
    const num = quizState.current + 1;
    const letters = ['A','B','C','D'];

    el.innerHTML = `
      <div style="padding:1rem;max-width:480px;margin:0 auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <div style="font-family:Cinzel,serif;color:#c9a84c;font-size:0.85rem">Pregunta ${num} / ${QUIZ_COUNT}</div>
          <div style="font-size:0.8rem;color:#9ca3af">✅ ${quizState.correct} | 📺 ${q.anime}</div>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(201,168,76,0.2);border-radius:12px;padding:0.5rem 1rem;margin-bottom:1rem">
          <div style="height:4px;background:rgba(255,255,255,0.1);border-radius:2px;margin-bottom:0.8rem">
            <div style="height:100%;background:linear-gradient(90deg,#c9a84c,#ffd700);width:${num/QUIZ_COUNT*100}%;border-radius:2px;transition:width 0.3s"></div>
          </div>
        </div>
        <div style="font-family:Cinzel,serif;color:#e8e0cc;font-size:1rem;margin-bottom:1.5rem;line-height:1.5">
          ${q.q}
        </div>
        <div style="display:flex;flex-direction:column;gap:0.8rem">
          ${q.opts.map((opt, i) => opt ? `
            <button class="quiz-option" onclick="answerQuiz('${letters[i]}')" style="
              text-align:left;padding:0.9rem 1.2rem;background:rgba(255,255,255,0.04);
              border:1.5px solid rgba(201,168,76,0.25);border-radius:12px;
              color:#e8e0cc;font-family:Rajdhani,sans-serif;font-size:0.95rem;
              cursor:pointer;transition:all 0.2s;width:100%">
              <strong style="color:#c9a84c;margin-right:0.5rem">${letters[i]})</strong> ${opt}
            </button>` : '').join('')}
        </div>
      </div>`;
  }

  window.answerQuiz = function(letter) {
    if (!quizState) return;
    const q = quizState.questions[quizState.current];
    const correct = letter === q.ans;

    // Mostrar feedback visual
    const el = document.getElementById('puzzle-content');
    const opts = el.querySelectorAll('.quiz-option');
    const letters = ['A','B','C','D'];
    opts.forEach((btn, i) => {
      const btnLetter = letters[i];
      if (btnLetter === q.ans) { btn.style.background='rgba(74,222,128,0.2)'; btn.style.borderColor='#4ade80'; }
      else if (btnLetter === letter && !correct) { btn.style.background='rgba(248,113,113,0.2)'; btn.style.borderColor='#f87171'; }
      btn.disabled = true;
    });

    if (correct) {
      quizState.correct++;
      setTimeout(() => {
        quizState.current++;
        if (quizState.current >= QUIZ_COUNT) showQuizResult();
        else renderQuizQuestion();
      }, 900);
    } else {
      quizState.wrong++;
      setTimeout(() => showQuizResult(true), 1200);
    }
  };

  function showQuizResult(failed) {
    const el = document.getElementById('puzzle-content');
    if (!el) return;
    const won = !failed && quizState.correct === QUIZ_COUNT;
    if (won) {
      awardDiamonds(QUIZ_REWARD);
      if (typeof recordMissionProgress === 'function') recordMissionProgress('quizPerfect', 1);
    }
    if (typeof recordMissionProgress === 'function') recordMissionProgress('quizPlays', 1);

    el.innerHTML = `
      <div style="text-align:center;padding:2rem 1rem">
        <div style="font-size:4rem">${won?'🏆':'💀'}</div>
        <h3 style="font-family:Cinzel,serif;color:${won?'#ffd700':'#f87171'};margin:0.5rem 0">
          ${won?'¡PERFECTO!':'¡Fallaste!'}
        </h3>
        <div style="font-family:Cinzel,serif;font-size:1.1rem;color:#e8e0cc;margin:1rem 0">
          ${quizState.correct} / ${QUIZ_COUNT} correctas
        </div>
        <div style="font-size:${won?'1.3rem':'1rem'};font-weight:700;color:${won?'#4ade80':'#f87171'};margin:0.5rem 0">
          ${won?`+${QUIZ_REWARD} 💎 ganados`:`Perdiste los ${QUIZ_COST} 💎 de entrada`}
        </div>
        ${!won&&failed?`<p style="color:#9ca3af;font-size:0.9rem;margin:0.5rem 0">Necesitas acertar las <strong>${QUIZ_COUNT}</strong> para ganar.</p>`:''}
        <button class="btn-primary" onclick="initPuzzle()" style="margin-top:1.5rem;padding:0.9rem 2rem">
          ${won?'🔄 Jugar de nuevo':'🎯 Intentar de nuevo'}
        </button>
      </div>`;
    quizState = null;
  }

  /* ══════════════════════════════════════════
     MODES GRID
  ══════════════════════════════════════════ */
  function initModesGrid() {
    // El grid es HTML estático, solo inicializar pvpai si existe
    if (document.getElementById('pvpai-content')) initPvpAI();
  }

  document.addEventListener('DOMContentLoaded', function() {
    // Parche ya aplicado al inicio
  });

})();
