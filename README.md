# Browser Scribe

A Chrome extension that logs user interactions and page changes for later analysis and replay.

## Features

- **Start/Stop Recording**: Toggle to start and stop capturing user interactions
- **Export JSON**: Download all captured logs as a JSON file
- **Reset Log**: Clear all captured data

### What Gets Logged

1. **Page URL**: Logged when recording starts
2. **User Interactions**:
   - Click events (with element details and selectors)
   - Hover events (on interactive elements only)
   - Keyboard input (keyup events)
   - Form submissions (with field values, passwords logged as 'PASSWORD')
   - Form field changes
3. **Network Activity**: XHR and Fetch responses until next user action or 60 seconds (whichever comes first)
4. **DOM Changes**: New elements added to the page

### Smart Logging

- Only logs intentional hovers (>500ms on interactive elements)
- Doesn't log mouse movements that don't result in changes
- Network requests logged until next user action or 60 seconds maximum
- Password values logged as 'PASSWORD' string (not actual values)

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `browser-scribe` directory

## Usage

1. Click the Browser Scribe extension icon in your Chrome toolbar
2. Click **Start Recording** to begin logging interactions
3. Interact with web pages normally
4. Click **Stop Recording** when done
5. Click **Export JSON** to download the log file
6. Click **Reset Log** to clear all captured data

## Log Format

Each log entry includes:
- `timestamp`: Unix timestamp in milliseconds
- `url`: Page URL where the event occurred
- `type`: Event type (click, keyup, submit, etc.)
- Additional event-specific data (element selectors, values, etc.)

Example log entry:
```json
{
  "timestamp": 1708160000000,
  "url": "https://example.com",
  "type": "click",
  "elementType": "BUTTON",
  "elementId": "submit-btn",
  "elementClass": "btn btn-primary",
  "elementText": "Submit",
  "xpath": "//*[@id=\"submit-btn\"]",
  "selector": "#submit-btn"
}
```

## Development

The extension consists of:
- `manifest.json`: Extension configuration
- `popup.html/popup.js`: User interface for the extension popup
- `background.js`: Background service worker for state management
- `content.js`: Content script that captures user interactions

## Privacy

- All data is stored locally in Chrome's storage
- No data is sent to external servers
- Password field values are logged as 'PASSWORD' string (actual values never stored)
- Users have full control over when recording starts/stops and can reset logs at any time
