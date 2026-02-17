// Global state
let isRecording = false;
let pendingXHRs = new Set();
let lastActionTimestamp = null;

// Initialize
chrome.storage.local.get(['isRecording'], function(result) {
  isRecording = result.isRecording || false;
  if (isRecording) {
    startRecording();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'start') {
    isRecording = true;
    startRecording();
  } else if (request.action === 'stop') {
    isRecording = false;
    stopRecording();
  }
  sendResponse({success: true});
  return true;
});

function startRecording() {
  // Log initial page URL
  logEvent({
    type: 'page_load',
    url: window.location.href,
    title: document.title
  });

  // Attach event listeners
  attachEventListeners();
  
  // Start observing DOM mutations
  startDOMObserver();
  
  // Intercept XHR and fetch
  interceptNetworkRequests();
}

function stopRecording() {
  // Detach event listeners
  detachEventListeners();
  
  // Stop observing DOM mutations
  stopDOMObserver();
}

function logEvent(data) {
  if (isRecording) {
    lastActionTimestamp = Date.now();
    chrome.runtime.sendMessage({
      action: 'log',
      url: window.location.href,
      data: data
    });
  }
}

// Event listeners
const eventHandlers = {
  click: handleClick,
  hover: handleHover,
  keyup: handleKeyup,
  submit: handleSubmit,
  change: handleChange
};

function attachEventListeners() {
  document.addEventListener('click', eventHandlers.click, true);
  document.addEventListener('mouseover', eventHandlers.hover, true);
  document.addEventListener('keyup', eventHandlers.keyup, true);
  document.addEventListener('submit', eventHandlers.submit, true);
  document.addEventListener('change', eventHandlers.change, true);
}

function detachEventListeners() {
  document.removeEventListener('click', eventHandlers.click, true);
  document.removeEventListener('mouseover', eventHandlers.hover, true);
  document.removeEventListener('keyup', eventHandlers.keyup, true);
  document.removeEventListener('submit', eventHandlers.submit, true);
  document.removeEventListener('change', eventHandlers.change, true);
}

function handleClick(e) {
  const element = e.target;
  logEvent({
    type: 'click',
    elementType: element.tagName,
    elementId: element.id,
    elementClass: element.className,
    elementText: element.textContent?.substring(0, 100),
    xpath: getXPath(element),
    selector: getSelector(element)
  });
}

let lastHoverTarget = null;
let hoverTimeout = null;

function handleHover(e) {
  const element = e.target;
  
  // Only log hover if element is different and hover is intentional (>500ms)
  if (element === lastHoverTarget) return;
  
  clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(() => {
    lastHoverTarget = element;
    
    // Only log hover on interactive elements
    if (element.tagName === 'A' || element.tagName === 'BUTTON' || 
        element.onclick || element.getAttribute('role') === 'button') {
      logEvent({
        type: 'hover',
        elementType: element.tagName,
        elementId: element.id,
        elementClass: element.className,
        elementText: element.textContent?.substring(0, 100),
        xpath: getXPath(element),
        selector: getSelector(element)
      });
    }
  }, 500);
}

function handleKeyup(e) {
  const element = e.target;
  logEvent({
    type: 'keyup',
    key: e.key,
    elementType: element.tagName,
    elementId: element.id,
    elementClass: element.className,
    elementName: element.name,
    elementValue: element.value,
    xpath: getXPath(element),
    selector: getSelector(element)
  });
}

function handleSubmit(e) {
  const form = e.target;
  const formData = {};
  
  // Collect all form field values
  const elements = form.elements;
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (element.name) {
      if (element.type === 'checkbox' || element.type === 'radio') {
        formData[element.name] = element.checked;
      } else if (element.type !== 'password') { // Don't log passwords
        formData[element.name] = element.value;
      }
    }
  }
  
  logEvent({
    type: 'submit',
    formId: form.id,
    formClass: form.className,
    formAction: form.action,
    formMethod: form.method,
    formData: formData,
    xpath: getXPath(form),
    selector: getSelector(form)
  });
}

function handleChange(e) {
  const element = e.target;
  
  // Only log changes on form elements
  if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
    logEvent({
      type: 'change',
      elementType: element.tagName,
      elementId: element.id,
      elementClass: element.className,
      elementName: element.name,
      elementValue: element.type === 'password' ? '[HIDDEN]' : element.value,
      xpath: getXPath(element),
      selector: getSelector(element)
    });
  }
}

// DOM Mutation Observer
let domObserver = null;

function startDOMObserver() {
  domObserver = new MutationObserver(function(mutations) {
    if (!isRecording) return;
    
    const addedElements = [];
    
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            addedElements.push({
              tagName: node.tagName,
              id: node.id,
              className: node.className,
              textContent: node.textContent?.substring(0, 100)
            });
          }
        });
      }
    });
    
    if (addedElements.length > 0) {
      logEvent({
        type: 'dom_mutation',
        addedElements: addedElements
      });
    }
  });
  
  domObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function stopDOMObserver() {
  if (domObserver) {
    domObserver.disconnect();
    domObserver = null;
  }
}

// Network Request Interception
let originalXHROpen = null;
let originalXHRSend = null;
let originalFetch = null;

function interceptNetworkRequests() {
  // Intercept XMLHttpRequest
  originalXHROpen = XMLHttpRequest.prototype.open;
  originalXHRSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url) {
    this._method = method;
    this._url = url;
    return originalXHROpen.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.send = function() {
    const xhr = this;
    const xhrId = Math.random().toString(36).substring(7);
    
    xhr.addEventListener('load', function() {
      // Only log if this happened after a user action
      if (lastActionTimestamp && (Date.now() - lastActionTimestamp) < 5000) {
        logEvent({
          type: 'xhr_response',
          method: xhr._method,
          url: xhr._url,
          status: xhr.status,
          statusText: xhr.statusText,
          responseSize: xhr.responseText?.length || 0,
          responsePreview: xhr.responseText?.substring(0, 200)
        });
      }
    });
    
    return originalXHRSend.apply(this, arguments);
  };
  
  // Intercept fetch
  originalFetch = window.fetch;
  window.fetch = function() {
    const args = arguments;
    const url = args[0];
    const options = args[1] || {};
    
    return originalFetch.apply(this, arguments).then(function(response) {
      // Only log if this happened after a user action
      if (lastActionTimestamp && (Date.now() - lastActionTimestamp) < 5000) {
        response.clone().text().then(function(text) {
          logEvent({
            type: 'fetch_response',
            method: options.method || 'GET',
            url: typeof url === 'string' ? url : url.url,
            status: response.status,
            statusText: response.statusText,
            responseSize: text.length,
            responsePreview: text.substring(0, 200)
          });
        }).catch(function() {
          // Ignore errors in reading response
        });
      }
      return response;
    });
  };
}

// Utility functions
function getXPath(element) {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }
  
  if (element === document.body) {
    return '/html/body';
  }
  
  let path = '';
  let current = element;
  
  while (current && current !== document.body) {
    let index = 0;
    let sibling = current;
    
    while (sibling) {
      sibling = sibling.previousElementSibling;
      if (sibling && sibling.tagName === current.tagName) {
        index++;
      }
    }
    
    const tagName = current.tagName.toLowerCase();
    path = `/${tagName}[${index + 1}]${path}`;
    current = current.parentElement;
  }
  
  return `/html/body${path}`;
}

function getSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }
  
  if (element.className) {
    const classes = element.className.trim().split(/\s+/).join('.');
    return `${element.tagName.toLowerCase()}.${classes}`;
  }
  
  return element.tagName.toLowerCase();
}
