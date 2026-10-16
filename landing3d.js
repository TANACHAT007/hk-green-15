// Showcase page: the hero render turns into a live 3D model on demand (same GLB as the dashboard, meshopt 2.4 MB).
import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { MeshoptDecoder } from './vendor/meshopt_decoder.module.js';
import { mergeGeometries } from './vendor/BufferGeometryUtils.js';

export function mount(host, onProgress) {
  return new Promise((resolve, reject) => {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(1.5, devicePixelRatio || 1)); r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.1;
    const scene = new THREE.Scene();
    scene.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture;
    scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d6ff, 0.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.3); sun.position.set(600, 1400, 900); scene.add(sun);
    const cam = new THREE.PerspectiveCamera(32, 1, 5, 20000);
    const ctl = new OrbitControls(cam, r.domElement);
    Object.assign(ctl, { enableDamping: true, dampingFactor: 0.08, autoRotate: true, autoRotateSpeed: 1.2, enablePan: false, maxPolarAngle: Math.PI * 0.52 });
    ctl.target.set(420, 440, -170); cam.position.set(-1150, 1250, 1850);
    if (host.clientWidth < 520) cam.position.lerp(ctl.target, 0.28);   // phones: closer, the model fills the hero
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
      // ~600 CAD meshes → one mesh per material (a few dozen draw calls): smooth on phones. No picking needed here.
      const groups = new Map(); m.updateMatrixWorld(true);
      m.traverse((o) => {
        if (!o.isMesh) return; const g = o.geometry, mt = o.material, c = mt.color ? mt.color.getHex() : 0;
        const key = [c, mt.opacity.toFixed(2), mt.transparent, (mt.metalness || 0).toFixed(1), (mt.roughness || 0).toFixed(1)].join('|');
        const pa = g.attributes.position, n = pa.count, pos = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { pos[i * 3] = pa.getX(i); pos[i * 3 + 1] = pa.getY(i); pos[i * 3 + 2] = pa.getZ(i); }
        const ng = new THREE.BufferGeometry(); ng.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        ng.setIndex(g.index ? new THREE.BufferAttribute(Uint32Array.from({ length: g.index.count }, (_, i) => g.index.getX(i)), 1)
                            : new THREE.BufferAttribute(Uint32Array.from({ length: n }, (_, i) => i), 1));
        ng.applyMatrix4(o.matrixWorld); ng.computeVertexNormals();
        if (!groups.has(key)) groups.set(key, { mt, list: [] }); groups.get(key).list.push(ng);
      });
      scene.remove(m);
      for (const { mt, list } of groups.values()) { const mg = mergeGeometries(list, false); if (mg) scene.add(new THREE.Mesh(mg, mt)); list.forEach((x) => x.dispose()); }
      host.appendChild(r.domElement); size(); new ResizeObserver(size).observe(host);
      ctl.addEventListener('start', () => { ctl.autoRotate = false; });
      let vis = true; new IntersectionObserver((es) => { vis = es[0].isIntersecting; }).observe(host);   // no work while scrolled away
      (function loop() { requestAnimationFrame(loop); if (!vis || document.hidden) return; ctl.update(); r.render(scene, cam); })();
      resolve();
    }, (e) => e.total && onProgress && onProgress(e.loaded / e.total), reject);
  });
}
