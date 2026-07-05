import CategoriesManager from "@/components/admin/CategoriesManager";

export default function AdminCategoriesPage() {
  return (
    <div>
      <h2 className="mb-2 font-display text-xl font-bold text-ink">Catégories</h2>
      <p className="mb-6 text-sm text-graphite">
        Créez d&apos;abord une catégorie, puis ajoutez vos produits.
      </p>
      <CategoriesManager />
    </div>
  );
}
