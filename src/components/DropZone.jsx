import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';

export default function DropZone({ onFilesSelected }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setErrorMsg('');

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileChange = (e) => {
    setErrorMsg('');
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files) => {
    if (files.length === 0) return;

    const pdfFiles = files.filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (pdfFiles.length === 0) {
      setErrorMsg('Please select a valid PDF file.');
      return;
    }

    onFilesSelected(pdfFiles);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-10 sm:p-14 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-red-500 bg-red-500/5 shadow-2xl shadow-red-500/20 scale-[1.01]'
            : 'border-[#2e2e3a] hover:border-red-500/60 bg-[#121217]/70 hover:bg-[#16161d]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-4">
          <div
            className={`w-18 h-18 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isDragOver
                ? 'bg-red-600 text-white scale-110 shadow-lg shadow-red-600/50'
                : 'bg-[#1e1e26] text-red-500 group-hover:bg-red-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-red-500/30'
            }`}
          >
            <UploadCloud className="w-9 h-9" />
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Drag & Drop your <span className="text-red-500">PDF</span> here
            </h3>
            <p className="text-sm text-[#a1a1aa] mt-1">
              or <span className="text-white underline decoration-red-500 underline-offset-4 font-semibold">browse files</span> from your computer
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#71717a] font-mono mt-1">
            <span className="px-2.5 py-1 rounded-md bg-[#1a1a24] border border-[#272733]">
              PDF ONLY
            </span>
            <span>•</span>
            <span>Batch Upload Supported</span>
            <span>•</span>
            <span>Max 150 MB</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-950/40 border border-red-800/60 px-4 py-2.5 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
