interface MetricStripProps {
  items: Array<{
    label: string;
    value: string | number;
    description?: string;
  }>;
}

export function MetricStrip({ items }: MetricStripProps) {
  return (
    <section className="grid gap-px overflow-hidden rounded-[28px] border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-surface px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
          <p className="mt-3 text-3xl font-semibold">{item.value}</p>
          {item.description ? <p className="mt-2 text-sm text-slate-600">{item.description}</p> : null}
        </div>
      ))}
    </section>
  );
}
