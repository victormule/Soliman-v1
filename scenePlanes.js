// scenePlanes.js
import * as THREE from 'three';

// Loader de textures partagé
const textureLoader = new THREE.TextureLoader();

// Config générique par "famille" de meshes
const planeConfigs = {
  tree: {
    sprite: 'images/tree.png',
    totalFrames: 1,
    fps: 0
  },
  plante: {
    sprite: 'images/plante.png',
    totalFrames: 1,
    fps: 0
  },
  palm: {
    sprite: 'images/palm.png',
    totalFrames: 1,
    fps: 0
  },
  decor1: {
    sprite: 'images/fond.png',
    totalFrames: 1,
    fps: 0
  },
  decor2: {
    sprite: 'images/face.png',
    totalFrames: 1,
    fps: 0
  }
};

// Exceptions mesh précis → texture spécifique
const specialConfigsByName = {
  palm2: {
    sprite: 'images/blurpalm.png',
    totalFrames: 1,
    fps: 0
  },
  plante3: {
    sprite: 'images/blurplante.png',
    totalFrames: 1,
    fps: 0
  }
};

// instances réellement présentes dans la scène
const scenePlaneInstances = [];

/**
 * À appeler sur le modèle scène (gltf.scene)
 * Assigne les bons matériaux en fonction du nom des meshes.
 */
export function initScenePlanes(root) {
  root.traverse((child) => {
    if (!child.isMesh) return;

    const name = (child.name || '').toLowerCase();

    // 1) on commence par les exceptions
    let cfg = specialConfigsByName[name];

    // 2) sinon, on passe aux règles génériques
    if (!cfg) {
      let key = null;

      // familles : tree1, tree2, tree3...
      if (name.startsWith('tree'))   key = 'tree';
      if (name.startsWith('plante')) key = 'plante';
      if (name.startsWith('palm'))   key = 'palm';

      if (name === 'decor1') key = 'decor1';
      if (name === 'decor2') key = 'decor2';

      if (!key) return;
      cfg = planeConfigs[key];
    }

    if (!cfg) return;

    const instance = {
      mesh: child,
      texture: null,
      totalFrames: cfg.totalFrames,
      fps: cfg.fps,
      currentFrame: 0,
      accumulatedTime: 0
    };

    // chargement texture
    instance.texture = textureLoader.load(
      cfg.sprite,
      () => {
        if (cfg.totalFrames > 1) {
          // spritesheet potentielle (frames sur l'axe X)
          instance.texture.wrapS = THREE.RepeatWrapping;
          instance.texture.wrapT = THREE.RepeatWrapping;
          instance.texture.repeat.set(1 / cfg.totalFrames, 1);
          instance.texture.flipY = false;
          instance.texture.minFilter = THREE.NearestFilter;
          instance.texture.magFilter = THREE.NearestFilter;
        } else {
          instance.texture.flipY = false;
        }

        child.material = new THREE.MeshStandardMaterial({
          map: instance.texture,
          transparent: true,
          alphaTest: 0.5,
          side: THREE.DoubleSide,
          metalness: 0,
          roughness: 1
        });
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.needsUpdate = true;
      }
    );

    scenePlaneInstances.push(instance);
  });
}

/**
 * Pour animer des spritesheets si un jour certains plans
 * ont totalFrames > 1 et un fps > 0.
 */
export function updateScenePlanes(deltaMs) {
  scenePlaneInstances.forEach((p) => {
    if (!p.texture || !p.mesh) return;
    if (p.totalFrames <= 1 || p.fps <= 0) return;

    const frameDurationMs = 1000 / p.fps;
    p.accumulatedTime += deltaMs;

    if (p.accumulatedTime >= frameDurationMs) {
      p.accumulatedTime -= frameDurationMs;
      p.currentFrame = (p.currentFrame + 1) % p.totalFrames;
      const uOffset = p.currentFrame / p.totalFrames;
      p.texture.offset.set(uOffset, 0);
    }
  });
}
