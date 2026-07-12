"use client";

import { useRouter } from "next/navigation";
import { useLogout } from "@/lib/api/hooks";
import { LogOut, Menu } from "lucide-react";

export default function AdminHeader({
  email,
  onMenuClick,
}: {
  email: string;
  onMenuClick: () => void;
}) {
  const router = useRouter();
  const { mutate: logout, isPending } = useLogout();

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => router.replace("/admin/login"),
    });
  }

  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-graphite hover:bg-surface-subtle md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-display text-base font-semibold text-ink sm:text-lg">
          Administration
        </h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="hidden text-sm text-graphite sm:inline">{email}</span>
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-graphite transition hover:bg-surface-subtle disabled:opacity-50 sm:px-3"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
