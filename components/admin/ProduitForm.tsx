"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Categorie, Produit } from "@/lib/types";
import { BADGE_OPTIONS } from "@/lib/constants";
import LoadingButton from "@/components/ui/LoadingButton";

interface ProduitFormProps {
  produit?: Produit;
  categories: Categorie[];
}

export default function ProduitForm({ produit, categories }: ProduitFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(produit?.image_url ?? "");
  const [videoUrl, setVideoUrl] = useState(produit?.video_url ?? "");
  const [actif, setActif] = useState(produit?.actif ?? true);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const nom = (form.get("nom") as string).trim();
    const description_courte = (form.get("description_courte") as string).trim();
    const description_complete = (form.get("description_complete") as string).trim();
    const prix = parseInt(form.get("prix") as string);
    const badge = form.get("badge") as string;
    const categorie_id = form.get("categorie_id") as string;
    const imageFile = form.get("image") as File;
    const videoFile = form.get("video") as File;

    if (!nom || !description_courte || isNaN(prix) || !categorie_id) {
      setError("Veuillez remplir tous les champs obligatoires.");
      setLoading(false);
      return;
    }

    let finalImageUrl = imageUrl;
    if (imageFile && imageFile.size > 0) {
      const uploaded = await uploadFile(imageFile, "produits");
      if (!uploaded) {
        setError("Erreur lors de l'upload de l'image.");
        setLoading(false);
        return;
      }
      finalImageUrl = uploaded;
    }

    let finalVideoUrl = videoUrl;
    if (videoFile && videoFile.size > 0) {
      const uploaded = await uploadFile(videoFile, "videos");
      if (!uploaded) {
        setError("Erreur lors de l'upload de la vidéo.");
        setLoading(false);
        return;
      }
      finalVideoUrl = uploaded;
    }

    const payload = {
      nom,
      description_courte,
      description_complete: description_complete || null,
      prix,
      badge: badge || "",
      categorie_id,
      image_url: finalImageUrl || null,
      video_url: finalVideoUrl || null,
      actif,
    };

    if (produit) {
      const { error: updateError } = await supabase
        .from("produits")
        .update(payload)
        .eq("id", produit.id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("produits")
        .insert(payload);

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
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
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium">Catégorie *</label>
        <select
          name="categorie_id"
          defaultValue={produit?.categorie_id ?? ""}
          required
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

      <div>
        <label className="mb-1 block text-sm font-medium">Nom *</label>
        <input
          name="nom"
          defaultValue={produit?.nom}
          required
          className="input-field"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Description courte *
        </label>
        <input
          name="description_courte"
          defaultValue={produit?.description_courte ?? ""}
          required
          className="input-field"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Description complète
        </label>
        <textarea
          name="description_complete"
          defaultValue={produit?.description_complete ?? ""}
          rows={4}
          className="input-field resize-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Prix (FCFA) *</label>
        <input
          name="prix"
          type="number"
          min={0}
          defaultValue={produit?.prix}
          required
          className="input-field w-40"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Badge</label>
        <select name="badge" defaultValue={produit?.badge ?? ""} className="input-field w-48">
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
        <input name="image" type="file" accept="image/*" className="text-sm" />
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
          name="video"
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="text-sm"
        />
        <p className="mt-1 text-xs text-gray-400">MP4, WebM — max recommandé 50 Mo</p>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Actif</label>
        <button
          type="button"
          onClick={() => setActif(!actif)}
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

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-3">
        <LoadingButton
          loading={loading}
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
