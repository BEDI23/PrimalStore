# PrimalStore — Design System (refonte visuelle)

Source de vérité visuelle. Tout composant/page de la refonte suit ce document.
Stack : Next.js 14 (App Router) + Tailwind + lucide-react. Mobile-first.

## 1. Direction

**« Warm trustworthy commerce »** — boutique e-commerce locale (Lomé), confiance + chaleur,
clarté mobile d'abord. On garde l'identité orange/ink du logo et on l'élève :
surfaces claires et aérées, CTA orange, profondeur via ink, cards douces `rounded-2xl`,
hero sombre signature à halo orange. **Icônes lucide-react uniquement — jamais d'emoji.**

## 2. Couleurs (tokens Tailwind)

Garder les tokens existants (`primary`, `graphite`, `ink`) et AJOUTER :

```ts
// tailwind.config.ts → theme.extend.colors
surface: {
  DEFAULT: "#FFFFFF",   // cartes
  muted: "#FAF7F5",     // fond chaud de page (remplace gray-50)
  subtle: "#F4F1EF",    // zones secondaires
},
// Thème de catégorie piloté par CSS vars (set sur la page /categories/[slug])
cat: {
  primary: "var(--cat-primary)",
  hover:   "var(--cat-hover)",
  accent:  "var(--cat-accent)",
  on:      "var(--cat-on)",
},
```

Sémantique : `primary` = action principale (orange). `ink` = profondeur/hero/texte fort.
`graphite` = texte secondaire/bordures. `surface-muted` = fond de page (chaud, pas gris froid).
Contraste AA obligatoire (texte ≥ 4.5:1). Prix/nombres en `tabular-nums`.

**Per-category theming** : sur `/categories/[slug]`, un wrapper pose les CSS vars depuis
`categorie.theme` :
```tsx
style={{
  ["--cat-primary" as string]: theme.primary,
  ["--cat-hover" as string]: theme.primaryHover,
  ["--cat-accent" as string]: theme.accent,
  ["--cat-on" as string]: theme.onPrimary,
}}
```
Le header de catégorie, les chips actives et accents utilisent `bg-cat-primary`,
`text-cat-on`, `ring-cat-accent`. Fallback : si pas de thème, utiliser `primary`.

## 3. Typographie

- **Display (titres)** : `Sora` (geometric, moderne, confiant) via `next/font/google`,
  variable `--font-sora`. Poids 600/700. Classe utilitaire `font-display`.
- **Body** : `Inter` (existant), `--font-inter`.
- Échelle : 12 / 14 / 16(base) / 18 / 20 / 24 / 32 / 40 / 56. line-height body 1.5–1.6,
  titres 1.1–1.2, tracking titres `-0.02em`.
- Tailwind : ajouter `fontFamily.display: ["var(--font-sora)", ...]`. Titres `h1/h2` →
  `font-display font-bold tracking-tight`. Body → `font-sans`.

## 4. Effets / primitives

- Radius : cards `rounded-2xl` (16px), chips/badges `rounded-full`, inputs `rounded-xl`.
- Shadows : échelle cohérente — `shadow-sm` (cards repos), `shadow-md`→`shadow-lg` (hover),
  CTA orange `shadow-primary/30`. Pas de valeurs ad hoc.
- Transitions 150–250ms, `ease-out` à l'entrée. Hover card : `-translate-y-1` + shadow.
  Respecter `prefers-reduced-motion`.
- Focus visible partout : `focus:ring-2 focus:ring-primary focus:ring-offset-2`.

## 5. Composants (specs)

Utiliser les composant de shadcn/ui s'il fait adapte avec notre desgin, ne reinvente pas la se qui marche

- **Button** : garder `.btn-primary` (orange, `rounded-full`), `.btn-secondary` (outline),
  `.btn-dark` (ink). Ajouter variante `.btn-cat` (utilise `bg-cat-primary text-cat-on`).
  Touch target ≥ 44px (`py-3` mini). État `loading` (spinner) + `disabled` (opacity-50).
- **ProductCard** : card blanche `rounded-2xl`, image `aspect-square` `rounded-xl`,
  badge promo (rouge) OU `Nouveau`/`Bestseller` (ink) en overlay haut-gauche, titre
  `font-medium line-clamp-2`, prix `tabular-nums` (barré + promo rouge si `promotion`),
  CTA « Commander » pleine largeur. Icône lucide `ShoppingBag` sur le CTA.
- **CategoryCard** : card avec `coverImageUrl` en fond (ratio 4/3), overlay dégradé ink,
  chip icône (lucide via `iconName`) teintée `theme.primary`, nom en `font-display`,
  badge `18+` (rouge, coin haut-droit) si `isAdult`. Hover : léger zoom image + shadow.
  Lien vers `/categories/[slug]`.
- **FilterChips (sous-catégories)** : barre de chips `rounded-full` scrollable horizontale
  sur mobile ; chip active = `bg-cat-primary text-cat-on`, inactive = `bg-surface-subtle
  text-graphite`. Première chip « Tout ». Touch target ≥ 36px hauteur, gap ≥ 8px.
- **Navbar** : sticky, logo + liens `Catégories` (→ /categories), `À propos`, `Contact`,
  CTA `Commander` (→ /categories). Menu mobile (Sheet/Menu icône lucide) sous `sm`.
  Lien actif souligné/`text-primary`.
- **Footer** : ink soft, colonnes (marque + slogan, liens catégories top, contact WhatsApp
  avec icône lucide `MessageCircle`), mentions. Icônes lucide.
- **AgeGate modal** : overlay `bg-black/60` (scrim 40–60%), card centrée `rounded-2xl`,
  icône lucide `ShieldAlert`, titre « Avez-vous 18 ans ou plus ? », 2 boutons (`btn-primary`
  « J'ai 18 ans ou plus » / `btn-secondary` « Quitter »). Animée depuis le centre (scale+fade).
  Voir §7 pour la logique de déclenchement.
- **HeroSection** : garder `bg-brand-dark` + halo orange, remplacer les emojis (🛍️🛵💰)
  par icônes lucide (`ShoppingBag`, `Truck`, `Wallet`), titre `font-display`.

## 6. Layout des pages

- **/ (accueil)** : Hero → section « Nos catégories » (grille CategoryCard, 6 max + lien
  « Voir toutes les catégories ») → section « Sélection » (ProductCard, produits actifs non
  adultes) → WhyChooseUs (icônes lucide) → Footer.
- **/categories** : titre + sous-titre, grille responsive `grid-cols-2 md:grid-cols-3
  lg:grid-cols-4` de CategoryCard (toutes catégories actives, triées par `position`).
- **/categories/[slug]** : header thémé (cover/cover-tint, nom `font-display`, description,
  badge 18+ si adulte) → FilterChips sous-catégories → grille ProductCard filtrée
  (`?sous_categorie=slug` via query param, filtrage server). Empty state si 0 produit.
- Container `max-w-6xl px-4`. Grilles produits `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`.

## 7. Age gate — logique (changement de comportement)

Avant : modal au 1er chargement de tout le site. **Désormais** : modal UNIQUEMENT à l'accès
d'une catégorie `isAdult`.
- Démonter `<AgeGate />` global de `app/layout.tsx`.
- Sur `/categories/[slug]` où `categorie.isAdult === true` : si l'utilisateur n'a pas
  confirmé (flag `localStorage "primal-age-confirmed"`), afficher le modal en surimpression
  AVANT de révéler les produits. « J'ai 18+ » → `useConfirmAge().mutate()` + setItem + révèle.
  « Quitter » → `router.push("/categories")`.
- Dans la grille `/categories`, les CategoryCard `isAdult` montrent le badge `18+` ; le clic
  mène à la page catégorie qui gère le gate (pas de gate sur la grille elle-même).
- Catégories non adultes : aucun gate.

## 8. Règles non négociables (extrait SKILL ui-ux-pro-max)

- Mobile-first ; breakpoints 375/640/768/1024 ; pas de scroll horizontal (sauf chips
  volontairement scrollables avec affordance).
- Contraste AA (4.5:1 texte). Focus visible. Touch ≥ 44px, gap ≥ 8px.
- Icônes lucide cohérentes (stroke ~1.75), jamais d'emoji structurel.
- `next/image` avec dimensions/aspect-ratio (éviter CLS). `font-display: swap`.
- Animer transform/opacity seulement ; 150–300ms ; respecter reduced-motion.
- Un seul CTA principal par écran ; états loading/disabled/empty traités.
- Prix en `tabular-nums`.
