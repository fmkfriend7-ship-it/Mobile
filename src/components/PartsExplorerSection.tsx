import React, { useEffect, useState } from 'react';
import { Layers, Box, Cpu, Play, Pause } from 'lucide-react';
import { MOBILE_PARTS, MobilePart, SHOWCASE_FINISHES } from '../data/catalog';
import { ThreeViewport } from './ThreeViewport';

interface PartsExplorerSectionProps {
  parts?: MobilePart[];
}

export const PartsExplorerSection: React.FC<PartsExplorerSectionProps> = ({
  parts = MOBILE_PARTS,
}) => {
  const [viewMode, setViewMode] = useState<'assembly' | 'individual'>('individual');
  const [selectedPart, setSelectedPart] = useState<MobilePart>(parts[0] || MOBILE_PARTS[0]);
  const [explodeSlider, setExplodeSlider] = useState<number>(0.75);
  const [isAssemblyAnimating, setIsAssemblyAnimating] = useState<boolean>(true);

  useEffect(() => {
    setSelectedPart((prev) => parts.find((p) => p.id === prev.id) || parts[0] || MOBILE_PARTS[0]);
  }, [parts]);

  // Smoothly animate between assembled (0) and exploded (1) when in assembly video mode
  useEffect(() => {
    if (viewMode !== 'assembly' || !isAssemblyAnimating) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const wave = (Math.sin(elapsed * 0.9 - Math.PI / 2) + 1) / 2;
      setExplodeSlider(Number(wave.toFixed(3)));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [viewMode, isAssemblyAnimating]);

  return (
    <section
      id="mobile-parts"
      className="border-t border-white/10 bg-[#09090B] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Heading & Mode Tabs */}
        <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold tracking-widest text-[#D4AF37] uppercase">
              Precision Hardware Architecture
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#FAFAFA] sm:text-5xl">
              Explore Mobile Parts in 3D
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#A1A1AA]">
              Examine all 11 core smartphone components individually in 3D, or watch the full exploded-view assembly sequence to see how every module fits inside the titanium chassis.
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#141418] p-1.5 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('individual')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                viewMode === 'individual'
                  ? 'bg-[#D4AF37] text-[#09090B]'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Individual Part 3D</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('assembly')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                viewMode === 'assembly'
                  ? 'bg-[#D4AF37] text-[#09090B]'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Full Assembly Fit</span>
            </button>
          </div>
        </div>

        {/* Interactive Split Stage */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left 4 Columns: 11-Part Navigation Rail */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-white/10 bg-[#111115] p-3">
              <div className="px-3 py-2 text-xs font-semibold tracking-wider text-[#A1A1AA] uppercase">
                11 Core Smartphone Modules
              </div>
              <div className="mt-1 grid max-h-[540px] grid-cols-1 gap-1 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-1">
                {parts.map((part) => {
                  const isActive = selectedPart.id === part.id;
                  return (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => {
                        setSelectedPart(part);
                        if (viewMode === 'assembly') {
                          setIsAssemblyAnimating(false);
                          setExplodeSlider(0.85);
                        }
                      }}
                      className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors ${
                        isActive
                          ? 'border border-[#D4AF37]/60 bg-[#D4AF37]/12 text-[#FAFAFA]'
                          : 'border border-transparent text-[#A1A1AA] hover:bg-white/5 hover:text-[#FAFAFA]'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`font-mono-tabular text-xs font-semibold ${
                            isActive ? 'text-[#D4AF37]' : 'text-[#71717A]'
                          }`}
                        >
                          {part.index}
                        </span>
                        <span className="truncate text-sm font-medium">{part.name}</span>
                      </span>
                      {isActive && (
                        <Box className="h-3.5 w-3.5 shrink-0 text-[#D4AF37]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 8 Columns: 3D Part Video Player + High-Res Spec Card */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            <ThreeViewport
              mode="parts"
              finish={SHOWCASE_FINISHES[0]}
              isolatedPartId={viewMode === 'individual' ? selectedPart.id : null}
              explodeAmount={viewMode === 'assembly' ? explodeSlider : 0}
              selectedPartId={viewMode === 'assembly' ? selectedPart.id : null}
              showVideoControls={true}
              autoPlay={true}
              videoTitle={
                viewMode === 'individual'
                  ? `${selectedPart.index}. ${selectedPart.name} · 3D Component Reel`
                  : `Complete Smartphone Assembly · ${Math.round(explodeSlider * 100)}% Exploded`
              }
              className="h-[380px] w-full rounded-2xl border border-white/10 sm:h-[440px]"
            />

            {/* Assembly Controls Bar when in Assembly Mode */}
            {viewMode === 'assembly' && (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#111115] px-5 py-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAssemblyAnimating((a) => !a)}
                    className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-3.5 py-2 text-xs font-semibold text-[#09090B] whitespace-nowrap shrink-0"
                  >
                    {isAssemblyAnimating ? (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        <span>Pause Assembly Loop</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        <span>Auto-Assemble Loop</span>
                      </>
                    )}
                  </button>
                  <span className="text-xs text-[#A1A1AA]">
                    Drag slider to fit all 11 components into the chassis
                  </span>
                </div>
                <div className="flex flex-1 items-center gap-3 sm:max-w-xs">
                  <span className="font-mono-tabular text-[11px] text-[#A1A1AA]">Fitted</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={explodeSlider}
                    onChange={(e) => {
                      setIsAssemblyAnimating(false);
                      setExplodeSlider(parseFloat(e.target.value));
                    }}
                    aria-label="Smartphone assembly separation"
                    className="fmk-slider w-full"
                  />
                  <span className="font-mono-tabular text-[11px] text-[#D4AF37]">Exploded</span>
                </div>
              </div>
            )}

            {/* Selected Part Detail Card: High-Quality Image + Description + Function */}
            <div className="grid grid-cols-1 gap-6 rounded-2xl border border-white/10 bg-[#111115] p-6 md:grid-cols-12 md:items-center">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#09090B] md:col-span-5">
                <img
                  src={selectedPart.image}
                  alt={selectedPart.name}
                  referrerPolicy="no-referrer"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>

              <div className="space-y-4 md:col-span-7">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-[#D4AF37]">
                    <span className="font-mono-tabular">Module {selectedPart.index}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedPart.subsystem}</span>
                  </div>
                  <h3 className="font-display mt-1 text-2xl font-semibold text-[#FAFAFA] sm:text-3xl">
                    {selectedPart.name}
                  </h3>
                </div>

                <div>
                  <p className="text-sm leading-relaxed text-[#E4E4E7]">
                    {selectedPart.shortDescription}
                  </p>
                </div>

                <div className="rounded-xl border border-white/8 bg-[#18181D] p-4">
                  <div className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
                    How It Works
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#A1A1AA]">
                    {selectedPart.functionExplanation}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-[#A1A1AA]">
                  {selectedPart.engineeringSpecs.map((spec, idx) => (
                    <React.Fragment key={spec}>
                      {idx > 0 && <span aria-hidden="true" className="text-[#52525B]">·</span>}
                      <span className="font-mono-tabular">{spec}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
