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

import { useState } from "react";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { Loader2, Plus } from "lucide-react";
import {
  sousCategorieSchema,
  type SousCategorieFormValues,
} from "@/lib/api/schemas";
import {
  useSousCategoriesAdmin,
  useCreateSousCategorie,
  useDeleteSousCategorie,
} from "@/lib/api/hooks/use-sous-categories";
import { useCategoriesAdmin } from "@/lib/api/hooks/use-categories";
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
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─────────────────────────────────────────────────────────────────────────────
// Valeurs par défaut
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_VALUES: SousCategorieFormValues = {
  categorieId: 0,
  nom: "",
  slug: "",
  description: "",
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

// ─────────────────────────────────────────────────────────────────────────────
// Composant
// ─────────────────────────────────────────────────────────────────────────────

export default function SousCategoriesManager() {
  const create = useCreateSousCategorie();
  const deleteSousCategorie = useDeleteSousCategorie();
  const { data: sousCategories, isLoading } = useSousCategoriesAdmin();
  const { data: categories } = useCategoriesAdmin();

  const form = useForm<SousCategorieFormValues>({
    resolver: valibotResolver(sousCategorieSchema),
    mode: "onTouched",
    defaultValues: DEFAULT_VALUES,
  });

  const { isSubmitting, errors } = form.formState;
  const nom = form.watch("nom");
  const [open, setOpen] = useState(false);

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function onSubmit(values: SousCategorieFormValues) {
    try {
      await create.mutateAsync({
        ...values,
        description: values.description || undefined,
      });
      form.reset(DEFAULT_VALUES);
      setOpen(false);
    } catch (err) {
      form.setError("root", { message: getApiErrorMessage(err) });
    }
  }

  async function supprimer(id: number) {
    if (
      !confirm("Supprimer cette sous-catégorie ? Cette action est irréversible.")
    )
      return;
    try {
      await deleteSousCategorie.mutateAsync(id);
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  }

  function nomCategorie(categorieId: number): string {
    return (
      (categories ?? []).find((cat) => cat.id === categorieId)?.nom ?? "—"
    );
  }

  // ── Rendu ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* ── Déclencheur du modal ────────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button type="button" onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" aria-hidden />
          Nouvelle sous-catégorie
        </Button>
      </div>

      {/* ── Formulaire (modal) ──────────────────────────────────────────── */}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) form.reset(DEFAULT_VALUES);
        }}
      >
        <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle sous-catégorie</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
          {/* Catégorie parente */}
          <FormField
            control={form.control}
            name="categorieId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie parente *</FormLabel>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(categories ?? []).map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

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

          {/* Actif */}
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
                    value={Number.isNaN(field.value) ? "" : field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? NaN : e.target.valueAsNumber
                      )
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
              "Créer la sous-catégorie"
            )}
          </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
                  <th className="px-4 py-3 font-medium text-graphite">Nom</th>
                  <th className="px-4 py-3 font-medium text-graphite">Slug</th>
                  <th className="px-4 py-3 font-medium text-graphite">
                    Catégorie parente
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
                {(sousCategories ?? []).map((sousCat, i) => (
                  <tr
                    key={sousCat.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-surface-subtle/50"}
                  >
                    {/* Nom */}
                    <td className="px-4 py-3 font-medium">{sousCat.nom}</td>
                    {/* Slug */}
                    <td className="px-4 py-3 font-mono text-xs text-graphite">
                      {sousCat.slug}
                    </td>
                    {/* Catégorie parente */}
                    <td className="px-4 py-3 text-graphite">
                      {nomCategorie(sousCat.categorieId)}
                    </td>
                    {/* Badge actif */}
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          sousCat.actif
                            ? "bg-green-100 text-green-700"
                            : "bg-surface-subtle text-graphite"
                        }`}
                      >
                        {sousCat.actif ? "Oui" : "Non"}
                      </span>
                    </td>
                    {/* Position */}
                    <td className="px-4 py-3 text-graphite">
                      {sousCat.position}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => supprimer(sousCat.id)}
                        className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(sousCategories ?? []).length === 0 && (
              <p className="p-8 text-center text-graphite">
                Aucune sous-catégorie. Créez-en une avant d&apos;ajouter des
                produits.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
