"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLogout } from "@/lib/api/hooks";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { adminLinks } from "@/components/admin/Sidebar";

export default function AdminHeader({
  email,
  collapsed,
  onMenuClick,
  onToggleCollapsed,
}: {
  email?: string | null;
  collapsed: boolean;
  onMenuClick: () => void;
  onToggleCollapsed: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { mutate: logout, isPending } = useLogout();

  const title =
    adminLinks.find((l) => pathname.startsWith(l.href))?.label ??
    "Administration";

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => router.replace("/admin/login"),
    });
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-100 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2">
        {/* Mobile : ouvre le tiroir */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-graphite transition hover:bg-surface-subtle hover:text-ink md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        {/* Desktop : réduit / déplie la sidebar */}
        <button
          onClick={onToggleCollapsed}
          className="hidden rounded-lg p-2 text-graphite transition hover:bg-surface-subtle hover:text-ink md:block"
          aria-label={
            collapsed ? "Déplier la barre latérale" : "Réduire la barre latérale"
          }
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
        <div className="ml-1 flex items-center gap-2">
          <span className="hidden text-sm text-graphite-light sm:inline">
            Administration
          </span>
          <span className="hidden text-graphite-light sm:inline">/</span>
          <h1 className="font-display text-base font-semibold text-ink sm:text-lg">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-light text-sm font-bold uppercase text-white shadow-md shadow-primary/30"
            aria-hidden="true"
          >
            {email?.charAt(0) || "A"}
          </span>
          <span className="hidden max-w-[200px] truncate text-sm text-graphite-dark sm:inline">
            {email ?? "Admin"}
          </span>
        </div>
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-graphite transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 sm:px-3"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
