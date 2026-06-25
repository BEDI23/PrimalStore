"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useProduitsAdmin } from "@/lib/api/hooks/use-produits";
import {
  usePromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
} from "@/lib/api/hooks/use-promotions";
import { promotionSchema, type PromotionFormValues } from "@/lib/api/schemas";
import { formatPrix } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api/http";
import LoadingButton from "@/components/ui/LoadingButton";

export default function PromotionsManager() {
  const [produitId, setProduitId] = useState<number | "">("");
  const [actionError, setActionError] = useState("");

  // Liste des produits pour les selects
  const { data: produitsData } = useProduitsAdmin();
  const produits = produitsData?.data ?? [];

  // Promotions du produit sélectionné
  const { data: promotions = [], isLoading } = usePromotions(
    produitId || 0,
    !!produitId
  );

  // Mutations
  const create = useCreatePromotion();
  const update = useUpdatePromotion();
  const remove = useDeletePromotion();

  // Formulaire de création
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PromotionFormValues>({
    resolver: valibotResolver(promotionSchema),
    mode: "onTouched",
    defaultValues: { produitId: 0, prixPromo: 0, dateFin: "", actif: true },
  });

  // Pré-remplit le champ produit du formulaire quand la sélection en haut change
  useEffect(() => {
    if (produitId !== "") {
      setValue("produitId", produitId, { shouldValidate: false });
    }
  }, [produitId, setValue]);

  async function onSubmit(values: PromotionFormValues) {
    try {
      const isoDate = new Date(values.dateFin).toISOString();
      await create.mutateAsync({
        produitId: values.produitId,
        prixPromo: values.prixPromo,
        dateFin: isoDate,
        actif: values.actif,
      });
      reset({
        produitId: typeof produitId === "number" ? produitId : 0,
        prixPromo: 0,
        dateFin: "",
        actif: true,
      });
    } catch (error) {
      setError("root", { message: getApiErrorMessage(error) });
    }
  }

  async function toggleActif(id: number, currentActif: boolean) {
    setActionError("");
    try {
      await update.mutateAsync({ id, input: { actif: !currentActif } });
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette promotion ?")) return;
    setActionError("");
    try {
      await remove.mutateAsync(id);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  }

  return (
    <div className="space-y-8">
      {/* Sélecteur de produit */}
      <div className="max-w-lg">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Produit à consulter
        </label>
        <select
          value={produitId}
          onChange={(e) =>
            setProduitId(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="input-field"
        >
          <option value="">— Choisir un produit —</option>
          {produits.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom} — {formatPrix(p.prix)}
            </option>
          ))}
        </select>
      </div>

      {actionError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {actionError}
        </p>
      )}

      {/* Tableau des promotions */}
      {!produitId ? (
        <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          Sélectionnez un produit pour voir ses promotions.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Prix promo</th>
                <th className="px-4 py-3 font-medium text-gray-600">Fin</th>
                <th className="px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    Chargement…
                  </td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Aucune promotion pour ce produit.
                  </td>
                </tr>
              ) : (
                promotions.map((promo, i) => {
                  const isActive =
                    promo.actif && new Date(promo.dateFin) > new Date();
                  return (
                    <tr
                      key={promo.id}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                    >
                      <td className="px-4 py-3 font-medium text-red-600">
                        {formatPrix(promo.prixPromo)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(promo.dateFin).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleActif(promo.id, promo.actif)}
                            className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                          >
                            {promo.actif ? "Désactiver" : "Activer"}
                          </button>
                          <button
                            onClick={() => handleDelete(promo.id)}
                            className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Formulaire de création */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-lg space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        noValidate
      >
        <h3 className="font-semibold text-gray-900">Nouvelle promotion</h3>

        <div>
          <label className="mb-1 block text-sm font-medium">Produit</label>
          <select
            {...register("produitId", { valueAsNumber: true })}
            className="input-field"
          >
            <option value={0}>Sélectionner un produit</option>
            {produits.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom} — {formatPrix(p.prix)}
              </option>
            ))}
          </select>
          {errors.produitId && (
            <p className="mt-1 text-xs text-red-600">{errors.produitId.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Prix promotionnel (FCFA)
          </label>
          <input
            type="number"
            min={1}
            {...register("prixPromo", { valueAsNumber: true })}
            className="input-field w-40"
          />
          {errors.prixPromo && (
            <p className="mt-1 text-xs text-red-600">{errors.prixPromo.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Date de fin</label>
          <input
            type="datetime-local"
            {...register("dateFin")}
            className="input-field"
          />
          {errors.dateFin && (
            <p className="mt-1 text-xs text-red-600">{errors.dateFin.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="actif" {...register("actif")} />
          <label htmlFor="actif" className="text-sm">
            Activer immédiatement
          </label>
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
    </div>
  );
}
