# Code Exercise Template Fixes

## Problem

The code exercise templates were defining input variables (like `docs`, `x`, `logits`, etc.) that were supposed to come from test case setup code. This caused all test cases to use the same hardcoded values instead of the different test inputs.

**Example Issue**: Level 1 test case 2 wanted to test with `docs = ['a', 'b']` but the template had `docs = ['emma', 'olivia', 'noah', 'liam']`, so the user's code would overwrite the test setup.

## Solution

Removed hardcoded input variable definitions from templates and replaced them with comments indicating that these variables are provided. This allows test cases to properly inject different input values.

---

## Changes Made

### Level 1: Tokenizer
**Before**:
```python
docs = ['emma', 'olivia', 'noah', 'liam']

# 1. Get all unique characters, sorted
uchars = # YOUR CODE HERE
```

**After**:
```python
# Given: docs (list of name strings)
# Example: docs = ['emma', 'olivia', 'noah', 'liam']

# 1. Get all unique characters, sorted
uchars = # YOUR CODE HERE
```

**Impact**: Now test cases can provide different `docs` values (e.g., `['a', 'b']`, `['aaa', 'bbb', 'abc']`)

---

### Level 4: RMSNorm
**Before**:
```python
def rmsnorm(x):
    # ... function implementation ...
    return [xi * scale for xi in x]

# Test:
x = [2.0, 4.0, 0.0, -4.0]
result = rmsnorm(x)
print([round(r, 3) for r in result])
```

**After**:
```python
def rmsnorm(x):
    # ... function implementation ...
    return [xi * scale for xi in x]

# Given: x (input vector) - will be provided by test
result = rmsnorm(x)
```

**Impact**: Test cases can now provide different `x` values

---

### Level 5: Attention Logits
**Before**:
```python
head_dim = 4
q_h = [0.5, -0.3, 0.8, 0.1]
k_h = [
    [0.2, 0.4, -0.1, 0.9],
    [0.7, -0.2, 0.5, 0.3],
    [0.1, 0.8, 0.2, -0.5],
]

attn_logits = [
    # YOUR CODE HERE
    for t in range(len(k_h))
]
```

**After**:
```python
# Given: q_h (query vector), k_h (list of key vectors), head_dim

# Compute one logit per past token:
# logit[t] = dot(q_h, k_h[t]) / sqrt(head_dim)
attn_logits = [
    # YOUR CODE HERE
    for t in range(len(k_h))
]
```

**Impact**: Test cases can provide different query/key vectors and dimensions

---

### Level 6: Attention Output
**Before**:
```python
head_dim = 4
attn_weights = [0.1, 0.6, 0.3]
v_h = [
    [1.0, 0.0, -1.0, 0.5],
    [0.0, 1.0,  0.5, 0.2],
    [0.5, 0.5,  0.0, 0.8],
]

head_out = [
    # YOUR CODE HERE
    for j in range(head_dim)
]
```

**After**:
```python
# Given: attn_weights (list of weights, sum=1), v_h (list of value vectors), head_dim

# head_out[j] = sum over t of: attn_weights[t] * v_h[t][j]
head_out = [
    # YOUR CODE HERE
    for j in range(head_dim)
]
```

**Impact**: Test cases can provide different attention weights and value vectors

---

### Level 7: MLP Block
**Before** (defined a function but test expected `out` variable):
```python
def mlp_block(x, mlp_fc1, mlp_fc2):
    x_residual = x
    x = rmsnorm(x)

    # Step 1: expand 16 → 64
    x = # YOUR CODE HERE

    # ... more steps ...

    return x
```

**After** (simplified to direct computation):
```python
# Given: x, mlp_fc1, mlp_fc2 (will be provided by test)
# Implement MLP forward pass
h = linear(x, mlp_fc1)         # Step 1: expand

h = # YOUR CODE HERE           # Step 2: apply ReLU element-wise

h = linear(h, mlp_fc2)         # Step 3: contract

out = h                        # Output (no residual for simplicity)
```

**Impact**: Matches test case expectations (checks `out` variable)

---

### Level 8: Cross-Entropy Loss
**Before**:
```python
import math

# Example: 5-token vocab, target is token 2
probs = [0.05, 0.10, 0.70, 0.10, 0.05]
target_id = 2

# Cross-entropy: negative log probability of the correct token
loss = # YOUR CODE HERE

print(f"loss = {loss:.4f}")
```

**After**:
```python
import math

# Given: probs (probability distribution, sum=1), target_id (correct token index)

# Cross-entropy: negative log probability of the correct token
loss = # YOUR CODE HERE
```

**Impact**: Test cases can provide different probability distributions

---

### Level 9: Adam Optimizer
**Before**:
```python
beta1, beta2, lr, eps = 0.85, 0.99, 0.01, 1e-8

# Current gradient for this parameter
g = 0.5
t = 10
m_prev, v_prev = 0.3, 0.1

# Step 1: update 1st moment (momentum)
m = # YOUR CODE HERE
# ... more steps ...
```

**After**:
```python
# Given: g (gradient), m_prev, v_prev, t (step number), beta1, beta2, lr, eps

# Step 1: update 1st moment (momentum)
m = # YOUR CODE HERE
# ... more steps ...
```

**Impact**: Test cases can provide different gradients and optimizer states

---

### Level 10: Temperature Sampling
**Before**:
```python
import math, random

def softmax(logits):
    # ... implementation ...

# Pretend logits from the model (5-token vocab for simplicity)
logits = [2.1, 0.5, 3.8, 1.2, 0.9]
temperature = 0.5

# Step 1: scale logits by temperature, then softmax
probs = softmax(# YOUR CODE HERE
)
```

**After**:
```python
import math, random

def softmax(logits):
    # ... implementation ...

# Given: logits (model output), temperature (scaling factor)

# Step 1: scale logits by temperature, then softmax
probs = softmax(# YOUR CODE HERE
)
```

**Impact**: Test cases can provide different logits and temperatures

---

## Benefits

1. **Multiple Test Cases Work**: Each test case can now provide different input values
2. **Better Testing**: Edge cases (empty inputs, single elements, zeros) can be properly tested
3. **Cleaner Templates**: Templates are shorter and focus on the logic to implement
4. **Educational**: Students see that inputs are "given" rather than hardcoded
5. **Flexibility**: Easy to add more test cases without modifying templates

---

## Test Case Coverage

After these fixes, all levels now support multiple test cases:

- **Level 1**: 3 test cases (4 names, single chars, repeated chars)
- **Level 2**: 3 test cases (simple add, with zero, with negatives)
- **Level 3**: 2 test cases (3 tokens, single token)
- **Level 4**: 3 test cases (standard, all zeros, single element)
- **Level 5**: 2 test cases (3 past tokens, single token)
- **Level 6**: 3 test cases (weighted sum, one-hot, uniform)
- **Level 7**: 2 test cases (forward pass, ReLU clipping)
- **Level 8**: 3 test cases (confident, perfect, wrong)
- **Level 9**: 2 test cases (step t=1, step t=10)
- **Level 10**: 3 test cases (T=1.0, T=0.5, sum=1 check)

**Total**: 26 test cases across 10 levels

---

## Verification

Build status: ✅ **Compiled successfully**
- Bundle size: 302.86 KB (gzipped)
- No errors or warnings
- Ready to test

Next step: Test on the live site to verify all test cases run correctly with different inputs.
