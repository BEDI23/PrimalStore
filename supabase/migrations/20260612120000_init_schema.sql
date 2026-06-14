-- Table des administrateurs autorisés (liée à auth.users)
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp default now()
);

alter table admin_users enable row level security;

create policy "Admin peut vérifier son propre statut"
  on admin_users for select
  to authenticated
  using (auth.uid() = id);

-- Catégories
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  nom text not null unique,
  created_at timestamp default now()
);

-- Tables
create table if not exists produits (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  description_courte text,
  description_complete text,
  prix integer not null,
  badge text default '',
  image_url text,
  video_url text,
  categorie_id uuid references categories(id),
  actif boolean default true,
  created_at timestamp default now()
);

create table if not exists commandes (
  id uuid default gen_random_uuid() primary key,
  produit_id uuid references produits(id),
  produit_nom text,
  produit_prix integer,
  client_nom text not null,
  client_telephone text not null,
  quartier text not null,
  quantite integer default 1,
  prix_total integer,
  message text,
  statut text default 'nouvelle',
  created_at timestamp default now()
);

create table if not exists promotions (
  id uuid default gen_random_uuid() primary key,
  produit_id uuid references produits(id),
  prix_promo integer not null,
  date_fin timestamp not null,
  actif boolean default true,
  created_at timestamp default now()
);

-- Storage buckets
insert into storage.buckets (id, name, public)
values ('produits', 'produits', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

-- RLS
alter table categories enable row level security;

create policy "Catégories lisibles par tous"
  on categories for select using (true);

create policy "Admin peut insérer catégories"
  on categories for insert to authenticated with check (true);

create policy "Admin peut modifier catégories"
  on categories for update to authenticated using (true);

create policy "Admin peut supprimer catégories"
  on categories for delete to authenticated using (true);

alter table produits enable row level security;
alter table commandes enable row level security;
alter table promotions enable row level security;

-- Produits: lecture publique des actifs
create policy "Produits actifs lisibles par tous"
  on produits for select
  using (actif = true);

create policy "Admin peut tout lire sur produits"
  on produits for select
  to authenticated
  using (true);

create policy "Admin peut insérer produits"
  on produits for insert
  to authenticated
  with check (true);

create policy "Admin peut modifier produits"
  on produits for update
  to authenticated
  using (true);

-- Commandes: insertion publique, lecture/modif admin
create policy "Tout le monde peut créer une commande"
  on commandes for insert
  with check (true);

create policy "Admin peut lire commandes"
  on commandes for select
  to authenticated
  using (true);

create policy "Admin peut modifier commandes"
  on commandes for update
  to authenticated
  using (true);

-- Promotions: lecture publique des actives
create policy "Promotions actives lisibles"
  on promotions for select
  using (actif = true);

create policy "Admin peut tout lire promotions"
  on promotions for select
  to authenticated
  using (true);

create policy "Admin peut insérer promotions"
  on promotions for insert
  to authenticated
  with check (true);

create policy "Admin peut modifier promotions"
  on promotions for update
  to authenticated
  using (true);

-- Storage policies
create policy "Images produits lisibles par tous"
  on storage.objects for select
  using (bucket_id = 'produits');

create policy "Admin peut uploader images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'produits');

create policy "Admin peut supprimer images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'produits');

create policy "Vidéos lisibles par tous"
  on storage.objects for select
  using (bucket_id = 'videos');

create policy "Admin peut uploader vidéos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'videos');

create policy "Admin peut supprimer vidéos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'videos');
