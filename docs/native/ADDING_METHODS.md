# Adding New Methods to Native Protocol Documentation

Use this prompt when you add a new method to public-api (WSAPI.ts) and need to document it for native clients.

## Prompt Template

```
Context:
- public-api is our JavaScript SDK that communicates with Java backend via WebSocket
- PROTOCOL.md (./PROTOCOL.md) documents the low-level WebSocket protocol for native clients (Kotlin, Swift) who can't use our JS SDK
- Native clients need raw ClassIds and message structures without JS-side transformations
- ../api/interfaces/ contains typedoc-style interface documentation files

Task:
Document method `{method_name}` in ./PROTOCOL.md for native clients (Kotlin, Swift, etc.).

Requirements:
1. Find request/response ClassId in ../../src/SmarticoAPI.ts and ../../src/Base/ClassId.ts
2. Document raw message structure (not transformed T-prefixed types)
3. For complex types — link to ../api/interfaces/*.md files
4. If raw interface MD file doesn't exist in ../api/interfaces/ — create it following typedoc style like existing files there:
   - Format: `# Interface: Name`, `## Properties`, `### property_name`, `• **property_name**: \`type\``, `___` separators between properties
5. Add method to Table of Contents in appropriate category
6. Follow the same format as other methods in PROTOCOL.md (Request section with ClassId and fields table, Response section with ClassId and fields table, JSON examples where helpful)
7. All documentation must be in English
```

## Example Usage

```
Document method `getUserLevelExtraCounters` in docs/native/PROTOCOL.md for native clients (Kotlin, Swift, etc.).
```

or shorter:

```
Document method `myNewMethod` in PROTOCOL.md. Raw types, ClassId from code. New interfaces in docs/api/interfaces/ — follow typedoc style like existing files there.
```
