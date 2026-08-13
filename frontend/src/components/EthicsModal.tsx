import React from 'react';
import { ShieldCheck, X, AlertTriangle, Eye, Lock, CheckCircle2 } from 'lucide-react';

interface EthicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export const EthicsModal: React.FC<EthicsModalProps> = ({ isOpen, onClose, theme = 'dark' }) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`relative w-full max-w-2xl border rounded-2xl p-6 shadow-2xl overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-[#0f0f15] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-zinc-900'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${
          isDark ? 'border-zinc-800' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-purple-950/60 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-200'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Ethical AI & Privacy Policy</h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>DeepVision Responsible Usage Standards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className={`py-4 space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1 ${
          isDark ? 'text-zinc-300' : 'text-zinc-700'
        }`}>
          
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            isDark
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}>
            <Lock className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
            <div>
              <p className={`font-semibold ${isDark ? 'text-emerald-200' : 'text-emerald-900'}`}>Account-Free & Volatile Processing Guarantee</p>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                DeepVision requires no user accounts, passwords, or personal credentials. Media uploaded for face swapping or forensic detection is held strictly in volatile RAM memory during processing and automatically purged upon session end.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-700'}`} />
              <span>Responsible Usage Rules</span>
            </h3>
            <ul className={`space-y-2 list-disc list-inside p-3 rounded-xl border ${
              isDark ? 'bg-[#151520] border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-zinc-700'
            }`}>
              <li>Only use images and video media for which you have explicit rights, consent, or authorization.</li>
              <li>Non-consensual deepfakes, impersonation with intent to defraud, or malicious deepfake creations are strictly prohibited.</li>
              <li>Content generated on this platform should carry clear indicators or disclosure of AI synthetic manipulation when shared publicly.</li>
              <li>Forensic deepfake detection tools provided here assist in research and verification of synthetic visual media.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              <Eye className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-700'}`} />
              <span>Transparency & Watermarking</span>
            </h3>
            <p className={`leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Synthesized visual media produced by DeepVision embeds structural metadata signatures to ensure downstream AI detectors can recognize synthetic facial modifications.
            </p>
          </div>

          <div className={`p-3 rounded-xl border flex items-center gap-2 ${
            isDark
              ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <p className="text-[11px]">
              By using DeepVision, you agree to adhere to these responsible synthetic media creation and disclosure guidelines.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className={`pt-4 border-t flex justify-end ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl font-medium text-xs transition-all shadow-md ${
              isDark
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                : 'bg-zinc-900 hover:bg-black text-white'
            }`}
          >
            I Understand & Agree
          </button>
        </div>

      </div>
    </div>
  );
};
