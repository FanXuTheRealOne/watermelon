import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { analyzeWavBuffer } from "@/lib/audio-analysis";
import { getAiAssessment } from "@/lib/ai-assessment";
import { createAnalysis } from "@/lib/db/queries/analyses";

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;
  const { id: userId } = auth.user;

  try {
    const arrayBuffer = await request.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: "录音文件太大，请控制在 8MB 内" }, { status: 413 });
    }

    const analysis = analyzeWavBuffer(Buffer.from(arrayBuffer));
    const assessment = await getAiAssessment(analysis);

    await createAnalysis({
      userId,
      score: assessment.score,
      label: assessment.label,
      tagline: assessment.tagline,
      summary: assessment.summary,
      reasons: assessment.reasons,
      tips: assessment.tips,
      features: analysis.features,
      aiUsed: assessment.aiUsed ? 1 : 0,
    });

    return NextResponse.json({
      ...assessment,
      features: analysis.features,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "分析失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
