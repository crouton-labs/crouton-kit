#!/usr/bin/env python3
import json
import os
import re
import sys


def check_openai_models(content: str) -> list[str]:
    """Check for outdated OpenAI model usage."""
    issues = []
    
    # Pattern for OpenAI model references
    # Note: gpt-4o variants are allowed because they support jsonSchema mode which gpt-4.1 doesn't
    openai_patterns = [
        (r'gpt-4(?:-turbo)?(?:-preview)?(?!\.1|5|o)', 'Use latest OpenAI models: gpt-4.1, gpt-4.1-mini, gpt-4.1-nano, or reasoning models gpt-5, gpt-5-mini, gpt-5-nano instead of older GPT-4 variants'),
        (r'gpt-3\.5-turbo', 'Use latest OpenAI models: gpt-4.1, gpt-4.1-mini, gpt-4.1-nano, or reasoning models gpt-5, gpt-5-mini, gpt-5-nano instead of GPT-3.5'),
    ]
    
    for pattern, message in openai_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            issues.append(message)
    
    # Check for temperature and max_tokens usage with OpenAI
    # GPT-5 models require temperature: 1 explicitly since AI SDK defaults to 0
    has_temp_or_tokens = re.search(r'temperature\s*[:=]|max_tokens\s*[:=]', content)
    has_openai = re.search(r'gpt-|openai', content, re.IGNORECASE)
    has_gpt5 = re.search(r'gpt-5', content, re.IGNORECASE)

    if has_temp_or_tokens and has_openai and not has_gpt5:
        issues.append('Do not pass temperature or max_tokens parameters with OpenAI models - use default settings')
    
    return issues

def check_anthropic_models(content: str) -> list[str]:
    """Check for outdated Anthropic model usage."""
    issues = []
    
    # Pattern for outdated Claude models
    anthropic_patterns = [
        (r'claude-3-5-sonnet|claude-3\.5-sonnet', 'Use claude-4-sonnet (Sonnet 4.0) instead of Claude 3.5 Sonnet'),
        (r'claude-3-7-sonnet|claude-3\.7-sonnet', 'Use claude-4-sonnet (Sonnet 4.0) instead of Claude 3.7 Sonnet'),
        (r'claude-3-opus', 'Use claude-4-sonnet (Sonnet 4.0) for best performance'),
        (r'claude-3-haiku', 'Use claude-4-sonnet (Sonnet 4.0) for better capabilities'),
    ]
    
    for pattern, message in anthropic_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            issues.append(message)
    
    return issues

def check_backwards_compat_patterns(content: str, file_path: str) -> list[str]:
    """Check for backwards compatibility and legacy patterns - these are BLOCKING errors."""
    issues = []

    # Only check code files (not markdown, yaml, json, etc.)
    code_extensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.c', '.cpp', '.h', '.hpp']
    if not any(file_path.endswith(ext) for ext in code_extensions):
        return issues

    # These patterns are NEVER acceptable unless user explicitly requested them
    blocking_patterns = [
        (r'\bfallback\b', 'BLOCKED: Fallback pattern detected'),
        (r'\blegacy\b', 'BLOCKED: Legacy code pattern detected'),
        (r'backward[s]?\s+compatib', 'BLOCKED: Backwards compatibility pattern detected'),
        (r'\bdeprecated\b', 'BLOCKED: Deprecated pattern detected'),
        (r'\bcompat(?:ibility)?\s*(?:mode|layer|shim)\b', 'BLOCKED: Compatibility layer detected'),
    ]

    for pattern, message in blocking_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            issues.append(message)

    return issues


def check_fallback_patterns(content: str, file_path: str) -> list[str]:
    """Check for fallback patterns in code files only - these are warnings."""
    issues = []

    # Only check code files (not markdown, yaml, json, etc.)
    code_extensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.c', '.cpp', '.h', '.hpp']
    if not any(file_path.endswith(ext) for ext in code_extensions):
        return issues

    warning_patterns = [
        (r'\|\|\s*[\'"][^\'"]*[\'"]', 'WARNING: Default value fallbacks (|| "default") detected. Consider using explicit error handling instead.'),
        (r'\?\?\s*[\'"][^\'"]*[\'"]', 'WARNING: Nullish coalescing with defaults (?? "default") detected. Consider replacing with explicit validation.'),
        (r'try\s*\{[^}]*\}\s*catch\s*\([^)]*\)\s*\{[^}]*\}', 'WARNING: Empty or generic catch blocks may hide errors. Ensure proper error handling and re-throwing.'),
    ]

    for pattern, message in warning_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            issues.append(message)

    return issues

def check_any_type_usage(content: str) -> list[str]:
    """Check for 'any' type usage in TypeScript/JavaScript."""
    issues = []

    # More sophisticated pattern to catch 'any' as a type
    any_type_patterns = [
        (r':\s*any\b', "WARNING: 'any' type detected. Consider defining proper types instead. Look up existing type definitions or create new ones in appropriate locations."),
        (r'<any>', "WARNING: 'any' generic type detected. Consider using specific types instead."),
        (r'Array<any>', "WARNING: 'Array<any>' detected. Consider using 'Array<SpecificType>' instead."),
        (r'Promise<any>', "WARNING: 'Promise<any>' detected. Consider using 'Promise<SpecificType>' instead."),
        (r'\bas\s+any\b', "WARNING: Type assertion 'as any' detected. Consider using proper type assertions or fix the underlying type issue."),
        (r'Record<[^,>]+,\s*any>', "WARNING: 'Record<string, any>' pattern detected. Consider defining proper value types if possible."),
    ]

    # Don't match 'any' in strings, comments, or variable names
    # Split content into lines and check each line
    lines = content.split('\n')
    for line_num, line in enumerate(lines, 1):
        # Skip comments
        if re.match(r'^\s*(/\*|//|\*|#)', line.strip()):
            continue

        # Skip string literals (simplified - may not catch all cases)
        line_without_strings = re.sub(r'["\'][^"\']*["\']', '', line)
        line_without_strings = re.sub(r'`[^`]*`', '', line_without_strings)

        for pattern, message in any_type_patterns:
            if re.search(pattern, line_without_strings):
                issues.append(f"{message} (Line {line_num})")
                break  # Only report one issue per line

    return issues

def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})
    hook_event = input_data.get("hook_event_name", "PreToolUse")
    
    # Only check Write and Edit operations
    if tool_name not in ["Write", "Edit", "MultiEdit"]:
        sys.exit(0)
    
    # Get file content
    content = ""
    if tool_name == "Write":
        content = tool_input.get("content", "")
    elif tool_name == "Edit":
        content = tool_input.get("new_string", "")
    elif tool_name == "MultiEdit":
        # Check all edits
        edits = tool_input.get("edits", [])
        content = "\n".join([edit.get("new_string", "") for edit in edits])
    
    if not content:
        sys.exit(0)
    
    # Get file path for context
    file_path = tool_input.get("file_path", "")
    
    # Collect blocking issues (model-related)
    blocking_issues = []
    blocking_issues.extend(check_openai_models(content))
    blocking_issues.extend(check_anthropic_models(content))

    # Check for backwards compat / legacy patterns - these are HARD BLOCKS
    compat_issues = check_backwards_compat_patterns(content, file_path)

    # Collect warning issues
    warning_issues = []
    warning_issues.extend(check_fallback_patterns(content, file_path))
    warning_issues.extend(check_any_type_usage(content))

    # Handle backwards compat issues - ABORT IMMEDIATELY
    if compat_issues:
        error_message = f"""CRITICAL: Unauthorized backwards compatibility or legacy code detected in {file_path}

Detected patterns:
"""
        for issue in compat_issues:
            error_message += f"  - {issue}\n"

        error_message += """
THIS IS A MISTAKE. You were NOT asked to maintain backwards compatibility or support legacy code.

REQUIRED ACTIONS:
1. STOP what you are doing immediately
2. Use the Explore agent to re-examine the codebase and requirements
3. Replan your implementation WITHOUT any backwards compatibility concerns
4. Write clean, modern code that breaks existing behavior if needed

Do NOT proceed with this code. Backwards compatibility is NEVER acceptable unless the user EXPLICITLY requested it with words like "maintain compatibility" or "don't break existing code".

If you believe backwards compatibility IS required, ask the user to confirm before proceeding."""

        output = {
            "decision": "block",
            "reason": error_message
        }
        print(json.dumps(output))
        sys.exit(0)

    # Handle other blocking issues (models)
    if blocking_issues:
        error_message = f"Code quality issues detected in {file_path}:\n\n"
        for i, issue in enumerate(blocking_issues, 1):
            error_message += f"{i}. {issue}\n"

        error_message += "\nPlease address these issues and try again."
        
        # Use JSON output to provide structured feedback
        output = {
            "decision": "block",
            "reason": error_message
        }
        print(json.dumps(output))
        sys.exit(0)
    
    # Handle warnings (show but don't block)
    if warning_issues:
        warning_message = f"Code quality issues detected in {file_path}:\n\n"
        for i, issue in enumerate(warning_issues, 1):
            warning_message += f"{i}. {issue}\n"

        warning_message = f"""<system-reminder>
        
{warning_message}
        
It is strongly advised to address these issues and try again.
</system-reminder>"""
        
        # Use JSON output to show warnings without blocking
        output = {
            "hookSpecificOutput": {
                "hookEventName": hook_event,
                "additionalContext": warning_message
            }
        }
        print(json.dumps(output))
        sys.exit(0)
    
    # If no issues, allow the operation to proceed
    sys.exit(0)

if __name__ == "__main__":
    main()