-- Migration v2 : catégories, statut vendue, vidéo produit
-- Exécuter dans Supabase SQL Editor si la base existe déjà

-- Catégories
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  nom text not null unique,
  created_at timestamp default now()
);

alter table categories enable row level security;

create policy "Catégories lisibles par tous"
  on categories for select using (true);

create policy "Admin peut insérer catégories"
  on categories for insert to authenticated with check (true);

create policy "Admin peut modifier catégories"
  on categories for update to authenticated using (true);

create policy "Admin peut supprimer catégories"
  on categories for delete to authenticated using (true);

-- Colonnes produits
alter table produits add column if not exists categorie_id uuid references categories(id);
alter table produits add column if not exists video_url text;

-- Bucket vidéos
insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

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
