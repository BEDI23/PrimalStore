"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { STATUT_LABELS } from "@/lib/constants";
import type { Commande } from "@/lib/api/types";

const STATUT_HEX: Record<string, string> = {
  nouvelle: "#f97316",
  livree: "#22c55e",
  annulee: "#ef4444",
};

export default function StatutDonutChart({
  commandes,
}: {
  commandes: Commande[];
}) {
  const counts: Record<string, number> = {};
  commandes.forEach((c) => {
    counts[c.statut] = (counts[c.statut] ?? 0) + 1;
  });

  const data = Object.entries(counts).map(([statut, value]) => ({
    statut,
    value,
  }));

  const total = commandes.length;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-ink">
        Répartition par statut
      </h3>
      {total === 0 ? (
        <p className="py-16 text-center text-sm text-graphite">
          Aucune commande.
        </p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="statut"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.statut}
                    fill={STATUT_HEX[entry.statut] ?? "#9B9AA1"}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, _name, entry) => [
                  value,
                  STATUT_LABELS[entry.payload.statut] ?? entry.payload.statut,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <ul className="mt-2 space-y-1.5">
            {data.map((entry) => (
              <li
                key={entry.statut}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2 text-graphite">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: STATUT_HEX[entry.statut] ?? "#9B9AA1",
                    }}
                  />
                  {STATUT_LABELS[entry.statut] ?? entry.statut}
                </span>
                <span className="font-semibold text-ink">
                  {entry.value}{" "}
                  <span className="font-normal text-graphite-light">
                    ({Math.round((entry.value / total) * 100)}%)
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
