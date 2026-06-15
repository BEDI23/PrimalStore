"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Leaf } from "lucide-react";
import { BOUTIQUE_NOM } from "@/lib/constants";
import { loginSchema, type LoginFormValues } from "@/lib/schemas";
import LoadingButton from "@/components/ui/LoadingButton";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: valibotResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      setError("root", {
        message: "Accès refusé. Ce compte n'est pas autorisé.",
      });
    }
  }, [searchParams, setError]);

  async function onSubmit(values: LoginFormValues) {
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (authError || !data.user) {
      setError("root", { message: "Email ou mot de passe incorrect." });
      return;
    }

    const { data: admin } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!admin) {
      await supabase.auth.signOut();
      setError("root", { message: "Accès refusé. Ce compte n'est pas autorisé." });
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Leaf className="h-8 w-8 text-primary" />
          <span className="text-lg font-bold">{BOUTIQUE_NOM}</span>
        </div>
        <h1 className="mb-6 text-center text-xl font-semibold text-gray-900">
          Connexion admin
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="input-field"
              placeholder="admin@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className="input-field"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>
          {errors.root && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {errors.root.message}
            </p>
          )}
          <LoadingButton
            loading={isSubmitting}
            loadingText="Connexion..."
            className="btn-primary w-full"
          >
            Se connecter
          </LoadingButton>
        </form>
      </div>
    </div>
  );
}
