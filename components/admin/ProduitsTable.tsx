"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProduitsAdmin, useUpdateProduit } from "@/lib/api/hooks";
import type { Produit } from "@/lib/api/types";
import { formatPrix } from "@/lib/utils";
import { TableSkeleton } from "@/components/ui/Skeleton";

export default function ProduitsTable() {
  const { data, isLoading, isError } = useProduitsAdmin();
  const produits: Produit[] = data?.data ?? [];
  const { mutate: updateProduit, isPending } = useUpdateProduit();
  const [error, setError] = useState("");

  function toggleActif(id: number, actif: boolean) {
    setError("");
    updateProduit(
      { id, input: { actif: !actif } },
      {
        onError: () => {
          setError("Échec de la mise à jour du produit. Réessayez.");
        },
      }
    );
  }

  if (isLoading) {
    return <TableSkeleton rows={5} cols={7} />;
  }

  if (isError) {
    return (
      <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
        Erreur lors du chargement des produits. Veuillez réessayer.
      </p>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-surface-subtle">
            <tr>
              <th className="px-4 py-3 font-medium text-graphite">Image</th>
              <th className="px-4 py-3 font-medium text-graphite">Nom</th>
              <th className="px-4 py-3 font-medium text-graphite">Catégorie</th>
              <th className="px-4 py-3 font-medium text-graphite">Prix</th>
              <th className="px-4 py-3 font-medium text-graphite">Badge</th>
              <th className="px-4 py-3 font-medium text-graphite">Statut</th>
              <th className="px-4 py-3 font-medium text-graphite">Actions</th>
            </tr>
          </thead>
          <tbody>
            {produits.map((p, i) => (
              <tr
                key={p.id}
                className={i % 2 === 0 ? "bg-white" : "bg-surface-subtle/50"}
              >
                <td className="px-4 py-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-surface-subtle">
                    <Image
                      src={p.imageUrl || "/images/placeholder-produit.svg"}
                      alt={p.nom}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{p.nom}</td>
                <td className="px-4 py-3 text-graphite">{"—"}</td>
                <td className="px-4 py-3">{formatPrix(p.prix)}</td>
                <td className="px-4 py-3">{p.badge ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.actif
                        ? "bg-green-100 text-green-800"
                        : "bg-surface-subtle text-graphite"
                    }`}
                  >
                    {p.actif ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/produits/${p.id}/modifier`}
                      className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => toggleActif(p.id, p.actif)}
                      disabled={isPending}
                      className="rounded-lg bg-surface-subtle px-3 py-1 text-xs font-medium text-graphite hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {p.actif ? "Désactiver" : "Activer"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {produits.length === 0 && (
          <p className="p-8 text-center text-graphite">Aucun produit.</p>
        )}
      </div>
    </div>
  );
}
