"use client";

import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useRouter } from "next/navigation";
import {
  Loader2,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { commandeSchema, type CommandeFormValues } from "@/lib/api/schemas";
import { useCreateCommande } from "@/lib/api/hooks";
import { getApiErrorMessage } from "@/lib/api";
import type { Produit } from "@/lib/api/types";
import { hasRealImage } from "@/lib/images";
import { formatPrix, toTelephoneE164 } from "@/lib/utils";
import { LAST_COMMANDE_STORAGE_KEY } from "@/lib/constants";
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
import ImageFallback from "./ImageFallback";
import SmartImage from "./SmartImage";

/** Pastille numérotée + titre d'une section du formulaire */
function SectionTitle({ step, children }: { step: number; children: string }) {
  return (
    <h2 className="flex items-center gap-2.5 font-display text-base font-semibold text-ink">
      <span
        aria-hidden="true"
        className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-dark"
      >
        {step}
      </span>
      {children}
    </h2>
  );
}

export default function CommandeForm({ produit }: { produit: Produit }) {
  const router = useRouter();
  const { mutate: createCommande, isPending } = useCreateCommande();

  const promo = produit.promotion;
  const prixFinal = promo ? promo.prixPromo : produit.prix;
  const image = hasRealImage(produit.imageUrl) ? produit.imageUrl : null;

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
        clientTelephone: toTelephoneE164(values.clientTelephone),
        message: values.message?.trim() || undefined,
        prixAttendu: prixFinal,
      },
      {
        onSuccess: (data) => {
          try {
            sessionStorage.setItem(LAST_COMMANDE_STORAGE_KEY, JSON.stringify(data));
          } catch {
            // Storage indisponible (navigation privée, quota…) : on ignore,
            // la commande a bien été créée côté serveur.
          }
          router.push("/confirmation");
        },
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
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-8"
        noValidate
        aria-busy={isPending}
      >
        <input
          type="hidden"
          {...form.register("produitId", { valueAsNumber: true })}
        />

        {/* Récapitulatif : en tête sur mobile, colonne fixe à droite sur desktop */}
        <aside className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5 lg:sticky lg:top-24 lg:order-2">
          <p className="eyebrow">Votre commande</p>

          <div className="mt-3 flex gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-subtle sm:h-24 sm:w-24">
              <SmartImage
                src={image}
                alt=""
                sizes="96px"
                fallback={
                  <ImageFallback icon={ShoppingBag} tone="light" label={produit.nom} />
                }
              />
            </div>
            <div className="min-w-0">
              <p className="line-clamp-2 break-words font-display text-base font-semibold leading-snug text-ink">
                {produit.nom}
              </p>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-2 tabular-nums">
                <span
                  className={`text-sm font-semibold ${
                    promo ? "text-primary-dark" : "text-graphite-dark"
                  }`}
                >
                  {`${formatPrix(prixFinal)} l'unité`}
                </span>
                {promo && (
                  <span className="text-xs text-graphite-light line-through">
                    {formatPrix(produit.prix)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="quantite"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Quantité</FormLabel>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 shrink-0 rounded-xl"
                    aria-label="Retirer un"
                    disabled={isPending || quantiteValide <= 1}
                    onClick={() => field.onChange(quantiteValide - 1)}
                  >
                    <Minus className="h-4 w-4" aria-hidden />
                  </Button>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      className="bg-card text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      disabled={isPending}
                      {...field}
                      value={Number.isNaN(field.value) ? "" : field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? NaN : e.target.valueAsNumber
                        )
                      }
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 shrink-0 rounded-xl"
                    aria-label="Ajouter un"
                    disabled={isPending}
                    onClick={() => field.onChange(quantiteValide + 1)}
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-5 flex items-baseline justify-between border-t border-dashed border-border pt-4">
            <span className="text-sm font-medium text-graphite">Total</span>
            <span className="font-display text-2xl font-bold tabular-nums text-primary-dark">
              {formatPrix(prixTotal)}
            </span>
          </div>
        </aside>

        <div className="space-y-6 lg:order-1">
          <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6">
            <SectionTitle step={1}>Vos coordonnées</SectionTitle>

            <FormField
              control={form.control}
              name="clientNom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nom complet <span className="text-destructive">*</span>
                  </FormLabel>
                  <div className="relative">
                    <User
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-light"
                      aria-hidden
                    />
                    <FormControl>
                      <Input
                        autoComplete="name"
                        placeholder="Votre nom complet"
                        disabled={isPending}
                        className="pl-10"
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
              name="clientTelephone"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>
                    Téléphone <span className="text-destructive">*</span>
                  </FormLabel>
                  <div className="relative">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 left-0 flex items-center rounded-l-xl border-r border-input bg-muted px-3.5 text-sm text-muted-foreground"
                    >
                      +228
                    </span>
                    <FormControl>
                      <Input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="90 12 34 56"
                        disabled={isPending}
                        className="pl-16"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  {fieldState.error ? (
                    <FormMessage />
                  ) : (
                    <FormDescription>Format : 8 chiffres, sans indicatif</FormDescription>
                  )}
                </FormItem>
              )}
            />
          </section>

          <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6">
            <SectionTitle step={2}>Livraison</SectionTitle>

            <FormField
              control={form.control}
              name="quartier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Quartier / zone de livraison{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <div className="relative">
                    <MapPin
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-light"
                      aria-hidden
                    />
                    <FormControl>
                      <Input
                        placeholder="Ex. : Adidogomé, Tokoin…"
                        disabled={isPending}
                        className="pl-10"
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
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Instructions de livraison…"
                      className="resize-none"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {form.formState.errors.root?.message ? (
            <Alert
              variant="destructive"
              className="animate-in fade-in-0 slide-in-from-top-1 duration-200"
            >
              <AlertDescription>
                {form.formState.errors.root.message}
              </AlertDescription>
            </Alert>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="h-12 w-full text-base font-semibold"
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
        </div>
      </form>
    </Form>
  );
}
