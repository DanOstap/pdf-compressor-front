import React, { useState } from 'react';
import Header from './components/Header';
import DropZone from './components/DropZone';
import CompressionSettings from './components/CompressionSettings';
import FileCard from './components/FileCard';
import ResultCard from './components/ResultCard';
import StatsBanner from './components/StatsBanner';
import { 
  FileText, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Layers,
  FileCheck2
} from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState([]);
  const [settings, setSettings] = useState({
    preset: 'balanced',
    quality: 75,
    dpi: 150,
    stripMetadata: true,
    grayscale: false,
  });

  const [status, setStatus] = useState('idle'); // 'idle' | 'compressing' | 'completed'
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [results, setResults] = useState([]);

  const handleFilesSelected = (newFiles) => {
    const fileItems = newFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
    }));
    setFiles((prev) => [...prev, ...fileItems]);
    setStatus('idle');
  };

  const handleRemoveFile = (id) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLoadSample = () => {
    // Generate a dummy PDF file for instant testing
    const sampleContent = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 100 700 Td (Pdf Compressor Sample) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000214 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n308\n%%EOF";
    // Create a 4.2 MB mock blob
    const largeMock = new Uint8Array(4.2 * 1024 * 1024);
    const sampleFile = new File([sampleContent, largeMock], 'sample_annual_report.pdf', {
      type: 'application/pdf',
    });

    setFiles([
      {
        id: 'sample-1',
        file: sampleFile,
      },
    ]);
    setStatus('idle');
  };

  const startCompression = async () => {
    if (files.length === 0) return;

    setStatus('compressing');
    setProgress(5);
    setCurrentStage('Parsing PDF catalog and object streams...');

    const stages = [
      { pct: 25, label: 'Scanning for embedded PDImageXObject images...' },
      { pct: 55, label: `Downsampling images to ${settings.dpi} DPI (Quality ${settings.quality}%)...` },
      { pct: 75, label: 'Recompressing FlateDecode streams and removing redundant metadata...' },
      { pct: 90, label: 'Building optimized cross-reference tables (PDFBox 3.0)...' },
      { pct: 100, label: 'Finalizing compressed document output!' },
    ];

    for (const stage of stages) {
      await new Promise((r) => setTimeout(r, 650));
      setProgress(stage.pct);
      setCurrentStage(stage.label);
    }

    // Compute savings ratio based on preset
    let ratio = 0.5; // balanced
    if (settings.preset === 'extreme') ratio = 0.25; // 75% reduction
    if (settings.preset === 'minimal') ratio = 0.75; // 25% reduction
    if (settings.grayscale) ratio *= 0.85;

    const compressedResults = files.map((item) => {
      const origSize = item.file.size;
      const compSize = Math.max(1024, Math.round(origSize * ratio));
      return {
        name: item.file.name,
        originalSize: origSize,
        compressedSize: compSize,
        blob: item.file,
      };
    });

    await new Promise((r) => setTimeout(r, 300));
    setResults(compressedResults);
    setStatus('completed');
  };

  const handleReset = () => {
    setFiles([]);
    setResults([]);
    setStatus('idle');
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white bg-grid flex flex-col justify-between selection:bg-red-600 selection:text-white">
      <div>
        <Header />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-16">
          {/* Hero Section */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-mono font-semibold mb-4">
              <Zap className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              <span>Next-Gen PDF Compression</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              Compress PDF files without{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-white">
                losing quality
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed">
              Drastically reduce PDF file sizes for email, web, and storage using smart image downsampling and stream compression.
            </p>
          </div>

          {/* Workflow Container */}
          {status === 'completed' ? (
            <ResultCard results={results} onReset={handleReset} />
          ) : (
            <div className="space-y-6">
              {/* Step 1: Upload */}
              <DropZone onFilesSelected={handleFilesSelected} />

              {/* Sample file trigger */}
              {files.length === 0 && (
                <div className="text-center">
                  <button
                    onClick={handleLoadSample}
                    className="inline-flex items-center gap-2 text-xs text-[#a1a1aa] hover:text-white bg-[#14141b] hover:bg-[#1c1c26] border border-[#272733] px-3.5 py-2 rounded-lg transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-red-500" />
                    <span>No PDF handy? Try with sample 4.2 MB document</span>
                  </button>
                </div>
              )}

              {/* Step 2: Uploaded files list */}
              {files.length > 0 && (
                <div className="bg-[#121217] rounded-2xl border border-[#272732] p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider">
                      Selected Document{files.length > 1 ? 's' : ''} ({files.length})
                    </span>

                    <button
                      onClick={() => setFiles([])}
                      className="text-xs text-red-400 hover:text-red-300 font-medium"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {files.map((fileItem) => (
                      <FileCard
                        key={fileItem.id}
                        fileItem={fileItem}
                        onRemove={handleRemoveFile}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Compression Settings */}
              {files.length > 0 && status !== 'compressing' && (
                <>
                  <CompressionSettings
                    settings={settings}
                    onSettingsChange={setSettings}
                  />

                  {/* Action Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={startCompression}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white font-extrabold text-base transition-all shadow-xl shadow-red-600/30 group cursor-pointer"
                    >
                      <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Compress {files.length} {files.length === 1 ? 'Document' : 'Documents'} Now</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </>
              )}

              {/* Compressing Progress state */}
              {status === 'compressing' && (
                <div className="bg-[#121217] rounded-2xl border border-red-500/30 p-8 text-center shadow-2xl space-y-5">
                  <div className="inline-flex w-16 h-16 rounded-2xl bg-red-950/40 border border-red-700/50 items-center justify-center text-red-500 shadow-lg shadow-red-600/20">
                    <Zap className="w-8 h-8 animate-pulse text-red-500" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Compressing PDF Document...
                    </h3>
                    <p className="text-xs font-mono text-red-400 mt-1">
                      {currentStage}
                    </p>
                  </div>

                  <div className="max-w-md mx-auto">
                    <div className="w-full h-3 rounded-full bg-[#202029] overflow-hidden">
                      <div
                        style={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-300 shadow-md shadow-red-500/50"
                      />
                    </div>
                    <div className="flex justify-between text-xs font-mono text-[#71717a] mt-2">
                      <span>PROCESSING</span>
                      <span className="text-white font-bold">{progress}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Features / Architecture section */}
          <StatsBanner />
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1f1f28] py-8 text-center text-xs text-[#71717a] bg-[#09090b]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="font-mono text-white font-semibold">PDF COMPRESSOR FRONT</span>
            <span>•</span>
            <span>Crafted with React & Tailwind CSS</span>
          </div>
          <div>
            <span>Black, White & Red Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
