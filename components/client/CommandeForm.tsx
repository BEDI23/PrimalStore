"use client";

import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useRouter } from "next/navigation";
import { ProduitAvecPromo } from "@/lib/types";
import { formatPrix } from "@/lib/utils";
import { commandeSchema, type CommandeFormValues } from "@/lib/schemas";
import LoadingButton from "@/components/ui/LoadingButton";

export default function CommandeForm({ produit }: { produit: ProduitAvecPromo }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CommandeFormValues>({
    resolver: valibotResolver(commandeSchema),
    mode: "onTouched",
    defaultValues: {
      client_nom: "",
      client_telephone: "",
      quartier: "",
      quantite: 1,
      message: "",
    },
  });

  const quantite = watch("quantite");
  const quantiteValide = Number.isFinite(quantite) && quantite > 0 ? quantite : 1;
  const prixTotal = produit.prixFinal * quantiteValide;

  async function onSubmit(values: CommandeFormValues) {
    try {
      const res = await fetch("/api/commandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produit_id: produit.id,
          produit_nom: produit.nom,
          produit_prix: produit.prixFinal,
          client_nom: values.client_nom,
          client_telephone: values.client_telephone,
          quartier: values.quartier,
          quantite: values.quantite,
          prix_total: produit.prixFinal * values.quantite,
          message: values.message || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la commande");
      }

      router.push("/confirmation");
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Une erreur est survenue",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="card mb-6">
        <p className="text-sm text-gray-500">Produit sélectionné</p>
        <p className="text-lg font-semibold">{produit.nom}</p>
        <p className="text-primary font-bold">{formatPrix(prixTotal)}</p>
      </div>

      <div>
        <label htmlFor="client_nom" className="mb-1 block text-sm font-medium">
          Nom complet <span className="text-red-500">*</span>
        </label>
        <input
          id="client_nom"
          {...register("client_nom")}
          className="input-field"
          placeholder="Votre nom complet"
        />
        {errors.client_nom && (
          <p className="mt-1 text-xs text-red-600">{errors.client_nom.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="client_telephone" className="mb-1 block text-sm font-medium">
          Téléphone <span className="text-red-500">*</span>
        </label>
        <input
          id="client_telephone"
          type="tel"
          {...register("client_telephone")}
          className="input-field"
          placeholder="+22890123456"
        />
        {errors.client_telephone ? (
          <p className="mt-1 text-xs text-red-600">
            {errors.client_telephone.message}
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-400">Format : +228XXXXXXXX</p>
        )}
      </div>

      <div>
        <label htmlFor="quartier" className="mb-1 block text-sm font-medium">
          Quartier / zone de livraison <span className="text-red-500">*</span>
        </label>
        <input
          id="quartier"
          {...register("quartier")}
          className="input-field"
          placeholder="Ex: Adidogomé, Tokoin..."
        />
        {errors.quartier && (
          <p className="mt-1 text-xs text-red-600">{errors.quartier.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="quantite" className="mb-1 block text-sm font-medium">
          Quantité
        </label>
        <input
          id="quantite"
          type="number"
          min={1}
          {...register("quantite", { valueAsNumber: true })}
          className="input-field w-24"
        />
        {errors.quantite && (
          <p className="mt-1 text-xs text-red-600">{errors.quantite.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">
          Message (optionnel)
        </label>
        <textarea
          id="message"
          rows={3}
          {...register("message")}
          className="input-field resize-none"
          placeholder="Instructions de livraison..."
        />
      </div>

      {errors.root && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {errors.root.message}
        </p>
      )}

      <LoadingButton
        loading={isSubmitting}
        loadingText="Envoi en cours..."
        className="btn-primary w-full"
      >
        Envoyer ma commande
      </LoadingButton>
    </form>
  );
}
