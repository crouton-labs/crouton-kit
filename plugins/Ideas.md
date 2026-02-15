- gates on implementation. Plan should have checkpoints on where we can validate that implementation so far is working and a code-review can optionally be done.
- epistemic firewall agent: background agent that only sees code artifacts (recent edits, diffs)—never the user's prompt or main agent's reasoning. Independently assesses "what's about to go wrong here?" and writes concerns to `.claude/context/dissent.md`. Rule auto-injects the file. Main agent must reckon with or explicitly dismiss findings. Key property: context starvation produces genuine second opinions instead of echo-chamber confirmations. Divergence from main agent's trajectory = signal, not noise.

# Make gas town, myself. I need a systme for orchestration at scale.

- I just vomit forth ideas, they get evaluated and either:
  - Debugged
  - UX/Designed/Discussed
  - Planned and ready for implementation

Validation is a bottleneck, so close the loop. Agent has dev tools to use the app, click around, and take screenshots. 
- Quality validation agent
  - Uses army of agents to verify that we didn't produce slop
  - Verifies we obeyed plan and claude.md
  - On failure, sends back to building team
- Validation Agent
  - Can use CDP and click around in app
  - Takes screenshots of the app to validate it worked
  - Looks at logs from the electron app to validate things worked
  - Looks at backend logs
  - We need to unify the input streams so agent has full picture. ANd