# PrimalStore — E-commerce produits thérapeutiques naturels

Boutique en ligne PrimalStore pour vendre des produits thérapeutiques naturels à Lomé, Togo.

**Stack :** Next.js 14 (App Router) · Tailwind CSS · Supabase · Vercel

## Fonctionnalités

### Site client (public)
- Accueil avec hero, promotions et produits vedettes
- Catalogue avec filtre promotions
- Détail produit et formulaire de commande

### Back-office admin (protégé)
- Authentification Supabase
- Dashboard avec statistiques et graphique (recharts)
- Gestion produits (CRUD + upload images)
- Gestion commandes (changement de statut au clic)
- Gestion promotions

## Prérequis

- Node.js 18+ et npm
- Un compte [Supabase](https://supabase.com) (gratuit)
- Le **Supabase CLI** : inclus en dépendance du projet, on l'utilise via `npx supabase …` ou les scripts `npm run db:*` ci-dessous (aucune installation globale nécessaire)

## Installation (de zéro)

### 1. Cloner et installer les dépendances

```bash
git clone <url-du-repo>
cd PrimalStore
npm install
```

### 2. Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com) → **New project**
2. Choisir une organisation, un nom (ex. `primalstore`), un mot de passe de base de données (à conserver) et une région proche (ex. *West EU*)
3. Attendre la fin de la création (~2 min)

### 3. Récupérer les clés et configurer l'environnement

Dans le dashboard du projet :
- **Project Settings → API** : récupérer l'**URL du projet**, la clé **anon/public** et la clé **service_role** (secrète)
- **Project Settings → General** : récupérer le **Reference ID** (`project ref`, ex. `abcdefghijklmnop`)

Puis créer le fichier d'environnement :

```bash
cp .env.local.example .env.local
```

Renseigner dans `.env.local` :

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Numéro WhatsApp public affiché sur le site |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Email affiché sur la page Contact |

### 4. Initialiser la base de données (migrations)

Le schéma (tables, RLS, buckets de stockage) est versionné dans `supabase/migrations/`. On le pousse vers le projet distant avec le CLI :

```bash
# Se connecter au CLI (ouvre le navigateur la 1re fois)
npx supabase login

# Lier le repo local au projet distant (demande le project ref)
npx supabase link --project-ref <votre-project-ref>

# Appliquer toutes les migrations sur la base distante
npm run db:push
```

`db:push` crée les tables (`admin_users`, `categories`, `produits`, `commandes`, `promotions`), active les politiques RLS sécurisées (fonction `is_admin()`) et provisionne les buckets de stockage `produits` et `videos`.

### 5. (Optionnel) Générer les types TypeScript

```bash
npm run db:types   # écrit lib/database.types.ts depuis le schéma distant
```

### 6. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Commande | Effet |
|----------|-------|
| `npm run dev` | Serveur de dev Next.js |
| `npm run build` / `npm start` | Build de production / démarrage |
| `npm run lint` | ESLint |
| `npm test` / `npm run test:watch` | Tests Vitest (run unique / mode watch) |
| `npm run db:new <nom>` | Crée un nouveau fichier de migration vide |
| `npm run db:push` | Applique les migrations en attente sur la base distante |
| `npm run db:reset` | ⚠️ Réinitialise la base **distante liée** et rejoue toutes les migrations (efface les données) |
| `npm run db:types` | Régénère `lib/database.types.ts` |
| `npm run db:dump` | Dump SQL de la base distante dans `backups/dump.sql` |

## Configuration Supabase

> Le schéma est géré **par migrations** (`supabase/migrations/`), pas par un script unique. Pour modifier la base, créer une nouvelle migration (`npm run db:new ma_modif`), l'éditer, puis `npm run db:push`. Ne jamais éditer une migration déjà poussée — en créer une nouvelle.

### Créer le compte admin (obligatoire)

L'accès au back-office est réservé aux utilisateurs listés dans la table `admin_users`.

1. **Désactiver l'inscription publique** : Authentication → Providers → Email → désactiver "Enable sign ups"
2. **Créer le vendeur** : Authentication → Users → **Add user** → email + mot de passe
3. **Autoriser l'accès admin** — dans le SQL Editor, exécuter :

```sql
insert into admin_users (id)
select id from auth.users where email = 'votre-email@example.com';
```

4. Se connecter sur `/admin/login` avec cet email et mot de passe

> Seuls les comptes présents dans `admin_users` peuvent accéder à `/admin/*`. Un utilisateur Supabase non autorisé verra « Accès refusé ».

## Déploiement Vercel

1. Pousser le repo sur GitHub
2. Importer sur [vercel.com](https://vercel.com)
3. Ajouter les variables d'environnement
4. Déployer

## Structure

```
app/
  page.tsx                    # Accueil
  produits/                   # Catalogue + détail
  commander/[id]/             # Formulaire commande
  confirmation/               # Page confirmation
  admin/                      # Back-office
  api/
    commandes/route.ts        # Création commande + notifications
components/
  client/                     # Navbar, Footer, ProductCard...
  admin/                      # Sidebar, tables, formulaires...
  supabase/                   # Clients Supabase
  data.ts                     # Requêtes serveur
  utils.ts                    # Helpers prix, promos...
middleware.ts                 # Protection routes /admin
supabase/
  config.toml                 # Config du projet Supabase (CLI)
  migrations/                 # Migrations SQL versionnées (schéma + RLS + buckets)
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Accueil |
| `/produits` | Catalogue |
| `/produits/[id]` | Détail produit |
| `/commander/[id]` | Commander |
| `/confirmation` | Confirmation |
| `/admin/login` | Connexion admin |
| `/admin/dashboard` | Tableau de bord |
| `/admin/produits` | Gestion produits |
| `/admin/commandes` | Gestion commandes |
| `/admin/promotions` | Gestion promotions |
