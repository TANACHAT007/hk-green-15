// Showcase page: the hero render turns into a live 3D model on demand (same GLB as the dashboard, meshopt 2.4 MB).
import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { MeshoptDecoder } from './vendor/meshopt_decoder.module.js';

export function mount(host, onProgress) {
  return new Promise((resolve, reject) => {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(2, devicePixelRatio || 1)); r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.1;
    const scene = new THREE.Scene();
    scene.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture;
    scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d6ff, 0.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.3); sun.position.set(600, 1400, 900); scene.add(sun);
    const cam = new THREE.PerspectiveCamera(32, 1, 5, 20000);
    const ctl = new OrbitControls(cam, r.domElement);
    Object.assign(ctl, { enableDamping: true, dampingFactor: 0.08, autoRotate: true, autoRotateSpeed: 1.2, enablePan: false, maxPolarAngle: Math.PI * 0.52 });
    ctl.target.set(420, 440, -170); cam.position.set(-1150, 1250, 1850);
    const size = () => { const w = host.clientWidth, h = host.clientHeight; r.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load('model/hk-green-15.glb', (g) => {
      const m = g.scene; m.scale.setScalar(1000); m.rotation.x = -Math.PI / 2;
      m.traverse((o) => { if (!o.isMesh) return; const mt = o.material = o.material.clone(); mt.side = THREE.DoubleSide;
        if (mt.roughness !== undefined) mt.roughness = Math.max(0.35, mt.roughness);
        if (/Acrylic/.test(o.parent && o.parent.name || '') ) Object.assign(mt, { transparent: true, opacity: 0.25, depthWrite: false }); });
      scene.add(m); m.updateMatrixWorld(true);
      let best = null;                                       // lay the real UI over the green CAD screen
      m.traverse((o) => { if (!o.isMesh || !o.material.color) return; const c = o.material.color;
        if (!(c.g > c.r * 1.4 && c.g > c.b * 1.3)) return;
        const b = new THREE.Box3().setFromObject(o), s = b.getSize(new THREE.Vector3());
        if (s.z < 3 && s.x > 80 && (!best || s.x * s.y > best.a)) best = { b, s, a: s.x * s.y }; });
      if (best) { const t = new THREE.TextureLoader().load('img/display_02_home_drip.png'); t.colorSpace = THREE.SRGBColorSpace;
        const p = new THREE.Mesh(new THREE.PlaneGeometry(best.s.x, best.s.x * 0.6), new THREE.MeshBasicMaterial({ map: t, toneMapped: false }));
        const c = best.b.getCenter(new THREE.Vector3()); p.position.set(c.x, c.y, best.b.max.z + 0.6); scene.add(p); }
      host.appendChild(r.domElement); size(); new ResizeObserver(size).observe(host);
      ctl.addEventListener('start', () => { ctl.autoRotate = false; });
      (function loop() { requestAnimationFrame(loop); ctl.update(); r.render(scene, cam); })();
      resolve();
    }, (e) => e.total && onProgress && onProgress(e.loaded / e.total), reject);
  });
}
