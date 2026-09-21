import { FolderTree } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SousCategoriesManager from "@/components/admin/SousCategoriesManager";

export default function AdminSousCategoriesPage() {
  return (
    <div>
      <AdminPageHeader
        title="Sous-catégories"
        description="Rattachez chaque sous-catégorie à une catégorie existante."
        icon={FolderTree}
      />
      <SousCategoriesManager />
    </div>
  );
}
