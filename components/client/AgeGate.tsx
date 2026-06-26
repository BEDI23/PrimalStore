"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useConfirmAge } from "@/lib/api/hooks";

const KEY = "primal-age-confirmed";

export default function AgeGate({
  isAdult,
  children,
}: {
  isAdult: boolean;
  children: React.ReactNode;
}) {
  // État initial à false : SSR-safe, évite de révéler le contenu adulte avant hydratation.
  const [confirmed, setConfirmed] = useState(false);
  const router = useRouter();
  const { mutate: confirmAge } = useConfirmAge();

  useEffect(() => {
    if (!isAdult) return;
    if (localStorage.getItem(KEY)) {
      setConfirmed(true);
    }
  }, [isAdult]);

  // Catégorie non adulte : pas de gate.
  if (!isAdult) {
    return <>{children}</>;
  }

  // Adulte + confirmé : révèle le contenu.
  if (confirmed) {
    return <>{children}</>;
  }

  // Adulte + non confirmé : overlay de protection (le contenu adulte reste masqué).
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="agegate-title"
    >
      <div
        className={[
          "w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl",
          "motion-safe:animate-[scale-in_200ms_ease-out]",
          "motion-reduce:transition-none",
        ].join(" ")}
        style={
          {
            "--tw-scale-in-from": "0.92",
          } as React.CSSProperties
        }
      >
        <div className="mb-4 flex justify-center">
          <ShieldAlert
            className="h-10 w-10 text-red-500"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>

        <h2
          id="agegate-title"
          className="mb-3 text-center font-display text-2xl font-bold text-ink"
        >
          Avez-vous 18 ans ou plus ?
        </h2>

        <p className="mb-6 text-center text-sm text-graphite">
          Cette catégorie est réservée aux personnes majeures. Confirmez votre
          âge pour accéder au contenu.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => {
              confirmAge();
              localStorage.setItem(KEY, "1");
              setConfirmed(true);
            }}
          >
            J&apos;ai 18 ans ou plus
          </button>

          <button
            type="button"
            className="btn-secondary w-full"
            onClick={() => {
              router.push("/categories");
            }}
          >
            Quitter
          </button>
        </div>
      </div>
    </div>
  );
}
