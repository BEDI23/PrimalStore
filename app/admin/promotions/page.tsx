import { Tag } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PromotionsManager from "@/components/admin/PromotionsManager";

export default function AdminPromotionsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Promotions"
        description="Gérez les prix promotionnels de vos produits."
        icon={Tag}
      />
      <PromotionsManager />
    </div>
  );
}
