import { isTauri } from "@tauri-apps/api/core";

export interface VaultStorageAdapter {
  getAllNotes: () => Promise<VaultNote[]>;
  saveNote: (note: VaultNote) => Promise<boolean>;
  deleteNote: (id: string) => Promise<boolean>;
  saveAllNotes: (notes: VaultNote[]) => Promise<boolean>;
  getLocation: () => string | null;
  chooseLocation?: () => Promise<string | null>;
}

export interface VaultNote {
  id: string;
  title: string;
  path?: string;
  content: string;
  tags?: string[];
  links?: string[];
  isWikiImport?: boolean;
  updatedAt?: string;
}

export const isDesktopBuild = isTauri();

let adapterPromise: Promise<VaultStorageAdapter> | undefined;

const getAdapter = (): Promise<VaultStorageAdapter> => {
  if (!adapterPromise) {
    adapterPromise = isDesktopBuild
      ? import("./tauriVaultStorage").then(({ createTauriVaultStorage }) =>
          createTauriVaultStorage(),
        )
      : import("./indexedDbVaultStorage").then(
          ({ createIndexedDbVaultStorage }) => createIndexedDbVaultStorage(),
        );
  }
  return adapterPromise;
};

export const getVaultLocation = async (): Promise<string | null> => {
  const adapter = await getAdapter();
  return adapter.getLocation();
};

export const chooseVaultLocation = async (): Promise<string | null> => {
  const adapter = await getAdapter();
  if (!adapter.chooseLocation) {
    throw new Error("Choosing a vault folder is only available in the desktop app.");
  }
  return adapter.chooseLocation();
};

export const getAllNotesFromDB = async () =>
  (await getAdapter()).getAllNotes();

export const saveNoteToDB = async (note: VaultNote) =>
  (await getAdapter()).saveNote(note);

export const deleteNoteFromDB = async (id: string) =>
  (await getAdapter()).deleteNote(id);

export const saveAllNotesToDB = async (notes: VaultNote[]) =>
  (await getAdapter()).saveAllNotes(notes);
