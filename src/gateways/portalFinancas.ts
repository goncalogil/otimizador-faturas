import { Fatura, FaturaAquisicaoClassification, FaturaActividadeClassification } from "../domain/models.js"
import { FaturaClassificationResult } from "./models.js"

export type FetchFactura = {
  idDocumento: number,
  origemRegisto: string,
  origemRegistoDesc: string,
  nifEmitente: number,
  nomeEmitente: string,
  nifAdquirente: number,
  nomeAdquirente?: string,
  paisAdquirente: string,
  nifAdquirenteInternac?: number,
  tipoDocumento: string,
  tipoDocumentoDesc: string,
  numerodocumento: string,
  hashDocumento?: string,
  dataEmissaoDocumento: string,
  valorTotal: number,
  valorTotalBaseTributavel: number,
  valorTotalIva: number,
  valorTotalBeneficioProv?: number,
  valorTotalSetorBeneficio?: number,
  valorTotalDespesasGerais?: number,
  estadoBeneficio: string,
  estadoBeneficioDesc: string,
  estadoBeneficioEmitente: string,
  estadoBeneficioDescEmitente: string,
  existeTaxaNormal?: string,
  actividadeEmitente?: string,
  actividadeEmitenteDesc?: string,
  actividadeProf?: string,
  actividadeProfDesc?: string,
  comunicacaoComerciante: boolean,
  comunicacaoConsumidor: boolean,
  isDocumentoEstrangeiro: boolean,
  atcud: string,
  autofaturacao: boolean
}

type FetchFaturasResponse = {
  success: boolean,
  messages: {
    error: [],
    success: [],
    info: [],
    warning: []
  },
  dataProcessamento: string,
  linhas: FetchFactura[],
  numElementos: number,
  totalElementos: number
}

export type FetchFaturaDedutivel = {
  ambito: string,
  cTipoDocumento: string,
  dataDocumento: string,
  fim: string,
  idDocumento: number,
  indicadorIncoerenciaFatshare: string,
  linhas: {
    baseTributavel: number,
    codRegiao: string,
    debitoCredito: string,
    percentagem: number,
    tipoTaxa: string,
    valorDeduzido: number,
    valorIVA: number,
    valorTotal: number,
  }[],
  nifAdquirente: string,
  nifEmitente: number,
  nomeAdquirente: string,
  nomeEmitente: string,
  novoAmbito: string,
  numeroDocumento: string,
  podeClassificar: number,
  temLinhasIsentas: boolean,
  temTotalizadorIncoerente: boolean,
  tipoDocumento: string,
  vTotalDeduzido: number,
  vTotalDeduzidoTaxaIntermedia: number,
  vTotalDeduzidoTaxaNormal: number,
  vTotalDeduzidoTaxaReduzida: number,
  vTotalIVATaxaIntermedia: number,
  vTotalIVATaxaNormal: number,
  vTotalIVATaxaReduzida: number,
  vTotalTributavelIsentoIva: number,
  vTotalTributavelTaxaIntermedia: number,
  vTotalTributavelTaxaNormal: number,
  vTotalTributavelTaxaReduzida: number,
  valorTotal: number,
  valorTotalBaseTributavel: number,
  valorTotalIVA: number,
  xPercentagem: number,
}


type FetchFaturasDedutiveisResponse = {
  classificacaoSimplificada: boolean,
  codResposta: string,
  faturasDedutivel: FetchFaturaDedutivel[],
  isWarning : boolean
}

const yearlyPeriods = (fromDate: Date, toDate: Date): { start: Date; end: Date }[] => {
  if (fromDate > toDate) return [];

  const fromYear = fromDate.getFullYear()
  const toYear = toDate.getFullYear()

  const periods: { start: Date; end: Date }[] = []

  for (let year = fromYear; year <= toYear; year++) {
    const periodStart = year === fromYear
      ? fromDate
      : new Date(year, 0, 1) // Jan 1

    const periodEnd = year === toYear
      ? toDate
      : new Date(year, 11, 31) // Dec 31

    periods.push({ start: periodStart, end: periodEnd })
  }

  return periods
}

export const getFaturas = async (fromDate: Date, toDate: Date): Promise<Fatura[]> => {
  const allFaturas: FetchFactura[] = []

  for (const yearPeriod of yearlyPeriods(fromDate, toDate)) {
    let { start, end } = yearPeriod
    let shouldRequestNextPage = false

    do {
      const response = await fetchFaturas(start, end)
      allFaturas.push(...response.linhas)
      shouldRequestNextPage = response.numElementos < response.totalElementos

      if (shouldRequestNextPage) {
        // The API is returning faturas in descending order by date
        // So we need to move the end date back to the earliest invoice date
        const lastIndex = response.linhas.length - 1
        const minDate = response.linhas[lastIndex].dataEmissaoDocumento
        end = new Date(minDate)
      }
    } while (shouldRequestNextPage)
  }

  const uniqueFaturas = allFaturas.reduce((acc, it) => {
    // Remove duplicates and map
    acc.set(it.idDocumento, {
      idDocumento: it.idDocumento,
      nifEmitente: it.nifEmitente,
      nomeEmitente: it.nomeEmitente,
      actividadeEmitente: it.actividadeEmitente as FaturaAquisicaoClassification,
      dataEmissaoDocumento: it.dataEmissaoDocumento,
      hashDocumento: it.hashDocumento
    })

    return acc
  }, new Map<number, Fatura>())

  return [...uniqueFaturas.values()]
}

const fetchFaturas = async (fromDate: Date, toDate: Date): Promise<FetchFaturasResponse> => {
  const request = new URL('https://faturas.portaldasfinancas.gov.pt/json/obterDocumentosAdquirente.action')
  request.searchParams.append("dataInicioFilter", fromDate.toISOString().slice(0, 10))
  request.searchParams.append("dataFimFilter", toDate.toISOString().slice(0, 10))

  return fetch(request).then((response) => response.json())
}

export const classifyFatura = async (
  idDocumento: number,
  classification: FaturaAquisicaoClassification,
  activityClassification?: FaturaActividadeClassification,
) : Promise<FaturaClassificationResult> => {
  const result = await fetch("https://faturas.portaldasfinancas.gov.pt/resolverPendenciaAdquirente.action", {
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    referrerPolicy: "strict-origin-when-cross-origin",
    body: encodeClassificationBody(idDocumento, classification, activityClassification),
    method: "POST",
    mode: "cors",
    credentials: "include"
  }).then((it) => it.text());

  const parser = new DOMParser();
  const doc = parser.parseFromString(result, 'text/html');
  const errors = Array.from(doc.querySelectorAll('.alert-error'))
  const succes = Array.from(doc.querySelectorAll('.alert-success'))

  if (errors.some((it) => it.textContent?.includes('pertencente ao setor indicado'))) {
    return FaturaClassificationResult.INVALID;
  }
  
  if(errors.some((it) => it.textContent?.includes('O documento não pode ser classificado por estar anulado.'))) {
    return FaturaClassificationResult.CANCELLED
  }
  
  if (succes.some((it) => it.textContent?.includes('Informação guardada com sucesso.'))) {
    return FaturaClassificationResult.VALID
  }

  return FaturaClassificationResult.UNKNOWN
}

const encodeClassificationBody = (
  idDocumento: number,
  classification: FaturaAquisicaoClassification,
  activityClassification?: FaturaActividadeClassification,
): string => {
  const body = new URLSearchParams()
  body.append('idDocumento', idDocumento.toString())
  body.append('ambitoAquisicaoPend', classification)

  if (activityClassification) {
    body.append('ambitoActividadeProfPend', activityClassification)
  }

  return body.toString()
}



export const getFaturasByClassification = async (fromDate: Date, toDate: Date, classification: FaturaAquisicaoClassification): Promise<Fatura[]> => {
  const request = new URL('https://faturas.portaldasfinancas.gov.pt/json/obterDocumentosIRSAdquirente.action')
  request.searchParams.append("dataInicioFilter", fromDate.toISOString().slice(0, 10))
  request.searchParams.append("dataFimFilter", toDate.toISOString().slice(0, 10))
  request.searchParams.append('ambitoAquisicaoFilter', classification)

  const response: FetchFaturasResponse = await fetch(request, {
    headers: {
      "accept": "application/json, text/javascript, */*; q=0.01",
      "accept-language": "en-US,en;q=0.9",
      "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Linux\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest"
    },
    referrerPolicy: "strict-origin-when-cross-origin",
    method: "GET",
    mode: "cors",
    credentials: "include"
  }).then((response) => response.json());

  return response.linhas.map((it) => ({
    idDocumento: it.idDocumento,
    nifEmitente: it.nifEmitente,
    nomeEmitente: it.nomeEmitente,
    actividadeEmitente: it.actividadeEmitente as FaturaAquisicaoClassification,
    dataEmissaoDocumento: it.dataEmissaoDocumento,
    valorTotalBeneficioProv: it.valorTotalBeneficioProv,
    hashDocumento: it.hashDocumento,
  }))
}

export const getFaturasDedutiveis = async(fromDate: Date, toDate: Date): Promise<FetchFaturaDedutivel[]> => {
  const faturas: FetchFaturaDedutivel[] = []
  const trimesters = ["03T", "06T", "09T", "12T"]

  for (const yearPeriod of yearlyPeriods(fromDate, toDate)) {
    const year = yearPeriod.start.getFullYear()

    // We're downloading all the trimesters even if the period is partial
    for (const trimester of trimesters) {
      const response = await fetchFaturasDedutiveis(year.toString(), trimester)
      faturas.push(...response.faturasDedutivel)
    }
  }

  return faturas.filter((it) => {
    const faturaDate = new Date(it.dataDocumento)
    return faturaDate >= fromDate && faturaDate <= toDate
  })
}

export const fetchFaturasDedutiveis = async (ano: string, periodo: string): Promise<FetchFaturasDedutiveisResponse> => {
  const request = new URL('https://iva.portaldasfinancas.gov.pt/dpiva/iva-automatico/api/faturas/dedutivel')
  request.searchParams.append("Ano", ano)
  request.searchParams.append("Periodo", periodo)
  return fetch(request).then((response) => response.json())
}
