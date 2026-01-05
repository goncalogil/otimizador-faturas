import { FaturaDedutivel } from "./models"
import * as portalFinancasGateway from "../gateways/portalFinancas";

export const backup = async (fromDate: Date, toDate: Date): Promise<FaturaDedutivel[]> => {
  return portalFinancasGateway.getFaturasDedutiveis(fromDate, toDate);
}

