import React, { useState, useEffect } from 'react';
import { Smartphone, Share, PlusSquare, Download, CheckCircle2, X, ExternalLink, Globe, Monitor, Apple, Shield, Compass, AlertCircle } from 'lucide-react';
import logoImg from '../assets/images/deepvision_user_logo_1785929420188.jpg';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallClick: () => void;
  isStandalone: boolean;
  theme?: 'dark' | 'light';
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallClick,
  isStandalone,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // Detect Mobile User Agent & Browser Type
  const [detectedBrowser, setDetectedBrowser] = useState<
    'ios_safari' | 'ios_other' | 'android_chrome' | 'samsung' | 'firefox' | 'opera' | 'desktop'
  >('android_chrome');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const isSamsung = /SamsungBrowser/i.test(ua);
    const isFirefox = /Firefox/i.test(ua) || /FxiOS/i.test(ua);
    const isOpera = /OPR\//i.test(ua) || /OPT\//i.test(ua);
    const isCriOS = /CriOS/i.test(ua); // Chrome on iOS

    if (isIOS) {
      if (isCriOS || isFirefox) {
        setDetectedBrowser('ios_other');
      } else {
        setDetectedBrowser('ios_safari');
      }
    } else if (isAndroid) {
      if (isSamsung) setDetectedBrowser('samsung');
      else if (isFirefox) setDetectedBrowser('firefox');
      else if (isOpera) setDetectedBrowser('opera');
      else setDetectedBrowser('android_chrome');
    } else {
      setDetectedBrowser('desktop');
    }
  }, []);

  const [activeTab, setActiveTab] = useState<
    'ios_safari' | 'android_chrome' | 'samsung' | 'firefox' | 'desktop'
  >('android_chrome');

  // Auto-set active tab on modal open
  useEffect(() => {
    if (isOpen) {
      if (detectedBrowser === 'ios_safari' || detectedBrowser === 'ios_other') {
        setActiveTab('ios_safari');
      } else if (detectedBrowser === 'samsung') {
        setActiveTab('samsung');
      } else if (detectedBrowser === 'firefox' || detectedBrowser === 'opera') {
        setActiveTab('firefox');
      } else if (detectedBrowser === 'desktop') {
        setActiveTab('desktop');
      } else {
        setActiveTab('android_chrome');
      }
    }
  }, [isOpen, detectedBrowser]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          isDark ? 'bg-[#12121a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-zinc-900'
        }`}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-zinc-800 bg-[#161622]' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-purple-500/40 shadow-sm shrink-0 bg-white">
              <img src={logoImg} alt="DeepVision App Icon" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Install DeepVision Web App</h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Standalone PWA installation for iOS, Android, and Desktop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-slate-200 text-zinc-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Direct Install Banner if native browser prompt available */}
          {deferredPrompt && !isStandalone && (
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isDark 
                ? 'bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-purple-950/40 border-purple-500/40' 
                : 'bg-purple-50 border-purple-200'
            }`}>
              <div className="flex items-center gap-3">
                <Download className="w-8 h-8 text-purple-400 animate-bounce" />
                <div>
                  <h3 className="font-bold text-sm text-purple-300">Direct 1-Click Native Install Available!</h3>
                  <p className="text-xs text-purple-200/80">Your browser supports instant Web App installation.</p>
                </div>
              </div>
              <button
                onClick={onInstallClick}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Install App Now</span>
              </button>
            </div>
          )}

          {isStandalone && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${
              isDark ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-bold">DeepVision is active as an installed Standalone Web App!</p>
                <p className="opacity-80">You have full screen access with offline capabilities and camera support.</p>
              </div>
            </div>
          )}

          {/* Detected Browser Indicator Badge */}
          <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            isDark ? 'bg-purple-950/30 border-purple-500/30 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-900'
          }`}>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                Detected Browser:{' '}
                <strong className="text-purple-300">
                  {detectedBrowser === 'ios_safari' && 'iOS Safari (iPhone / iPad)'}
                  {detectedBrowser === 'ios_other' && 'iOS Chrome / Firefox (Requires Safari for PWA)'}
                  {detectedBrowser === 'android_chrome' && 'Android Google Chrome'}
                  {detectedBrowser === 'samsung' && 'Samsung Internet Browser'}
                  {detectedBrowser === 'firefox' && 'Firefox Mobile'}
                  {detectedBrowser === 'opera' && 'Opera Mobile'}
                  {detectedBrowser === 'desktop' && 'Desktop PC / Mac Browser'}
                </strong>
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
              Auto-Targeted
            </span>
          </div>

          {/* OS & Browser Selector Tabs */}
          <div>
            <label className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
              isDark ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
              Instructions for your Mobile Browser:
            </label>
            <div className={`grid grid-cols-2 sm:grid-cols-5 gap-1 p-1 rounded-xl border text-xs font-medium ${
              isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setActiveTab('android_chrome')}
                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-[11px] ${
                  activeTab === 'android_chrome'
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Chrome</span>
              </button>
              <button
                onClick={() => setActiveTab('ios_safari')}
                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-[11px] ${
                  activeTab === 'ios_safari'
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                <span>iOS Safari</span>
              </button>
              <button
                onClick={() => setActiveTab('samsung')}
                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-[11px] ${
                  activeTab === 'samsung'
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Samsung</span>
              </button>
              <button
                onClick={() => setActiveTab('firefox')}
                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-[11px] ${
                  activeTab === 'firefox'
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Firefox/Opera</span>
              </button>
              <button
                onClick={() => setActiveTab('desktop')}
                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-[11px] col-span-2 sm:col-span-1 ${
                  activeTab === 'desktop'
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Android Chrome / Brave / Edge */}
          {activeTab === 'android_chrome' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className={`p-4 rounded-xl border space-y-3.5 ${
                isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs shrink-0">1</span>
                  <div>
                    <p className="font-bold text-sm">Open in Google Chrome / Brave</p>
                    <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                      Ensure you are viewing this page directly in <strong>Chrome or Brave</strong> on Android.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs shrink-0">2</span>
                  <div>
                    <p className="font-bold text-sm">Tap the Top-Right 3-Dots Menu (⋮)</p>
                    <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                      Tap the 3 vertical dots at the top-right corner of Chrome.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs shrink-0">3</span>
                  <div>
                    <p className="font-bold text-sm">Tap "Install App" or "Add to Home screen"</p>
                    <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                      Select <strong>Install App</strong> or <strong>Add to Home screen</strong> and confirm when the native prompt appears.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: iOS Safari */}
          {activeTab === 'ios_safari' && (
            <div className="space-y-4 animate-fade-in text-xs">
              {detectedBrowser === 'ios_other' && (
                <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                  isDark ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}>
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="font-bold">Apple iOS Limitation Notice:</p>
                    <p className="text-[11px] opacity-90">
                      Apple Safari is required to create PWAs on iPhone. Please copy this URL and open it inside <strong>Safari</strong>.
                    </p>
                  </div>
                </div>
              )}

              <div className={`p-4 rounded-xl border space-y-3.5 ${
                isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs shrink-0">1</span>
                  <div>
                    <p className="font-bold text-sm">Open in Apple Safari</p>
                    <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                      Open the app link directly inside Safari on iPhone or iPad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs shrink-0">2</span>
                  <div>
                    <p className="font-bold text-sm flex items-center gap-1.5">
                      Tap the Share Icon <Share className="w-4 h-4 text-purple-400 inline" />
                    </p>
                    <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                      At the bottom navigation bar of Safari, tap the square Share button.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs shrink-0">3</span>
                  <div>
                    <p className="font-bold text-sm flex items-center gap-1.5">
                      Select "Add to Home Screen" <PlusSquare className="w-4 h-4 text-purple-400 inline" />
                    </p>
                    <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                      Scroll down in the options list, tap <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Samsung Internet */}
          {activeTab === 'samsung' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className={`p-4 rounded-xl border space-y-3.5 ${
                isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs shrink-0">1</span>
                  <div>
                    <p className="font-bold text-sm">Tap the Download Icon or Bottom Menu (≡)</p>
                    <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                      Samsung Internet shows a download/install icon right next to the URL bar, or tap the 3 horizontal lines (≡) at the bottom right.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs shrink-0">2</span>
                  <div>
                    <p className="font-bold text-sm">Select "Add page to"</p>
                    <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                      Choose <strong>Add page to</strong> from the menu options.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs shrink-0">3</span>
                  <div>
                    <p className="font-bold text-sm">Choose "Home screen" / "App screen"</p>
                    <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                      Tap <strong>App screen</strong> or <strong>Home screen</strong> to complete installation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Firefox / Opera Mobile */}
          {activeTab === 'firefox' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className={`p-4 rounded-xl border space-y-3.5 ${
                isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs shrink-0">1</span>
                  <div>
                    <p className="font-bold text-sm">Tap Menu (⋮ or Opera Logo)</p>
                    <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                      Tap the 3 dots menu in Firefox or the Opera icon in Opera Mobile.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs shrink-0">2</span>
                  <div>
                    <p className="font-bold text-sm">Tap "Install" or "Add to Home Screen"</p>
                    <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                      Select <strong>Install</strong> or <strong>Add to Home screen</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Desktop Installation */}
          {activeTab === 'desktop' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className={`p-4 rounded-xl border space-y-3.5 ${
                isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs shrink-0">1</span>
                  <div>
                    <p className="font-bold text-sm">Click the Install Icon in the URL Bar</p>
                    <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                      Look for the <strong>Install</strong> icon (a computer monitor with an arrow) on the right side of your browser address bar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs shrink-0">2</span>
                  <div>
                    <p className="font-bold text-sm">Or use Chrome/Edge Menu</p>
                    <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                      Click the three-dot menu (⋮) at the top right, go to <strong>Save and Share</strong> &gt; <strong>Install DeepVision</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`px-6 py-4 border-t flex justify-between items-center ${
          isDark ? 'border-zinc-800 bg-[#161622]' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Standalone Web App • Camera & Local Storage Enabled</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

