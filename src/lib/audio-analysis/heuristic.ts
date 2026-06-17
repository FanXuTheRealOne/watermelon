import type { AudioFeatures, HeuristicAssessment } from "./types";

export function buildHeuristicAssessment(features: AudioFeatures): HeuristicAssessment {
  const frequencyScore = scoreRange(features.dominantFrequency, 80, 150, 360, 780);
  const centroidScore = scoreRange(features.spectralCentroid, 130, 220, 520, 980);
  const resonanceScore = scoreRange(features.decaySeconds, 0.08, 0.24, 0.68, 1.05);
  const balanceScore = clamp(
    100 - features.highBandEnergy * 55 - Math.max(0, features.lowBandEnergy - 0.82) * 90,
    20,
    100,
  );
  let score =
    frequencyScore * 0.32 + centroidScore * 0.18 + resonanceScore * 0.34 + balanceScore * 0.16;

  if (features.dominantFrequency < 120 && features.decaySeconds < 0.16) score -= 16;
  if (features.dominantFrequency > 560 && features.highBandEnergy > 0.38) score -= 14;
  if (features.decaySeconds > 0.9 && features.dominantFrequency < 150) score -= 8;

  score = Math.round(clamp(score, 8, 98));

  return {
    score,
    ...getScoreLabel(score),
    reasons: describeFeatures(features),
    tips: [
      "连续敲 2 到 3 下，手机离瓜皮 10 到 20 厘米。",
      "最好把西瓜放在硬平面上，手不要托住它，避免吸收共振。",
      "声音只是辅助判断，可再看黄地斑、重量和表皮是否有损伤。",
    ],
  };
}

function describeFeatures(features: AudioFeatures): string[] {
  const reasons: string[] = [];

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

function getScoreLabel(score: number): { label: string; tagline: string; summary: string } {
  if (score >= 86) {
    return {
      label: "清甜成熟",
      tagline: "低沉、空灵、回弹感都在线",
      summary: "这颗瓜的敲击声很接近甜熟西瓜：不尖、不闷，余响比较舒服。",
    };
  }

  if (score >= 72) {
    return {
      label: "接近成熟",
      tagline: "可以下手，但建议再看外观",
      summary: "声音方向是对的，甜度概率不错；再配合黄地斑和手感会更稳。",
    };
  }

  if (score >= 56) {
    return {
      label: "表现一般",
      tagline: "有成熟信号，但不够干净",
      summary: "敲击特征有些摇摆，可能受环境、握持或瓜本身状态影响。",
    };
  }

  return {
    label: "谨慎选择",
    tagline: "声音不太像理想甜瓜",
    summary: "这段录音偏尖或偏闷，建议换个位置再敲一次，或者挑另一颗。",
  };
}

function scoreRange(
  value: number,
  min: number,
  idealMin: number,
  idealMax: number,
  max: number,
): number {
  if (value >= idealMin && value <= idealMax) return 100;
  if (value < idealMin) return clamp(((value - min) / (idealMin - min)) * 70 + 30, 0, 100);
  return clamp(100 - ((value - idealMax) / (max - idealMax)) * 75, 0, 100);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
