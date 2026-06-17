import type { ParsedWav } from "./types";

export function parseWav(buffer: Buffer | ArrayBuffer): ParsedWav {
  const wav = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  if (
    wav.length < 44 ||
    wav.toString("ascii", 0, 4) !== "RIFF" ||
    wav.toString("ascii", 8, 12) !== "WAVE"
  ) {
    throw new Error("请上传 WAV 录音文件");
  }

  let fmt: {
    audioFormat: number;
    channels: number;
    sampleRate: number;
    bitsPerSample: number;
  } | null = null;
  let dataStart = -1;
  let dataSize = 0;
  let offset = 12;

  while (offset + 8 <= wav.length) {
    const id = wav.toString("ascii", offset, offset + 4);
    const size = wav.readUInt32LE(offset + 4);
    const start = offset + 8;

    if (id === "fmt ") {
      fmt = {
        audioFormat: wav.readUInt16LE(start),
        channels: wav.readUInt16LE(start + 2),
        sampleRate: wav.readUInt32LE(start + 4),
        bitsPerSample: wav.readUInt16LE(start + 14),
      };
    }

    if (id === "data") {
      dataStart = start;
      dataSize = size;
      break;
    }

    offset = start + size + (size % 2);
  }

  if (!fmt || dataStart < 0) {
    throw new Error("WAV 文件缺少音频数据");
  }

  if (fmt.audioFormat !== 1 && fmt.audioFormat !== 3) {
    throw new Error("当前只支持 PCM 或 Float WAV");
  }

  if (![16, 24, 32].includes(fmt.bitsPerSample)) {
    throw new Error("当前只支持 16/24/32 位 WAV");
  }

  const bytesPerSample = fmt.bitsPerSample / 8;
  const frameCount = Math.floor(dataSize / (bytesPerSample * fmt.channels));
  const samples = new Float32Array(frameCount);

  for (let i = 0; i < frameCount; i += 1) {
    let mixed = 0;
    for (let channel = 0; channel < fmt.channels; channel += 1) {
      const position = dataStart + (i * fmt.channels + channel) * bytesPerSample;
      mixed += readSample(wav, position, fmt.bitsPerSample, fmt.audioFormat);
    }
    samples[i] = mixed / fmt.channels;
  }

  return {
    samples,
    sampleRate: fmt.sampleRate,
    durationSeconds: samples.length / fmt.sampleRate,
  };
}

function readSample(
  buffer: Buffer,
  position: number,
  bitsPerSample: number,
  audioFormat: number,
): number {
  if (audioFormat === 3 && bitsPerSample === 32) {
    return clamp(buffer.readFloatLE(position), -1, 1);
  }

  if (bitsPerSample === 16) {
    return buffer.readInt16LE(position) / 32768;
  }

  if (bitsPerSample === 24) {
    const value = buffer.readIntLE(position, 3);
    return value / 8388608;
  }

  return buffer.readInt32LE(position) / 2147483648;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
