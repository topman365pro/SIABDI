export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-line bg-surface/80 px-6 py-10 text-center shadow-panel">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-accent)]">Data kosong</p>
      <h3 className="mt-3 text-xl font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
