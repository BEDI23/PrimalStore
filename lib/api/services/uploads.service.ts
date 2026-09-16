import { http, unwrap } from "@/lib/api/http";
import type { UploadBucket, UploadResult } from "@/lib/api/types";

export const uploadsService = {
  // multipart/form-data, champ `file`. Le nom de fichier final est généré serveur.
  // Content-Type NON fixé ici : le navigateur/axios doit le générer depuis le
  // FormData pour inclure le boundary (un header codé en dur casse le parsing multer côté API).
  upload: (bucket: UploadBucket, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return http
      .post<{ data: UploadResult }>(`/admin/uploads/${bucket}`, form)
      .then(unwrap);
  },
};
