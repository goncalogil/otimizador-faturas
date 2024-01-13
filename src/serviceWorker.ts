// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'log') {
    console.log(message.message);
  }
});
