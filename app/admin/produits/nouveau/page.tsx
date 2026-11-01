import { PackagePlus } from "lucide-react";
import ProduitForm from "@/components/admin/ProduitForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default function NouveauProduitPage() {
  return (
    <div>
      <AdminPageHeader
        title="Ajouter un produit"
        description="Renseignez les informations du nouveau produit."
        icon={PackagePlus}
      />
      <ProduitForm />
    </div>
  );
}
