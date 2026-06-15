"use client";

import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Categorie } from "@/lib/types";
import { categorieSchema, type CategorieFormValues } from "@/lib/schemas";
import LoadingButton from "@/components/ui/LoadingButton";

export default function CategoriesManager({
  categories,
}: {
  categories: Categorie[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CategorieFormValues>({
    resolver: valibotResolver(categorieSchema),
    mode: "onTouched",
    defaultValues: { nom: "" },
  });

  async function onSubmit(values: CategorieFormValues) {
    const { error: insertError } = await supabase
      .from("categories")
      .insert({ nom: values.nom });

    if (insertError) {
      setError("root", { message: insertError.message });
      return;
    }

    reset();
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
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-md space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        noValidate
      >
        <h3 className="font-semibold text-gray-900">Nouvelle catégorie</h3>
        <div>
          <label htmlFor="cat-nom" className="mb-1 block text-sm font-medium">
            Nom *
          </label>
          <input
            id="cat-nom"
            {...register("nom")}
            className="input-field"
            placeholder="Ex: Huiles essentielles"
          />
          {errors.nom && (
            <p className="mt-1 text-xs text-red-600">{errors.nom.message}</p>
          )}
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
