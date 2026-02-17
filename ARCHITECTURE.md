# Browser Scribe Architecture

## Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Chrome Browser                         │
│                                                             │
│  ┌──────────────┐         ┌───────────────────────────┐   │
│  │   Popup UI   │◄────────┤   Background Service      │   │
│  │              │         │   Worker (background.js)  │   │
│  │ - Start/Stop │         │   - State management      │   │
│  │ - Export     │         │   - Log storage           │   │
│  │ - Reset      │         └───────────────────────────┘   │
│  └──────────────┘                     ▲                    │
│                                       │                    │
│  ┌────────────────────────────────────┼──────────────────┐ │
│  │                Web Page             │                  │ │
│  │                                     │                  │ │
│  │  ┌─────────────────────────────────┴───────────────┐  │ │
│  │  │   Content Script (content.js)                   │  │ │
│  │  │                                                  │  │ │
│  │  │  Event Listeners:                               │  │ │
│  │  │  • Click events                                 │  │ │
│  │  │  • Hover events (intentional only)              │  │ │
│  │  │  • Keyboard events                              │  │ │
│  │  │  • Form submissions                             │  │ │
│  │  │  • Form field changes                           │  │ │
│  │  │                                                  │  │ │
│  │  │  Observers:                                      │  │ │
│  │  │  • DOM Mutation Observer                        │  │ │
│  │  │                                                  │  │ │
│  │  │  Network Interceptors:                          │  │ │
│  │  │  • XMLHttpRequest wrapper                       │  │ │
│  │  │  • Fetch API wrapper                            │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
1. User clicks "Start Recording"
   └─> Popup sends message to content script
       └─> Content script initializes:
           ├─> Logs page URL
           ├─> Attaches event listeners
           ├─> Starts DOM observer
           └─> Wraps XHR/Fetch

2. User interacts with page
   └─> Event captured by content script
       └─> Filtered (if needed)
           └─> Sent to background worker
               └─> Stored in Chrome storage

3. User clicks "Export JSON"
   └─> Popup retrieves logs from storage
       └─> Creates and downloads JSON file

4. User clicks "Reset Log"
   └─> Popup clears storage
```

## Event Types Captured

| Event Type | Description | Smart Filtering |
|------------|-------------|-----------------|
| `page_load` | Initial page URL and title | On start only |
| `click` | Click on any element | All clicks |
| `hover` | Mouse over interactive elements | >500ms delay, interactive only |
| `keyup` | Keyboard input | All keyup events, passwords as 'PASSWORD' |
| `submit` | Form submission with field values | All submits, passwords as 'PASSWORD' |
| `change` | Form field changes | Form elements only, passwords as 'PASSWORD' |
| `dom_mutation` | New elements added to DOM | Batched mutations |
| `xhr_response` | XHR request response | Until next action or 60s max |
| `fetch_response` | Fetch request response | Until next action or 60s max |

## Data Storage

All data is stored locally using Chrome's Storage API:

```javascript
{
  isRecording: boolean,    // Current recording state
  logs: [                  // Array of log entries
    {
      timestamp: number,   // Unix timestamp
      url: string,         // Page URL
      type: string,        // Event type
      ...eventData        // Event-specific fields
    }
  ]
}
```

## Security & Privacy Features

1. **Password Protection**: Password field values logged as 'PASSWORD' string (actual values never stored)
2. **Local Storage**: No data leaves the browser
3. **User Control**: Users can start/stop recording at any time
4. **Data Deletion**: Reset button clears all stored data
5. **Manifest V3**: Uses latest Chrome extension security standards

## File Structure

```
browser-scribe/
├── manifest.json         # Extension configuration
├── background.js         # Background service worker
├── content.js           # Content script (main logic)
├── popup.html           # UI template
├── popup.js             # UI controller
├── icon16.png           # Extension icon (16x16)
├── icon48.png           # Extension icon (48x48)
├── icon128.png          # Extension icon (128x128)
├── test-page.html       # Testing page
├── README.md            # Documentation
├── INSTALLATION.md      # Setup guide
└── .gitignore          # Git ignore rules
```
