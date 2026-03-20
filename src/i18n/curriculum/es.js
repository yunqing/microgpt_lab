// Spanish curriculum translations
export const es_curriculum = {
  1: {
    title: "El Dataset",
    subtitle: "Tokenización a nivel de carácter",
    heading: "Nivel 1: El Dataset",
    body: `El combustible de los modelos de lenguaje son los datos de texto. En LLMs de producción, cada documento sería una página web, pero microgpt usa 32,000 nombres como un ejemplo más simple.

**La tokenización a nivel de carácter** asigna un entero a cada carácter único. Para el dataset de nombres, obtenemos 26 letras minúsculas (a-z), dándonos IDs de token 0-25. Cada token es solo un símbolo discreto — los números en sí no tienen significado.

El token especial **BOS** (Beginning of Sequence) actúa como delimitador. Cada nombre se envuelve: [BOS, e, m, m, a, BOS]. El modelo aprende que BOS inicia un nuevo nombre y otro BOS lo termina. Nuestro vocabulario final: 27 tokens (26 letras + 1 BOS).

**Diferencia en producción**: Los tokenizadores reales como tiktoken (usado por GPT-4) usan BPE (Byte Pair Encoding) con ~100K tokens, donde palabras comunes como "the" se convierten en tokens únicos. ¡Mucho más eficiente!`,
    question: "¿Por qué usamos `random.shuffle(docs)` antes del entrenamiento?",
    answer: "Para evitar que el modelo aprenda sesgos dependientes del orden — queremos que generalice a través de todos los nombres, no que se sobreajuste a la secuencia en que aparecen en el archivo.",
    badge: "Mezclador"
  },
  2: {
    title: "La Clase Value",
    subtitle: "Autograd & grafo computacional",
    heading: "Nivel 2: La Clase Value",
    body: `Entrenar una red neuronal requiere **gradientes**: para cada parámetro, necesitamos saber "¿si ajusto este número hacia arriba, la pérdida sube o baja, y en qué medida?"

La clase **Value** implementa autograd desde cero. Piensa en cada operación como un bloque de lego que sabe:
1. Cómo calcular su salida (paso hacia adelante)
2. Cómo cambia su salida con respecto a sus entradas (gradiente local)

**Ejemplo**: Para la multiplicación \`a * b\`, el paso hacia adelante da \`a·b\`, y los gradientes locales son \`∂(a·b)/∂a = b\` y \`∂(a·b)/∂b = a\`.

El método \`backward()\` aplica la **regla de la cadena**: si la pérdida es L y el nodo v tiene un hijo c con gradiente local ∂v/∂c, entonces:

\`\`\`
∂L/∂c += (∂v/∂c) × (∂L/∂v)
\`\`\`

¡Esto es solo multiplicar tasas de cambio a lo largo de caminos! Como: "el coche es 2x más rápido que la bici, la bici es 4x más rápida que caminar, entonces el coche es 2×4=8x más rápido que caminar."

**Diferencia en producción**: PyTorch hace lo mismo pero sobre tensores (arrays) en lugar de escalares, ejecutándose en GPUs para paralelismo masivo.`,
    question: "¿Por qué `__mul__` almacena `(other.data, self.data)` como local_grads?",
    answer: "Porque d(a×b)/da = b y d(a×b)/db = a. Al almacenar el valor del otro operando como el gradiente local, backward() puede aplicar la regla de la cadena automáticamente.",
    badge: "Maestro de la Cadena"
  },
  3: {
    title: "Embeddings",
    subtitle: "Matrices wte + wpe",
    heading: "Nivel 3: Embeddings",
    body: `Antes que nada, cada token debe convertirse en un vector de números. microgpt usa **dos tablas de búsqueda aprendibles**:

**wte** (weight token embedding): mapea cada ID de token a un vector de 16 dimensiones. Piénsalo como "¿qué es este carácter?"

**wpe** (weight position embedding): mapea cada posición (0–15) a un vector de 16 dimensiones. Piénsalo como "¿dónde estoy en la secuencia?"

Estos dos vectores se **suman** elemento por elemento, dando al modelo información de identidad y posición en un único vector de 16 dimensiones.`,
    question: "¿Por qué sumar los embeddings de token y posición en lugar de concatenarlos?",
    answer: "Sumar mantiene la dimensión constante (16) en lugar de duplicarla (32), lo cual es eficiente en parámetros. El modelo aprende a desenredar identidad vs. posición dentro del mismo espacio.",
    badge: "Ahorrador de Espacio"
  },
  4: {
    title: "RMSNorm",
    subtitle: "Manteniendo señales estables",
    heading: "Nivel 4: RMSNorm",
    body: `Sin normalización, las activaciones pueden crecer exponencialmente en lo profundo de la red, causando **gradientes explosivos o que desaparecen**.

**RMSNorm** (Root Mean Square Normalization) reescala un vector para que su raíz cuadrática media sea ~1. A diferencia de LayerNorm, omite el centrado (sin resta de media), haciéndolo más económico.

El **epsilon 1e-5** previene la división por cero cuando el vector es todo ceros.

microgpt aplica RMSNorm antes de cada bloque de atención y MLP — manteniendo las señales bien condicionadas durante todo el entrenamiento.`,
    question: "¿Por qué usar RMSNorm en lugar del LayerNorm original de GPT-2?",
    answer: "RMSNorm es más simple (sin resta de media) y entrena comparablemente bien. Se usa en modelos modernos como LLaMA y Mistral por la misma razón — eficiencia sin sacrificar calidad.",
    badge: "Profesional de Estabilidad"
  },
  5: {
    title: "División QKV",
    subtitle: "Un vector se convierte en tres",
    heading: "Nivel 5: La División QKV",
    body: `La atención es el **mecanismo de comunicación** — el único lugar donde un token en la posición t puede "mirar" tokens del pasado (posiciones 0..t-1).

Cada token se proyecta en tres vectores:

- **Query (Q)**: "¿Qué estoy buscando?"
- **Key (K)**: "¿Qué contengo?"
- **Value (V)**: "¿Qué información ofrezco si soy seleccionado?"

**Ejemplo**: En el nombre "emma", cuando estás en la segunda "m" intentando predecir lo siguiente, el modelo podría aprender una consulta como "¿qué vocales aparecieron recientemente?" La "e" anterior tiene una clave que coincide bien, obtiene un peso de atención alto, y su valor (información de vocal) fluye hacia adelante.

**Multi-head attention** (4 cabezas aquí) permite al modelo atender a diferentes patrones simultáneamente — una cabeza podría rastrear vocales, otra consonantes, etc.

El producto punto Q·K (escalado por 1/√head_dim) mide la similitud. Softmax convierte estos puntajes en pesos que suman 1. Luego tomamos una suma ponderada de vectores Value.`,
    question: "¿Por qué escalar los logits de atención por `1/sqrt(head_dim)`?",
    answer: "Sin escalado, los productos punto crecen con la dimensión, empujando softmax hacia la saturación (gradientes cercanos a 0 o 1). Dividir por √head_dim mantiene la varianza de los productos punto ~1.",
    badge: "Maestro del Escalado"
  },
  6: {
    title: "Atención Multi-cabeza",
    subtitle: "Similitud por producto punto",
    heading: "Nivel 6: Atención Multi-cabeza",
    body: `El mecanismo de atención permite que cada token **mire hacia atrás a tokens anteriores** y recopile información relevante.

**Paso 1**: Calcular logits = Q·K^T / √d (¿qué tan relevante es cada token pasado?)
**Paso 2**: Softmax → pesos de atención (probabilidades que suman 1)
**Paso 3**: Suma ponderada de Values → lo que realmente pasamos hacia adelante

La **conexión residual** (\`x = x_attn + x_residual\`) es crucial — permite que los gradientes fluyan directamente desde la pérdida hasta las incrustaciones, previniendo gradientes que desaparecen en redes más profundas.`,
    question: "¿Por qué usar la sustracción de `max_val` en la implementación de softmax?",
    answer: "Restar el máximo previene el desbordamiento al exponenciar logits grandes (ej., exp(1000) = infinito). Es matemáticamente equivalente pero numéricamente estable: softmax(x) = softmax(x - max).",
    badge: "Sabio del Softmax"
  },
  7: {
    title: "El MLP",
    subtitle: "FC1 → ReLU → FC2",
    heading: "Nivel 7: El MLP",
    body: `Después de la atención (que mezcla información **entre tokens**), el MLP procesa cada token **independientemente** — es donde el modelo almacena conocimiento factual.

**FC1** expande de 16 → 64 dimensiones (4×). Este espacio más amplio permite al modelo representar combinaciones complejas.
**ReLU** añade no linealidad — sin ella, toda la red es solo una transformación lineal.
**FC2** proyecta de vuelta de 64 → 16.

El patrón expandir-contraer actúa como un "detector de características" — las neuronas en la capa de 64 dimensiones se especializan en patrones específicos.`,
    question: "¿Por qué GPT-2 usa GeLU mientras microgpt usa ReLU?",
    answer: "GeLU es suave (sin corte duro en cero), lo que puede ayudar al flujo de gradientes en redes muy profundas. Para el pequeño microgpt (1 capa), el simple ReLU funciona igual de bien y es más simple de implementar desde cero.",
    badge: "Experto en Activación"
  },
  8: {
    title: "La Pérdida",
    subtitle: "Entropía cruzada via .log()",
    heading: "Nivel 8: La Función de Pérdida",
    body: `El modelo se entrena mediante **máxima verosimilitud**: maximizar la probabilidad del siguiente carácter correcto.

Esto es equivalente a **minimizar la entropía cruzada**: \`loss = -log(p_correct)\`

Cuando el modelo está seguro y correcto, p_correct ≈ 1 → loss ≈ 0.
Cuando el modelo está equivocado o inseguro, p_correct ≈ 0 → loss → ∞.

El método **\`.log()\`** en un nodo Value registra la regla de retropropagación: d(log x)/dx = 1/x. Cuando se llama \`.backward()\`, los gradientes fluyen hacia atrás a través de softmax, a través de las cabezas de atención, hasta las matrices de incrustación.`,
    question: "¿Por qué usar la función exponencial (exp) dentro del softmax para convertir logits a probabilidades?",
    answer: "exp asegura que todas las salidas sean positivas (las probabilidades deben ser ≥ 0), crea una función diferenciable suave y amplifica las diferencias entre logits — haciendo que el modelo sea más decisivo a medida que avanza el entrenamiento.",
    badge: "Log Verosimilitud"
  },
  9: {
    title: "Optimizador Adam",
    subtitle: "Buffers de momento y velocidad",
    heading: "Nivel 9: El Optimizador Adam",
    body: `El descenso de gradiente simple (SGD) puede ser lento e inestable. **Adam** añade dos buffers de momento por parámetro:

**m** (1er momento): promedio móvil exponencial de gradientes — suaviza la dirección de actualización.
**v** (2do momento): promedio móvil exponencial de gradientes al cuadrado — rastrea qué tan grandes han sido los gradientes.

La actualización \`m / sqrt(v)\` es una **tasa de aprendizaje adaptativa por parámetro**: los parámetros con gradientes históricamente grandes obtienen actualizaciones más pequeñas (ya aprendidos), mientras que los parámetros raramente vistos obtienen actualizaciones más grandes.

La **corrección de sesgo** (dividir por 1-β^t) es crítica en los primeros pasos cuando m y v están sesgados hacia cero.`,
    question: "¿Por qué microgpt usa beta1=0.85 en lugar del estándar 0.9?",
    answer: "Un beta1 más bajo hace que el optimizador sea menos 'pegajoso' — olvida gradientes antiguos más rápido. Para un modelo pequeño entrenando en secuencias cortas, esto permite una adaptación más rápida y evita que el momento sobrepase en este conjunto de datos pequeño.",
    badge: "Susurrador de Adam"
  },
  10: {
    title: "Inferencia",
    subtitle: "Muestreo con temperatura",
    heading: "Nivel 10: Inferencia",
    body: `Después del entrenamiento, podemos **muestrear nuevos nombres** autorregressivamente — un carácter a la vez.

**La temperatura** controla la creatividad:
- **T bajo (0.1)**: muy confiado, elige caracteres probables → nombres repetitivos
- **T = 1.0**: muestreo directo de probabilidades aprendidas
- **T alto (2.0)**: aplana la distribución → nombres más aleatorios y creativos

En cada paso, el modelo toma el token actual, ejecuta el transformador completo, obtiene una distribución sobre todos los caracteres, muestrea uno y lo devuelve como la siguiente entrada. Esto continúa hasta que el modelo produce BOS (que significa "terminado").`,
    question: "¿Por qué comenzar la inferencia con el token BOS en lugar de un carácter aleatorio?",
    answer: "BOS es una señal aprendida de 'inicio de nombre'. El modelo ha visto BOS al comienzo de cada ejemplo de entrenamiento, por lo que ha aprendido a asociar BOS con la distribución de caracteres que inician nombres (a menudo vocales y primeras letras comunes).",
    badge: "Maestro de Inferencia"
  }
};
