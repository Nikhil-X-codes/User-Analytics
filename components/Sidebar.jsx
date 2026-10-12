"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  {
    id: "sidebar-sessions",
    href: "/dashboard",
    label: "Sessions",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: "sidebar-heatmap",
    href: "/dashboard/heatmap",
    label: "Heatmap",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
  },
  {
    id: "sidebar-demo",
    href: "/demo",
    label: "Demo Page",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 shrink-0 min-h-screen bg-gray-950 border-r border-white/8 flex flex-col">
      <div className="p-6 border-b border-white/8">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Image
              src="/logo.png"
              alt="CausalFunnel Logo"
              width={32}
              height={32}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div>
            <div className="font-semibold text-sm leading-none text-white">
              CausalFunnel
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Analytics</div>
          </div>
        </Link>
      </div>

      <nav className="p-3 flex-1">
        <div className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3 mb-3">
          Navigation
        </div>
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.id}>
              <Link
                id={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive(item.href)
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <span className={isActive(item.href) ? "text-violet-400" : ""}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/8">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-gray-500">Live tracking active</span>
        </div>
      </div>
    </aside>
  );
}
