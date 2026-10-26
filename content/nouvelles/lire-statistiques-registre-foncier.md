---
title: "Lire les statistiques du Registre foncier sans se tromper"
slug: "lire-statistiques-registre-foncier"
category: "nouvelles"
publishedAt: "2026-10-22"
updatedAt: "2026-10-26"
description: "Nombre de ventes, transferts, hypothèques, difficultés financières : les fichiers du Registre foncier sont précis mais faciles à mal interpréter. Guide de lecture."
sources:
  - label: "Données Québec — Statistiques du Registre foncier du Québec sur le marché immobilier"
    url: "https://www.donneesquebec.ca/recherche/dataset/statistiques-du-registre-foncier-du-quebec-sur-le-marche-immobilier"
  - label: "Éducaloi — Le registre foncier : pourquoi, comment, combien ?"
    url: "https://educaloi.qc.ca/capsules/registre-foncier/"
titleEn: "Reading land registry statistics without getting them wrong"
descriptionEn: "Sales, transfers, mortgages, financial difficulty: the land registry files are precise but easy to misread. A reader's guide."
summaryEn: "The Québec land registry statistics are built from registered legal acts, not listings or surveys. This guide explains what each file contains, three counting rules that change the interpretation, and why the published numbers are regional aggregates that cannot be turned into a municipal average price."
---

Les statistiques du Registre foncier du Québec sont probablement les données immobilières les plus fiables disponibles publiquement dans la province. Elles sont produites à partir d'actes juridiques inscrits, et non d'annonces ou de sondages. Mais leur lecture demande quelques précautions : un chiffre mal interprété devient vite une fausse conclusion.

## Ce que contient le jeu de données

Le jeu de données publié sur Données Québec présente la compilation du nombre de ventes par plage de prix, du nombre de transferts de propriété, du nombre d'hypothèques et du nombre d'actes de difficulté financière inscrits au Registre foncier du Québec. Les informations sont diffusées pour l'ensemble du Québec ainsi que par région administrative.

Le jeu de données est mensuel et couvre une période d'au moins 60 mois, jusqu'à 71 mois selon la période de diffusion. Il est mis à jour chaque mois et publié sous licence CC-BY 4.0, ce qui permet la réutilisation avec attribution.

Chaque catégorie a son propre fichier CSV. Pour les ventes, les colonnes incluent la date de début du mois, la région administrative, le code de plage de prix, le code de nature de l'acte juridique et le nombre de requêtes. Les plages de prix des ventes sont explicites : moins de 250 000 $, de 250 000 $ à 500 000 $, plus de 500 000 $. Un fichier distinct liste les natures d'actes, ce qui permet de savoir ce qui est compté dans chaque catégorie.

## Trois règles de comptage à connaître

Première règle : seul le premier droit apparaissant à un acte est comptabilisé aux fins des statistiques. Un acte de vente peut comporter plus d'un droit de même nature — par exemple plus d'une vente dans le même acte — mais le compteur n'en retient qu'un. Le nombre publié est donc un nombre d'actes, pas un nombre de propriétés transférées.

Deuxième règle : les régions administratives sont reconstituées à partir des circonscriptions foncières. Une circonscription qui chevauche plus d'une région est associée à la région où se trouve le plus grand nombre de ses lots. La région du Nord-du-Québec chevauche trois circonscriptions ; ses données sont réparties dans celles du Saguenay–Lac-Saint-Jean, de l'Abitibi-Témiscamingue et de la Côte-Nord. Les totaux régionaux ne correspondent donc pas toujours aux limites administratives que l'on imagine.

Troisième règle : le fichier ne contient pas de prix moyen. Les ventes sont distribuées dans trois plages de prix, et c'est tout. Calculer une moyenne à partir de ces plages produirait un chiffre qui n'est pas publié par la source, avec une marge d'erreur inconnue. Si un média affiche un « prix moyen », il faut se demander d'où il vient.

## Ce que le Registre foncier ne mesure pas

Le Registre foncier est le registre légal des droits immobiliers. Éducaloi rappelle qu'il permet de consulter l'historique légal d'une propriété : qui a acheté ou vendu, quand, à quel prix, ainsi que les hypothèques et les droits de passage. C'est le moyen le plus fiable de connaître le véritable propriétaire d'un bien, davantage qu'un rôle d'évaluation ou qu'un relevé de taxes, qui ne sont pas toujours à jour.

Les statistiques publiées, elles, sont des agrégats. Elles ne disent pas si une propriété précise s'est vendue au-dessus ou en dessous de sa valeur, ni si une transaction était représentative du marché. Elles ne remplacent pas la consultation du registre pour une propriété donnée, qui exige le numéro de lot et entraîne des frais de consultation.

Il faut aussi distinguer le niveau géographique. Les fichiers sont diffusés par région administrative, pas par municipalité ni par quartier. Une page municipale construite sur ces données serait une inférence, pas une donnée officielle. Chez MaMaisonQC, les chiffres régionaux restent identifiés comme régionaux.

## Comment nous les utilisons

Sur nos pages de marché et dans Le Brief, nous agrégeons ces fichiers par région et par période, en indiquant la période exacte, la région et la source. Quand une région n'a pas de données, nous affichons un état de couverture plutôt qu'un zéro présenté comme un fait : un zéro peut vouloir dire « aucune transaction », mais aussi « aucune donnée ingérée ». La différence est essentielle.

Nous ne calculons pas de prix moyen à partir des plages de prix. Nous ne présentons pas un nombre de ventes comme un indice de prix. Et nous ne reprenons pas de chiffres de presse non vérifiés : chaque chiffre affiché doit pouvoir être rattaché à une ligne de données et à un jeu de données identifié.

## Comment lire un chiffre sans se tromper

La méthode est simple. D'abord, identifiez la période exacte : un mois, pas « récemment ». Ensuite, identifiez le territoire : province ou région administrative, jamais « le Québec » quand la donnée est régionale. Puis regardez la nature de l'acte : une vente, un transfert, une hypothèque et un acte de difficulté financière ne racontent pas la même histoire. Enfin, comparez ce qui est comparable : le même mois d'une année à l'autre, la même région, la même catégorie.

Un exemple de lecture prudente : si le nombre de ventes d'une région baisse d'un mois à l'autre, cela peut signifier un ralentissement, mais aussi un effet saisonnier ou un décalage d'inscription. Sans plusieurs mois de référence, la variation ne prouve rien. C'est pour cette raison que nous affichons la période et la provenance à côté de chaque agrégat.

Pour voir les jeux de données utilisés, les licences et les limites connues, consultez notre page [Données et sources](/donnees). Pour comprendre la différence entre valeur au rôle et valeur de marché, lisez notre [conseil sur le sujet](/conseils/evaluation-municipale-vs-valeur-marche).
