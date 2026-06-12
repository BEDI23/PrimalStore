"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProduitAvecPromo } from "@/lib/types";
import { formatPrix, validatePhoneTogo } from "@/lib/utils";
import LoadingButton from "@/components/ui/LoadingButton";

export default function CommandeForm({ produit }: { produit: ProduitAvecPromo }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quantite, setQuantite] = useState(1);

  const prixTotal = produit.prixFinal * quantite;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const client_nom = (form.get("client_nom") as string).trim();
    const client_telephone = (form.get("client_telephone") as string).trim();
    const quartier = (form.get("quartier") as string).trim();
    const message = (form.get("message") as string).trim();

    if (!client_nom || !quartier) {
      setError("Veuillez remplir tous les champs obligatoires.");
      setLoading(false);
      return;
    }

    if (!validatePhoneTogo(client_telephone)) {
      setError("Numéro invalide. Format attendu : +228XXXXXXXX");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/commandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produit_id: produit.id,
          produit_nom: produit.nom,
          produit_prix: produit.prixFinal,
          client_nom,
          client_telephone,
          quartier,
          quantite,
          prix_total: prixTotal,
          message: message || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la commande");
      }

      router.push("/confirmation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          name="client_nom"
          required
          className="input-field"
          placeholder="Votre nom complet"
        />
      </div>

      <div>
        <label htmlFor="client_telephone" className="mb-1 block text-sm font-medium">
          Téléphone <span className="text-red-500">*</span>
        </label>
        <input
          id="client_telephone"
          name="client_telephone"
          required
          type="tel"
          className="input-field"
          placeholder="+22890123456"
        />
        <p className="mt-1 text-xs text-gray-400">Format : +228XXXXXXXX</p>
      </div>

      <div>
        <label htmlFor="quartier" className="mb-1 block text-sm font-medium">
          Quartier / zone de livraison <span className="text-red-500">*</span>
        </label>
        <input
          id="quartier"
          name="quartier"
          required
          className="input-field"
          placeholder="Ex: Adidogomé, Tokoin..."
        />
      </div>

      <div>
        <label htmlFor="quantite" className="mb-1 block text-sm font-medium">
          Quantité
        </label>
        <input
          id="quantite"
          name="quantite"
          type="number"
          min={1}
          value={quantite}
          onChange={(e) => setQuantite(Math.max(1, parseInt(e.target.value) || 1))}
          className="input-field w-24"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">
          Message (optionnel)
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          className="input-field resize-none"
          placeholder="Instructions de livraison..."
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      <LoadingButton
        loading={loading}
        loadingText="Envoi en cours..."
        className="btn-primary w-full"
      >
        Envoyer ma commande
      </LoadingButton>
    </form>
  );
}
