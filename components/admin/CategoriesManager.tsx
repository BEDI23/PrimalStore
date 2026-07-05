"use client";

// Polyfill ResizeObserver for jsdom (vitest/testing-library environment).
// Browsers already provide this API; this no-ops when it already exists.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { Loader2 } from "lucide-react";
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
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const form = useForm<CategorieFormValues>({
    resolver: valibotResolver(categorieSchema),
    mode: "onTouched",
    defaultValues: DEFAULT_VALUES,
  });

  const { isSubmitting, errors } = form.formState;
  const nom = form.watch("nom");
  const coverImageUrl = form.watch("coverImageUrl");
  const theme = form.watch("theme");

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await upload.mutateAsync({ bucket: "categories", file });
      form.setValue("coverImageUrl", res.publicUrl, { shouldValidate: true });
    } catch (err) {
      form.setError("root", { message: getApiErrorMessage(err) });
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
      form.reset(DEFAULT_VALUES);
      if (coverRef.current) coverRef.current.value = "";
    } catch (err) {
      form.setError("root", { message: getApiErrorMessage(err) });
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
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-2xl space-y-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          noValidate
        >
          <h3 className="font-display font-semibold text-ink">Nouvelle catégorie</h3>

          {/* Nom */}
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Bien-être" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Slug */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug *</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input placeholder="bien-etre" className="flex-1" {...field} />
                  </FormControl>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      form.setValue("slug", slugify(nom), {
                        shouldValidate: true,
                      })
                    }
                  >
                    Générer
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Description courte (optionnel, max 280 car.)"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Thème */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium">
              Thème de couleurs *
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {THEME_FIELDS.map(({ key, label }) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={`theme.${key}`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Input
                          type="color"
                          className="h-9 w-12 cursor-pointer p-1"
                          {...field}
                        />
                      </FormControl>
                      <code className="w-20 text-xs text-graphite">
                        {theme?.[key] ?? ""}
                      </code>
                      <span className="text-xs text-graphite">{label}</span>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </fieldset>

          {/* Icône */}
          <FormField
            control={form.control}
            name="iconName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icône *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Choisir une icône" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ICON_NAMES.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image de couverture */}
          <FormField
            control={form.control}
            name="coverImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image de couverture *</FormLabel>
                {coverImageUrl && (
                  <div className="relative mb-2 h-32 w-32 overflow-hidden rounded-lg border border-gray-100">
                    <Image
                      src={coverImageUrl}
                      alt="Aperçu couverture"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {uploading && (
                  <div className="mb-2 flex items-center gap-2 text-sm text-graphite">
                    <LoadingSpinner size="sm" />
                    Upload en cours…
                  </div>
                )}
                <Input
                  ref={coverRef}
                  type="file"
                  accept="image/*"
                  className="text-sm"
                  onChange={handleCoverChange}
                  disabled={uploading}
                />
                {/* Champ caché pour transporter la valeur dans react-hook-form */}
                <input type="hidden" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Toggles : isAdult + actif */}
          <div className="flex flex-wrap gap-6">
            {/* isAdult */}
            <FormField
              control={form.control}
              name="isAdult"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0">
                  <FormLabel>Contenu adulte</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <span className="text-sm text-graphite">
                    {field.value ? "Oui" : "Non"}
                  </span>
                </FormItem>
              )}
            />

            {/* actif */}
            <FormField
              control={form.control}
              name="actif"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0">
                  <FormLabel>Actif</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <span className="text-sm text-graphite">
                    {field.value ? "Oui" : "Non"}
                  </span>
                </FormItem>
              )}
            />
          </div>

          {/* Position */}
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    className="w-28"
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

          {/* Erreur globale */}
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
              "Créer la catégorie"
            )}
          </Button>
        </form>
      </Form>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-surface-subtle">
                <tr>
                  <th className="px-4 py-3 font-medium text-graphite">
                    Couleur
                  </th>
                  <th className="px-4 py-3 font-medium text-graphite">
                    Icône
                  </th>
                  <th className="px-4 py-3 font-medium text-graphite">Nom</th>
                  <th className="px-4 py-3 font-medium text-graphite">Slug</th>
                  <th className="px-4 py-3 font-medium text-graphite">
                    Adulte
                  </th>
                  <th className="px-4 py-3 font-medium text-graphite">
                    Actif
                  </th>
                  <th className="px-4 py-3 font-medium text-graphite">Pos.</th>
                  <th className="px-4 py-3 font-medium text-graphite">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {(categories ?? []).map((cat, i) => (
                  <tr
                    key={cat.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-surface-subtle/50"}
                  >
                    {/* Pastille couleur primaire */}
                    <td className="px-4 py-3">
                      <span
                        className="inline-block h-5 w-5 rounded-full border border-gray-100"
                        style={{ backgroundColor: cat.theme.primary }}
                        title={cat.theme.primary}
                      />
                    </td>
                    {/* Icône */}
                    <td className="px-4 py-3 font-mono text-xs text-graphite">
                      {cat.iconName}
                    </td>
                    {/* Nom */}
                    <td className="px-4 py-3 font-medium">{cat.nom}</td>
                    {/* Slug */}
                    <td className="px-4 py-3 font-mono text-xs text-graphite">
                      {cat.slug}
                    </td>
                    {/* Badge isAdult */}
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          cat.isAdult
                            ? "bg-rose-100 text-rose-700"
                            : "bg-surface-subtle text-graphite"
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
                            : "bg-surface-subtle text-graphite"
                        }`}
                      >
                        {cat.actif ? "Oui" : "Non"}
                      </span>
                    </td>
                    {/* Position */}
                    <td className="px-4 py-3 text-graphite">{cat.position}</td>
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
              <p className="p-8 text-center text-graphite">
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
