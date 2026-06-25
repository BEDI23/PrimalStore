import CommandesTable from "@/components/admin/CommandesTable";

export default function AdminCommandesPage() {
  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-gray-900">Commandes</h2>
      <CommandesTable />
    </div>
  );
}
