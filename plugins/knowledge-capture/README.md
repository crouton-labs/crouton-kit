# knowledge-capture

Requirements gathering, interviews, and learning commands that prevent premature implementation.

## Commands

### `/collaborate [topic]`

**Methodology**: Four-phase requirements dialogue with zero code generation.

**Phases**:
1. **Understanding** - Clarify goals, constraints, success criteria
2. **Exploration** - Read codebase (read-only), map integration points
3. **Design Dialogue** - Present multiple approaches with tradeoffs
4. **Requirements Synthesis** - Summarize decisions, list open questions

**Constraints**:
- No file creation, editing, or code implementation
- Frequent use of AskUserQuestion tool
- Probes for non-functional requirements (performance, security, scaling)
- Concludes with explicit questions, not solutions

**Output**: Conversational markdown with headings, bullet points, and next-step recommendations.

---

### `/interview <topic>`

**Methodology**: Structured Q&A with one question per turn.

**Flow**:
1. **Setup** - Clarify subject, detail level, target volume
2. **Interview** - Ask one question at a time (opening → probing → comparative)
3. **Summary** - Show coverage gaps, ask "continue or compile?"
4. **Compilation** - Write structured markdown grouped by topic (not chronological)

**Output Location**: `./<relevant-name>-interview.md`

**Output Format**: Structured markdown preserving user's original language, content grouped thematically regardless of discussion order.

---

### `/learn <focus> <output-file>`

**Methodology**: Extract conversation learnings, filter for project-specific knowledge.

**Captured**:
- User preferences
- Critical file locations
- Mistakes made (lessons learned)

**Filtered Out**:
- General best practices (Google-able)
- Generic workflow advice
- Verbose/obvious content

**Output Format**: Concise markdown saved to specified file (e.g., `.claude/error-handling.md`)

**Workflow**: Proposes takeaways with reasoning, requests user confirmation before saving.

---

## Usage

```bash
# Start advisory dialogue (no implementation)
/collaborate user authentication system

# Conduct structured interview, saves to ./deployment-process-interview.md
/interview deployment process

# Extract session learnings to project knowledge base
/learn "error handling patterns" .claude/error-handling.md
```

## Design Philosophy

All commands delay implementation to improve thinking quality. `/collaborate` prevents premature coding. `/interview` captures raw knowledge before synthesis. `/learn` builds project-specific context that persists across sessions.
