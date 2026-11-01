"use client";

import { useEffect, useRef, useState } from "react";
/* eslint-disable @next/next/no-img-element -- miniatures admin : URL distantes arbitraires, pas d'optimisation voulue */
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Film,
  ImagePlus,
  Image as ImageIcon,
  Loader2,
  Play,
  RefreshCw,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUpload } from "@/lib/api/hooks/use-uploads";
import type { MediaType, ProduitMediaInput, UploadBucket } from "@/lib/api/types";
import {
  IMAGE_ACCEPT,
  IMAGE_MAX_BYTES,
  MAX_IMAGES,
  MAX_VIDEOS,
  VIDEO_ACCEPT,
  VIDEO_MAX_BYTES,
  captureVideoPoster,
  checkMediaFile,
  formatBytes,
  makePrimaryImage,
  moveItem,
  uploadErrorMessage,
} from "@/lib/media";

interface Props {
  value: ProduitMediaInput[];
  onChange: (next: ProduitMediaInput[]) => void;
  /** Vrai tant qu'un envoi est en cours (le formulaire bloque alors l'enregistrement). */
  onBusyChange?: (busy: boolean) => void;
  disabled?: boolean;
  error?: string;
}

interface Task {
  id: number;
  name: string;
  kind: MediaType;
  size: number;
  percent: number;
  phase: "uploading" | "poster" | "error";
  message?: string;
}

const actionBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-md text-graphite transition-colors hover:bg-primary-50 hover:text-primary-dark focus-visible:outline-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40";

export default function ProduitMediaManager({
  value,
  onChange,
  onBusyChange,
  disabled = false,
  error,
}: Props) {
  const upload = useUpload();
  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const posterInput = useRef<HTMLInputElement>(null);
  const target = useRef<string | null>(null); // vidéo visée par « Remplacer » / « Miniature »
  const taskSeq = useRef(0);

  // Valeur courante lisible depuis des callbacks asynchrones (envois concurrents).
  const current = useRef(value);
  useEffect(() => {
    current.current = value;
  }, [value]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  const busy = tasks.some((t) => t.phase !== "error");
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  const images = value.filter((m) => m.type === "image");
  const videos = value.filter((m) => m.type === "video");
  const primaryUrl = images[0]?.url;
  const posterFallback = primaryUrl;

  function commit(update: (list: ProduitMediaInput[]) => ProduitMediaInput[]) {
    const next = update(current.current);
    current.current = next;
    onChange(next);
  }

  const patchTask = (id: number, patch: Partial<Task>) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const dropTask = (id: number) => setTasks((ts) => ts.filter((t) => t.id !== id));

  /** Envoie un fichier ; renvoie le résultat ou null (erreur affichée dans la liste des envois). */
  async function send(file: File, kind: MediaType, bucket: UploadBucket, task: Task) {
    try {
      return await upload.mutateAsync({
        bucket,
        file,
        onProgress: (percent) => patchTask(task.id, { percent }),
      });
    } catch (err) {
      patchTask(task.id, { phase: "error", message: uploadErrorMessage(err, kind) });
      return null;
    }
  }

  function newTask(file: File, kind: MediaType): Task {
    return {
      id: ++taskSeq.current,
      name: file.name,
      kind,
      size: file.size,
      percent: 0,
      phase: "uploading",
    };
  }

  function rejected(file: File, kind: MediaType, message: string) {
    const task: Task = { ...newTask(file, kind), phase: "error", message };
    setTasks((ts) => [...ts, task]);
  }

  async function addImage(file: File) {
    const problem = checkMediaFile(file, "image");
    if (problem) return rejected(file, "image", problem);

    const task = newTask(file, "image");
    setTasks((ts) => [...ts, task]);
    const res = await send(file, "image", "produits", task);
    if (!res) return;

    commit((list) => [
      ...list,
      { type: "image", url: res.publicUrl, mimeType: res.mimeType, size: res.size },
    ]);
    dropTask(task.id);
  }

  /** Miniature auto : capture navigateur → upload image → posterUrl de la vidéo. */
  async function attachPoster(videoUrl: string, videoFile: File, task: Task) {
    patchTask(task.id, { phase: "poster" });
    try {
      const posterFile = await captureVideoPoster(videoFile);
      if (!posterFile) return;
      const res = await upload.mutateAsync({ bucket: "produits", file: posterFile });
      commit((list) =>
        list.map((m) => (m.type === "video" && m.url === videoUrl ? { ...m, posterUrl: res.publicUrl } : m))
      );
    } catch {
      // Sans miniature : la galerie retombe sur l'image principale. Pas bloquant.
    }
  }

  async function addOrReplaceVideo(file: File, replaceUrl?: string) {
    const problem = checkMediaFile(file, "video");
    if (problem) return rejected(file, "video", problem);

    const task = newTask(file, "video");
    setTasks((ts) => [...ts, task]);
    const res = await send(file, "video", "videos", task);
    if (!res) return;

    const fresh: ProduitMediaInput = {
      type: "video",
      url: res.publicUrl,
      posterUrl: null,
      mimeType: res.mimeType,
      size: res.size,
    };
    commit((list) =>
      replaceUrl
        ? list.map((m) => (m.type === "video" && m.url === replaceUrl ? fresh : m))
        : [...list, fresh]
    );
    if (replaceUrl && preview === replaceUrl) setPreview(null);

    await attachPoster(res.publicUrl, file, task);
    dropTask(task.id);
    toast.success(replaceUrl ? "Vidéo remplacée" : "Vidéo ajoutée");
  }

  async function replacePoster(videoUrl: string, file: File) {
    const problem = checkMediaFile(file, "image");
    if (problem) return rejected(file, "image", problem);

    const task = newTask(file, "image");
    setTasks((ts) => [...ts, task]);
    const res = await send(file, "image", "produits", task);
    if (!res) return;
    commit((list) =>
      list.map((m) => (m.type === "video" && m.url === videoUrl ? { ...m, posterUrl: res.publicUrl } : m))
    );
    dropTask(task.id);
  }

  function onImagesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    const room = MAX_IMAGES - (current.current.filter((m) => m.type === "image").length + tasks.filter((t) => t.kind === "image" && t.phase === "uploading").length);
    files.slice(0, Math.max(0, room)).forEach((f) => void addImage(f));
    files.slice(Math.max(0, room)).forEach((f) =>
      rejected(f, "image", `Maximum ${MAX_IMAGES} images par produit.`)
    );
  }

  function onVideoPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void addOrReplaceVideo(file);
  }

  function onReplacePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    const url = target.current;
    if (file && url) void addOrReplaceVideo(file, url);
  }

  function onPosterPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    const url = target.current;
    if (file && url) void replacePoster(url, file);
  }

  const uploadingImages = tasks.filter((t) => t.kind === "image" && t.phase === "uploading").length;
  const uploadingVideos = tasks.filter((t) => t.kind === "video" && t.phase !== "error").length;
  const canAddImage = !disabled && images.length + uploadingImages < MAX_IMAGES;
  const canAddVideo = !disabled && videos.length + uploadingVideos < MAX_VIDEOS;

  const previewItem = preview ? value.find((m) => m.type === "video" && m.url === preview) : undefined;

  return (
    <section aria-labelledby="medias-title" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 id="medias-title" className="text-sm font-medium text-ink">
          Médias du produit *
        </h3>
        <p className="text-xs text-graphite-light">
          {images.length}/{MAX_IMAGES} images · {videos.length}/{MAX_VIDEOS} vidéo{MAX_VIDEOS > 1 ? "s" : ""}
        </p>
      </div>
      <p className="text-xs text-graphite">
        L&apos;ordre ci-dessous est celui de la fiche produit. La première image est l&apos;image principale
        (affichée dans le catalogue). Images : JPG, PNG, WebP ≤ {formatBytes(IMAGE_MAX_BYTES)}. Vidéos : MP4,
        WebM ≤ {formatBytes(VIDEO_MAX_BYTES)}.
      </p>

      {value.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-surface-muted p-6 text-center text-sm text-graphite">
          Aucun média pour l&apos;instant. Ajoutez au moins une image.
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Galerie du produit">
          {value.map((m, i) => {
            const isVideo = m.type === "video";
            const isPrimary = !isVideo && m.url === primaryUrl;
            const thumb = isVideo ? (m.posterUrl ?? posterFallback) : m.url;
            return (
              <li
                key={`${m.type}:${m.url}`}
                className={`overflow-hidden rounded-xl border bg-white ${
                  isPrimary ? "border-primary ring-1 ring-primary/30" : "border-gray-200"
                }`}
              >
                <div className="relative aspect-square bg-surface-subtle">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={isVideo ? "Miniature de la vidéo" : `Image ${i + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-graphite-light">
                      <Film className="h-8 w-8" aria-hidden />
                    </div>
                  )}
                  {isVideo && (
                    <>
                      <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-md">
                          <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden />
                        </span>
                      </span>
                      <span className="absolute bottom-2 left-2 rounded-md bg-ink/85 px-2 py-0.5 text-xs font-medium text-white">
                        Vidéo{m.size ? ` · ${formatBytes(m.size)}` : ""}
                      </span>
                    </>
                  )}
                  {isPrimary && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-white">
                      <Star className="h-3 w-3 fill-current" aria-hidden /> Principale
                    </span>
                  )}
                  <span className="absolute right-2 top-2 rounded-md bg-white/90 px-1.5 py-0.5 text-xs font-medium tabular-nums text-ink">
                    {i + 1}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-0.5 p-1">
                  <div className="flex items-center">
                    <button
                      type="button"
                      className={actionBtn}
                      onClick={() => commit((l) => moveItem(l, i, i - 1))}
                      disabled={disabled || i === 0}
                      aria-label={`Déplacer le média ${i + 1} vers le début`}
                      title="Avancer"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      className={actionBtn}
                      onClick={() => commit((l) => moveItem(l, i, i + 1))}
                      disabled={disabled || i === value.length - 1}
                      aria-label={`Déplacer le média ${i + 1} vers la fin`}
                      title="Reculer"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </button>
                  </div>

                  <div className="flex items-center">
                    {!isVideo && !isPrimary && (
                      <button
                        type="button"
                        className={actionBtn}
                        onClick={() => commit((l) => makePrimaryImage(l, i))}
                        disabled={disabled}
                        aria-label={`Définir l'image ${i + 1} comme image principale`}
                        title="Définir comme principale"
                      >
                        <Star className="h-4 w-4" aria-hidden />
                      </button>
                    )}
                    {isVideo && (
                      <>
                        <button
                          type="button"
                          className={actionBtn}
                          onClick={() => setPreview(preview === m.url ? null : m.url)}
                          aria-label="Prévisualiser la vidéo"
                          aria-pressed={preview === m.url}
                          title="Prévisualiser"
                        >
                          <Play className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          className={actionBtn}
                          onClick={() => {
                            target.current = m.url;
                            replaceInput.current?.click();
                          }}
                          disabled={disabled}
                          aria-label="Remplacer la vidéo"
                          title="Remplacer la vidéo"
                        >
                          <RefreshCw className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          className={actionBtn}
                          onClick={() => {
                            target.current = m.url;
                            posterInput.current?.click();
                          }}
                          disabled={disabled}
                          aria-label="Changer la miniature de la vidéo"
                          title="Changer la miniature"
                        >
                          <ImageIcon className="h-4 w-4" aria-hidden />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className={`${actionBtn} hover:bg-red-50 hover:text-red-600`}
                      onClick={() => {
                        if (preview === m.url) setPreview(null);
                        commit((l) => l.filter((_, idx) => idx !== i));
                      }}
                      disabled={disabled}
                      aria-label={isVideo ? "Supprimer la vidéo" : `Supprimer l'image ${i + 1}`}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {previewItem && (
        <div className="rounded-xl border border-gray-200 bg-black p-2">
          <video
            key={previewItem.url}
            src={previewItem.url}
            poster={previewItem.posterUrl ?? posterFallback}
            controls
            playsInline
            preload="metadata"
            className="mx-auto max-h-72 w-full rounded-lg"
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => imageInput.current?.click()} disabled={!canAddImage}>
          <ImagePlus className="h-4 w-4" aria-hidden /> Ajouter des images
        </Button>
        <Button type="button" variant="outline" onClick={() => videoInput.current?.click()} disabled={!canAddVideo}>
          <Film className="h-4 w-4" aria-hidden /> Ajouter une vidéo
        </Button>
      </div>

      <input ref={imageInput} type="file" accept={IMAGE_ACCEPT} multiple className="sr-only" tabIndex={-1} aria-label="Choisir des images" onChange={onImagesPicked} />
      <input ref={videoInput} type="file" accept={VIDEO_ACCEPT} className="sr-only" tabIndex={-1} aria-label="Choisir une vidéo" onChange={onVideoPicked} />
      <input ref={replaceInput} type="file" accept={VIDEO_ACCEPT} className="sr-only" tabIndex={-1} aria-label="Choisir la vidéo de remplacement" onChange={onReplacePicked} />
      <input ref={posterInput} type="file" accept={IMAGE_ACCEPT} className="sr-only" tabIndex={-1} aria-label="Choisir une miniature" onChange={onPosterPicked} />

      {tasks.length > 0 && (
        <ul className="space-y-2" aria-live="polite" aria-label="Envois en cours">
          {tasks.map((t) => (
            <li
              key={t.id}
              className={`rounded-lg border px-3 py-2 text-sm ${
                t.phase === "error" ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  {t.phase === "error" ? (
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden />
                  ) : (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
                  )}
                  <span className="truncate font-medium text-ink">{t.name}</span>
                  <span className="shrink-0 text-xs text-graphite-light">{formatBytes(t.size)}</span>
                </span>
                {t.phase === "error" && (
                  <button
                    type="button"
                    className="shrink-0 rounded p-1 text-red-700 hover:bg-red-100"
                    onClick={() => dropTask(t.id)}
                    aria-label="Fermer ce message"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>

              {t.phase === "error" ? (
                <p role="alert" className="mt-1 text-red-700">
                  {t.message}
                </p>
              ) : t.phase === "poster" ? (
                <p className="mt-1 text-xs text-graphite">Création de la miniature…</p>
              ) : (
                <div className="mt-2">
                  <div
                    role="progressbar"
                    aria-label={`Envoi de ${t.name}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={t.percent}
                    className="h-1.5 overflow-hidden rounded-full bg-gray-100"
                  >
                    <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${t.percent}%` }} />
                  </div>
                  <p className="mt-1 text-xs tabular-nums text-graphite">
                    {t.kind === "video" ? "Vidéo" : "Image"} — envoi… {t.percent}%
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
