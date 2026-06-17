import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getAnalysesByUserId } from "@/lib/db/queries/analyses";

export function registerGetHistory(server: McpServer, userId: string) {
  server.registerTool(
    "get_watermelon_history",
    {
      description: "Get the user's recent watermelon ripeness analysis history.",
      inputSchema: {
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Maximum number of recent analyses to return (default 20)"),
      },
    },
    async ({ limit }) => {
      try {
        const rows = await getAnalysesByUserId(userId, limit || 20);
        return {
          content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to load history: ${message}` }],
        };
      }
    },
  );
}
