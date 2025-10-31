// Minimal shim so the editor recognizes the obsidian module during type checking.
// You can replace this with actual types by installing the obsidian API typings via npm (dev-only).

declare module 'obsidian' {
  // Use "any" to avoid incorrect assumptions; replace gradually with real types if you install them.
  export const Notice: any;
  export const ItemView: any;
  export const Plugin: any;
  export const PluginSettingTab: any;
  export const Setting: any;
  export const Modal: any;
  export type TFile = any;
  export type App = any;
}
