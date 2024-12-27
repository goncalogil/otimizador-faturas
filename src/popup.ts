async function runOptimizer() {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id!, allFrames: true },
      func: () => window.optimizer()
    });
  });
}

// Attach click event to the button
document.getElementById('runScriptButton')!.addEventListener('click', runOptimizer);
