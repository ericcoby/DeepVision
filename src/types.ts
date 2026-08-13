export type ActiveTab = 'swap' | 'detect' | 'gallery' | 'history';

export type MediaType = 'image' | 'video';

export interface PresetSource {
  id: string;
  title: string;
  type: MediaType;
  url: string;
  poster?: string;
  description: string;
}

export interface PresetTarget {
  id: string;
  name: string;
  category: string;
  url: string;
}

export interface MediaFile {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  file?: File;
  previewUrl: string;
}

export interface SwapSettings {
  swapMode: 'full_swap' | 'expression_sync' | 'age_morph' | 'cybernetic';
  restoreFace: boolean;
  colorMatch: boolean;
  blendSmoothness: number; // 0 - 100
  showLandmarkMesh: boolean;
  resolution: '720p' | '1080p' | '4k';
  videoFps: 24 | 30 | 60;
}

export interface ProcessingMetrics {
  landmarksDetected: number;
  affineMatrixFit: number;
  faceRestoreGain: string;
  processingTimeMs: number;
  fps: number;
  swapMode: string;
  resolution: string;
}

export interface LandmarkPoint {
  x: number;
  y: number;
  confidence: number;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
  label: string;
}

export interface ForensicMetrics {
  landmarkConsistency: number;
  lightingCoherence: number;
  frequencyDomainNoise: number;
  boundarySeamlessness: number;
}

export interface DetectionResult {
  isManipulated: boolean;
  confidenceScore: number;
  verdict: string;
  analysisSummary: string;
  metrics: ForensicMetrics;
  detectedAnomalies: string[];
  heatmapPoints: HeatmapPoint[];
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  type: 'swap' | 'detect';
  sourceTitle: string;
  sourceUrl: string;
  targetUrl?: string;
  resultUrl?: string;
  detectionVerdict?: string;
  confidence?: number;
}
