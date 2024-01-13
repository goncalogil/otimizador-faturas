import { Fatura } from "../domain/models.js"

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
export const getFaturas = async (): Promise<Fatura[]> => {
  const request = new URL('https://faturas.portaldasfinancas.gov.pt/json/obterDocumentosAdquirente.action')
  request.searchParams.append("dataInicioFilter", "2024-01-01")
  request.searchParams.append("dataFimFilter", "2024-01-11")

  const requestOptions: RequestInit = {}

  const response: FetchFaturasResponse = await fetch(request, requestOptions)
    .then((response) => response.json())


  return response.linhas.map((it) => (
    {
      idDocumento: it.idDocumento,
      nifEmitente: it.nifEmitente,
      nomeEmitente: it.nomeEmitente,
      actividadeEmitente: it.actividadeEmitente,
      dataEmissaoDocumento: it.dataEmissaoDocumento
    }
  ))
}
