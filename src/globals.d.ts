interface Window {
  optimizer: () => Promise<void>;
  backupFaturas: () => Promise<string>;
  backupIva: () => Promise<string>;
  restore: (fileName: string) => Promise<string>;
}
