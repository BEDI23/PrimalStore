-- Sécurisation des politiques RLS.
--
-- Problème corrigé : dans la migration initiale, toutes les écritures « admin »
-- étaient autorisées par `to authenticated using (true)`, ce qui permettait à
-- N'IMPORTE QUEL utilisateur authentifié (pas seulement les administrateurs) de
-- modifier/supprimer produits, catégories, commandes, promotions et fichiers.
-- Le contrôle admin n'existait que dans le code applicatif (lib/auth.ts), jamais
-- au niveau de la base.
--
-- Cette migration introduit une fonction `is_admin()` et réécrit les politiques
-- pour qu'elles s'appuient dessus. Les écritures serveur de l'application passent
-- par la clé service_role (qui contourne la RLS) : elles continuent de fonctionner.

-- Fonction d'autorisation : vrai si l'utilisateur courant est dans admin_users.
-- SECURITY DEFINER pour pouvoir lire admin_users indépendamment des politiques RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users where id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Catégories
-- ---------------------------------------------------------------------------
drop policy if exists "Admin peut insérer catégories" on categories;
create policy "Admin peut insérer catégories"
  on categories for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admin peut modifier catégories" on categories;
create policy "Admin peut modifier catégories"
  on categories for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin peut supprimer catégories" on categories;
create policy "Admin peut supprimer catégories"
  on categories for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Produits
-- ---------------------------------------------------------------------------
drop policy if exists "Admin peut tout lire sur produits" on produits;
create policy "Admin peut tout lire sur produits"
  on produits for select to authenticated
  using (public.is_admin());

drop policy if exists "Admin peut insérer produits" on produits;
create policy "Admin peut insérer produits"
  on produits for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admin peut modifier produits" on produits;
create policy "Admin peut modifier produits"
  on produits for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- La migration initiale n'avait aucune politique DELETE sur produits : on l'ajoute,
-- réservée aux admins.
drop policy if exists "Admin peut supprimer produits" on produits;
create policy "Admin peut supprimer produits"
  on produits for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Commandes
-- ---------------------------------------------------------------------------
-- Insertion publique : on remplace `with check (true)` par une contrainte qui
-- exige un produit existant et actif + des champs obligatoires non vides.
-- (L'application insère via service_role, donc cette politique ne régit que les
-- accès directs via la clé anon — c'est exactement ce qu'on veut verrouiller.)
drop policy if exists "Tout le monde peut créer une commande" on commandes;
create policy "Tout le monde peut créer une commande"
  on commandes for insert
  with check (
    char_length(coalesce(client_nom, '')) >= 2
    and char_length(coalesce(client_telephone, '')) >= 8
    and char_length(coalesce(quartier, '')) >= 2
    and quantite >= 1
    and exists (
      select 1 from produits p
      where p.id = produit_id and p.actif = true
    )
  );

drop policy if exists "Admin peut lire commandes" on commandes;
create policy "Admin peut lire commandes"
  on commandes for select to authenticated
  using (public.is_admin());

drop policy if exists "Admin peut modifier commandes" on commandes;
create policy "Admin peut modifier commandes"
  on commandes for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Promotions
-- ---------------------------------------------------------------------------
drop policy if exists "Admin peut tout lire promotions" on promotions;
create policy "Admin peut tout lire promotions"
  on promotions for select to authenticated
  using (public.is_admin());

drop policy if exists "Admin peut insérer promotions" on promotions;
create policy "Admin peut insérer promotions"
  on promotions for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admin peut modifier promotions" on promotions;
create policy "Admin peut modifier promotions"
  on promotions for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin peut supprimer promotions" on promotions;
create policy "Admin peut supprimer promotions"
  on promotions for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage (buckets produits & vidéos) : upload/suppression réservés aux admins
-- ---------------------------------------------------------------------------
drop policy if exists "Admin peut uploader images" on storage.objects;
create policy "Admin peut uploader images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'produits' and public.is_admin());

drop policy if exists "Admin peut supprimer images" on storage.objects;
create policy "Admin peut supprimer images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'produits' and public.is_admin());

drop policy if exists "Admin peut uploader vidéos" on storage.objects;
create policy "Admin peut uploader vidéos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'videos' and public.is_admin());

drop policy if exists "Admin peut supprimer vidéos" on storage.objects;
create policy "Admin peut supprimer vidéos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'videos' and public.is_admin());
