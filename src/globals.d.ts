interface Window {
  optimizer: () => Promise<void>;  // Replace `any` with a more specific type if needed
  backup: () => Promise<string>;  // Replace `any` with a more specific type if needed
}
