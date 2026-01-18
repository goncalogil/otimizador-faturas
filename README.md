# How to run this Google Chrome extension

1. Install the required dependencies running:

```bash
npm install
```

2. Build the project with the following command:

```bash
npm run build
```

3. add extension to google chrome and select ./dist folder

## Convert a backup JSON into a CSV file that excludes known IDs
```
COLS=(
idDocumento
nifEmitente
nomeEmitente
valorTotal
valorTotalIva
dataEmissaoDocumento
tipoDocumentoDesc
numerodocumento
actividadeEmitente
actividadeEmitenteDesc
actividadeProf
actividadeProfDesc
atcud
autofaturacao
comunicacaoComerciante
comunicacaoConsumidor
estadoBeneficio
estadoBeneficioDesc
estadoBeneficioDescEmitente
estadoBeneficioEmitente
existeTaxaNormal
hashDocumento
isDocumentoEstrangeiro
nifAdquirente
nifAdquirenteInternac
nomeAdquirente
origemRegisto
origemRegistoDesc
paisAdquirente
tipoDocumento
valorTotalBaseTributavel
valorTotalBeneficioProv
valorTotalDespesasGerais
valorTotalSetorBeneficio
)

IDS=(
131722640582
131878104600
)

jq -r \
  --argjson ids "$(printf '%s\n' "${IDS[@]}" | jq -R 'fromjson' | jq -s .)" \
  --argjson cols "$(printf '%s\n' "${COLS[@]}" | jq -R . | jq -s .)" '
  map(select(.idDocumento as $id | $ids | index($id) | not))
    | $cols, (.[] | [ $cols[] as $c | (.[$c] // "") ])
    | @csv
  ' input.json > output.csv
```


## Iva

```
jq -r '(.[0] | keys | map(select(. != "linhas"))) as $cols
  | $cols,
    (.[] | [.[ $cols[] ]])
  | @csv
```
