import { Card } from "@/components/ui/card";

interface InfoCardProps {
  score: number | null;
}

export function InfoCard({ score }: InfoCardProps) {
  return (
    <Card className="relative z-10 grid grid-cols-[auto_1fr_auto] items-center gap-3 p-4 [@media(max-height:700px)]:p-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] shadow-sm [@media(max-height:700px)]:h-10 [@media(max-height:700px)]:w-10">
        <svg viewBox="0 0 48 48" className="h-7 w-7">
          <rect x="8" y="20" width="4" height="16" rx="2" fill="#66bb6a" />
          <rect x="16" y="14" width="4" height="22" rx="2" fill="#66bb6a" />
          <rect x="24" y="18" width="4" height="18" rx="2" fill="#66bb6a" />
          <rect x="32" y="10" width="4" height="26" rx="2" fill="#66bb6a" />
          <rect x="40" y="22" width="4" height="14" rx="2" fill="#66bb6a" />
        </svg>
      </div>
      <div className="min-w-0">
        <h2 className="text-base font-extrabold text-[var(--color-ink)]">轻敲后自动分析</h2>
        <p className="mt-1 text-sm text-[var(--color-soft-ink)] [@media(max-height:700px)]:hidden">
          识别声音频率，评估西瓜甜度
        </p>
      </div>
      <div className="text-right">
        <span className="block text-xs font-extrabold text-[var(--color-flesh-dark)]">甜度指数</span>
        <div className="mt-1 text-2xl font-black text-[var(--color-deep-rind)]">
          {score ?? "--"}
          <span className="ml-0.5 text-sm font-bold text-[var(--color-soft-ink)]">/ 100</span>
        </div>
        <div className="mt-2 flex justify-end gap-1">
          {[34, 68, 100].map((threshold, i) => (
            <span
              key={i}
              className={`h-1.5 w-4 rounded-full transition-colors ${
                score !== null && score >= threshold ? "bg-[var(--color-flesh)]" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
