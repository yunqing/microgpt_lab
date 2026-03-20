// validate(code) returns { pass: bool, checks: [{label, ok}], message: string }

export const QUIZZES = {
  1: {
    mcqs: [
      {
        question: "Given docs = ['emma', 'noah', 'emma'], what is vocab_size?",
        options: [
          "5  (a, e, m, n, o)",
          "6  (a, e, h, m, n, o)",
          "7  (a, e, h, m, n, o + BOS)",
          "27 (full alphabet + BOS)"
        ],
        correct: 2,
        explanations: [
          "Close — those are the unique chars, but you're missing 'h' from 'noah' and forgetting BOS.",
          "Right unique chars including 'h' from 'noah', but vocab_size = len(uchars) + 1 for BOS.",
          "Correct! uchars = sorted({'a','e','h','m','n','o'}) = 6 chars, then +1 for BOS = 7.",
          "Only if the dataset covered every letter. It's character-level, so vocab = only chars seen."
        ]
      },
      {
        question: "Why does microgpt wrap each name with BOS on BOTH sides (e.g. [BOS, 'e','m','m','a', BOS])?",
        options: [
          "To make all sequences the same length",
          "BOS at start = learn to begin a name; BOS at end = learn to stop generating",
          "It's a mistake — only one BOS is needed",
          "BOS doubles the dataset size for free"
        ],
        correct: 1,
        explanations: [
          "Padding is a different technique. BOS here carries semantic meaning.",
          "Exactly! The leading BOS teaches the model what characters START names. The trailing BOS is the target that teaches it WHEN to stop.",
          "Both serve different purposes. Removing either would hurt generation quality.",
          "BOS doesn't add data — it adds two training signals per name."
        ]
      }
    ],
    codeExercise: {
      title: "Build the Tokenizer",
      description: "Given a list of name strings in `docs`, write the three lines that create: (1) `uchars` — sorted unique characters, (2) `BOS` — the integer id for the special token, (3) `vocab_size` — total number of tokens.",
      template: `# Given: docs (list of name strings)
# Example: docs = ['emma', 'olivia', 'noah', 'liam']

# 1. Get all unique characters, sorted
uchars = # YOUR CODE HERE

# 2. BOS token id = one past the last char id
BOS = # YOUR CODE HERE

# 3. Total vocabulary size
vocab_size = # YOUR CODE HERE`,
      solution: `# Given: docs (list of name strings)

uchars = sorted(set(''.join(docs)))
BOS = len(uchars)
vocab_size = len(uchars) + 1`,
      hints: [
        "For uchars: join all docs into one string with ''.join(docs), then call set() to deduplicate, then sorted() to order them.",
        "BOS is the next integer after all char ids. Since chars are 0..len(uchars)-1, BOS = len(uchars). Then vocab_size = len(uchars) + 1."
      ],
      validate: (code) => {
        const checks = [
          { label: "uchars uses sorted(set(...))", ok: /sorted\s*\(\s*set\s*\(/.test(code) },
          { label: "''.join(docs) concatenates all names", ok: /['"]?['"]?\s*\.join\s*\(\s*docs\s*\)/.test(code) },
          { label: "BOS = len(uchars)", ok: /BOS\s*=\s*len\s*\(\s*uchars\s*\)/.test(code) },
          { label: "vocab_size = len(uchars) + 1", ok: /vocab_size\s*=\s*len\s*\(\s*uchars\s*\)\s*\+\s*1/.test(code) },
        ];
        const pass = checks.every(c => c.ok);
        return { pass, checks, message: pass ? "Perfect tokenizer! You've replicated Karpathy's exact approach." : "Not quite — check the hints below." };
      }
    }
  },

  2: {
    mcqs: [
      {
        question: "In `__mul__`, the local_grads are `(other.data, self.data)`. What does this implement?",
        options: [
          "The product rule: d(a×b)/da = b, d(a×b)/db = a",
          "The chain rule applied to the whole graph",
          "The gradient of loss with respect to the weight",
          "A numerical approximation of the derivative"
        ],
        correct: 0,
        explanations: [
          "Correct! These are just the LOCAL partial derivatives. The chain rule (multiplying by parent.grad) happens in backward().",
          "The chain rule is applied in backward(), not here. __mul__ only stores local gradients.",
          ".grad holds dLoss/d(node), but local_grads holds d(output)/d(input) for just this operation.",
          "This is exact calculus — no approximation needed for multiplication."
        ]
      },
      {
        question: "Why does backward() build a topological order before reversing it?",
        options: [
          "To save memory by processing nodes in batches",
          "To ensure each node's parent.grad is finalized before the node updates its children",
          "Python lists are faster in sorted order",
          "To avoid computing the same gradient twice"
        ],
        correct: 1,
        explanations: [
          "Memory isn't the reason — topological order ensures correctness.",
          "Exactly! In reverse topo order, when we process node v, all nodes that depend on v have already had their .grad set. So v.grad is complete before we propagate to v's children.",
          "The ordering is about computation correctness, not Python performance.",
          "Visiting the same node twice is prevented by the visited set, not topo order."
        ]
      }
    ],
    codeExercise: {
      title: "Implement __add__ for Value",
      description: "The `__mul__` method is shown. Now implement `__add__`. Remember: for z = a + b, the partial derivative dz/da = 1 and dz/db = 1.",
      template: `class Value:
    def __init__(self, data, children=(), local_grads=()):
        self.data = data
        self.grad = 0
        self._children = children
        self._local_grads = local_grads

    # Reference: multiplication
    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        return Value(self.data * other.data, (self, other), (other.data, self.data))

    # Your turn: implement addition
    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        return Value(# YOUR CODE HERE
        )

# Test it:
a = Value(3.0)
b = Value(4.0)
c = a + b
c.grad = 1.0
for child, lg in zip(c._children, c._local_grads):
    child.grad += lg * c.grad
print(a.grad)  # should be 1.0
print(b.grad)  # should be 1.0`,
      solution: `    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        return Value(self.data + other.data, (self, other), (1, 1))`,
      hints: [
        "The pattern is Value(forward_result, children_tuple, local_grads_tuple). For add: forward = self.data + other.data.",
        "The local gradients for addition are both 1 — adding a to the sum by 1 unit increases the output by exactly 1 unit, regardless of the other operand."
      ],
      validate: (code) => {
        const checks = [
          { label: "Returns a new Value(...)", ok: /return\s+Value\s*\(/.test(code) },
          { label: "Forward value is self.data + other.data", ok: /self\.data\s*\+\s*other\.data/.test(code) },
          { label: "Children tuple is (self, other)", ok: /\(\s*self\s*,\s*other\s*\)/.test(code) },
          { label: "Local grads are (1, 1) for addition", ok: /\(\s*1\s*,\s*1\s*\)/.test(code) },
        ];
        const pass = checks.every(c => c.ok);
        return { pass, checks, message: pass ? "Correct! d(a+b)/da = 1 and d(a+b)/db = 1 — the gradient flows through addition unchanged." : "Think about partial derivatives of addition." };
      }
    }
  },

  3: {
    mcqs: [
      {
        question: "wte has shape [vocab_size, n_embd] = [27, 16]. How many trainable parameters is that?",
        options: ["27", "16", "432", "27 + 16 = 43"]
        ,
        correct: 2,
        explanations: [
          "27 is just the number of rows (tokens). Each row has 16 values.",
          "16 is just the embedding dimension. There are 27 such rows.",
          "Correct! 27 rows × 16 columns = 432 parameters. Every token gets its own learned 16-dim vector.",
          "Parameters multiply, they don't add. It's a 27×16 matrix."
        ]
      },
      {
        question: "Why do we ADD token and position embeddings instead of concatenating them?",
        options: [
          "Addition is faster to compute than concatenation",
          "Concatenation would double the dimension (32), adding is parameter-efficient",
          "Addition lets the model learn absolute positions only",
          "Concatenation would break the attention mechanism"
        ],
        correct: 1,
        explanations: [
          "Speed isn't the main reason — the parameter count is.",
          "Right! Adding keeps x at [n_embd=16]. Concatenating would give [32], doubling all downstream weight matrices. The model learns to disentangle token vs position information within the same space.",
          "The opposite — both token and position information are blended together by addition.",
          "Attention would still work with concatenation, just less efficiently."
        ]
      }
    ],
    codeExercise: {
      title: "Combine Token + Position Embeddings",
      description: "Given `tok_emb` and `pos_emb` (each a list of 16 Value objects), write the one-liner that produces `x` — the combined embedding — by adding them element-wise.",
      template: `# Assume these are already looked up:
tok_emb = state_dict['wte'][token_id]  # list of 16 Values
pos_emb = state_dict['wpe'][pos_id]    # list of 16 Values

# Combine: element-wise addition
x = # YOUR CODE HERE

# x should have length 16
# x[i].data ≈ tok_emb[i].data + pos_emb[i].data`,
      solution: `x = [t + p for t, p in zip(tok_emb, pos_emb)]`,
      hints: [
        "You need to add corresponding elements: x[0] = tok_emb[0] + pos_emb[0], x[1] = tok_emb[1] + pos_emb[1], ...",
        "Use a list comprehension with zip: [t + p for t, p in zip(tok_emb, pos_emb)]. The Value.__add__ you studied in Level 2 handles the autograd."
      ],
      validate: (code) => {
        const checks = [
          { label: "Uses a list comprehension [...]", ok: /\[.+for.+\]/.test(code) },
          { label: "Uses zip(tok_emb, pos_emb)", ok: /zip\s*\(\s*tok_emb\s*,\s*pos_emb\s*\)/.test(code) },
          { label: "Adds the two embeddings (t + p)", ok: /\+/.test(code) },
        ];
        const pass = checks.every(c => c.ok);
        return { pass, checks, message: pass ? "Correct! This is literally line 111 in microgpt. Simple but essential." : "Think: how do you add two lists element-wise in Python?" };
      }
    }
  },

  4: {
    mcqs: [
      {
        question: "In rmsnorm, what does the `1e-5` epsilon term prevent?",
        options: [
          "Overflow when values are very large",
          "Division by zero when the input vector is all zeros",
          "Negative scale factors",
          "The gradient from becoming too large"
        ],
        correct: 1,
        explanations: [
          "Large values would make ms large, making scale small — not overflow.",
          "Exactly! If all xi = 0, ms = 0, and (0)**-0.5 = inf. Adding 1e-5 ensures we always divide by at least √(1e-5) ≈ 0.003.",
          "ms = mean of squares, always ≥ 0. (ms + 1e-5) is always positive, so its square root is real and positive.",
          "Epsilon doesn't directly control gradient magnitude — that's what the learning rate and gradient clipping do."
        ]
      },
      {
        question: "After rmsnorm, the RMS of the output vector is approximately:",
        options: [
          "0 — it centers the data",
          "The same as the input RMS",
          "~1 — it normalizes the scale",
          "Depends on the input values"
        ],
        correct: 2,
        explanations: [
          "RMSNorm does NOT subtract the mean. It only rescales. The output is not zero-centered.",
          "If it stayed the same, normalization would have no effect.",
          "Correct! scale = 1/√(ms + ε) ≈ 1/√ms. So RMS(output) = RMS(x / √ms) ≈ √ms / √ms = 1.",
          "That's the whole point of normalization — to make the scale predictable (≈1) regardless of input."
        ]
      }
    ],
    codeExercise: {
      title: "Implement rmsnorm",
      description: "Implement the rmsnorm function. It should: (1) compute the mean of squares, (2) compute the scale factor 1/√(ms + ε), (3) return each element multiplied by scale.",
      template: `def rmsnorm(x):
    # Step 1: mean of squares (epsilon = 1e-5)
    ms = # YOUR CODE HERE

    # Step 2: scale factor = 1 / sqrt(ms + epsilon)
    scale = # YOUR CODE HERE

    # Step 3: normalize
    return [xi * scale for xi in x]

# Given: x (input vector) - will be provided by test
result = rmsnorm(x)`,
      solution: `def rmsnorm(x):
    ms = sum(xi * xi for xi in x) / len(x)
    scale = (ms + 1e-5) ** -0.5
    return [xi * scale for xi in x]`,
      hints: [
        "Mean of squares: ms = sum(xi * xi for xi in x) / len(x). It's the average of each element squared.",
        "Scale = (ms + 1e-5) ** -0.5. Raising to the power -0.5 is the same as 1/sqrt(...)."
      ],
      validate: (code) => {
        const checks = [
          { label: "Computes sum of squares (xi * xi)", ok: /xi\s*\*\s*xi/.test(code) || /xi\s*\*\*\s*2/.test(code) },
          { label: "Divides by len(x) for the mean", ok: /\/\s*len\s*\(\s*x\s*\)/.test(code) },
          { label: "Uses epsilon (1e-5)", ok: /1e-5/.test(code) },
          { label: "Raises to power -0.5 (or equivalent)", ok: /\*\*\s*-0\.5/.test(code) || /sqrt/.test(code) },
          { label: "Returns [xi * scale for xi in x]", ok: /xi\s*\*\s*scale/.test(code) },
        ];
        const pass = checks.every(c => c.ok);
        return { pass, checks, message: pass ? "Correct! This is the exact rmsnorm used in LLaMA and Mistral too." : "Review the formula: output = x / sqrt(mean(x²) + ε)" };
      }
    }
  },

  5: {
    mcqs: [
      {
        question: "Why are attention logits scaled by dividing by `head_dim ** 0.5`?",
        options: [
          "To keep values in the range [0, 1] for softmax",
          "Because dot products grow in magnitude with dimension, pushing softmax toward saturation",
          "To normalize the attention weights to sum to 1",
          "It's a learning rate adjustment for the attention layer"
        ],
        correct: 1,
        explanations: [
          "Softmax can handle any range — scaling isn't about range, it's about gradient flow.",
          "Correct! If q and k are random with std≈1, their dot product has std≈√d. Dividing by √d brings std back to ~1, keeping softmax in a well-behaved regime where gradients flow.",
          "Softmax (applied after) handles the sum-to-1 normalization. The scaling is about preventing saturation before softmax.",
          "It's not a learning rate — it's a fixed mathematical correction for the geometry of high-dimensional dot products."
        ]
      },
      {
        question: "With n_embd=16 and n_head=4, what is head_dim?",
        options: ["4", "8", "16", "64"]
        ,
        correct: 0,
        explanations: [
          "Correct! head_dim = n_embd // n_head = 16 // 4 = 4. Each head gets its own 4-dimensional subspace.",
          "That would be n_embd // 2. We divide by n_head=4, not 2.",
          "That's n_embd itself. head_dim is the per-head dimension after splitting.",
          "64 = 4 × n_embd. That's the MLP expansion size, not head_dim."
        ]
      }
    ],
    codeExercise: {
      title: "Compute Attention Logits",
      description: "Given query vector `q_h` and a list of key vectors `k_h` (one per past token), compute the attention logits. Each logit is the dot product of q_h with one k_h[t], scaled by 1/√head_dim.",
      template: `# Given: q_h (query vector), k_h (list of key vectors), head_dim

# Compute one logit per past token:
# logit[t] = dot(q_h, k_h[t]) / sqrt(head_dim)
attn_logits = [
    # YOUR CODE HERE
    for t in range(len(k_h))
]`,
      solution: `# Given: q_h, k_h, head_dim

attn_logits = [
    sum(q_h[j] * k_h[t][j] for j in range(head_dim)) / head_dim**0.5
    for t in range(len(k_h))
]`,
      hints: [
        "Each logit is a dot product: Σ q_h[j] * k_h[t][j] for j in range(head_dim). Use sum() with a generator.",
        "After the dot product, divide by head_dim**0.5 (= √4 = 2.0). The full expression: sum(q_h[j] * k_h[t][j] for j in range(head_dim)) / head_dim**0.5"
      ],
      validate: (code) => {
        const checks = [
          { label: "Uses sum(...) for dot product", ok: /sum\s*\(/.test(code) },
          { label: "Multiplies q_h[j] * k_h[t][j]", ok: /q_h\s*\[.*\]\s*\*\s*k_h\s*\[.*\]/.test(code) },
          { label: "Iterates j in range(head_dim)", ok: /for\s+j\s+in\s+range\s*\(\s*head_dim\s*\)/.test(code) },
          { label: "Scales by / head_dim**0.5", ok: /\/\s*head_dim\s*\*\*\s*0\.5/.test(code) },
        ];
        const pass = checks.every(c => c.ok);
        return { pass, checks, message: pass ? "Spot on! This is the heart of scaled dot-product attention." : "Build it step by step: dot product first, then scale." };
      }
    }
  },

  6: {
    mcqs: [
      {
        question: "After softmax, attention weights for a query always:",
        options: [
          "Are all equal (uniform distribution)",
          "Sum to 1 and are all non-negative",
          "Are between -1 and 1",
          "Depend on the number of attention heads"
        ],
        correct: 1,
        explanations: [
          "Uniform only happens when all logits are equal. After training, weights vary based on relevance.",
          "Correct! softmax outputs are exp(x_i)/Σexp(x_j) — always positive (exp > 0) and they sum to 1 by construction.",
          "Softmax outputs are always in (0, 1), never negative. The logits (before softmax) can be any real number.",
          "The number of heads affects how the vectors are split, not the softmax property itself."
        ]
      },
      {
        question: "What does the residual connection `x = x_attn + x_residual` accomplish?",
        options: [
          "It doubles the model's capacity",
          "It prevents the attention layer from learning anything new",
          "It lets gradients flow directly to earlier layers, preventing vanishing gradients",
          "It averages the attention output with the input"
        ],
        correct: 2,
        explanations: [
          "Residuals don't double capacity — they help gradients flow during backprop.",
          "The attention output x_attn is still learned. The residual just adds it on top of the input, not replace it.",
          "Correct! The gradient of the loss flows directly back through the + to x_residual without passing through attention. This is what allows training very deep networks.",
          "It's addition, not averaging. x_attn is added at full strength, not halved."
        ]
      }
    ],
    codeExercise: {
      title: "Compute the Attention Output",
      description: "Given attention weights `attn_weights` (sums to 1) and value vectors `v_h` (one per past token, each of length head_dim), compute `head_out`: the weighted sum of value vectors.",
      template: `# Given: attn_weights (list of weights, sum=1), v_h (list of value vectors), head_dim

# head_out[j] = sum over t of: attn_weights[t] * v_h[t][j]
head_out = [
    # YOUR CODE HERE
    for j in range(head_dim)
]`,
      solution: `# Given: attn_weights, v_h, head_dim

head_out = [
    sum(attn_weights[t] * v_h[t][j] for t in range(len(v_h)))
    for j in range(head_dim)
]`,
      hints: [
        "For each output dimension j, you compute a weighted average across all time steps t. For j=0: 0.1*1.0 + 0.6*0.0 + 0.3*0.5 = 0.25",
        "Use: sum(attn_weights[t] * v_h[t][j] for t in range(len(v_h))). The outer list comprehension iterates over j (dimensions), inner sum iterates over t (time)."
      ],
      validate: (code) => {
        const checks = [
          { label: "List comprehension for j in range(head_dim)", ok: /for\s+j\s+in\s+range\s*\(\s*head_dim\s*\)/.test(code) },
          { label: "sum(...) over time steps t", ok: /sum\s*\(/.test(code) },
          { label: "Multiplies attn_weights[t] * v_h[t][j]", ok: /attn_weights\s*\[.*\]\s*\*\s*v_h\s*\[.*\]/.test(code) },
          { label: "Iterates t in range(len(v_h))", ok: /for\s+t\s+in\s+range\s*\(\s*len\s*\(\s*v_h\s*\)\s*\)/.test(code) },
        ];
        const pass = checks.every(c => c.ok);
        return { pass, checks, message: pass ? "Perfect! This is the attention-weighted 'read' from past tokens." : "Think: for each output position j, take a weighted sum across all past values." };
      }
    }
  },

  7: {
    mcqs: [
      {
        question: "The MLP expands from n_embd=16 to 4*n_embd=64, then contracts back to 16. Why expand at all?",
        options: [
          "To slow down training so the model doesn't overfit",
          "The wider middle layer gives neurons room to specialize in detecting specific patterns",
          "64 dimensions is needed for the attention mechanism to work",
          "It balances out the dimensionality reduction in attention heads"
        ],
        correct: 1,
        explanations: [
          "Wider MLPs actually help generalization, not hurt it (within reason).",
          "Correct! The 64-dim hidden layer is where 'knowledge storage' happens. Research in mechanistic interpretability shows individual MLP neurons activate for specific linguistic or factual patterns.",
          "The MLP and attention are separate blocks. Attention head dim is set independently.",
          "Attention heads don't reduce dimensionality — each head processes head_dim=4 but the concat output is still n_embd=16."
        ]
      },
      {
        question: "After ReLU in the MLP, some neurons output exactly 0. These are called 'dead neurons' for that input. What's the consequence?",
        options: [
          "The model crashes — dead neurons must be avoided",
          "Their gradient is 0, so they don't contribute to this forward pass",
          "They output -1 instead, keeping the gradient alive",
          "Dead neurons increase the loss directly"
        ],
        correct: 1,
        explanations: [
          "Dead neurons are normal and expected. ~50% of ReLU neurons are 0 for any given input.",
          "Correct! d(relu(x))/dx = 0 when x ≤ 0. Those neurons neither contribute to the output nor receive gradient. This sparsity is actually useful — different neurons activate for different inputs.",
          "ReLU clips at 0, not -1. That would be a 'leaky ReLU' variant.",
          "Dead neurons just pass 0 forward. The loss is only affected by the non-zero neurons."
        ]
      }
    ],
    codeExercise: {
      title: "Implement the MLP Forward Pass",
      description: "Complete the MLP forward pass. You need to: (1) expand with FC1 using linear(), (2) apply relu() to each element, (3) contract with FC2 using linear().",
      template: `def linear(x, w):
    return [sum(wi * xi for wi, xi in zip(wo, x)) for wo in w]

def rmsnorm(x):
    ms = sum(xi * xi for xi in x) / len(x)
    scale = (ms + 1e-5) ** -0.5
    return [xi * scale for xi in x]

def relu(v):
    return max(0, v)  # for a scalar Value or float

# Given: x, mlp_fc1, mlp_fc2 (will be provided by test)
# Implement MLP forward pass
h = linear(x, mlp_fc1)         # Step 1: expand

h = # YOUR CODE HERE           # Step 2: apply ReLU element-wise

h = linear(h, mlp_fc2)         # Step 3: contract

out = h                        # Output (no residual for simplicity)`,
      solution: `# Given: x, mlp_fc1, mlp_fc2, linear() and relu() functions

h = linear(x, mlp_fc1)
h = [relu(xi) for xi in h]
h = linear(h, mlp_fc2)
out = h`,
      hints: [
        "Steps 1 and 3 use linear(x, weight_matrix) or linear(h, weight_matrix). Step 2 applies relu to every element: [relu(xi) for xi in h].",
        "The full pattern: h = linear(x, mlp_fc1), then h = [relu(xi) for xi in h], then h = linear(h, mlp_fc2), finally out = h."
      ],
      validate: (code) => {
        const checks = [
          { label: "FC1 expansion: linear(..., mlp_fc1)", ok: /linear\s*\([^)]*mlp_fc1\s*\)/.test(code) },
          { label: "ReLU applied element-wise", ok: /relu/.test(code) && /for\s+\w+\s+in\s+/.test(code) },
          { label: "FC2 contraction: linear(..., mlp_fc2)", ok: /linear\s*\([^)]*mlp_fc2\s*\)/.test(code) },
        ];
        const pass = checks.every(c => c.ok);
        return { pass, checks, message: pass ? "Excellent! You've implemented the MLP forward pass." : "Follow the 3 steps: FC1 → ReLU → FC2." };
      }
    }
  },

  8: {
    mcqs: [
      {
        question: "If the model assigns probability 0.9 to the correct next token, what is the cross-entropy loss?",
        options: [
          "0.9",
          "0.1",
          "-log(0.9) ≈ 0.105",
          "-log(0.1) ≈ 2.303"
        ],
        correct: 2,
        explanations: [
          "The loss is -log(p), not p itself.",
          "0.1 = 1 - p, which is the error rate, not the loss.",
          "Correct! loss = -log(0.9) ≈ 0.105. High confidence in the right answer → very low loss.",
          "That would be the loss if p=0.1. -log(0.9) is much smaller because 0.9 is close to 1."
        ]
      },
      {
        question: "Why do we average the loss over all positions in the document: `(1/n) * sum(losses)`?",
        options: [
          "To keep loss values small so they don't overflow",
          "So that long documents don't contribute more gradient than short ones",
          "Because only the average loss is differentiable",
          "To match the PyTorch CrossEntropyLoss default behavior"
        ],
        correct: 1,
        explanations: [
          "Loss values rarely overflow — this isn't the motivation.",
          "Correct! Without averaging, a 15-char name would push gradients 15× harder than a 3-char name. Averaging normalizes each document's contribution regardless of length.",
          "All the individual losses are differentiable too — averaging doesn't affect differentiability.",
          "It's a principled mathematical choice, not a framework-matching decision."
        ]
      }
    ],
    codeExercise: {
      title: "Compute Cross-Entropy Loss",
      description: "Given `probs` (list of probabilities from softmax, one per token in vocab) and `target_id` (index of the correct next token), compute the cross-entropy loss for this single prediction.",
      template: `import math

# Given: probs (probability distribution, sum=1), target_id (correct token index)

# Cross-entropy: negative log probability of the correct token
loss = # YOUR CODE HERE`,
      solution: `import math

# Given: probs, target_id

loss = -math.log(probs[target_id])`,
      hints: [
        "Cross-entropy for a single example is just: -log(probability of the correct class). You need probs[target_id] and math.log().",
        "It's literally one line: loss = -math.log(probs[target_id]). In microgpt, probs[target_id] is a Value object, so it would be: loss = -probs[target_id].log()"
      ],
      validate: (code) => {
        const checks = [
          { label: "Uses -log(...) (negative log)", ok: /-\s*(math\.log|log)/.test(code) || /log.*\*\s*-1/.test(code) },
          { label: "Indexes into probs with target_id", ok: /probs\s*\[\s*target_id\s*\]/.test(code) },
          { label: "Assigns result to loss", ok: /loss\s*=/.test(code) },
        ];
        const pass = checks.every(c => c.ok);
        return { pass, checks, message: pass ? "Perfect! This single line is the objective function that drives all of training." : "Cross-entropy = -log(p_correct). You need one indexing and one log." };
      }
    }
  },

  9: {
    mcqs: [
      {
        question: "Adam maintains two buffers per parameter: m (1st moment) and v (2nd moment). What do they represent?",
        options: [
          "m = current gradient, v = previous gradient",
          "m = exponential moving average of gradients, v = EMA of squared gradients",
          "m = model weights, v = velocity of weight updates",
          "m = mean gradient across the batch, v = variance across the batch"
        ],
        correct: 1,
        explanations: [
          "m is not the raw gradient — it's a smoothed (EMA) version that reduces noise.",
          "Correct! m smooths gradient direction (like momentum). v tracks how large gradients have been (adaptive lr). Together: m/√v = normalized gradient direction × adaptive step.",
          "m and v are optimizer state, not model weights. The actual weight is p.data.",
          "microgpt trains on one document at a time (batch size = 1). m/v are temporal averages across steps, not spatial averages across a batch."
        ]
      },
      {
        question: "Why is bias correction (`m_hat = m / (1 - beta1**(step+1))`) needed in early training?",
        options: [
          "To prevent the learning rate from going negative",
          "Because m and v are initialized to 0, making early estimates biased toward zero",
          "To correct for the learning rate decay schedule",
          "It's only needed when beta1 > 0.9"
        ],
        correct: 1,
        explanations: [
          "Adam's learning rate can't go negative — lr and √v are always positive.",
          "Correct! At step 1, m = (1-0.85)*grad ≈ 0.15*grad — much smaller than grad itself. Dividing by (1-0.85^1) = 0.15 scales it back up to grad. Without this, early updates are tiny.",
          "Bias correction is separate from lr decay. lr decay (lr_t) is a different line in the code.",
          "Bias correction is needed for any beta < 1. microgpt uses beta1=0.85, well below 0.9."
        ]
      }
    ],
    codeExercise: {
      title: "Implement One Adam Step",
      description: "Complete one Adam parameter update. Given: gradient `g`, previous moment estimates `m_prev` and `v_prev`, step number `t`, and hyperparameters.",
      template: `# Given: g (gradient), m_prev, v_prev, t (step number), beta1, beta2, lr, eps

# Step 1: update 1st moment (momentum)
m = # YOUR CODE HERE

# Step 2: update 2nd moment (velocity)
v = # YOUR CODE HERE

# Step 3: bias correction
m_hat = # YOUR CODE HERE
v_hat = # YOUR CODE HERE

# Step 4: compute parameter update (how much to subtract from p.data)
update = # YOUR CODE HERE`,
      solution: `# Given: g, m_prev, v_prev, t, beta1, beta2, lr, eps

m = beta1 * m_prev + (1 - beta1) * g
v = beta2 * v_prev + (1 - beta2) * g ** 2
m_hat = m / (1 - beta1 ** t)
v_hat = v / (1 - beta2 ** t)
update = lr * m_hat / (v_hat ** 0.5 + eps)`,
      hints: [
        "m = beta1 * m_prev + (1 - beta1) * g  — this is an exponential moving average. v = beta2 * v_prev + (1 - beta2) * g**2  — same pattern but for squared gradients.",
        "Bias correction: m_hat = m / (1 - beta1**t), v_hat = v / (1 - beta2**t). Update: lr * m_hat / (sqrt(v_hat) + eps). In Python: v_hat**0.5 is sqrt."
      ],
      validate: (code) => {
        const checks = [
          { label: "m = beta1 * m_prev + (1-beta1) * g", ok: /beta1\s*\*\s*m_prev/.test(code) && /\(\s*1\s*-\s*beta1\s*\)\s*\*\s*g/.test(code) },
          { label: "v uses g**2 (squared gradient)", ok: /g\s*\*\*\s*2/.test(code) || /g\s*\*\s*g/.test(code) },
          { label: "Bias correction: m / (1 - beta1**t)", ok: /m\s*\/\s*\(\s*1\s*-\s*beta1\s*\*\*\s*t\s*\)/.test(code) },
          { label: "Bias correction: v / (1 - beta2**t)", ok: /v\s*\/\s*\(\s*1\s*-\s*beta2\s*\*\*\s*t\s*\)/.test(code) },
          { label: "Update: lr * m_hat / (sqrt(v_hat) + eps)", ok: /v_hat\s*\*\*\s*0\.5/.test(code) || /sqrt\s*\(\s*v_hat/.test(code) },
        ];
        const pass = checks.every(c => c.ok);
        return { pass, checks, message: pass ? "You've implemented Adam from scratch — the same optimizer used to train GPT-4." : "Implement all 4 steps: update m, update v, bias correct both, compute update." };
      }
    }
  },

  10: {
    mcqs: [
      {
        question: "At temperature → 0, sampling from the model becomes:",
        options: [
          "Completely random (uniform distribution)",
          "Equivalent to always picking the highest-probability token (greedy)",
          "Equivalent to training with a lower learning rate",
          "Undefined — temperature cannot be zero"
        ],
        correct: 1,
        explanations: [
          "That's temperature → ∞, not → 0. At high T, all logits become equal → uniform.",
          "Correct! Dividing by a tiny T makes the logit differences enormous. Softmax of [1000, -1000] ≈ [1, 0] — it's effectively argmax.",
          "Temperature at inference is independent of training. It doesn't affect the weights.",
          "Mathematically the limit is argmax. In practice, a very small T like 0.01 is used instead of exactly 0."
        ]
      },
      {
        question: "Why start inference with the BOS token (not a random character)?",
        options: [
          "BOS is the only token with a trained embedding",
          "The model has learned that BOS predicts name-starting character distributions",
          "Starting with a letter would cause an infinite loop",
          "BOS makes the output names longer on average"
        ],
        correct: 1,
        explanations: [
          "All tokens have trained embeddings, including regular letters.",
          "Correct! Every training example started with BOS → first_char. The model has learned P(first_char | BOS) from thousands of name examples, so BOS correctly triggers 'start a name' behavior.",
          "Any token can start the sequence. BOS is chosen for its semantic meaning.",
          "BOS has no effect on name length — that's controlled by when the model next predicts BOS."
        ]
      }
    ],
    codeExercise: {
      title: "Implement Temperature Sampling",
      description: "Complete the inference loop's sampling step. Scale the logits by temperature, convert to probabilities with softmax, then sample a token id.",
      template: `import math, random

def softmax(logits):
    max_val = max(logits)
    exps = [math.exp(v - max_val) for v in logits]
    total = sum(exps)
    return [e / total for e in exps]

# Given: logits (model output), temperature (scaling factor)

# Step 1: scale logits by temperature, then softmax
probs = softmax(# YOUR CODE HERE
)

# Step 2: sample a token id from the distribution
token_id = random.choices(
    range(len(logits)),
    weights=# YOUR CODE HERE
)[0]`,
      solution: `# Given: logits, temperature (and softmax function, random module)

probs = softmax([l / temperature for l in logits])
token_id = random.choices(range(len(logits)), weights=probs)[0]`,
      hints: [
        "Temperature scaling: divide EACH logit by temperature before softmax. Use a list comprehension: [l / temperature for l in logits].",
        "random.choices(population, weights=...) samples from the population with given weights. Pass probs directly as the weights list — they already sum to 1."
      ],
      validate: (code) => {
        const checks = [
          { label: "Divides logits by temperature: l / temperature", ok: /l\s*\/\s*temperature/.test(code) },
          { label: "List comprehension for scaled logits", ok: /\[\s*l\s*\/\s*temperature\s+for\s+l\s+in\s+logits\s*\]/.test(code) },
          { label: "random.choices with weights=probs", ok: /random\.choices/.test(code) && /weights\s*=\s*probs/.test(code) },
        ];
        const pass = checks.every(c => c.ok);
        return { pass, checks, message: pass ? "You've completed the full microgpt pipeline — from dataset to inference!" : "Two parts: scale logits before softmax, then use random.choices with the probs as weights." };
      }
    }
  }
};
