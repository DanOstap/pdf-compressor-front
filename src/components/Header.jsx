import React from 'react';
import { FileText, Github, Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-[#272732] bg-[#0c0c10]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/30">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white font-mono">
                PDF<span className="text-red-500">.</span>COMPRESSOR
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                PRO
              </span>
            </div>
            <p className="text-xs text-[#71717a]">Fast, Secure & Lossless PDF Optimization</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#a1a1aa] bg-[#181820] px-3 py-1.5 rounded-lg border border-[#272732]">
            <Zap className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>Java PDFBox Engine Ready</span>
          </div>

          <a
            href="https://github.com/DanOstap/pdf-compressor-front"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs font-semibold text-white bg-[#181820] hover:bg-[#22222d] hover:border-red-500/50 border border-[#272732] px-3.5 py-2 rounded-lg transition-all"
          >
            <Github className="w-4 h-4 text-white" />
            <span className="hidden md:inline">GitHub</span>
          </a>
        </div>

      </div>
    </header>
  );
}
