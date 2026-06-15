"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Produit, Promotion } from "@/lib/types";
import { formatPrix, isPromotionActive } from "@/lib/utils";
import { promotionSchema, type PromotionFormValues } from "@/lib/schemas";
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
  const [actionError, setActionError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PromotionFormValues>({
    resolver: valibotResolver(promotionSchema),
    mode: "onTouched",
    defaultValues: {
      produit_id: "",
      prix_promo: 0,
      date_fin: "",
      actif: true,
    },
  });

  async function onSubmit(values: PromotionFormValues) {
    const { error: insertError } = await supabase.from("promotions").insert({
      produit_id: values.produit_id,
      prix_promo: values.prix_promo,
      date_fin: new Date(values.date_fin).toISOString(),
      actif: values.actif,
    });

    if (insertError) {
      setError("root", { message: insertError.message });
      return;
    }

    reset();
    router.refresh();
  }

  async function toggleActif(id: string, actif: boolean | null) {
    setActionError("");
    const { error: updateError } = await supabase
      .from("promotions")
      .update({ actif: !actif })
      .eq("id", id);
    if (updateError) {
      setActionError("Échec de la mise à jour de la promotion. Réessayez.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-lg space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        noValidate
      >
        <h3 className="font-semibold text-gray-900">Nouvelle promotion</h3>

        <div>
          <label className="mb-1 block text-sm font-medium">Produit</label>
          <select {...register("produit_id")} className="input-field">
            <option value="">Sélectionner un produit</option>
            {produits.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom} — {formatPrix(p.prix)}
              </option>
            ))}
          </select>
          {errors.produit_id && (
            <p className="mt-1 text-xs text-red-600">{errors.produit_id.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Prix promotionnel (FCFA)
          </label>
          <input
            type="number"
            min={0}
            {...register("prix_promo", { valueAsNumber: true })}
            className="input-field w-40"
          />
          {errors.prix_promo && (
            <p className="mt-1 text-xs text-red-600">{errors.prix_promo.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Date de fin</label>
          <input
            type="datetime-local"
            {...register("date_fin")}
            className="input-field"
          />
          {errors.date_fin && (
            <p className="mt-1 text-xs text-red-600">{errors.date_fin.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="actif" {...register("actif")} />
          <label htmlFor="actif" className="text-sm">Activer immédiatement</label>
        </div>

        {errors.root && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {errors.root.message}
          </p>
        )}

        <LoadingButton
          loading={isSubmitting}
          loadingText="Création..."
          className="btn-primary"
        >
          Créer la promotion
        </LoadingButton>
      </form>

      {actionError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {actionError}
        </p>
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
