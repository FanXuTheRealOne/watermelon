export interface ParsedWav {
  samples: Float32Array;
  sampleRate: number;
  durationSeconds: number;
}

export interface AudioFeatures {
  dominantFrequency: number;
  spectralCentroid: number;
  decaySeconds: number;
  peakAmplitude: number;
  lowBandEnergy: number;
  midBandEnergy: number;
  highBandEnergy: number;
  durationSeconds: number;
}

export interface HeuristicAssessment {
  score: number;
  label: string;
  tagline: string;
  summary: string;
  reasons: string[];
  tips: string[];
}

export interface AnalysisResult {
  features: AudioFeatures;
  heuristic: HeuristicAssessment;
}
