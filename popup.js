document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toggleBtn');
  const exportBtn = document.getElementById('exportBtn');
  const resetBtn = document.getElementById('resetBtn');
  const statusDiv = document.getElementById('status');

  // Load current state
  chrome.storage.local.get(['isRecording'], function(result) {
    updateUI(result.isRecording || false);
  });

  // Toggle recording
  toggleBtn.addEventListener('click', function() {
    chrome.storage.local.get(['isRecording'], function(result) {
      const newState = !result.isRecording;
      chrome.storage.local.set({ isRecording: newState }, function() {
        updateUI(newState);
        // Send message to content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: newState ? 'start' : 'stop'
            });
          }
        });
      });
    });
  });

  // Export JSON
  exportBtn.addEventListener('click', function() {
    chrome.storage.local.get(['logs'], function(result) {
      const logs = result.logs || [];
      const dataStr = JSON.stringify(logs, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(dataBlob);
      
      chrome.downloads.download({
        url: url,
        filename: `browser-scribe-${Date.now()}.json`,
        saveAs: true
      });
    });
  });

  // Reset log
  resetBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to reset all logs?')) {
      chrome.storage.local.set({ logs: [] }, function() {
        alert('Logs reset successfully');
      });
    }
  });

  function updateUI(isRecording) {
    if (isRecording) {
      toggleBtn.textContent = 'Stop Recording';
      toggleBtn.classList.add('recording');
      statusDiv.textContent = 'Recording...';
      statusDiv.style.color = '#f44336';
    } else {
      toggleBtn.textContent = 'Start Recording';
      toggleBtn.classList.remove('recording');
      statusDiv.textContent = 'Not Recording';
      statusDiv.style.color = '#666';
    }
  }
});
