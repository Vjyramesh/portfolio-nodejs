# Portfolio Backend — Project Spec

GraphQL backend for a personal portfolio site. Node.js (ESM/TypeScript) + Express + GraphQL Yoga + MongoDB (Mongoose).

## Stack

- **Runtime**: Node.js >= 20, TypeScript, ESM
- **Server**: Express
- **API**: GraphQL (graphql-yoga)
- **Database**: MongoDB via Mongoose
- **Testing**: Jest (ts-jest, experimental VM modules)
- **Dev tooling**: tsx (dev/watch), tsc (build)

## Components & Status

| Component | Location | Status | Notes |
|---|---|---|---|
| Server bootstrap | [src/index.ts](src/index.ts) | ✅ Done | Express app, CORS, static `/uploads`, `/graphql`, `/`, `/health` routes |
| Env config | [src/config/env.ts](src/config/env.ts) | ✅ Done | Loads `.env.<NODE_ENV>`; port, mongo URI/db name, CORS origins, uploads dir |
| DB connection | [src/db/connection.ts](src/db/connection.ts) | ✅ Done | Mongoose connect/disconnect + `isDatabaseConnected()` |
| GraphQL schema composition | [src/graphql/schema.ts](src/graphql/schema.ts) | ✅ Done | Merges health, skill, upload, work modules |
| **Health module** | [src/graphql/modules/health/](src/graphql/modules/health/) | ✅ Done | `health` query exposing status/env/DB connectivity |
| **Skill module** | [src/graphql/modules/skill/](src/graphql/modules/skill/) | ✅ Done | Query `skills`; mutations `addSkill`, `updateSkill`, `deleteSkill` |
| **Work module** | [src/graphql/modules/work/](src/graphql/modules/work/) | ✅ Done | Query `works`; mutations `addWork`, `updateWork`, `deleteWork` |
| **Upload module** | [src/graphql/modules/upload/](src/graphql/modules/upload/) | ✅ Done | `Upload` scalar; mutations `uploadImage`, `deleteImage`, `updateImage`; saves to local `uploads/` dir |
| Skill model | [src/models/skill/Skill.ts](src/models/skill/Skill.ts) | ✅ Done | Mongoose schema: name, category, level, proficiency, yearsOfExperience |
| Work model | [src/models/work/Work.ts](src/models/work/Work.ts) | ✅ Done | Mongoose schema: title, description, links, technologies, dates |
| Test suite | `*.test.ts` alongside source | ✅ Done | 34 suites / 158 tests passing (Jest) |
| Authentication / Authorization | — | ❌ Not started | No auth on mutations; anyone can add/update/delete skills, work, or upload files |
| Rate limiting / abuse protection | — | ❌ Not started | No limits on uploads or mutation calls |
| Input validation | across resolvers | ⚠️ Partial | Relies on GraphQL type system + Mongoose schema; no extra business-rule validation (e.g. proficiency range, file type/size limits on upload) |
| Persistent/cloud file storage | [src/graphql/modules/upload/resolvers.ts](src/graphql/modules/upload/resolvers.ts) | ⚠️ Partial | Files stored on local disk (`uploads/`); not suitable for multi-instance/production deploys without a volume or object storage (S3, etc.) |
| Logging/observability | — | ❌ Not started | Only `console.log`/`console.error` in `index.ts`; no structured logging or monitoring |
| CI/CD pipeline | — | ❌ Not started | No workflow files found (e.g. `.github/workflows`) |
| Deployment config | — | ⚠️ Partial | `.env.production`, `.env.production.example` present; no Dockerfile/compose or hosting config found (recent commit "removing for docker" suggests Docker setup was removed) |
| API documentation | — | ❌ Not started | No README or docs describing schema/usage beyond GraphiQL introspection (enabled in non-prod) |

## Legend
- ✅ Done — implemented and covered by passing tests
- ⚠️ Partial — implemented but has known gaps
- ❌ Not started — no implementation found
