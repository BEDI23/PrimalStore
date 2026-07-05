import SousCategoriesManager from "@/components/admin/SousCategoriesManager";

export default function AdminSousCategoriesPage() {
  return (
    <div>
      <h2 className="mb-2 text-xl font-bold text-gray-900">Sous-catégories</h2>
      <p className="mb-6 text-sm text-gray-500">
        Rattachez chaque sous-catégorie à une catégorie existante.
      </p>
      <SousCategoriesManager />
    </div>
  );
}
