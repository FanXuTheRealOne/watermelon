interface MetricCardProps {
  label: string;
  value: string;
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-[rgba(27,94,32,0.08)] bg-white/65 p-3 text-center">
      <span className="block text-xs font-bold text-[var(--color-soft-ink)]">{label}</span>
      <strong className="mt-1 block text-sm font-extrabold tabular-nums text-[var(--color-ink)]">
        {value}
      </strong>
    </div>
  );
}
