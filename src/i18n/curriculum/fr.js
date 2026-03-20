// French curriculum translations
export const fr_curriculum = {
  1: {
    title: "Le Dataset",
    subtitle: "Tokenisation au niveau des caractères",
    heading: "Niveau 1 : Le Dataset",
    body: `Le carburant des modèles de langage est constitué de données textuelles. Dans les LLMs de production, chaque document serait une page web, mais microgpt utilise 32 000 noms comme exemple plus simple.

**La tokenisation au niveau des caractères** assigne un entier à chaque caractère unique. Pour le dataset de noms, nous obtenons 26 lettres minuscules (a-z), nous donnant les IDs de token 0-25. Chaque token n'est qu'un symbole discret — les nombres eux-mêmes n'ont pas de signification.

Le token spécial **BOS** (Beginning of Sequence) agit comme délimiteur. Chaque nom est encapsulé : [BOS, e, m, m, a, BOS]. Le modèle apprend que BOS initie un nouveau nom et un autre BOS le termine. Notre vocabulaire final : 27 tokens (26 lettres + 1 BOS).

**Différence en production** : Les vrais tokenizers comme tiktoken (utilisé par GPT-4) utilisent BPE (Byte Pair Encoding) avec ~100K tokens, où les mots courants comme "the" deviennent des tokens uniques. Beaucoup plus efficace !`,
    question: "Pourquoi utilisons-nous `random.shuffle(docs)` avant l'entraînement ?",
    answer: "Pour empêcher le modèle d'apprendre des biais dépendants de l'ordre — nous voulons qu'il généralise sur tous les noms, pas qu'il surapprenne la séquence dans laquelle ils apparaissent dans le fichier.",
    badge: "Mélangeur"
  },
  2: {
    title: "La Classe Value",
    subtitle: "Autograd & graphe de calcul",
    heading: "Niveau 2 : La Classe Value",
    body: `Entraîner un réseau de neurones nécessite des **gradients** : pour chaque paramètre, nous devons savoir "si j'augmente légèrement ce nombre, la perte augmente-t-elle ou diminue-t-elle, et de combien ?"

La classe **Value** implémente autograd à partir de zéro. Pensez à chaque opération comme un bloc de lego qui sait :
1. Comment calculer sa sortie (passage avant)
2. Comment sa sortie change par rapport à ses entrées (gradient local)

**Exemple** : Pour la multiplication \`a * b\`, le passage avant donne \`a·b\`, et les gradients locaux sont \`∂(a·b)/∂a = b\` et \`∂(a·b)/∂b = a\`.

La méthode \`backward()\` applique la **règle de la chaîne** : si la perte est L et que le nœud v a un enfant c avec un gradient local ∂v/∂c, alors :

\`\`\`
∂L/∂c += (∂v/∂c) × (∂L/∂v)
\`\`\`

C'est simplement multiplier des taux de changement le long des chemins ! Comme : "la voiture est 2x plus rapide que le vélo, le vélo est 4x plus rapide que la marche, donc la voiture est 2×4=8x plus rapide que la marche."

**Différence en production** : PyTorch fait la même chose mais sur des tenseurs (tableaux) au lieu de scalaires, fonctionnant sur GPU pour un parallélisme massif.`,
    question: "Pourquoi `__mul__` stocke-t-il `(other.data, self.data)` comme local_grads ?",
    answer: "Parce que d(a×b)/da = b et d(a×b)/db = a. En stockant la valeur de l'autre opérande comme gradient local, backward() peut appliquer la règle de la chaîne automatiquement.",
    badge: "Maître de la Chaîne"
  },
  3: {
    title: "Embeddings",
    subtitle: "Matrices wte + wpe",
    heading: "Niveau 3 : Embeddings",
    body: `Avant toute chose, chaque token doit devenir un vecteur de nombres. microgpt utilise **deux tables de recherche apprises** :

**wte** (weight token embedding) : mappe chaque ID de token à un vecteur de 16 dimensions. Pensez-y comme "quel est ce caractère ?"

**wpe** (weight position embedding) : mappe chaque position (0–15) à un vecteur de 16 dimensions. Pensez-y comme "où suis-je dans la séquence ?"

Ces deux vecteurs sont **additionnés** élément par élément, donnant au modèle à la fois l'information d'identité et de position dans un seul vecteur de 16 dimensions.`,
    question: "Pourquoi additionner les embeddings de token et de position au lieu de les concaténer ?",
    answer: "L'addition garde la dimension constante (16) au lieu de la doubler (32), ce qui est efficace en paramètres. Le modèle apprend à démêler identité vs. position dans le même espace.",
    badge: "Économiseur d'Espace"
  },
  4: {
    title: "RMSNorm",
    subtitle: "Maintenir les signaux stables",
    heading: "Niveau 4 : RMSNorm",
    body: `Sans normalisation, les activations peuvent croître exponentiellement en profondeur dans le réseau, causant des **gradients explosifs ou qui disparaissent**.

**RMSNorm** (Root Mean Square Normalization) rééchelonne un vecteur pour que sa racine carrée moyenne soit ~1. Contrairement à LayerNorm, il saute le centrage (pas de soustraction de moyenne), le rendant moins coûteux.

L'**epsilon 1e-5** empêche la division par zéro lorsque le vecteur est entièrement constitué de zéros.

microgpt applique RMSNorm avant chaque bloc d'attention et MLP — gardant les signaux bien conditionnés tout au long de l'entraînement.`,
    question: "Pourquoi utiliser RMSNorm au lieu du LayerNorm original de GPT-2 ?",
    answer: "RMSNorm est plus simple (pas de soustraction de moyenne) et s'entraîne aussi bien. Il est utilisé dans les modèles modernes comme LLaMA et Mistral pour la même raison — efficacité sans sacrifier la qualité.",
    badge: "Pro de la Stabilité"
  },
  5: {
    title: "Division QKV",
    subtitle: "Un vecteur devient trois",
    heading: "Niveau 5 : La Division QKV",
    body: `L'attention est le **mécanisme de communication** — le seul endroit où un token à la position t peut "regarder" les tokens du passé (positions 0..t-1).

Chaque token est projeté en trois vecteurs :

- **Query (Q)** : "Que cherche-je ?"
- **Key (K)** : "Que contiens-je ?"
- **Value (V)** : "Quelle information j'offre si je suis sélectionné ?"

**Exemple** : Dans le nom "emma", lorsqu'on est au deuxième "m" en essayant de prédire la suite, le modèle pourrait apprendre une requête du type "quelles voyelles sont apparues récemment ?" Le "e" précédent a une clé qui correspond bien, obtient un poids d'attention élevé, et sa valeur (information de voyelle) se propage vers l'avant.

**Multi-head attention** (4 têtes ici) permet au modèle d'assister à différents motifs simultanément — une tête pourrait suivre les voyelles, une autre les consonnes, etc.

Le produit scalaire Q·K (mis à l'échelle par 1/√head_dim) mesure la similarité. Softmax convertit ces scores en poids sommant à 1. Ensuite, nous prenons une somme pondérée des vecteurs Value.`,
    question: "Pourquoi mettre à l'échelle les logits d'attention par `1/sqrt(head_dim)` ?",
    answer: "Sans mise à l'échelle, les produits scalaires augmentent avec la dimension, poussant softmax vers la saturation (gradients proches de 0 ou 1). Diviser par √head_dim maintient la variance des produits scalaires ~1.",
    badge: "Maître du Scaling"
  },
  6: {
    title: "Attention Multi-têtes",
    subtitle: "Similarité par produit scalaire",
    heading: "Niveau 6 : Attention Multi-têtes",
    body: `Le mécanisme d'attention permet à chaque token de **regarder en arrière les tokens précédents** et de rassembler des informations pertinentes.

**Étape 1** : Calculer logits = Q·K^T / √d (à quel point chaque token passé est-il pertinent ?)
**Étape 2** : Softmax → poids d'attention (probabilités sommant à 1)
**Étape 3** : Somme pondérée des Values → ce que nous transmettons réellement

La **connexion résiduelle** (\`x = x_attn + x_residual\`) est cruciale — elle permet aux gradients de circuler directement de la perte vers les embeddings, empêchant la disparition des gradients dans les réseaux plus profonds.`,
    question: "Pourquoi utiliser la soustraction de `max_val` dans l'implémentation softmax ?",
    answer: "Soustraire le max empêche le débordement lors de l'exponentiation de grands logits (par ex., exp(1000) = infini). C'est mathématiquement équivalent mais numériquement stable : softmax(x) = softmax(x - max).",
    badge: "Sage du Softmax"
  },
  7: {
    title: "Le MLP",
    subtitle: "FC1 → ReLU → FC2",
    heading: "Niveau 7 : Le MLP",
    body: `Après l'attention (qui mélange l'information **entre tokens**), le MLP traite chaque token **indépendamment** — c'est là que le modèle stocke les connaissances factuelles.

**FC1** étend de 16 → 64 dimensions (4×). Cet espace plus large permet au modèle de représenter des combinaisons complexes.
**ReLU** ajoute la non-linéarité — sans elle, tout le réseau n'est qu'une transformation linéaire.
**FC2** projette de 64 → 16.

Le modèle expansion-contraction agit comme un "détecteur de caractéristiques" — les neurones dans la couche 64-dim se spécialisent dans des motifs spécifiques.`,
    question: "Pourquoi GPT-2 utilise GeLU tandis que microgpt utilise ReLU ?",
    answer: "GeLU est lisse (pas de coupure brutale à zéro), ce qui peut aider le flux de gradient pour les réseaux très profonds. Pour le petit microgpt (1 couche), le simple ReLU fonctionne tout aussi bien et est plus simple à implémenter from scratch.",
    badge: "Expert en Activation"
  },
  8: {
    title: "La Perte",
    subtitle: "Entropie croisée via .log()",
    heading: "Niveau 8 : La Fonction de Perte",
    body: `Le modèle est entraîné par **maximum de vraisemblance** : maximiser la probabilité du bon caractère suivant.

Cela équivaut à **minimiser l'entropie croisée** : \`loss = -log(p_correct)\`

Quand le modèle est confiant et correct, p_correct ≈ 1 → loss ≈ 0.
Quand le modèle se trompe ou est incertain, p_correct ≈ 0 → loss → ∞.

La méthode **\`.log()\`** sur un nœud Value enregistre la règle de rétropropagation : d(log x)/dx = 1/x. Quand \`.backward()\` est appelé, les gradients remontent à travers softmax, à travers les têtes d'attention, jusqu'aux matrices d'embedding.`,
    question: "Pourquoi utiliser la fonction exponentielle (exp) dans le softmax pour convertir les logits en probabilités ?",
    answer: "exp garantit que toutes les sorties sont positives (les probabilités doivent être ≥ 0), crée une fonction différentiable lisse, et amplifie les différences entre logits — rendant le modèle plus décisif au fur et à mesure de l'entraînement.",
    badge: "Log Vraisemblance"
  },
  9: {
    title: "Optimiseur Adam",
    subtitle: "Buffers de momentum et vélocité",
    heading: "Niveau 9 : L'Optimiseur Adam",
    body: `La descente de gradient simple (SGD) peut être lente et instable. **Adam** ajoute deux buffers de momentum par paramètre :

**m** (1er moment) : moyenne mobile exponentielle des gradients — lisse la direction de mise à jour.
**v** (2ème moment) : moyenne mobile exponentielle des gradients au carré — suit la taille des gradients.

La mise à jour \`m / sqrt(v)\` est un **taux d'apprentissage adaptatif par paramètre** : les paramètres avec historiquement de grands gradients reçoivent de petites mises à jour (déjà appris), tandis que les paramètres rarement vus reçoivent de grandes mises à jour.

La **correction de biais** (diviser par 1-β^t) est critique dans les premières étapes quand m et v sont biaisés vers zéro.`,
    question: "Pourquoi microgpt utilise beta1=0.85 au lieu du standard 0.9 ?",
    answer: "Un beta1 plus bas rend l'optimiseur moins 'collant' — il oublie les anciens gradients plus rapidement. Pour un petit modèle s'entraînant sur de courtes séquences, cela permet une adaptation plus rapide et empêche le momentum de dépasser sur ce petit dataset.",
    badge: "Chuchoteur d'Adam"
  },
  10: {
    title: "Inférence",
    subtitle: "Échantillonnage par température",
    heading: "Niveau 10 : Inférence",
    body: `Après l'entraînement, nous pouvons **échantillonner de nouveaux noms** de manière autorégressive — un caractère à la fois.

**La température** contrôle la créativité :
- **T bas (0.1)** : très confiant, choisit les caractères probables → noms répétitifs
- **T = 1.0** : échantillonnage direct des probabilités apprises
- **T élevé (2.0)** : aplatit la distribution → noms plus aléatoires et créatifs

À chaque étape, le modèle prend le token actuel, exécute le transformateur complet, obtient une distribution sur tous les caractères, en échantillonne un et le renvoie comme entrée suivante. Cela continue jusqu'à ce que le modèle produise BOS (signifiant "terminé").`,
    question: "Pourquoi commencer l'inférence avec le token BOS plutôt qu'un caractère aléatoire ?",
    answer: "BOS est un signal appris de 'début de nom'. Le modèle a vu BOS au début de chaque exemple d'entraînement, il a donc appris à associer BOS à la distribution des caractères de début de nom (souvent des voyelles et des premières lettres courantes).",
    badge: "Maître de l'Inférence"
  }
};
