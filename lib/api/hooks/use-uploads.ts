"use client";
import { useMutation } from "@tanstack/react-query";
import { uploadsService, ageService } from "@/lib/api/services";
import type { UploadBucket } from "@/lib/api/types";

export function useUpload() {
  return useMutation({
    mutationFn: ({ bucket, file }: { bucket: UploadBucket; file: File }) =>
      uploadsService.upload(bucket, file),
  });
}

export function useConfirmAge() {
  return useMutation({
    mutationFn: () => ageService.confirm(),
  });
}
