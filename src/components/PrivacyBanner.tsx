import React, { useState } from 'react';
import { Zap, X, Lock } from 'lucide-react';

interface PrivacyBannerProps {
  theme?: 'dark' | 'light';
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({ theme = 'dark' }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const isDark = theme === 'dark';

  return (
    <div className={`border-b py-2 px-3 sm:px-6 text-xs transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-r from-zinc-950 via-purple-950/40 to-zinc-950 border-zinc-800 text-zinc-200'
        : 'bg-gradient-to-r from-purple-50 via-indigo-50/70 to-slate-50 border-purple-100 text-zinc-800 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`flex-shrink-0 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full border ${
            isDark
              ? 'bg-purple-900/40 text-purple-300 border-purple-500/30'
              : 'bg-purple-100 text-purple-700 border-purple-200'
          }`}>
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <div className={`text-[11px] sm:text-xs min-w-0 ${isDark ? 'text-zinc-200 font-medium' : 'text-zinc-800 font-medium'}`}>
            <span className={`font-bold mr-1 ${isDark ? 'text-purple-300' : 'text-purple-900'}`}>
              Instant Session Processing:
            </span>
            <span className="hidden sm:inline">
              No sign-up or accounts required. Upload media directly for immediate neural processing. All files remain strictly in volatile browser/server memory and are automatically cleared.
            </span>
            <span className="inline sm:hidden text-zinc-300">
              No sign-up required. Upload media for immediate neural processing.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`hidden lg:flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border font-medium ${
            isDark
              ? 'text-purple-200 bg-purple-950/50 border-purple-500/30'
              : 'text-purple-900 bg-purple-100/80 border-purple-200'
          }`}>
            <Lock className={`w-3 h-3 ${isDark ? 'text-purple-300' : 'text-purple-700'}`} />
            <span>Zero Data Logging</span>
          </span>
          <button
            onClick={() => setDismissed(true)}
            className={`p-1 rounded-md transition-colors ${
              isDark
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'text-zinc-400 hover:text-zinc-800 hover:bg-slate-200/60'
            }`}
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
