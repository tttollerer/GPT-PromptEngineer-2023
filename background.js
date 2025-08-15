/**
 * Background Service Worker for PromptEngineer Extension
 * Handles messages from content scripts and manages extension actions
 */

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Background] Received message:', request);
  
  if (request.action === 'openXMLEditor') {
    // Open the XML Editor popup
    openXMLEditor(sendResponse);
    return true; // Keep the message channel open for async response
  }
  
  if (request.action === 'openPopup') {
    // Open XML Editor in a new window (triggered by the XML Editor button)
    openXMLEditorInWindow(sendResponse);
    return true;
  }
  
  if (request.action === 'openInNewWindow') {
    // Open XML Editor in a new window for resizable interface
    openXMLEditorInWindow(sendResponse);
    return true;
  }
});

/**
 * Opens the XML Editor popup
 */
async function openXMLEditor(sendResponse) {
  try {
    // Check if chrome.action.openPopup is available (Chrome 99+)
    if (chrome.action && chrome.action.openPopup) {
      await chrome.action.openPopup();
      sendResponse({ success: true, message: 'XML Editor opened' });
    } else {
      // Fallback for older Chrome versions
      sendResponse({ 
        success: false, 
        message: 'Please click the extension icon in the toolbar to open the XML Editor',
        fallback: true 
      });
    }
  } catch (error) {
    console.error('[Background] Error opening XML Editor:', error);
    sendResponse({ 
      success: false, 
      message: 'Failed to open XML Editor: ' + error.message 
    });
  }
}

/**
 * Opens the XML Editor in a new resizable window
 */
async function openXMLEditorInWindow(sendResponse) {
  try {
    // Get saved window dimensions or use defaults
    const settings = await chrome.storage.local.get(['editorWindowWidth', 'editorWindowHeight']);
    const width = settings.editorWindowWidth || 900;
    const height = settings.editorWindowHeight || 700;
    
    // Create a new window with the popup
    const window = await chrome.windows.create({
      url: chrome.runtime.getURL('popup.html'),
      type: 'popup',
      width: width,
      height: height,
      left: 100,
      top: 100
    });
    
    sendResponse({ 
      success: true, 
      message: 'XML Editor opened in new window',
      windowId: window.id 
    });
  } catch (error) {
    console.error('[Background] Error opening XML Editor in window:', error);
    sendResponse({ 
      success: false, 
      message: 'Failed to open XML Editor window: ' + error.message 
    });
  }
}

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[Background] PromptEngineer Extension installed!');
  } else if (details.reason === 'update') {
    console.log('[Background] PromptEngineer Extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Handle extension icon click - open XML Editor in new window
chrome.action.onClicked.addListener(async (tab) => {
  console.log('[Background] Extension icon clicked, opening XML Editor...');
  
  try {
    // Check if the current tab is a supported site
    const supportedSites = ['chatgpt.com', 'bard.google.com', 'bing.com'];
    const isSupported = supportedSites.some(site => tab.url && tab.url.includes(site));
    
    if (isSupported) {
      // Try to open settings panel on the page first
      try {
        await chrome.tabs.sendMessage(tab.id, { 
          action: 'openSettingsPanel',
          source: 'extensionIcon'
        });
        console.log('[Background] Settings panel opened on page');
      } catch (error) {
        console.log('[Background] Could not open settings panel, opening XML Editor window instead');
        // Fallback: open XML Editor in new window
        await openXMLEditorInWindow(() => {});
      }
    } else {
      // Not on supported site, just open XML Editor window
      await openXMLEditorInWindow(() => {});
    }
  } catch (error) {
    console.error('[Background] Error handling extension icon click:', error);
  }
});

console.log('[Background] PromptEngineer Service Worker loaded');