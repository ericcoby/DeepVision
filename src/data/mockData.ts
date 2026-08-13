import { PresetSource, PresetTarget, DetectionResult } from '../types';

export const DEMO_PRESET_SOURCES: PresetSource[] = [
  {
    id: "src-1",
    title: "Studio Cyberpunk Portrait",
    type: "image",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000",
    description: "Dramatic neon studio portrait",
  },
  {
    id: "src-2",
    title: "Executive Business Portrait",
    type: "image",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000",
    description: "Professional high-contrast corporate headshot",
  },
  {
    id: "src-3",
    title: "Cinematic Film Still",
    type: "image",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=1000",
    description: "Atmospheric natural lighting",
  },
  {
    id: "src-4",
    title: "Urban Fashion Walk (Video Sample)",
    type: "video",
    url: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-walking-down-a-street-41584-large.mp4",
    poster: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=1000",
    description: "1080p 60fps dynamic motion video track",
  },
  {
    id: "src-5",
    title: "Tech Conference Speaker (Video Sample)",
    type: "video",
    url: "https://assets.mixkit.co/videos/preview/mixkit-man-holding-a-presentation-in-a-meeting-room-41566-large.mp4",
    poster: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1000",
    description: "Talking head video with vocal expression sync",
  }
];

export const DEMO_PRESET_TARGETS: PresetTarget[] = [
  {
    id: "tgt-1",
    name: "Cybernetic Synth AI",
    category: "Futuristic",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "tgt-2",
    name: "Classic Fine Art",
    category: "Artistic",
    url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "tgt-3",
    name: "Vintage Noir Detective",
    category: "Retro",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "tgt-4",
    name: "3D Anime Avatar",
    category: "Stylized",
    url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "tgt-5",
    name: "Cine-Hero Portrait",
    category: "Cinematic",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800",
  }
];

export const MOCK_DETECTION_RESULTS: DetectionResult[] = [
  {
    isManipulated: true,
    confidenceScore: 94.8,
    verdict: "High Probability Deepfake",
    analysisSummary: "Forensic landmark analysis detected subtle facial boundary blur, pupil reflections angle discrepancy (+18° offset), and neural interpolation noise along the jawline.",
    metrics: {
      landmarkConsistency: 38,
      lightingCoherence: 52,
      frequencyDomainNoise: 88,
      boundarySeamlessness: 31
    },
    detectedAnomalies: [
      "Pupil light reflection direction mismatch (+18° offset)",
      "Frequency spectrum anomaly in facial boundary region",
      "Temporal jitter in cheekbone landmarks between keyframes",
      "Unusual texture smoothing on chin skin folds"
    ],
    heatmapPoints: [
      { x: 45, y: 35, intensity: 0.92, label: "Pupil Reflection Misalignment" },
      { x: 55, y: 70, intensity: 0.85, label: "Jawline Blending Artifact" },
      { x: 30, y: 50, intensity: 0.78, label: "Boundary Frequency Discontinuity" }
    ]
  },
  {
    isManipulated: false,
    confidenceScore: 98.2,
    verdict: "Likely Authentic Media",
    analysisSummary: "Frequency domain and lighting vector analysis show consistent camera sensor noise distribution, continuous skin texture porosity, and natural landmark coherence.",
    metrics: {
      landmarkConsistency: 96,
      lightingCoherence: 94,
      frequencyDomainNoise: 12,
      boundarySeamlessness: 98
    },
    detectedAnomalies: [
      "No statistical neural boundary anomalies found",
      "Natural sub-dermal scattering and specular highlights verified"
    ],
    heatmapPoints: []
  }
];
