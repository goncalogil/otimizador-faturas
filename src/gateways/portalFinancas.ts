import { Fatura, FaturaClassification } from "../domain/models.js"
import { FaturaClassificationResult } from "./models.js"

type FetchFactura = {
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
export const getFaturas = async (fromDate: Date, toDate: Date): Promise<Fatura[]> => {
  const request = new URL('https://faturas.portaldasfinancas.gov.pt/json/obterDocumentosAdquirente.action')
  request.searchParams.append("dataInicioFilter", fromDate.toISOString().slice(0, 10))
  request.searchParams.append("dataFimFilter", toDate.toISOString().slice(0, 10))

  const requestOptions: RequestInit = {}

  const response: FetchFaturasResponse = await fetch(request, requestOptions)
    .then((response) => response.json())

  return response.linhas.map((it) => (
    {
      idDocumento: it.idDocumento,
      nifEmitente: it.nifEmitente,
      nomeEmitente: it.nomeEmitente,
      actividadeEmitente: it.actividadeEmitente as FaturaClassification,
      dataEmissaoDocumento: it.dataEmissaoDocumento,
      hashDocumento: it.hashDocumento
    }
  ))
}

export const classifyFatura = async (fatura: Fatura, classification: FaturaClassification) : Promise<FaturaClassificationResult> => {
  const result = await fetch("https://faturas.portaldasfinancas.gov.pt/resolverPendenciaAdquirente.action", {
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    referrerPolicy: "strict-origin-when-cross-origin",
    body: encodeClassificationBody(fatura, classification),
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

const encodeClassificationBody = (fatura: Fatura, classification: FaturaClassification): string => {
  const body = new URLSearchParams()

  body.append('idDocumento', fatura.idDocumento.toString())
  // body.append('dataEmissaoDocumento', fatura.dataEmissaoDocumento)
  //body.append('dataEmissaoDocumentoOriginal', '2024-01-06')
  // if (fatura.hashDocumento) {
  //   body.append('hashDocumento', fatura.hashDocumento)
  // }
  //body.append('linhasDocumento', '% 5B % 7B % 22valorBaseTributavel % 22 % 3A754 % 2C % 22valorIva % 22 % 3A45 % 2C % 22valorTotal % 22 % 3A799 % 2C % 22regiaoFiscal % 22 % 3Anull % 2C % 22taxaIva % 22 % 3A600 % 2C % 22tipoTaxaIva % 22 % 3A % 22IVA % 22 % 2C % 22motivoIsencao % 22 % 3Anull % 2C % 22motivoIsencaoDesc % 22 % 3A % 22 % 22 % 2C % 22docsOrigem % 22 % 3A % 5B % 5D % 2C % 22idLinha % 22 % 3A137537058350 % 2C % 22paisTaxa % 22 % 3A % 22PT % 22 % 2C % 22paisTaxaDesc % 22 % 3A % 22PORTUGAL % 22 % 2C % 22regiaoTaxa % 22 % 3A % 221 % 22 % 2C % 22regiaoTaxaDesc % 22 % 3A % 22Continente % 22 % 2C % 22taxa % 22 % 3A % 22RED % 22 % 2C % 22taxaDesc % 22 % 3Anull % 2C % 22dataDocumento % 22 % 3A % 222024-01-06 % 22 % 2C % 22origemRegisto % 22 % 3A % 22E % 22 % 2C % 22taxaIvaVerba % 22 % 3A % 22RED % 22 % 2C % 22indicadorDebitoCredito % 22 % 3A % 22C % 22 % 7D % 5D')
  body.append('ambitoAquisicaoPend', classification)
  //body.append('ambitoActividadeProfPend',) // Pode ser null
  //body.append('cancelarAction', 'detalheDocumentoAdquirente.action%3FidDocumento%3D117836199158%26dataEmissaoDocumento%3D2024-01-06')
  //body.append('mostraRemoverBtn', 'false')
  //body.append('showAdquirenteEdit', 'true')

  return body.toString()
}



export const getFaturasByClassification = async (fromDate: Date, toDate: Date, classification: FaturaClassification): Promise<Fatura[]> => {
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
    actividadeEmitente: it.actividadeEmitente as FaturaClassification,
    dataEmissaoDocumento: it.dataEmissaoDocumento,
    valorTotalBeneficioProv: it.valorTotalBeneficioProv,
    hashDocumento: it.hashDocumento,
  }))
}
