"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
import { useUpload } from "@/lib/api/hooks/use-uploads";
import { getApiErrorMessage } from "@/lib/api/http";
import LoadingButton from "@/components/ui/LoadingButton";

interface ProduitFormProps {
  produitId?: number;
}

export default function ProduitForm({ produitId }: ProduitFormProps) {
  const router = useRouter();
  const isEdit = !!produitId;

  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
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
  const upload = useUpload();

  // ── Form ───────────────────────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProduitFormValues>({
    resolver: valibotResolver(produitSchema),
    mode: "onTouched",
    defaultValues: {
      nom: "",
      slug: "",
      prix: 0,
      descriptionCourte: "",
      descriptionLongue: "",
      badge: "",
      imageUrl: "",
      videoUrl: "",
      sousCategorieId: 0,
      actif: true,
    },
  });

  const actif = watch("actif");
  const watchedImageUrl = watch("imageUrl");
  const watchedVideoUrl = watch("videoUrl");

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
      imageUrl: produit.imageUrl,
      videoUrl: produit.videoUrl ?? "",
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

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await upload.mutateAsync({ bucket: "produits", file });
      setValue("imageUrl", res.publicUrl, { shouldValidate: true });
    } catch (err) {
      setError("root", { message: getApiErrorMessage(err) });
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const res = await upload.mutateAsync({ bucket: "videos", file });
      setValue("videoUrl", res.publicUrl);
    } catch (err) {
      setError("root", { message: getApiErrorMessage(err) });
    } finally {
      setUploadingVideo(false);
    }
  }

  async function onSubmit(values: ProduitFormValues) {
    try {
      const payload = {
        nom: values.nom,
        slug: values.slug || undefined,
        prix: values.prix,
        descriptionCourte: values.descriptionCourte,
        descriptionLongue: values.descriptionLongue,
        badge: values.badge || undefined,
        imageUrl: values.imageUrl,
        videoUrl: values.videoUrl || undefined,
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
        <Link href="/admin/categories" className="btn-primary mt-4 inline-flex">
          Gérer les catégories
        </Link>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl space-y-5"
      noValidate
    >
      {/* Catégorie (hors payload — pilote la cascade) */}
      <div>
        <label className="mb-1 block text-sm font-medium">Catégorie *</label>
        <select
          value={selectedCategorieId}
          onChange={(e) => {
            const val = e.target.value !== "" ? Number(e.target.value) : "";
            setSelectedCategorieId(val);
            setValue("sousCategorieId", 0, { shouldValidate: false });
          }}
          className="input-field"
        >
          <option value="">Sélectionner une catégorie</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Sous-catégorie */}
      <div>
        <label className="mb-1 block text-sm font-medium">Sous-catégorie *</label>
        <select
          {...register("sousCategorieId", { valueAsNumber: true })}
          className="input-field"
          disabled={!selectedCategorieId}
        >
          <option value={0}>
            {selectedCategorieId
              ? "Sélectionner une sous-catégorie"
              : "Choisir d'abord une catégorie"}
          </option>
          {sousCategories.map((sc) => (
            <option key={sc.id} value={sc.id}>
              {sc.nom}
            </option>
          ))}
        </select>
        {errors.sousCategorieId && (
          <p className="mt-1 text-xs text-red-600">
            {errors.sousCategorieId.message}
          </p>
        )}
      </div>

      {/* Nom */}
      <div>
        <label className="mb-1 block text-sm font-medium">Nom *</label>
        <input {...register("nom")} className="input-field" />
        {errors.nom && (
          <p className="mt-1 text-xs text-red-600">{errors.nom.message}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Slug{" "}
          <span className="font-normal text-gray-400">(optionnel)</span>
        </label>
        <input
          {...register("slug")}
          className="input-field"
          placeholder="généré-automatiquement"
        />
        {errors.slug && (
          <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>
        )}
      </div>

      {/* Prix */}
      <div>
        <label className="mb-1 block text-sm font-medium">Prix (FCFA) *</label>
        <input
          type="number"
          min={1}
          {...register("prix", { valueAsNumber: true })}
          className="input-field w-40"
        />
        {errors.prix && (
          <p className="mt-1 text-xs text-red-600">{errors.prix.message}</p>
        )}
      </div>

      {/* Description courte */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Description courte *
        </label>
        <input
          {...register("descriptionCourte")}
          className="input-field"
          maxLength={280}
        />
        {errors.descriptionCourte && (
          <p className="mt-1 text-xs text-red-600">
            {errors.descriptionCourte.message}
          </p>
        )}
      </div>

      {/* Description longue */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Description longue *
        </label>
        <textarea
          {...register("descriptionLongue")}
          rows={4}
          className="input-field resize-none"
        />
        {errors.descriptionLongue && (
          <p className="mt-1 text-xs text-red-600">
            {errors.descriptionLongue.message}
          </p>
        )}
      </div>

      {/* Badge */}
      <div>
        <label className="mb-1 block text-sm font-medium">Badge</label>
        <select {...register("badge")} className="input-field w-48">
          {BADGE_OPTIONS.map((b) => (
            <option key={b} value={b}>
              {b || "Aucun"}
            </option>
          ))}
        </select>
      </div>

      {/* Image */}
      <div>
        <label className="mb-1 block text-sm font-medium">Image *</label>
        {watchedImageUrl && (
          <div className="relative mb-2 h-32 w-32 overflow-hidden rounded-lg">
            <Image
              src={watchedImageUrl}
              alt="Aperçu"
              fill
              className="object-cover"
            />
          </div>
        )}
        {uploadingImage && (
          <p className="mb-1 text-xs text-gray-500">Upload…</p>
        )}
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          className="text-sm"
          onChange={handleImageChange}
          disabled={uploadingImage}
        />
        {/* Champ caché pour transporter la valeur dans react-hook-form */}
        <input type="hidden" {...register("imageUrl")} />
        {errors.imageUrl && (
          <p className="mt-1 text-xs text-red-600">{errors.imageUrl.message}</p>
        )}
      </div>

      {/* Vidéo */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Vidéo publicitaire
        </label>
        {watchedVideoUrl && (
          <video
            src={watchedVideoUrl}
            controls
            className="mb-2 max-h-48 w-full max-w-sm rounded-lg"
          />
        )}
        {uploadingVideo && (
          <p className="mb-1 text-xs text-gray-500">Upload…</p>
        )}
        <input
          ref={videoRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="text-sm"
          onChange={handleVideoChange}
          disabled={uploadingVideo}
        />
        {/* Champ caché pour transporter la valeur dans react-hook-form */}
        <input type="hidden" {...register("videoUrl")} />
        <p className="mt-1 text-xs text-gray-400">
          MP4, WebM — max recommandé 50 Mo
        </p>
      </div>

      {/* Toggle actif */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Actif</label>
        <button
          type="button"
          onClick={() => setValue("actif", !actif, { shouldDirty: true })}
          className={`relative h-6 w-11 rounded-full transition ${
            actif ? "bg-primary" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition ${
              actif ? "translate-x-5" : ""
            }`}
          />
        </button>
        <span className="text-sm text-gray-500">{actif ? "Oui" : "Non"}</span>
      </div>

      {errors.root && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {errors.root.message}
        </p>
      )}

      <div className="flex gap-3">
        <LoadingButton
          loading={isSubmitting}
          loadingText="Enregistrement..."
          className="btn-primary"
        >
          {isEdit ? "Mettre à jour" : "Créer le produit"}
        </LoadingButton>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
