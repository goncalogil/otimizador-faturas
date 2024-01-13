import { getFaturas } from "../gateways/portalFinancas";

export function processFaturas() {
  getFaturas()
    .then((it) => {
      it.forEach((el) => console.log(el))
    })
}
