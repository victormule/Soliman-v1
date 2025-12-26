import { showCharacter, hideAllCharacters, startBonesBird, stopBonesBird } from './characters.js';

export function initUI(appState, canvas) {
  const overlay  = document.getElementById('overlay');
  const startBtn = document.getElementById('startButton');
  const uiPanel  = document.getElementById('uiPanel');

  appState.overlay = overlay;
  appState.uiPanel = uiPanel;

  // =========================
  //  HELPERS FULLSCREEN / DEVICE
  // =========================

  function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function isFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );
  }

  async function enterFullscreenAndLock() {
    // ⚠️ TRES IMPORTANT :
    // on met TOUTE LA PAGE en plein écran (documentElement),
    // pour que le panel UI reste visible.
    const elem = document.documentElement;

    try {
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen error:', e);
    }

    // tentative de verrouillage paysage (souvent refusé sur iOS)
    try {
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape');
      }
    } catch (e) {
      console.warn('Orientation lock failed:', e);
    }
  }

  async function exitFullscreen() {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    } catch (e) {
      console.warn('Exit fullscreen error:', e);
    }
  }

  async function toggleFullscreen() {
    if (isFullscreen()) {
      await exitFullscreen();
    } else {
      await enterFullscreenAndLock();
    }
  }

  // =========================
  //  BOUTON TOGGLE FULLSCREEN
  // =========================

  let fullscreenBtn = null;

  function updateFullscreenButton() {
    if (!fullscreenBtn) return;
    const fs = isFullscreen();
    fullscreenBtn.setAttribute('aria-pressed', fs ? 'true' : 'false');
    fullscreenBtn.textContent = fs ? '⤡' : '⤢'; // icône différente selon l'état
  }

  function createFullscreenButton() {
    if (fullscreenBtn) return;

    fullscreenBtn = document.createElement('button');
    fullscreenBtn.id = 'fullscreenToggle';
    fullscreenBtn.type = 'button';
    fullscreenBtn.textContent = '⤢';
    // display: none par défaut, rendu visible après START
    document.body.appendChild(fullscreenBtn);

    fullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFullscreen().then(updateFullscreenButton);
    });

    document.addEventListener('fullscreenchange', updateFullscreenButton);
  }

  createFullscreenButton();

  // =========================
  //  AVERTISSEMENT PAYSAGE
  // =========================

  function handleOrientationWarning() {
    const isPortrait = window.innerHeight > window.innerWidth;
    document.body.classList.toggle(
      'force-landscape-warning',
      isPortrait && isMobile()
    );
  }

  window.addEventListener('orientationchange', handleOrientationWarning);
  window.addEventListener('resize', handleOrientationWarning);
  handleOrientationWarning();

  // =========================
  //  START
  // =========================

  if (startBtn && overlay && canvas) {
    startBtn.addEventListener('click', async () => {
      appState.isStarted = true;
      appState.progress = 0;

      // enlève le blur au début
      canvas.classList.add('started');

      // fade de l'overlay
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';

      // 👉 on laisse main.js gérer l'apparition du panel
      //    quand progress >= 1 (zoom terminé)

      // plein écran auto sur mobile au premier clic
      if (isMobile() && !isFullscreen()) {
        await enterFullscreenAndLock();
      }

      // bouton pour pouvoir re-passer en plein écran ensuite
      if (fullscreenBtn) {
        fullscreenBtn.style.display = 'block';
        updateFullscreenButton();
      }

      // suppression DOM de l'overlay après l'anim
      setTimeout(() => {
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 700);
    });
  }

  // =========================
  //  POSITION SOURIS
  // =========================

  window.addEventListener('mousemove', (e) => {
    appState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    appState.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // =========================
  //  BOUTONS DU PANEL
  // =========================

  const btnElHalaby = document.getElementById('btn-elhalaby');
  const btnAssassin = document.getElementById('btn-assassin');
  const btnMartyr   = document.getElementById('btn-martyr');
  const btnHero     = document.getElementById('btn-hero');
  const btnBody     = document.getElementById('btn-body');   // Soliman-corps
  const btnHuman    = document.getElementById('btn-human');  // Reste humain (os + oiseau)

  let activeButton = null;
  let activeName   = null;

  function applySelection(name) {
    hideAllCharacters();
    stopBonesBird();

    if (!name) return;

    if (name === 'bones') {
      startBonesBird();
    } else {
      showCharacter(name);
    }
  }

  function addHover(btn, name) {
    if (!btn) return;

    btn.addEventListener('mouseenter', () => {
      // si un bouton est déjà actif, pas de preview
      if (activeName) return;
      applySelection(name);
    });

    btn.addEventListener('mouseleave', () => {
      if (activeName) return;
      hideAllCharacters();
      stopBonesBird();
    });
  }

  function addClick(btn, name) {
    if (!btn) return;

    btn.addEventListener('click', () => {
      // clic sur le même bouton => on désactive
      if (activeButton === btn) {
        btn.classList.remove('active');
        activeButton = null;
        activeName   = null;
        hideAllCharacters();
        stopBonesBird();
        return;
      }

      // nouveau bouton sélectionné
      if (activeButton) {
        activeButton.classList.remove('active');
      }

      activeButton = btn;
      activeName   = name;
      btn.classList.add('active');

      applySelection(name);
    });
  }

  // personnages Soliman
  addHover(btnElHalaby, 'student');
  addClick(btnElHalaby, 'student');

  addHover(btnAssassin, 'assassin');
  addClick(btnAssassin, 'assassin');

  addHover(btnMartyr, 'martyr');
  addClick(btnMartyr, 'martyr');

  addHover(btnHero, 'hero');
  addClick(btnHero, 'hero');

  addHover(btnBody, 'body');
  addClick(btnBody, 'body');

  // "Reste humain" → tas d’os + oiseau
  addHover(btnHuman, 'bones');
  addClick(btnHuman, 'bones');
}

