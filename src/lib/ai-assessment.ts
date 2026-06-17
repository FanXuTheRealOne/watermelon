import { ai } from "@eazo/sdk";
import type { AnalysisResult } from "./audio-analysis";

ai.configure({ privateKey: process.env.EAZO_PRIVATE_KEY! });

const WATERMELON_SYSTEM_PROMPT = `
你是“敲瓜声成熟度评估器”，只根据音频特征给出轻量、谨慎的西瓜成熟评分。

判断标准来自公开资料整理：
1. 成熟西瓜通常有更深、更空灵、带回弹的共振声；未熟或受损时声音可能更尖、更硬或回响不足。
2. HBK 关于西瓜声学的文章指出，成熟过程中自然频率会下降，过熟时阻尼会显著增加，听起来会变成闷钝的 thud；理想声音是 hollow、ringing，但极端空洞也可能接近发软。
3. Serious Eats 采访中提到，敲击更像是在听 reverb 和 bounce back；内部擦伤会吸声，让声音不均匀。
4. Good Housekeeping 的 2026 年选瓜建议说，成熟瓜常是 deep hollow sound，但敲击只是辅助信号，黄地斑、重量、表皮状态也重要。

输出要求：
- 使用简体中文。
- 只输出 JSON，不要 Markdown。
- score 是 0 到 100 的整数。
- label 简短，例如“清甜成熟”“接近成熟”“谨慎选择”。
- summary 一句话，适合手机界面展示。
- reasons 给 2 到 3 条，每条不超过 24 个汉字。
- tips 给 2 条可执行建议。
- 不要承诺一定甜，只说“概率”“倾向”“建议复测”。
`.trim();

export interface AiAssessment {
  score: number;
  label: string;
  tagline: string;
  summary: string;
  reasons: string[];
  tips: string[];
  aiUsed: boolean;
  aiError?: string;
}

export async function getAiAssessment(analysis: AnalysisResult): Promise<AiAssessment> {
  try {
    const response = await ai.chat({
      model: "deepseek.v3.1",
      messages: [
        { role: "system", content: WATERMELON_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            features: analysis.features,
            heuristic: analysis.heuristic,
            desiredShape: {
              score: "number",
              label: "string",
              tagline: "string",
              summary: "string",
              reasons: ["string"],
              tips: ["string"],
            },
          }),
        },
      ],
      max_tokens: 600,
    });

    const text = response.choices[0]?.message?.content || "";
    const aiResult = normalizeAiResult(JSON.parse(extractJson(text)));

    return {
      ...analysis.heuristic,
      ...aiResult,
      aiUsed: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ...analysis.heuristic,
      aiUsed: false,
      aiError: message,
    };
  }
}

function normalizeAiResult(result: Record<string, unknown>) {
  return {
    score: clamp(Math.round(Number(result.score) || 0), 0, 100),
    label: String(result.label || "声学评分"),
    tagline: String(result.tagline || "请结合外观复核"),
    summary: String(result.summary || "敲击声只能作为辅助判断。"),
    reasons: normalizeList(result.reasons, 3),
    tips: normalizeList(result.tips, 2),
  };
}

function normalizeList(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, limit);
}

function extractJson(text: string): string {
  const trimmed = String(text || "").trim();
  if (trimmed.startsWith("{")) return trimmed;

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI 没有返回 JSON");
  return match[0];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export { WATERMELON_SYSTEM_PROMPT };
