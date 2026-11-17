# CI/CD — Plamastore (front Next.js 16)

Deux responsabilités séparées :

| Rôle | Outil | Déclencheur |
|---|---|---|
| **Vérifier que ça build** | GitHub Actions (`ci.yml`) | Pull request, push sur `master`, manuel |
| **Déployer** | **Dokploy** | Chaque **tag** sur `master` |

GitHub Actions **ne déploie rien** : aucun push d'image, aucun accès SSH, aucun
secret de déploiement. L'API NestJS est un projet distinct, déployé séparément.

## Workflow CI (`.github/workflows/ci.yml`)

Un seul job, `build`, sur `ubuntu-latest` :
1. Checkout du dépôt.
2. Configuration de Docker Buildx.
3. `docker build` du `Dockerfile` à la racine, **sans push** (`push: false`),
   avec le cache GitHub Actions (`type=gha`).

C'est la même construction que Dokploy : si le CI est vert, l'image se
construira chez Dokploy. Le workflow ne lance ni lint, ni `tsc`, ni tests ; ils
restent disponibles en local :

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test        # Vitest
pnpm test:e2e    # Playwright
```

Un groupe `concurrency` annule les exécutions précédentes d'une même
branche/PR quand un nouveau push arrive.

Déclenchements : pull request vers `master`, push sur `master`,
`workflow_dispatch` (onglet **Actions → Run workflow**).

## Déploiement (Dokploy)

Dokploy construit et déploie l'application à chaque **tag** poussé sur
`master` :

```bash
git tag v1.2.3
git push origin v1.2.3
```

### Variables `NEXT_PUBLIC_*` : à mettre en *build args*
Next.js les **fige dans le code navigateur au moment du build**. Dans
**Dokploy → application front → Environment**, elles doivent donc être
déclarées comme **variables de build** (*Build Args*) : une variable
d'exécution seule est ignorée pour le code client. Le `Dockerfile` les déclare
en `ARG` :

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_META_PIXEL_ID` (optionnel : vide = pixel et bandeau cookies
  désactivés — voir `primal-api/docs/meta-pixel.md`)

Après modification de l'une d'elles, il faut **reconstruire** (nouveau tag) :
un simple redémarrage ne suffit pas.

## Dockerfile
L'image **n'utilise pas** `output: "standalone"` : le runtime copie les
`node_modules` de production, `.next` et `public`, puis lance `next start`
(voir `Dockerfile`).

## `docker-compose.prod.yml`
Conservé de l'ancien déploiement par SSH. Son usage avec Dokploy est à
confirmer ; s'il n'est plus utilisé, il peut être supprimé.
