import { Mic } from "lucide-react";

export function CopyBlock() {
  return (
    <section className="relative z-10 text-center">
      <h1 className="text-4xl font-black text-[var(--color-deep-rind)]">敲一下，听听甜度</h1>
      <p className="mt-2.5 text-[15px] font-medium text-[var(--color-soft-ink)]">
        轻敲西瓜，系统会根据声音判断甜度
      </p>
      <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-soft-ink)] opacity-85">
        <Mic className="h-4 w-4" />
        需要麦克风权限才能录音
      </p>
    </section>
  );
}
