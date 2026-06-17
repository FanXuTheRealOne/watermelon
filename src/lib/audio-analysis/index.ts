import { parseWav } from "./parse-wav";
import { analyzeAudioSamples } from "./spectrum";
import { buildHeuristicAssessment } from "./heuristic";
import type { ParsedWav, AudioFeatures, HeuristicAssessment, AnalysisResult } from "./types";

export * from "./types";

export function analyzeWavBuffer(buffer: Buffer | ArrayBuffer): AnalysisResult {
  const parsed = parseWav(buffer);
  const features = analyzeAudioSamples(parsed.samples, parsed.sampleRate);
  return {
    features,
    heuristic: buildHeuristicAssessment(features),
  };
}

export { parseWav, analyzeAudioSamples, buildHeuristicAssessment };
export type { ParsedWav, AudioFeatures, HeuristicAssessment, AnalysisResult };
