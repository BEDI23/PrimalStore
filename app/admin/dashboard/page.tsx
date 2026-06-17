import StatCard from "@/components/admin/StatCard";
import CommandesChart from "@/components/admin/CommandesChart";
import { getAllCommandes } from "@/lib/data";
import {
  formatPrix,
  getStartOfDay,
  getStartOfWeek,
  sumRevenu,
} from "@/lib/utils";
import { Commande } from "@/lib/types";

export const dynamic = "force-dynamic";

function getChartData(commandes: Commande[]) {
  const days: { date: string; commandes: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const start = getStartOfDay(d);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const count = commandes.filter((c) => {
      const created = new Date(c.created_at);
      return created >= start && created < end;
    }).length;

    days.push({
      date: start.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
      }),
      commandes: count,
    });
  }
  return days;
}

function getTopProduit(commandes: Commande[]): string {
  const counts: Record<string, number> = {};
  commandes.forEach((c) => {
    const nom = c.produit_nom ?? "Inconnu";
    counts[nom] = (counts[nom] ?? 0) + (c.quantite ?? 1);
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0] ? `${sorted[0][0]} (${sorted[0][1]})` : "—";
}

export default async function DashboardPage() {
  const commandes = await getAllCommandes();
  const now = new Date();
  const startToday = getStartOfDay(now);
  const startWeek = getStartOfWeek(now);

  const livrees = commandes.filter((c) => c.statut === "livree");
  const livreesSemaine = livrees.filter(
    (c) => new Date(c.created_at) >= startWeek
  );

  const today = commandes.filter(
    (c) => new Date(c.created_at) >= startToday
  ).length;

  const weekCommandes = commandes.filter(
    (c) => new Date(c.created_at) >= startWeek
  );

  const revenuReel = sumRevenu(commandes, "livree");
  const revenuReelSemaine = sumRevenu(livreesSemaine, "livree");
  const annulees = commandes.filter((c) => c.statut === "annulee");

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-gray-900">Dashboard</h2>

      <div className="mb-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Revenus réels (commandes livrées)
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Commandes livrées"
            value={livrees.length}
            subtitle="Cochées « Livré » dans l'admin"
          />
          <StatCard
            title="Revenu réel (total)"
            value={formatPrix(revenuReel)}
            subtitle="Uniquement les commandes livrées"
          />
          <StatCard
            title="Revenu réel (semaine)"
            value={formatPrix(revenuReelSemaine)}
          />
          <StatCard
            title="Commandes annulées"
            value={annulees.length}
            subtitle="Marquées « Annulée » dans l'admin"
          />
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total commandes" value={commandes.length} />
        <StatCard title="Commandes aujourd'hui" value={today} />
        <StatCard title="Commandes cette semaine" value={weekCommandes.length} />
        <StatCard
          title="Produit le plus commandé"
          value={getTopProduit(commandes)}
        />
      </div>

      <CommandesChart data={getChartData(commandes)} />
    </div>
  );
}
