export default function StatusMessage({ type = "info", title, message }) {
  const styles = {
    error: {
      wrapper: "bg-red-500/10 border-red-500/30 text-red-300",
      icon: (
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      ),
    },
    empty: {
      wrapper: "bg-white/3 border-white/10 text-gray-400",
      icon: (
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    info: {
      wrapper: "bg-blue-500/10 border-blue-500/30 text-blue-300",
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const s = styles[type] ?? styles.info;

  return (
    <div className={`flex items-start gap-4 rounded-xl border px-6 py-5 ${s.wrapper}`}>
      <div className="shrink-0 mt-0.5">{s.icon}</div>
      <div>
        {title && <p className="font-semibold text-sm">{title}</p>}
        {message && (
          <p className="text-sm opacity-80 mt-1 leading-relaxed">{message}</p>
        )}
      </div>
    </div>
  );
}
