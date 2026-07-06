"use client";

import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { commandeSchema, type CommandeFormValues } from "@/lib/api/schemas";
import { useCreateCommande } from "@/lib/api/hooks";
import { getApiErrorMessage } from "@/lib/api";
import type { Produit } from "@/lib/api/types";
import { formatPrix } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CommandeForm({ produit }: { produit: Produit }) {
  const router = useRouter();
  const { mutate: createCommande, isPending } = useCreateCommande();

  const prixFinal = produit.promotion ? produit.promotion.prixPromo : produit.prix;

  const form = useForm<CommandeFormValues>({
    resolver: valibotResolver(commandeSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      produitId: produit.id,
      clientNom: "",
      clientTelephone: "",
      quartier: "",
      quantite: 1,
      message: "",
    },
  });

  const quantite = form.watch("quantite");
  const quantiteValide = Number.isFinite(quantite) && quantite > 0 ? quantite : 1;
  const prixTotal = prixFinal * quantiteValide;

  function onSubmit(values: CommandeFormValues) {
    createCommande(
      {
        ...values,
        message: values.message?.trim() || undefined,
        prixAttendu: prixFinal,
      },
      {
        onSuccess: () => router.push("/confirmation"),
        onError: (err) => {
          const message = getApiErrorMessage(err);
          form.setError("root", { message });
          toast.error(message);
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
        aria-busy={isPending}
      >
        <input
          type="hidden"
          {...form.register("produitId", { valueAsNumber: true })}
        />

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-graphite">Produit sélectionné</p>
          <p className="font-display text-lg font-semibold text-ink">
            {produit.nom}
          </p>
          <p className="text-primary font-bold tabular-nums">
            {formatPrix(prixTotal)}
          </p>
        </div>

        <FormField
          control={form.control}
          name="clientNom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nom complet <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  autoComplete="name"
                  placeholder="Votre nom complet"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientTelephone"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>
                Téléphone <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+22890123456"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              {fieldState.error ? (
                <FormMessage />
              ) : (
                <FormDescription>Format : +228XXXXXXXX</FormDescription>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quartier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Quartier / zone de livraison{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Adidogomé, Tokoin..."
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantité</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  className="w-24 tabular-nums"
                  disabled={isPending}
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? 0 : e.target.valueAsNumber
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message (optionnel)</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Instructions de livraison..."
                  className="resize-none"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root?.message ? (
          <Alert variant="destructive">
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          disabled={isPending}
          aria-disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Envoi en cours…
            </>
          ) : (
            "Commander maintenant"
          )}
        </Button>
      </form>
    </Form>
  );
}
