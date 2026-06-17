import { Star } from "lucide-react";

interface AiBadgeProps {
  aiUsed: boolean;
}

export function AiBadge({ aiUsed }: AiBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,122,138,0.22)] bg-white/80 px-3.5 py-2 text-sm font-extrabold text-[var(--color-flesh-dark)] shadow-sm backdrop-blur-md">
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
      {aiUsed ? "AI 辅助" : "本地评分"}
    </span>
  );
}
