import { FaturaClassificationResult } from "../gateways/models";
import * as portalFinancasGateway from "../gateways/portalFinancas";
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

export const getHighestClassification = async (fatura: Fatura, order: FaturaClassification[]): Promise<FaturaClassification | null> => {

  for (const classification of order) {
    const classificationResult = await portalFinancasGateway.classifyFatura(fatura, classification)
    if (classificationResult === FaturaClassificationResult.VALID) {
      return classification
    }
    if (classificationResult === FaturaClassificationResult.CANCELLED) {
      console.warn(`Fatura ${fatura.idDocumento} was cancelled`)
      return null
    }
  }
  console.warn(`No valid classification found for fatura ${fatura.idDocumento}`)
  return null
}


export const optimizeFaturas = async (fromDate: Date, toDate: Date) => {
  const faturas = await portalFinancasGateway.getFaturas(fromDate, toDate)

  for (const fatura of faturas) {
    console.debug(`Handling fatura ${fatura.idDocumento} - NIF: ${fatura.nifEmitente} - ${fatura.nomeEmitente}`)
    if (nifIgnoreList.includes(fatura.nifEmitente)) {
      console.log(`Skipping ${fatura.idDocumento} with NIF ${fatura.nifEmitente}`)
      continue;
    }
    const storedClassifcation = register[fatura.nifEmitente]

    if (storedClassifcation) {
      console.log(`Classifying fatura from ${fatura.nifEmitente} as ${storedClassifcation}`)
      await portalFinancasGateway.classifyFatura(fatura, storedClassifcation)
      continue;
    }

    const highestClassification = await getHighestClassification(fatura, classificationPriority)
    if(highestClassification) {
      register[fatura.nifEmitente] = highestClassification
      console.log(`Stored ${highestClassification} classification to NIF: ${fatura.nifEmitente}`)
    }
  }

  await adjustFaturasWithZeroBenefit(fromDate, toDate)
  console.info("Optimization finished")  
}

const adjustFaturasWithZeroBenefit = async (fromDate: Date, toDate: Date) => {
  console.log("Adjusting faturas with zero benefit")  
  const classificationPriorityAux: FaturaClassification[] = Array.from(classificationPriority);

  while (classificationPriorityAux.length > 1) {
    const classification = classificationPriorityAux.shift();
    if (!classification) {
      throw new Error("No classifications available")
    }

    const faturas = await portalFinancasGateway.getFaturasByClassification(fromDate, toDate, classification)
    const faturasToAdjust = faturas.filter((it) => it.valorTotalBeneficioProv === 0)

    for (const fatura of faturasToAdjust) {
      const newHighestClassification = await getHighestClassification(fatura, classificationPriorityAux)
      console.log(`Adjusted fatura ${fatura.idDocumento} to ${newHighestClassification}`)
    }
  }
}

export const backupState = async (fromDate: Date, toDate: Date): Promise<Fatura[]> => {
  return portalFinancasGateway.getFaturas(fromDate, toDate)
}

export const restoreState = async (faturas: Fatura[]) : Promise<void> => {
  for(const f of faturas) {
    if(!f.actividadeEmitente){
      console.log(`Fatura ${f.idDocumento} without classification. Skipping`)
      continue;
    }
    console.log(`Classifying document ${f.idDocumento} to ${f.actividadeEmitente}`)
    const succcess = await portalFinancasGateway.classifyFatura(f, f.actividadeEmitente)
    if(!succcess) {
      console.log(`Error while classifying document ${f.idDocumento}`)
    }
  }
}
