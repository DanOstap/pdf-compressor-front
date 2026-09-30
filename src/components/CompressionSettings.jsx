import React from 'react';
import { Sliders, Zap, Sparkles, Shield, Image as ImageIcon } from 'lucide-react';

export default function CompressionSettings({ settings, onSettingsChange }) {
  const presets = [
    {
      id: 'extreme',
      title: 'Extreme',
      ratio: '~75% Smaller',
      desc: 'Aggressive compression. Lowest file size, suitable for web & email.',
      dpi: 72,
      quality: 45,
      grayscale: false,
      tag: 'Max Size Reduction'
    },
    {
      id: 'balanced',
      title: 'Recommended',
      ratio: '~50% Smaller',
      desc: 'Perfect balance of crisp readability and compact file size.',
      dpi: 150,
      quality: 75,
      grayscale: false,
      tag: 'Best Overall'
    },
    {
      id: 'minimal',
      title: 'High Quality',
      ratio: '~25% Smaller',
      desc: 'Minimal image compression. Retains high-resolution print graphics.',
      dpi: 300,
      quality: 90,
      grayscale: false,
      tag: 'Crisp Details'
    }
  ];

  const handlePresetSelect = (preset) => {
    onSettingsChange({
      ...settings,
      preset: preset.id,
      dpi: preset.dpi,
      quality: preset.quality,
      grayscale: preset.grayscale
    });
  };

  return (
    <div className="bg-[#121217] rounded-2xl border border-[#272732] p-6 shadow-xl">
      <div className="flex items-center justify-between pb-5 border-b border-[#22222d] mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Compression Strategy</h3>
            <p className="text-xs text-[#a1a1aa]">Choose your optimization preset or tune parameters</p>
          </div>
        </div>

        <span className="text-xs font-mono text-[#71717a] hidden sm:inline">
          ENGINE: PDFBOX 3.0
        </span>
      </div>

      {/* Preset cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {presets.map((p) => {
          const isSelected = settings.preset === p.id;
          return (
            <div
              key={p.id}
              onClick={() => handlePresetSelect(p)}
              className={`relative cursor-pointer rounded-xl p-4 transition-all duration-200 border ${
                isSelected
                  ? 'border-red-500 bg-red-950/20 shadow-lg shadow-red-950/30'
                  : 'border-[#272732] bg-[#181820] hover:border-[#3f3f50] hover:bg-[#1d1d27]'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-500/20" />
              )}
              
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold font-mono uppercase px-2 py-0.5 rounded bg-black/40 text-red-400 border border-red-500/20">
                  {p.tag}
                </span>
              </div>

              <h4 className="font-bold text-white text-base mt-2">{p.title}</h4>
              <div className="text-sm font-semibold text-red-500 font-mono my-1">
                {p.ratio}
              </div>
              <p className="text-xs text-[#a1a1aa] leading-relaxed mt-2">
                {p.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Advanced Fine-Tuning */}
      <div className="bg-[#181820] rounded-xl border border-[#272732] p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span>Fine-Tuning Controls</span>
          </div>
          <span className="text-xs text-[#71717a]">Custom Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Quality Slider */}
          <div>
            <div className="flex justify-between text-xs font-medium text-[#a1a1aa] mb-2">
              <span className="flex items-center gap-1.5 text-white">
                <ImageIcon className="w-3.5 h-3.5 text-red-500" />
                Image Quality
              </span>
              <span className="font-mono text-red-400 font-bold">{settings.quality}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              step="5"
              value={settings.quality}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  preset: 'custom',
                  quality: Number(e.target.value)
                })
              }
              className="w-full accent-red-500 bg-[#272732] rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#71717a] mt-1 font-mono">
              <span>Smaller Size (20%)</span>
              <span>Higher Clarity (95%)</span>
            </div>
          </div>

          {/* DPI Resolution */}
          <div>
            <div className="flex justify-between text-xs font-medium text-[#a1a1aa] mb-2">
              <span className="text-white">Target Image DPI</span>
              <span className="font-mono text-red-400 font-bold">{settings.dpi} DPI</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[72, 150, 300].map((dpiVal) => (
                <button
                  key={dpiVal}
                  type="button"
                  onClick={() =>
                    onSettingsChange({
                      ...settings,
                      preset: 'custom',
                      dpi: dpiVal
                    })
                  }
                  className={`py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                    settings.dpi === dpiVal
                      ? 'bg-red-500 text-white border-red-600 shadow-md shadow-red-500/20'
                      : 'bg-[#20202a] text-[#a1a1aa] border-[#2d2d3a] hover:text-white'
                  }`}
                >
                  {dpiVal} DPI
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#272732]">
          <label className="flex items-center justify-between p-3 rounded-lg bg-[#121217] border border-[#272732] cursor-pointer hover:border-[#383848]">
            <div className="pr-3">
              <span className="text-xs font-bold text-white block">Strip Metadata</span>
              <span className="text-[11px] text-[#71717a] block">Removes XML, author, producer tags</span>
            </div>
            <input
              type="checkbox"
              checked={settings.stripMetadata}
              onChange={(e) =>
                onSettingsChange({ ...settings, stripMetadata: e.target.checked })
              }
              className="w-4 h-4 accent-red-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-[#121217] border border-[#272732] cursor-pointer hover:border-[#383848]">
            <div className="pr-3">
              <span className="text-xs font-bold text-white block">Convert to Grayscale</span>
              <span className="text-[11px] text-[#71717a] block">Greatly reduces size of text scans</span>
            </div>
            <input
              type="checkbox"
              checked={settings.grayscale}
              onChange={(e) =>
                onSettingsChange({ ...settings, grayscale: e.target.checked })
              }
              className="w-4 h-4 accent-red-500 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
