import { memory } from "@eazo/sdk";

export function reportWatermelonAnalysis(score: number, label: string) {
  memory
    .reportAction({
      content: `用户检测了西瓜甜度，评分 ${score} 分，结果为「${label}」`,
      event_type: "create",
      page: "watermelon-analyzer",
      metadata: { type: "analyze_watermelon", score, label },
    })
    .catch(() => {});
}
