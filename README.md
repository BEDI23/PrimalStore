# PIPA-STOR — E-commerce produits thérapeutiques naturels

Boutique en ligne PIPA-STOR pour vendre des produits thérapeutiques naturels à Lomé, Togo.

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

## Installation

```bash
npm install
cp .env.local.example .env.local
# Remplir les variables dans .env.local
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter le script SQL dans `supabase/schema.sql` (SQL Editor)
3. Copier URL et clés API dans `.env.local`

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
   - `RESEND_FROM_EMAIL` — ex. `PIPA-STOR <onboarding@resend.dev>`
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
supabase/schema.sql           # Schéma BDD + RLS
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
