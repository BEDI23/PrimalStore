"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import Image from "next/image";
import { categorieSchema, type CategorieFormValues } from "@/lib/api/schemas";
import { ICON_NAMES } from "@/lib/api/types";
import {
  useCategoriesAdmin,
  useCreateCategorie,
  useDeleteCategorie,
} from "@/lib/api/hooks/use-categories";
import { useUpload } from "@/lib/api/hooks/use-uploads";
import { getApiErrorMessage } from "@/lib/api/http";
import LoadingButton from "@/components/ui/LoadingButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// ─────────────────────────────────────────────────────────────────────────────
// Valeurs par défaut
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_VALUES: CategorieFormValues = {
  nom: "",
  slug: "",
  description: "",
  theme: {
    primary: "#ED4C20",
    primaryHover: "#C53A14",
    onPrimary: "#FFFFFF",
    secondary: "#FFA500",
    accent: "#00BFFF",
  },
  iconName: "heart",
  coverImageUrl: "",
  isAdult: false,
  position: 0,
  actif: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const THEME_FIELDS = [
  { key: "primary" as const, label: "Primaire" },
  { key: "primaryHover" as const, label: "Primaire (survol)" },
  { key: "onPrimary" as const, label: "Sur fond primaire" },
  { key: "secondary" as const, label: "Secondaire" },
  { key: "accent" as const, label: "Accent" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Composant
// ─────────────────────────────────────────────────────────────────────────────

export default function CategoriesManager() {
  const create = useCreateCategorie();
  const deleteCategorie = useDeleteCategorie();
  const upload = useUpload();
  const { data: categories, isLoading } = useCategoriesAdmin();

  const coverRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CategorieFormValues>({
    resolver: valibotResolver(categorieSchema),
    mode: "onTouched",
    defaultValues: DEFAULT_VALUES,
  });

  const actif = watch("actif");
  const isAdult = watch("isAdult");
  const coverImageUrl = watch("coverImageUrl");
  const nom = watch("nom");
  const theme = watch("theme");

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await upload.mutateAsync({ bucket: "categories", file });
      setValue("coverImageUrl", res.publicUrl, { shouldValidate: true });
    } catch (err) {
      setError("root", { message: getApiErrorMessage(err) });
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: CategorieFormValues) {
    try {
      await create.mutateAsync({
        ...values,
        description: values.description || undefined,
      });
      reset(DEFAULT_VALUES);
      if (coverRef.current) coverRef.current.value = "";
    } catch (err) {
      setError("root", { message: getApiErrorMessage(err) });
    }
  }

  async function supprimer(id: number) {
    if (!confirm("Supprimer cette catégorie ? Cette action est irréversible."))
      return;
    try {
      await deleteCategorie.mutateAsync(id);
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  }

  // ── Rendu ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* ── Formulaire ──────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-2xl space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        noValidate
      >
        <h3 className="font-semibold text-gray-900">Nouvelle catégorie</h3>

        {/* Nom */}
        <div>
          <label className="mb-1 block text-sm font-medium">Nom *</label>
          <input
            {...register("nom")}
            className="input-field"
            placeholder="Ex: Bien-être"
          />
          {errors.nom && (
            <p className="mt-1 text-xs text-red-600">{errors.nom.message}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label className="mb-1 block text-sm font-medium">Slug *</label>
          <div className="flex gap-2">
            <input
              {...register("slug")}
              className="input-field flex-1"
              placeholder="bien-etre"
            />
            <button
              type="button"
              onClick={() =>
                setValue("slug", slugify(nom), { shouldValidate: true })
              }
              className="btn-secondary whitespace-nowrap px-3 text-xs"
            >
              Générer
            </button>
          </div>
          {errors.slug && (
            <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            {...register("description")}
            rows={3}
            className="input-field resize-none"
            placeholder="Description courte (optionnel, max 280 car.)"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Thème */}
        <fieldset>
          <legend className="mb-2 text-sm font-medium">
            Thème de couleurs *
          </legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {THEME_FIELDS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="color"
                  {...register(`theme.${key}`)}
                  className="h-8 w-10 cursor-pointer rounded border border-gray-300"
                />
                <code className="w-20 text-xs text-gray-600">
                  {theme?.[key] ?? ""}
                </code>
                <span className="text-xs text-gray-500">{label}</span>
                {errors.theme?.[key] && (
                  <p className="text-xs text-red-600">
                    {errors.theme[key]?.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </fieldset>

        {/* Icône */}
        <div>
          <label className="mb-1 block text-sm font-medium">Icône *</label>
          <select {...register("iconName")} className="input-field w-48">
            {ICON_NAMES.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
          {errors.iconName && (
            <p className="mt-1 text-xs text-red-600">
              {errors.iconName.message}
            </p>
          )}
        </div>

        {/* Image de couverture */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Image de couverture *
          </label>
          {coverImageUrl && (
            <div className="relative mb-2 h-32 w-32 overflow-hidden rounded-lg border border-gray-200">
              <Image
                src={coverImageUrl}
                alt="Aperçu couverture"
                fill
                className="object-cover"
              />
            </div>
          )}
          {uploading && (
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <LoadingSpinner size="sm" />
              Upload en cours…
            </div>
          )}
          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={handleCoverChange}
            disabled={uploading}
          />
          {/* Champ caché pour transporter la valeur dans react-hook-form */}
          <input type="hidden" {...register("coverImageUrl")} />
          {errors.coverImageUrl && (
            <p className="mt-1 text-xs text-red-600">
              {errors.coverImageUrl.message}
            </p>
          )}
        </div>

        {/* Toggles : isAdult + actif */}
        <div className="flex flex-wrap gap-6">
          {/* isAdult */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Contenu adulte</label>
            <button
              type="button"
              onClick={() =>
                setValue("isAdult", !isAdult, { shouldDirty: true })
              }
              className={`relative h-6 w-11 rounded-full transition ${
                isAdult ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition ${
                  isAdult ? "translate-x-5" : ""
                }`}
              />
            </button>
            <span className="text-sm text-gray-500">
              {isAdult ? "Oui" : "Non"}
            </span>
          </div>

          {/* actif */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Actif</label>
            <button
              type="button"
              onClick={() =>
                setValue("actif", !actif, { shouldDirty: true })
              }
              className={`relative h-6 w-11 rounded-full transition ${
                actif ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition ${
                  actif ? "translate-x-5" : ""
                }`}
              />
            </button>
            <span className="text-sm text-gray-500">
              {actif ? "Oui" : "Non"}
            </span>
          </div>
        </div>

        {/* Position */}
        <div>
          <label className="mb-1 block text-sm font-medium">Position</label>
          <input
            type="number"
            min={0}
            {...register("position", { valueAsNumber: true })}
            className="input-field w-28"
          />
          {errors.position && (
            <p className="mt-1 text-xs text-red-600">
              {errors.position.message}
            </p>
          )}
        </div>

        {/* Erreur globale */}
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

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Couleur
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Icône
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">Nom</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Slug</th>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Adulte
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Actif
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">Pos.</th>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {(categories ?? []).map((cat, i) => (
                  <tr
                    key={cat.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                  >
                    {/* Pastille couleur primaire */}
                    <td className="px-4 py-3">
                      <span
                        className="inline-block h-5 w-5 rounded-full border border-gray-200"
                        style={{ backgroundColor: cat.theme.primary }}
                        title={cat.theme.primary}
                      />
                    </td>
                    {/* Icône */}
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {cat.iconName}
                    </td>
                    {/* Nom */}
                    <td className="px-4 py-3 font-medium">{cat.nom}</td>
                    {/* Slug */}
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {cat.slug}
                    </td>
                    {/* Badge isAdult */}
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          cat.isAdult
                            ? "bg-rose-100 text-rose-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {cat.isAdult ? "18+" : "Non"}
                      </span>
                    </td>
                    {/* Badge actif */}
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          cat.actif
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {cat.actif ? "Oui" : "Non"}
                      </span>
                    </td>
                    {/* Position */}
                    <td className="px-4 py-3 text-gray-500">{cat.position}</td>
                    {/* Actions */}
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
            {(categories ?? []).length === 0 && (
              <p className="p-8 text-center text-gray-500">
                Aucune catégorie. Créez-en une avant d&apos;ajouter des
                produits.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
