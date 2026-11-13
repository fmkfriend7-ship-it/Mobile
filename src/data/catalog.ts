import iphoneGoldImg from '../assets/images/iphone_pro_gold_1794546775228.jpg';
import iphoneObsidianImg from '../assets/images/iphone_pro_obsidian_1794546775913.jpg';
import iphoneWhiteImg from '../assets/images/iphone_pearl_white_1794546776295.jpg';
import motherboardChipImg from '../assets/images/mobile_motherboard_chip_1794546777562.jpg';
import partsFlatlayImg from '../assets/images/mobile_camera_battery_parts_1794546778434.jpg';

export type PhoneCategory = 'All' | 'Latest Gen' | 'Pro Series' | 'Standard';

export interface PhoneColorOption {
  name: string;
  hex: string;
  frameHex: string;
  backHex: string;
  accentHex: string;
  image: string;
}

export interface StorageOption {
  label: string;
  priceDelta: number;
}

export interface PhoneProduct {
  id: string;
  model: string;
  seriesLabel: string;
  category: Exclude<PhoneCategory, 'All'>;
  basePrice: number;
  releaseYear: string;
  tagline: string;
  description: string;
  chip: string;
  displaySpec: string;
  cameraSpec: string;
  batterySpec: string;
  materialSpec: string;
  cameraCount: 2 | 3;
  defaultImage: string;
  storageOptions: StorageOption[];
  colors: PhoneColorOption[];
}

export type PartId =
  | 'display'
  | 'battery'
  | 'camera'
  | 'motherboard'
  | 'processor'
  | 'charging-port'
  | 'speaker'
  | 'microphone'
  | 'frame'
  | 'sim-tray'
  | 'buttons';

export interface MobilePart {
  id: PartId;
  index: string;
  name: string;
  subsystem: string;
  shortDescription: string;
  functionExplanation: string;
  engineeringSpecs: string[];
  image: string;
  explodedOffset: [number, number, number];
  focusTarget: [number, number, number];
  focusCameraOffset: [number, number, number];
}

export const SHOWCASE_FINISHES: PhoneColorOption[] = [
  {
    name: 'Champagne Gold',
    hex: '#D4AF37',
    frameHex: '#C9A449',
    backHex: '#231E14',
    accentHex: '#E5C158',
    image: iphoneGoldImg,
  },
  {
    name: 'Obsidian Black',
    hex: '#18181B',
    frameHex: '#27272A',
    backHex: '#0F0F12',
    accentHex: '#D4AF37',
    image: iphoneObsidianImg,
  },
  {
    name: 'Alabaster White',
    hex: '#F4F4F0',
    frameHex: '#D4D4D8',
    backHex: '#F5F5F4',
    accentHex: '#C59B27',
    image: iphoneWhiteImg,
  },
  {
    name: 'Titanium Slate',
    hex: '#52525B',
    frameHex: '#71717A',
    backHex: '#27272A',
    accentHex: '#D4AF37',
    image: iphoneObsidianImg,
  },
];

export const IPHONE_PRODUCTS: PhoneProduct[] = [
  {
    id: 'iphone-17',
    model: 'iPhone 17',
    seriesLabel: 'Flagship Pro Edition',
    category: 'Latest Gen',
    basePrice: 1199,
    releaseYear: '2026',
    tagline: 'Aerospace Titanium. Neural Photonics. Zero Compromise.',
    description:
      'Engineered with a vapor-chamber thermal core, 48MP periscope optical zoom, and an ultra-bright 120Hz LTPO OLED display encased in Grade-5 brushed titanium.',
    chip: 'A19 Pro Neural Silicon (2nm)',
    displaySpec: '6.7" ProMotion LTPO OLED · 3000 nits',
    cameraSpec: '48MP Triple Optical + 6x Periscope Telephoto',
    batterySpec: '4,850 mAh Stacked Li-Ion · 45W MagSafe',
    materialSpec: 'Grade-5 Brushed Titanium & Ceramic Shield',
    cameraCount: 3,
    defaultImage: iphoneGoldImg,
    storageOptions: [
      { label: '256GB', priceDelta: 0 },
      { label: '512GB', priceDelta: 200 },
      { label: '1TB', priceDelta: 400 },
    ],
    colors: [
      SHOWCASE_FINISHES[0],
      SHOWCASE_FINISHES[1],
      SHOWCASE_FINISHES[2],
      SHOWCASE_FINISHES[3],
    ],
  },
  {
    id: 'iphone-16',
    model: 'iPhone 16',
    seriesLabel: 'Titanium Pro Series',
    category: 'Pro Series',
    basePrice: 999,
    releaseYear: '2025',
    tagline: 'Precision Camera Control and Studio Spatial Audio.',
    description:
      'Built for creators and executives with hardware Camera Control, 4K 120fps Dolby Vision cinema capture, and an energy-dense silicon-carbon battery.',
    chip: 'A18 Pro 6-Core GPU',
    displaySpec: '6.3" Super Retina XDR · 120Hz',
    cameraSpec: '48MP Fusion Triple Array + LiDAR',
    batterySpec: '4,420 mAh High-Density Cell · USB-C',
    materialSpec: 'Micro-Blasted Titanium & Textured Matte Glass',
    cameraCount: 3,
    defaultImage: iphoneObsidianImg,
    storageOptions: [
      { label: '128GB', priceDelta: 0 },
      { label: '256GB', priceDelta: 100 },
      { label: '512GB', priceDelta: 300 },
      { label: '1TB', priceDelta: 500 },
    ],
    colors: [
      SHOWCASE_FINISHES[1],
      SHOWCASE_FINISHES[0],
      SHOWCASE_FINISHES[2],
      SHOWCASE_FINISHES[3],
    ],
  },
  {
    id: 'iphone-15',
    model: 'iPhone 15',
    seriesLabel: 'Titanium Architecture',
    category: 'Pro Series',
    basePrice: 849,
    releaseYear: '2024',
    tagline: 'USB-C Studio Bandwidth Meets Contoured Titanium.',
    description:
      'Featuring a contoured aerospace frame, Dynamic Island telemetry, hardware-accelerated ray tracing, and 10Gbps USB-C external ProRes recording.',
    chip: 'A17 Pro 3nm Architecture',
    displaySpec: '6.1" Super Retina XDR · Dynamic Island',
    cameraSpec: '48MP Main + 12MP Ultra Wide + 3x Optical',
    batterySpec: '3,877 mAh · 25W MagSafe Wireless',
    materialSpec: 'Contoured Titanium & Color-Infused Glass',
    cameraCount: 3,
    defaultImage: iphoneWhiteImg,
    storageOptions: [
      { label: '128GB', priceDelta: 0 },
      { label: '256GB', priceDelta: 100 },
      { label: '512GB', priceDelta: 300 },
    ],
    colors: [
      SHOWCASE_FINISHES[2],
      SHOWCASE_FINISHES[0],
      SHOWCASE_FINISHES[1],
    ],
  },
  {
    id: 'iphone-14',
    model: 'iPhone 14',
    seriesLabel: 'Essential Studio Line',
    category: 'Standard',
    basePrice: 699,
    releaseYear: '2023',
    tagline: 'Dual-Sensor Photonic Engine with All-Day Endurance.',
    description:
      'Refined surgical-grade chassis housing a fast-aperture dual camera array, Crash Detection sensors, and a calibrated OLED True Tone screen.',
    chip: 'A15 Bionic 5-Core GPU',
    displaySpec: '6.1" OLED Super Retina XDR · 1200 nits',
    cameraSpec: '12MP Dual Photonic Engine + Action Mode',
    batterySpec: '3,279 mAh · Up to 20 hrs Video Playback',
    materialSpec: 'Aerospace Aluminum & Ceramic Shield',
    cameraCount: 2,
    defaultImage: iphoneObsidianImg,
    storageOptions: [
      { label: '128GB', priceDelta: 0 },
      { label: '256GB', priceDelta: 100 },
      { label: '512GB', priceDelta: 300 },
    ],
    colors: [
      SHOWCASE_FINISHES[1],
      SHOWCASE_FINISHES[2],
      SHOWCASE_FINISHES[0],
    ],
  },
  {
    id: 'iphone-13',
    model: 'iPhone 13',
    seriesLabel: 'Classic Precision Edition',
    category: 'Standard',
    basePrice: 579,
    releaseYear: '2022',
    tagline: 'Iconic Flat-Edge Silhouette with Cinematic Depth.',
    description:
      'A timeless flat-edge aluminum design delivering Cinematic Mode rack focus, sensor-shift optical stabilization, and dependable 5G connectivity.',
    chip: 'A15 Bionic Neural Engine',
    displaySpec: '6.1" Super Retina XDR · HDR10',
    cameraSpec: '12MP Diagonal Dual Array + Sensor-Shift OIS',
    batterySpec: '3,227 mAh · Fast Charge 50% in 30 min',
    materialSpec: 'Anodized Aluminum & Gorilla Ceramic Glass',
    cameraCount: 2,
    defaultImage: iphoneWhiteImg,
    storageOptions: [
      { label: '128GB', priceDelta: 0 },
      { label: '256GB', priceDelta: 100 },
      { label: '512GB', priceDelta: 250 },
    ],
    colors: [
      SHOWCASE_FINISHES[2],
      SHOWCASE_FINISHES[1],
      SHOWCASE_FINISHES[0],
    ],
  },
];

export const MOBILE_PARTS: MobilePart[] = [
  {
    id: 'display',
    index: '01',
    name: 'Mobile Display and Touch Screen',
    subsystem: 'Optical Interface Layer',
    shortDescription:
      'Edge-to-edge LTPO OLED panel bonded beneath micro-crystalline Ceramic Shield glass and a capacitive multi-touch digitizer.',
    functionExplanation:
      'Converts digital frame buffer signals into 120Hz adaptive HDR imagery while sensing 240Hz capacitive finger and gesture coordinates across the glass surface.',
    engineeringSpecs: ['LTPO Super Retina XDR', '1–120Hz ProMotion', '3000 nits Peak HDR', '240Hz Touch Sampling'],
    image: iphoneObsidianImg,
    explodedOffset: [0, 0, 1.45],
    focusTarget: [0, 0, 0.25],
    focusCameraOffset: [0.8, 0.4, 3.2],
  },
  {
    id: 'battery',
    index: '02',
    name: 'Battery',
    subsystem: 'Electrochemical Power Cell',
    shortDescription:
      'High-density L-shaped lithium-ion power module paired with a copper-wound MagSafe inductive charging coil.',
    functionExplanation:
      'Stores and regulates 3.88V DC energy for every subsystem, while an integrated Battery Management IC balances thermal load during fast wired and wireless charging.',
    engineeringSpecs: ['4,850 mAh Li-Ion', 'MagSafe 15W/25W Coil', '45W USB-PD Fast Charge', 'Thermal NTC Monitoring'],
    image: partsFlatlayImg,
    explodedOffset: [-0.35, -0.25, 0.45],
    focusTarget: [-0.15, -0.25, 0.0],
    focusCameraOffset: [-1.4, 0.3, 2.8],
  },
  {
    id: 'camera',
    index: '03',
    name: 'Camera (Front and Back)',
    subsystem: 'Computational Optics Array',
    shortDescription:
      'Triple-lens rear sapphire optical module with LiDAR depth scanner alongside the front TrueDepth dot-projector camera.',
    functionExplanation:
      'Captures photons through 7-element coated lenses onto sensor-shift stabilized CMOS sensors, performing real-time depth mapping, 4K HDR capture, and 3D biometric Face ID.',
    engineeringSpecs: ['48MP Quad-Pixel Main', 'Periscope 5x/6x Prism', 'Sapphire Crystal Lenses', 'TrueDepth 3D Face ID'],
    image: partsFlatlayImg,
    explodedOffset: [0.35, 0.85, -1.35],
    focusTarget: [0.22, 0.65, -0.15],
    focusCameraOffset: [1.5, 1.1, -2.5],
  },
  {
    id: 'motherboard',
    index: '04',
    name: 'Motherboard',
    subsystem: 'Multi-Layer Logic PCB',
    shortDescription:
      '12-layer stacked high-density interconnect (HDI) circuit board routing power, memory, RF, and display buses.',
    functionExplanation:
      'Acts as the central nervous highway of the smartphone, connecting the SoC, LPDDR5X RAM, NVMe NAND storage, 5G modem, and flex ribbons inside EMI-shielded cages.',
    engineeringSpecs: ['12-Layer Gold-Plated HDI', 'Dual-Stacked PCB Sandwich', 'RF & 5G mmWave Shielding', 'NVMe Flash Storage'],
    image: motherboardChipImg,
    explodedOffset: [0.38, 0.25, 0.55],
    focusTarget: [0.25, 0.2, 0.02],
    focusCameraOffset: [1.6, 0.5, 2.7],
  },
  {
    id: 'processor',
    index: '05',
    name: 'Processor',
    subsystem: 'System-on-Chip (SoC)',
    shortDescription:
      'Gold-bonded 2nm/3nm flagship silicon die integrating CPU cores, hardware ray-tracing GPU, and Neural Engine.',
    functionExplanation:
      'Executes billions of instructions per second—driving operating system responsiveness, computational photography pipelines, on-device AI inference, and console-grade 3D graphics.',
    engineeringSpecs: ['2nm/3nm Silicon Node', '6-Core Performance CPU', '16-Core Neural Engine', 'Hardware Ray Tracing'],
    image: motherboardChipImg,
    explodedOffset: [0.42, 0.32, 0.92],
    focusTarget: [0.26, 0.25, 0.08],
    focusCameraOffset: [1.2, 0.5, 2.3],
  },
  {
    id: 'charging-port',
    index: '06',
    name: 'Charging Port',
    subsystem: 'USB-C Power & Data I/O',
    shortDescription:
      'Precision-milled bottom USB-C receptacle with 24 gold-plated pins and waterproof silicone O-ring seal.',
    functionExplanation:
      'Delivers up to 45W regulated power to the battery controller while negotiating 10Gbps USB 3 data streams, external 4K DisplayPort output, and digital audio accessories.',
    engineeringSpecs: ['24-Pin USB-C Receptacle', '10Gbps Data Transfer', 'USB-PD 3.0 Negotiation', 'IP68 Gasket Sealed'],
    image: partsFlatlayImg,
    explodedOffset: [0, -1.25, 0.15],
    focusTarget: [0, -1.1, 0],
    focusCameraOffset: [0.6, -1.4, 2.2],
  },
  {
    id: 'speaker',
    index: '07',
    name: 'Speaker',
    subsystem: 'Stereo Acoustic Drivers',
    shortDescription:
      'Dual-chamber bottom loudspeaker and top earpiece transducer filled with resonant acoustic foam beads.',
    functionExplanation:
      'Converts amplified electrical waveforms into balanced stereo Spatial Audio with rich low-frequency extension and crisp voice clarity for calls and media playback.',
    engineeringSpecs: ['Dual Stereo Drivers', 'Dolby Atmos Spatial', 'Acoustic Micro-Mesh', 'Smart Amp Protection'],
    image: partsFlatlayImg,
    explodedOffset: [0.35, -1.18, 0.48],
    focusTarget: [0.25, -1.02, 0.04],
    focusCameraOffset: [1.3, -1.1, 2.3],
  },
  {
    id: 'microphone',
    index: '08',
    name: 'Microphone',
    subsystem: 'Studio MEMS Array',
    shortDescription:
      'Four studio-grade high-SNR MEMS acoustic capsules positioned at top, bottom, and rear camera plateau.',
    functionExplanation:
      'Captures directional audio beams while running real-time ambient noise cancellation, enabling clear voice calls in windy environments and spatial audio zoom in video.',
    engineeringSpecs: ['4x Studio MEMS Mics', '72dB Signal-to-Noise', 'Active Wind Filtering', 'Spatial Audio Beamforming'],
    image: partsFlatlayImg,
    explodedOffset: [-0.36, -1.16, 0.42],
    focusTarget: [-0.28, -1.02, 0.04],
    focusCameraOffset: [-1.3, -1.1, 2.3],
  },
  {
    id: 'frame',
    index: '09',
    name: 'Mobile Frame and Body',
    subsystem: 'Titanium Structural Chassis',
    shortDescription:
      'CNC-machined Grade-5 titanium perimeter rail diffusion-bonded to an internal recycled aluminum thermal substructure and rear matte glass.',
    functionExplanation:
      'Provides rigid structural protection against torsion and drops, acts as an integrated 5G/Wi-Fi antenna band, and dissipates heat evenly from the processor.',
    engineeringSpecs: ['Grade-5 Titanium Rail', 'Internal Aluminum Frame', 'IP68 Water Resistance', 'Integrated 5G Antennas'],
    image: iphoneGoldImg,
    explodedOffset: [0, 0, -0.75],
    focusTarget: [0, 0, -0.05],
    focusCameraOffset: [-2.2, 0.6, -2.5],
  },
  {
    id: 'sim-tray',
    index: '10',
    name: 'SIM Card Tray',
    subsystem: 'Cellular Identity Slot',
    shortDescription:
      'Precision-anodized titanium drawer with recessed nano-SIM cradle and crimson waterproof perimeter gasket.',
    functionExplanation:
      'Secures the physical carrier UICC subscriber identity card against spring-loaded gold PCB contacts while maintaining a watertight IP68 seal inside the frame.',
    engineeringSpecs: ['CNC Titanium Faceplate', 'IP68 Elastomer Gasket', 'Dual eSIM + Nano-SIM', 'Spring-Eject Pin Slot'],
    image: iphoneWhiteImg,
    explodedOffset: [-0.95, -0.15, 0],
    focusTarget: [-0.56, -0.15, 0],
    focusCameraOffset: [-2.3, 0.2, 1.4],
  },
  {
    id: 'buttons',
    index: '11',
    name: 'Power and Volume Buttons',
    subsystem: 'Tactile Side Controls',
    shortDescription:
      'Precision-milled side power key, volume up/down rockers, and customizable Action button mounted on micro-dome switches.',
    functionExplanation:
      'Translates crisp mechanical finger presses into sealed tactile switch signals for wake/sleep, hardware volume control, camera shutter triggers, and emergency SOS.',
    engineeringSpecs: ['CNC Metallic Keycaps', 'Sealed Dome Switches', 'Customizable Action Key', '500K-Cycle Durability'],
    image: iphoneWhiteImg,
    explodedOffset: [0.95, 0.22, 0],
    focusTarget: [0.56, 0.22, 0],
    focusCameraOffset: [2.3, 0.3, 1.4],
  },
];

export const HERO_MEDIA_IMAGES = {
  gold: iphoneGoldImg,
  obsidian: iphoneObsidianImg,
  white: iphoneWhiteImg,
  motherboard: motherboardChipImg,
  parts: partsFlatlayImg,
};
