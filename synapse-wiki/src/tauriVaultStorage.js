import { join } from "@tauri-apps/api/path";
import {
  mkdir,
  readDir,
  readTextFile,
  remove,
  stat,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { open } from "@tauri-apps/plugin-dialog";

const VAULT_FOLDER_KEY = "synapsewiki-vault-folder";

const extractWikilinks = (content) => {
  const matches = content.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g);
  return [...new Set([...matches].map((match) => match[1].trim()).filter(Boolean))];
};

const extractTags = (content) => {
  const matches = content.matchAll(/(?:^|\s)#([a-zA-Z0-9_-]+)/g);
  return [...new Set([...matches].map((match) => match[1].toLowerCase()))];
};

const toRelativeMarkdownPath = (path) => {
  const parts = String(path || "")
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean);

  if (
    parts.length === 0 ||
    parts.some((part) => part === "." || part === ".." || part.includes("\0"))
  ) {
    throw new Error("The note path is not a valid relative Markdown path.");
  }

  const lastPart = parts.length - 1;
  if (!/\.md$/i.test(parts[lastPart])) {
    parts[lastPart] = `${parts[lastPart]}.md`;
  }
  return parts.join("/");
};

export const createTauriVaultStorage = () => {
  let rootPath = window.localStorage.getItem(VAULT_FOLDER_KEY);
  const notePaths = new Map();
  let writeQueue = Promise.resolve();

  const serializeWrite = (operation) => {
    const pending = writeQueue.then(operation);
    writeQueue = pending.catch(() => {});
    return pending;
  };

  const requireRootPath = () => {
    if (!rootPath) {
      throw new Error("Choose a local folder before using the desktop vault.");
    }
    return rootPath;
  };

  const filePathFor = async (relativePath) =>
    join(requireRootPath(), ...relativePath.split("/"));

  const collectMarkdownFiles = async (directoryPath, relativeDirectory = "") => {
    const entries = await readDir(directoryPath);
    const files = [];

    for (const entry of entries) {
      if (entry.isSymlink) continue;

      const relativePath = relativeDirectory
        ? `${relativeDirectory}/${entry.name}`
        : entry.name;
      const absolutePath = await join(directoryPath, entry.name);

      if (entry.isDirectory) {
        files.push(
          ...(await collectMarkdownFiles(absolutePath, relativePath)),
        );
      } else if (entry.isFile && /\.md$/i.test(entry.name)) {
        files.push({ absolutePath, relativePath });
      }
    }

    return files;
  };

  const writeNote = async (note) => {
    const relativePath = toRelativeMarkdownPath(note.path || note.title);
    const pathParts = relativePath.split("/");
    const fileName = pathParts.pop();
    const parentPath = pathParts.length
      ? await join(requireRootPath(), ...pathParts)
      : requireRootPath();
    const absolutePath = await join(parentPath, fileName);

    if (pathParts.length) {
      await mkdir(parentPath, { recursive: true });
    }
    await writeTextFile(absolutePath, note.content || "");
    notePaths.set(note.id, relativePath);
  };

  return {
    getLocation: () => rootPath,
    chooseLocation: async () => {
      const selection = await open({
        title: "Choose your SynapseWiki vault folder",
        directory: true,
        multiple: false,
        recursive: true,
        ...(rootPath ? { defaultPath: rootPath } : {}),
      });

      if (!selection) return null;
      if (typeof selection !== "string") {
        throw new Error("The folder picker returned an invalid selection.");
      }

      rootPath = selection;
      window.localStorage.setItem(VAULT_FOLDER_KEY, rootPath);
      notePaths.clear();
      return rootPath;
    },
    getAllNotes: async () => {
      const files = await collectMarkdownFiles(requireRootPath());
      const notes = await Promise.all(
        files.map(async ({ absolutePath, relativePath }) => {
          const content = await readTextFile(absolutePath);
          const metadata = await stat(absolutePath);
          const id = `file:${relativePath}`;
          notePaths.set(id, relativePath);

          return {
            id,
            title: relativePath.split("/").pop().replace(/\.md$/i, ""),
            path: `/${relativePath}`,
            content,
            tags: extractTags(content),
            links: extractWikilinks(content),
            isWikiImport: relativePath.startsWith("Wikipedia/"),
            updatedAt: metadata.mtime?.toISOString() || new Date().toISOString(),
          };
        }),
      );
      return notes;
    },
    saveNote: (note) =>
      serializeWrite(async () => {
        await writeNote(note);
        return true;
      }),
    deleteNote: (id) =>
      serializeWrite(async () => {
        const relativePath = notePaths.get(id);
        if (!relativePath) {
          throw new Error(
            `Could not resolve the Markdown file for note "${id}".`,
          );
        }
        await remove(await filePathFor(relativePath));
        notePaths.delete(id);
        return true;
      }),
    saveAllNotes: (notes) =>
      serializeWrite(async () => {
        const files = await collectMarkdownFiles(requireRootPath());
        await Promise.all(files.map(({ absolutePath }) => remove(absolutePath)));
        notePaths.clear();
        for (const note of notes) {
          await writeNote(note);
        }
        return true;
      }),
  };
};
