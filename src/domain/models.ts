export type Fatura = {
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
  dataEmissaoDocumento: string, // Este podia ser uma Date. Sendo o FecthFactura uma string, a conversão podia ser feita na gateway
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
  actividadeEmitente?: FaturaAquisicaoClassification,
  actividadeEmitenteDesc?: string,
  actividadeProf?: string,
  actividadeProfDesc?: string,
  comunicacaoComerciante: boolean,
  comunicacaoConsumidor: boolean,
  isDocumentoEstrangeiro: boolean,
  atcud: string,
  autofaturacao: boolean
};

export enum FaturaAquisicaoClassification {
  REPARACAO_AUTOMOVEIS = "C01",
  REPARACAO_MOTOCICLOS = "C02",
  RESTAURACAO_ALOJAMENTO = "C03",
  CABELEIREIROS = "C04",
  SAUDE = "C05",
  EDUCACAO = "C06",
  HABITACAO = "C07",
  LARES = "C08",
  VETERINARIOS = "C09",
  PASSES = "C10",
  GINASIOS = "C11",
  OUTROS = "C99",
}

export enum FaturaActividadeClassification {
  SIM = "0", // Actividade
  NAO = "1", // Pessoal
  PARCIAL = "2" // Parcial
}

export type FaturaDedutivel = {
  ambito: string;
  cTipoDocumento: string;
  dataDocumento: string;
  fim: string;
  idDocumento: number;
  indicadorIncoerenciaFatshare: string;
  linhas: {
    baseTributavel: number;
    codRegiao: string;
    debitoCredito: string;
    percentagem: number;
    tipoTaxa: string;
    valorDeduzido: number;
    valorIVA: number;
    valorTotal: number;
  }[];
  nifAdquirente: string;
  nifEmitente: number;
  nomeAdquirente: string;
  nomeEmitente: string;
  novoAmbito: string;
  numeroDocumento: string;
  podeClassificar: number;
  temLinhasIsentas: boolean;
  temTotalizadorIncoerente: boolean;
  tipoDocumento: string;
  vTotalDeduzido: number;
  vTotalDeduzidoTaxaIntermedia: number;
  vTotalDeduzidoTaxaNormal: number;
  vTotalDeduzidoTaxaReduzida: number;
  vTotalIVATaxaIntermedia: number;
  vTotalIVATaxaNormal: number;
  vTotalIVATaxaReduzida: number;
  vTotalTributavelIsentoIva: number;
  vTotalTributavelTaxaIntermedia: number;
  vTotalTributavelTaxaNormal: number;
  vTotalTributavelTaxaReduzida: number;
  valorTotal: number;
  valorTotalBaseTributavel: number;
  valorTotalIVA: number;
  xPercentagem: number;
};
