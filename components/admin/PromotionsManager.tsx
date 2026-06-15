"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Produit, Promotion } from "@/lib/types";
import { formatPrix, isPromotionActive } from "@/lib/utils";
import LoadingButton from "@/components/ui/LoadingButton";

export default function PromotionsManager({
  promotions,
  produits,
}: {
  promotions: Promotion[];
  produits: Produit[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const produit_id = form.get("produit_id") as string;
    const prix_promo = parseInt(form.get("prix_promo") as string);
    const date_fin = form.get("date_fin") as string;
    const actif = form.get("actif") === "on";

    if (!produit_id || isNaN(prix_promo) || !date_fin) {
      setError("Veuillez remplir tous les champs.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("promotions").insert({
      produit_id,
      prix_promo,
      date_fin: new Date(date_fin).toISOString(),
      actif,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    (e.target as HTMLFormElement).reset();
    setLoading(false);
    router.refresh();
  }

  async function toggleActif(id: string, actif: boolean | null) {
    setError("");
    const { error: updateError } = await supabase
      .from("promotions")
      .update({ actif: !actif })
      .eq("id", id);
    if (updateError) {
      setError("Échec de la mise à jour de la promotion. Réessayez.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="max-w-lg space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <h3 className="font-semibold text-gray-900">Nouvelle promotion</h3>

        <div>
          <label className="mb-1 block text-sm font-medium">Produit</label>
          <select name="produit_id" required className="input-field">
            <option value="">Sélectionner un produit</option>
            {produits.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom} — {formatPrix(p.prix)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Prix promotionnel (FCFA)
          </label>
          <input
            name="prix_promo"
            type="number"
            min={0}
            required
            className="input-field w-40"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Date de fin</label>
          <input name="date_fin" type="datetime-local" required className="input-field" />
        </div>

        <div className="flex items-center gap-2">
          <input name="actif" type="checkbox" defaultChecked id="actif" />
          <label htmlFor="actif" className="text-sm">Activer immédiatement</label>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}

        <LoadingButton
          loading={loading}
          loadingText="Création..."
          className="btn-primary"
        >
          Créer la promotion
        </LoadingButton>
      </form>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Produit</th>
              <th className="px-4 py-3 font-medium text-gray-600">Prix promo</th>
              <th className="px-4 py-3 font-medium text-gray-600">Fin</th>
              <th className="px-4 py-3 font-medium text-gray-600">Statut</th>
              <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promo, i) => {
              const produit = produits.find((p) => p.id === promo.produit_id);
              const active = isPromotionActive(promo);
              return (
                <tr
                  key={promo.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="px-4 py-3">{produit?.nom ?? "—"}</td>
                  <td className="px-4 py-3 font-medium text-red-600">
                    {formatPrix(promo.prix_promo)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(promo.date_fin).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        active && promo.actif
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {active && promo.actif ? "Active" : "Expirée / Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActif(promo.id, promo.actif)}
                      className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                    >
                      {promo.actif ? "Désactiver" : "Activer"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {promotions.length === 0 && (
          <p className="p-8 text-center text-gray-500">Aucune promotion.</p>
        )}
      </div>
    </div>
  );
}
