import type { AudioFeatures } from "./types";

const MIN_ANALYSIS_FREQUENCY = 70;
const MAX_ANALYSIS_FREQUENCY = 1200;

export function analyzeAudioSamples(samples: Float32Array, sampleRate: number): AudioFeatures {
  if (!samples || samples.length < sampleRate * 0.08) {
    throw new Error("录音太短，请敲击 2 到 3 下再分析");
  }

  let peakAmplitude = 0;
  let peakIndex = 0;

  for (let i = 0; i < samples.length; i += 1) {
    const value = Math.abs(samples[i]);
    if (value > peakAmplitude) {
      peakAmplitude = value;
      peakIndex = i;
    }
  }

  if (peakAmplitude < 0.025) {
    throw new Error("敲击声音太小，请把手机靠近西瓜再试一次");
  }

  const preRoll = Math.floor(sampleRate * 0.025);
  const maxWindow = Math.floor(sampleRate * 0.9);
  const start = Math.max(0, peakIndex - preRoll);
  const end = Math.min(samples.length, start + maxWindow);
  const window = downsampleForAnalysis(removeDc(samples.slice(start, end)), sampleRate);

  const spectrum = scanSpectrum(window.samples, window.sampleRate);
  const bandTotal = spectrum.lowBandEnergy + spectrum.midBandEnergy + spectrum.highBandEnergy || 1;

  return {
    dominantFrequency: round(spectrum.dominantFrequency, 1),
    spectralCentroid: round(spectrum.spectralCentroid, 1),
    decaySeconds: round(estimateDecaySeconds(window.samples, window.sampleRate), 3),
    peakAmplitude: round(peakAmplitude, 3),
    lowBandEnergy: round(spectrum.lowBandEnergy / bandTotal, 3),
    midBandEnergy: round(spectrum.midBandEnergy / bandTotal, 3),
    highBandEnergy: round(spectrum.highBandEnergy / bandTotal, 3),
    durationSeconds: round(samples.length / sampleRate, 2),
  };
}

function removeDc(samples: Float32Array): Float32Array {
  let sum = 0;
  for (const sample of samples) sum += sample;
  const mean = sum / samples.length;
  const cleaned = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) cleaned[i] = samples[i] - mean;
  return cleaned;
}

function downsampleForAnalysis(
  samples: Float32Array,
  sampleRate: number,
): { samples: Float32Array; sampleRate: number } {
  const targetRate = 8000;
  const stride = Math.max(1, Math.floor(sampleRate / targetRate));
  if (stride === 1) return { samples, sampleRate };

  const length = Math.floor(samples.length / stride);
  const reduced = new Float32Array(length);
  for (let i = 0; i < length; i += 1) reduced[i] = samples[i * stride];
  return { samples: reduced, sampleRate: sampleRate / stride };
}

interface SpectrumResult {
  dominantFrequency: number;
  spectralCentroid: number;
  lowBandEnergy: number;
  midBandEnergy: number;
  highBandEnergy: number;
}

function scanSpectrum(samples: Float32Array, sampleRate: number): SpectrumResult {
  const windowed = applyHann(samples);
  let dominantFrequency = MIN_ANALYSIS_FREQUENCY;
  let dominantPower = 0;
  let weightedPower = 0;
  let totalPower = 0;
  let lowBandEnergy = 0;
  let midBandEnergy = 0;
  let highBandEnergy = 0;

  for (let frequency = MIN_ANALYSIS_FREQUENCY; frequency <= MAX_ANALYSIS_FREQUENCY; frequency += 5) {
    const power = goertzelPower(windowed, sampleRate, frequency);
    totalPower += power;
    weightedPower += power * frequency;

    if (frequency < 250) lowBandEnergy += power;
    else if (frequency < 550) midBandEnergy += power;
    else highBandEnergy += power;

    if (power > dominantPower) {
      dominantPower = power;
      dominantFrequency = frequency;
    }
  }

  return {
    dominantFrequency,
    spectralCentroid: totalPower > 0 ? weightedPower / totalPower : 0,
    lowBandEnergy,
    midBandEnergy,
    highBandEnergy,
  };
}

function applyHann(samples: Float32Array): Float32Array {
  const output = new Float32Array(samples.length);
  const last = Math.max(1, samples.length - 1);
  for (let i = 0; i < samples.length; i += 1) {
    output[i] = samples[i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / last));
  }
  return output;
}

function goertzelPower(samples: Float32Array, sampleRate: number, frequency: number): number {
  const coefficient = 2 * Math.cos((2 * Math.PI * frequency) / sampleRate);
  let previous = 0;
  let previous2 = 0;

  for (const sample of samples) {
    const current = sample + coefficient * previous - previous2;
    previous2 = previous;
    previous = current;
  }

  return previous2 * previous2 + previous * previous - coefficient * previous * previous2;
}

function estimateDecaySeconds(samples: Float32Array, sampleRate: number): number {
  const frameSize = Math.max(64, Math.floor(sampleRate * 0.02));
  const levels: number[] = [];

  for (let i = 0; i + frameSize <= samples.length; i += frameSize) {
    let sum = 0;
    for (let j = i; j < i + frameSize; j += 1) sum += samples[j] * samples[j];
    levels.push(Math.sqrt(sum / frameSize));
  }

  let peak = 0;
  let peakFrame = 0;
  for (let i = 0; i < levels.length; i += 1) {
    if (levels[i] > peak) {
      peak = levels[i];
      peakFrame = i;
    }
  }

  if (!peak) return 0;

  const threshold = peak * 0.22;
  let lastAudibleFrame = peakFrame;
  for (let i = peakFrame; i < levels.length; i += 1) {
    if (levels[i] >= threshold) lastAudibleFrame = i;
  }

  return ((lastAudibleFrame - peakFrame + 1) * frameSize) / sampleRate;
}

function round(value: number, digits = 0): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
