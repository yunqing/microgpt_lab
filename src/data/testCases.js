/**
 * Test cases for code exercises
 * Each level has multiple test cases to validate correctness
 */

export const TEST_CASES = {
  // Level 1: Tokenizer
  1: {
    testCases: [
      {
        description: 'Basic tokenizer with 4 names',
        setupCode: "docs = ['emma', 'olivia', 'noah', 'liam']",
        checkVariables: ['uchars', 'BOS', 'vocab_size'],
        expectedOutputs: {
          uchars: ['a', 'e', 'h', 'i', 'l', 'm', 'n', 'o', 'v'],
          BOS: 9,
          vocab_size: 10
        }
      },
      {
        description: 'Edge case: single character names',
        setupCode: "docs = ['a', 'b']",
        checkVariables: ['uchars', 'BOS', 'vocab_size'],
        expectedOutputs: {
          uchars: ['a', 'b'],
          BOS: 2,
          vocab_size: 3
        }
      },
      {
        description: 'Repeated characters should be deduplicated',
        setupCode: "docs = ['aaa', 'bbb', 'abc']",
        checkVariables: ['uchars', 'BOS', 'vocab_size'],
        expectedOutputs: {
          uchars: ['a', 'b', 'c'],
          BOS: 3,
          vocab_size: 4
        }
      }
    ]
  },

  // Level 2: Autograd __add__
  2: {
    testCases: [
      {
        description: 'Simple addition: 3.0 + 4.0',
        setupCode: '',
        postCode: `
a = Value(3.0)
b = Value(4.0)
c = a + b
_c_data = c.data
_c_has_children = len(c._children) > 0
`,
        checkVariables: ['_c_data', '_c_has_children'],
        expectedOutputs: {
          _c_data: 7.0,
          _c_has_children: true
        }
      },
      {
        description: 'Addition with zero',
        setupCode: '',
        postCode: `
a = Value(0.0)
b = Value(5.0)
c = a + b
_c_data = c.data
_c_has_children = len(c._children) > 0
`,
        checkVariables: ['_c_data', '_c_has_children'],
        expectedOutputs: {
          _c_data: 5.0,
          _c_has_children: true
        }
      },
      {
        description: 'Addition with negative numbers',
        setupCode: '',
        postCode: `
a = Value(-2.5)
b = Value(7.5)
c = a + b
_c_data = c.data
_c_has_children = len(c._children) > 0
`,
        checkVariables: ['_c_data', '_c_has_children'],
        expectedOutputs: {
          _c_data: 5.0,
          _c_has_children: true
        }
      },
      {
        description: 'Gradient check: a.grad and b.grad should both be 1.0',
        setupCode: '',
        postCode: `
a = Value(3.0)
b = Value(4.0)
c = a + b
c.grad = 1.0
for child, lg in zip(c._children, c._local_grads):
    child.grad += lg * c.grad
_a_grad = a.grad
_b_grad = b.grad
`,
        checkVariables: ['_a_grad', '_b_grad'],
        expectedOutputs: {
          _a_grad: 1.0,
          _b_grad: 1.0
        }
      }
    ]
  },

  // Level 3: Token + Position Embeddings
  3: {
    testCases: [
      {
        description: 'Embedding addition for 3 tokens',
        setupCode: `
wte = [[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]
wpe = [[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]
token_ids = [0, 1, 2]
`,
        checkVariables: ['x'],
        expectedOutputs: {
          x: [1.1, 2.2]
        },
        tolerance: 1e-4
      },
      {
        description: 'Single token embedding',
        setupCode: `
wte = [[10.0, 20.0]]
wpe = [[1.0, 2.0]]
token_ids = [0]
`,
        checkVariables: ['x'],
        expectedOutputs: {
          x: [11.0, 22.0]
        },
        tolerance: 1e-4
      }
    ]
  },

  // Level 4: RMSNorm
  4: {
    testCases: [
      {
        description: 'Standard vector normalization',
        setupCode: 'x = [2.0, 4.0, 0.0, -4.0]',
        checkVariables: ['result'],
        expectedOutputs: {
          result: [0.6666662962966049, 1.3333325925932098, 0.0, -1.3333325925932098]
        },
        tolerance: 1e-3
      },
      {
        description: 'All zeros (epsilon prevents division by zero)',
        setupCode: 'x = [0.0, 0.0, 0.0]',
        checkVariables: ['result'],
        expectedOutputs: {
          result: [0.0, 0.0, 0.0]
        },
        tolerance: 1e-3
      },
      {
        description: 'Single element vector',
        setupCode: 'x = [5.0]',
        checkVariables: ['result'],
        expectedOutputs: {
          result: [1.0]
        },
        tolerance: 1e-3
      }
    ]
  },

  // Level 5: Attention Logits (Q·K / sqrt(head_dim))
  5: {
    testCases: [
      {
        description: 'Compute attention logits for 3 past tokens',
        setupCode: `
q_h = [1.0, 0.5, -0.5, 0.25]
k_h = [[0.5, 0.5, 0.5, 0.5], [1.0, 0.0, -1.0, 0.0], [0.25, 0.75, 0.25, 0.75]]
head_dim = 4
`,
        checkVariables: ['attn_logits'],
        expectedOutputs: {
          attn_logits: [0.3125, 0.75, 0.28125]
        },
        tolerance: 1e-4
      },
      {
        description: 'Single past token',
        setupCode: `
q_h = [2.0, 2.0]
k_h = [[1.0, 1.0]]
head_dim = 2
`,
        checkVariables: ['attn_logits'],
        expectedOutputs: {
          attn_logits: [2.8284271247461903]
        },
        tolerance: 1e-3
      }
    ]
  },

  // Level 6: Attention Output (weighted sum of values)
  6: {
    testCases: [
      {
        description: 'Weighted sum of value vectors',
        setupCode: `
attn_weights = [0.2, 0.3, 0.5]
v_h = [[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]
head_dim = 2
`,
        checkVariables: ['head_out'],
        expectedOutputs: {
          head_out: [3.6, 4.6]
        },
        tolerance: 1e-4
      },
      {
        description: 'One-hot weights (should select first vector)',
        setupCode: `
attn_weights = [1.0, 0.0, 0.0]
v_h = [[10.0, 20.0], [30.0, 40.0], [50.0, 60.0]]
head_dim = 2
`,
        checkVariables: ['head_out'],
        expectedOutputs: {
          head_out: [10.0, 20.0]
        },
        tolerance: 1e-4
      },
      {
        description: 'Uniform weights (average)',
        setupCode: `
attn_weights = [0.33333, 0.33333, 0.33334]
v_h = [[1.0, 2.0], [4.0, 5.0], [7.0, 8.0]]
head_dim = 2
`,
        checkVariables: ['head_out'],
        expectedOutputs: {
          head_out: [4.0, 5.0]
        },
        tolerance: 1e-2
      }
    ]
  },

  // Level 7: MLP Block
  7: {
    testCases: [
      {
        description: 'MLP forward pass with ReLU',
        setupCode: `
def linear(x, W):
    return [sum(xi * wi for xi, wi in zip(x, row)) for row in W]

x = [1.0, 2.0]
mlp_fc1 = [[1.0, 0.5], [-0.5, 1.0], [0.0, -1.0]]
mlp_fc2 = [[1.0, 0.0, 0.5], [0.5, 1.0, 0.0]]
`,
        checkVariables: ['out'],
        expectedOutputs: {
          out: [2.0, 2.5]
        },
        tolerance: 1e-4
      },
      {
        description: 'ReLU clipping negative values',
        setupCode: `
def linear(x, W):
    return [sum(xi * wi for xi, wi in zip(x, row)) for row in W]

x = [1.0, -2.0]
mlp_fc1 = [[1.0, 1.0], [1.0, 1.0]]
mlp_fc2 = [[1.0, 1.0], [1.0, 1.0]]
`,
        checkVariables: ['out'],
        expectedOutputs: {
          out: [0.0, 0.0]
        },
        tolerance: 1e-4
      }
    ]
  },

  // Level 8: Cross-Entropy Loss
  8: {
    testCases: [
      {
        description: 'Loss for confident correct prediction',
        setupCode: `
import math
probs = [0.1, 0.2, 0.7]
target_id = 2
`,
        checkVariables: ['loss'],
        expectedOutputs: {
          loss: 0.35667494393873245
        },
        tolerance: 1e-4
      },
      {
        description: 'Loss for perfect prediction',
        setupCode: `
import math
probs = [0.0, 0.0, 1.0]
target_id = 2
`,
        checkVariables: ['loss'],
        expectedOutputs: {
          loss: 0.0
        },
        tolerance: 1e-4
      },
      {
        description: 'Loss for wrong prediction',
        setupCode: `
import math
probs = [0.9, 0.05, 0.05]
target_id = 2
`,
        checkVariables: ['loss'],
        expectedOutputs: {
          loss: 2.995732273553991
        },
        tolerance: 1e-3
      }
    ]
  },

  // Level 9: Adam Optimizer
  9: {
    testCases: [
      {
        description: 'Adam update step t=1',
        setupCode: `
g = 0.5
m_prev = 0.0
v_prev = 0.0
beta1 = 0.85
beta2 = 0.95
lr = 0.001
eps = 1e-8
t = 1
`,
        checkVariables: ['m', 'v', 'm_hat', 'v_hat', 'update'],
        expectedOutputs: {
          m: 0.075,
          v: 0.0125,
          m_hat: 0.5,
          v_hat: 0.25,
          update: 0.001
        },
        tolerance: 1e-4
      },
      {
        description: 'Adam update step t=10',
        setupCode: `
g = 0.1
m_prev = 0.05
v_prev = 0.01
beta1 = 0.85
beta2 = 0.95
lr = 0.001
eps = 1e-8
t = 10
`,
        checkVariables: ['m', 'v', 'm_hat', 'v_hat'],
        expectedOutputs: {
          m: 0.0575,
          v: 0.0100,
          m_hat: 0.07186,
          v_hat: 0.01607
        },
        tolerance: 1e-4
      }
    ]
  },

  // Level 10: Temperature Sampling
  10: {
    testCases: [
      {
        description: 'Temperature scaling T=1.0 (no change)',
        setupCode: `
import random
random.seed(42)
logits = [1.0, 2.0, 3.0]
temperature = 1.0
`,
        checkVariables: ['probs'],
        expectedOutputs: {
          probs: [0.09003057317038046, 0.24472847105479767, 0.6652409557748219]
        },
        tolerance: 1e-3
      },
      {
        description: 'Temperature scaling T=0.5 (sharper)',
        setupCode: `
import random
random.seed(42)
logits = [1.0, 2.0, 3.0]
temperature = 0.5
`,
        checkVariables: ['probs'],
        expectedOutputs: {
          probs: [0.03511903307668212, 0.1596620636396885, 0.8052189032836294]
        },
        tolerance: 1e-3
      },
      {
        description: 'Probabilities should sum to 1',
        setupCode: `
import random
random.seed(42)
logits = [0.5, 1.5, 2.5, 3.5]
temperature = 0.8
`,
        checkVariables: ['probs'],
        expectedOutputs: {
          probs: [0.03877420996889534, 0.10518344917816593, 0.28580865691318224, 0.5702336839397565]
        },
        tolerance: 1e-3
      }
    ]
  }
};
