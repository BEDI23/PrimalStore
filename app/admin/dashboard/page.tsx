"use client";

import { PackageCheck, ShoppingBag, TrendingUp, Wallet } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import CommandesChart from "@/components/admin/CommandesChart";
import StatutDonutChart from "@/components/admin/StatutDonutChart";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { useCommandesAdmin } from "@/lib/api/hooks";
import { formatPrix, getStartOfDay, getStartOfWeek } from "@/lib/utils";
import type { Commande } from "@/lib/api/types";

function getChartData(commandes: Commande[]) {
  const days: { date: string; commandes: number; revenu: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const start = getStartOfDay(d);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const jour = commandes.filter((c) => {
      const created = new Date(c.createdAt);
      return created >= start && created < end;
    });

    const revenu = jour
      .filter((c) => c.statut === "livree")
      .reduce((s, c) => s + (c.prixTotal ?? 0), 0);

    days.push({
      date: start.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
      }),
      commandes: jour.length,
      revenu,
    });
  }
  return days;
}

function getGreeting(d: Date): string {
  const h = d.getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

function getTopProduit(commandes: Commande[]): string {
  const counts: Record<string, number> = {};
  commandes.forEach((c) => {
    const nom = c.produitNom ?? "Inconnu";
    counts[nom] = (counts[nom] ?? 0) + (c.quantite ?? 1);
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0] ? `${sorted[0][0]} (${sorted[0][1]})` : "—";
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useCommandesAdmin();
  const commandes = data?.data ?? [];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
        Erreur lors du chargement des commandes. Veuillez rafraîchir la page.
      </p>
    );
  }

  const now = new Date();
  const startToday = getStartOfDay(now);
  const startWeek = getStartOfWeek(now);

  const livrees = commandes.filter((c) => c.statut === "livree");
  const livreesSemaine = livrees.filter(
    (c) => new Date(c.createdAt) >= startWeek
  );

  const today = commandes.filter(
    (c) => new Date(c.createdAt) >= startToday
  ).length;

  const weekCommandes = commandes.filter(
    (c) => new Date(c.createdAt) >= startWeek
  );

  const revenuReel = livrees.reduce((s, c) => s + (c.prixTotal ?? 0), 0);
  const revenuReelSemaine = livreesSemaine.reduce(
    (s, c) => s + (c.prixTotal ?? 0),
    0
  );
  const annulees = commandes.filter((c) => c.statut === "annulee");
  const panierMoyen = livrees.length > 0 ? revenuReel / livrees.length : 0;

  const secondaryStats = [
    { label: "Total commandes", value: commandes.length },
    { label: "Aujourd'hui", value: today },
    { label: "Cette semaine", value: weekCommandes.length },
    { label: "Annulées", value: annulees.length },
    { label: "Top produit", value: getTopProduit(commandes) },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">
            {getGreeting(now)}
          </h2>
          <p className="mt-1 text-sm text-graphite">
            Voici un aperçu de l&apos;activité de votre boutique.
          </p>
        </div>
        <p className="text-sm capitalize text-graphite-light">
          {now.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenu réel (total)"
          value={formatPrix(revenuReel)}
          subtitle="Commandes livrées uniquement"
          icon={Wallet}
          tone="primary"
        />
        <StatCard
          title="Revenu réel (semaine)"
          value={formatPrix(revenuReelSemaine)}
          icon={TrendingUp}
          tone="green"
          delay={80}
        />
        <StatCard
          title="Commandes livrées"
          value={livrees.length}
          subtitle="Cochées « Livré » dans l'admin"
          icon={PackageCheck}
          tone="blue"
          delay={160}
        />
        <StatCard
          title="Panier moyen"
          value={formatPrix(panierMoyen)}
          icon={ShoppingBag}
          tone="violet"
          delay={240}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CommandesChart data={getChartData(commandes)} />
        </div>
        <StatutDonutChart commandes={commandes} />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-2 divide-y divide-gray-100 sm:grid-cols-5 sm:divide-y-0 sm:divide-x">
          {secondaryStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg px-3 py-2 transition-colors first:pl-0 hover:bg-primary-50/60 sm:py-1"
            >
              <p className="text-xs text-graphite">{stat.label}</p>
              <p className="mt-1 truncate font-display text-lg font-semibold text-ink">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
