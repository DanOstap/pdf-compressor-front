import React from 'react';
import { FileText, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function FileCard({ fileItem, onRemove }) {
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[#14141a] border border-[#272733] hover:border-[#383848] transition-all">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-red-950/40 border border-red-800/40 flex items-center justify-center shrink-0 text-red-500">
          <FileText className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
            {fileItem.file.name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-[#71717a] font-mono mt-0.5">
            <span>{formatSize(fileItem.file.size)}</span>
            <span>•</span>
            <span className="text-red-400">Ready to compress</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onRemove(fileItem.id)}
        className="p-2 rounded-lg text-[#71717a] hover:text-red-400 hover:bg-red-950/30 transition-colors"
        title="Remove file"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
