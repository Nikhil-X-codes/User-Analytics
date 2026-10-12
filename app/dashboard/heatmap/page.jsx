import { connection } from "next/server";
import { getTrackedPages, getClicksForPage } from "@/lib/analytics";
import HeatmapViewer from "@/components/HeatmapViewer";
import StatusMessage from "@/components/StatusMessage";

export const metadata = {
  title: "Click Heatmap — CausalFunnel Analytics",
  description:
    "Visualise user click locations, density hotspots, and interaction patterns across your application pages.",
};

export const instant = false;

export default async function HeatmapPage() {
  await connection();

  let pages = [];
  let defaultUrl = "";
  let initialClicks = [];
  let fetchError = null;

  try {
    pages = await getTrackedPages();

    if (pages.length > 0) {
      const demoPage = pages.find((p) => p.includes("/demo"));
      defaultUrl = demoPage || pages[0];
    } else {
      defaultUrl = "http://localhost:3000/demo";
      pages = [defaultUrl];
    }

    if (defaultUrl) {
      initialClicks = await getClicksForPage(defaultUrl);
    }
  } catch (err) {
    console.error("[HeatmapPage] Error fetching initial heatmap data:", err);
    fetchError = err.message;
  }

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Click Heatmap
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-2xl leading-relaxed">
          Inspect click locations and user interaction patterns on any tracked page.
        </p>
      </div>

      {fetchError ? (
        <StatusMessage
          type="error"
          title="Failed to Load Analytics Data"
          message={`Unable to connect to database: ${fetchError}`}
        />
      ) : (
        <HeatmapViewer
          initialPages={pages}
          initialSelectedUrl={defaultUrl}
          initialClicks={initialClicks}
        />
      )}
    </div>
  );
}
