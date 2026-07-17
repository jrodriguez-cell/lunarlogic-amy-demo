"use client";

import { useEffect, useState } from "react";
import { Menu, X, CalendarDays } from "lucide-react";

import { LunarLogicWordmark } from "@/components/logo";
import { SidebarNav } from "@/components/sidebar-nav";
import { DemoBanner } from "@/components/demo-banner";
import { SiteFooter } from "@/components/site-footer";
import { CurrentDate } from "@/components/current-date";
import { cn } from "@/lib/utils";
import { demoClient } from "@/data/client";

const BANNER_KEY = "ll-demo-banner-dismissed";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-6">
        <LunarLogicWordmark />
      </div>
      <div className="mt-2 flex-1 overflow-y-auto pb-6">
        <SidebarNav onNavigate={onNavigate} />
      </div>
      <div className="border-t border-slate-700/60 px-6 py-4">
        <p className="text-xs font-semibold text-slate-300">
          {demoClient.contact}
        </p>
        <p className="text-xs text-slate-500">{demoClient.name}</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  // Default visible so SSR and first client render match; reconcile after mount.
  const [bannerVisible, setBannerVisible] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(BANNER_KEY) === "1") setBannerVisible(false);
  }, []);

  const dismissBanner = () => {
    localStorage.setItem(BANNER_KEY, "1");
    setBannerVisible(false);
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {bannerVisible && <DemoBanner onDismiss={dismissBanner} />}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 z-30 hidden w-64 border-r border-slate-700 bg-slate-900/60 backdrop-blur-sm lg:block",
            bannerVisible ? "top-[33px]" : "top-0"
          )}
        >
          <SidebarContent />
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <aside className="absolute inset-y-0 left-0 w-64 border-r border-slate-700 bg-slate-900 shadow-xl">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="absolute right-3 top-4 rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        {/* Main column */}
        <div className="flex min-h-screen w-full flex-col lg:pl-64">
          {/* Top bar */}
          <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-700 bg-[#0F172A]/80 px-4 backdrop-blur-md sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="rounded-md p-2 text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex flex-col">
              <span className="font-heading text-base font-semibold leading-tight text-slate-100">
                {demoClient.name}
              </span>
              <span className="text-xs text-slate-500">
                {demoClient.contact}
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2 text-sm text-slate-400">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              <CurrentDate />
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>

          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
