---
name: system-vs-user-prompt
description: What belongs in system prompt vs user prompt and why. Placement decisions for API calls, system messages, and prompt architecture — system as identity/constraints/tools, user as task/context/state. Use when designing system prompts, structuring API calls, deciding where instructions belong, writing prompts for production systems, or debugging instruction compliance.
---

# System Prompt vs User Prompt

The single most consequential decision in prompt architecture is where an instruction lives. The same sentence placed in the system prompt vs. the first user message produces measurably different behavior — not because the words change, but because the model's relationship to them changes.

This skill covers the mechanics of why placement matters, what each zone is for, and what breaks when you get it wrong. For API patterns, caching math, and security details, see [reference.md](reference.md).

[prompting-effectively](../prompting-effectively/SKILL.md) covers the broader Two Zones framework. This skill goes deep on the system/user boundary specifically.

## The Cognitive Model

System prompt = identity; user messages = task. Everyone knows that. The interesting question is *why* placement produces measurably different behavior — and what breaks when you get it wrong.

## Why Placement Matters Mechanically

Position has direct effects on instruction compliance:

**System prompts benefit from primacy.** Liu et al. (2023) — "Lost in the Middle" — showed a U-shaped recall curve: models retrieve information best from the beginning and end of context. System prompts are always at position 0. In a long conversation, early user messages end up in the middle and suffer significant recall degradation.

**System prompts get trained authority, not just positional advantage.** OpenAI's Instruction Hierarchy paper (2024) demonstrated that explicit hierarchical training (Platform > Developer > User) improves robustness against prompt injection by 20–30% on benchmarks. The hierarchy isn't just positional — it's baked into model weights.

**User messages accumulate and dilute.** In multi-turn conversations, each new message pushes earlier ones further from the current generation point. The system prompt stays at position 0 regardless of conversation length. Instructions placed in early user turns get diluted as the conversation grows.

**Practical test:** If an instruction must hold reliably at turn 50, it belongs in the system prompt. If it only applies to the current task, the user turn is fine.

**Note:** System prompts only accept text. Images, files, and structured document blocks must go in user messages — which reinforces the conceptual model: system prompt is behavioral, user messages carry content.

## Multi-Turn Degradation

System prompt instructions outlast user message instructions in long conversations because the system prompt occupies a persistent first position while user message instructions get interleaved and diluted by subsequent turns.

However, all instructions degrade as conversations grow. Recency of recent turns creates competing attention signals that partially override even system-level guidance.

**Mitigation:** For critical constraints in long conversations (10+ turns), periodically reinforce in user messages using a "reminder" pattern. Test instruction compliance at turn 10 and turn 20, not just turn 1. For very long sessions, consider a "system prompt refresh" by appending a summary of current constraints into the user turn.

## Caching Implications

Prompt caching makes placement a cost/latency decision, not just a behavioral one.

**The rule:** System prompt = stable, cacheable zone. User prompt = variable, per-request zone. Never put per-user data, session state, uploaded documents, or dynamic content in the system prompt — any variation produces a cache miss.

Anthropic gives a **90% discount on cached reads** (cached tokens cost 10% of base price). OpenAI gives **50% off**. Any variation in the system prompt produces a cache miss. Per-user data or session state injected into the system prompt means every request is unique — zero cache benefit.

At scale this is significant: a 10K token system prompt cached across 100 requests costs roughly 11% of what an uncached equivalent would. See [reference.md → Caching Math](reference.md) for the breakdown. See also [context-management](../context-management/SKILL.md) for comprehensive caching strategies.

## Provider Differences

All major providers have a dedicated system channel, but the implementation differs:

| Provider | API Pattern | Caching |
|----------|------------|---------|
| Anthropic | Dedicated `system` field (not a message) | Explicit `cache_control`, 90% discount |
| OpenAI | `system` role or newer `developer` role in `messages` | Automatic, 50% discount |
| Google | `system_instruction` in constructor | Explicit, 75% discount, 32K min |
| Open-source | Template tags, inconsistent enforcement | N/A |

**OpenAI note:** The newer `developer` role (introduced with o1 family, late 2024) gets stronger adherence than `system` on newer models. Same position, trained with explicit Platform > Developer > User hierarchy. Update to `developer` for o1+ models.

**Open-source caution:** Llama, Mistral, and similar models don't enforce system > user priority as reliably as commercial APIs — it depends heavily on the fine-tune. Test system prompt adherence explicitly; don't assume commercial-grade hierarchy.

## Common Mistakes

1. **Critical instruction in the middle** — Lost in the Middle effect applies within the system prompt too. Most critical constraints go first and/or last (sandwich pattern).
2. **Treating the system prompt as a security boundary** — it provides defense-in-depth but cannot guarantee isolation from prompt injection. Always validate outputs programmatically.

For good/bad examples and API code, see [reference.md](reference.md).
