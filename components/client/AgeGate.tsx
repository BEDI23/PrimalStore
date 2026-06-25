"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useConfirmAge } from "@/lib/api/hooks";

const KEY = "primal-age-confirmed";

export function AgeGate() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { mutate: confirmAge } = useConfirmAge();

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (!localStorage.getItem(KEY)) {
      setOpen(true);
    }
  }, [pathname]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-3 text-center text-2xl font-bold text-gray-900">
          Avez-vous 18 ans ou plus ?
        </h2>
        <p className="mb-6 text-center text-sm text-gray-600">
          L&apos;accès à ce site est réservé aux personnes majeures. En
          continuant, vous confirmez avoir au moins 18 ans.
        </p>
        <div className="flex flex-col gap-3">
          <button
            className="btn-primary w-full"
            onClick={() => {
              confirmAge();
              localStorage.setItem(KEY, "1");
              setOpen(false);
            }}
          >
            J&apos;ai 18 ans ou plus
          </button>
          <button
            className="btn-secondary w-full"
            onClick={() => {
              window.location.href = "https://www.google.com";
            }}
          >
            Quitter
          </button>
        </div>
      </div>
    </div>
  );
}
