import { initCore, updateCameraAndPlants } from './core.js';
import { initCharacters, updateCharacters, initBonesBird, updateBonesBird } from './characters.js';
import { initUI } from './ui.js';

// état global simple
const appState = {
  isStarted: false,
  hasShownUI: false,
  mouseX: 0,
  mouseY: 0,
  progress: 0,
  uiPanel: null,
  overlay: null
};

// initialisation de la scène / caméra / renderer / décor
const core = initCore();

// chargement des personnages (4 versions de Soliman)
initCharacters(core.scene);
// tas d’os + oiseau
initBonesBird(core.scene);
// UI : overlay + boutons + souris
initUI(appState, core.renderer.domElement);

let lastTime = 0;

function animate(time) {
  requestAnimationFrame(animate);
  if (!lastTime) lastTime = time || 0;
  const deltaMs = (time || 0) - lastTime;
  lastTime = time || 0;

  // animation des sprites des personnages
  updateCharacters(deltaMs, appState.isStarted);
  updateBonesBird(deltaMs, appState.isStarted);
  // caméra + plantes
  updateCameraAndPlants(time || 0, deltaMs, core, appState);

  // apparition du panneau UI quand le zoom est terminé
  if (appState.isStarted && !appState.hasShownUI && appState.progress >= 1) {
    appState.hasShownUI = true;
    if (appState.uiPanel) {
      appState.uiPanel.style.opacity = '1';
      appState.uiPanel.style.pointerEvents = 'auto';
    }
  }

  if (core.controls) core.controls.update();
  core.renderer.render(core.scene, core.camera);
}

animate();

// resize
window.addEventListener('resize', () => {
  core.camera.aspect = window.innerWidth / window.innerHeight;
  core.camera.updateProjectionMatrix();
  core.renderer.setSize(window.innerWidth, window.innerHeight);
});

