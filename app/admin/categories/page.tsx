import CategoriesManager from "@/components/admin/CategoriesManager";

export default function AdminCategoriesPage() {
  return (
    <div>
      <h2 className="mb-2 text-xl font-bold text-gray-900">Catégories</h2>
      <p className="mb-6 text-sm text-gray-500">
        Créez d&apos;abord une catégorie, puis ajoutez vos produits.
      </p>
      <CategoriesManager />
    </div>
  );
}
