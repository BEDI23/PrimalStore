"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatPrix } from "@/lib/utils";

interface ChartData {
  date: string;
  commandes: number;
  revenu: number;
}

export default function CommandesChart({ data }: { data: ChartData[] }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-ink">
        Commandes &amp; revenu des 7 derniers jours
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ left: 0, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            yAxisId="left"
            allowDecimals={false}
            tick={{ fontSize: 12 }}
            width={30}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            width={70}
            tickFormatter={(v: number) => formatPrix(v)}
          />
          <Tooltip
            formatter={(value: number, name: string) =>
              name === "Revenu (livrées)" ? formatPrix(value) : value
            }
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            yAxisId="left"
            dataKey="commandes"
            name="Commandes"
            fill="#ED4C20"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="revenu"
            name="Revenu (livrées)"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
