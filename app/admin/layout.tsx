"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMe } from "@/lib/api/hooks";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import Sidebar, {
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_COLLAPSED,
} from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";

const SIDEBAR_STORAGE_KEY = "primal-admin-sidebar-collapsed";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isLoading, isError } = useMe();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  // Restaurer l'état réduit/déplié de la sidebar (desktop)
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1");
    } catch {
      // localStorage indisponible : on garde la valeur par défaut
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignoré
      }
      return next;
    });
  }

  // Fermer le menu mobile à chaque changement de page
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Sur la page de login : rediriger si déjà connecté
  useEffect(() => {
    if (isLoginPage && data) {
      router.replace("/admin/dashboard");
    }
  }, [isLoginPage, data, router]);

  // Sur une route protégée : rediriger si non authentifié
  useEffect(() => {
    if (!isLoginPage && !isLoading && (isError || !data)) {
      router.replace("/admin/login");
    }
  }, [isLoginPage, isLoading, isError, data, router]);

  // Page login : pas de shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Route protégée : loader pendant le chargement ou en attente de redirect
  if (isLoading || isError || !data) {
    return <PageLoader variant="admin" />;
  }

  // Authentifié : shell admin complet
  return (
    <div className="min-h-screen bg-surface-muted">
      <Sidebar
        open={sidebarOpen}
        collapsed={collapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapsed={toggleCollapsed}
      />
      <div
        style={
          {
            "--sidebar-w": `${collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}px`,
          } as React.CSSProperties
        }
        className="transition-[margin] duration-300 ease-[var(--ease-signature)] md:ml-[var(--sidebar-w)]"
      >
        <AdminHeader
          email={data.email}
          collapsed={collapsed}
          onMenuClick={() => setSidebarOpen(true)}
          onToggleCollapsed={toggleCollapsed}
        />
        {/* key=pathname : rejoue l'animation d'entrée à chaque changement de page */}
        <main
          key={pathname}
          className="animate-in fade-in-0 slide-in-from-bottom-2 p-4 duration-500 sm:p-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
