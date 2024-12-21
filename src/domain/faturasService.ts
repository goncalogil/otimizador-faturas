import { classifyFatura, getFaturas, getFaturasByClassification } from "../gateways/portalFinancas";
import { Fatura, FaturaClassification } from "./models"

const classificationPriority: FaturaClassification[] = [
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
const nifIgnoreList: number[] = []

export const getHighestClassification = async (fatura: Fatura, order: FaturaClassification[]): Promise<FaturaClassification> => {

  for (const classification of order) {
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
    if (nifIgnoreList.includes(fatura.nifEmitente)) {
      console.log(`Skipping ${fatura.idDocumento} with NIF ${fatura.nifEmitente}`)
      continue;
    }
    const storedClassifcation = register[fatura.nifEmitente]

    if (storedClassifcation) {
      await classifyFatura(fatura, storedClassifcation)
      console.log(`Classifying fatura from ${fatura.nifEmitente} as ${storedClassifcation}`)
      continue;
    }

    const highestClassification = await getHighestClassification(fatura, classificationPriority)
    register[fatura.nifEmitente] = highestClassification
    console.log(`Stored ${highestClassification} classification to NIF: ${fatura.nifEmitente}`)
  }

  await adjustFaturasWithZeroBenefit(fromDate, toDate)
}

const adjustFaturasWithZeroBenefit = async (fromDate: Date, toDate: Date) => {
  const classificationPriorityAux: FaturaClassification[] = Array.from(classificationPriority);

  while (classificationPriorityAux.length > 1) {
    const classification = classificationPriorityAux.shift();
    if (!classification) {
      throw new Error("No classifications available")
    }

    const faturas = await getFaturasByClassification(fromDate, toDate, classification)
    const faturasToAdjust = faturas.filter((it) => it.valorTotalBeneficioProv === 0)

    for (const fatura of faturasToAdjust) {
      const newHighestClassification = await getHighestClassification(fatura, classificationPriorityAux)
      console.log(`Adjusted fatura ${fatura.idDocumento} to ${newHighestClassification}`)
    }
  }
}
