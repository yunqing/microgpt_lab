export const CURRICULUM = [
  {
    id: 1,
    title: "The Dataset",
    subtitle: "Character-level tokenization",
    icon: "Database",
    color: "cyan",
    paramContrib: 0,
    codeLines: [14, 27],
    code: `# Let there be a Dataset
if not os.path.exists('input.txt'):
    import urllib.request
    names_url = 'https://raw.githubusercontent.com/karpathy/makemore/988aa59/names.txt'
    urllib.request.urlretrieve(names_url, 'input.txt')
docs = [line.strip() for line in open('input.txt') if line.strip()]
random.shuffle(docs)
print(f"num docs: {len(docs)}")

# Tokenizer
uchars = sorted(set(''.join(docs)))
BOS = len(uchars)       # Beginning of Sequence token
vocab_size = len(uchars) + 1
print(f"vocab size: {vocab_size}")`,
    highlightLines: [1, 6, 11, 12, 13],
    content: {
      heading: "Level 1: The Dataset",
      body: `The model learns from a list of names (like "emma", "olivia", "noah"). Each document is a single name.

**Character-level tokenization** means every unique character becomes a token ID. For names, the vocab is just 26 letters — tiny!

The special **BOS** (Beginning of Sequence) token marks the start and end of each name. When the model sees BOS, it learns to start a new name. When it predicts BOS again, it knows the name is done.`,
      insight: {
        question: "Why do we use `random.shuffle(docs)` before training?",
        answer: "To prevent the model from learning order-dependent biases — we want it to generalize across all names, not overfit to the sequence they appear in the file.",
        badge: "Shuffler"
      },
      visualType: "tokenizer"
    }
  },
  {
    id: 2,
    title: "The Value Class",
    subtitle: "Autograd & computation graph",
    icon: "GitBranch",
    color: "indigo",
    paramContrib: 0,
    codeLines: [29, 73],
    code: `class Value:
    __slots__ = ('data', 'grad', '_children', '_local_grads')

    def __init__(self, data, children=(), local_grads=()):
        self.data = data          # forward pass scalar
        self.grad = 0             # dLoss/d(this), set by backward()
        self._children = children # nodes that created this node
        self._local_grads = local_grads

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        return Value(self.data * other.data,
                     (self, other),
                     (other.data, self.data))  # d(a*b)/da = b

    def backward(self):
        topo = []
        visited = set()
        def build_topo(v):
            if v not in visited:
                visited.add(v)
                for child in v._children:
                    build_topo(child)
                topo.append(v)
        build_topo(self)
        self.grad = 1
        for v in reversed(topo):
            for child, local_grad in zip(v._children, v._local_grads):
                child.grad += local_grad * v.grad  # chain rule!`,
    highlightLines: [5, 6, 7, 13, 27],
    content: {
      heading: "Level 2: The Value Class",
      body: `Every number in microgpt is wrapped in a **Value** object. This tiny class is what makes training possible.

- **\`.data\`** — the actual number (forward pass result)
- **\`.grad\`** — how much this number affects the loss (set by \`.backward()\`)
- **\`._children\`** — the Values that created this Value
- **\`._local_grads\`** — local derivative of this operation

The **chain rule** in \`backward()\` walks the computation graph in reverse topological order, multiplying local gradients along the way: \`child.grad += local_grad × parent.grad\``,
      insight: {
        question: "Why does `__mul__` store `(other.data, self.data)` as local_grads?",
        answer: "Because d(a×b)/da = b and d(a×b)/db = a. By storing the other operand's value as the local gradient, backward() can apply the chain rule automatically.",
        badge: "Chain Ruler"
      },
      visualType: "autograd"
    }
  },
  {
    id: 3,
    title: "Embeddings",
    subtitle: "wte + wpe matrices",
    icon: "Grid",
    color: "blue",
    paramContrib: 864,
    codeLines: [74, 91],
    code: `n_embd = 16       # embedding dimension
block_size = 16   # max context length
vocab_size = 27   # 26 letters + BOS

# Token Embedding matrix: shape [vocab_size, n_embd]
state_dict['wte'] = matrix(vocab_size, n_embd)

# Position Embedding matrix: shape [block_size, n_embd]
state_dict['wpe'] = matrix(block_size, n_embd)

# Inside gpt():
tok_emb = state_dict['wte'][token_id]   # row lookup by token
pos_emb = state_dict['wpe'][pos_id]     # row lookup by position
x = [t + p for t, p in zip(tok_emb, pos_emb)]  # combine!`,
    highlightLines: [6, 9, 12, 13, 14],
    content: {
      heading: "Level 3: Embeddings",
      body: `Before anything else, each token must become a vector of numbers. microgpt uses **two learned lookup tables**:

**wte** (weight token embedding): maps each token ID to a 16-dimensional vector. Think of it as "what is this character?"

**wpe** (weight position embedding): maps each position (0–15) to a 16-dimensional vector. Think of it as "where in the sequence am I?"

These two vectors are **added together** element-wise, giving the model both identity and position information in a single 16-dim vector.`,
      insight: {
        question: "Why add token and position embeddings instead of concatenating?",
        answer: "Adding keeps the dimension constant (16) instead of doubling it (32), which is parameter-efficient. The model learns to disentangle identity vs. position within the same space.",
        badge: "Space Saver"
      },
      visualType: "embedding"
    }
  },
  {
    id: 4,
    title: "RMSNorm",
    subtitle: "Keeping signals stable",
    icon: "Activity",
    color: "teal",
    paramContrib: 0,
    codeLines: [103, 106],
    code: `def rmsnorm(x):
    # Root Mean Square of the vector
    ms = sum(xi * xi for xi in x) / len(x)
    # Scale factor: 1 / sqrt(ms + epsilon)
    scale = (ms + 1e-5) ** -0.5
    # Normalize each element
    return [xi * scale for xi in x]

# Used before attention and MLP:
x = rmsnorm(x)  # normalize
q = linear(x, state_dict['attn_wq'])  # now stable!`,
    highlightLines: [3, 5, 7],
    content: {
      heading: "Level 4: RMSNorm",
      body: `Without normalization, activations can grow exponentially deep in the network, causing **exploding or vanishing gradients**.

**RMSNorm** (Root Mean Square Normalization) rescales a vector so its root mean square equals ~1. Unlike LayerNorm, it skips centering (no mean subtraction), making it cheaper.

The **1e-5 epsilon** prevents division by zero when the vector is all zeros.

microgpt applies RMSNorm before each attention block and MLP — keeping signals well-conditioned throughout training.`,
      insight: {
        question: "Why use RMSNorm instead of the original LayerNorm from GPT-2?",
        answer: "RMSNorm is simpler (no mean subtraction) and trains comparably well. It's used in modern models like LLaMA and Mistral for the same reason — efficiency without sacrificing quality.",
        badge: "Stability Pro"
      },
      visualType: "rmsnorm"
    }
  },
  {
    id: 5,
    title: "QKV Split",
    subtitle: "One vector becomes three",
    icon: "Scissors",
    color: "violet",
    paramContrib: 3072,
    codeLines: [118, 122],
    code: `# Three separate learned projections:
q = linear(x, state_dict['layer0.attn_wq'])  # Query
k = linear(x, state_dict['layer0.attn_wk'])  # Key
v = linear(x, state_dict['layer0.attn_wv'])  # Value

# Each is shape [n_embd] = [16]
# Then split into n_head=4 heads, each head_dim=4

for h in range(n_head):
    hs = h * head_dim          # head start index
    q_h = q[hs:hs+head_dim]   # this head's query
    k_h = [ki[hs:hs+head_dim] for ki in keys]
    v_h = [vi[hs:hs+head_dim] for vi in values]`,
    highlightLines: [2, 3, 4, 11, 12, 13],
    content: {
      heading: "Level 5: The QKV Split",
      body: `Every token gets transformed into three roles via **three separate weight matrices**:

- **Query (Q)**: "What am I looking for?"
- **Key (K)**: "What do I contain?"
- **Value (V)**: "What do I actually pass forward?"

The dot-product Q·K measures similarity between positions. High similarity = high attention weight = that token's Value vector has more influence on the output.

With 4 heads (head_dim=4 each), the model can attend to different aspects simultaneously.`,
      insight: {
        question: "Why scale attention logits by `1/sqrt(head_dim)`?",
        answer: "Without scaling, dot products grow large with dimension, pushing softmax into saturation (near 0 or 1 gradients). Dividing by √head_dim keeps the variance of dot products ~1.",
        badge: "Scaling Master"
      },
      visualType: "qkv"
    }
  },
  {
    id: 6,
    title: "Multi-head Attention",
    subtitle: "Dot-product similarity",
    icon: "Eye",
    color: "purple",
    paramContrib: 1024,
    codeLines: [123, 133],
    code: `# For each head h:
attn_logits = [
    sum(q_h[j] * k_h[t][j] for j in range(head_dim)) / head_dim**0.5
    for t in range(len(k_h))
]
attn_weights = softmax(attn_logits)  # sum to 1

# Weighted sum of value vectors:
head_out = [
    sum(attn_weights[t] * v_h[t][j] for t in range(len(v_h)))
    for j in range(head_dim)
]
x_attn.extend(head_out)  # concat all heads

# Final projection + residual:
x = linear(x_attn, state_dict['attn_wo'])
x = [a + b for a, b in zip(x, x_residual)]`,
    highlightLines: [2, 3, 6, 9, 10, 15, 16],
    content: {
      heading: "Level 6: Multi-head Attention",
      body: `The attention mechanism lets each token **look back at previous tokens** and gather relevant information.

**Step 1**: Compute logits = Q·K^T / √d (how relevant is each past token?)
**Step 2**: Softmax → attention weights (probabilities summing to 1)
**Step 3**: Weighted sum of Values → what we actually pass forward

The **residual connection** (\`x = x_attn + x_residual\`) is crucial — it lets gradients flow directly from the loss back to the embeddings, preventing vanishing gradients in deeper networks.`,
      insight: {
        question: "Why use `max_val` subtraction in the softmax implementation?",
        answer: "Subtracting the max prevents overflow when exponentiating large logits (e.g., exp(1000) = infinity). It's mathematically equivalent but numerically stable: softmax(x) = softmax(x - max).",
        badge: "Softmax Sage"
      },
      visualType: "attention"
    }
  },
  {
    id: 7,
    title: "The MLP",
    subtitle: "FC1 → ReLU → FC2",
    icon: "Zap",
    color: "orange",
    paramContrib: 2048,
    codeLines: [135, 141],
    code: `# MLP block (after attention):
x_residual = x
x = rmsnorm(x)

# Expand to 4×n_embd = 64 dimensions:
x = linear(x, state_dict['layer0.mlp_fc1'])
x = [xi.relu() for xi in x]  # non-linearity!

# Project back to n_embd = 16:
x = linear(x, state_dict['layer0.mlp_fc2'])

# Residual connection:
x = [a + b for a, b in zip(x, x_residual)]`,
    highlightLines: [6, 7, 10, 12],
    content: {
      heading: "Level 7: The MLP",
      body: `After attention (which mixes information **across tokens**), the MLP processes each token **independently** — it's where the model stores factual knowledge.

**FC1** expands from 16 → 64 dimensions (4×). This wider space lets the model represent complex combinations.
**ReLU** adds non-linearity — without it, the whole network is just a linear transformation.
**FC2** projects back from 64 → 16.

The expand-then-contract pattern acts as a "feature detector" — neurons in the 64-dim layer specialize in specific patterns.`,
      insight: {
        question: "Why does GPT-2 use GeLU while microgpt uses ReLU?",
        answer: "GeLU is smooth (no hard zero cutoff), which can help gradient flow for very deep networks. For tiny microgpt (1 layer), simple ReLU works just as well and is simpler to implement from scratch.",
        badge: "Activation Expert"
      },
      visualType: "mlp"
    }
  },
  {
    id: 8,
    title: "The Loss",
    subtitle: "Cross-entropy via .log()",
    icon: "Target",
    color: "red",
    paramContrib: 432,
    codeLines: [160, 169],
    code: `# Forward through every position in the document:
for pos_id in range(n):
    token_id, target_id = tokens[pos_id], tokens[pos_id + 1]
    logits = gpt(token_id, pos_id, keys, values)
    probs = softmax(logits)  # probabilities for all tokens

    # Cross-entropy: -log(probability of correct token)
    loss_t = -probs[target_id].log()
    losses.append(loss_t)

# Average loss over the document:
loss = (1 / n) * sum(losses)`,
    highlightLines: [8, 12],
    content: {
      heading: "Level 8: The Loss Function",
      body: `The model is trained by **maximum likelihood**: maximize the probability of the correct next character.

This is equivalent to **minimizing cross-entropy**: \`loss = -log(p_correct)\`

When the model is confident and correct, p_correct ≈ 1 → loss ≈ 0.
When the model is wrong or uncertain, p_correct ≈ 0 → loss → ∞.

The **\`.log()\`** method on a Value node records the backprop rule: d(log x)/dx = 1/x. When \`.backward()\` is called, gradients flow back through softmax, through the attention heads, all the way to the embedding matrices.`,
      insight: {
        question: "Why use `math.exp` inside the softmax for converting logits to probabilities?",
        answer: "exp ensures all outputs are positive (probabilities must be ≥ 0), creates a smooth differentiable function, and amplifies differences between logits — making the model more decisive as training progresses.",
        badge: "Log Likelihood"
      },
      visualType: "loss"
    }
  },
  {
    id: 9,
    title: "Adam Optimizer",
    subtitle: "Momentum & velocity buffers",
    icon: "TrendingUp",
    color: "yellow",
    paramContrib: 0,
    codeLines: [146, 182],
    code: `# Adam hyperparameters:
lr, beta1, beta2, eps = 0.01, 0.85, 0.99, 1e-8
m = [0.0] * len(params)  # 1st moment (momentum)
v = [0.0] * len(params)  # 2nd moment (velocity)

for step in range(num_steps):
    # ... forward + backward pass ...

    lr_t = lr * (1 - step / num_steps)  # linear decay
    for i, p in enumerate(params):
        # Exponential moving averages:
        m[i] = beta1 * m[i] + (1 - beta1) * p.grad
        v[i] = beta2 * v[i] + (1 - beta2) * p.grad ** 2
        # Bias correction (important early in training):
        m_hat = m[i] / (1 - beta1 ** (step + 1))
        v_hat = v[i] / (1 - beta2 ** (step + 1))
        # Update:
        p.data -= lr_t * m_hat / (v_hat ** 0.5 + eps)
        p.grad = 0  # reset gradient for next step`,
    highlightLines: [3, 4, 9, 12, 13, 15, 16, 18, 19],
    content: {
      heading: "Level 9: The Adam Optimizer",
      body: `Plain gradient descent (SGD) can be slow and unstable. **Adam** adds two momentum buffers per parameter:

**m** (1st moment): exponential moving average of gradients — smooths the update direction.
**v** (2nd moment): exponential moving average of squared gradients — tracks how large gradients have been.

The update \`m / sqrt(v)\` is a **per-parameter adaptive learning rate**: parameters with historically large gradients get smaller updates (already learned), while rarely-seen parameters get larger updates.

**Bias correction** (dividing by 1-β^t) is critical in early steps when m and v are biased toward zero.`,
      insight: {
        question: "Why does microgpt use beta1=0.85 instead of the standard 0.9?",
        answer: "Lower beta1 makes the optimizer less 'sticky' — it forgets old gradients faster. For a small model training on short sequences, this allows faster adaptation and prevents momentum from overshooting on this tiny dataset.",
        badge: "Adam Whisperer"
      },
      visualType: "adam"
    }
  },
  {
    id: 10,
    title: "Inference",
    subtitle: "Temperature sampling",
    icon: "Sparkles",
    color: "emerald",
    paramContrib: 0,
    codeLines: [187, 200],
    code: `temperature = 0.5  # creativity: (0, 1]

for sample_idx in range(20):
    keys, values = [[] for _ in range(n_layer)], [[] for _ in range(n_layer)]
    token_id = BOS    # start with BOS token
    sample = []

    for pos_id in range(block_size):
        logits = gpt(token_id, pos_id, keys, values)

        # Temperature scaling before softmax:
        probs = softmax([l / temperature for l in logits])

        # Sample from the distribution:
        token_id = random.choices(
            range(vocab_size),
            weights=[p.data for p in probs]
        )[0]

        if token_id == BOS:
            break   # BOS signals end of name
        sample.append(uchars[token_id])
    print(''.join(sample))`,
    highlightLines: [1, 12, 15, 16, 20, 21],
    content: {
      heading: "Level 10: Inference",
      body: `After training, we can **sample new names** autoregressively — one character at a time.

**Temperature** controls creativity:
- **Low T (0.1)**: very confident, picks likely characters → repetitive names
- **T = 1.0**: sample directly from learned probabilities
- **High T (2.0)**: flatten the distribution → more random, creative names

At each step, the model takes the current token, runs through the full transformer, gets a distribution over all chars, samples one, and feeds it back as the next input. This continues until the model outputs BOS (meaning "done").`,
      insight: {
        question: "Why start inference with the BOS token instead of a random character?",
        answer: "BOS is a learned 'start of name' signal. The model has seen BOS at the beginning of every training example, so it's learned to associate BOS with the distribution of name-starting characters (often vowels and common first letters).",
        badge: "Inference Master"
      },
      visualType: "inference"
    }
  }
];

export const TOTAL_PARAMS = 432 + 3072 + 1024 + 2048 + 864;
