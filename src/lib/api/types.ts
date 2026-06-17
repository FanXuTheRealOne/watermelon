export interface AnalysisFeatures {
  dominantFrequency: number;
  spectralCentroid: number;
  decaySeconds: number;
  peakAmplitude: number;
  lowBandEnergy: number;
  midBandEnergy: number;
  highBandEnergy: number;
  durationSeconds: number;
}

export interface AnalysisResponse {
  score: number;
  label: string;
  tagline: string;
  summary: string;
  reasons: string[];
  tips: string[];
  aiUsed: boolean;
  aiError?: string;
  features: AnalysisFeatures;
}
