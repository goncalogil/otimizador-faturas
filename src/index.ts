import { optimizeFaturas } from "./domain/faturasService"

async function main() {
  const fromDate = new Date('2023-12-01')
  const toDate = new Date('2023-12-31')
  await optimizeFaturas(fromDate, toDate)
}

main()
