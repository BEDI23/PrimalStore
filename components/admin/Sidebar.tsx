"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  FolderOpen,
  FolderTree,
  X,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
} from "lucide-react";
import { BOUTIQUE_NOM } from "@/lib/constants";

export const SIDEBAR_WIDTH = 256;
export const SIDEBAR_WIDTH_COLLAPSED = 76;

export const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/categories", label: "Catégories", icon: FolderOpen },
  {
    href: "/admin/sous-categories",
    label: "Sous-catégories",
    icon: FolderTree,
  },
  { href: "/admin/produits", label: "Produits", icon: Package },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingCart },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
];

export default function Sidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapsed,
}: {
  /** Tiroir mobile ouvert */
  open: boolean;
  /** Mode icônes seules (desktop uniquement) */
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapsed: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Fond semi-transparent sur mobile quand le menu est ouvert */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        style={
          {
            "--sidebar-w": `${collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}px`,
          } as React.CSSProperties
        }
        className={`bg-brand-dark fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/5 text-white transition-[transform,width] duration-300 ease-[var(--ease-signature)] md:w-[var(--sidebar-w)] md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-white/10 px-4 ${
            collapsed ? "md:justify-center md:px-0" : "justify-between"
          }`}
        >
          <Link
            href="/admin/dashboard"
            className="flex min-w-0 items-center gap-3"
          >
            <Image
              src="/logo.jpeg"
              alt={BOUTIQUE_NOM}
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-lg object-cover ring-2 ring-primary/40"
            />
            <span
              className={`truncate font-display text-sm font-bold ${
                collapsed ? "md:hidden" : ""
              }`}
            >
              {BOUTIQUE_NOM}
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3">
          <p
            className={`px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-white/35 ${
              collapsed ? "md:hidden" : ""
            }`}
          >
            Gestion
          </p>
          {adminLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  collapsed ? "md:justify-center" : ""
                } ${
                  active
                    ? "text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="admin-sidebar-active"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-primary-light shadow-lg shadow-primary/30"
                  />
                )}
                <Icon
                  className={`relative h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    active ? "text-white" : ""
                  }`}
                />
                <span
                  className={`relative truncate ${collapsed ? "md:hidden" : ""}`}
                >
                  {label}
                </span>

                {/* Info-bulle en mode réduit */}
                {collapsed && (
                  <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md bg-ink-soft px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity duration-150 group-hover:opacity-100 md:block">
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Pied de sidebar */}
        <div className="shrink-0 space-y-1 border-t border-white/10 p-3">
          <Link
            href="/"
            target="_blank"
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white ${
              collapsed ? "md:justify-center" : ""
            }`}
          >
            <ExternalLink className="h-5 w-5 shrink-0" />
            <span className={collapsed ? "md:hidden" : ""}>Voir la boutique</span>
            {collapsed && (
              <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md bg-ink-soft px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity duration-150 group-hover:opacity-100 md:block">
                Voir la boutique
              </span>
            )}
          </Link>
          <button
            onClick={onToggleCollapsed}
            aria-label={
              collapsed ? "Déplier la barre latérale" : "Réduire la barre latérale"
            }
            aria-expanded={!collapsed}
            className={`hidden w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white md:flex ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {collapsed ? (
              <ChevronsRight className="h-5 w-5 shrink-0" />
            ) : (
              <>
                <ChevronsLeft className="h-5 w-5 shrink-0" />
                <span>Réduire</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
