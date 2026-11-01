"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";

/**
 * <Image> avec repli : affiche `fallback` si `src` est null (absent ou
 * placeholder, déterminé par le parent via hasRealImage) ou si le chargement
 * échoue. Remplit son conteneur (`position: relative` requis).
 */
export default function SmartImage({
  src,
  alt,
  sizes,
  className = "",
  priority = false,
  fit = "cover",
  fallback,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** `contain` : image entière, jamais recadrée (fiche produit) */
  fit?: "cover" | "contain";
  fallback: ReactNode;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) return <>{fallback}</>;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`${fit === "contain" ? "object-contain" : "object-cover"} ${className}`}
      onError={() => setFailedSrc(src)}
    />
  );
}
