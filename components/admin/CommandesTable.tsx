"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Commande, StatutCommande } from "@/lib/types";
import {
  STATUT_COLORS,
  STATUT_LABELS,
  STATUTS_COMMANDE,
  FILTRES_DATE,
} from "@/lib/constants";
import { filterCommandesByDate } from "@/lib/utils";

export default function CommandesTable({ commandes }: { commandes: Commande[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [filtreStatut, setFiltreStatut] = useState<string>("toutes");
  const [filtreDate, setFiltreDate] = useState<string>("toutes");
  const [dateSpecifique, setDateSpecifique] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  let filtered = commandes;

  if (filtreStatut !== "toutes") {
    filtered = filtered.filter((c) => c.statut === filtreStatut);
  }

  filtered = filterCommandesByDate(
    filtered,
    filtreDate,
    dateSpecifique || undefined
  );

  const livrees = commandes.filter((c) => c.statut === "livree");
  const revenuReel = livrees.reduce((s, c) => s + (c.prix_total ?? 0), 0);

  async function updateStatut(id: string, statut: StatutCommande) {
    setActionError("");
    setUpdating(id);
    const { error } = await supabase
      .from("commandes")
      .update({ statut })
      .eq("id", id);
    setUpdating(null);
    if (error) {
      setActionError("Échec de la mise à jour du statut. Réessayez.");
      return;
    }
    router.refresh();
  }

  async function toggleLivre(commande: Commande, livre: boolean) {
    setActionError("");
    setUpdating(commande.id);
    const nouveauStatut: StatutCommande = livre
      ? "livree"
      : commande.statut === "livree"
        ? "confirmee"
        : commande.statut;
    const { error } = await supabase
      .from("commandes")
      .update({ statut: nouveauStatut })
      .eq("id", commande.id);
    setUpdating(null);
    if (error) {
      setActionError("Échec de la mise à jour de la livraison. Réessayez.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      {actionError && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {actionError}
        </p>
      )}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">Commandes réellement livrées</p>
          <p className="text-2xl font-bold text-green-900">{livrees.length}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">Revenu réel (livrées)</p>
          <p className="text-2xl font-bold text-green-900">
            {revenuReel.toLocaleString("fr-FR")} FCFA
          </p>
        </div>
      </div>

      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {["toutes", ...STATUTS_COMMANDE].map((s) => (
            <button
              key={s}
              onClick={() => setFiltreStatut(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filtreStatut === s
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {s === "toutes" ? "Tous statuts" : STATUT_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FILTRES_DATE.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setFiltreDate(f.id);
                setDateSpecifique("");
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filtreDate === f.id && !dateSpecifique
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f.label}
            </button>
          ))}
          <input
            type="date"
            value={dateSpecifique}
            onChange={(e) => {
              setDateSpecifique(e.target.value);
              if (e.target.value) setFiltreDate("toutes");
            }}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs"
          />
          {dateSpecifique && (
            <button
              onClick={() => setDateSpecifique("")}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Effacer date
            </button>
          )}
        </div>
      </div>

      <p className="mb-3 text-xs text-gray-500">
        {filtered.length} commande{filtered.length !== 1 ? "s" : ""} — cochez
        &quot;Livré&quot; pour confirmer la livraison et le revenu réel
      </p>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Livré</th>
              <th className="px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="px-4 py-3 font-medium text-gray-600">Client</th>
              <th className="px-4 py-3 font-medium text-gray-600">Téléphone</th>
              <th className="px-4 py-3 font-medium text-gray-600">Produit</th>
              <th className="px-4 py-3 font-medium text-gray-600">Qté</th>
              <th className="px-4 py-3 font-medium text-gray-600">Total</th>
              <th className="px-4 py-3 font-medium text-gray-600">Zone</th>
              <th className="px-4 py-3 font-medium text-gray-600">Statut</th>
              <th className="px-4 py-3 font-medium text-gray-600">Message</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr
                key={c.id}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={c.statut === "livree"}
                    disabled={updating === c.id || c.statut === "annulee"}
                    onChange={(e) => toggleLivre(c, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    title="Marquer comme livré"
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                  {new Date(c.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3 font-medium">{c.client_nom}</td>
                <td className="px-4 py-3">{c.client_telephone}</td>
                <td className="px-4 py-3">{c.produit_nom}</td>
                <td className="px-4 py-3">{c.quantite}</td>
                <td className="px-4 py-3 font-medium">
                  {(c.prix_total ?? 0).toLocaleString("fr-FR")} F
                </td>
                <td className="px-4 py-3">{c.quartier}</td>
                <td className="px-4 py-3">
                  <select
                    value={c.statut}
                    disabled={updating === c.id}
                    onChange={(e) =>
                      updateStatut(c.id, e.target.value as StatutCommande)
                    }
                    className={`rounded-lg border-0 px-2 py-1 text-xs font-medium ${STATUT_COLORS[c.statut]}`}
                  >
                    {STATUTS_COMMANDE.map((s) => (
                      <option key={s} value={s}>
                        {STATUT_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="max-w-[150px] truncate px-4 py-3 text-gray-500">
                  {c.message || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-gray-500">Aucune commande.</p>
        )}
      </div>
    </div>
  );
}
