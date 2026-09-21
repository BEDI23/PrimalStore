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
    <div className="animate-in fade-in-0 slide-in-from-bottom-3 h-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm duration-500 fill-mode-both [animation-delay:300ms]">
      <h3 className="mb-4 font-display text-sm font-semibold text-ink">
        Commandes &amp; revenu des 7 derniers jours
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ left: 0, right: 8 }}>
          <defs>
            <linearGradient id="commandesBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6A42" />
              <stop offset="100%" stopColor="#ED4C20" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            allowDecimals={false}
            tick={{ fontSize: 12 }}
            width={30}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            width={70}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatPrix(v)}
          />
          <Tooltip
            cursor={{ fill: "rgba(237, 76, 32, 0.06)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #f0f0f0",
              boxShadow: "0 8px 24px -8px rgba(11, 11, 12, 0.15)",
            }}
            formatter={(value: number, name: string) =>
              name === "Revenu (livrées)" ? formatPrix(value) : value
            }
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            yAxisId="left"
            dataKey="commandes"
            name="Commandes"
            fill="url(#commandesBar)"
            radius={[8, 8, 0, 0]}
            animationDuration={900}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="revenu"
            name="Revenu (livrées)"
            stroke="#22c55e"
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
            activeDot={{ r: 5 }}
            animationDuration={1100}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
