# Calculateur de Variables

Une application web qui permet de gérer et calculer dynamiquement 1000 variables interdépendantes. Chaque variable peut être définie par une formule qui fait référence à d'autres variables.

## Fonctionnalités

- Affichage de 1000 variables (VAR_1 à VAR_1000)
- Formules modifiables pour chaque variable
- Calcul automatique des valeurs lors de la modification des formules
- Mise à jour dynamique des variables dépendantes

## Structure des Variables

Chaque variable est composée de :
- Un code (ex: VAR_1, VAR_2, ...)
- Une formule modifiable
- Une valeur calculée

## Initialisation par défaut

- VAR_1 = 1
- VAR_2 = 2
- VAR_3 = VAR_2 + VAR_1
- VAR_4 = VAR_3 + VAR_2
- ...etc (suivant le même modèle)

## Comment utiliser

1. Ouvrez `index.html` dans un navigateur web
2. Le tableau des variables s'affiche avec trois colonnes :
   - Code : l'identifiant unique de la variable
   - Formule : la formule de calcul (modifiable)
   - Valeur : le résultat calculé

3. Pour modifier une formule :
   - Cliquez sur le champ de formule de la variable souhaitée
   - Entrez la nouvelle formule (ex: "VAR_2 + VAR_1")
   - Appuyez sur Entrée ou cliquez en dehors du champ


## Dépendances

- [HyperFormula](https://handsontable.com/docs/hyperformula/) (v2.7.1) - Moteur de calcul pour les formules







