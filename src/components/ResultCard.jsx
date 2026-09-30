import React from 'react';
import { Download, RefreshCw, CheckCircle2, ArrowRight, Zap, FileText } from 'lucide-react';

export default function ResultCard({ results, onReset }) {
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate totals
  const totalOriginal = results.reduce((acc, r) => acc + r.originalSize, 0);
  const totalCompressed = results.reduce((acc, r) => acc + r.compressedSize, 0);
  const totalSavedPercent = Math.max(
    0,
    Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100)
  );

  const handleDownload = (result) => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.name.replace(/\.pdf$/i, '_compressed.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    results.forEach((r) => handleDownload(r));
  };

  return (
    <div className="bg-[#121217] rounded-2xl border border-[#272732] p-6 sm:p-8 shadow-2xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#22222d]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Compression Complete!
            </h3>
            <p className="text-xs text-[#a1a1aa]">
              Your PDF documents have been successfully optimized
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-mono font-bold text-sm">
          <Zap className="w-4 h-4 text-red-500" />
          <span>-{totalSavedPercent}% REDUCTION</span>
        </div>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className="bg-[#181820] rounded-xl p-4 border border-[#272732]">
          <span className="text-xs text-[#71717a] font-mono uppercase">Original Size</span>
          <div className="text-xl font-extrabold text-white font-mono mt-1">
            {formatSize(totalOriginal)}
          </div>
        </div>

        <div className="bg-[#181820] rounded-xl p-4 border border-[#272732]">
          <span className="text-xs text-[#71717a] font-mono uppercase">Compressed Size</span>
          <div className="text-xl font-extrabold text-red-500 font-mono mt-1">
            {formatSize(totalCompressed)}
          </div>
        </div>

        <div className="bg-[#181820] rounded-xl p-4 border border-red-500/30 bg-red-950/20">
          <span className="text-xs text-red-400 font-mono uppercase">Total Space Saved</span>
          <div className="text-xl font-extrabold text-white font-mono mt-1">
            {formatSize(totalOriginal - totalCompressed)}
          </div>
        </div>
      </div>

      {/* Visual Size Bar */}
      <div className="bg-[#181820] rounded-xl p-5 border border-[#272732] mb-6">
        <div className="flex justify-between text-xs font-mono text-[#a1a1aa] mb-2">
          <span>SIZE FOOTPRINT COMPARISON</span>
          <span>{totalSavedPercent}% Saved</span>
        </div>

        <div className="w-full h-3 rounded-full bg-[#272732] overflow-hidden flex">
          <div
            style={{ width: `${100 - totalSavedPercent}%` }}
            className="h-full bg-red-500 rounded-full transition-all duration-1000 shadow-sm shadow-red-500"
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-[#71717a] font-mono mt-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            New size: {formatSize(totalCompressed)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3f3f50] inline-block" />
            Original: {formatSize(totalOriginal)}
          </span>
        </div>
      </div>

      {/* File-by-File List */}
      <div className="space-y-3 mb-8">
        <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider block">
          Optimized Files ({results.length})
        </span>

        {results.map((r, idx) => {
          const savedPct = Math.round(
            ((r.originalSize - r.compressedSize) / r.originalSize) * 100
          );
          return (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#181820] border border-[#272732] gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-red-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                    {r.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#71717a] mt-0.5">
                    <span className="line-through">{formatSize(r.originalSize)}</span>
                    <ArrowRight className="w-3 h-3 text-[#a1a1aa]" />
                    <span className="text-white font-bold">{formatSize(r.compressedSize)}</span>
                    <span className="text-red-400 font-bold">(-{savedPct}%)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownload(r)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#22222d]">
        <button
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#181820] hover:bg-[#20202a] text-white border border-[#272732] hover:border-[#383848] text-sm font-semibold transition-all"
        >
          <RefreshCw className="w-4 h-4 text-red-500" />
          <span>Compress Another Document</span>
        </button>

        {results.length > 1 && (
          <button
            onClick={handleDownloadAll}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download All ({results.length} files)</span>
          </button>
        )}
      </div>
    </div>
  );
}
