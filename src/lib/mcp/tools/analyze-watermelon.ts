import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { analyzeWavBuffer } from "@/lib/audio-analysis";
import { getAiAssessment } from "@/lib/ai-assessment";
import { createAnalysis } from "@/lib/db/queries/analyses";

export function registerAnalyzeWatermelon(server: McpServer, userId: string) {
  server.registerTool(
    "analyze_watermelon_knock",
    {
      description: "Analyze a WAV recording of knocking on a watermelon and return a ripeness score.",
      inputSchema: {
        wavBase64: z
          .string()
          .describe("Base64-encoded mono or stereo PCM WAV audio of the knock sound"),
      },
    },
    async ({ wavBase64 }) => {
      try {
        const buffer = Buffer.from(wavBase64, "base64");
        const analysis = analyzeWavBuffer(buffer);
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

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { ...assessment, features: analysis.features },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [{ type: "text", text: `Analysis failed: ${message}` }],
        };
      }
    },
  );
}
