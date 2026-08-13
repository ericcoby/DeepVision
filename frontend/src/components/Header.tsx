import React from 'react';
import { ActiveTab } from '../types';
import { ShieldCheck, History, Lock, Sun, Moon } from 'lucide-react';
import logoImg from '../assets/images/deepvision_user_logo_1785929420188.jpg';

interface HeaderProps {
  activeTab?: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
  onOpenHistory: () => void;
  onOpenEthics: () => void;
  onOpenInstall?: () => void;
  isStandalone?: boolean;
  historyCount: number;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenEthics,
  onOpenInstall,
  isStandalone = false,
  historyCount,
  theme = 'dark',
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${
      isDark
        ? 'bg-[#121218]/95 border-zinc-800/80 shadow-md'
        : 'bg-white/95 border-slate-200 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
            <div className={`relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border shadow-sm shrink-0 bg-white ${
              isDark ? 'border-zinc-700' : 'border-slate-200'
            }`}>
              <img 
                src={logoImg} 
                alt="DeepVision Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`font-extrabold text-base sm:text-xl tracking-tight leading-none truncate ${
                  isDark ? 'text-white' : 'text-zinc-900'
                }`}>
                  DEEPVISION
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] flex items-center gap-1 min-w-0 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full animate-ping shrink-0 inline-block ${
                  isDark ? 'bg-purple-400' : 'bg-purple-600'
                }`} />
                <span className={`font-medium truncate ${
                  isDark ? 'text-zinc-300' : 'text-zinc-600'
                }`}>
                  Forensic Deepfake & Media Verification Engine
                </span>
              </p>
            </div>
          </div>

          {/* Single Feature Indicator (Desktop/Tablet) */}
          <div className={`hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold shrink-0 ${
            isDark 
              ? 'bg-purple-950/60 border-purple-500/30 text-purple-200' 
              : 'bg-purple-50 border-purple-200 text-purple-900'
          }`}>
            <ShieldCheck className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-700'}`} />
            <span>Forensic Detection Active</span>
          </div>

          {/* Actions, History & Theme Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all border ${
                  isDark
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700/80 hover:border-zinc-500'
                    : 'bg-white hover:bg-slate-100 text-zinc-800 border-slate-300'
                }`}
                title="Switch Background Color Scheme"
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="hidden md:inline">Turn on lights</span>
                    <span className="inline md:hidden text-[11px]">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="hidden md:inline">Turn off lights</span>
                    <span className="inline md:hidden text-[11px]">Dark</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onOpenHistory}
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-zinc-800'
              }`}
              title="Recent Processed Session History"
            >
              <History className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDark ? 'text-purple-400' : 'text-purple-700'} shrink-0`} />
              <span className="hidden sm:inline">History</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-600 text-[10px] text-white font-bold">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenEthics}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-zinc-700'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="hidden sm:inline">Ethics & Privacy</span>
              <span className="inline sm:hidden text-[11px]">Ethics</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};

