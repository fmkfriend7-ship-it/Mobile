import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MousePointerClick, RotateCcw } from 'lucide-react';
import { MOBILE_PARTS, PartId, SHOWCASE_FINISHES } from '../data/catalog';
import { ThreeViewport } from './ThreeViewport';

export const TechnologySection: React.FC = () => {
  const [selectedPartId, setSelectedPartId] = useState<PartId>('processor');
  const [explodeAmount, setExplodeAmount] = useState<number>(0.65);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);

  const activePart =
    MOBILE_PARTS.find((p) => p.id === selectedPartId) || MOBILE_PARTS[0];

  const handleReset = () => {
    setExplodeAmount(0.65);
    setSelectedPartId('processor');
  };

  // Collapsible Bottom Control Dock inside the 3D viewport (unobstructed center)
  const bottomDock = (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex flex-col items-center px-4">
      <button
        type="button"
        onClick={() => setDockCollapsed((c) => !c)}
        className="pointer-events-auto mb-2 flex items-center gap-1.5 rounded-t-lg border border-white/15 bg-[#09090B]/95 px-3 py-1 text-[11px] font-semibold text-[#D4AF37] transition-colors hover:bg-[#141418]"
      >
        {dockCollapsed ? (
          <>
            <ChevronUp className="h-3.5 w-3.5" />
            <span>Show Controls</span>
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5" />
            <span>Hide Controls</span>
          </>
        )}
      </button>

      {!dockCollapsed && (
        <div className="pointer-events-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-4 rounded-xl border border-white/15 bg-[#09090B]/95 px-4 py-3 text-xs text-[#FAFAFA]">
          <div className="flex min-w-[190px] flex-1 items-center gap-3">
            <span className="font-semibold text-[#D4AF37] whitespace-nowrap">Explode Layers</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={explodeAmount}
              onChange={(e) => setExplodeAmount(parseFloat(e.target.value))}
              aria-label="Explode smartphone technology layers"
              className="fmk-slider w-full"
            />
            <span className="font-mono-tabular w-9 text-right text-[#A1A1AA]">
              {Math.round(explodeAmount * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExplodeAmount((v) => (v > 0.2 ? 0 : 0.75))}
              className="rounded-lg border border-white/15 bg-[#141418] px-3 py-1.5 font-medium text-[#FAFAFA] whitespace-nowrap transition-colors hover:border-[#D4AF37]"
            >
              {explodeAmount > 0.2 ? 'Assemble' : 'Explode'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset technology explorer"
              className="flex items-center gap-1 rounded-lg border border-white/15 bg-[#141418] px-2.5 py-1.5 font-medium text-[#A1A1AA] whitespace-nowrap transition-colors hover:text-[#FAFAFA]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section
      id="technology"
      className="border-t border-white/10 bg-[#0D0D10] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold tracking-widest text-[#D4AF37] uppercase">
              Interactive 360° Architecture
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#FAFAFA] sm:text-5xl">
              Inside the Technology
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#A1A1AA]">
              Rotate the 3D smartphone 360 degrees and click directly on any component—screen, battery, camera array, logic motherboard, or silicon processor—to inspect its engineering.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-[#D4AF37]">
            <MousePointerClick className="h-4 w-4" />
            <span>Click any 3D part directly to inspect</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* Interactive Raycasted 3D Smartphone Stage */}
          <div className="lg:col-span-7">
            <ThreeViewport
              mode="technology"
              finish={SHOWCASE_FINISHES[1]}
              explodeAmount={explodeAmount}
              selectedPartId={selectedPartId}
              onSelectPart={(partId) => {
                if (partId) setSelectedPartId(partId);
              }}
              enablePartPicking={true}
              autoPlay={false}
              bottomControlBar={bottomDock}
              className="h-[460px] w-full rounded-2xl border border-white/10 sm:h-[540px]"
            />
          </div>

          {/* Right Inspection Panel */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#111115] p-6 sm:p-8 lg:col-span-5">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="font-mono-tabular text-xs font-semibold text-[#D4AF37]">
                    Component {activePart.index} / 11
                  </span>
                  <h3 className="font-display mt-1 text-2xl font-semibold text-[#FAFAFA] sm:text-3xl">
                    {activePart.name}
                  </h3>
                </div>
                <span className="text-xs font-medium text-[#A1A1AA]">
                  {activePart.subsystem}
                </span>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-[#09090B]">
                <img
                  src={activePart.image}
                  alt={activePart.name}
                  referrerPolicy="no-referrer"
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>

              <p className="mt-5 text-sm leading-relaxed text-[#E4E4E7]">
                {activePart.shortDescription}
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">
                {activePart.functionExplanation}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {activePart.engineeringSpecs.map((spec) => (
                  <div
                    key={spec}
                    className="rounded-lg border border-white/10 bg-[#18181D] px-3 py-2 font-mono-tabular text-xs text-[#D4D4D8]"
                  >
                    {spec}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Component Selector Strip */}
            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="mb-2.5 text-xs font-semibold tracking-wider text-[#A1A1AA] uppercase">
                Jump to Component
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MOBILE_PARTS.map((part) => {
                  const active = part.id === selectedPartId;
                  return (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => {
                        setSelectedPartId(part.id);
                        if (explodeAmount < 0.25) setExplodeAmount(0.65);
                      }}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[#D4AF37] text-[#09090B]'
                          : 'border border-white/10 bg-[#18181D] text-[#A1A1AA] hover:text-[#FAFAFA]'
                      }`}
                    >
                      {part.name.split(' ')[0]} {part.id === 'sim-tray' ? 'Tray' : part.id === 'charging-port' ? 'Port' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
