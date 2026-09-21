import { FolderOpen } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CategoriesManager from "@/components/admin/CategoriesManager";

export default function AdminCategoriesPage() {
  return (
    <div>
      <AdminPageHeader
        title="Catégories"
        description="Créez d'abord une catégorie, puis ajoutez vos produits."
        icon={FolderOpen}
      />
      <CategoriesManager />
    </div>
  );
}
