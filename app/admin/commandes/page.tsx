import CommandesTable from "@/components/admin/CommandesTable";

export default function AdminCommandesPage() {
  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-bold text-ink">Commandes</h2>
      <CommandesTable />
    </div>
  );
}
