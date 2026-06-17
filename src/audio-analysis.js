const MIN_ANALYSIS_FREQUENCY = 70;
const MAX_ANALYSIS_FREQUENCY = 1200;

export function parseWav(buffer) {
  const wav = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  if (wav.length < 44 || wav.toString("ascii", 0, 4) !== "RIFF" || wav.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error("请上传 WAV 录音文件");
  }

  let fmt = null;
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

export function analyzeAudioSamples(samples, sampleRate) {
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

export function buildHeuristicAssessment(features) {
  const frequencyScore = scoreRange(features.dominantFrequency, 80, 150, 360, 780);
  const centroidScore = scoreRange(features.spectralCentroid, 130, 220, 520, 980);
  const resonanceScore = scoreRange(features.decaySeconds, 0.08, 0.24, 0.68, 1.05);
  const balanceScore = clamp(100 - features.highBandEnergy * 55 - Math.max(0, features.lowBandEnergy - 0.82) * 90, 20, 100);
  let score = frequencyScore * 0.32 + centroidScore * 0.18 + resonanceScore * 0.34 + balanceScore * 0.16;

  if (features.dominantFrequency < 120 && features.decaySeconds < 0.16) score -= 16;
  if (features.dominantFrequency > 560 && features.highBandEnergy > 0.38) score -= 14;
  if (features.decaySeconds > 0.9 && features.dominantFrequency < 150) score -= 8;

  score = Math.round(clamp(score, 8, 98));

  const reasons = describeFeatures(features);
  const label = getScoreLabel(score);

  return {
    score,
    label: label.title,
    tagline: label.tagline,
    summary: label.summary,
    reasons,
    tips: [
      "连续敲 2 到 3 下，手机离瓜皮 10 到 20 厘米。",
      "最好把西瓜放在硬平面上，手不要托住它，避免吸收共振。",
      "声音只是辅助判断，可再看黄地斑、重量和表皮是否有损伤。",
    ],
  };
}

export function analyzeWavBuffer(buffer) {
  const parsed = parseWav(buffer);
  const features = analyzeAudioSamples(parsed.samples, parsed.sampleRate);
  return {
    features,
    heuristic: buildHeuristicAssessment(features),
  };
}

function readSample(buffer, position, bitsPerSample, audioFormat) {
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

function removeDc(samples) {
  let sum = 0;
  for (const sample of samples) sum += sample;
  const mean = sum / samples.length;
  const cleaned = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) cleaned[i] = samples[i] - mean;
  return cleaned;
}

function downsampleForAnalysis(samples, sampleRate) {
  const targetRate = 8000;
  const stride = Math.max(1, Math.floor(sampleRate / targetRate));
  if (stride === 1) return { samples, sampleRate };

  const length = Math.floor(samples.length / stride);
  const reduced = new Float32Array(length);
  for (let i = 0; i < length; i += 1) reduced[i] = samples[i * stride];
  return { samples: reduced, sampleRate: sampleRate / stride };
}

function scanSpectrum(samples, sampleRate) {
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

function applyHann(samples) {
  const output = new Float32Array(samples.length);
  const last = Math.max(1, samples.length - 1);
  for (let i = 0; i < samples.length; i += 1) {
    output[i] = samples[i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / last));
  }
  return output;
}

function goertzelPower(samples, sampleRate, frequency) {
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

function estimateDecaySeconds(samples, sampleRate) {
  const frameSize = Math.max(64, Math.floor(sampleRate * 0.02));
  const levels = [];

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

function describeFeatures(features) {
  const reasons = [];

  if (features.dominantFrequency >= 150 && features.dominantFrequency <= 360) {
    reasons.push("主频落在偏低沉的区间，接近成熟瓜常见的鼓感。");
  } else if (features.dominantFrequency > 520) {
    reasons.push("主频偏高，声音更尖，可能还不够熟。");
  } else {
    reasons.push("主频很低，需要结合回响判断，过低且闷时可能偏软。");
  }

  if (features.decaySeconds >= 0.24 && features.decaySeconds <= 0.75) {
    reasons.push("回响持续时间不错，有空灵回弹。");
  } else if (features.decaySeconds < 0.18) {
    reasons.push("回响较短，像被内部果肉吸收的闷响。");
  } else {
    reasons.push("回响偏长，可能很空，也要留意过熟发软。");
  }

  if (features.highBandEnergy > 0.38) {
    reasons.push("高频能量偏多，敲起来会更脆更尖。");
  } else if (features.lowBandEnergy > 0.45 && features.midBandEnergy > 0.18) {
    reasons.push("低频和中频都有支撑，声音比较饱满。");
  }

  return reasons;
}

function getScoreLabel(score) {
  if (score >= 86) {
    return {
      title: "清甜成熟",
      tagline: "低沉、空灵、回弹感都在线",
      summary: "这颗瓜的敲击声很接近甜熟西瓜：不尖、不闷，余响比较舒服。",
    };
  }

  if (score >= 72) {
    return {
      title: "接近成熟",
      tagline: "可以下手，但建议再看外观",
      summary: "声音方向是对的，甜度概率不错；再配合黄地斑和手感会更稳。",
    };
  }

  if (score >= 56) {
    return {
      title: "表现一般",
      tagline: "有成熟信号，但不够干净",
      summary: "敲击特征有些摇摆，可能受环境、握持或瓜本身状态影响。",
    };
  }

  return {
    title: "谨慎选择",
    tagline: "声音不太像理想甜瓜",
    summary: "这段录音偏尖或偏闷，建议换个位置再敲一次，或者挑另一颗。",
  };
}

function scoreRange(value, min, idealMin, idealMax, max) {
  if (value >= idealMin && value <= idealMax) return 100;
  if (value < idealMin) return clamp(((value - min) / (idealMin - min)) * 70 + 30, 0, 100);
  return clamp(100 - ((value - idealMax) / (max - idealMax)) * 75, 0, 100);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
