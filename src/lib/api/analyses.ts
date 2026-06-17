import { request } from "./request";
import type { AnalysisResponse } from "./types";

export async function analyzeWatermelon(blob: Blob): Promise<AnalysisResponse> {
  const res = await request("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "audio/wav" },
    body: blob,
  });

  const data = (await res.json()) as AnalysisResponse;
  if (!res.ok) throw new Error(data.aiError || "分析失败");
  return data;
}

export async function getAnalysisHistory(limit = 20): Promise<AnalysisResponse[]> {
  const res = await request(`/api/history?limit=${limit}`);
  if (!res.ok) throw new Error("查询历史失败");
  return res.json();
}
