import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAnalyzeWatermelon } from "./tools/analyze-watermelon";
import { registerGetHistory } from "./tools/get-history";

export function buildMcpServer(userId: string): McpServer {
  const server = new McpServer({ name: "watermelon-sound-checker", version: "0.2.0" });

  registerAnalyzeWatermelon(server, userId);
  registerGetHistory(server, userId);

  return server;
}
