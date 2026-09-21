"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  Pause,
  Play,
  ShoppingBag,
  Volume2,
  VolumeX,
} from "lucide-react";
import ImageFallback from "@/components/client/ImageFallback";
import SmartImage from "@/components/client/SmartImage";
import VideoViewer from "@/components/client/VideoViewer";
import { hasRealImage } from "@/lib/images";

export interface GalleryItem {
  id: number;
  type: "image" | "video";
  url: string;
  posterUrl: string | null;
  mimeType?: string | null;
}

const STAGE_SIZES = "(max-width: 768px) 100vw, 50vw";

/** Boutons ronds des commandes vidéo : discrets, ≥ 40 px, lisibles sur tout fond. */
const controlClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink/65 text-white backdrop-blur-sm transition-colors hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-white";

/**
 * Vidéo jouée DANS le cadre principal : autoplay, muette, en boucle, inline (iOS).
 *
 * - Montée uniquement quand la vidéo est le média sélectionné (jamais deux <video>
 *   en même temps) ; `key` côté parent la remonte à chaque changement de vidéo.
 * - Le poster reste affiché tant que la lecture n'a pas démarré (+ indicateur de chargement).
 * - Si le navigateur refuse l'autoplay (NotAllowedError) : bouton ▶ affiché, jamais d'erreur.
 * - `suspended` (lecteur plein écran ouvert) met en pause pour éviter deux lectures.
 * - Erreur de chargement → `onFailed` : le parent bascule sur l'image principale.
 */
function InlineVideo({
  src,
  poster,
  title,
  mimeType,
  suspended,
  onExpand,
  onFailed,
}: {
  src: string;
  poster: string | null;
  title: string;
  mimeType?: string | null;
  suspended: boolean;
  onExpand: () => void;
  onFailed: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hasAudio, setHasAudio] = useState(true);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (suspended || userPaused) {
      video.pause();
      return;
    }
    // play() peut être indéfini (vieux navigateurs, jsdom) ou rejeté.
    const attempt = video.play() as Promise<void> | undefined;
    attempt?.catch?.((err: unknown) => {
      // Autoplay refusé : on laisse le visiteur lancer. AbortError (pause() concurrent) : ignoré.
      if ((err as DOMException)?.name === "NotAllowedError") setUserPaused(true);
    });
  }, [suspended, userPaused]);

  return (
    <>
      <video
        ref={ref}
        src={src}
        poster={poster ?? undefined}
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-label={`Vidéo — ${title}`}
        data-mime={mimeType ?? undefined}
        className="absolute inset-0 h-full w-full object-contain"
        onLoadedMetadata={(e) => {
          // Détection au mieux : un flux sans piste audio n'a pas besoin de bouton son.
          const v = e.currentTarget as HTMLVideoElement & {
            mozHasAudio?: boolean;
            audioTracks?: { length: number };
          };
          if (v.mozHasAudio === false || v.audioTracks?.length === 0) setHasAudio(false);
        }}
        onCanPlay={() => setReady(true)}
        onPlaying={() => setReady(true)}
        onWaiting={() => setReady(false)}
        onError={onFailed}
      />

      {/* Voile très léger : lisibilité des commandes sans assombrir le produit */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/35 to-transparent" />

      {!ready && !userPaused && (
        <span
          role="status"
          aria-label="Chargement de la vidéo"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <Loader2 className="h-9 w-9 animate-spin text-white/90 drop-shadow" aria-hidden="true" />
        </span>
      )}

      {userPaused && !suspended && (
        <button
          type="button"
          onClick={() => setUserPaused(false)}
          aria-label="Lire la vidéo"
          className="absolute inset-0 z-[5] flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 ring-white/40 transition-transform hover:scale-105">
            <Play className="ml-1 h-7 w-7 fill-current" aria-hidden="true" />
          </span>
        </button>
      )}

      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          aria-label={userPaused ? "Lire la vidéo" : "Mettre la vidéo en pause"}
          aria-pressed={userPaused}
          className={controlClass}
        >
          {userPaused ? (
            <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true" />
          ) : (
            <Pause className="h-4 w-4 fill-current" aria-hidden="true" />
          )}
        </button>
        {hasAudio && (
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Activer le son" : "Couper le son"}
            aria-pressed={!muted}
            className={controlClass}
          >
            {muted ? (
              <VolumeX className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}
        <button
          type="button"
          onClick={onExpand}
          aria-label="Agrandir la vidéo"
          aria-haspopup="dialog"
          className={controlClass}
        >
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </>
  );
}

/**
 * Vitrine média de la fiche produit : images ET vidéos dans une même liste ordonnée.
 *
 * - Sélection initiale = image principale (1ʳᵉ image), même si une vidéo est en tête
 *   de galerie : la vidéo ne « vole » jamais la vedette, et aucun <video> n'est chargé
 *   au premier rendu (page rapide, LCP = image).
 * - Sélectionner la vidéo la joue dans le cadre principal (voir InlineVideo).
 * - Le produit n'est jamais recadré (`contain`) : les marges éventuelles sont remplies
 *   par un fond flou tiré de l'image/poster (immersion sans seconde vidéo à charger).
 * - Vidéo en échec → image principale affichée automatiquement.
 * - Navigation : miniatures, flèches, clavier ←/→, balayage tactile.
 */
export default function ProductGallery({
  nom,
  items,
  promo = false,
}: {
  nom: string;
  items: GalleryItem[];
  promo?: boolean;
}) {
  // Images placeholder/vides écartées ; les vidéos sont conservées.
  const medias = useMemo(
    () => items.filter((m) => m.type === "video" || hasRealImage(m.url)),
    [items]
  );
  const firstImage = medias.findIndex((m) => m.type === "image");
  const [active, setActive] = useState(Math.max(0, firstImage));
  const [viewerOpen, setViewerOpen] = useState(false);
  const [failedVideos, setFailedVideos] = useState<string[]>([]);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const count = medias.length;
  const index = Math.min(active, Math.max(0, count - 1));
  const current = medias[index];
  const primaryImage = medias[firstImage]?.url ?? null;

  useEffect(() => {
    thumbs.current[index]?.scrollIntoView?.({ inline: "nearest", block: "nearest" });
  }, [index]);

  if (count === 0) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-surface-subtle">
        <ImageFallback icon={ShoppingBag} tone="light" label={nom} />
      </div>
    );
  }

  const go = (delta: number) => setActive((index + delta + count) % count);

  function onKeyDown(e: React.KeyboardEvent) {
    if (count < 2) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || count < 2) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    // Geste horizontal dominant uniquement (ne gêne pas le défilement vertical de la page).
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  }

  const posterOf = (m: GalleryItem) => {
    const src = m.posterUrl ?? primaryImage;
    return src && hasRealImage(src) ? src : null;
  };
  const fallback = <ImageFallback icon={ShoppingBag} tone="light" label={nom} />;

  const isVideo = current.type === "video";
  const videoFailed = isVideo && failedVideos.includes(current.url);
  // Image montrée sur la scène : le média lui-même, ou (vidéo en échec) l'image principale.
  const stageImage = isVideo ? (videoFailed ? posterOf(current) : null) : current.url;
  const backdrop = isVideo ? posterOf(current) : current.url;

  return (
    <div
      role="region"
      aria-roledescription="carrousel"
      aria-label={`Médias de ${nom}`}
      className="min-w-0"
    >
      <div
        className="group/stage relative aspect-[4/5] touch-pan-y overflow-hidden rounded-3xl bg-surface-subtle outline-none focus-visible:ring-2 focus-visible:ring-primary md:max-h-[78vh] md:w-full"
        tabIndex={count > 1 ? 0 : undefined}
        onKeyDown={onKeyDown}
        onTouchStart={(e) => {
          touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchEnd={onTouchEnd}
      >
        {/* Fond immersif : même visuel, flouté — remplit les marges sans recadrer le produit */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <SmartImage
            key={backdrop ?? "none"}
            src={backdrop}
            alt=""
            sizes="25vw"
            className="scale-125 opacity-70 blur-2xl"
            fallback={null}
          />
          <div className="absolute inset-0 bg-white/20" />
        </div>

        {/* Média : la clé rejoue un fondu court à chaque changement */}
        <div
          key={`${current.type}:${current.url}:${videoFailed}`}
          className="absolute inset-0 animate-in fade-in-0 duration-300"
        >
          {isVideo && !videoFailed ? (
            <InlineVideo
              key={current.url}
              src={current.url}
              poster={posterOf(current)}
              title={nom}
              mimeType={current.mimeType}
              suspended={viewerOpen}
              onExpand={() => setViewerOpen(true)}
              onFailed={() =>
                setFailedVideos((prev) =>
                  prev.includes(current.url) ? prev : [...prev, current.url]
                )
              }
            />
          ) : (
            <SmartImage
              src={stageImage ?? primaryImage}
              alt={index === firstImage || videoFailed ? nom : `${nom} — image ${index + 1}`}
              priority={index === firstImage}
              fit="contain"
              sizes={STAGE_SIZES}
              fallback={fallback}
            />
          )}
        </div>

        {/* Pastilles d'état */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2">
          {promo && (
            <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-white">
              Promo
            </span>
          )}
          {isVideo && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-ink/75 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <Play className="h-3 w-3 fill-current" aria-hidden="true" />
              {videoFailed ? "Vidéo indisponible" : "Vidéo"}
            </span>
          )}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Média précédent"
              className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow transition hover:bg-white focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-primary md:opacity-0 md:group-hover/stage:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Média suivant"
              className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow transition hover:bg-white focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-primary md:opacity-0 md:group-hover/stage:opacity-100"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <span
              aria-live="polite"
              className="pointer-events-none absolute right-3 top-3 z-10 rounded-md bg-ink/70 px-2 py-1 text-xs font-medium tabular-nums text-white"
            >
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <ul
          aria-label="Miniatures des médias"
          className="mt-4 flex snap-x gap-3 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {medias.map((m, i) => {
            const thumbIsVideo = m.type === "video";
            const selected = i === index;
            return (
              <li key={`${m.type}:${m.url}`} className="shrink-0 snap-start">
                <button
                  ref={(el) => {
                    thumbs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={thumbIsVideo ? "Afficher la vidéo" : `Afficher l'image ${i + 1}`}
                  aria-current={selected ? "true" : undefined}
                  className={`relative block h-[68px] w-[68px] overflow-hidden rounded-xl bg-surface-subtle outline-none transition-[opacity,box-shadow,transform] duration-200 sm:h-20 sm:w-20 ${
                    selected
                      ? "ring-2 ring-primary ring-offset-2"
                      : "opacity-70 ring-1 ring-border hover:-translate-y-0.5 hover:opacity-100"
                  } focus-visible:ring-2 focus-visible:ring-primary`}
                >
                  <SmartImage
                    src={thumbIsVideo ? posterOf(m) : m.url}
                    alt=""
                    sizes="80px"
                    fallback={<div className="absolute inset-0 bg-ink-soft" />}
                  />
                  {thumbIsVideo && (
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/35">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
                        <Play className="ml-0.5 h-3.5 w-3.5 fill-current" aria-hidden="true" />
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-white">
                        Vidéo
                      </span>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {isVideo && (
        <VideoViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          src={current.url}
          poster={posterOf(current)}
          title={nom}
          mimeType={current.mimeType}
        />
      )}
    </div>
  );
}
