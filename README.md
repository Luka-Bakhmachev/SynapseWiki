# SynapseWiki

## Storage and desktop app

The web app uses browser IndexedDB for anonymous demo use and Cloudflare D1 for
projects owned by signed-in Google accounts. The Tauri desktop build stores
each note as a `.md` file in a folder selected by the user. After restarting
the desktop app, select the folder again if access needs to be renewed by the
operating system.

The desktop app requires Rust 1.90 or newer and the Tauri v2 prerequisites. From this folder,
run `npm run tauri:dev` to develop or `npm run tauri:build` to package it. The
native **File > Export Vault** and **View > Toggle Graph** menu actions are
available in the desktop app.

## Cloud accounts and projects

The web app is deployed as a Cloudflare Worker with static assets and a D1
binding named `DB`. Google OAuth sessions and account-owned projects/notes are
handled by Worker APIs; the browser never connects directly to D1. The first
account project imports the current browser vault and leaves the IndexedDB copy
untouched.

Before deploying the Worker:

1. Create a Google OAuth **Web application** client. Set the authorized
   JavaScript origin to `https://synapsewiki.lb605112714.workers.dev` and add
   this redirect URI:
   `https://synapsewiki.lb605112714.workers.dev/api/auth/callback/google`.
2. In Google Account security, enable 2-Step Verification and add Google
   Authenticator if you want authenticator challenges. Sign-in delegates
   verification to Google; Google decides when a challenge is required.
3. Configure the Worker secrets without putting them in source control:

   ```powershell
   npx wrangler secret put BETTER_AUTH_SECRET
   npx wrangler secret put GOOGLE_CLIENT_ID
   npx wrangler secret put GOOGLE_CLIENT_SECRET
   ```

   Generate `BETTER_AUTH_SECRET` with a cryptographically secure random
   generator (at least 32 characters). Wrangler prompts for each value.
4. Review the schema in `migrations/0001_auth_and_projects.sql`, then apply it
   to D1:

   ```powershell
   npm run db:migrate:remote
   ```

5. Build and deploy the Worker and static assets:

   ```powershell
   npm run deploy
   ```

For local Worker development, create an untracked `.dev.vars` file with
`BETTER_AUTH_URL=http://localhost:8787`, a separate random
`BETTER_AUTH_SECRET`, and Google OAuth credentials whose redirect URI is
`http://localhost:8787/api/auth/callback/google`. Apply the local migration
with `npm run db:migrate:local`, then run `npm run dev:worker`.

## Vite development

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
