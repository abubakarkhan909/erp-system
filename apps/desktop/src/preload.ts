import { contextBridge, ipcRenderer } from 'electron';

export interface PrintPdfPayload {
  filePath?: string;
  data?: Uint8Array | number[];
}

export interface PrintPdfResult {
  ok: boolean;
  filePath: string;
}

export interface JewelryDesktopApi {
  printPdf: (payload: PrintPdfPayload) => Promise<PrintPdfResult>;
  selectBackupDir: () => Promise<string | null>;
  getAppVersion: () => Promise<string>;
}

const jewelryDesktop: JewelryDesktopApi = {
  printPdf: (payload) => ipcRenderer.invoke('print-pdf', payload),
  selectBackupDir: () => ipcRenderer.invoke('select-backup-dir'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
};

contextBridge.exposeInMainWorld('jewelryDesktop', jewelryDesktop);

declare global {
  interface Window {
    jewelryDesktop: JewelryDesktopApi;
  }
}
