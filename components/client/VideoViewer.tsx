"use client";

import { useRef, useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { AlertCircle, Loader2, RotateCcw, X } from "lucide-react";

/**
 * Lecteur vidéo grand format (plein viewport) de la fiche produit.
 *
 * - Le <video> n'est monté qu'à l'ouverture (Radix démonte le contenu fermé) :
 *   rien n'est téléchargé tant que le visiteur ne clique pas.
 * - `preload="metadata"`, poster, AUCUN autoplay (ni son forcé) : la lecture reste
 *   sous contrôle de l'utilisateur via les contrôles natifs (lecture/pause, volume,
 *   barre de progression, plein écran natif, mute).
 * - Fermeture : bouton, touche Échap, clic sur le fond ; focus restitué à
 *   l'élément déclencheur par Radix ; focus initial sur « Fermer ».
 * - Mobile : occupe tout l'écran (dvh + safe-area) ; cible de fermeture 44 px.
 */
export default function VideoViewer({
  open,
  onOpenChange,
  src,
  poster,
  title,
  mimeType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  poster?: string | null;
  title: string;
  mimeType?: string | null;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  // `attempt` force le remontage du <video> lors d'un « Réessayer ».
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  function handleOpenChange(next: boolean) {
    if (next) setStatus("loading");
    onOpenChange(next);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/95 data-open:animate-in data-open:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            closeRef.current?.focus();
          }}
          className="fixed inset-0 z-[101] flex h-dvh w-screen flex-col outline-none"
        >
          <DialogPrimitive.Title className="sr-only">Vidéo — {title}</DialogPrimitive.Title>

          <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <p className="min-w-0 truncate text-sm font-medium text-white/80">{title}</p>
            <DialogPrimitive.Close
              ref={closeRef}
              aria-label="Fermer la vidéo"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-6">
            {status === "error" ? (
              <div
                role="alert"
                className="mx-4 flex max-w-sm flex-col items-center gap-3 rounded-2xl bg-white/10 p-6 text-center text-white"
              >
                <AlertCircle className="h-8 w-8 text-primary-light" aria-hidden="true" />
                <p className="text-sm">
                  Cette vidéo est momentanément inaccessible. Vérifiez votre connexion puis réessayez.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("loading");
                    setAttempt((n) => n + 1);
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-dark"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" /> Réessayer
                </button>
              </div>
            ) : (
              <>
                <video
                  key={attempt}
                  src={src}
                  poster={poster ?? undefined}
                  controls
                  playsInline
                  preload="metadata"
                  controlsList="nodownload"
                  aria-label={`Vidéo — ${title}`}
                  data-mime={mimeType ?? undefined}
                  className="h-full w-full bg-black object-contain sm:rounded-xl"
                  onLoadedMetadata={() => setStatus("ready")}
                  onCanPlay={() => setStatus("ready")}
                  onWaiting={() => setStatus("loading")}
                  onPlaying={() => setStatus("ready")}
                  onError={() => setStatus("error")}
                >
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
                {status === "loading" && (
                  <span
                    role="status"
                    aria-label="Chargement de la vidéo"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  >
                    <Loader2 className="h-10 w-10 animate-spin text-white/80" aria-hidden="true" />
                  </span>
                )}
              </>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
