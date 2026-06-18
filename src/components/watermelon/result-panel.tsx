"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "./metric-card";
import type { AnalysisResponse } from "@/lib/api";

interface ResultPanelProps {
  result: AnalysisResponse;
}

export function ResultPanel({ result }: ResultPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <span className="text-sm font-black text-[var(--color-flesh-dark)]">{result.label}</span>
          <CardTitle className="text-xl text-[var(--color-deep-rind)]">{result.tagline}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm leading-relaxed text-[var(--color-soft-ink)]">{result.summary}</p>
          <div className="grid grid-cols-3 gap-2">
            <MetricCard label="主频" value={`${Math.round(result.features.dominantFrequency)} Hz`} />
            <MetricCard label="回响" value={`${result.features.decaySeconds.toFixed(2)} s`} />
            <MetricCard label="高频" value={`${Math.round(result.features.highBandEnergy * 100)}%`} />
          </div>
          <ul className="grid gap-2">
            {result.reasons.map((reason, i) => (
              <li
                key={i}
                className="rounded-xl bg-gradient-to-br from-[rgba(232,245,233,0.8)] to-[rgba(200,230,201,0.5)] p-3 text-sm text-[var(--color-ink)]"
              >
                {reason}
              </li>
            ))}
          </ul>
          <p className="text-center text-xs text-[var(--color-soft-ink)]">
            {result.aiUsed ? "已接入 AI 复核声学特征" : "未配置 AI Key，已使用本地标准评分"}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
