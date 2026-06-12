"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Produit } from "@/lib/types";
import { formatPrix } from "@/lib/utils";

export default function ProduitsTable({ produits }: { produits: Produit[] }) {
  const router = useRouter();
  const supabase = createClient();

  async function toggleActif(id: string, actif: boolean) {
    await supabase.from("produits").update({ actif: !actif }).eq("id", id);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-600">Image</th>
            <th className="px-4 py-3 font-medium text-gray-600">Nom</th>
            <th className="px-4 py-3 font-medium text-gray-600">Catégorie</th>
            <th className="px-4 py-3 font-medium text-gray-600">Prix</th>
            <th className="px-4 py-3 font-medium text-gray-600">Badge</th>
            <th className="px-4 py-3 font-medium text-gray-600">Statut</th>
            <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {produits.map((p, i) => (
            <tr
              key={p.id}
              className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
            >
              <td className="px-4 py-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                  {p.image_url ? (
                    <Image src={p.image_url} alt={p.nom} fill className="object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-lg">🌿</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 font-medium">{p.nom}</td>
              <td className="px-4 py-3 text-gray-500">
                {p.categories?.nom ?? "—"}
              </td>
              <td className="px-4 py-3">{formatPrix(p.prix)}</td>
              <td className="px-4 py-3">{p.badge || "—"}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    p.actif
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
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
                    className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
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
        <p className="p-8 text-center text-gray-500">Aucun produit.</p>
      )}
    </div>
  );
}
