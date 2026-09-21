import type { Categorie } from "@/lib/api/types";
import CategoryCard from "./CategoryCard";

/**
 * Grille de catégories : 2 colonnes dès le mobile (comme les produits), 3 desktop.
 * En flex-wrap centré pour que la dernière ligne incomplète reste équilibrée
 * (nombre impair de catégories).
 */
export default function CategoryGrid({
  categories,
}: {
  categories: Categorie[];
}) {
  return (
    <ul className="flex flex-wrap justify-center gap-3 sm:gap-5">
      {categories.map((categorie) => (
        <li
          key={categorie.id}
          className="w-[calc(50%-0.375rem)] sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.85rem)]"
        >
          <CategoryCard categorie={categorie} />
        </li>
      ))}
    </ul>
  );
}
