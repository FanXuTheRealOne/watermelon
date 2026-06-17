"use client";

import { useState } from "react";
import { useEazo } from "@eazo/sdk/react";
import { auth } from "@eazo/sdk";
import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { MelonStage } from "./melon-stage";
import { WaveBar } from "./wave-bar";
import { CopyBlock } from "./copy-block";
import { ActionButton } from "./action-button";
import { InfoCard } from "./info-card";
import { ResultPanel } from "./result-panel";
import { Decorations } from "./decorations";
import { useRecorder } from "./use-recorder";
import { analyzeWatermelon } from "@/lib/api";
import { reportWatermelonAnalysis } from "@/lib/memory";
import { encodeWav } from "@/lib/audio-encoder";
import type { AnalysisResponse } from "@/lib/api";

export function WatermelonAnalyzer() {
  const user = useEazo((s) => s.auth.user);
  const loading = useEazo((s) => s.auth.loading);

  const [hint, setHint] = useState("轻敲西瓜开始检测");
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState("");

  const onAnalyze = async (samples: Float32Array, sampleRate: number) => {
    if (samples.length < sampleRate * 0.18) {
      setHint("录音太短，再敲 2 到 3 下");
      return;
    }

    setHint("正在分析敲瓜声");

    try {
      const wavBuffer = encodeWav(samples, sampleRate);
      const data = await analyzeWatermelon(new Blob([wavBuffer], { type: "audio/wav" }));
      setResult(data);
      reportWatermelonAnalysis(data.score, data.label);
      setHint("可以再测一次");
    } catch (err) {
      const message = err instanceof Error ? err.message : "分析失败，请重试";
      setError(message);
      setHint(message);
    }
  };

  const { mode, samples, startRecording, stopRecording } = useRecorder({
    onStart: () => {
      setError("");
      setHint("正在听，敲完点完成");
      setResult(null);
    },
    onStop: onAnalyze,
    onError: (message) => {
      setError(message);
      setHint(message);
    },
  });

  const toggleRecording = () => {
    if (mode === "recording") stopRecording();
    else startRecording();
  };

  if (loading) {
    return (
      <main className="flex min-h-svh items-center justify-center">
        <p className="text-[var(--color-soft-ink)]">加载中…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6">
        <p className="text-[var(--color-soft-ink)]">请先登录后继续</p>
        <Button onClick={() => auth.login().catch(() => undefined)}>登录</Button>
      </main>
    );
  }

  return (
    <main className="relative mx-auto flex min-h-svh w-full max-w-md flex-col gap-4 px-5 pb-6 pt-6">
      <Decorations />
      <Header aiUsed={result?.aiUsed ?? false} />
      <MelonStage mode={mode} hint={error || hint} />
      <WaveBar mode={mode} samples={samples} />
      <CopyBlock />
      <ActionButton mode={mode} onClick={toggleRecording} />
      <InfoCard score={result?.score ?? null} />
      {result && <ResultPanel result={result} />}
    </main>
  );
}
