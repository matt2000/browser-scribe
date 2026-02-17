# Browser Scribe - Visual Guide

## Extension Popup Interface

The extension popup provides a simple, clean interface with three main actions:

```
┌─────────────────────────┐
│   Browser Scribe        │
├─────────────────────────┤
│                         │
│   Not Recording         │  ← Status indicator
│                         │
│  ┌───────────────────┐  │
│  │  Start Recording  │  │  ← Toggle button (green when stopped)
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │   Export JSON     │  │  ← Export logs button
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │    Reset Log      │  │  ← Clear all data button
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

### When Recording:

```
┌─────────────────────────┐
│   Browser Scribe        │
├─────────────────────────┤
│                         │
│   Recording...          │  ← Status changes to red
│                         │
│  ┌───────────────────┐  │
│  │  Stop Recording   │  │  ← Button changes to red
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │   Export JSON     │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │    Reset Log      │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

## Extension Icon

The extension icon appears in the Chrome toolbar:

```
┌────┐
│ ✎  │  ← Blue icon with pen/scribe symbol
└────┘
```

## Sample Workflow

### 1. Starting a Recording Session

```
User clicks extension icon
    ↓
Popup opens showing "Not Recording"
    ↓
User clicks "Start Recording"
    ↓
Status changes to "Recording..."
    ↓
Extension logs current page URL
    ↓
Extension starts capturing all interactions
```

### 2. User Interactions Being Logged

```
User clicks a button
    ↓
✓ Click event logged with element details

User hovers over a link (>500ms)
    ↓
✓ Hover event logged

User types in a text field
    ↓
✓ Keyup events logged

User submits a form
    ↓
✓ Form submission logged with all field values
    ↓
✓ XHR response logged (if received within 5s)

New content appears on page
    ↓
✓ DOM mutation logged
```

### 3. Exporting Data

```
User clicks extension icon
    ↓
User clicks "Stop Recording"
    ↓
User clicks "Export JSON"
    ↓
Browser downloads JSON file:
"browser-scribe-1708160000000.json"
    ↓
File contains all captured events with timestamps
```

## Test Page Interface

The included test page provides comprehensive testing:

```
┌─────────────────────────────────────────────┐
│  Browser Scribe Test Page                   │
├─────────────────────────────────────────────┤
│                                             │
│  [Click Events]                             │
│  [ Click Me ] [ Another Button ] [Link]     │
│                                             │
│  [Hover Events]                             │
│  [ Hover Over Me ] [Hover Link]             │
│                                             │
│  [Keyboard Input]                           │
│  [_____________] (text input)               │
│  [_____________]                            │
│  [_____________] (textarea)                 │
│                                             │
│  [Form Submission]                          │
│  Name:     [__________]                     │
│  Email:    [__________]                     │
│  Password: [__________]                     │
│  Country:  [▼ Select ▼]                     │
│  [ ] Subscribe to newsletter                │
│  [ Submit Form ]                            │
│                                             │
│  [Dynamic Content (DOM Mutations)]          │
│  [ Add Element ] [ Remove Element ]         │
│  ┌─────────────────────────┐               │
│  │ (dynamic content here)  │               │
│  └─────────────────────────┘               │
│                                             │
│  [XHR/Fetch Requests]                       │
│  [ Trigger XHR ] [ Trigger Fetch ]          │
│  Response: ...                              │
│                                             │
└─────────────────────────────────────────────┘
```

## Sample Log Output

### Example: Complete User Session

```json
[
  {
    "timestamp": 1708160000000,
    "url": "https://example.com",
    "type": "page_load",
    "title": "Example Site"
  },
  {
    "timestamp": 1708160001500,
    "url": "https://example.com",
    "type": "click",
    "elementType": "BUTTON",
    "elementId": "login-btn",
    "elementClass": "btn btn-primary",
    "elementText": "Login",
    "xpath": "//*[@id=\"login-btn\"]",
    "selector": "#login-btn"
  },
  {
    "timestamp": 1708160002000,
    "url": "https://example.com",
    "type": "keyup",
    "key": "e",
    "elementType": "INPUT",
    "elementId": "email",
    "elementName": "email",
    "elementValue": "user@example.com",
    "xpath": "//*[@id=\"email\"]",
    "selector": "#email"
  },
  {
    "timestamp": 1708160005000,
    "url": "https://example.com",
    "type": "submit",
    "formId": "login-form",
    "formAction": "/api/login",
    "formMethod": "POST",
    "formData": {
      "email": "user@example.com",
      "remember": true
    }
  },
  {
    "timestamp": 1708160005234,
    "url": "https://example.com",
    "type": "xhr_response",
    "method": "POST",
    "url": "/api/login",
    "status": 200,
    "statusText": "OK",
    "responseSize": 89,
    "responsePreview": "{\"success\":true,\"token\":\"abc123\",\"user\":{\"id\":1,\"name\":\"John\"}}"
  },
  {
    "timestamp": 1708160005500,
    "url": "https://example.com",
    "type": "dom_mutation",
    "addedElements": [
      {
        "tagName": "DIV",
        "id": "welcome-message",
        "className": "alert alert-success",
        "textContent": "Welcome back, John!"
      }
    ]
  }
]
```

## Installation Visual Steps

```
Step 1: Open Chrome Extensions
chrome://extensions/

Step 2: Enable Developer Mode
[Toggle Developer Mode: ON]

Step 3: Load Extension
[Load unpacked] → Select browser-scribe folder

Step 4: Pin Extension (Optional)
Click puzzle icon → Pin Browser Scribe

Step 5: Ready to Use!
Extension icon appears in toolbar
```

## Color Scheme

- **Primary Color**: Blue (#2196F3)
- **Active/Recording**: Red (#f44336)
- **Success/Start**: Green (#4CAF50)
- **Background**: White/Light Gray
- **Text**: Dark Gray (#666)

## Browser Support

- ✓ Chrome (Manifest V3)
- ✓ Edge (Chromium-based)
- ✓ Brave
- ✓ Opera
- ⚠ Firefox (would need Manifest V2 version)
- ⚠ Safari (different extension format)
