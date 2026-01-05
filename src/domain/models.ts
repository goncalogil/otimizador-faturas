export type Fatura = {
  idDocumento: number;
  nifEmitente: number;
  nomeEmitente: string;
  actividadeEmitente?: FaturaAquisicaoClassification;
  dataEmissaoDocumento: string;
  valorTotalBeneficioProv?: number;
  hashDocumento?: string;
}

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
  OUTROS = "C99"
}

export enum FaturaActividadeClassification {
  SIM = "0",
  NAO = "1",
  PARCIAL = "2"
}
