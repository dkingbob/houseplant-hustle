/**
 * viewer3d.js — Three.js 3D Plant Scene for Houseplant Hustle
 *
 * Assets (in assets/):
 *   rhyzome_plant.glb  — plant + terracotta pot (5.4MB, full quality)
 *   plant-only.glb     — plant mesh only, pot removed (1.2MB)
 *   [roots-only]       — no separate file; use rootsOnlyMode() clip-plane approach
 *
 * GLB node names (from gltf-transform inspect):
 *   concrete_pot_lambert3_0  — terracotta pot  (333 verts)
 *   plant_lambert2_0         — plant / foliage (8358 verts)
 *   Bounding box: -0.52→0.45 x, 0→1.81 y, -0.43→0.57 z
 *
 * Phase management (GROUP 6 will drive these from scroll):
 *   Phase 1: top-down desk scene, all items visible
 *   Phase 2: camera tilts front, desk items fade
 *   Phase 3: front view, plant + pot
 *   Phase 4: pot goes transparent (shows roots)
 *   Phase 5: pot dissolved, plant only
 *   Phase 6-9: reserved for storyboard (GROUP 6)
 *
 * GROUP 3 sketch overlay: call getPlantScreenPos(camera) for alignment
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';
import { GLTFLoader }    from 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/controls/OrbitControls.js';

export class HH3DViewer {
  constructor() {
    this.renderer   = null;
    this.scene      = null;
    this.camera     = null;
    this.controls   = null;
    this.clock      = new THREE.Clock();
    this.phase      = 0;
    this.potMesh    = null;
    this.plantMesh  = null;
    this.deskItems  = [];
    this.deskPlane  = null;
    this._raf       = null;
    this._camTarget = new THREE.Vector3();
    this._camLerpT  = 1;
    this._camFrom   = { pos: new THREE.Vector3(), tgt: new THREE.Vector3() };
    this._camTo     = { pos: new THREE.Vector3(), tgt: new THREE.Vector3() };
    // Soil particles (Phase 5 + 7)
    this._soilPS       = null;
    this._soilGeo      = null;
    this._soilRest     = null;
    this._soilVelY     = null;
    this._soilFalling  = false;
    this._soilSwirling = false;
    this._swirlTime    = 0;
    // Holographic scan (Phase 6)
    this._scanGroup    = null;
    this._scanSweep    = null;
    this._scanDots     = null;
    // Material modes (Phase 8)
    this._matMode      = 'standard';
    this._origPlantMat = null;
    this._origPotMat   = null;
  }

  // ──────────────────────────────────────────────
  // INIT
  // ──────────────────────────────────────────────
  init(canvas, assetBase = './assets') {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a2c1b);
    this.scene.fog = new THREE.FogExp2(0x1a2c1b, 0.22);

    // Camera (starts top-down for Phase 1)
    this.camera = new THREE.PerspectiveCamera(42, canvas.clientWidth / canvas.clientHeight, 0.01, 40);
    this.camera.position.set(0, 3.6, 0.01);
    this.camera.lookAt(0, 0, 0);

    // Orbit controls (disabled until Phase 9 free rotation)
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enabled = false;
    this.controls.target.set(0, 0.9, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;

    // Lights
    this._setupLights();

    // Desk surface
    this._createDesk();

    // Desk items (colored Three.js primitives)
    this._createDeskItems();

    // Particle system + scan grid (created before GLB)
    this._createSoilParticles();
    this._createScanGrid();

    // Load GLB
    this._loadPlant(assetBase);

    // Resize observer
    new ResizeObserver(() => this._onResize(canvas)).observe(canvas);

    // Render loop
    this._loop();
  }

  // ──────────────────────────────────────────────
  // LIGHTS
  // ──────────────────────────────────────────────
  _setupLights() {
    // Ambient
    this.scene.add(new THREE.AmbientLight(0xd4e8d4, 0.55));

    // Key light (warm, casts shadows)
    const key = new THREE.DirectionalLight(0xfff0e0, 1.6);
    key.position.set(1.8, 3.2, 2.2);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far  = 12;
    key.shadow.camera.left   = -2;
    key.shadow.camera.right  = 2;
    key.shadow.camera.top    = 3;
    key.shadow.camera.bottom = -1;
    key.shadow.bias = -0.001;
    this.scene.add(key);

    // Fill (cool, no shadow)
    const fill = new THREE.DirectionalLight(0xbde0ff, 0.5);
    fill.position.set(-2, 1.5, -1);
    this.scene.add(fill);

    // Rim / back light (green tinted — plant ecosystem feel)
    const rim = new THREE.DirectionalLight(0x66ff88, 0.35);
    rim.position.set(0, -0.5, -2.5);
    this.scene.add(rim);

    // Lamp point light (warm, positioned near desk lamp item)
    this._lampLight = new THREE.PointLight(0xfff5d0, 0.9, 1.8, 1.8);
    this._lampLight.position.set(-0.42, 0.42, -0.12);
    this.scene.add(this._lampLight);
  }

  // ──────────────────────────────────────────────
  // DESK SURFACE
  // ──────────────────────────────────────────────
  _createDesk() {
    const geo = new THREE.PlaneGeometry(3.2, 3.2);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xd8c9a3,      // warm light wood
      roughness: 0.78,
      metalness: 0.02,
    });
    const plane = new THREE.Mesh(geo, mat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.003;
    plane.receiveShadow = true;
    this.scene.add(plane);
    this.deskPlane = plane;

    // Subtle desk edge shadow line
    const edgeGeo = new THREE.PlaneGeometry(3.2, 3.2);
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0xb8a98a, roughness: 0.9, transparent: true, opacity: 0.3
    });
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.rotation.x = -Math.PI / 2;
    edge.position.y = -0.002;
    this.scene.add(edge);
  }

  // ──────────────────────────────────────────────
  // DESK ITEMS — colored Three.js primitives
  // ──────────────────────────────────────────────
  _createDeskItems() {
    const items = [];

    // ── Coffee mug ──
    {
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.048, 0.11, 20),
        new THREE.MeshStandardMaterial({ color: 0xcc4400, roughness: 0.6 })
      );
      body.position.set(0.32, 0.055, -0.22);
      body.castShadow = true;
      this.scene.add(body);

      // Handle
      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.028, 0.009, 8, 14, Math.PI),
        body.material
      );
      handle.position.set(0.32 + 0.062, 0.055, -0.22);
      handle.rotation.z = Math.PI / 2;
      handle.castShadow = true;
      this.scene.add(handle);

      // Coffee surface
      const coffee = new THREE.Mesh(
        new THREE.CircleGeometry(0.046, 20),
        new THREE.MeshStandardMaterial({ color: 0x2a1500, roughness: 0.4 })
      );
      coffee.rotation.x = -Math.PI / 2;
      coffee.position.set(0.32, 0.111, -0.22);
      this.scene.add(coffee);
      items.push(body, handle, coffee);
    }

    // ── Notebook ──
    {
      const cover = new THREE.Mesh(
        new THREE.BoxGeometry(0.19, 0.012, 0.25),
        new THREE.MeshStandardMaterial({ color: 0x1a3266, roughness: 0.7 })
      );
      cover.position.set(-0.3, 0.006, 0.1);
      cover.rotation.y = 0.18;
      cover.castShadow = true;
      this.scene.add(cover);

      // Spine accent
      const spine = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.015, 0.25),
        new THREE.MeshStandardMaterial({ color: 0xe05820, roughness: 0.5 })
      );
      spine.position.set(-0.3 - 0.088, 0.006, 0.1);
      spine.rotation.y = 0.18;
      this.scene.add(spine);
      items.push(cover, spine);
    }

    // ── Pen ──
    {
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0048, 0.004, 0.19, 10),
        new THREE.MeshStandardMaterial({ color: 0x111122, metalness: 0.65, roughness: 0.3 })
      );
      barrel.position.set(-0.22, 0.013, 0.26);
      barrel.rotation.z = 0.22;
      barrel.rotation.x = 0.12;
      barrel.castShadow = true;
      this.scene.add(barrel);

      // Clip
      const clip = new THREE.Mesh(
        new THREE.BoxGeometry(0.003, 0.001, 0.095),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 })
      );
      clip.position.copy(barrel.position);
      clip.position.x += 0.005;
      clip.rotation.copy(barrel.rotation);
      this.scene.add(clip);
      items.push(barrel, clip);
    }

    // ── Scattered papers (3 sheets) ──
    [
      { x: 0.34, z: 0.22, ry: 0.05, color: 0xf5efe2 },
      { x: 0.38, z: 0.26, ry: -0.12, color: 0xeee8d5 },
      { x: 0.3,  z: 0.18, ry: 0.22, color: 0xfaf6ed },
    ].forEach(({ x, z, ry, color }, i) => {
      const paper = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.002, 0.26),
        new THREE.MeshStandardMaterial({ color, roughness: 0.9 })
      );
      paper.position.set(x, 0.001 + i * 0.0015, z);
      paper.rotation.y = ry;
      paper.receiveShadow = true;
      this.scene.add(paper);

      // Printed lines texture (thin dark strips simulating text)
      for (let l = 0; l < 6; l++) {
        const line = new THREE.Mesh(
          new THREE.BoxGeometry(0.13, 0.0022, 0.004),
          new THREE.MeshStandardMaterial({ color: 0x888880, roughness: 1 })
        );
        line.position.set(x - 0.02, 0.003 + i * 0.0015, z - 0.085 + l * 0.032);
        line.rotation.y = ry;
        this.scene.add(line);
      }
      items.push(paper);
    });

    // ── Phone ──
    {
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.074, 0.01, 0.155),
        new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.85, roughness: 0.15 })
      );
      body.position.set(-0.3, 0.005, -0.28);
      body.rotation.y = -0.28;
      body.castShadow = true;
      this.scene.add(body);

      // Screen (slightly inset, green tint active)
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(0.062, 0.003, 0.134),
        new THREE.MeshStandardMaterial({
          color: 0x1a3a20,
          emissive: new THREE.Color(0.04, 0.14, 0.05),
          emissiveIntensity: 0.8,
          roughness: 0.1,
          metalness: 0.4,
        })
      );
      screen.position.copy(body.position);
      screen.position.y += 0.007;
      screen.rotation.copy(body.rotation);
      this.scene.add(screen);
      items.push(body, screen);
    }

    // ── Desk lamp ──
    {
      const mat = new THREE.MeshStandardMaterial({ color: 0xd4b870, metalness: 0.5, roughness: 0.4 });

      // Base
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.052, 0.014, 18), mat);
      base.position.set(-0.42, 0.007, -0.12);
      base.castShadow = true;
      this.scene.add(base);

      // Arm
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.36, 8), mat);
      arm.position.set(-0.42, 0.14 + 0.014, -0.12);
      arm.castShadow = true;
      this.scene.add(arm);

      // Shade (cone, open bottom)
      const shade = new THREE.Mesh(
        new THREE.ConeGeometry(0.088, 0.095, 18, 1, true),
        new THREE.MeshStandardMaterial({ color: 0xf5e4a8, side: THREE.DoubleSide, roughness: 0.7 })
      );
      shade.position.set(-0.42, 0.42, -0.12);
      shade.castShadow = true;
      this.scene.add(shade);
      items.push(base, arm, shade);
    }

    // ── Small sticky note ──
    {
      const note = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.002, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xffe066, roughness: 0.85 })
      );
      note.position.set(0.14, 0.001, -0.32);
      note.rotation.y = 0.3;
      this.scene.add(note);
      items.push(note);
    }

    this.deskItems = items;
  }

  // ──────────────────────────────────────────────
  // LOAD GLB
  // ──────────────────────────────────────────────
  _loadPlant(assetBase) {
    const loader = new GLTFLoader();
    loader.load(`${assetBase}/rhyzome_plant.glb`, (gltf) => {
      const model = gltf.scene;

      // Find named meshes
      model.traverse(obj => {
        if (!obj.isMesh) return;
        obj.castShadow    = true;
        obj.receiveShadow = true;

        // Enable transparency on pot so Phase 4 can fade it
        if (obj.name.includes('concrete_pot')) {
          this.potMesh = obj;
          obj.material = obj.material.clone();
          obj.material.transparent = true;
          obj.material.opacity = 1;
        }

        if (obj.name.includes('plant')) {
          this.plantMesh = obj;
          obj.material = obj.material.clone();
          // Fix color space from Sketchfab export
          if (obj.material.map) obj.material.map.colorSpace = THREE.SRGBColorSpace;
        }

        // Fix pot texture color space
        if (obj.name.includes('concrete_pot') && obj.material.map) {
          obj.material.map.colorSpace = THREE.SRGBColorSpace;
        }
      });

      // Center model on desk (base at y=0)
      const box = new THREE.Box3().setFromObject(model);
      model.position.y -= box.min.y;

      this.scene.add(model);
      this.plantModel = model;
      this._storeMaterials();

      // Start at Phase 1 (top-down desk)
      this.setPhase(1);
    });
  }

  // ──────────────────────────────────────────────
  // PHASE MANAGEMENT
  // ──────────────────────────────────────────────
  setPhase(n, animated = false) {
    this.phase = n;

    switch (n) {
      case 1:
        // Top-down desk — all items visible, plant + pot
        this._setDeskItemsOpacity(1, animated);
        this._setPotOpacity(1, animated);
        this._setPlantVisible(true);
        this._moveCamera({ x: 0, y: 3.6, z: 0.01 }, { x: 0, y: 0, z: 0 }, animated ? 1.8 : 0);
        this.controls.enabled = false;
        break;

      case 2:
        // Camera tilts toward front, desk items fading
        this._setDeskItemsOpacity(0, animated);
        this._setPotOpacity(1, animated);
        this._setPlantVisible(true);
        this._moveCamera({ x: 0, y: 2.4, z: 1.8 }, { x: 0, y: 0.9, z: 0 }, animated ? 1.8 : 0);
        this.controls.enabled = false;
        break;

      case 3:
        // Front view, plant + pot, desk hidden
        this._setDeskItemsOpacity(0, animated);
        this._setPotOpacity(1, animated);
        this._setPlantVisible(true);
        this._setDeskVisible(false);
        this._moveCamera({ x: 0, y: 0.9, z: 2.8 }, { x: 0, y: 0.9, z: 0 }, animated ? 1.2 : 0);
        this.controls.enabled = false;
        break;

      case 4:
        // Pot transparent — reveals roots inside
        this._setDeskItemsOpacity(0, animated);
        this._setPotOpacity(0.18, animated); // semi-transparent terracotta
        this._setPlantVisible(true);
        this.controls.enabled = false;
        break;

      case 5:
        // Soil falls, pot dissolved, roots bare
        this._setDeskItemsOpacity(0, false);
        this._setPotOpacity(0, false);
        this._setPlantVisible(true);
        if (this._scanGroup) this._scanGroup.visible = false;
        this.controls.enabled = false;
        break;

      case 6:
        // Holographic scan — cyan grid + sweep
        this._setDeskItemsOpacity(0, false);
        this._setPotOpacity(0, false);
        this._setPlantVisible(true);
        if (this._soilPS) this._soilPS.visible = false;
        if (this._scanGroup) {
          this._scanGroup.visible = true;
          this.setScanProgress(0);
        }
        this._moveCamera({ x: 0.25, y: 1.1, z: 2.5 }, { x: 0, y: 0.85, z: 0 }, animated ? 1.2 : 0);
        this.controls.enabled = false;
        break;

      case 7:
        // Soil particles swirl upward + word reveal
        this._setDeskItemsOpacity(0, false);
        this._setPotOpacity(0, false);
        this._setPlantVisible(true);
        if (this._scanGroup) this._scanGroup.visible = false;
        this._moveCamera({ x: 0, y: 0.9, z: 2.8 }, { x: 0, y: 0.9, z: 0 }, animated ? 0.8 : 0);
        this.controls.enabled = false;
        break;

      case 8:
        // Mode toggles — pot visible, material switching
        this._setDeskItemsOpacity(0, false);
        this._setPotOpacity(1, animated);
        this._setPlantVisible(true);
        this._setDeskVisible(false);
        if (this._soilPS) this._soilPS.visible = false;
        if (this._scanGroup) this._scanGroup.visible = false;
        this._moveCamera({ x: 0, y: 0.9, z: 2.8 }, { x: 0, y: 0.9, z: 0 }, animated ? 0.8 : 0);
        if (this._matMode !== 'thermal') this.setMaterialMode('thermal');
        this.controls.enabled = false;
        break;

      case 9:
        // Free orbit — clean hero shot
        this._setDeskItemsOpacity(0, false);
        this._setPotOpacity(1, animated);
        this._setPlantVisible(true);
        this._setDeskVisible(false);
        if (this._soilPS) this._soilPS.visible = false;
        if (this._scanGroup) this._scanGroup.visible = false;
        this.setMaterialMode('standard');
        this.controls.enabled     = true;
        this.controls.enableZoom  = false; // no scroll zoom (conflicts with Locomotive)
        this.controls.target.set(0, 0.9, 0);
        this.controls.update();
        break;
    }
  }

  // ──────────────────────────────────────────────
  // ROOTS CLIP MODE
  // Activates a horizontal clip plane at soilLine (y fraction of plant height)
  // to show only roots below the soil. No separate GLB file needed.
  // ──────────────────────────────────────────────
  rootsOnlyMode(soilLineFraction = 0.22) {
    if (!this.plantMesh) return;
    const box = new THREE.Box3().setFromObject(this.plantMesh);
    const cutY = box.min.y + (box.max.y - box.min.y) * soilLineFraction;
    // THREE.js global clipping planes
    this.renderer.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, -1, 0), cutY)];
    this.renderer.localClippingEnabled = true;
  }

  clearClipping() {
    this.renderer.clippingPlanes = [];
    this.renderer.localClippingEnabled = false;
  }

  // ──────────────────────────────────────────────
  // GROUP 3 INTEGRATION: returns plant center in
  // NDC space so sketch canvases can align
  // ──────────────────────────────────────────────
  getPlantNDC() {
    if (!this.plantModel) return null;
    const box = new THREE.Box3().setFromObject(this.plantModel);
    const center = new THREE.Vector3();
    box.getCenter(center);
    center.project(this.camera);
    return { x: center.x, y: center.y }; // -1..1
  }

  // ──────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────
  _setDeskItemsOpacity(opacity, animated) {
    this.deskItems.forEach(m => {
      if (!m.material) return;
      m.material.transparent = opacity < 1;
      if (animated) {
        this._lerp(m.material, 'opacity', opacity, 0.8);
      } else {
        m.material.opacity = opacity;
      }
    });
    if (this.deskPlane) {
      this.deskPlane.material.transparent = opacity < 1;
      if (animated) this._lerp(this.deskPlane.material, 'opacity', opacity, 0.8);
      else this.deskPlane.material.opacity = opacity;
    }
  }

  _setDeskVisible(v) {
    this.deskItems.forEach(m => { m.visible = v; });
    if (this.deskPlane) this.deskPlane.visible = v;
  }

  _setPotOpacity(opacity, animated) {
    if (!this.potMesh) return;
    if (animated) this._lerp(this.potMesh.material, 'opacity', opacity, 1.2);
    else this.potMesh.material.opacity = opacity;
    this.potMesh.material.transparent = opacity < 1;
  }

  _setPlantVisible(v) {
    if (this.plantMesh) this.plantMesh.visible = v;
  }

  // Simple linear interpolation tween using rAF chain
  _lerp(target, prop, to, duration) {
    const from = target[prop];
    const start = performance.now();
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / (duration * 1000));
      target[prop] = from + (to - from) * (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  _moveCamera(pos, tgt, duration) {
    if (duration === 0) {
      this.camera.position.set(pos.x, pos.y, pos.z);
      this.camera.lookAt(tgt.x, tgt.y, tgt.z);
      return;
    }
    const fromPos = this.camera.position.clone();
    const toPos   = new THREE.Vector3(pos.x, pos.y, pos.z);
    const fromTgt = this._camTarget.clone();
    const toTgt   = new THREE.Vector3(tgt.x, tgt.y, tgt.z);
    const start   = performance.now();
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / (duration * 1000));
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      this.camera.position.lerpVectors(fromPos, toPos, e);
      this._camTarget.lerpVectors(fromTgt, toTgt, e);
      this.camera.lookAt(this._camTarget);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    this._camTarget.copy(toTgt);
  }

  // ──────────────────────────────────────────────
  // SOIL PARTICLE SYSTEM — Phase 5 (fall) + Phase 7 (swirl)
  // ──────────────────────────────────────────────
  _createSoilParticles() {
    const COUNT = 420;
    const pos   = new Float32Array(COUNT * 3);
    const col   = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = Math.random() * 0.19, theta = Math.random() * Math.PI * 2;
      pos[i*3]   = Math.cos(theta) * r;
      pos[i*3+1] = 0.04 + Math.random() * 0.08;  // soil disk height
      pos[i*3+2] = Math.sin(theta) * r;
      col[i*3]   = 0.46 + Math.random() * 0.32;  // warm brown/terracotta
      col[i*3+1] = 0.22 + Math.random() * 0.14;
      col[i*3+2] = 0.06 + Math.random() * 0.06;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    this._soilGeo      = geo;
    this._soilRest     = pos.slice();
    this._soilVelY     = new Float32Array(COUNT);
    this._soilFalling  = false;
    this._soilSwirling = false;
    this._swirlTime    = 0;
    const mat = new THREE.PointsMaterial({
      size: 0.012, vertexColors: true, sizeAttenuation: true,
      transparent: true, opacity: 0.88,
    });
    this._soilPS         = new THREE.Points(geo, mat);
    this._soilPS.visible = false;
    this.scene.add(this._soilPS);
  }

  _startSoilFall() {
    if (!this._soilPS) return;
    this._resetSoilParticles();
    for (let i = 0; i < this._soilVelY.length; i++) {
      this._soilVelY[i] = -0.02 - Math.random() * 0.07;
    }
    this._soilFalling        = true;
    this._soilSwirling       = false;
    this._soilPS.material.opacity = 0.88;
    this._soilPS.visible     = true;
  }

  _startSoilSwirl() {
    if (!this._soilPS) return;
    this._soilFalling  = false;
    this._soilSwirling = true;
    this._swirlTime    = 0;
    this._soilPS.material.opacity = 0.88;
    // Scatter particles from below viewport, rising
    const pos = this._soilGeo.attributes.position.array;
    for (let i = 0, n = this._soilVelY.length; i < n; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 0.7;
      pos[i*3+1] = -1.5 - Math.random() * 0.5;
      pos[i*3+2] = (Math.random() - 0.5) * 0.7;
    }
    this._soilGeo.attributes.position.needsUpdate = true;
    this._soilPS.visible = true;
  }

  _resetSoilParticles() {
    if (!this._soilGeo) return;
    this._soilGeo.attributes.position.array.set(this._soilRest);
    this._soilVelY.fill(0);
    this._soilFalling  = false;
    this._soilSwirling = false;
    this._soilGeo.attributes.position.needsUpdate = true;
  }

  _updateSoilParticles(dt) {
    if (!this._soilPS?.visible) return;
    const pos = this._soilGeo.attributes.position.array;
    const vel = this._soilVelY;
    const n   = vel.length;

    if (this._soilFalling) {
      for (let i = 0; i < n; i++) {
        vel[i]     -= 1.7 * dt;
        pos[i*3+1] += vel[i] * dt;
        pos[i*3]   += (Math.random() - 0.5) * 0.002;
        pos[i*3+2] += (Math.random() - 0.5) * 0.002;
      }
      this._soilGeo.attributes.position.needsUpdate = true;
    }

    if (this._soilSwirling) {
      this._swirlTime += dt;
      const now = performance.now() * 0.0016;
      for (let i = 0; i < n; i++) {
        const px = pos[i*3], py = pos[i*3+1], pz = pos[i*3+2];
        const dx = -px, dy = 1.1 - py, dz = -pz;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.001;
        const spd  = Math.min(2.8, 0.8 + this._swirlTime * 0.38) * dt;
        const spiralR = Math.max(0, 0.06 - this._swirlTime * 0.009);
        const ang = now + i * 0.088;
        pos[i*3]   += dx / dist * spd + Math.cos(ang) * spiralR;
        pos[i*3+1] += dy / dist * spd;
        pos[i*3+2] += dz / dist * spd + Math.sin(ang) * spiralR;
      }
      this._soilGeo.attributes.position.needsUpdate = true;
      if (this._swirlTime > 2.4) {
        const fade = Math.max(0, 1 - (this._swirlTime - 2.4) / 1.4);
        this._soilPS.material.opacity = fade * 0.88;
        if (fade <= 0.01) {
          this._soilPS.visible   = false;
          this._soilSwirling     = false;
        }
      }
    }
  }

  // ──────────────────────────────────────────────
  // HOLOGRAPHIC SCAN GRID — Phase 6
  // ──────────────────────────────────────────────
  _createScanGrid() {
    const grp  = new THREE.Group();
    const mkMat = (color, op) => new THREE.LineBasicMaterial({
      color, transparent: true, opacity: op,
    });
    const W = 1.1, H = 1.85, rows = 26, cols = 16;

    // Horizontal scan lines (cyan)
    for (let r = 0; r <= rows; r++) {
      const y   = (r / rows) * H;
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-W/2, y, 0), new THREE.Vector3(W/2, y, 0),
      ]);
      grp.add(new THREE.Line(geo, mkMat(0x00ccff, 0.20)));
    }
    // Vertical grid lines (blue)
    for (let c = 0; c <= cols; c++) {
      const x   = (c / cols) * W - W/2;
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, 0, 0), new THREE.Vector3(x, H, 0),
      ]);
      grp.add(new THREE.Line(geo, mkMat(0x0055ff, 0.13)));
    }

    // Glowing sweep plane
    this._scanSweep = new THREE.Mesh(
      new THREE.PlaneGeometry(W + 0.1, 0.045),
      new THREE.MeshBasicMaterial({
        color: 0x00eeff, transparent: true, opacity: 0.82,
        side: THREE.DoubleSide,
      }),
    );
    this._scanSweep.position.set(0, 0, 0.006);
    grp.add(this._scanSweep);

    // Anatomical marker dots (appear as sweep passes)
    const dotSpec = [[0, 1.55], [0.24, 1.08], [-0.2, 0.72], [0.12, 0.42], [-0.06, 1.7]];
    this._scanDots = dotSpec.map(([x, y]) => {
      const m   = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.01, 8), m);
      dot.position.set(x, y, 0.009);
      grp.add(dot);
      return dot;
    });

    grp.position.set(0, 0, 0.08);   // slightly in front of plant
    grp.visible      = false;
    this._scanGroup  = grp;
    this.scene.add(grp);
  }

  // Drive scan sweep from progress 0→1 (bottom → top of plant)
  setScanProgress(t) {
    if (!this._scanSweep) return;
    this._scanSweep.position.y = t * 1.85;
    this._scanDots?.forEach(dot => {
      const dotY   = dot.position.y;
      const sweepY = this._scanSweep.position.y;
      const frac   = sweepY > dotY - 0.08
        ? Math.min(1, (sweepY - dotY + 0.1) * 12)
        : 0;
      dot.material.opacity = frac;
    });
  }

  // ──────────────────────────────────────────────
  // MATERIAL MODES — Phase 8 (thermal / xray / wireframe)
  // ──────────────────────────────────────────────
  _storeMaterials() {
    this._origPlantMat = this.plantMesh?.material.clone() ?? null;
    this._origPotMat   = this.potMesh?.material.clone()   ?? null;
  }

  setMaterialMode(mode) {
    if (!this.plantMesh) return;
    this._matMode = mode;
    switch (mode) {
      case 'standard':
        if (this._origPlantMat) {
          this.plantMesh.material = this._origPlantMat.clone();
          this.plantMesh.material.wireframe = false;
        }
        if (this.potMesh && this._origPotMat) {
          this.potMesh.material = this._origPotMat.clone();
          this.potMesh.material.wireframe    = false;
          this.potMesh.material.transparent  = true;
          this.potMesh.material.opacity      = 1;
        }
        this.clearClipping();
        break;

      case 'thermal':
        this.plantMesh.material = new THREE.MeshStandardMaterial({
          color: 0xff5500, emissive: 0xcc1100, emissiveIntensity: 0.45,
          roughness: 0.28, metalness: 0.08,
        });
        if (this.potMesh) this.potMesh.material = new THREE.MeshStandardMaterial({
          color: 0xff8800, emissive: 0x441100, emissiveIntensity: 0.3, roughness: 0.4,
        });
        break;

      case 'xray':
        this.plantMesh.material = new THREE.MeshStandardMaterial({
          color: 0x44aaff, emissive: 0x0022cc, emissiveIntensity: 0.55,
          transparent: true, opacity: 0.50, roughness: 0.06, metalness: 0.9,
        });
        if (this.potMesh) this.potMesh.material = new THREE.MeshStandardMaterial({
          color: 0x2266cc, transparent: true, opacity: 0.20, roughness: 0.1,
        });
        break;

      case 'wireframe':
        this.plantMesh.material = new THREE.MeshBasicMaterial({
          color: 0x00ff88, wireframe: true,
        });
        if (this.potMesh) this.potMesh.material = new THREE.MeshBasicMaterial({
          color: 0x004422, wireframe: true, transparent: true, opacity: 0.44,
        });
        break;
    }
  }

  // ──────────────────────────────────────────────
  // SCROLL-DRIVEN PHASE CONTROLLER
  // Called from main.js loco.on('scroll', ...) handler
  // t = 0→1 across the full story section scroll room
  // Returns current phase number so overlays can be updated
  // ──────────────────────────────────────────────
  setScrollProgress(t) {
    const zones = [
      { s: 0.00, e: 0.10, p: 1 },
      { s: 0.10, e: 0.22, p: 2 },
      { s: 0.22, e: 0.36, p: 3 },
      { s: 0.36, e: 0.48, p: 4 },
      { s: 0.48, e: 0.62, p: 5 },
      { s: 0.62, e: 0.74, p: 6 },
      { s: 0.74, e: 0.84, p: 7 },
      { s: 0.84, e: 0.93, p: 8 },
      { s: 0.93, e: 1.00, p: 9 },
    ];
    let zone = zones[0];
    for (const z of zones) if (t >= z.s) zone = z;

    const newPhase = zone.p;
    if (newPhase !== this.phase) this.setPhase(newPhase, false);

    // Sub-phase: drive scan sweep progress
    if (newPhase === 6) {
      const pct = Math.max(0, Math.min(1, (t - zone.s) / (zone.e - zone.s)));
      this.setScanProgress(pct);
    }

    // Sub-phase: trigger soil fall once on entering phase 5
    if (newPhase === 5 && !this._soilFalling && !this._soilSwirling) {
      this._startSoilFall();
    }
    // Sub-phase: trigger swirl once on entering phase 7
    if (newPhase === 7 && !this._soilSwirling) {
      this._startSoilSwirl();
    }

    return newPhase;
  }

  _onResize(canvas) {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  _loop() {
    this._raf = requestAnimationFrame(() => this._loop());
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this._updateSoilParticles(dt);
    if (this.controls.enabled) this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    cancelAnimationFrame(this._raf);
    this.renderer.dispose();
  }
}
