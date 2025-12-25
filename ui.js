import { showCharacter, hideAllCharacters, startBonesBird, stopBonesBird } from './characters.js';

export function initUI(appState, canvas) {
  const overlay  = document.getElementById('overlay');
  const startBtn = document.getElementById('startButton');
  const uiPanel  = document.getElementById('uiPanel');

  appState.overlay = overlay;
  appState.uiPanel = uiPanel;

  // === START ===
  if (startBtn && overlay && canvas) {
    startBtn.addEventListener('click', () => {
      appState.isStarted = true;
      appState.progress = 0;
      canvas.classList.add('started');
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      setTimeout(() => {
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 700);
    });
  }

  // === MOUSE POSITION ===
  window.addEventListener('mousemove', (e) => {
    appState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    appState.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

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
    // SI un bouton est déjà actif, on ne touche plus aux personnages.
    // On laisse juste le :hover CSS gérer l'opacité/couleur.
    if (activeName) return;

    // sinon : preview au survol
    applySelection(name);
  });

  btn.addEventListener('mouseleave', () => {
    // SI un bouton est déjà actif, on ne change rien à la scène :
    // le personnage verrouillé reste visible.
    if (activeName) return;

    // sinon : on nettoie tout quand on quitte le bouton
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
