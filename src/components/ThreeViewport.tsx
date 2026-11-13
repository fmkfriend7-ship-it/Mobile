import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { Maximize2, Minimize2, Pause, Play, RotateCcw } from 'lucide-react';
import { PartId, PhoneColorOption, SHOWCASE_FINISHES } from '../data/catalog';
import {
  BuiltPhoneRig,
  applyExplodeFactor,
  applyPhoneFinish,
  buildCompleteSmartphone,
  buildSinglePartShowcase,
  disposeObject3D,
  highlightSelectedPart,
} from '../three/phoneBuilder';

export type CameraViewPreset = '360' | 'front' | 'back' | 'side' | 'camera-zoom';

interface ThreeViewportProps {
  mode: 'hero' | 'cinema' | 'parts' | 'technology' | 'card-preview';
  finish?: PhoneColorOption;
  cameraCount?: 2 | 3;
  modelLabel?: string;
  cameraPreset?: CameraViewPreset;
  explodeAmount?: number; // 0 to 1
  isolatedPartId?: PartId | null;
  selectedPartId?: PartId | null;
  onSelectPart?: (partId: PartId | null) => void;
  enablePartPicking?: boolean;
  showVideoControls?: boolean;
  autoPlay?: boolean;
  videoTitle?: string;
  className?: string;
  backgroundHex?: string;
  bottomControlBar?: React.ReactNode;
}

const _mouseVec = new THREE.Vector2();
const _targetCamPos = new THREE.Vector3();
const _targetControlsLook = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.28)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function getPresetPose(preset: CameraViewPreset): {
  pos: [number, number, number];
  look: [number, number, number];
} {
  switch (preset) {
    case 'front':
      return { pos: [0, 0.05, 3.65], look: [0, 0, 0] };
    case 'back':
      return { pos: [0, 0.1, -3.65], look: [0, 0, 0] };
    case 'side':
      return { pos: [3.4, 0.15, 0.65], look: [0, 0, 0] };
    case 'camera-zoom':
      return { pos: [0.65, 0.95, -2.05], look: [0.22, 0.76, -0.08] };
    case '360':
    default:
      return { pos: [2.1, 0.45, 3.15], look: [0, 0, 0] };
  }
}

export const ThreeViewport: React.FC<ThreeViewportProps> = ({
  mode,
  finish = SHOWCASE_FINISHES[0],
  cameraCount = 3,
  modelLabel = 'iPhone 17 Pro',
  cameraPreset = '360',
  explodeAmount = 0,
  isolatedPartId = null,
  selectedPartId = null,
  onSelectPart,
  enablePartPicking = false,
  showVideoControls = false,
  autoPlay = true,
  videoTitle,
  className = '',
  backgroundHex = '#09090B',
  bottomControlBar,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredPart, setHoveredPart] = useState<PartId | null>(null);
  const [progressPct, setProgressPct] = useState(0);
  const [contextLost, setContextLost] = useState(false);

  // Mutable state refs so React UI updates never tear down WebGL
  const isPlayingRef = useRef(isPlaying);
  const explodeTargetRef = useRef(explodeAmount);
  const currentExplodeRef = useRef(explodeAmount);
  const selectedPartRef = useRef<PartId | null>(selectedPartId);
  const hoveredPartRef = useRef<PartId | null>(null);
  const onSelectPartRef = useRef(onSelectPart);
  const cameraPresetRef = useRef<CameraViewPreset>(cameraPreset);
  const cameraAnimatingRef = useRef(false);
  const cycleAngleRef = useRef(0);
  const requestRenderFnRef = useRef<(() => void) | null>(null);

  // Scene refs for live updates without re-mounting WebGL
  const rigRef = useRef<BuiltPhoneRig | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const isSoftwareGlRef = useRef<boolean>(false);
  const isolatedTexturesRef = useRef<THREE.Texture[]>([]);

  isPlayingRef.current = isPlaying;
  explodeTargetRef.current = explodeAmount;
  selectedPartRef.current = selectedPartId;
  onSelectPartRef.current = onSelectPart;

  // Sync camera preset changes smoothly
  useEffect(() => {
    cameraPresetRef.current = cameraPreset;
    cameraAnimatingRef.current = true;
    requestRenderFnRef.current?.();
  }, [cameraPreset]);

  // Sync explode slider changes
  useEffect(() => {
    requestRenderFnRef.current?.();
  }, [explodeAmount]);

  // Sync finish color changes in-place
  useEffect(() => {
    if (rigRef.current) {
      applyPhoneFinish(rigRef.current, finish);
      requestRenderFnRef.current?.();
    }
  }, [finish]);

  // Sync selected part highlight
  useEffect(() => {
    if (rigRef.current) {
      highlightSelectedPart(rigRef.current.partsMap, selectedPartId, hoveredPartRef.current);
      requestRenderFnRef.current?.();
    }
  }, [selectedPartId]);

  // Swap isolated part mesh when in 'parts' mode with isolatedPartId
  useEffect(() => {
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    if (!scene || !renderer || mode !== 'parts') return;

    // Clean up existing model
    if (modelGroupRef.current) {
      scene.remove(modelGroupRef.current);
      disposeObject3D(modelGroupRef.current);
      modelGroupRef.current = null;
    }
    if (rigRef.current) {
      rigRef.current.textures.forEach((t) => t.dispose());
      rigRef.current = null;
    }
    isolatedTexturesRef.current.forEach((t) => t.dispose());
    isolatedTexturesRef.current = [];

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    if (isolatedPartId) {
      const built = buildSinglePartShowcase({
        partId: isolatedPartId,
        finish,
        maxAnisotropy: maxAniso,
        isSoftwareGl: isSoftwareGlRef.current,
      });
      modelGroupRef.current = built.root;
      isolatedTexturesRef.current = built.textures;
      scene.add(built.root);
    } else {
      const rig = buildCompleteSmartphone({
        finish,
        maxAnisotropy: maxAniso,
        isSoftwareGl: isSoftwareGlRef.current,
        cameraCount,
        modelLabel,
      });
      rigRef.current = rig;
      modelGroupRef.current = rig.root;
      applyExplodeFactor(rig.partsMap, currentExplodeRef.current);
      scene.add(rig.root);
    }
    requestRenderFnRef.current?.();
  }, [isolatedPartId, mode, cameraCount, modelLabel]);

  // Listen to native fullscreen exit
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!wrapperRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await wrapperRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fallback CSS fullscreen overlay if iframe disallows native fullscreen
      setIsFullscreen((prev) => !prev);
    }
  };

  const resetCamera = () => {
    cameraPresetRef.current = '360';
    cameraAnimatingRef.current = true;
    cycleAngleRef.current = 0;
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.set(0, 0, 0);
    }
    requestRenderFnRef.current?.();
  };

  // Main Three.js Scene Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    isSoftwareGlRef.current = isSoftwareGl;

    const width = Math.max(container.clientWidth, 300);
    const height = Math.max(container.clientHeight, 260);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    const bgColor = new THREE.Color(backgroundHex);
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2(bgColor.getHex(), 0.045);
    sceneRef.current = scene;

    // Procedural Studio Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    const initialPose = getPresetPose(cameraPresetRef.current);
    camera.position.set(...initialPose.pos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 1.65;
    controls.maxDistance = 6.5;
    controls.target.set(...initialPose.look);

    controls.addEventListener('start', () => {
      cameraAnimatingRef.current = false;
    });

    // Studio 3-Point Lighting
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1c1917, 0.75);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4dc, 2.2);
    keyLight.position.set(3.8, 5.2, 4.2);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 16;
    keyLight.shadow.camera.left = -2.5;
    keyLight.shadow.camera.right = 2.5;
    keyLight.shadow.camera.top = 2.5;
    keyLight.shadow.camera.bottom = -2.5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xfde68a, 1.45);
    rimLight.position.set(-4.2, 2.4, -3.5);
    scene.add(rimLight);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softbox = new THREE.RectAreaLight(0xfff8e7, 4.5, 3.5, 5.0);
      softbox.position.set(-3.2, 1.8, 2.8);
      softbox.lookAt(0, 0, 0);
      scene.add(softbox);
    }

    // Contact shadow plane beneath smartphone
    const shadowTex = createContactShadowTexture();
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 3.2),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.65,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.48;
    scene.add(shadowPlane);

    // Subtle brushed gold ring on floor stage
    const stageRingGeo = new THREE.RingGeometry(1.18, 1.21, 64);
    const stageRingMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const stageRing = new THREE.Mesh(stageRingGeo, stageRingMat);
    stageRing.rotation.x = -Math.PI / 2;
    stageRing.position.y = -1.46;
    scene.add(stageRing);

    // Build initial 3D model
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    if (mode === 'parts' && isolatedPartId) {
      const built = buildSinglePartShowcase({
        partId: isolatedPartId,
        finish,
        maxAnisotropy: maxAniso,
        isSoftwareGl,
      });
      modelGroupRef.current = built.root;
      isolatedTexturesRef.current = built.textures;
      scene.add(built.root);
    } else {
      const rig = buildCompleteSmartphone({
        finish,
        maxAnisotropy: maxAniso,
        isSoftwareGl,
        cameraCount,
        modelLabel,
      });
      rigRef.current = rig;
      modelGroupRef.current = rig.root;
      applyExplodeFactor(rig.partsMap, currentExplodeRef.current);
      scene.add(rig.root);
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting for component selection
    const raycaster = new THREE.Raycaster();
    let lastHoverTime = 0;
    let pointerDownPos = { x: 0, y: 0 };

    const updateMouseFromEvent = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!enablePartPicking || !modelGroupRef.current) return;
      const now = performance.now();
      if (now - lastHoverTime < 45) return;
      lastHoverTime = now;

      updateMouseFromEvent(e);
      raycaster.setFromCamera(_mouseVec, camera);
      const hits = raycaster.intersectObjects(modelGroupRef.current.children, true);
      const hitPart = (hits.find((h) => h.object.userData.partId)?.object.userData.partId as PartId) || null;

      if (hitPart !== hoveredPartRef.current) {
        hoveredPartRef.current = hitPart;
        setHoveredPart(hitPart);
        renderer.domElement.style.cursor = hitPart ? 'pointer' : 'grab';
        if (rigRef.current) {
          highlightSelectedPart(rigRef.current.partsMap, selectedPartRef.current, hitPart);
        }
        requestRender();
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!enablePartPicking || !modelGroupRef.current) return;
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.hypot(dx, dy) > 6) return; // Ignore orbit drags

      updateMouseFromEvent(e);
      raycaster.setFromCamera(_mouseVec, camera);
      const hits = raycaster.intersectObjects(modelGroupRef.current.children, true);
      const hitPart = (hits.find((h) => h.object.userData.partId)?.object.userData.partId as PartId) || null;
      if (hitPart && onSelectPartRef.current) {
        onSelectPartRef.current(hitPart);
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // ResizeObserver for crisp responsive sizing
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(entry.contentRect.width, 200);
      const h = Math.max(entry.contentRect.height, 200);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    });
    resizeObserver.observe(container);

    // Pacing & Render Loop
    let frameId = 0;
    let disposed = false;
    let lastTime = performance.now();
    let renderBusy = false;
    let renderDirty = false;

    function afterDraw(cb: () => void) {
      if (disposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) {
            if (sync) gl.deleteSync(sync);
            return;
          }
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function stepSimulation(delta: number) {
      // Smooth explode transition
      if (rigRef.current && Math.abs(currentExplodeRef.current - explodeTargetRef.current) > 0.001) {
        currentExplodeRef.current = THREE.MathUtils.damp(
          currentExplodeRef.current,
          explodeTargetRef.current,
          6.5,
          delta
        );
        applyExplodeFactor(rigRef.current.partsMap, currentExplodeRef.current);
      }

      // Smooth camera preset transitions
      if (cameraAnimatingRef.current) {
        const pose = getPresetPose(cameraPresetRef.current);
        _targetCamPos.set(...pose.pos);
        _targetControlsLook.set(...pose.look);

        camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, 5.5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, 5.5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, 5.5, delta);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _targetControlsLook.x, 5.5, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _targetControlsLook.y, 5.5, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _targetControlsLook.z, 5.5, delta);

        if (camera.position.distanceTo(_targetCamPos) < 0.025) {
          cameraAnimatingRef.current = false;
        }
      }

      // Continuous rotation when playing
      if (isPlayingRef.current && modelGroupRef.current) {
        const speed = mode === 'card-preview' ? 0.55 : 0.48;
        cycleAngleRef.current = (cycleAngleRef.current + delta * speed) % (Math.PI * 2);

        if (cameraPresetRef.current === '360' || mode === 'parts' || mode === 'hero' || mode === 'card-preview') {
          modelGroupRef.current.rotation.y = cycleAngleRef.current;
          modelGroupRef.current.position.y = Math.sin(cycleAngleRef.current * 2) * 0.045;
        } else if (cameraPresetRef.current === 'camera-zoom') {
          modelGroupRef.current.rotation.y = Math.sin(cycleAngleRef.current * 2) * 0.14;
        } else {
          modelGroupRef.current.rotation.y = Math.sin(cycleAngleRef.current) * 0.18;
        }

        if (showVideoControls) {
          setProgressPct(Math.round((cycleAngleRef.current / (Math.PI * 2)) * 100));
        }
      }

      controls.update();
    }

    function requestRender() {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (disposed) return;
        renderDirty = false;
        const now = performance.now();
        const delta = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        stepSimulation(delta);
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (!disposed && (renderDirty || isPlayingRef.current || cameraAnimatingRef.current || Math.abs(currentExplodeRef.current - explodeTargetRef.current) > 0.002)) {
            requestRender();
          }
        };

        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    requestRenderFnRef.current = requestRender;
    controls.addEventListener('change', requestRender);
    requestRender();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      if (modelGroupRef.current) {
        disposeObject3D(modelGroupRef.current);
      }
      if (rigRef.current) {
        rigRef.current.textures.forEach((t) => t.dispose());
      }
      isolatedTexturesRef.current.forEach((t) => t.dispose());
      shadowTex.dispose();
      shadowPlane.geometry.dispose();
      (shadowPlane.material as THREE.Material).dispose();
      stageRingGeo.dispose();
      stageRingMat.dispose();
      envTex.dispose();
      renderer.dispose();
    };
  }, [backgroundHex, enablePartPicking, mode, showVideoControls]);

  // Kick render loop whenever play state resumes
  useEffect(() => {
    if (isPlaying) {
      requestRenderFnRef.current?.();
    }
  }, [isPlaying]);

  const formatCycleTime = (pct: number) => {
    const totalSec = Math.round((pct / 100) * 12);
    return `00:${totalSec.toString().padStart(2, '0')} / 00:12`;
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden bg-[#09090B] select-none ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : ''
      } ${className}`}
    >
      {/* Dedicated WebGL Mount Container */}
      <div ref={mountRef} className="h-full w-full" />

      {/* WebGL Context Lost Graceful Fallback */}
      {contextLost && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#09090B] p-6 text-center">
          <img
            src={finish.image}
            alt={modelLabel}
            referrerPolicy="no-referrer"
            className="mb-4 h-48 w-auto rounded-xl object-cover opacity-80"
          />
          <p className="text-sm font-medium text-[#D4AF37]">
            3D Viewport paused — restoring hardware studio context
          </p>
        </div>
      )}

      {/* Subtle hover part label when raycasting */}
      {enablePartPicking && hoveredPart && (
        <div className="pointer-events-none absolute top-4 left-4 z-10 rounded-lg border border-[#D4AF37]/40 bg-[#09090B]/90 px-3 py-1.5 text-xs font-medium text-[#FAFAFA]">
          Click to inspect: <span className="text-[#D4AF37] capitalize">{hoveredPart.replace('-', ' ')}</span>
        </div>
      )}

      {/* Cinema / Video Player Transport Controls (Play, Pause, Full Screen) */}
      {showVideoControls && (
        <div className="absolute right-4 bottom-4 left-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#09090B]/92 px-4 py-2.5 text-[#FAFAFA]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              aria-label={isPlaying ? 'Pause 3D Video' : 'Play 3D Video'}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37] text-[#09090B] transition-transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-0.5" />}
            </button>
            <button
              type="button"
              onClick={resetCamera}
              aria-label="Reset 3D View"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-[#141418] text-[#FAFAFA] transition-colors hover:border-[#D4AF37]/60 hover:text-[#D4AF37]"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-[#FAFAFA]">
                {videoTitle || `${modelLabel} · 3D Studio Reel`}
              </div>
              <div className="font-mono-tabular text-[11px] text-[#A1A1AA]">
                {isPlaying ? 'Playing' : 'Paused'} · {formatCycleTime(progressPct)}
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-3 px-2 sm:max-w-xs">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-[#D4AF37] transition-[width] duration-150"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-[#141418] px-3 text-xs font-medium text-[#FAFAFA] whitespace-nowrap shrink-0 transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Full Screen</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Optional Collapsible Bottom Control Dock (for Technology Explorer) */}
      {bottomControlBar}
    </div>
  );
};
