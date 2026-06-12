import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";

export default function ClientPageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <Footer />
    </>
  );
}
