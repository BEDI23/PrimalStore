"use client";
import { useMutation } from "@tanstack/react-query";
import { uploadsService, ageService } from "@/lib/api/services";
import type { UploadBucket } from "@/lib/api/types";

export function useUpload() {
  return useMutation({
    mutationFn: ({
      bucket,
      file,
      onProgress,
      signal,
    }: {
      bucket: UploadBucket;
      file: File;
      onProgress?: (percent: number) => void;
      signal?: AbortSignal;
    }) => uploadsService.upload(bucket, file, { onProgress, signal }),
  });
}

export function useConfirmAge() {
  return useMutation({
    mutationFn: () => ageService.confirm(),
  });
}
