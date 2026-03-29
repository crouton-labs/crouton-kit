---
description: Run validation checks on implementation
argument-hint: <topic or plan-path>
---
# Validate Implementation

**Input:** $ARGUMENTS

Parse the input. It may be:
- A topic name (resolve from `.claude/plans/` and `.claude/specs/`)
- A direct path to a plan file
- A description with guidance on what to validate

## Objective

Run validation checks to produce evidence that the implementation works correctly. This is proof-of-life testing—observable outcomes, not just "code looks right."

## Inputs

1. **Locate artifacts:**
   - Requirements: `.claude/specs/{topic}/requirements.md`
   - Design: `.claude/specs/{topic}/design.md`
   - Plan: `.claude/plans/{topic}.plan.md`
   - Validation plan: `.claude/plans/{topic}.validation.plan.md` (if exists)

2. **If no validation plan exists**, create one:
   - Read requirements, design, and plan
   - Define exit criteria per implementation phase
   - Define proof methods (command + expected output + failure description)
   - Save to `.claude/plans/{topic}.validation.plan.md`

## Process

### 1. Inventory Infrastructure

Check what validation tools already exist:
- `.claude/commands/` — existing slash commands
- `.claude/scripts/` — shared scripts
- Test helpers, docker compose files, debug endpoints

### 2. Build Missing Infrastructure

Create any missing reusable tools needed for validation:
- Shared scripts in `.claude/scripts/`
- Topic-specific scripts in `.claude/validation/{topic}/`

### 3. Run Validation

Execute proof methods from the validation plan:
- Run each proof script/command
- Capture actual output
- Compare against expected output
- Report pass/fail with evidence

### 4. Report Results

Present results with evidence—actual output, not just pass/fail.

If failures:
- Describe what failed, expected vs actual, likely root cause
- State which requirement(s) are affected

If all pass:
- State: "Validation complete. All exit criteria met."
