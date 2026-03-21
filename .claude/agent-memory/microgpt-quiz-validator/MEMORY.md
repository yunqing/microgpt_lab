# MicroGPT Quiz Validator Memory

## Validated Source Code
- MicroGPT reference: https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95
- Implementation uses character-level tokenization on names dataset
- Key architecture: n_layer=1, n_embd=16, block_size=16, n_head=4, head_dim=4

## Common Patterns Found

### Strengths Across Quizzes
- Questions correctly reference actual MicroGPT hyperparameters (n_embd=16, n_head=4, etc.)
- Code exercises align well with actual implementation patterns
- Mathematical explanations are generally sound (chain rule, derivatives, etc.)
- Good pedagogical progression from tokenization → inference

### Technical Accuracy Issues Identified

#### Level 1 (Tokenization)
- **PREVIOUSLY INCORRECT - NOW FIXED**: MCQ 1 is actually correct
  - Unique chars from ['emma','noah','emma']: {a, e, h, m, n, o} = 6 chars
  - With BOS token: vocab_size = 7
  - The quiz answer key IS correct (option 2, index 2)

#### Level 3 (Embeddings)
- Quiz claims wte has shape [27, 16] = 432 params
- This assumes vocab_size=27, which only applies to full alphabet dataset
- For ['emma','noah','emma'] example used elsewhere, would be different

#### Level 5 (Attention Scaling)
- Code exercise has minor issue: expected output comment shows approximate values but doesn't explain rounding

#### Level 8 (Loss)
- Curriculum content mentions "math.exp" in insight, but MicroGPT uses Value.exp() method
- Minor pedagogical inconsistency between explaining softmax vs actual implementation

### Validation Patterns to Check
1. Always verify vocab_size calculations include BOS token (+1)
2. Check that matrix shape calculations match n_embd, n_head values
3. Ensure local_grads tuples match actual derivative formulas
4. Verify regex patterns in validate() functions match Python syntax

## Files Validated
- `/Users/gong/playground/microgpt_lab/src/data/quizzes.js` - All 10 levels
- `/Users/gong/playground/microgpt_lab/src/data/curriculum.js` - Educational content
- Source: MicroGPT gist (retrieved 2026-03-19)

## CRITICAL BUGS FOUND (2026-03-20 Validation)

### Level 3: Variable Name Mismatch
- **Test expects**: variable named `embeddings` (list of combined embeddings for multiple tokens)
- **Template/Solution uses**: variable named `x` (single combined embedding)
- **Impact**: Test cases will ALWAYS fail - fundamental mismatch in scope

### Level 4: Incorrect Epsilon in Test Case
- **Bug**: Test 1 expected values use epsilon=1.0 instead of 1e-5
- **Solution formula**: `scale = (ms + 1e-5) ** -0.5`
- **Test expects values from**: `scale = (ms + 1.0) ** -0.5`
- **Example**: For x=[2,4,0,-4], solution gives [0.666...] but test expects [0.632...]
- **Tests 2 & 3**: Work correctly with 1e-5

### Level 5: Missing Scaling Factor in Test Expected Values
- **Solution correctly includes**: `/ head_dim**0.5` (scaled dot-product attention per paper)
- **Test expected values**: Computed WITHOUT dividing by sqrt(head_dim)
- **Example**: Solution gives [0.3125, 0.75, 0.34375], test expects [0.625, 1.5, 0.6875]
- **All test cases affected**: Every expected value is 2x too large (since head_dim=4, sqrt(4)=2)

### Level 7: Residual Connection Inconsistency
- **Description (line 462)**: Lists 4 steps including "(4) add the residual connection"
- **Template comment (line 482)**: Says "Output (no residual for simplicity)"
- **Solution (line 483-488)**: Does NOT include residual
- **Validation checks (line 498)**: Check for "zip(x, x_residual)" - will always FAIL
- **Test cases**: Do NOT expect or setup residual connection
- **Impact**: Correct solutions will fail validation due to contradictory requirements

## Action Items for Future Validation
- ALWAYS verify test expected outputs by manual calculation or Python execution
- Check consistency across: description, template comments, solution, validation regex, and test cases
- Verify variable names match exactly between template, solution, and test checkVariables
- Watch for epsilon values (1e-5 vs 1.0) in normalization formulas
- Confirm all scaling factors (like sqrt(head_dim)) are consistently applied or omitted
