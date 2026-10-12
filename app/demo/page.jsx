import Script from "next/script";
import Image from "next/image";

export const metadata = {
  title: "Demo Page — CausalFunnel Analytics",
  description:
    "An interactive demo page for the CausalFunnel analytics tracker. Visit and click around to generate tracked events.",
};

export default function DemoPage() {
  return (
    <>
      <Script src="/tracker.js" strategy="afterInteractive" />

      <div className="min-h-screen bg-gray-950 text-white font-sans">
        <nav className="border-b border-white/10 backdrop-blur-sm bg-gray-950/80 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-7 h-7 rounded-full overflow-hidden shadow-sm shrink-0">
                <Image
                  src="/logo.png"
                  alt="CausalFunnel Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <span className="font-semibold text-lg tracking-tight">
                CausalFunnel
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
              <a
                id="nav-features"
                href="#features"
                className="hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                id="nav-docs"
                href="#docs"
                className="hover:text-white transition-colors"
              >
                Tracker Snippet
              </a>
              <a
                id="nav-dashboard"
                href="/dashboard"
                className="hover:text-white transition-colors"
              >
                Dashboard
              </a>
            </div>
            <a
              id="nav-cta"
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium transition-colors"
            >
              View Analytics →
            </a>
          </div>
        </nav>

        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-violet-600/20 blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto px-6 py-28 text-center">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30">
                🔍 Analytics Demo — clicks are being tracked
              </span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                🛡️ Zero PII · Respects Do-Not-Track
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              Understand every
              <br />
              user journey
            </h1>

            <p className="text-base md:text-lg text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">
              CausalFunnel records page views, clicks, and session behaviour so
              you can see exactly how people interact with your product.
            </p>

            <div className="flex justify-center">
              <a
                id="hero-cta-primary"
                href="/dashboard"
                className="px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold text-base transition-all hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25"
              >
                Open Dashboard →
              </a>
            </div>

            <p className="mt-6 text-xs text-gray-500">
              👆 Every click on this demo page is recorded — inspect the dashboard and heatmap to view them.
            </p>
          </div>
        </section>

        <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
            Core Analytics Capabilities
          </h2>
          <p className="text-center text-gray-400 mb-12 text-sm">
            Everything needed to capture and visualize user interactions.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                id: "card-session",
                icon: "👤",
                title: "Session Tracking",
                desc: "Persistent browser visitor IDs group events into cohesive user sessions across multiple page views.",
              },
              {
                id: "card-heatmap",
                icon: "🔥",
                title: "Click Heatmaps",
                desc: "Visualise exact user click positions mapped against the page layout using document-relative coordinates.",
              },
              {
                id: "card-journey",
                icon: "🗺️",
                title: "User Journeys",
                desc: "Chronological timelines show the step-by-step path a user took, complete with timestamps and click positions.",
              },
            ].map((card) => (
              <div
                key={card.id}
                id={card.id}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/40 hover:bg-white/8 transition-all cursor-pointer group"
              >
                <div className="text-3xl mb-4">{card.icon}</div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-violet-300 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="docs" className="max-w-3xl mx-auto px-6 py-20 border-t border-white/5 text-center">
          <h2 className="text-2xl font-bold mb-3">Client-Side Tracker Script</h2>
          <p className="text-gray-400 text-sm mb-6">
            Include the lightweight tracker script once per page to start streaming analytics.
          </p>
          <div className="bg-gray-900 border border-white/10 rounded-xl p-5 text-left mb-8 font-mono text-xs md:text-sm text-green-400 overflow-x-auto">
            <span className="text-gray-500">{"<!-- Embed before </body> or in <head> -->"}</span>
            <br />
            {'<script src="/tracker.js" defer></script>'}
          </div>
          <div className="flex justify-center">
            <a
              id="docs-dashboard-link"
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold transition-all"
            >
              Open Analytics Dashboard →
            </a>
          </div>
        </section>

        <footer className="border-t border-white/10 py-8">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0">
                <Image
                  src="/logo.png"
                  alt="CausalFunnel Logo"
                  width={16}
                  height={16}
                  className="w-full h-full object-cover"
                />
              </div>
              <span>CausalFunnel Analytics</span>
            </div>
            <span>Built with Next.js & MongoDB</span>
          </div>
        </footer>
      </div>
    </>
  );
}
