import PageHeader from "@/components/client/PageHeader";
import ManageCookiesButton from "@/components/client/ManageCookiesButton";
import { BOUTIQUE_NOM } from "@/lib/constants";
import { getContactEmail } from "@/lib/contact";

export const metadata = {
  title: `Politique de confidentialité — ${BOUTIQUE_NOM}`,
  description: `Comment ${BOUTIQUE_NOM} collecte, utilise et protège vos données personnelles, et comment gérer vos cookies.`,
};

const sectionTitle = "font-display text-xl font-semibold text-ink";
const para = "mt-3 text-sm leading-relaxed text-graphite";
const list = "mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-graphite";

export default function ConfidentialitePage() {
  const email = getContactEmail();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        eyebrow="Confidentialité"
        title="Politique de confidentialité"
        description={`Dernière mise à jour : novembre 2026. ${BOUTIQUE_NOM} respecte votre vie privée et vous explique ici l'usage de vos données.`}
      />

      <div className="mt-8 space-y-9">
        <section>
          <h2 className={sectionTitle}>1. Qui est responsable de vos données ?</h2>
          <p className={para}>
            {BOUTIQUE_NOM}, boutique en ligne basée à Lomé (Togo), est
            responsable du traitement de vos données. Pour toute question ou
            demande, écrivez-nous à{" "}
            <a className="font-medium text-primary-dark underline" href={`mailto:${email}`}>
              {email}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className={sectionTitle}>2. Données collectées lors d&apos;une commande</h2>
          <p className={para}>
            Quand vous passez commande, nous collectons uniquement ce qui est
            nécessaire pour la traiter et vous livrer :
          </p>
          <ul className={list}>
            <li>votre nom complet ;</li>
            <li>votre numéro de téléphone (pour confirmer la commande par WhatsApp ou appel) ;</li>
            <li>votre quartier de livraison ;</li>
            <li>le produit, la quantité et, si vous en ajoutez un, votre message.</li>
          </ul>
          <p className={para}>
            Ces données servent à la gestion de la commande, à la livraison et
            au service client. Elles sont conservées le temps nécessaire à ces
            finalités et à nos obligations légales.
          </p>
        </section>

        <section>
          <h2 className={sectionTitle}>3. Cookies et mesure publicitaire (Meta)</h2>
          <p className={para}>
            Avec votre accord uniquement, nous utilisons le Pixel Meta
            (Facebook / Instagram) et l&apos;API de conversions de Meta pour
            mesurer l&apos;efficacité de nos publicités et les présenter à des
            personnes susceptibles d&apos;être intéressées.
          </p>
          <p className={para}>Si vous acceptez, Meta peut recevoir :</p>
          <ul className={list}>
            <li>les pages consultées et les actions effectuées (fiche produit, début de commande, commande passée) ;</li>
            <li>le montant et le produit de la commande ;</li>
            <li>
              des identifiants techniques (cookies <code>_fbp</code> /{" "}
              <code>_fbc</code>, adresse IP, navigateur) ;
            </li>
            <li>
              votre nom et votre numéro de téléphone, <strong>transformés en
              empreinte illisible (hachage SHA-256)</strong> avant l&apos;envoi,
              pour associer la commande à votre compte Meta s&apos;il existe.
            </li>
          </ul>
          <p className={para}>
            Si vous refusez, aucun cookie Meta n&apos;est déposé et aucune donnée
            n&apos;est envoyée à Meta : la boutique fonctionne exactement de la
            même façon. Les produits réservés aux personnes majeures sont
            exclus de ce suivi.
          </p>
          <p className={para}>
            Vous pouvez changer d&apos;avis à tout moment :{" "}
            <ManageCookiesButton className="font-medium text-primary-dark underline" />
            .
          </p>
        </section>

        <section>
          <h2 className={sectionTitle}>4. Partage de vos données</h2>
          <p className={para}>
            Nous ne vendons pas vos données. Elles ne sont communiquées qu&apos;à
            nos prestataires techniques (hébergement, envoi d&apos;e-mails) et,
            si vous y avez consenti, à Meta Platforms pour la mesure
            publicitaire décrite ci-dessus. Meta peut traiter ces données hors
            du Togo, selon sa propre politique de confidentialité.
          </p>
        </section>

        <section>
          <h2 className={sectionTitle}>5. Vos droits</h2>
          <p className={para}>
            Conformément à la législation togolaise sur la protection des
            données personnelles, vous disposez d&apos;un droit d&apos;accès, de
            rectification, d&apos;opposition et de suppression de vos données,
            ainsi que du droit de retirer votre consentement à tout moment.
            Écrivez-nous à{" "}
            <a className="font-medium text-primary-dark underline" href={`mailto:${email}`}>
              {email}
            </a>{" "}
            en précisant le nom et le numéro de téléphone utilisés pour la
            commande. Vous pouvez aussi saisir l&apos;autorité de protection des
            données personnelles du Togo (IPDCP).
          </p>
        </section>

        <section>
          <h2 className={sectionTitle}>6. Évolution de cette politique</h2>
          <p className={para}>
            Nous pouvons mettre à jour cette page ; la date de dernière mise à
            jour figure en haut.
          </p>
        </section>
      </div>
    </div>
  );
}
