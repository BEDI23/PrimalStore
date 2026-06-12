import CommandesTable from "@/components/admin/CommandesTable";
import { getAllCommandes } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminCommandesPage() {
  const commandes = await getAllCommandes();

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-gray-900">Commandes</h2>
      <CommandesTable commandes={commandes} />
    </div>
  );
}
