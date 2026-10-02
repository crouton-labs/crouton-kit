# Security policy

## Reporting a vulnerability

Please report security vulnerabilities privately, by email to **rhyneer.silas@gmail.com**. Do not open a public GitHub issue or pull request for a suspected vulnerability.

Include what you found, the plugin name and version (from `.claude-plugin/marketplace.json`) and platform, and the steps or a proof of concept that reproduce it. If the report involves a token or credential, redact it.

Reports are read by a single maintainer, and no response time is guaranteed. Fix timelines depend on severity and on what the fix involves. Say in your report if you want credit in the fix.

## Supported versions

Fixes land on `main`, and the version-bump workflow raises the affected plugin's version. Only the latest version of each plugin is supported.

## What is in scope

The code in this repository: the plugins under [`plugins/`](plugins), the marketplace registry, and the helper in [`bin/`](bin). Of particular interest:

- A hook, script or command in a plugin doing something its description does not say, such as sending data off the machine, running code at session start, or reading credentials.
- A permissive `allowed-tools` pattern in a command or agent that lets it run more than it should.
- A bundled script, such as `plugins/ai-cli/bin/ai`, handling a prompt, file path or credential unsafely.

Plugins run inside Claude Code with your user's permissions: hooks execute shell commands and agents edit files. That is what they are for, not a vulnerability. A model's behaviour inside a session, and flaws in Claude Code or in the tools some plugins call (`crtr`, `grove`, `hl`, `termrender`), belong in those projects' repositories.
