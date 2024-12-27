import { backupState, optimizeFaturas, restoreState } from "./domain/faturasService"
import { Fatura } from "./domain/models"

const fromDate = new Date('2024-01-01')
const toDate = new Date('2024-12-31')

async function optimizer(): Promise<void> {
  await optimizeFaturas(fromDate, toDate)
}

async function backup(): Promise<void> {
  const faturas = await backupState(fromDate, toDate)

  const blob = new Blob([JSON.stringify(faturas, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'facturas-backup.json';  // Set the filename for the JSON file
  a.style.display = 'none';  // Hide the link element

  // Append the link to the document body, click it, and then remove it
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Release the object URL after download
  URL.revokeObjectURL(url);
}

async function restore(base64File: string) {
  const decodedString = atob(base64File.split(',')[1]);

  let faturas: Fatura[]
  try {
    faturas = JSON.parse(decodedString) as Fatura[];
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw new Error("Invalid JSON format");
  }

  if (!faturas) {
    console.error("Nenhum fatura encontrada")
  }
  await restoreState(faturas)
}

(window as any).optimizer = optimizer;
(window as any).backup = backup;
(window as any).restore = restore;
