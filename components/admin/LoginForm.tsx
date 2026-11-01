"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Package,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { BOUTIQUE_NOM } from "@/lib/constants";
import { loginSchema, type LoginFormValues } from "@/lib/api/schemas";
import { useLogin } from "@/lib/api/hooks/use-auth";
import { getApiError, getApiErrorMessage } from "@/lib/api/http";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const HIGHLIGHTS = [
  { icon: ShoppingCart, label: "Suivez et traitez vos commandes" },
  { icon: Package, label: "Gérez produits, catégories et promotions" },
  { icon: ShieldCheck, label: "Accès réservé à l'équipe autorisée" },
];

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: valibotResolver(loginSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      form.setError("root", {
        message: "Accès refusé. Ce compte n'est pas autorisé.",
      });
    }
  }, [searchParams, form]);

  async function onSubmit(values: LoginFormValues) {
    try {
      await login.mutateAsync({
        email: values.email,
        password: values.password,
      });
      router.push("/admin/dashboard");
      router.refresh();
    } catch (error) {
      // 401 au login = identifiants refusés (pas une session expirée).
      const message =
        getApiError(error).status === 401
          ? "Email ou mot de passe incorrect."
          : getApiErrorMessage(error);
      form.setError("root", { message });
      toast.error(message);
    }
  }

  const { isSubmitting, errors } = form.formState;

  return (
    <div className="grid min-h-screen bg-surface-muted lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* Panneau de marque (desktop) */}
      <aside className="bg-brand-dark relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative flex items-center gap-3">
          <Image
            src="/logo.jpeg"
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 rounded-xl object-cover ring-2 ring-primary/40"
            priority
          />
          <span className="font-display text-lg font-bold">{BOUTIQUE_NOM}</span>
        </div>

        <div className="relative max-w-md animate-in fade-in-0 slide-in-from-bottom-3 duration-700">
          <p className="eyebrow text-primary-light">Espace administration</p>
          <h2 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight">
            Pilotez votre boutique en toute simplicité.
          </h2>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-white/75">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
                  <Icon className="h-4 w-4 text-primary-light" aria-hidden />
                </span>
                <span className="text-sm">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} {BOUTIQUE_NOM} · Lomé, Togo
        </p>
      </aside>

      {/* Panneau formulaire */}
      <main className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-graphite transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Retour à la boutique
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
            <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
              <Image
                src="/logo.jpeg"
                alt={BOUTIQUE_NOM}
                width={56}
                height={56}
                className="mb-5 h-14 w-14 rounded-2xl object-cover shadow-layered ring-2 ring-primary/30 lg:hidden"
                priority
              />
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Connexion admin
              </h1>
              <p className="mt-2 text-sm text-graphite">
                Entrez vos identifiants pour accéder au back-office.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
                noValidate
                aria-busy={isSubmitting}
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <div className="relative">
                        <Mail
                          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-light"
                          aria-hidden
                        />
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder="admin@example.com"
                            disabled={isSubmitting}
                            className="bg-card pl-10"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <div className="relative">
                        <Lock
                          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-light"
                          aria-hidden
                        />
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            disabled={isSubmitting}
                            className="bg-card px-10"
                            {...field}
                          />
                        </FormControl>
                        {/* Libellé sans « mot de passe » : évite l'ambiguïté avec le champ pour getByLabelText */}
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={
                            showPassword ? "Masquer la saisie" : "Afficher la saisie"
                          }
                          aria-pressed={showPassword}
                          disabled={isSubmitting}
                          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-graphite transition-colors hover:bg-muted hover:text-ink disabled:opacity-50"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {errors.root?.message ? (
                  <Alert
                    variant="destructive"
                    className="animate-in fade-in-0 slide-in-from-top-1 duration-200"
                  >
                    <AlertDescription>{errors.root.message}</AlertDescription>
                  </Alert>
                ) : null}
                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full text-sm font-semibold"
                  disabled={isSubmitting}
                  aria-disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Connexion…
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}
