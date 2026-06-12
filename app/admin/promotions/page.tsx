import PromotionsManager from "@/components/admin/PromotionsManager";
import { getAllPromotions, getAllProduits } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const [promotions, produits] = await Promise.all([
    getAllPromotions(),
    getAllProduits(),
  ]);

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-gray-900">Promotions</h2>
      <PromotionsManager promotions={promotions} produits={produits} />
    </div>
  );
}
