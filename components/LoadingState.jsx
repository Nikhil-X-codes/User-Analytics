export default function LoadingState({ rows = 5, label = "Loading…" }) {
  return (
    <div role="status" aria-label={label} className="animate-pulse space-y-3">
      <div className="h-4 w-48 bg-white/10 rounded-lg mb-6" />

      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 bg-white/5 border border-white/8 rounded-xl px-5 py-4"
        >
          <div className="h-3 w-32 bg-white/10 rounded" />
          <div className="h-3 w-12 bg-white/10 rounded ml-auto" />
          <div className="h-3 w-28 bg-white/10 rounded" />
          <div className="h-3 w-28 bg-white/10 rounded" />
          <div className="h-7 w-20 bg-white/10 rounded-lg" />
        </div>
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}
