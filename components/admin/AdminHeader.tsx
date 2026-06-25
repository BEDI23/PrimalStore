"use client";

import { useRouter } from "next/navigation";
import { useLogout } from "@/lib/api/hooks";
import { LogOut } from "lucide-react";

export default function AdminHeader({ email }: { email: string }) {
  const router = useRouter();
  const { mutate: logout, isPending } = useLogout();

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => router.replace("/admin/login"),
    });
  }

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <h1 className="text-lg font-semibold text-gray-900">Administration</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{email}</span>
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </header>
  );
}
