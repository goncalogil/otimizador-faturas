import { classifyFatura, getFaturas } from "../gateways/portalFinancas";
import { Fatura, FaturaClassification } from "./models"

const classificationPriority = [
  FaturaClassification.EDUCACAO,
  FaturaClassification.HABITACAO,
  FaturaClassification.LARES,
  FaturaClassification.SAUDE,
  FaturaClassification.RESTAURACAO_ALOJAMENTO,
  FaturaClassification.PASSES,
  FaturaClassification.CABELEIREIROS,
  FaturaClassification.REPARACAO_AUTOMOVEIS,
  FaturaClassification.REPARACAO_MOTOCICLOS,
  FaturaClassification.VETERINARIOS,
  FaturaClassification.GINASIOS,
  FaturaClassification.OUTROS,
];

const register: Record<number, FaturaClassification> = {}

export const getHighestClassification = async (fatura: Fatura): Promise<FaturaClassification> => {

  for (const classification of classificationPriority) {
    const isClassificationValid = await classifyFatura(fatura, classification)
    if (isClassificationValid) {
      return classification
    }
  }
  throw new Error(`No classification was valid for ${fatura.idDocumento}`)
}


export const optimizeFaturas = async (fromDate: Date, toDate: Date) => {
  const faturas = await getFaturas(fromDate, toDate)

  for (const fatura of faturas) {
    const storedClassifcation = register[fatura.nifEmitente]

    if (storedClassifcation) {
      await classifyFatura(fatura, storedClassifcation)
      console.log(`Classifying fatura from ${fatura.nifEmitente} as ${storedClassifcation}`)
      continue;
    }

    const highestClassification = await getHighestClassification(fatura)
    register[fatura.nifEmitente] = highestClassification
    console.log(`Stored ${highestClassification} classification to NIF: ${fatura.nifEmitente}`)
  }
}
