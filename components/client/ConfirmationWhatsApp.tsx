"use client";

import { useEffect, useState } from "react";
import { LAST_COMMANDE_STORAGE_KEY } from "@/lib/constants";
import { formatPrix } from "@/lib/utils";
import type { Commande } from "@/lib/api/types";

export default function ConfirmationWhatsApp() {
  const [commande, setCommande] = useState<Commande | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_COMMANDE_STORAGE_KEY);
      if (raw) setCommande(JSON.parse(raw) as Commande);
    } catch {
      // Storage indisponible / JSON corrompu : on n'affiche simplement rien.
    }
  }, []);

  if (!commande) return null;


  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-4 text-left shadow-sm">
      <p className="text-sm font-semibold text-ink">Récap de votre commande</p>
      <dl className="mt-2 space-y-1 text-sm text-graphite">
        <div className="flex justify-between gap-4">
          <dt>Produit</dt>
          <dd className="text-right text-ink">{commande.produitNom}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Quantité</dt>
          <dd className="text-right text-ink">{commande.quantite}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Total</dt>
          <dd className="text-right font-semibold text-ink">
            {formatPrix(commande.prixTotal)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
