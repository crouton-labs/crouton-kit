---
name: review-spec
description: Validate feature specs for relevance, edge cases, and compatibility with existing patterns. Use after creating a spec.
user-invocable: false
context: fork
agent: general-purpose
model: sonnet
---

# Review Spec

**Input:** `$ARGUMENTS`

## Process

1. **Read the spec file**

2. **Read existing patterns**
   - CLAUDE.md (project root and .claude/)
   - .claude/rules/*.md
   - Any referenced "Related files" in the spec

3. **Validate against criteria**

   **Threshold: Only flag issues that would block implementation or cause genuine confusion.** Minor preferences and theoretical concerns are not findings.

### Relevance
- Spec stays focused on the feature
- Scope creep → only flag if it would cause wasted implementation work

### Edge Cases
- Error states covered
- Boundary conditions addressed
- Failure modes considered

### Architecture Quality
- Only flag actual code smells, not "could be cleaner"
- Integration points are clean

### Abstraction Level
- Behavioral/contractual, not implementation details
- Only flag if implementation details would constrain valid options

### Pattern Compatibility
- Doesn't contradict CLAUDE.md guidance
- Respects existing rules in .claude/rules/

### Context Coverage
- Only flag if spec is genuinely huge (20+ files, multiple major domains) and splitting would meaningfully help planning

## Output

If no issues found:
```
PASS
```

If issues exist, numbered plaintext feedback:
```
1. Scope: [what strays from the feature]
2. Edge case: [missing error/boundary handling]
3. Architecture: [code smell or design issue]
...
```
