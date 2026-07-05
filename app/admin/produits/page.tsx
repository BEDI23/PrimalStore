import Link from "next/link";
import ProduitsTable from "@/components/admin/ProduitsTable";
import { Plus, FolderOpen } from "lucide-react";

export default function AdminProduitsPage() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-ink">Produits</h2>
        <div className="flex gap-2">
          <Link
            href="/admin/categories"
            className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <FolderOpen className="h-4 w-4" />
            Catégories
          </Link>
          <Link
            href="/admin/produits/nouveau"
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Ajouter un produit
          </Link>
        </div>
      </div>
      <ProduitsTable />
    </div>
  );
}
