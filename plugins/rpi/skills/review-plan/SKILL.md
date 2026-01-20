---
name: review-plan
description: Validate implementation plans against specs. Use after creating a plan to ensure full spec coverage and no ambiguities.
user-invocable: false
context: fork
agent: general-purpose
model: sonnet
---

# Review Plan Against Spec

**Input:** `$ARGUMENTS`

Parse the input to extract:
- Spec file path (`.claude/specs/*.spec.md`)
- Plan file path (`.claude/plans/*.plan.md`)

## Validation Process

1. **Read both documents** - spec first, then plan

2. **Extract spec requirements**
   - List every behavioral requirement from the spec
   - Include acceptance criteria, constraints, edge cases

3. **Map requirements to plan coverage**
   - For each spec requirement, find corresponding plan section
   - Mark as: covered, partially covered, or missing

4. **Check plan quality**
   - No ambiguous language ("might", "could", "possibly")
   - No deferred decisions ("investigate later", "TBD")
   - No conditional branches ("if X, then Y")
   - No unexplored complexity ("this may be tricky")
   - No irrelevant information

## Output

If all requirements are covered and no issues found:
```
PASS
```

If issues exist, provide numbered plaintext feedback:
```
1. Missing: [requirement from spec not in plan]
2. Ambiguous: [unclear section that needs resolution]
...
```