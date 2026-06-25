"use client";

import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useRouter } from "next/navigation";
import { commandeSchema, type CommandeFormValues } from "@/lib/api/schemas";
import { useCreateCommande } from "@/lib/api/hooks";
import { getApiErrorMessage } from "@/lib/api";
import type { Produit } from "@/lib/api/types";
import { formatPrix } from "@/lib/utils";
import LoadingButton from "@/components/ui/LoadingButton";

export default function CommandeForm({ produit }: { produit: Produit }) {
  const router = useRouter();
  const { mutate: createCommande, isPending } = useCreateCommande();

  const prixFinal = produit.promotion ? produit.promotion.prixPromo : produit.prix;

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<CommandeFormValues>({
    resolver: valibotResolver(commandeSchema),
    mode: "onTouched",
    defaultValues: {
      produitId: produit.id,
      clientNom: "",
      clientTelephone: "",
      quartier: "",
      quantite: 1,
      message: "",
    },
  });

  const quantite = watch("quantite");
  const quantiteValide = Number.isFinite(quantite) && quantite > 0 ? quantite : 1;
  const prixTotal = prixFinal * quantiteValide;

  function onSubmit(values: CommandeFormValues) {
    createCommande(
      {
        ...values,
        message: values.message?.trim() || undefined,
        prixAttendu: prixFinal,
      },
      {
        onSuccess: () => router.push("/confirmation"),
        onError: (err) => setError("root", { message: getApiErrorMessage(err) }),
      }
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <input type="hidden" {...register("produitId", { valueAsNumber: true })} />

      <div className="card mb-6">
        <p className="text-sm text-gray-500">Produit sélectionné</p>
        <p className="text-lg font-semibold">{produit.nom}</p>
        <p className="text-primary font-bold">{formatPrix(prixTotal)}</p>
      </div>

      <div>
        <label htmlFor="clientNom" className="mb-1 block text-sm font-medium">
          Nom complet <span className="text-red-500">*</span>
        </label>
        <input
          id="clientNom"
          {...register("clientNom")}
          className="input-field"
          placeholder="Votre nom complet"
        />
        {errors.clientNom && (
          <p className="mt-1 text-xs text-red-600">{errors.clientNom.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="clientTelephone" className="mb-1 block text-sm font-medium">
          Téléphone <span className="text-red-500">*</span>
        </label>
        <input
          id="clientTelephone"
          type="tel"
          {...register("clientTelephone")}
          className="input-field"
          placeholder="+22890123456"
        />
        {errors.clientTelephone ? (
          <p className="mt-1 text-xs text-red-600">
            {errors.clientTelephone.message}
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
        loading={isPending}
        loadingText="Envoi en cours..."
        className="btn-primary w-full"
      >
        Envoyer ma commande
      </LoadingButton>
    </form>
  );
}
