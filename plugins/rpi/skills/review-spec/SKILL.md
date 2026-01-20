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

### Relevance
- Spec stays focused on the feature
- No tangential details or scope creep
- Clear boundaries on what's in/out

### Edge Cases
- Error states covered
- Boundary conditions addressed
- Failure modes considered

### Architecture Quality
- No code smells in proposed architecture
- Abstractions are appropriate (not over/under-engineered)
- Integration points are clean

### Library Usage
- If external libraries mentioned, verify idiomatic usage
- Flag outdated patterns or deprecated approaches
- Check compatibility with existing stack

### Abstraction Level
- Behavioral/contractual, not implementation details
- No pseudocode or type definitions sneaking in
- High-level architecture is fine, micro-details are not

### Pattern Compatibility
- Doesn't contradict CLAUDE.md guidance
- Respects existing rules in .claude/rules/
- Fits with codebase conventions found in related files

### Context Coverage
- If spec spans multiple domains (10+ files, multiple layers)
- Check `.claude/context/` for corresponding context documents
- Flag if large spec lacks context docs for planning
- Each major domain should have its own context file

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
