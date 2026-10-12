"use client";

import { useState, useMemo } from "react";
import StatusMessage from "@/components/StatusMessage";

export default function HeatmapViewer({
  initialPages = [],
  initialSelectedUrl = "",
  initialClicks = [],
}) {
  const [pages, setPages] = useState(initialPages);
  const [selectedUrl, setSelectedUrl] = useState(
    initialSelectedUrl || (initialPages.length > 0 ? initialPages[0] : "")
  );
  const [clicks, setClicks] = useState(initialClicks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredClick, setHoveredClick] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const loadClicksForUrl = (url) => {
    if (!url) return;
    setSelectedUrl(url);
    setLoading(true);
    setError(null);

    fetch(`/api/heatmap?url=${encodeURIComponent(url)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load heatmap data (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        setClicks(data.clicks || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Heatmap fetch error:", err);
        setError(err.message);
        setClicks([]);
        setLoading(false);
      });
  };

  const handleSelectUrl = (url) => {
    if (url === "__custom__") {
      setShowCustomInput(true);
      return;
    }
    setShowCustomInput(false);
    loadClicksForUrl(url);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customInput.trim()) {
      const url = customInput.trim();
      if (!pages.includes(url)) {
        setPages((prev) => [...prev, url]);
      }
      setShowCustomInput(false);
      loadClicksForUrl(url);
    }
  };

  const bounds = useMemo(() => {
    if (!clicks || clicks.length === 0) {
      return { maxX: 1200, maxY: 1200 };
    }
    let maxX = 1200;
    let maxY = 1200;
    clicks.forEach((c) => {
      if (c.x > maxX) maxX = c.x + 100;
      if (c.y > maxY) maxY = c.y + 150;
    });
    return { maxX, maxY };
  }, [clicks]);

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-xl">
          <label
            htmlFor="heatmap-url-select"
            className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5"
          >
            Tracked Page URL
          </label>
          <div className="flex gap-2">
            <select
              id="heatmap-url-select"
              value={showCustomInput ? "__custom__" : selectedUrl}
              onChange={(e) => handleSelectUrl(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl bg-gray-900 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
            >
              {pages.length === 0 && (
                <option value="">No tracked pages available</option>
              )}
              {pages.map((url) => (
                <option key={url} value={url}>
                  {url}
                </option>
              ))}
              <option value="__custom__">+ Enter custom URL...</option>
            </select>

            <button
              id="heatmap-refresh-btn"
              onClick={() => loadClicksForUrl(selectedUrl)}
              disabled={loading || !selectedUrl}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
              title="Refresh click data"
            >
              <svg
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>

          {showCustomInput && (
            <form onSubmit={handleCustomSubmit} className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="http://localhost:3000/demo"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-gray-900 border border-violet-500/50 text-white text-xs focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-medium text-white transition-colors"
              >
                Load
              </button>
              <button
                type="button"
                onClick={() => setShowCustomInput(false)}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        <div className="px-5 py-3 rounded-xl bg-white/3 border border-white/8 text-center min-w-[130px]">
          <div className="text-2xl font-bold text-white">
            {clicks.length}
          </div>
          <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
            Total Clicks
          </div>
        </div>
      </div>

      {error && (
        <StatusMessage
          type="error"
          title="Failed to Load Heatmap Data"
          message={error}
        />
      )}

      {!loading && !error && clicks.length === 0 && (
        <div className="p-12 rounded-2xl bg-white/3 border border-white/10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mx-auto">
            📍
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              No Clicks Recorded for this Page
            </h3>
            <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
              There are no click interactions saved yet for{" "}
              <code className="px-1.5 py-0.5 rounded bg-white/10 text-violet-300 text-xs">
                {selectedUrl || "this URL"}
              </code>
              . Open the demo page and click anywhere to generate live data.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <a
              id="heatmap-open-demo-btn"
              href="/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-all shadow-lg shadow-violet-500/20"
            >
              Open Demo Page →
            </a>
          </div>
        </div>
      )}

      {clicks.length > 0 && (
        <div className="relative rounded-2xl bg-gray-950 border border-white/10 overflow-hidden shadow-2xl">
          <div className="px-5 py-3 bg-gray-900 border-b border-white/10 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              <span className="font-mono text-gray-300 ml-2 truncate max-w-md">
                {selectedUrl}
              </span>
            </div>
            <span className="text-gray-500 font-mono text-[11px]">
              {clicks.length} points plotted
            </span>
          </div>

          <div
            className="overflow-auto max-h-[800px] relative bg-gray-950"
            style={{ minHeight: "600px" }}
          >
            <div
              className="relative mx-auto"
              style={{
                width: `${bounds.maxX}px`,
                height: `${bounds.maxY}px`,
                minWidth: "1200px",
              }}
            >
              <iframe
                src={selectedUrl}
                title="Heatmap page background"
                className="w-full h-full border-0 pointer-events-none select-none opacity-90"
                tabIndex={-1}
              />

              <div
                className="absolute inset-0 pointer-events-auto"
                style={{ zIndex: 30 }}
              >
                {clicks.map((click, index) => {
                  const isHovered = hoveredClick === click;

                  return (
                    <div
                      key={`click-${index}-${click.x}-${click.y}`}
                      className="absolute group cursor-pointer transition-transform duration-150"
                      style={{
                        left: `${click.x}px`,
                        top: `${click.y}px`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onMouseEnter={() => setHoveredClick(click)}
                      onMouseLeave={() => setHoveredClick(null)}
                    >
                      <div
                        className="rounded-full animate-pulse transition-all pointer-events-none absolute left-1/2 top-1/2"
                        style={{
                          width: "36px",
                          height: "36px",
                          backgroundColor: "rgba(239, 68, 68, 0.45)",
                          filter: "blur(5px)",
                          transform: "translate(-50%, -50%)",
                        }}
                      />

                      <div
                        className="w-6 h-6 rounded-full bg-red-500 border border-amber-200 shadow-lg relative flex items-center justify-center transition-transform hover:scale-125"
                        style={{
                          boxShadow: "0 0 14px rgba(245, 158, 11, 0.7)",
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white opacity-90" />
                      </div>

                      {isHovered && (
                        <div
                          className="absolute z-50 bg-gray-900/95 border border-white/20 text-white rounded-lg px-3 py-1.5 text-xs shadow-2xl backdrop-blur-md whitespace-nowrap pointer-events-none"
                          style={{
                            left: "50%",
                            bottom: "100%",
                            transform: "translateX(-50%) translateY(-8px)",
                          }}
                        >
                          <div className="font-semibold text-violet-300">
                            X: {click.x}px · Y: {click.y}px
                          </div>
                          {click.timestamp && (
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                              {new Date(click.timestamp).toLocaleTimeString()}
                            </div>
                          )}
                          <div className="w-2 h-2 bg-gray-900 border-r border-b border-white/20 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
