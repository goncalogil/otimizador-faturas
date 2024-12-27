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

async function runRestore() {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  const file = fileInput.files?.[0];

  if (!file) {
    alert("Please select a .json file first!");
    return;
  }
  const reader = new FileReader();

  reader.onload = function () {

    const base64File = reader.result as string;

    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id!, allFrames: true },
        func: (file: string) => window.restore(file),
        args: [base64File]
      });
    });

  }

  reader.readAsDataURL(file);
}

// Attach click event to the button
document.getElementById('runRestoreButton')!.addEventListener('click', runRestore);
document.getElementById('runScriptButton')!.addEventListener('click', runOptimizer);
document.getElementById('runBackupButton')!.addEventListener('click', runBackup);
