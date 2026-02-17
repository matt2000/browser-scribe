# Installation and Testing Guide

## Installation Steps

1. **Load the Extension in Chrome**:
   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle switch in top-right corner)
   - Click "Load unpacked" button
   - Select the `browser-scribe` directory from your local filesystem

2. **Verify Installation**:
   - You should see "Browser Scribe" appear in your extensions list
   - The extension icon should appear in your Chrome toolbar (you may need to click the puzzle piece icon to pin it)

## Testing the Extension

### Quick Test with Included Test Page

1. Open the `test-page.html` file in Chrome:
   - Right-click the file → "Open with" → Chrome
   - Or drag and drop the file into a Chrome window

2. Click the Browser Scribe extension icon in the toolbar

3. Click "Start Recording" in the popup

4. Perform various actions on the test page:
   - Click buttons
   - Hover over interactive elements
   - Type in input fields
   - Fill out and submit the form
   - Click "Add Element" to test DOM mutations
   - Click "Trigger XHR" or "Trigger Fetch" to test network logging

5. Click the extension icon again and click "Stop Recording"

6. Click "Export JSON" to download the captured logs

7. Open the downloaded JSON file to review what was captured

### Testing on Real Websites

1. Navigate to any website (e.g., google.com, github.com)
2. Start recording via the extension popup
3. Interact with the page normally
4. Stop recording
5. Export and review the logs

### What to Look For in the Logs

Each log entry should contain:
- `timestamp`: When the event occurred
- `url`: The page URL
- `type`: The event type (page_load, click, keyup, submit, etc.)
- Event-specific data (selectors, values, etc.)

### Example Log Entry

```json
{
  "timestamp": 1708160000000,
  "url": "file:///path/to/test-page.html",
  "type": "click",
  "elementType": "BUTTON",
  "elementId": "test-btn-1",
  "elementClass": "",
  "elementText": "Click Me",
  "xpath": "//*[@id=\"test-btn-1\"]",
  "selector": "#test-btn-1"
}
```

## Troubleshooting

### Extension Not Appearing
- Make sure Developer mode is enabled in `chrome://extensions/`
- Check that you selected the correct directory (should contain manifest.json)
- Look for any error messages in the extensions page

### Events Not Being Logged
- Verify recording is active (popup should show "Recording..." status)
- Check Chrome's console for any errors (F12 → Console tab)
- Try the test page first to verify basic functionality

### Export Not Working
- Ensure the extension has the "downloads" permission
- Check if Chrome is blocking the download
- Look for errors in the extension's service worker (chrome://extensions/ → Details → Service worker → Inspect)

## Development and Debugging

### View Background Script Logs
1. Go to `chrome://extensions/`
2. Find Browser Scribe
3. Click "Details"
4. Under "Inspect views", click "service worker"
5. View console logs

### View Content Script Logs
1. Open any webpage
2. Open DevTools (F12)
3. Go to Console tab
4. Filter by "content.js" if needed

### Reload Extension After Changes
1. Go to `chrome://extensions/`
2. Click the reload icon on the Browser Scribe card
3. Refresh any open tabs where you want the new version to run
