import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PrivacyBanner } from './components/PrivacyBanner';
import { DetectionStudio } from './components/DetectionStudio';
import { HistoryDrawer } from './components/HistoryDrawer';
import { EthicsModal } from './components/EthicsModal';
import { InstallPwaModal } from './components/InstallPwaModal';
import { PresetSource, HistoryItem } from './types';
import { Smartphone, X, Download } from 'lucide-react';
import logoImg from './assets/images/deepvision_user_logo_1785929420188.jpg';

import { getPresetSources } from './services/apiService';

export default function App() {
  const [presetSources, setPresetSources] = useState<PresetSource[]>([]);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [showMobileBanner, setShowMobileBanner] = useState(true);
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone === true
      );
    }
    return false;
  });

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (evt: MediaQueryListEvent) => {
      setIsStandalone(evt.matches);
    };
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const handleTriggerNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted PWA installation');
      }
      setDeferredPrompt(null);
    } else {
      setIsInstallOpen(true);
    }
  };

  // Background Color Scheme Theme ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('deepvision_theme') as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('deepvision_theme', next);
      } catch (e) {
        console.error('Failed to save theme setting', e);
      }
      return next;
    });
  };

  // Modals & Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEthicsOpen, setIsEthicsOpen] = useState(false);

  // Local History Persistence
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('deepvision_history') || localStorage.getItem('deepswap_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load preset sample media on mount via frontend API service
  useEffect(() => {
    getPresetSources()
      .then((sources) => {
        if (sources) setPresetSources(sources);
      })
      .catch((err) => {
        console.error('Failed to load presets:', err);
      });
  }, []);

  // Save history items to localStorage
  const handleAddHistory = (item: HistoryItem) => {
    setHistoryItems((prev) => {
      const updated = [item, ...prev].slice(0, 20); // Keep last 20
      try {
        localStorage.setItem('deepvision_history', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save history', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistoryItems([]);
    localStorage.removeItem('deepvision_history');
    localStorage.removeItem('deepswap_history');
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-purple-600 selection:text-white relative overflow-x-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#08080c] text-zinc-100' : 'bg-[#f4f4f7] text-zinc-900'
    }`}>
      {/* Background Subtle Gradient Glows */}
      {isDark ? (
        <>
          <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-900/15 rounded-full blur-[160px] pointer-events-none -z-10" />
        </>
      ) : (
        <>
          <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-200/50 rounded-full blur-[120px] pointer-events-none -z-10" />
          <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-200/50 rounded-full blur-[140px] pointer-events-none -z-10" />
        </>
      )}

      {/* Top Privacy & Direct Access Notice */}
      <PrivacyBanner theme={theme} />

      {/* Main Header with Top-Right Theme Switcher & Install App Buttons */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenEthics={() => setIsEthicsOpen(true)}
        onOpenInstall={() => setIsInstallOpen(true)}
        isStandalone={isStandalone}
        historyCount={historyItems.length}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Floating Mobile Web App Installation Banner (if not installed as PWA) */}
      {!isStandalone && showMobileBanner && (
        <div className={`sm:hidden sticky top-16 z-30 px-4 py-2.5 border-b flex items-center justify-between gap-3 text-xs shadow-md transition-colors ${
          isDark 
            ? 'bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-purple-900/90 border-purple-500/30 text-purple-100' 
            : 'bg-purple-600 border-purple-700 text-white'
        }`}>
          <div className="flex items-center gap-2 overflow-hidden cursor-pointer" onClick={() => setIsInstallOpen(true)}>
            <img src={logoImg} alt="DeepVision Logo" className="w-5 h-5 rounded-md object-cover border border-white/30 shrink-0" />
            <span className="font-semibold truncate">
              {deferredPrompt ? 'Tap to Install Mobile App' : 'Add DeepVision to Home Screen'}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleTriggerNativeInstall}
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] backdrop-blur-sm transition-all"
            >
              Install
            </button>
            <button
              onClick={() => setShowMobileBanner(false)}
              className="p-1 text-white/70 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Primary Workspace View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DetectionStudio
          presetSources={presetSources}
          onAddHistory={handleAddHistory}
          theme={theme}
          onOpenInstall={() => setIsInstallOpen(true)}
          isStandalone={isStandalone}
        />
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 text-xs mt-12 transition-colors duration-300 ${
        isDark
          ? 'bg-[#0d0d14] border-zinc-800/80 text-zinc-400'
          : 'bg-white border-slate-200 text-zinc-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>DEEPVISION</span>
            <span>• Direct Access Synthetic Media & Forensic Intelligence Workspace</span>
          </div>
          <div className={`flex items-center gap-4 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            <button onClick={() => setIsEthicsOpen(true)} className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-zinc-900'}`}>
              Ethics & Standards
            </button>
            <button onClick={() => setIsHistoryOpen(true)} className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-zinc-900'}`}>
              Session History
            </button>
          </div>
        </div>
      </footer>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={historyItems}
        onClearHistory={handleClearHistory}
        onSelectHistoryItem={() => {}}
        theme={theme}
      />

      {/* Ethics & Privacy Modal */}
      <EthicsModal
        isOpen={isEthicsOpen}
        onClose={() => setIsEthicsOpen(false)}
        theme={theme}
      />

      {/* PWA Install Guide & Native Prompt Modal */}
      <InstallPwaModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallClick={handleTriggerNativeInstall}
        isStandalone={isStandalone}
        theme={theme}
      />

    </div>
  );
}

