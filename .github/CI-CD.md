# CI/CD — Plamastore (front Next.js 16)

Ce document décrit le pipeline d'intégration et de déploiement continu du front
Next.js. L'API NestJS est un service distinct, déployé séparément.

## Vue d'ensemble

Deux workflows GitHub Actions :

- **`.github/workflows/ci.yml`** — CI, déclenché sur pull request et push vers
  `master` (+ déclenchement manuel).
- **`.github/workflows/deploy.yml`** — CD, déclenché sur push vers `master`
  (+ déclenchement manuel).

L'image Docker **n'utilise pas** `output: "standalone"` de Next.js : le runtime
copie les `node_modules` de production, `.next` et `public`, puis lance
`next start` classiquement (voir `Dockerfile`).

## Workflow CI (`ci.yml`)

Trois jobs :

1. **`quality`** — installe les dépendances (`pnpm install --frozen-lockfile`),
   puis lance `pnpm lint`, `pnpm exec tsc --noEmit` et `pnpm test` (Vitest).
2. **`build`** (dépend de `quality`) — lance `pnpm build`. Les variables
   `NEXT_PUBLIC_*` sont injectées depuis les *repo variables* GitHub, mais le
   code ayant déjà des valeurs de fallback en production, le build passe même
   si ces variables sont vides.
3. **`e2e`** (dépend de `quality`, **non bloquant** via `continue-on-error: true`)
   — installe Playwright (Chromium uniquement) et lance `pnpm exec playwright test`.
   Le rapport HTML (`playwright-report/`) est publié en artefact, que le job
   réussisse ou échoue.

Un échec du job `e2e` n'empêche donc pas le workflow CI de passer au vert,
mais reste visible et consultable via l'artefact.

## Workflow Deploy (`deploy.yml`)

Deux jobs :

1. **`build-and-push`** — construit l'image Docker (`Dockerfile`, contexte
   racine) via Buildx, avec cache GitHub Actions (`type=gha`), puis la pousse
   sur **GHCR** (`ghcr.io/<owner>/plamastore`) avec deux tags : `latest` et
   `sha-<sha40>`. Les 4 variables `NEXT_PUBLIC_*` sont passées en `build-args`
   (elles sont inlinées dans le bundle client au moment du build Next.js).
2. **`deploy`** (dépend de `build-and-push`) — copie `docker-compose.prod.yml`
   sur le VPS via SCP, puis se connecte en SSH pour :
   - se connecter à GHCR (`docker login`),
   - écrire un fichier `.env` avec `IMAGE=<image>:sha-<sha>` à côté du compose,
   - `docker compose -f docker-compose.prod.yml pull && ... up -d`,
   - nettoyer les anciennes images (`docker image prune -f`).

## Secrets GitHub requis

À configurer dans **Settings → Secrets and variables → Actions → Secrets** :

| Secret | Description |
|---|---|
| `VPS_SSH_HOST` | Adresse (IP ou nom d'hôte) du VPS de production. |
| `VPS_SSH_USER` | Utilisateur SSH utilisé pour le déploiement. |
| `VPS_SSH_KEY` | Clé privée SSH (format PEM) associée à `VPS_SSH_USER`. |
| `VPS_SSH_PORT` | *(optionnel)* Port SSH. Défaut : `22` si absent. |
| `GHCR_USERNAME` | Nom d'utilisateur GitHub utilisé pour le `docker login` sur le VPS. |
| `GHCR_TOKEN` | Personal Access Token (classic) avec le scope `read:packages`, pour que le VPS puisse `pull` l'image depuis GHCR. |

`GITHUB_TOKEN` (fourni automatiquement par GitHub Actions) est utilisé pour le
push vers GHCR depuis le runner CI — aucune configuration nécessaire pour ça.

## Repo variables (optionnelles)

À configurer dans **Settings → Secrets and variables → Actions → Variables**
si vous voulez surcharger les valeurs de fallback déjà présentes dans le code :

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_CONTACT_EMAIL`

Si ces variables ne sont pas définies, le build et l'image utilisent les
fallbacks déjà codés en dur pour la production.

## Pré-requis sur le VPS

- **Docker** + **Docker Compose** (plugin `docker compose`, v2) installés.
- L'utilisateur SSH utilisé pour le déploiement (`VPS_SSH_USER`) doit être
  membre du groupe `docker` (pour exécuter `docker` sans `sudo`).
- Un dossier `~/plamastore/` accessible en écriture par cet utilisateur (créé
  automatiquement au premier déploiement par l'étape SCP si absent selon la
  configuration du serveur SSH ; sinon, le créer manuellement au préalable).
- Un **reverse-proxy** (Nginx ou Caddy) déjà en place devant le conteneur,
  routant vers `127.0.0.1:3000` et terminant le TLS (le service `web` du
  compose n'expose le port que sur `127.0.0.1`, jamais publiquement).

## Déclenchement manuel

Les deux workflows supportent `workflow_dispatch` : depuis l'onglet
**Actions** du dépôt GitHub, sélectionner le workflow concerné puis
**Run workflow** pour le déclencher manuellement (utile pour re-déployer sans
nouveau commit, ou pour rejouer la CI).
