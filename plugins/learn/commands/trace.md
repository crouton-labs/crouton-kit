---
description: Trace a request, event, or state change through the codebase
argument-hint: <request, event, or action to trace>
disable-model-invocation: true
---

Trace through the codebase to show how this works:

$ARGUMENTS

## Output Format

Create a **single visual diagram** with code snippets inside the boxes:

```
┌─────────────────────────────────────┐
│ 1. Handler (src/handler.ts:42)      │
│                                     │
│ async function handle(req) {        │
│   const data = await validate(req); │
│ }                                   │
└──────────────────┬──────────────────┘
                   │ data: ValidatedInput
                   ▼
┌─────────────────────────────────────┐
│ 2. Service (src/service.ts:88)      │
│                                     │
│ async function process(data) {      │
│   return await db.insert(data);     │
│ }                                   │
└──────────────────┬──────────────────┘
                   │ result: DbRecord
                   ▼
┌─────────────────────────────────────┐
│ 3. Database (src/db.ts:156)         │
│                                     │
│ async function insert(data) {       │
│   return prisma.user.create(data);  │
│ }                                   │
└─────────────────────────────────────┘
```

## Show branches for conditionals/errors

```
┌─────────────────────────────────────┐
│ validate(data)                      │
└──────────────────┬──────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
    valid ✓             invalid ❌
         │                   │
         ▼                   ▼
┌─────────────────┐  ┌─────────────────┐
│ continue flow   │  │ throw Error()   │
└─────────────────┘  └─────────────────┘
```

## Mark on arrows

- Data shape: `data: User`
- Async: `await`
- Conditionals: `if authenticated`

## Requirements

1. **Read the actual code** - put real snippets in boxes
2. **One unified diagram** - boxes + arrows + code together
3. **File:line in each box header**
4. **Show data transformations** on arrows between boxes
5. **Branch for error/conditional paths**