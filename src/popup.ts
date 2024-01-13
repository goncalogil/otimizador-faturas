
async function runScript() {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id!, allFrames: true },
      files: ['src/domain/index.js'],
    });
  });
}

// Attach click event to the button
document.getElementById('runScriptButton')!.addEventListener('click', runScript);
