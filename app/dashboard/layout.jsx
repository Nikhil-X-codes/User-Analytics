import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: {
    template: "%s — CausalFunnel Dashboard",
    default: "Dashboard — CausalFunnel Analytics",
  },
  description: "Analytics dashboard: sessions, user journeys, and click heatmaps.",
};

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
