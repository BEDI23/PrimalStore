"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Categorie } from "@/lib/types";
import LoadingButton from "@/components/ui/LoadingButton";

export default function CategoriesManager({
  categories,
}: {
  categories: Categorie[];
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
    const nom = (form.get("nom") as string).trim();

    if (!nom) {
      setError("Le nom est obligatoire.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("categories")
      .insert({ nom });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    (e.target as HTMLFormElement).reset();
    setLoading(false);
    router.refresh();
  }

  async function supprimer(id: string) {
    if (!confirm("Supprimer cette catégorie ?")) return;
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (deleteError) {
      alert(deleteError.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="max-w-md space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <h3 className="font-semibold text-gray-900">Nouvelle catégorie</h3>
        <div>
          <label className="mb-1 block text-sm font-medium">Nom *</label>
          <input
            name="nom"
            required
            className="input-field"
            placeholder="Ex: Huiles essentielles"
          />
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}
        <LoadingButton
          loading={loading}
          loadingText="Création..."
          className="btn-primary"
        >
          Créer la catégorie
        </LoadingButton>
      </form>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Nom</th>
              <th className="px-4 py-3 font-medium text-gray-600">Créée le</th>
              <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr
                key={cat.id}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
              >
                <td className="px-4 py-3 font-medium">{cat.nom}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(cat.created_at).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => supprimer(cat.id)}
                    className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <p className="p-8 text-center text-gray-500">
            Aucune catégorie. Créez-en une avant d&apos;ajouter des produits.
          </p>
        )}
      </div>
    </div>
  );
}
