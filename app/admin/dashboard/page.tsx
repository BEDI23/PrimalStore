"use client";

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
      <h2 className="font-display mb-6 text-xl font-bold text-ink">Dashboard</h2>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenu réel (total)"
          value={formatPrix(revenuReel)}
          subtitle="Commandes livrées uniquement"
        />
        <StatCard
          title="Revenu réel (semaine)"
          value={formatPrix(revenuReelSemaine)}
        />
        <StatCard
          title="Commandes livrées"
          value={livrees.length}
          subtitle="Cochées « Livré » dans l'admin"
        />
        <StatCard title="Panier moyen" value={formatPrix(panierMoyen)} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CommandesChart data={getChartData(commandes)} />
        </div>
        <StatutDonutChart commandes={commandes} />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-2 divide-y divide-gray-100 sm:grid-cols-5 sm:divide-y-0 sm:divide-x">
          {secondaryStats.map((stat) => (
            <div key={stat.label} className="px-3 py-2 first:pl-0 sm:py-0">
              <p className="text-xs text-graphite">{stat.label}</p>
              <p className="mt-1 truncate text-lg font-semibold text-ink">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
