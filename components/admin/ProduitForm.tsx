"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { produitSchema, type ProduitFormValues } from "@/lib/api/schemas";
import { BADGE_OPTIONS } from "@/lib/constants";
import { useCategoriesAdmin } from "@/lib/api/hooks/use-categories";
import {
  useSousCategoriesAdmin,
  useSousCategorieAdmin,
} from "@/lib/api/hooks/use-sous-categories";
import {
  useProduitAdmin,
  useCreateProduit,
  useUpdateProduit,
} from "@/lib/api/hooks/use-produits";
import ProduitMediaManager from "@/components/admin/ProduitMediaManager";
import { galleryOf, toMediaInputs } from "@/lib/media";
import { getApiErrorMessage } from "@/lib/api/http";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProduitFormProps {
  produitId?: number;
}

export default function ProduitForm({ produitId }: ProduitFormProps) {
  const router = useRouter();
  const isEdit = !!produitId;

  // Vrai tant qu'un média est en cours d'envoi : on bloque l'enregistrement pour ne
  // jamais sauvegarder une galerie incomplète.
  const [mediaBusy, setMediaBusy] = useState(false);
  const [selectedCategorieId, setSelectedCategorieId] = useState<number | "">("");

  // ── Data ───────────────────────────────────────────────────────────────────

  const { data: categories = [], isLoading: categoriesLoading } = useCategoriesAdmin();
  // Dropdown : sous-catégories filtrées par la catégorie sélectionnée (liste vide tant qu'aucune catégorie choisie).
  const { data: sousCategories = [] } = useSousCategoriesAdmin(
    selectedCategorieId !== "" ? { categorieId: selectedCategorieId } : undefined
  );
  const { data: produit } = useProduitAdmin(produitId ?? 0, isEdit);
  // Fetch unitaire de la sous-catégorie du produit édité pour dériver la catégorie parente.
  const { data: editSousCat } = useSousCategorieAdmin(
    produit?.sousCategorieId ?? 0,
    isEdit && !!produit?.sousCategorieId
  );

  // ── Mutations ──────────────────────────────────────────────────────────────

  const create = useCreateProduit();
  const update = useUpdateProduit();

  // ── Form ───────────────────────────────────────────────────────────────────

  const form = useForm<ProduitFormValues>({
    resolver: valibotResolver(produitSchema),
    mode: "onTouched",
    defaultValues: {
      nom: "",
      slug: "",
      prix: 0,
      descriptionCourte: "",
      descriptionLongue: "",
      badge: "",
      medias: [],
      sousCategorieId: 0,
      actif: true,
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const watchedMedias = watch("medias");

  // ── Pre-fill (edit mode) ───────────────────────────────────────────────────

  // Effect 1 : reset form values when produit loads
  useEffect(() => {
    if (!produit) return;
    reset({
      nom: produit.nom,
      slug: produit.slug ?? "",
      prix: produit.prix,
      descriptionCourte: produit.descriptionCourte,
      descriptionLongue: produit.descriptionLongue,
      badge: produit.badge ?? "",
      // Galerie ordonnée ; repli sur imageUrl/videoUrl pour un produit sans lignes de média.
      medias: toMediaInputs(galleryOf(produit)),
      sousCategorieId: produit.sousCategorieId,
      actif: produit.actif,
    });
  }, [produit, reset]);

  // Effect 2 : dérive la catégorie parente via le fetch unitaire de la sous-catégorie (mode édition).
  useEffect(() => {
    if (editSousCat && selectedCategorieId === "") {
      setSelectedCategorieId(editSousCat.categorieId);
    }
  }, [editSousCat, selectedCategorieId]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function onSubmit(values: ProduitFormValues) {
    try {
      const payload = {
        nom: values.nom,
        slug: values.slug || undefined,
        prix: values.prix,
        descriptionCourte: values.descriptionCourte,
        descriptionLongue: values.descriptionLongue,
        // null (et non undefined) : permet d'EFFACER le badge en édition.
        badge: values.badge || null,
        // Galerie complète : l'API en dérive imageUrl (1ʳᵉ image) et videoUrl (1ʳᵉ vidéo).
        medias: values.medias,
        sousCategorieId: values.sousCategorieId,
        actif: values.actif,
      };

      if (isEdit) {
        await update.mutateAsync({ id: produitId!, input: payload });
      } else {
        await create.mutateAsync(payload);
      }
      router.push("/admin/produits");
      router.refresh();
    } catch (err) {
      setError("root", { message: getApiErrorMessage(err) });
    }
  }

  // ── Guard : aucune catégorie ───────────────────────────────────────────────

  if (!categoriesLoading && categories.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <p className="font-medium text-amber-900">Aucune catégorie disponible.</p>
        <p className="mt-2 text-sm text-amber-700">
          Créez d&apos;abord une catégorie avant d&apos;ajouter un produit.
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/categories">Gérer les catégories</Link>
        </Button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-2xl space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        noValidate
      >
        {/* Catégorie (hors payload — pilote la cascade, hors useForm) */}
        <div className="space-y-1">
          <Label htmlFor="categorie-select">Catégorie *</Label>
          <Select
            value={selectedCategorieId !== "" ? selectedCategorieId.toString() : ""}
            onValueChange={(v) => {
              setSelectedCategorieId(v !== "" ? Number(v) : "");
              setValue("sousCategorieId", 0, { shouldValidate: false });
            }}
          >
            <SelectTrigger id="categorie-select">
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sous-catégorie */}
        <FormField
          control={form.control}
          name="sousCategorieId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sous-catégorie *</FormLabel>
              <Select
                value={field.value !== 0 ? field.value.toString() : ""}
                onValueChange={(v) => field.onChange(Number(v))}
                disabled={!selectedCategorieId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        selectedCategorieId
                          ? "Sélectionner une sous-catégorie"
                          : "Choisir d'abord une catégorie"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sousCategories.map((sc) => (
                    <SelectItem key={sc.id} value={sc.id.toString()}>
                      {sc.nom}
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
                <Input {...field} />
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
              <FormLabel>
                Slug{" "}
                <span className="font-normal text-graphite-light">(optionnel)</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="généré-automatiquement" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Prix */}
        <FormField
          control={form.control}
          name="prix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix (FCFA) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  className="w-40"
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

        {/* Description courte */}
        <FormField
          control={form.control}
          name="descriptionCourte"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description courte *</FormLabel>
              <FormControl>
                <Input {...field} maxLength={280} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description longue */}
        <FormField
          control={form.control}
          name="descriptionLongue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description longue *</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} className="resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Badge */}
        <FormField
          control={form.control}
          name="badge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Badge</FormLabel>
              <Select
                value={field.value ? field.value : "__none__"}
                onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
              >
                <FormControl>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Aucun" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BADGE_OPTIONS.map((b) => (
                    <SelectItem key={b === "" ? "__none__" : b} value={b === "" ? "__none__" : b}>
                      {b || "Aucun"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Médias : images + vidéos, ordre = ordre d'affichage */}
        <ProduitMediaManager
          value={watchedMedias ?? []}
          onChange={(next) =>
            setValue("medias", next, { shouldValidate: true, shouldDirty: true })
          }
          onBusyChange={setMediaBusy}
          disabled={isSubmitting}
          error={errors.medias?.message ?? errors.medias?.root?.message}
        />

        {/* Switch actif */}
        <FormField
          control={form.control}
          name="actif"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-3">
                <FormLabel className="text-sm font-medium">Actif</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <span className="text-sm text-graphite">
                  {field.value ? "Oui" : "Non"}
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {errors.root?.message ? (
          <Alert variant="destructive">
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting || mediaBusy}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Enregistrement...
              </>
            ) : mediaBusy ? (
              "Envoi des médias en cours…"
            ) : isEdit ? (
              "Mettre à jour"
            ) : (
              "Créer le produit"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}
