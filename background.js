// Initialize storage on install
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({
    isRecording: false,
    logs: []
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'log') {
    // Add log entry to storage
    chrome.storage.local.get(['logs', 'isRecording'], function(result) {
      if (result.isRecording) {
        const logs = result.logs || [];
        logs.push({
          timestamp: Date.now(),
          url: sender.tab?.url || request.url,
          ...request.data
        });
        chrome.storage.local.set({ logs: logs });
      }
    });
  }
  return true;
});
