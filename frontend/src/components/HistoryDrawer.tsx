import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { History, X, Trash2, ArrowUpRight, Sparkles, ShieldCheck, FileImage, FileVideo } from 'lucide-react';

interface MediaThumbnailProps {
  url?: string;
  title?: string;
  isDark?: boolean;
}

const MediaThumbnail: React.FC<MediaThumbnailProps> = ({ url, title, isDark }) => {
  const [hasError, setHasError] = useState(false);

  if (!url || hasError) {
    const ext = title && title.includes('.') ? title.split('.').pop()?.toUpperCase() : 'MEDIA';
    const isVid = title?.toLowerCase().endsWith('.mp4') || title?.toLowerCase().endsWith('.mov') || title?.toLowerCase().endsWith('.webm');
    return (
      <div className={`w-12 h-12 rounded-lg border flex flex-col items-center justify-center p-1 text-center shrink-0 ${
        isDark ? 'bg-zinc-800/90 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-zinc-600'
      }`}>
        {isVid ? (
          <FileVideo className="w-4 h-4 text-indigo-400 mb-0.5" />
        ) : (
          <FileImage className="w-4 h-4 text-purple-400 mb-0.5" />
        )}
        <span className="text-[8px] font-mono font-bold leading-none truncate max-w-full uppercase">{ext?.slice(0, 4)}</span>
      </div>
    );
  }

  const isVideo = url.startsWith('data:video') || url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm');

  if (isVideo) {
    return (
      <video
        src={url}
        className={`w-12 h-12 object-cover rounded-lg border shrink-0 ${isDark ? 'border-zinc-700' : 'border-slate-200'}`}
        onError={() => setHasError(true)}
        muted
        playsInline
      />
    );
  }

  return (
    <img
      src={url}
      alt={title || "Media preview"}
      className={`w-12 h-12 object-cover rounded-lg border shrink-0 ${isDark ? 'border-zinc-700' : 'border-slate-200'}`}
      onError={() => setHasError(true)}
    />
  );
};

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryItem: (item: HistoryItem) => void;
  theme?: 'dark' | 'light';
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onClearHistory,
  onSelectHistoryItem,
  theme = 'dark',
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className={`relative w-full max-w-md h-full flex flex-col shadow-2xl transition-colors duration-300 ${
        isDark ? 'bg-[#0f0f15] border-l border-zinc-800 text-zinc-100' : 'bg-white border-l border-slate-200 text-zinc-900'
      }`}>
        
        {/* Drawer Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-zinc-800 bg-[#161620]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <History className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-700'}`} />
            <h2 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>Recent Processing Sessions</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white' : 'bg-slate-200/60 hover:bg-slate-200 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className={`text-center py-12 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
              <History className={`w-8 h-8 mx-auto mb-2 opacity-30 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} />
              <p>No recent processing sessions saved yet.</p>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-zinc-600' : 'text-zinc-500'}`}>Processed face swaps and forensic scans will automatically appear here.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistoryItem(item);
                  onClose();
                }}
                className={`group relative p-3 rounded-xl border transition-all cursor-pointer shadow-sm ${
                  isDark
                    ? 'bg-[#181822] hover:bg-[#20202e] border-zinc-800 hover:border-purple-500/40'
                    : 'bg-slate-50 hover:bg-purple-50/50 border-slate-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {item.type === 'swap' ? (
                      <span className={`p-1 rounded border ${
                        isDark ? 'bg-purple-950/60 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-200'
                      }`}>
                        <Sparkles className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className={`p-1 rounded border ${
                        isDark ? 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30' : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                      }`}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <div>
                      <h4 className={`font-semibold text-xs transition-colors line-clamp-1 ${
                        isDark ? 'text-zinc-200 group-hover:text-purple-300' : 'text-zinc-900 group-hover:text-purple-900'
                      }`}>
                        {item.sourceTitle}
                      </h4>
                      <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{item.timestamp}</p>
                    </div>
                  </div>

                  <ArrowUpRight className={`w-4 h-4 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                    isDark ? 'text-zinc-500 group-hover:text-purple-400' : 'text-zinc-400 group-hover:text-purple-700'
                  }`} />
                </div>

                {/* Thumbnails preview */}
                <div className="mt-2.5 flex items-center gap-2">
                  <MediaThumbnail url={item.sourceUrl} title={item.sourceTitle} isDark={isDark} />
                  {item.targetUrl && (
                    <>
                      <span className={`font-bold text-xs ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>+</span>
                      <MediaThumbnail url={item.targetUrl} title="Target" isDark={isDark} />
                    </>
                  )}
                  {item.detectionVerdict && (
                    <div className={`px-2 py-1 rounded text-[10px] font-bold ${
                      item.detectionVerdict.includes('Deepfake') 
                        ? isDark ? 'bg-rose-950/50 text-rose-300 border border-rose-500/30' : 'bg-rose-100 text-rose-800 border border-rose-200'
                        : isDark ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {item.detectionVerdict} ({item.confidence}%)
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={`p-4 border-t flex items-center justify-between ${
            isDark ? 'border-zinc-800 bg-[#161620]' : 'border-slate-200 bg-slate-50'
          }`}>
            <span className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{items.length} saved sessions</span>
            <button
              onClick={onClearHistory}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                isDark
                  ? 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border-rose-500/30'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
