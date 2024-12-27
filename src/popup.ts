async function runOptimizer() {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id!, allFrames: true },
      func: () => window.optimizer()
    });
  });
}


async function runBackup() {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id!, allFrames: true },
      func: () => window.backup()
    });
  });
}
// Attach click event to the button
document.getElementById('runScriptButton')!.addEventListener('click', runOptimizer);
document.getElementById('runBackupButton')!.addEventListener('click', runBackup);
