import { getFaturas, classifyFatura } from "./gateways/portalFinancas"
import { FaturaClassification } from "./domain/models"

async function main() {
  const faturas = await getFaturas()
  await classifyFatura(faturas[0], FaturaClassification.PASSES).then((it) => console.log(it))
}

main()
