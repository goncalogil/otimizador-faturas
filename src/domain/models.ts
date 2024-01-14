export type Fatura = {
  idDocumento: number;
  nifEmitente: number;
  nomeEmitente: string;
  actividadeEmitente?: string;
  dataEmissaoDocumento: string;
  hashDocumento?: string;
}


export enum FaturaClassification {
  PASSES = "C10",
  OUTROS = "C99"
}
