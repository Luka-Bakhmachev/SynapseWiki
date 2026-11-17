# SynapseWiki

## Storage and desktop app

The Cloudflare Pages/web build stores notes in browser IndexedDB. The Tauri
desktop build stores each note as a `.md` file in a folder selected by the user.
After restarting the desktop app, select the folder again if access needs to be
renewed by the operating system.

The desktop app requires Rust 1.90 or newer and the Tauri v2 prerequisites. From this folder,
run `npm run tauri:dev` to develop or `npm run tauri:build` to package it. The
native **File > Export Vault** and **View > Toggle Graph** menu actions are
available in the desktop app.

## Vite development

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
