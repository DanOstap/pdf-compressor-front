import React, { useState } from 'react';
import Header from './components/Header';
import DropZone from './components/DropZone';
import CompressionSettings from './components/CompressionSettings';
import FileCard from './components/FileCard';
import ResultCard from './components/ResultCard';
import StatsBanner from './components/StatsBanner';
import { compressPdfWithBackend, DEFAULT_BACKEND_URL } from './api/compressService';
import { 
  FileText, 
  Zap, 
  ArrowRight, 
  AlertCircle, 
  Server, 
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState([]);
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [settings, setSettings] = useState({
    preset: 'balanced',
    quality: 75,
    dpi: 150,
    stripMetadata: true,
    grayscale: false,
  });

  const [status, setStatus] = useState('idle'); // 'idle' | 'compressing' | 'completed' | 'error'
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [results, setResults] = useState([]);

  const handleFilesSelected = (newFiles) => {
    const fileItems = newFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
    }));
    setFiles((prev) => [...prev, ...fileItems]);
    setStatus('idle');
    setErrorMessage('');
  };

  const handleRemoveFile = (id) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const startCompression = async () => {
    if (files.length === 0) return;

    setStatus('compressing');
    setErrorMessage('');
    setCurrentFileIndex(0);

    const processedResults = [];

    try {
      for (let i = 0; i < files.length; i++) {
        setCurrentFileIndex(i);
        const item = files[i];

        // Send to backend endpoint
        const result = await compressPdfWithBackend(item.file, settings, backendUrl);
        processedResults.push(result);
      }

      setResults(processedResults);
      setStatus('completed');
    } catch (err) {
      console.error('Backend compression failed:', err);
      setStatus('error');
      setErrorMessage(
        err.message || 'Failed to connect to the backend compression service.'
      );
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResults([]);
    setStatus('idle');
    setErrorMessage('');
    setCurrentFileIndex(0);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white bg-grid flex flex-col justify-between selection:bg-red-600 selection:text-white">
      <div>
        <Header />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-16">
          {/* Hero Section */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-mono font-semibold mb-4">
              <Server className="w-3.5 h-3.5 text-red-500" />
              <span>Backend-Powered Architecture</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              Compress PDF files with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-white">
                Java Backend
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed">
              Upload your documents and let your Java backend handle heavy PDFBox image downsampling and stream compression.
            </p>

            {/* Backend URL Toggle */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#71717a]">
              <span>API Endpoint:</span>
              <code className="text-red-400 font-mono bg-[#14141c] px-2.5 py-1 rounded border border-[#272733]">
                {backendUrl}
              </code>
              <button
                type="button"
                onClick={() => setShowServerConfig(!showServerConfig)}
                className="text-white hover:text-red-400 underline decoration-red-500 ml-1 flex items-center gap-1 cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>{showServerConfig ? 'Hide' : 'Configure'}</span>
              </button>
            </div>

            {showServerConfig && (
              <div className="mt-3 max-w-md mx-auto p-3.5 rounded-xl bg-[#14141c] border border-[#272733] text-left">
                <label className="block text-xs font-bold text-white mb-1.5 font-mono">
                  Custom Backend Endpoint URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    placeholder="http://localhost:8080/api/compress"
                    className="flex-1 bg-black border border-[#2e2e3e] focus:border-red-500 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none"
                  />
                  <button
                    onClick={() => setBackendUrl(DEFAULT_BACKEND_URL)}
                    className="px-3 py-1.5 rounded-lg bg-[#20202a] text-xs font-semibold hover:bg-[#2b2b38] text-white"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Workflow Container */}
          {status === 'completed' ? (
            <ResultCard results={results} onReset={handleReset} />
          ) : (
            <div className="space-y-6">
              {/* Step 1: Upload */}
              <DropZone onFilesSelected={handleFilesSelected} />

              {/* Step 2: Uploaded files list */}
              {files.length > 0 && (
                <div className="bg-[#121217] rounded-2xl border border-[#272732] p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider">
                      Selected Document{files.length > 1 ? 's' : ''} ({files.length})
                    </span>

                    <button
                      onClick={() => setFiles([])}
                      className="text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer"
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
                      <span>Send to Backend ({files.length} {files.length === 1 ? 'file' : 'files'})</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </>
              )}

              {/* Error State */}
              {status === 'error' && (
                <div className="p-6 rounded-2xl bg-red-950/30 border border-red-800/60 shadow-xl space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-base font-bold text-white">Backend Connection Error</h4>
                      <p className="text-xs font-mono text-red-300 mt-1">{errorMessage}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-black/50 border border-red-900/40 text-xs text-[#a1a1aa] space-y-2 font-mono">
                    <span className="text-white font-bold block">💡 How to resolve:</span>
                    <p>1. Ensure your Java backend is running on <code className="text-red-400">{backendUrl}</code>.</p>
                    <p>2. Verify that your backend exposes a <code className="text-red-400">POST /api/compress</code> endpoint accepting <code className="text-white">multipart/form-data</code> with field name <code className="text-red-400">file</code>.</p>
                    <p>3. Enable CORS on the backend for <code className="text-red-400">http://localhost:3000</code>.</p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={startCompression}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Retry Request</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Compressing Progress state */}
              {status === 'compressing' && (
                <div className="bg-[#121217] rounded-2xl border border-red-500/30 p-8 text-center shadow-2xl space-y-5">
                  <div className="inline-flex w-16 h-16 rounded-2xl bg-red-950/40 border border-red-700/50 items-center justify-center text-red-500 shadow-lg shadow-red-600/20">
                    <Server className="w-8 h-8 animate-pulse text-red-500" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Processing on Backend...
                    </h3>
                    <p className="text-xs font-mono text-red-400 mt-1">
                      Sending file {currentFileIndex + 1} of {files.length}: {files[currentFileIndex]?.file?.name}
                    </p>
                    <p className="text-xs text-[#71717a] mt-1 font-mono">
                      Target: {backendUrl}
                    </p>
                  </div>

                  <div className="max-w-md mx-auto">
                    <div className="w-full h-2 rounded-full bg-[#202029] overflow-hidden">
                      <div className="h-full bg-red-500 animate-pulse w-full rounded-full" />
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
            <span>Client UI for Java Backend</span>
          </div>
          <div>
            <span>Black, White & Red Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
