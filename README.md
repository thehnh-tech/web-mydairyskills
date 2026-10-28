# MyDiarySkills — web application

A daily journal that connects written activities with a changing picture of the skills involved. The web application combines a diary interface, authentication, MongoDB storage and optional AI-assisted analysis.

This repository contains the web app. The mobile client and administration interface are maintained separately. The repository slug retains the historical `mydairyskills` spelling; the product is **MyDiarySkills**.

## Code map

- `src/app/` — pages and server routes, including diary analysis and review.
- `src/components/app/` — diary editor, review dialog and application navigation.
- `src/lib/ai/` — Gemini, Groq and mock provider adapters.
- `src/lib/mongo.ts` and `src/lib/session.ts` — database and session integration.
- `src/shared/` — shared application types, exposed through the `@mds/shared` TypeScript alias.

## Local setup

Install the dependencies with `npm install`, copy `.env.example` to `.env.local`, and configure a development database and session password. Start the development server with:

```sh
npm run dev
```

Open the local address printed by Next.js. Environment variable names are documented in `.env.example`:

- Storage and sessions: `MONGODB_URI`, `MONGODB_DB`, `SESSION_PASSWORD`.
- Analysis: `AI_PROVIDER`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `GEMINI_MODEL`, `GEMINI_DAILY_LIMIT`.

Use `AI_PROVIDER=mock` for a demonstration that does not need a real model provider. Review the provider-selection and fallback logic in `src/lib/ai/index.ts` when configuring external services. Never commit local credentials or real diary entries.

## Checks and build

```sh
npm run typecheck
npm run build
npm start
```

These commands are defined in the package manifest; this README does not assert that they have passed on every environment or revision.

## Scope and limitations

The skill summaries are an interpretation of journal content, not an independent measurement of a person's abilities. External model providers may process the text supplied for analysis, depending on the selected configuration. Use fictional entries when demonstrating the application and consult the implemented privacy and account-deletion flows before using personal data.

Related repositories: [administration interface](https://github.com/thehnh-tech/admin-mydiaryskills) and [project organisation](https://github.com/thehnh-tech).
