import { Menu } from "@tauri-apps/api/menu";

let activeFallbackMenu;

export const installNativeMenu = async ({ onExportVault, onToggleGraph }) => {
  const menu = await Menu.new({
    items: [
      {
        text: "File",
        items: [
          {
            id: "export-vault",
            text: "Export Vault",
            accelerator: "CmdOrCtrl+Shift+E",
            action: onExportVault,
          },
        ],
      },
      {
        text: "View",
        items: [
          {
            id: "toggle-graph",
            text: "Toggle Graph",
            accelerator: "CmdOrCtrl+Shift+G",
            action: onToggleGraph,
          },
        ],
      },
    ],
  });
  const isMacOS = /Mac|iPhone|iPad/.test(navigator.platform);
  let previousMenu;

  try {
    previousMenu = isMacOS
      ? await menu.setAsAppMenu()
      : await menu.setAsWindowMenu();
  } catch (error) {
    await menu.close();
    throw error;
  }

  return async () => {
    const fallbackMenu =
      previousMenu || activeFallbackMenu || (await Menu.default());
    if (isMacOS) {
      activeFallbackMenu = fallbackMenu;
      const replacedMenu = await fallbackMenu.setAsAppMenu();
      await replacedMenu?.close();
    } else {
      activeFallbackMenu = fallbackMenu;
      const replacedMenu = await fallbackMenu.setAsWindowMenu();
      await replacedMenu?.close();
    }
  };
};
