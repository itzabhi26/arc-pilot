"use client";

import * as React from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Bot,
  BarChart3,
  History as HistoryIcon,
  PieChart,
  Settings,
} from "lucide-react";
import { ArcLogo } from "@/components/logo";
import { cn, shortAddress } from "@/lib/utils";
import { useApp } from "@/components/providers/app-provider";

const navItems: {
  key: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "ai-agent", label: "AI Agent", icon: Bot, badge: "New" },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "history", label: "History", icon: HistoryIcon },
  { key: "portfolio", label: "Portfolio", icon: PieChart },
  { key: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  active,
  onNavigate,
}: {
  active: string;
  onNavigate: (key: string) => void;
}) {
  const { username, smartWalletAddress } = useApp();

  return (
    <aside className="hidden lg:flex w-[248px] shrink-0 flex-col h-screen sticky top-0 border-r border-border-subtle bg-surface px-4 py-5">
      <div className="px-2 mb-8">
        <ArcLogo size={34} tagline />
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={cn(
                "focus-ring w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-soft text-[var(--arc-blue)]"
                  : "text-ink-500 hover:bg-surface-hover hover:text-ink-900"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--arc-blue)] text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border-subtle pt-4 mt-4">
        <div className="rounded-2xl bg-surface-2 border border-border-subtle p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <div
                className="h-9 w-9 rounded-full overflow-hidden ring-1 ring-border-soft"
                style={{ backgroundImage: "var(--arc-gradient)" }}
              >
                <Image
                  src="/brand/user-pfp.jpg"
                  alt={username ? `@${username}` : "Profile picture"}
                  width={36}
                  height={36}
                  className="h-9 w-9 object-cover"
                  draggable={false}
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[var(--success)] border-2 border-surface-2" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink-900 truncate">
                @{username ?? "you"}
              </p>
              <p className="text-[11px] text-ink-400 font-mono truncate">
                {smartWalletAddress ? shortAddress(smartWalletAddress, 6) : ""}
              </p>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-ink-500 leading-relaxed">
            Built with ❤️ by ItzAbhi
            <br />
            Crafting AI × Web3 Experiences
          </p>
          <a
            href="https://x.com/ItzAbhi0"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--arc-blue)] hover:underline"
          >
            𝕏 @ItzAbhi0
          </a>
        </div>
      </div>
    </aside>
  );
}
