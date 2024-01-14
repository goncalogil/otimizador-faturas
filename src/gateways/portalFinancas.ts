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

export const classifyFatura = async () => {
  const result = await fetch("https://faturas.portaldasfinancas.gov.pt/resolverPendenciaAdquirente.action", {
    headers: {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "max-age=0",
      "content-type": "application/x-www-form-urlencoded",
      "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Linux\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1"
    },
    referrer: "https://faturas.portaldasfinancas.gov.pt/detalheDocumentoAdquirente.action?idDocumento=117836199158&dataEmissaoDocumento=2024-01-06",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: "idDocumento=117836199158&dataEmissaoDocumento=2024-01-06&dataEmissaoDocumentoOriginal=2024-01-06&hashDocumento=fSkt&linhasDocumento=%5B%7B%22valorBaseTributavel%22%3A754%2C%22valorIva%22%3A45%2C%22valorTotal%22%3A799%2C%22regiaoFiscal%22%3Anull%2C%22taxaIva%22%3A600%2C%22tipoTaxaIva%22%3A%22IVA%22%2C%22motivoIsencao%22%3Anull%2C%22motivoIsencaoDesc%22%3A%22%22%2C%22docsOrigem%22%3A%5B%5D%2C%22idLinha%22%3A137537058350%2C%22paisTaxa%22%3A%22PT%22%2C%22paisTaxaDesc%22%3A%22PORTUGAL%22%2C%22regiaoTaxa%22%3A%221%22%2C%22regiaoTaxaDesc%22%3A%22Continente%22%2C%22taxa%22%3A%22RED%22%2C%22taxaDesc%22%3Anull%2C%22dataDocumento%22%3A%222024-01-06%22%2C%22origemRegisto%22%3A%22E%22%2C%22taxaIvaVerba%22%3A%22RED%22%2C%22indicadorDebitoCredito%22%3A%22C%22%7D%5D&ambitoAquisicaoPend=C01&ambitoActividadeProfPend=&cancelarAction=detalheDocumentoAdquirente.action%3FidDocumento%3D117836199158%26dataEmissaoDocumento%3D2024-01-06&mostraRemoverBtn=false&showAdquirenteEdit=true",
    method: "POST",
    mode: "cors",
    credentials: "include"
  }).then((it) => it.text());

  const parser = new DOMParser();
  const doc = parser.parseFromString(result, 'text/html');
  const errors = doc.querySelectorAll('.alert-error')

  return errors[0];
}
