"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Une erreur est survenue</h1>
      <p className="mt-2 max-w-md text-gray-500">
        Désolé, quelque chose s&apos;est mal passé. Vous pouvez réessayer.
      </p>
      <button onClick={reset} className="btn-primary mt-6">
        Réessayer
      </button>
    </div>
  );
}
