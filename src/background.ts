let firstTime = false

function handleRequest() {
  if (!firstTime) {
    console.log('Loaded!')
    firstTime = true
  }
}

chrome.webRequest.onCompleted.addListener(
  handleRequest,
  { urls: ['https://faturas.portaldasfinancas.gov.pt/json/obterDocumentosAdquirente.action?*'] }
);
