import CategoriesManager from "@/components/admin/CategoriesManager";
import { getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <h2 className="mb-2 text-xl font-bold text-gray-900">Catégories</h2>
      <p className="mb-6 text-sm text-gray-500">
        Créez d&apos;abord une catégorie, puis ajoutez vos produits.
      </p>
      <CategoriesManager categories={categories} />
    </div>
  );
}
