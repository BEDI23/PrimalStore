# PrimalStore — E-commerce produits thérapeutiques naturels

Boutique en ligne PrimalStore pour vendre des produits thérapeutiques naturels à Lomé, Togo.

**Stack :** Next.js 14 (App Router) · Tailwind CSS · Supabase · CallMeBot · Resend · Vercel

## Fonctionnalités

### Site client (public)
- Accueil avec hero, promotions et produits vedettes
- Catalogue avec filtre promotions
- Détail produit et formulaire de commande
- Alerte WhatsApp discrète (CallMeBot) + email détaillé (Resend) à chaque commande

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
| `CALLMEBOT_PHONE` / `CALLMEBOT_APIKEY` | Voir [CallMeBot](#configuration-callmebot-whatsapp) |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `RESEND_TO_EMAIL` | Voir [Resend](#configuration-resend-email) |

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

## Notifications de commande

À chaque commande, deux notifications sont envoyées :

| Canal | Contenu | Sécurité |
|-------|---------|----------|
| **WhatsApp** (CallMeBot) | Message simple : *« Salim a commandé un produit »* | Aucun détail sensible sur WhatsApp |
| **Email** (Resend) | Tous les détails : produit, prix, client, téléphone, zone, message | Réservé à votre boîte mail |

### Configuration CallMeBot (WhatsApp)

1. Ajouter le numéro CallMeBot sur WhatsApp ([guide](https://www.callmebot.com/blog/free-api-whatsapp-messages/))
2. Récupérer l'API key
3. Renseigner dans `.env.local` :
   - `CALLMEBOT_PHONE`
   - `CALLMEBOT_APIKEY`

### Configuration Resend (email)

1. Créer un compte sur [resend.com](https://resend.com)
2. Générer une API key
3. Pour les tests, utiliser `onboarding@resend.dev` comme expéditeur
4. Renseigner dans `.env.local` :
   - `RESEND_API_KEY` — votre clé API
   - `RESEND_FROM_EMAIL` — ex. `PrimalStore <onboarding@resend.dev>`
   - `RESEND_TO_EMAIL` — votre email pour recevoir les commandes
5. En production, vérifier votre domaine sur Resend pour un expéditeur personnalisé

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
    notif/route.ts            # WhatsApp (alerte simple)
    email/route.ts            # Email Resend (détails complets)
lib/
  notifications/
    callmebot.ts              # Alerte WhatsApp
    email.ts                  # Email détaillé Resend
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
