import Link from "next/link";
import ProduitsTable from "@/components/admin/ProduitsTable";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Plus, FolderOpen, Package } from "lucide-react";

export default function AdminProduitsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Produits"
        description="Gérez votre catalogue."
        icon={Package}
        actions={
          <>
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
          </>
        }
      />
      <ProduitsTable />
    </div>
  );
}
