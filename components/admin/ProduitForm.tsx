"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Categorie, Produit } from "@/lib/types";
import { BADGE_OPTIONS } from "@/lib/constants";
import { produitSchema, type ProduitFormValues } from "@/lib/schemas";
import LoadingButton from "@/components/ui/LoadingButton";

interface ProduitFormProps {
  produit?: Produit;
  categories: Categorie[];
}

export default function ProduitForm({ produit, categories }: ProduitFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(produit?.image_url ?? "");
  const [videoUrl, setVideoUrl] = useState(produit?.video_url ?? "");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProduitFormValues>({
    resolver: valibotResolver(produitSchema),
    mode: "onTouched",
    defaultValues: {
      categorie_id: produit?.categorie_id ?? "",
      nom: produit?.nom ?? "",
      description_courte: produit?.description_courte ?? "",
      description_complete: produit?.description_complete ?? "",
      prix: produit?.prix ?? 0,
      badge: produit?.badge ?? "",
      actif: produit?.actif ?? true,
    },
  });

  const actif = watch("actif");

  async function uploadFile(
    file: File,
    bucket: "produits" | "videos"
  ): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (uploadError) {
      console.error(uploadError);
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function onSubmit(values: ProduitFormValues) {
    let finalImageUrl = imageUrl;
    const imageFile = imageRef.current?.files?.[0];
    if (imageFile && imageFile.size > 0) {
      const uploaded = await uploadFile(imageFile, "produits");
      if (!uploaded) {
        setError("root", { message: "Erreur lors de l'upload de l'image." });
        return;
      }
      finalImageUrl = uploaded;
    }

    let finalVideoUrl = videoUrl;
    const videoFile = videoRef.current?.files?.[0];
    if (videoFile && videoFile.size > 0) {
      const uploaded = await uploadFile(videoFile, "videos");
      if (!uploaded) {
        setError("root", { message: "Erreur lors de l'upload de la vidéo." });
        return;
      }
      finalVideoUrl = uploaded;
    }

    const payload = {
      nom: values.nom,
      description_courte: values.description_courte,
      description_complete: values.description_complete || null,
      prix: values.prix,
      badge: values.badge || "",
      categorie_id: values.categorie_id,
      image_url: finalImageUrl || null,
      video_url: finalVideoUrl || null,
      actif: values.actif,
    };

    if (produit) {
      const { error: updateError } = await supabase
        .from("produits")
        .update(payload)
        .eq("id", produit.id);

      if (updateError) {
        setError("root", { message: updateError.message });
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("produits")
        .insert(payload);

      if (insertError) {
        setError("root", { message: insertError.message });
        return;
      }
    }

    router.push("/admin/produits");
    router.refresh();
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <p className="font-medium text-amber-900">
          Aucune catégorie disponible.
        </p>
        <p className="mt-2 text-sm text-amber-700">
          Créez d&apos;abord une catégorie avant d&apos;ajouter un produit.
        </p>
        <Link href="/admin/categories" className="btn-primary mt-4 inline-flex">
          Gérer les catégories
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl space-y-5"
      noValidate
    >
      <div>
        <label className="mb-1 block text-sm font-medium">Catégorie *</label>
        <select {...register("categorie_id")} className="input-field">
          <option value="">Sélectionner une catégorie</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nom}
            </option>
          ))}
        </select>
        {errors.categorie_id && (
          <p className="mt-1 text-xs text-red-600">{errors.categorie_id.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Nom *</label>
        <input {...register("nom")} className="input-field" />
        {errors.nom && (
          <p className="mt-1 text-xs text-red-600">{errors.nom.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Description courte *
        </label>
        <input {...register("description_courte")} className="input-field" />
        {errors.description_courte && (
          <p className="mt-1 text-xs text-red-600">
            {errors.description_courte.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Description complète
        </label>
        <textarea
          {...register("description_complete")}
          rows={4}
          className="input-field resize-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Prix (FCFA) *</label>
        <input
          type="number"
          min={0}
          {...register("prix", { valueAsNumber: true })}
          className="input-field w-40"
        />
        {errors.prix && (
          <p className="mt-1 text-xs text-red-600">{errors.prix.message}</p>
        )}
      </div>

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

      <div>
        <label className="mb-1 block text-sm font-medium">Image</label>
        {imageUrl && (
          <div className="relative mb-2 h-32 w-32 overflow-hidden rounded-lg">
            <Image src={imageUrl} alt="Aperçu" fill className="object-cover" />
          </div>
        )}
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          className="text-sm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setImageUrl(URL.createObjectURL(file));
          }}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Vidéo publicitaire
        </label>
        {videoUrl && (
          <video
            src={videoUrl}
            controls
            className="mb-2 max-h-48 w-full max-w-sm rounded-lg"
          />
        )}
        <input
          ref={videoRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="text-sm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setVideoUrl(URL.createObjectURL(file));
          }}
        />
        <p className="mt-1 text-xs text-gray-400">MP4, WebM — max recommandé 50 Mo</p>
      </div>

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
          {produit ? "Mettre à jour" : "Créer le produit"}
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
