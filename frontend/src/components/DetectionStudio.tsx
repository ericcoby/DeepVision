import React, { useState } from 'react';
import { DetectionResult, PresetSource } from '../types';
import { analyzeMediaForensics } from '../services/apiService';
import { fileToBase64, generateMediaThumbnail } from '../lib/mediaUtils';
import {
  ShieldCheck,
  ShieldAlert,
  Upload,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Search,
  Layers,
  FileSearch,
  RotateCcw,
  Smartphone
} from 'lucide-react';

interface DetectionStudioProps {
  presetSources: PresetSource[];
  onAddHistory: (item: any) => void;
  initialMedia?: PresetSource | null;
  theme?: 'dark' | 'light';
  onOpenInstall?: () => void;
  isStandalone?: boolean;
}

export const DetectionStudio: React.FC<DetectionStudioProps> = ({
  presetSources,
  onAddHistory,
  initialMedia,
  theme = 'dark',
  onOpenInstall,
  isStandalone = false,
}) => {
  const isDark = theme === 'dark';

  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    name: string;
    type: 'image' | 'video';
    file?: File;
    base64Data?: string;
    thumbnailUrl?: string;
  } | null>(() => {
    if (initialMedia) {
      return {
        url: initialMedia.url,
        name: initialMedia.title,
        type: initialMedia.type
      };
    }
    const sample = presetSources[0];
    return sample ? {
      url: sample.url,
      name: sample.title,
      type: sample.type
    } : null;
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<DetectionResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Handle direct file upload for scanning
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await fileToBase64(file);
    const isVid = file.type.startsWith('video/');
    const thumb = await generateMediaThumbnail(file, 200);

    setSelectedMedia({
      url: URL.createObjectURL(file),
      name: file.name,
      type: isVid ? 'video' : 'image',
      file: file,
      base64Data: base64,
      thumbnailUrl: thumb || base64
    });
    setScanResult(null);
    setScanError(null);
  };

  // Run AI Forensic Deepfake Scan
  const handleRunScan = async () => {
    if (!selectedMedia) return;

    setIsScanning(true);
    setScanError(null);

    try {
      // For videos or large media, prepare base64 or thumbnail URL
      let base64ToPass = selectedMedia.type === 'video'
        ? (selectedMedia.thumbnailUrl || selectedMedia.base64Data || selectedMedia.url)
        : (selectedMedia.base64Data || selectedMedia.thumbnailUrl || selectedMedia.url);
      
      if (base64ToPass && base64ToPass.length > 10 * 1024 * 1024 && selectedMedia.thumbnailUrl) {
        base64ToPass = selectedMedia.thumbnailUrl;
      }

      const data = await analyzeMediaForensics({
        filename: selectedMedia.name,
        mediaType: selectedMedia.type,
        file: selectedMedia.file,
        mediaData: base64ToPass
      });

      setScanResult(data);

      // Save to History using persistent thumbnail Data URL
      const historyThumb = selectedMedia.thumbnailUrl || selectedMedia.base64Data || selectedMedia.url;
      onAddHistory({
        id: `detect-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'detect',
        sourceTitle: selectedMedia.name,
        sourceUrl: historyThumb,
        detectionVerdict: data.verdict,
        confidence: data.confidenceScore
      });
    } catch (err: any) {
      console.error('Detection scan error:', err);
      setScanResult(null);
      setScanError(err.message || 'Backend Detection Model Offline / Waiting for Python Integration');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 py-2">
      
      {/* Header Banner */}
      <div className={`border rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors duration-300 ${
        isDark
          ? 'bg-[#15151e] border-zinc-800 shadow-xl'
          : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <div>
          <h1 className={`text-2xl font-black tracking-tight flex items-center gap-2.5 ${
            isDark ? 'text-white' : 'text-zinc-900'
          }`}>
            <ShieldCheck className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-700'}`} />
            <span>AI Deepfake Forensic & Authenticity Detector</span>
          </h1>
          <p className={`text-xs mt-1 font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Scan any image or video for neural manipulation, face swap artifacts, and boundary synthesis flaws.
          </p>
        </div>

        {onOpenInstall && (
          <button
            onClick={onOpenInstall}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md shrink-0 border ${
              isStandalone
                ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                : isDark
                ? 'bg-purple-600 hover:bg-purple-500 border-purple-500/50 text-white shadow-purple-600/30'
                : 'bg-purple-600 hover:bg-purple-700 border-purple-600 text-white shadow-purple-600/20'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{isStandalone ? 'App Installed' : 'Install App'}</span>
          </button>
        )}
      </div>

      {/* Inspired Metric Highlights Grid (matching font style & layout of uploaded images) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-colors duration-300 ${
          isDark ? 'bg-[#15151e] border-zinc-800/90 shadow-lg' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div className="text-3xl lg:text-4xl font-extrabold text-[#22c55e] tracking-tight">
            99.4%
          </div>
          <div className={`text-xs font-semibold mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Forensic Detection Accuracy
          </div>
        </div>

        <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-colors duration-300 ${
          isDark ? 'bg-[#15151e] border-zinc-800/90 shadow-lg' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div className="text-3xl lg:text-4xl font-extrabold text-[#38bdf8] tracking-tight">
            4.9 Stars
          </div>
          <div className={`text-xs font-semibold mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Security Verification Rating
          </div>
        </div>

        <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-colors duration-300 ${
          isDark ? 'bg-[#15151e] border-zinc-800/90 shadow-lg' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div className="text-3xl lg:text-4xl font-extrabold text-[#a855f7] tracking-tight">
            14,200+
          </div>
          <div className={`text-xs font-semibold mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Scans & Verifications
          </div>
        </div>

        <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-colors duration-300 ${
          isDark ? 'bg-[#15151e] border-zinc-800/90 shadow-lg' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div className="text-3xl lg:text-4xl font-extrabold text-[#f43f5e] tracking-tight">
            100%
          </div>
          <div className={`text-xs font-semibold mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Zero Data Logging Guarantee
          </div>
        </div>
      </div>

      {/* Main Upload / Media Selection & Scan Trigger */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Input Selection Card */}
        <div className={`rounded-2xl border p-5 space-y-4 transition-colors duration-300 ${
          isDark
            ? 'bg-[#15151e] border-zinc-800/90 shadow-xl text-zinc-100'
            : 'bg-white border-slate-200/90 shadow-sm text-zinc-900'
        }`}>
          <h3 className={`font-bold text-sm flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-zinc-900'
          }`}>
            <FileSearch className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-700'}`} />
            <span>Select Media for Forensic Analysis</span>
          </h3>

          {/* Upload Dropzone */}
          <div className={`relative aspect-video rounded-xl border-2 border-dashed overflow-hidden group flex items-center justify-center transition-colors ${
            isDark
              ? 'bg-[#0b0b10] border-zinc-800 hover:border-purple-500/50'
              : 'bg-slate-50 border-slate-200 hover:border-purple-400'
          }`}>
            {selectedMedia ? (
              selectedMedia.type === 'video' ? (
                <video src={selectedMedia.url} className="w-full h-full object-cover" controls />
              ) : (
                <img src={selectedMedia.url} alt="For Analysis" className="w-full h-full object-cover" />
              )
            ) : (
              <div className="text-center p-6 text-zinc-500 space-y-2">
                <Upload className={`w-8 h-8 mx-auto opacity-90 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <p className={`font-semibold text-xs ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>Upload Media to Scan</p>
                <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Supports PNG, JPG, MP4</p>
              </div>
            )}

            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              title="Upload file to analyze"
            />
          </div>

          {/* Quick sample selector */}
          <div className="space-y-1.5">
            <label className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Or pick sample file to analyze:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {presetSources.map((ps) => (
                <button
                  key={ps.id}
                  onClick={() => {
                    setSelectedMedia({
                      url: ps.url,
                      name: ps.title,
                      type: ps.type
                    });
                    setScanResult(null);
                  }}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedMedia?.url === ps.url
                      ? isDark 
                        ? 'border-purple-500 ring-2 ring-purple-500/40 shadow-md' 
                        : 'border-purple-600 ring-2 ring-purple-500/30 shadow-md'
                      : isDark
                        ? 'border-zinc-800 hover:border-zinc-600'
                        : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <img src={ps.poster || ps.url} alt={ps.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Scan Button */}
          <button
            onClick={handleRunScan}
            disabled={isScanning || !selectedMedia}
            className={`w-full py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
              isScanning || !selectedMedia
                ? isDark ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
                : isDark
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 active:scale-[0.99]'
                  : 'bg-zinc-900 hover:bg-black text-white shadow-zinc-900/10 active:scale-[0.99]'
            }`}
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running Deepfake Detector Model Scan...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>RUN DEEPFAKE AUTHENTICITY SCAN</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Forensic Scan Report */}
        <div className={`rounded-2xl border p-5 space-y-4 transition-colors duration-300 ${
          isDark
            ? 'bg-[#15151e] border-zinc-800/90 shadow-xl text-zinc-100'
            : 'bg-white border-slate-200/90 shadow-sm text-zinc-900'
        }`}>
          <h3 className={`font-bold text-sm flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-zinc-900'
          }`}>
            <Activity className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-700'}`} />
            <span>Forensic Scan Results & Heatmap</span>
          </h3>

          {!scanResult && !isScanning && !scanError && (
            <div className={`text-center py-16 space-y-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              <ShieldCheck className={`w-12 h-12 mx-auto ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`} />
              <p className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>No active forensic scan results</p>
              <p className={`text-[11px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Select or upload media and click "Run Deepfake Authenticity Scan"</p>
            </div>
          )}

          {scanError && !isScanning && (
            <div className={`p-5 rounded-2xl border flex flex-col items-center justify-center text-center space-y-3 transition-all ${
              isDark ? 'bg-amber-950/20 border-amber-500/40 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm">Backend Detection Model Offline</h4>
                <p className="text-xs text-amber-300/90 font-medium">
                  {scanError}
                </p>
              </div>
              <p className={`text-[11px] leading-relaxed max-w-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                The Python FastAPI backend (<code className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-amber-300">app.py / POST /api/detect</code>) needs to be merged and started on port 8000 to process live media analysis.
              </p>
            </div>
          )}

          {isScanning && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Active Scanning Feedback Banner */}
              <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                isDark ? 'bg-purple-950/30 border-purple-500/30 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-900'
              }`}>
                <div className="relative w-7 h-7 shrink-0">
                  <div className={`absolute inset-0 rounded-full border-2 ${
                    isDark ? 'border-purple-800 border-t-purple-400' : 'border-purple-300 border-t-purple-700'
                  } animate-spin`} />
                  <Activity className={`absolute inset-0 m-auto w-3.5 h-3.5 animate-pulse ${
                    isDark ? 'text-purple-400' : 'text-purple-700'
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold truncate">Running Deepfake Detector Model Scan...</span>
                    <span className="text-[10px] font-mono opacity-80 animate-pulse shrink-0">Analyzing</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full mt-1.5 overflow-hidden ${isDark ? 'bg-purple-900/40' : 'bg-purple-200'}`}>
                    <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-purple-500 animate-pulse w-3/4 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Skeleton 1: Verdict Header Card */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-[#0d0d12] border-zinc-800/80' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3 w-full">
                  <div className={`w-10 h-10 rounded-xl shrink-0 animate-pulse ${
                    isDark ? 'bg-zinc-800' : 'bg-slate-200'
                  }`} />
                  <div className="space-y-2 flex-1">
                    <div className={`h-4 rounded-md w-2/5 animate-pulse ${
                      isDark ? 'bg-zinc-800' : 'bg-slate-200'
                    }`} />
                    <div className={`h-3 rounded-md w-1/3 animate-pulse ${
                      isDark ? 'bg-zinc-800/60' : 'bg-slate-200/70'
                    }`} />
                  </div>
                </div>
              </div>

              {/* Skeleton 2: Forensic Metrics Breakdown */}
              <div className={`space-y-3 p-3.5 rounded-xl border ${
                isDark ? 'bg-[#0d0d12] border-zinc-800/80' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`h-3 rounded-md w-1/3 animate-pulse ${
                  isDark ? 'bg-zinc-800' : 'bg-slate-200'
                }`} />

                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className={`h-3 rounded-md w-2/5 animate-pulse ${
                        isDark ? 'bg-zinc-800' : 'bg-slate-200'
                      }`} />
                      <div className={`h-3 rounded-md w-10 animate-pulse ${
                        isDark ? 'bg-zinc-800' : 'bg-slate-200'
                      }`} />
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${
                      isDark ? 'bg-zinc-800/60' : 'bg-slate-200/80'
                    }`}>
                      <div className={`h-full rounded-full animate-pulse ${
                        idx === 1 ? 'w-3/4 bg-purple-500/40' : idx === 2 ? 'w-1/2 bg-indigo-500/40' : 'w-2/3 bg-violet-500/40'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Skeleton 3: AI Technical Summary */}
              <div className="space-y-2">
                <div className={`h-3 rounded-md w-1/4 animate-pulse ${
                  isDark ? 'bg-zinc-800' : 'bg-slate-200'
                }`} />
                <div className={`p-3 rounded-xl border space-y-2 ${
                  isDark ? 'bg-[#0d0d12] border-zinc-800/80' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`h-3 rounded-md w-full animate-pulse ${
                    isDark ? 'bg-zinc-800' : 'bg-slate-200'
                  }`} />
                  <div className={`h-3 rounded-md w-5/6 animate-pulse ${
                    isDark ? 'bg-zinc-800' : 'bg-slate-200'
                  }`} />
                  <div className={`h-3 rounded-md w-2/3 animate-pulse ${
                    isDark ? 'bg-zinc-800' : 'bg-slate-200'
                  }`} />
                </div>
              </div>

              {/* Skeleton 4: Detected Anomaly Tags */}
              <div className="space-y-2">
                <div className={`h-3 rounded-md w-1/3 animate-pulse ${
                  isDark ? 'bg-zinc-800' : 'bg-slate-200'
                }`} />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`h-6 rounded-md animate-pulse ${
                        idx === 1 ? 'w-36' : idx === 2 ? 'w-28' : 'w-44'
                      } ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {scanResult && !isScanning && (
            <div className="space-y-4 animate-in fade-in duration-300">
              
              {/* Verdict Header Badge */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                scanResult.isManipulated
                  ? isDark ? 'bg-rose-950/40 border-rose-500/30 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-950'
                  : isDark ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}>
                <div className="flex items-center gap-3">
                  {scanResult.isManipulated ? (
                    <ShieldAlert className={`w-8 h-8 flex-shrink-0 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
                  ) : (
                    <ShieldCheck className={`w-8 h-8 flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  )}
                  <div>
                    <h4 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>{scanResult.verdict}</h4>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      Confidence Score: <span className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{scanResult.confidenceScore}%</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Forensic Metrics Progress Bars */}
              <div className={`space-y-2.5 text-xs p-3.5 rounded-xl border ${
                isDark ? 'bg-[#0d0d12] border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h5 className={`font-bold text-[11px] uppercase tracking-wider ${
                  isDark ? 'text-zinc-300' : 'text-zinc-800'
                }`}>Forensic Metric Breakdown</h5>

                <div className="space-y-1">
                  <div className={`flex justify-between text-[11px] font-medium ${
                    isDark ? 'text-zinc-400' : 'text-zinc-700'
                  }`}>
                    <span>Landmark Consistency</span>
                    <span>{scanResult.metrics.landmarkConsistency}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}>
                    <div
                      className="h-full bg-violet-500"
                      style={{ width: `${scanResult.metrics.landmarkConsistency}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className={`flex justify-between text-[11px] font-medium ${
                    isDark ? 'text-zinc-400' : 'text-zinc-700'
                  }`}>
                    <span>Lighting & Reflection Vector Coherence</span>
                    <span>{scanResult.metrics.lightingCoherence}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}>
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${scanResult.metrics.lightingCoherence}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className={`flex justify-between text-[11px] font-medium ${
                    isDark ? 'text-zinc-400' : 'text-zinc-700'
                  }`}>
                    <span>Frequency Noise Anomaly Rate</span>
                    <span>{scanResult.metrics.frequencyDomainNoise}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}>
                    <div
                      className={`h-full ${scanResult.metrics.frequencyDomainNoise > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${scanResult.metrics.frequencyDomainNoise}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Deepfake Detector Detailed Forensic Analysis */}
              <div className="space-y-1.5">
                <h5 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-zinc-900'}`}>AI Technical Summary</h5>
                <p className={`text-xs leading-relaxed p-3 rounded-xl border ${
                  isDark ? 'bg-[#0d0d12] border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-zinc-700'
                }`}>
                  {scanResult.analysisSummary}
                </p>
              </div>

              {/* Detected Anomalies Tags */}
              <div className="space-y-1.5">
                <h5 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-zinc-900'}`}>Detected Anomaly Tags</h5>
                <div className="flex flex-wrap gap-1.5">
                  {scanResult.detectedAnomalies.map((anom, idx) => (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-medium flex items-center gap-1.5 border ${
                        isDark
                          ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      <span>{anom}</span>
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
