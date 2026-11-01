import { ShoppingCart } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CommandesTable from "@/components/admin/CommandesTable";

export default function AdminCommandesPage() {
  return (
    <div>
      <AdminPageHeader
        title="Commandes"
        description="Suivez et traitez les commandes de vos clients."
        icon={ShoppingCart}
      />
      <CommandesTable />
    </div>
  );
}
