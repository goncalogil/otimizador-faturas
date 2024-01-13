async function logger(message: string) {
  await chrome.runtime.sendMessage({ action: 'log', message });
}

// Function to be called when the button is clicked
async function runScript() {
  await logger("Hello!")
}

// Attach click event to the button
document.getElementById('runScriptButton')!.addEventListener('click', runScript);
