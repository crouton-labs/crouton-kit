---
description: Generate visual architecture diagrams with code snippets in boxes
argument-hint: <component, flow, or concept to diagram>
disable-model-invocation: true
---

Create a clear visual explanation of:

$ARGUMENTS

## Output Format

Create **box diagrams with code snippets inside** connected by arrows:

```
┌─────────────────────────────────────┐
│ AuthService (src/auth/service.ts)   │
│                                     │
│ class AuthService {                 │
│   async login(creds: Credentials) { │
│     const token = await verify();   │
│     return this.session.create();   │
│   }                                 │
│ }                                   │
└──────────────────┬──────────────────┘
                   │ token: JWT
                   ▼
┌─────────────────────────────────────┐
│ SessionStore (src/auth/session.ts)  │
│                                     │
│ class SessionStore {                │
│   create(token: JWT): Session {     │
│     return redis.set(token, data);  │
│   }                                 │
│ }                                   │
└─────────────────────────────────────┘
```

## For state machines

```
┌──────────────────┐
│ [Idle]           │
│ canStart: true   │
└────────┬─────────┘
         │ start()
         ▼
┌──────────────────┐
│ [Running]        │◀────────┐
│ canStop: true    │         │ retry()
└────────┬─────────┘         │
         │ stop()            │
         ▼                   │
┌──────────────────┐         │
│ [Stopped]        │─────────┘
│ canRetry: true   │
└──────────────────┘
```

## Requirements

1. **Read the actual code** - put real snippets in boxes
2. **File:line in each box header**
3. **Show relationships** with arrows
4. **Label arrows** with data types or actions
5. **Keep it scannable** - high-level overview first