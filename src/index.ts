import { optimizeFaturas } from "./domain/faturasService"

const fromDate = new Date('2024-01-01')
const toDate = new Date('2024-12-31')

export async function optimizer() {
  await optimizeFaturas(fromDate, toDate)
}

(window as any).optimizer = optimizer;
