import { FaturaClassificationResult } from "../gateways/models";
import * as portalFinancasGateway from "../gateways/portalFinancas";
import { Fatura, FaturaAquisicaoClassification, FaturaActividadeClassification } from "./models"

const classificationPriority: FaturaAquisicaoClassification[] = [
  FaturaAquisicaoClassification.EDUCACAO,
  FaturaAquisicaoClassification.HABITACAO,
  FaturaAquisicaoClassification.LARES,
  FaturaAquisicaoClassification.SAUDE,
  FaturaAquisicaoClassification.RESTAURACAO_ALOJAMENTO,
  FaturaAquisicaoClassification.PASSES,
  FaturaAquisicaoClassification.CABELEIREIROS,
  FaturaAquisicaoClassification.REPARACAO_AUTOMOVEIS,
  FaturaAquisicaoClassification.REPARACAO_MOTOCICLOS,
  FaturaAquisicaoClassification.VETERINARIOS,
  FaturaAquisicaoClassification.GINASIOS,
  FaturaAquisicaoClassification.OUTROS,
];

const register: Record<number, FaturaAquisicaoClassification> = {}
const idToActividadeClassification: Record<number, FaturaActividadeClassification> | null = null
const nifIgnoreList: number[] = []

export const classifyFatura = async (
  fatura: Fatura,
  classification: FaturaAquisicaoClassification
): Promise<FaturaClassificationResult> => {
  if (nifIgnoreList.includes(fatura.nifEmitente)) {
    console.log(`Skipping ${fatura.idDocumento} with NIF ${fatura.nifEmitente}`)
    return Promise.resolve(FaturaClassificationResult.UNKNOWN);
  }

  if (fatura.actividadeEmitente === classification) {
    console.log(`Fatura from ${fatura.idDocumento} already classified as ${classification}`)
    return Promise.resolve(FaturaClassificationResult.VALID);
  }

  const actividadeClassification = !!idToActividadeClassification
    ? idToActividadeClassification[fatura.idDocumento] ?? FaturaActividadeClassification.NAO
    : undefined;

  console.log(`Classifying fatura from ${fatura.nifEmitente} as ${classification} (actividade: ${actividadeClassification})`)

  register[fatura.nifEmitente] = classification
  return portalFinancasGateway.classifyFatura(fatura.idDocumento, classification, actividadeClassification)
}

export const getHighestClassification = async (fatura: Fatura, order: FaturaAquisicaoClassification[]): Promise<FaturaAquisicaoClassification | null> => {

  for (const classification of order) {
    const classificationResult = await classifyFatura(fatura, classification)
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
  const faturas = await portalFinancasGateway.getFaturas(fromDate, toDate);

  for (const fatura of faturas) {
    console.debug(`Handling fatura ${fatura.idDocumento} - NIF: ${fatura.nifEmitente} - ${fatura.nomeEmitente}`)
    const storedClassifcation = register[fatura.nifEmitente]

    if (storedClassifcation) {
      await classifyFatura(fatura, storedClassifcation)
      continue;
    }

    const highestClassification = await getHighestClassification(fatura, classificationPriority)
    if(highestClassification) {
      console.log(`Stored ${highestClassification} classification to NIF: ${fatura.nifEmitente}`)
    }
  }

  await adjustFaturasWithZeroBenefit(fromDate, toDate)
  console.info("Optimization finished")  
}

const adjustFaturasWithZeroBenefit = async (fromDate: Date, toDate: Date) => {
  console.log("Adjusting faturas with zero benefit")
  const classificationPriorityAux: FaturaAquisicaoClassification[] = Array.from(classificationPriority);

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
  return await portalFinancasGateway.getFaturas(fromDate, toDate);
}

export const restoreState = async (faturas: Fatura[]) : Promise<void> => {
  for(const f of faturas) {
    if(!f.actividadeEmitente){
      console.log(`Fatura ${f.idDocumento} without classification. Skipping`)
      continue;
    }
    console.log(`Classifying document ${f.idDocumento} to ${f.actividadeEmitente}`)
    const succcess = await classifyFatura(f, f.actividadeEmitente)
    if(!succcess) {
      console.log(`Error while classifying document ${f.idDocumento}`)
    }
  }
}

(window as any).faturaClassificationRegister = register;
