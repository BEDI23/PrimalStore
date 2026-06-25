import { http, unwrap } from "@/lib/api/http";
import type { UploadBucket, UploadResult } from "@/lib/api/types";

export const uploadsService = {
  // multipart/form-data, champ `file`. Le nom de fichier final est généré serveur.
  upload: (bucket: UploadBucket, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return http
      .post<{ data: UploadResult }>(`/admin/uploads/${bucket}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(unwrap);
  },
};
