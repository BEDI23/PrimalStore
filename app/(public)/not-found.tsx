import Link from "next/link";
import { SearchX } from "lucide-react";
import EmptyState from "@/components/client/EmptyState";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <EmptyState
        icon={SearchX}
        title="Page introuvable"
        description="La page que vous cherchez n'existe pas ou a été déplacée."
        action={
          <Link href="/" className="btn-primary">
            Retour à l&apos;accueil
          </Link>
        }
      />
    </div>
  );
}
