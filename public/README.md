# Dossier `public/`

Tout ce qui est ici est servi **statiquement à la racine du site** par Next.js.

| Fichier sur disque                 | URL publique                  |
| ---------------------------------- | ----------------------------- |
| `public/logo.jpeg`                 | `/logo.jpeg`                  |
| `public/images/banniere.jpg`       | `/images/banniere.jpg`        |
| `public/robots.txt`                | `/robots.txt`                 |

## Conventions

- **`images/`** — visuels statiques de marque (bannières, illustrations, icônes décoratives).
- **`icons/`** — favicon, icônes PWA, apple-touch-icon.
- Les **images produits** ne vont **pas** ici : elles sont hébergées sur Supabase Storage
  et référencées via `image_url` (voir `next.config.mjs` → `remotePatterns`).

## Utilisation dans le code

```tsx
import Image from "next/image";

// Chemin absolu depuis la racine du site (pas d'import du fichier)
<Image src="/logo.jpeg" alt="PrimalStore" width={40} height={40} />
```

```css
/* En CSS */
background-image: url("/images/banniere.jpg");
```

## Favicon

Dans Next.js (App Router), le plus simple est de poser `app/icon.png` (ou `.svg`) et
`app/apple-icon.png` — Next génère les balises `<link>` automatiquement. Sinon, place
`favicon.ico` ici dans `public/`.
