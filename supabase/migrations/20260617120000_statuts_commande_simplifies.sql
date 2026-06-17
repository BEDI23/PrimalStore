-- Simplification des statuts de commande : nouvelle -> livree | annulee.
-- Les statuts intermédiaires « confirmee » et « vendue » sont supprimés.

-- 1. Migration des données existantes.
-- « confirmee » et « vendue » ne sont ni livrées ni annulées : on les ramène à
-- « nouvelle ». Choix prudent — le revenu réel (basé sur « livree ») n'est pas
-- gonflé par des commandes non effectivement livrées. L'admin recoche « Livré »
-- pour celles réellement livrées.
update commandes
set statut = 'nouvelle'
where statut in ('confirmee', 'vendue');

-- 2. Verrouillage au niveau base : seuls les trois statuts métier sont admis.
alter table commandes
  add constraint commandes_statut_check
  check (statut in ('nouvelle', 'livree', 'annulee'));
