"use client";

import { useState } from "react";
import {
  useCommandesAdmin,
  useUpdateStatutCommande,
} from "@/lib/api/hooks/use-commandes";
import { getApiErrorMessage } from "@/lib/api/http";
import type { Commande, StatutCommande } from "@/lib/api/types";
import {
  STATUT_COLORS,
  STATUT_LABELS,
  STATUTS_COMMANDE,
  FILTRES_DATE,
  statutsDisponibles,
} from "@/lib/constants";
import { filterCommandesByDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CommandesTable() {
  const { data, isLoading } = useCommandesAdmin();
  const commandes = data?.data ?? [];
  const updateStatut = useUpdateStatutCommande();

  const [filtreStatut, setFiltreStatut] = useState<string>("toutes");
  const [filtreDate, setFiltreDate] = useState<string>("toutes");
  const [dateSpecifique, setDateSpecifique] = useState("");
  const [actionError, setActionError] = useState("");

  // Mapping local pour compatibilité avec filterCommandesByDate (attend created_at snake_case).
  // On ne modifie pas lib/utils.ts.
  const commandesMapped = commandes.map((c) => ({ ...c, created_at: c.createdAt }));

  let filtered = commandesMapped;

  if (filtreStatut !== "toutes") {
    filtered = filtered.filter((c) => c.statut === filtreStatut);
  }

  filtered = filterCommandesByDate(filtered, filtreDate, dateSpecifique || undefined);

  const livrees = commandes.filter((c) => c.statut === "livree");
  const revenuReel = livrees.reduce((s, c) => s + (c.prixTotal ?? 0), 0);

  // La case « Livré » ne sert qu'à confirmer la livraison d'une commande
  // nouvelle. Une commande livrée ne peut pas redevenir « nouvelle » : pour
  // corriger une erreur, on bascule en « annulée » via le menu Statut.
  async function marquerLivree(commande: Commande) {
    setActionError("");
    try {
      await updateStatut.mutateAsync({ id: commande.id, input: { statut: "livree" } });
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  }

  async function handleStatutChange(id: number, statut: StatutCommande) {
    setActionError("");
    try {
      await updateStatut.mutateAsync({ id, input: { statut } });
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-500">
        Chargement des commandes…
      </div>
    );
  }

  return (
    <div>
      {actionError && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {actionError}
        </p>
      )}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-graphite-50 p-4">
          <p className="text-sm text-graphite-dark">Commandes réellement livrées</p>
          <p className="text-2xl font-bold text-primary">{livrees.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-graphite-50 p-4">
          <p className="text-sm text-graphite-dark">Revenu réel (livrées)</p>
          <p className="text-2xl font-bold text-primary">
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
          <Input
            type="date"
            value={dateSpecifique}
            onChange={(e) => {
              setDateSpecifique(e.target.value);
              if (e.target.value) setFiltreDate("toutes");
            }}
            className="w-auto py-1.5 text-xs"
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
            {filtered.map((c, i) => {
              const isUpdating =
                updateStatut.isPending && updateStatut.variables?.id === c.id;
              return (
                <tr
                  key={c.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={c.statut === "livree"}
                      disabled={isUpdating || c.statut !== "nouvelle"}
                      onCheckedChange={() => marquerLivree(c)}
                      title={
                        c.statut === "nouvelle"
                          ? "Marquer comme livré"
                          : "Statut verrouillé — modifiable via le menu Statut"
                      }
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium">{c.clientNom}</td>
                  <td className="px-4 py-3">{c.clientTelephone}</td>
                  <td className="px-4 py-3">{c.produitNom}</td>
                  <td className="px-4 py-3">{c.quantite}</td>
                  <td className="px-4 py-3 font-medium">
                    {(c.prixTotal ?? 0).toLocaleString("fr-FR")} F
                  </td>
                  <td className="px-4 py-3">{c.quartier}</td>
                  <td className="px-4 py-3">
                    <Select
                      value={c.statut}
                      disabled={isUpdating}
                      onValueChange={(v) =>
                        handleStatutChange(c.id, v as StatutCommande)
                      }
                    >
                      <SelectTrigger
                        className={`h-auto w-auto border-0 px-2 py-1 text-xs font-medium shadow-none focus:ring-0 ${STATUT_COLORS[c.statut]}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statutsDisponibles(c.statut).map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUT_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="max-w-[150px] truncate px-4 py-3 text-gray-500">
                    {c.message || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-gray-500">Aucune commande.</p>
        )}
      </div>
    </div>
  );
}
