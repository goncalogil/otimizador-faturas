chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'log') {
    // Forward the message to the service worker
    chrome.runtime.sendMessage({ action: 'log', message: message.message });
  }
});
