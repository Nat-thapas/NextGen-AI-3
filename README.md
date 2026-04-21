## Install (npm, pnpm, bun anything work fine)
1. $`sudo apt install libpq-dev`
2. `npm install -g node-gyp` (compiler for some lib) (it require global don't know why)
3. create `.env` refer from .env.example
4. $`pnpm install`
5. run postgres database with same config as .env
6. $`pnpm run dev` is fail (but you may work)
7. create folder `files` at root
8. also open server for executor `https://github.com/Nat-thapas/NextGen-AI-3-Executor`

- `npx drizzle-kit studio` for open database
- `npx drizzle-kit generate` for generate new sql from `/src/lib/server/db/schema.ts`

## Project Structure
```
.
├── database (Store database config and data)
├── drizzle (Store .sql store drizzle and metadata)
├── src
│   ├── lib
│   │   ├── components
│   │   ├── fonts (Font using in website)
│   │   ├── hooks (Helper function for mobile)
│   │   ├── images (Image using in the website)
│   │   ├── interfaces
│   │   ├── server
│   │   |    ├── db
│   │   |    |   ├── services
│   │   |    |   ├── schemas.ts (SCHEMA FOR DRIZZLE to GENERATE)
│   │   |    |   └── etc...
│   │   |    ├── file-export
│   │   |    ├── file-import
│   │   |    └── interfaces
│   │   └── etc...
│   ├── params (some match function (probably for zod I'm not sure))
│   │   └── etc...
│   ├── routes
│   │   ├── (main) (main route for render etc /, /exercices)
│   │   │   └── etc...
│   │   ├── api (api routes)
│   │   │   └── etc...
│   │   ├── auth (Auth Handler)
│   │   │   └── etc...
│   │   ├── +error.evelte (Main layout)
│   │   └── +layout.svelte (Error fallback page)
│   └── etc...
└── etc...
```