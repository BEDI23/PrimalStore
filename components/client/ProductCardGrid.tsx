import type { ReactNode } from "react";

/** Grille produits unique : 2 colonnes mobile, 3 tablette, 4 desktop. */
export default function ProductCardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
      {children}
    </div>
  );
}
