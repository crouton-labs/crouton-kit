---
description: Explore a repo with parallel subagents to understand its structure
argument-hint: <repo URL or path>
disable-model-invocation: true
---

Spin up several explorer subagents to investigate this repo and understand it:

$ARGUMENTS

## Output Format

Summarize with **box diagrams showing key components and code**:

```
┌─────────────────────────────────────┐
│ Entry Point (src/index.ts)          │
│                                     │
│ const app = express();              │
│ app.use(authMiddleware);            │
│ app.use('/api', apiRouter);         │
│ app.listen(3000);                   │
└──────────────────┬──────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
┌─────────────────┐  ┌─────────────────┐
│ Auth Middleware │  │ API Router      │
│ (src/auth.ts)   │  │ (src/api.ts)    │
│                 │  │                 │
│ verifyToken()   │  │ /users          │
│ attachUser()    │  │ /posts          │
└─────────────────┘  └─────────────────┘
```

## Include

1. **Architecture diagram** with boxes, arrows, and key code
2. **Tech stack table**:
   | Layer | Technology |
   |-------|------------|
   | API | Express |
   | DB | Prisma + Postgres |

3. **Key patterns** observed (state machines, event bus, etc.)
4. **Entry points** with file:line references