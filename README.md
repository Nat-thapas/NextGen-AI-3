## Install (npm, pnpm, bun anything work fine)
1. $`sudo apt install libpq-dev`
2. `npm install -g node-gyp` (compiler for some lib) (it require global don't know why)
3. create `.env` refer from .env.example
4. $`pnpm install`
5. run postgres database with same config as .env
6. $`pnpm run dev` is fail (but you may work)
7. create folder `files` at root
8. also open server for executor `https://github.com/Nat-thapas/NextGen-AI-3-Executor`

- `bunx drizzle-kit studio` for open database