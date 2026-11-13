import React, { useState } from 'react';
import { Camera, Rotate3d, Smartphone, Layers, ZoomIn } from 'lucide-react';
import { IPHONE_PRODUCTS, PhoneColorOption, SHOWCASE_FINISHES } from '../data/catalog';
import { CameraViewPreset, ThreeViewport } from './ThreeViewport';

const VIEW_PRESETS: { id: CameraViewPreset; label: string; icon: React.ReactNode }[] = [
  { id: '360', label: '360° Showcase', icon: <Rotate3d className="h-3.5 w-3.5" /> },
  { id: 'front', label: 'Front View', icon: <Smartphone className="h-3.5 w-3.5" /> },
  { id: 'back', label: 'Back View', icon: <Layers className="h-3.5 w-3.5" /> },
  { id: 'side', label: 'Side Profile', icon: <Camera className="h-3.5 w-3.5" /> },
  { id: 'camera-zoom', label: 'Camera Zoom', icon: <ZoomIn className="h-3.5 w-3.5" /> },
];

export const Explore3DExperienceSection: React.FC = () => {
  const [selectedModelIndex, setSelectedModelIndex] = useState(0); // iPhone 17 default
  const [selectedFinish, setSelectedFinish] = useState<PhoneColorOption>(SHOWCASE_FINISHES[0]);
  const [cameraPreset, setCameraPreset] = useState<CameraViewPreset>('360');

  const activePhone = IPHONE_PRODUCTS[selectedModelIndex];

  return (
    <section
      id="experience-3d"
      className="border-t border-white/10 bg-[#0D0D10] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold tracking-widest text-[#D4AF37] uppercase">
              Interactive 3D Cinema Showcase
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#FAFAFA] sm:text-5xl">
              Explore 3D Mobile Experience
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#A1A1AA]">
              Inspect every chamfered titanium contour, sapphire camera ring, and ceramic OLED edge in real-time 3D.
              Switch between 360° rotation, front and back architecture, razor-thin side profiles, and optical camera zoom.
            </p>
          </div>

          {/* Model Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-[#141418] p-1.5">
            {IPHONE_PRODUCTS.map((phone, idx) => (
              <button
                key={phone.id}
                type="button"
                onClick={() => setSelectedModelIndex(idx)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  selectedModelIndex === idx
                    ? 'bg-[#D4AF37] text-[#09090B]'
                    : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
                }`}
              >
                {phone.model}
              </button>
            ))}
          </div>
        </div>

        {/* Main 3D Video Stage + Controls */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* 3D Cinema Video Player */}
          <div className="lg:col-span-8">
            <ThreeViewport
              mode="cinema"
              finish={selectedFinish}
              cameraCount={activePhone.cameraCount}
              modelLabel={activePhone.model}
              cameraPreset={cameraPreset}
              showVideoControls={true}
              autoPlay={true}
              videoTitle={`${activePhone.model} · ${selectedFinish.name} (${VIEW_PRESETS.find((v) => v.id === cameraPreset)?.label})`}
              className="h-[440px] w-full rounded-2xl border border-white/10 sm:h-[520px]"
            />
          </div>

          {/* Studio Control Panel */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#111115] p-6 sm:p-8 lg:col-span-4">
            <div className="space-y-8">
              {/* Camera Angle Selector */}
              <div>
                <h3 className="text-xs font-semibold tracking-wider text-[#A1A1AA] uppercase">
                  Camera Viewpoints
                </h3>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {VIEW_PRESETS.map((preset) => {
                    const active = cameraPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setCameraPreset(preset.id)}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                          active
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#FAFAFA]'
                            : 'border-white/10 bg-[#18181D] text-[#A1A1AA] hover:border-white/25 hover:text-[#FAFAFA]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 whitespace-nowrap">
                          <span className={active ? 'text-[#D4AF37]' : 'text-[#A1A1AA]'}>
                            {preset.icon}
                          </span>
                          {preset.label}
                        </span>
                        <span
                          className={`text-xs ${active ? 'text-[#D4AF37]' : 'text-transparent'}`}
                        >
                          Active
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Color Variations */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold tracking-wider text-[#A1A1AA] uppercase">
                    Color Variations
                  </h3>
                  <span className="text-xs font-medium text-[#D4AF37]">{selectedFinish.name}</span>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-3">
                  {SHOWCASE_FINISHES.map((finish) => {
                    const isSelected = finish.name === selectedFinish.name;
                    return (
                      <button
                        key={finish.name}
                        type="button"
                        onClick={() => setSelectedFinish(finish)}
                        aria-label={`Select ${finish.name} finish`}
                        className={`group flex flex-col items-center gap-2 rounded-xl border p-2.5 transition-colors ${
                          isSelected
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                            : 'border-white/10 bg-[#18181D] hover:border-white/25'
                        }`}
                      >
                        <span
                          className="h-7 w-7 rounded-full border border-white/25 shadow-inner"
                          style={{ backgroundColor: finish.hex }}
                        />
                        <span className="w-full truncate text-center text-[11px] font-medium text-[#D4D4D8]">
                          {finish.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Active Model Quick Readout */}
            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-2xl font-semibold text-[#FAFAFA]">
                  {activePhone.model}
                </span>
                <span className="font-mono-tabular text-lg font-semibold text-[#D4AF37]">
                  ${activePhone.basePrice.toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">
                {activePhone.cameraSpec} · {activePhone.materialSpec}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
