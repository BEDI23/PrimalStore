import { http, unwrap } from "@/lib/api/http";
import type { UploadBucket, UploadResult } from "@/lib/api/types";

export const uploadsService = {
  // multipart/form-data, champ `file`. Le nom de fichier final est généré serveur.
  // Content-Type NON fixé ici : le navigateur/axios doit le générer depuis le
  // FormData pour inclure le boundary (un header codé en dur casse le parsing multer côté API).
  //
  // `onProgress` reçoit un pourcentage 0-100 pendant l'envoi ; `signal` permet
  // d'annuler. Timeout désactivé : une vidéo de 50 Mo sur une connexion mobile
  // peut légitimement durer plusieurs minutes.
  upload: (
    bucket: UploadBucket,
    file: File,
    opts?: { onProgress?: (percent: number) => void; signal?: AbortSignal }
  ) => {
    const form = new FormData();
    form.append("file", file);
    return http
      .post<{ data: UploadResult }>(`/admin/uploads/${bucket}`, form, {
        signal: opts?.signal,
        timeout: 0,
        onUploadProgress: (e) => {
          if (opts?.onProgress && e.total) {
            opts.onProgress(Math.min(100, Math.round((e.loaded / e.total) * 100)));
          }
        },
      })
      .then(unwrap);
  },
};
