import React from 'react';
import { Layers, ShieldCheck, Zap, Cpu } from 'lucide-react';

export default function StatsBanner() {
  const features = [
    {
      icon: <Layers className="w-5 h-5 text-red-500" />,
      title: 'Object Stream Compression',
      desc: 'Optimizes cross-reference tables and FlateDecode streams using PDFBox 3.0 algorithms.'
    },
    {
      icon: <Zap className="w-5 h-5 text-red-500" />,
      title: 'Embedded Image Optimization',
      desc: 'Scans PDImageXObject resources, downsamples DPI, and recompresses high-res graphics.'
    },
    {
      icon: <Cpu className="w-5 h-5 text-red-500" />,
      title: 'Ultra Fast Processing',
      desc: 'High-throughput stream processing with multi-core Java & modern React front-end.'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-red-500" />,
      title: '100% Privacy & Security',
      desc: 'No third-party cloud uploads. Documents remain in your own private environment.'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
      {features.map((f, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-[#121217]/60 border border-[#22222d] hover:border-[#333342] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-[#181820] border border-[#272732] flex items-center justify-center mb-3">
            {f.icon}
          </div>
          <h4 className="text-sm font-bold text-white mb-1.5">{f.title}</h4>
          <p className="text-xs text-[#a1a1aa] leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}
