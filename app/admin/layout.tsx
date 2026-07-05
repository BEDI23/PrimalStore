"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMe } from "@/lib/api/hooks";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isLoading, isError } = useMe();

  const isLoginPage = pathname === "/admin/login";

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
      <Sidebar />
      <div className="ml-56">
        <AdminHeader email={data.email} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
