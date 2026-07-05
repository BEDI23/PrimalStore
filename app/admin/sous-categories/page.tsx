import SousCategoriesManager from "@/components/admin/SousCategoriesManager";

export default function AdminSousCategoriesPage() {
  return (
    <div>
      <h2 className="mb-2 font-display text-xl font-bold text-ink">Sous-catégories</h2>
      <p className="mb-6 text-sm text-graphite">
        Rattachez chaque sous-catégorie à une catégorie existante.
      </p>
      <SousCategoriesManager />
    </div>
  );
}
