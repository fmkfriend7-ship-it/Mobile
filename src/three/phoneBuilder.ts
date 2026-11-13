import * as THREE from 'three';
import { MOBILE_PARTS, PartId, PhoneColorOption } from '../data/catalog';

function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

function createExtrudedRoundedBox(
  width: number,
  height: number,
  depth: number,
  radius: number,
  bevelThickness = 0.012,
  bevelSize = 0.012,
  curveSegments = 16
): THREE.ExtrudeGeometry {
  const shape = createRoundedRectShape(width, height, radius);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevelThickness > 0 && bevelSize > 0,
    bevelThickness,
    bevelSize,
    bevelSegments: 4,
    curveSegments,
  });
  geo.center();
  return geo;
}

function createScreenTexture(maxAnisotropy: number, modelLabel = 'FMK PRO'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep luxury obsidian + gold radial silk gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 512, 1024);
  bgGrad.addColorStop(0, '#070709');
  bgGrad.addColorStop(0.42, '#14110A');
  bgGrad.addColorStop(0.7, '#2A200B');
  bgGrad.addColorStop(1, '#09090B');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 1024);

  // Subtle flowing golden ribbon curves
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(212, 175, 55, ${0.12 + i * 0.04})`;
    ctx.lineWidth = 2.5;
    ctx.moveTo(-40, 420 + i * 55);
    ctx.bezierCurveTo(160, 260 + i * 40, 320, 740 - i * 35, 560, 520 + i * 30);
    ctx.stroke();
  }

  // Soft gold ambient glow sphere
  const orb = ctx.createRadialGradient(256, 540, 20, 256, 540, 240);
  orb.addColorStop(0, 'rgba(229, 193, 88, 0.35)');
  orb.addColorStop(0.55, 'rgba(212, 175, 55, 0.08)');
  orb.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = orb;
  ctx.fillRect(0, 0, 512, 1024);

  // Dynamic Island pill at top
  ctx.fillStyle = '#030304';
  ctx.beginPath();
  ctx.roundRect(186, 26, 140, 36, 18);
  ctx.fill();
  ctx.fillStyle = '#182438';
  ctx.beginPath();
  ctx.arc(298, 44, 7, 0, Math.PI * 2);
  ctx.fill();

  // Status icons
  ctx.fillStyle = 'rgba(250, 250, 250, 0.85)';
  ctx.font = '600 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('5G', 42, 50);

  // Battery icon top right
  ctx.strokeStyle = 'rgba(250, 250, 250, 0.85)';
  ctx.lineWidth = 2;
  ctx.strokeRect(434, 37, 34, 16);
  ctx.fillStyle = '#D4AF37';
  ctx.fillRect(437, 40, 26, 10);

  // Lockscreen Clock
  ctx.fillStyle = '#FAFAFA';
  ctx.font = '600 112px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('09:41', 256, 215);

  ctx.fillStyle = '#D4AF37';
  ctx.font = '500 20px sans-serif';
  ctx.fillText('FMK MOBILE STORE · FARIA', 256, 258);

  // Bottom dock pill
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.roundRect(76, 895, 360, 76, 30);
  ctx.fill();

  ctx.fillStyle = '#D4AF37';
  ctx.font = '600 16px sans-serif';
  ctx.fillText(modelLabel.toUpperCase(), 256, 940);

  // Home indicator bar
  ctx.fillStyle = 'rgba(250, 250, 250, 0.85)';
  ctx.beginPath();
  ctx.roundRect(176, 996, 160, 6, 3);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

function createBatteryTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#151518';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle brushed aluminum sheen
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, 464, 464);

  ctx.fillStyle = '#D4AF37';
  ctx.font = '700 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FMK POWER CELL', 256, 150);

  ctx.fillStyle = '#FAFAFA';
  ctx.font = '600 44px monospace';
  ctx.fillText('4,850 mAh', 256, 235);

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '500 20px monospace';
  ctx.fillText('3.88V · 18.82Wh · LI-ION', 256, 290);
  ctx.fillText('THERMAL GUARD · MAGSAFE', 256, 330);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

function createPcbTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0D1310';
  ctx.fillRect(0, 0, 512, 512);

  // Gold copper circuit traces
  ctx.strokeStyle = '#B8922E';
  ctx.lineWidth = 2;
  for (let i = 0; i < 32; i++) {
    const y = 16 + i * 15;
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(140 + ((i * 37) % 120), y);
    ctx.lineTo(180 + ((i * 37) % 120), y + (i % 2 === 0 ? 18 : -18));
    ctx.lineTo(490, y + (i % 2 === 0 ? 18 : -18));
    ctx.stroke();
  }

  // Micro SMD pads
  ctx.fillStyle = '#D4AF37';
  for (let x = 40; x < 480; x += 48) {
    for (let y = 40; y < 480; y += 56) {
      ctx.fillRect(x, y, 8, 5);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

function createChipTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#111115';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 6;
  ctx.strokeRect(12, 12, 232, 232);

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
  ctx.lineWidth = 2;
  for (let i = 30; i <= 226; i += 14) {
    ctx.beginPath();
    ctx.moveTo(i, 14);
    ctx.lineTo(i, 36);
    ctx.moveTo(i, 220);
    ctx.lineTo(i, 242);
    ctx.stroke();
  }

  ctx.fillStyle = '#D4AF37';
  ctx.font = '700 30px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('FMK', 128, 114);
  ctx.fillStyle = '#FAFAFA';
  ctx.font = '600 20px monospace';
  ctx.fillText('A-PRO 2nm', 128, 148);
  ctx.fillStyle = '#A1A1AA';
  ctx.font = '500 13px monospace';
  ctx.fillText('NEURAL CORE', 128, 176);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

function tagPartHierarchy(group: THREE.Object3D, partId: PartId) {
  group.userData.partId = partId;
  group.traverse((child) => {
    child.userData.partId = partId;
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

export interface BuiltPhoneRig {
  root: THREE.Group;
  partsMap: Map<PartId, THREE.Group>;
  frameMaterials: THREE.MeshPhysicalMaterial[];
  backMaterials: THREE.MeshPhysicalMaterial[];
  accentMaterials: THREE.MeshStandardMaterial[];
  screenMaterial: THREE.MeshStandardMaterial;
  textures: THREE.Texture[];
}

export function buildCompleteSmartphone(options: {
  finish: PhoneColorOption;
  maxAnisotropy: number;
  isSoftwareGl: boolean;
  cameraCount?: 2 | 3;
  modelLabel?: string;
}): BuiltPhoneRig {
  const {
    finish,
    maxAnisotropy,
    isSoftwareGl,
    cameraCount = 3,
    modelLabel = 'FMK PRO',
  } = options;

  const root = new THREE.Group();
  const partsMap = new Map<PartId, THREE.Group>();
  const frameMaterials: THREE.MeshPhysicalMaterial[] = [];
  const backMaterials: THREE.MeshPhysicalMaterial[] = [];
  const accentMaterials: THREE.MeshStandardMaterial[] = [];
  const textures: THREE.Texture[] = [];

  // Shared materials
  const frameMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(finish.frameHex),
    metalness: 0.92,
    roughness: 0.2,
    clearcoat: 0.4,
    clearcoatRoughness: 0.15,
    anisotropy: 0.75,
  });
  frameMaterials.push(frameMat);

  const backGlassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(finish.backHex),
    metalness: 0.12,
    roughness: 0.34,
    clearcoat: 0.85,
    clearcoatRoughness: 0.12,
  });
  backMaterials.push(backGlassMat);

  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(finish.accentHex),
    metalness: 0.95,
    roughness: 0.18,
  });
  accentMaterials.push(goldAccentMat);

  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1f,
    metalness: 0.85,
    roughness: 0.35,
  });

  const bezelBlackMat = new THREE.MeshPhysicalMaterial({
    color: 0x050507,
    metalness: 0.1,
    roughness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });

  const lensGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x101828,
    metalness: 0.15,
    roughness: 0.04,
    transmission: isSoftwareGl ? 0 : 0.72,
    transparent: true,
    opacity: isSoftwareGl ? 0.82 : 1,
    ior: 1.77,
    clearcoat: 1.0,
  });

  // Textures
  const screenTex = createScreenTexture(maxAnisotropy, modelLabel);
  const batteryTex = createBatteryTexture(maxAnisotropy);
  const pcbTex = createPcbTexture(maxAnisotropy);
  const chipTex = createChipTexture(maxAnisotropy);
  textures.push(screenTex, batteryTex, pcbTex, chipTex);

  // 1. FRAME & BODY (Titanium Perimeter + Rear Matte Glass + MagSafe Ring)
  const frameGroup = new THREE.Group();
  const chassisGeo = createExtrudedRoundedBox(1.16, 2.38, 0.09, 0.18, 0.015, 0.014);
  const chassisMesh = new THREE.Mesh(chassisGeo, frameMat);
  frameGroup.add(chassisMesh);

  // Internal aluminum thermal mid-plate
  const midPlateGeo = createExtrudedRoundedBox(1.06, 2.26, 0.025, 0.14, 0.004, 0.004);
  const midPlateMesh = new THREE.Mesh(midPlateGeo, darkMetalMat);
  midPlateMesh.position.z = -0.02;
  frameGroup.add(midPlateMesh);

  // Rear frosted glass plate
  const backPlateGeo = createExtrudedRoundedBox(1.1, 2.32, 0.018, 0.16, 0.006, 0.006);
  const backPlateMesh = new THREE.Mesh(backPlateGeo, backGlassMat);
  backPlateMesh.position.z = -0.056;
  frameGroup.add(backPlateMesh);

  // Rear FMK emblem disc & MagSafe ring
  const magRingGeo = new THREE.RingGeometry(0.24, 0.265, 48);
  const magRingMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(finish.accentHex),
    metalness: 0.9,
    roughness: 0.2,
    side: THREE.DoubleSide,
  });
  accentMaterials.push(magRingMat);
  const magRing = new THREE.Mesh(magRingGeo, magRingMat);
  magRing.position.set(0, -0.05, -0.072);
  magRing.rotation.y = Math.PI;
  frameGroup.add(magRing);

  tagPartHierarchy(frameGroup, 'frame');
  partsMap.set('frame', frameGroup);
  root.add(frameGroup);

  // 2. MOBILE DISPLAY & TOUCH SCREEN
  const displayGroup = new THREE.Group();
  const bezelGeo = createExtrudedRoundedBox(1.11, 2.33, 0.02, 0.16, 0.006, 0.006);
  const bezelMesh = new THREE.Mesh(bezelGeo, bezelBlackMat);
  bezelMesh.position.z = 0.055;
  displayGroup.add(bezelMesh);

  const screenGeo = new THREE.PlaneGeometry(1.02, 2.22);
  const screenMat = new THREE.MeshStandardMaterial({
    map: screenTex,
    emissiveMap: screenTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.55,
    roughness: 0.12,
    metalness: 0.05,
  });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.z = 0.073;
  displayGroup.add(screenMesh);

  // Copper display flex ribbon behind screen
  const flexGeo = new THREE.BoxGeometry(0.18, 0.35, 0.006);
  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xc87d32,
    metalness: 0.8,
    roughness: 0.3,
  });
  const flexRibbon = new THREE.Mesh(flexGeo, copperMat);
  flexRibbon.position.set(-0.22, -0.75, 0.042);
  displayGroup.add(flexRibbon);

  tagPartHierarchy(displayGroup, 'display');
  partsMap.set('display', displayGroup);
  root.add(displayGroup);

  // 3. BATTERY (L-shaped high-density pack + wireless coil)
  const batteryGroup = new THREE.Group();
  const battMainGeo = createExtrudedRoundedBox(0.56, 1.18, 0.036, 0.04, 0.004, 0.004);
  const battMat = new THREE.MeshStandardMaterial({
    map: batteryTex,
    roughness: 0.45,
    metalness: 0.25,
  });
  const battMainMesh = new THREE.Mesh(battMainGeo, battMat);
  battMainMesh.position.set(-0.2, -0.24, 0.0);
  batteryGroup.add(battMainMesh);

  const battFootGeo = createExtrudedRoundedBox(0.32, 0.48, 0.036, 0.04, 0.004, 0.004);
  const battFootMesh = new THREE.Mesh(battFootGeo, darkMetalMat);
  battFootMesh.position.set(0.22, -0.59, 0.0);
  batteryGroup.add(battFootMesh);

  // Copper inductive coil
  const coilGeo = new THREE.TorusGeometry(0.22, 0.012, 12, 48);
  const coilMesh = new THREE.Mesh(coilGeo, copperMat);
  coilMesh.position.set(-0.08, -0.1, -0.025);
  batteryGroup.add(coilMesh);

  tagPartHierarchy(batteryGroup, 'battery');
  partsMap.set('battery', batteryGroup);
  root.add(batteryGroup);

  // 4. MOTHERBOARD (Gold HDI PCB)
  const motherboardGroup = new THREE.Group();
  const pcbMat = new THREE.MeshStandardMaterial({
    map: pcbTex,
    roughness: 0.42,
    metalness: 0.5,
  });
  const pcbMainGeo = createExtrudedRoundedBox(0.38, 1.05, 0.026, 0.03, 0.003, 0.003);
  const pcbMainMesh = new THREE.Mesh(pcbMainGeo, pcbMat);
  pcbMainMesh.position.set(0.29, 0.2, 0.005);
  motherboardGroup.add(pcbMainMesh);

  // EMI shields on PCB
  const shieldGeo = new THREE.BoxGeometry(0.22, 0.26, 0.012);
  const shieldMesh = new THREE.Mesh(shieldGeo, frameMat);
  shieldMesh.position.set(0.29, 0.56, 0.022);
  motherboardGroup.add(shieldMesh);

  tagPartHierarchy(motherboardGroup, 'motherboard');
  partsMap.set('motherboard', motherboardGroup);
  root.add(motherboardGroup);

  // 5. PROCESSOR (A-Series SoC Silicon Die)
  const processorGroup = new THREE.Group();
  const socSubstrateGeo = new THREE.BoxGeometry(0.24, 0.24, 0.014);
  const socSubstrate = new THREE.Mesh(socSubstrateGeo, darkMetalMat);
  socSubstrate.position.set(0.29, 0.14, 0.024);
  processorGroup.add(socSubstrate);

  const socDieGeo = new THREE.BoxGeometry(0.19, 0.19, 0.01);
  const socDieMat = new THREE.MeshStandardMaterial({
    map: chipTex,
    metalness: 0.85,
    roughness: 0.22,
  });
  const socDie = new THREE.Mesh(socDieGeo, socDieMat);
  socDie.position.set(0.29, 0.14, 0.032);
  processorGroup.add(socDie);

  tagPartHierarchy(processorGroup, 'processor');
  partsMap.set('processor', processorGroup);
  root.add(processorGroup);

  // 6. CAMERA (Rear Triple/Dual Sapphire Array + Front TrueDepth)
  const cameraGroup = new THREE.Group();
  const plateauGeo = createExtrudedRoundedBox(0.48, 0.5, 0.032, 0.09, 0.008, 0.008);
  const plateauMesh = new THREE.Mesh(plateauGeo, backGlassMat);
  plateauMesh.position.set(0.23, 0.79, -0.075);
  cameraGroup.add(plateauMesh);

  const lensPositions: [number, number][] =
    cameraCount === 3
      ? [
          [0.34, 0.91],
          [0.34, 0.67],
          [0.12, 0.79],
        ]
      : [
          [0.33, 0.9],
          [0.14, 0.69],
        ];

  lensPositions.forEach(([lx, ly]) => {
    const ringGeo = new THREE.CylinderGeometry(0.092, 0.096, 0.034, 32);
    const ringMesh = new THREE.Mesh(ringGeo, goldAccentMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(lx, ly, -0.096);
    cameraGroup.add(ringMesh);

    const barrelGeo = new THREE.CylinderGeometry(0.074, 0.074, 0.036, 28);
    const barrelMesh = new THREE.Mesh(barrelGeo, bezelBlackMat);
    barrelMesh.rotation.x = Math.PI / 2;
    barrelMesh.position.set(lx, ly, -0.098);
    cameraGroup.add(barrelMesh);

    const glassGeo = new THREE.CylinderGeometry(0.062, 0.062, 0.01, 24);
    const glassMesh = new THREE.Mesh(glassGeo, lensGlassMat);
    glassMesh.rotation.x = Math.PI / 2;
    glassMesh.position.set(lx, ly, -0.114);
    cameraGroup.add(glassMesh);
  });

  // LED Flash & LiDAR scanner on camera plateau
  const flashGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.012, 20);
  const flashMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xfde68a,
    emissiveIntensity: 0.35,
    roughness: 0.2,
  });
  const flashMesh = new THREE.Mesh(flashGeo, flashMat);
  flashMesh.rotation.x = Math.PI / 2;
  flashMesh.position.set(0.12, 0.94, -0.092);
  cameraGroup.add(flashMesh);

  const lidarMesh = new THREE.Mesh(flashGeo, bezelBlackMat);
  lidarMesh.rotation.x = Math.PI / 2;
  lidarMesh.position.set(0.12, 0.64, -0.092);
  cameraGroup.add(lidarMesh);

  // Front TrueDepth selfie sensor bar
  const frontCamBar = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.022), darkMetalMat);
  frontCamBar.position.set(0, 1.0, 0.025);
  cameraGroup.add(frontCamBar);

  tagPartHierarchy(cameraGroup, 'camera');
  partsMap.set('camera', cameraGroup);
  root.add(cameraGroup);

  // 7. CHARGING PORT (USB-C Receptacle + Gold Pins)
  const portGroup = new THREE.Group();
  const portShellGeo = createExtrudedRoundedBox(0.22, 0.14, 0.044, 0.03, 0.003, 0.003);
  const portShell = new THREE.Mesh(portShellGeo, frameMat);
  portShell.position.set(0, -1.11, 0.0);
  portGroup.add(portShell);

  const portTongue = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.016), goldAccentMat);
  portTongue.position.set(0, -1.16, 0.0);
  portGroup.add(portTongue);

  tagPartHierarchy(portGroup, 'charging-port');
  partsMap.set('charging-port', portGroup);
  root.add(portGroup);

  // 8. SPEAKER (Acoustic Chamber + Top Earpiece)
  const speakerGroup = new THREE.Group();
  const bottomSpeakerGeo = createExtrudedRoundedBox(0.32, 0.14, 0.036, 0.03, 0.003, 0.003);
  const bottomSpeaker = new THREE.Mesh(bottomSpeakerGeo, darkMetalMat);
  bottomSpeaker.position.set(0.3, -1.04, 0.008);
  speakerGroup.add(bottomSpeaker);

  const driverRing = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.01, 10, 24), goldAccentMat);
  driverRing.position.set(0.32, -1.04, 0.032);
  speakerGroup.add(driverRing);

  const topEarpiece = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.022), darkMetalMat);
  topEarpiece.position.set(0, 1.11, 0.02);
  speakerGroup.add(topEarpiece);

  tagPartHierarchy(speakerGroup, 'speaker');
  partsMap.set('speaker', speakerGroup);
  root.add(speakerGroup);

  // 9. MICROPHONE (MEMS Acoustic Capsule)
  const micGroup = new THREE.Group();
  const micHousing = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.11, 0.032), copperMat);
  micHousing.position.set(-0.3, -1.04, 0.008);
  micGroup.add(micHousing);

  const micPort = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.038, 16), goldAccentMat);
  micPort.position.set(-0.32, -1.04, 0.008);
  micGroup.add(micPort);

  tagPartHierarchy(micGroup, 'microphone');
  partsMap.set('microphone', micGroup);
  root.add(micGroup);

  // 10. SIM CARD TRAY (Side Drawer)
  const simGroup = new THREE.Group();
  const simFaceGeo = createExtrudedRoundedBox(0.022, 0.34, 0.042, 0.01, 0.002, 0.002);
  const simFace = new THREE.Mesh(simFaceGeo, frameMat);
  simFace.position.set(-0.592, -0.18, 0);
  simGroup.add(simFace);

  const simCradle = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.014), goldAccentMat);
  simCradle.position.set(-0.48, -0.18, 0);
  simGroup.add(simCradle);

  tagPartHierarchy(simGroup, 'sim-tray');
  partsMap.set('sim-tray', simGroup);
  root.add(simGroup);

  // 11. POWER & VOLUME BUTTONS
  const buttonsGroup = new THREE.Group();
  // Right Power button
  const powerBtnGeo = createExtrudedRoundedBox(0.026, 0.28, 0.036, 0.01, 0.003, 0.003);
  const powerBtn = new THREE.Mesh(powerBtnGeo, goldAccentMat);
  powerBtn.position.set(0.598, 0.22, 0);
  buttonsGroup.add(powerBtn);

  // Left Volume Up & Down + Action Button
  const volUp = new THREE.Mesh(
    createExtrudedRoundedBox(0.026, 0.2, 0.036, 0.01, 0.003, 0.003),
    goldAccentMat
  );
  volUp.position.set(-0.598, 0.42, 0);
  buttonsGroup.add(volUp);

  const volDown = new THREE.Mesh(
    createExtrudedRoundedBox(0.026, 0.2, 0.036, 0.01, 0.003, 0.003),
    goldAccentMat
  );
  volDown.position.set(-0.598, 0.16, 0);
  buttonsGroup.add(volDown);

  const actionBtn = new THREE.Mesh(
    createExtrudedRoundedBox(0.026, 0.12, 0.036, 0.01, 0.003, 0.003),
    goldAccentMat
  );
  actionBtn.position.set(-0.598, 0.65, 0);
  buttonsGroup.add(actionBtn);

  tagPartHierarchy(buttonsGroup, 'buttons');
  partsMap.set('buttons', buttonsGroup);
  root.add(buttonsGroup);

  root.userData.partsMap = partsMap;

  return {
    root,
    partsMap,
    frameMaterials,
    backMaterials,
    accentMaterials,
    screenMaterial: screenMat,
    textures,
  };
}

export function applyPhoneFinish(rig: BuiltPhoneRig, finish: PhoneColorOption) {
  rig.frameMaterials.forEach((m) => m.color.set(finish.frameHex));
  rig.backMaterials.forEach((m) => m.color.set(finish.backHex));
  rig.accentMaterials.forEach((m) => m.color.set(finish.accentHex));
}

export function applyExplodeFactor(partsMap: Map<PartId, THREE.Group>, explodeFactor: number) {
  MOBILE_PARTS.forEach((part) => {
    const group = partsMap.get(part.id);
    if (!group) return;
    group.position.set(
      part.explodedOffset[0] * explodeFactor,
      part.explodedOffset[1] * explodeFactor,
      part.explodedOffset[2] * explodeFactor
    );
  });
}

export function highlightSelectedPart(
  partsMap: Map<PartId, THREE.Group>,
  selectedPartId: PartId | null,
  hoveredPartId: PartId | null
) {
  partsMap.forEach((group, partId) => {
    const isSelected = partId === selectedPartId;
    const isHovered = partId === hoveredPartId;
    group.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (!mat || !('emissive' in mat)) return;
      if (mat.emissiveMap) return; // preserve OLED screen texture emissive
      if (isSelected) {
        mat.emissive.setHex(0x8a6914);
        mat.emissiveIntensity = 0.75;
      } else if (isHovered) {
        mat.emissive.setHex(0x4d3b0b);
        mat.emissiveIntensity = 0.45;
      } else {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
    });
  });
}

export function buildSinglePartShowcase(options: {
  partId: PartId;
  finish: PhoneColorOption;
  maxAnisotropy: number;
  isSoftwareGl: boolean;
}): { root: THREE.Group; textures: THREE.Texture[] } {
  const rig = buildCompleteSmartphone({
    finish: options.finish,
    maxAnisotropy: options.maxAnisotropy,
    isSoftwareGl: options.isSoftwareGl,
    cameraCount: 3,
    modelLabel: 'FMK PART LAB',
  });

  const targetGroup = rig.partsMap.get(options.partId);
  const isolatedRoot = new THREE.Group();

  if (targetGroup) {
    // Center the isolated part at origin and scale it cleanly for close inspection
    const box = new THREE.Box3().setFromObject(targetGroup);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    targetGroup.position.sub(center);
    const maxDim = Math.max(size.x, size.y, size.z, 0.35);
    const targetScale = Math.min(2.4, 1.85 / maxDim);

    const wrapper = new THREE.Group();
    wrapper.add(targetGroup);
    wrapper.scale.setScalar(targetScale);
    isolatedRoot.add(wrapper);
  }

  // Dispose unused parts that aren't in isolatedRoot
  rig.partsMap.forEach((group, id) => {
    if (id !== options.partId) {
      disposeObject3D(group);
    }
  });

  return { root: isolatedRoot, textures: rig.textures };
}

export function disposeObject3D(obj: THREE.Object3D) {
  obj.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((mat) => {
        mat.dispose();
      });
    }
  });
}
