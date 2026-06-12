import Link from "next/link";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-gray-600">Page introuvable.</p>
        <Link href="/" className="btn-primary mt-8 inline-flex">
          Retour à l&apos;accueil
        </Link>
      </main>
      <Footer />
    </>
  );
}
