import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeAudioSamples,
  buildHeuristicAssessment,
  parseWav,
} from "../src/audio-analysis.js";

function makeSineWav({ frequency = 180, sampleRate = 8000, seconds = 0.65 }) {
  const sampleCount = Math.floor(sampleRate * seconds);
  const pcm = new Int16Array(sampleCount);

  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / sampleRate;
    const decay = Math.exp(-t * 2.2);
    const tap = Math.sin(2 * Math.PI * frequency * t) * decay * 0.72;
    pcm[i] = Math.max(-1, Math.min(1, tap)) * 32767;
  }

  const buffer = Buffer.alloc(44 + pcm.byteLength);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + pcm.byteLength, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(pcm.byteLength, 40);
  Buffer.from(pcm.buffer).copy(buffer, 44);

  return buffer;
}

test("parseWav reads mono 16-bit PCM WAV samples", () => {
  const wav = makeSineWav({ frequency: 220, sampleRate: 8000, seconds: 0.25 });
  const parsed = parseWav(wav);

  assert.equal(parsed.sampleRate, 8000);
  assert.equal(parsed.samples.length, 2000);
  assert.ok(Math.max(...parsed.samples) <= 1);
  assert.ok(Math.min(...parsed.samples) >= -1);
});

test("analyzeAudioSamples estimates a knock resonance frequency", () => {
  const wav = makeSineWav({ frequency: 176, sampleRate: 8000, seconds: 0.65 });
  const { samples, sampleRate } = parseWav(wav);
  const features = analyzeAudioSamples(samples, sampleRate);

  assert.ok(Math.abs(features.dominantFrequency - 176) < 14);
  assert.ok(features.decaySeconds > 0.25);
  assert.ok(features.peakAmplitude > 0.5);
});

test("buildHeuristicAssessment rewards clear deep ringing knocks", () => {
  const ripe = buildHeuristicAssessment({
    dominantFrequency: 185,
    spectralCentroid: 330,
    decaySeconds: 0.58,
    peakAmplitude: 0.7,
    lowBandEnergy: 0.62,
    midBandEnergy: 0.28,
    highBandEnergy: 0.1,
  });
  const dull = buildHeuristicAssessment({
    dominantFrequency: 95,
    spectralCentroid: 140,
    decaySeconds: 0.08,
    peakAmplitude: 0.25,
    lowBandEnergy: 0.82,
    midBandEnergy: 0.13,
    highBandEnergy: 0.05,
  });
  const sharp = buildHeuristicAssessment({
    dominantFrequency: 620,
    spectralCentroid: 880,
    decaySeconds: 0.12,
    peakAmplitude: 0.55,
    lowBandEnergy: 0.1,
    midBandEnergy: 0.35,
    highBandEnergy: 0.55,
  });

  assert.ok(ripe.score >= 82);
  assert.equal(typeof ripe.label, "string");
  assert.ok(dull.score < ripe.score - 25);
  assert.ok(sharp.score < ripe.score - 20);
});
