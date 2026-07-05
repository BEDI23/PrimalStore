"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { Loader2 } from "lucide-react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const form = useForm<PromotionFormValues>({
    resolver: valibotResolver(promotionSchema),
    mode: "onTouched",
    defaultValues: { produitId: 0, prixPromo: 0, dateFin: "", actif: true },
  });

  const {
    formState: { errors, isSubmitting },
  } = form;

  // Pré-remplit le champ produit du formulaire quand la sélection en haut change
  useEffect(() => {
    if (produitId !== "") {
      form.setValue("produitId", produitId, { shouldValidate: false });
    }
  }, [produitId, form]);

  async function onSubmit(values: PromotionFormValues) {
    try {
      const isoDate = new Date(values.dateFin).toISOString();
      await create.mutateAsync({
        produitId: values.produitId,
        prixPromo: values.prixPromo,
        dateFin: isoDate,
        actif: values.actif,
      });
      form.reset({
        produitId: typeof produitId === "number" ? produitId : 0,
        prixPromo: 0,
        dateFin: "",
        actif: true,
      });
    } catch (error) {
      form.setError("root", { message: getApiErrorMessage(error) });
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
      <div className="max-w-lg space-y-1">
        <Label htmlFor="produit-filter">Produit à consulter</Label>
        <Select
          value={produitId === "" ? "all" : String(produitId)}
          onValueChange={(v) =>
            setProduitId(v === "all" ? "" : Number(v))
          }
        >
          <SelectTrigger id="produit-filter">
            <SelectValue placeholder="— Choisir un produit —" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">— Choisir un produit —</SelectItem>
            {produits.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.nom} — {formatPrix(p.prix)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {actionError && (
        <Alert variant="destructive">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {/* Tableau des promotions */}
      {!produitId ? (
        <p className="rounded-xl border border-gray-100 bg-white p-8 text-center text-graphite shadow-sm">
          Sélectionnez un produit pour voir ses promotions.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-surface-subtle">
              <tr>
                <th className="px-4 py-3 font-medium text-graphite">Prix promo</th>
                <th className="px-4 py-3 font-medium text-graphite">Fin</th>
                <th className="px-4 py-3 font-medium text-graphite">Statut</th>
                <th className="px-4 py-3 font-medium text-graphite">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-graphite-light">
                    Chargement…
                  </td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-graphite">
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
                      className={i % 2 === 0 ? "bg-white" : "bg-surface-subtle/50"}
                    >
                      <td className="px-4 py-3 font-medium text-red-600">
                        {formatPrix(promo.prixPromo)}
                      </td>
                      <td className="px-4 py-3 text-xs text-graphite">
                        {new Date(promo.dateFin).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-surface-subtle text-graphite"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleActif(promo.id, promo.actif)}
                            className="rounded-lg bg-surface-subtle px-3 py-1 text-xs font-medium text-graphite hover:bg-gray-200"
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
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-lg space-y-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          noValidate
        >
          <h3 className="font-display font-semibold text-ink">Nouvelle promotion</h3>

          {/* Produit */}
          <FormField
            control={form.control}
            name="produitId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Produit</FormLabel>
                <Select
                  value={String(field.value || 0)}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un produit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">Sélectionner un produit</SelectItem>
                    {produits.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nom} — {formatPrix(p.prix)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Prix promotionnel */}
          <FormField
            control={form.control}
            name="prixPromo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix promotionnel (FCFA)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    className="w-40"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.valueAsNumber || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date de fin */}
          <FormField
            control={form.control}
            name="dateFin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de fin</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actif */}
          <FormField
            control={form.control}
            name="actif"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      id="actif"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <Label htmlFor="actif" className="text-sm font-normal">
                    Activer immédiatement
                  </Label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {errors.root?.message ? (
            <Alert variant="destructive">
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Création...
              </>
            ) : (
              "Créer la promotion"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
