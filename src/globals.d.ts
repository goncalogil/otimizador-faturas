interface Window {
  optimizer: () => Promise<void>;
  backup: () => Promise<string>;
  restore: (fileName: string) => Promise<string>;
}
