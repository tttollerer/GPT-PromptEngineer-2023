let firstDropdownsUnhidable = 6;
let dropdownsAdded = false;
let initCalled = false;
let isInitializing = true; // Flag to prevent unwanted updateTextfieldContent calls during init
let container;
let toggleButtonAdded = false;
let xmlData;
let combinedText;
let activePrompts = {
  checkboxes: [],
  dropdowns: [],
  inputs: []
};

// Separate tracking for user's own text
let userOwnText = '';

// Prompt history for exact tracking
let promptHistory = {
  all: new Set(),      // All prompts ever used
  active: new Set(),   // Currently active prompts
  lastKnownContent: '' // Last known full content for comparison
};

// Track resources for cleanup
let mainObserver = null;
let observerRetryCount = 0;
const MAX_OBSERVER_RETRIES = 5;

// Settings management
let extensionSettings = {
  autoOpen: false,
  highlightPrompts: true  // Default to true for testing
};

function loadSettings() {
  extensionSettings.autoOpen = localStorage.getItem('promptEngineerAutoOpen') === 'true';
  // Default to true if no setting exists yet
  const savedHighlightSetting = localStorage.getItem('promptEngineerHighlightPrompts');
  extensionSettings.highlightPrompts = savedHighlightSetting !== null ? savedHighlightSetting === 'true' : true;
}

function saveSettings() {
  localStorage.setItem('promptEngineerAutoOpen', extensionSettings.autoOpen.toString());
  localStorage.setItem('promptEngineerHighlightPrompts', extensionSettings.highlightPrompts.toString());
}

// TopBar functions moved to build_ui.js

function createAISettingsSection() {
  const aiSection = document.createElement('div');
  aiSection.className = 'settings-section';
  aiSection.style.cssText = 'margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);';
  
  const aiTitle = document.createElement('h4');
  aiTitle.textContent = '🤖 KI-Prompt Generator';
  aiTitle.style.cssText = 'margin-bottom: 10px; color: var(--white);';
  
  // Provider selection
  const providerSection = document.createElement('div');
  providerSection.style.cssText = 'margin-bottom: 15px;';
  
  const providerLabel = document.createElement('label');
  providerLabel.textContent = 'KI-Provider:';
  providerLabel.style.cssText = 'display: block; margin-bottom: 5px; font-size: 13px;';
  
  const providerSelect = document.createElement('select');
  providerSelect.id = 'ai-settings-provider';
  providerSelect.style.cssText = `
    width: 100%;
    padding: 6px;
    background: var(--color-surface);
    border: 1px solid var(--color-border-default);
    border-radius: 4px;
    color: var(--color-text-primary);
    font-size: 13px;
  `;
  
  // Populate providers
  const providers = [
    { id: 'openai', name: 'OpenAI (ChatGPT)' },
    { id: 'claude', name: 'Anthropic Claude' },
    { id: 'gemini', name: 'Google Gemini' },
    { id: 'openrouter', name: 'OpenRouter (Alle Modelle)' }
  ];
  
  providers.forEach(provider => {
    const option = document.createElement('option');
    option.value = provider.id;
    option.textContent = provider.name;
    providerSelect.appendChild(option);
  });
  
  providerSection.appendChild(providerLabel);
  providerSection.appendChild(providerSelect);
  
  // API Key sections for each provider
  const apiKeyContainer = document.createElement('div');
  apiKeyContainer.id = 'ai-api-key-container';
  
  providers.forEach(provider => {
    const keySection = createAPIKeySection(provider.id, provider.name);
    apiKeyContainer.appendChild(keySection);
  });
  
  // Test button
  const testButton = document.createElement('button');
  testButton.id = 'ai-test-connection';
  testButton.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22,4 12,14.01 9,11.01"/>
    </svg>
    Verbindung testen
  `;
  testButton.style.cssText = `
    width: 100%;
    padding: 8px 16px;
    background: var(--color-success);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    margin-top: 10px;
    transition: background 0.2s;
  `;
  
  const testStatus = document.createElement('div');
  testStatus.id = 'ai-test-status';
  testStatus.style.cssText = 'margin-top: 10px; font-size: 12px; display: none;';
  
  const description = document.createElement('div');
  description.className = 'setting-description';
  description.style.cssText = 'margin-top: 10px;';
  description.textContent = 'Konfiguriere deine API-Keys für KI-gestützte Prompt-Generierung. Die Keys werden sicher gespeichert.';
  
  // Event listeners
  providerSelect.addEventListener('change', (e) => {
    updateAPIKeyVisibility(e.target.value);
    updateSelectedProvider(e.target.value);
  });
  
  testButton.addEventListener('click', () => testAPIConnection());
  
  // Assemble section
  aiSection.appendChild(aiTitle);
  aiSection.appendChild(providerSection);
  aiSection.appendChild(apiKeyContainer);
  aiSection.appendChild(testButton);
  aiSection.appendChild(testStatus);
  aiSection.appendChild(description);
  
  // Initialize display
  if (window.apiManager) {
    setTimeout(() => {
      loadAISettings();
      updateAPIKeyVisibility(providerSelect.value);
    }, 100);
  }
  
  return aiSection;
}

function createAPIKeySection(providerId, providerName) {
  const section = document.createElement('div');
  section.className = 'ai-api-key-section';
  section.id = `ai-key-section-${providerId}`;
  section.style.cssText = 'margin: 10px 0; display: none;';
  
  const label = document.createElement('label');
  label.textContent = `${providerName} API-Key:`;
  label.style.cssText = 'display: block; margin-bottom: 5px; font-size: 13px;';
  
  const inputWrapper = document.createElement('div');
  inputWrapper.style.cssText = 'position: relative;';
  
  const input = document.createElement('input');
  input.type = 'password';
  input.id = `ai-api-key-${providerId}`;
  input.placeholder = 'Gib deinen API-Key ein...';
  input.style.cssText = `
    width: calc(100% - 40px);
    padding: 6px;
    background: var(--color-surface);
    border: 1px solid var(--color-border-default);
    border-radius: 4px;
    color: var(--color-text-primary);
    font-size: 13px;
  `;
  
  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.innerHTML = '👁️';
  toggleButton.style.cssText = `
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 35px;
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border-default);
    border-left: none;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    font-size: 12px;
  `;
  
  toggleButton.addEventListener('click', () => {
    if (input.type === 'password') {
      input.type = 'text';
      toggleButton.innerHTML = '🙈';
    } else {
      input.type = 'password';
      toggleButton.innerHTML = '👁️';
    }
  });
  
  // Save API key on change
  input.addEventListener('change', async (e) => {
    if (window.apiManager) {
      try {
        await window.apiManager.setAPIKey(providerId, e.target.value);
        
        // Visual feedback for successful save
        input.style.borderColor = '#4CAF50';
        setTimeout(() => {
          input.style.borderColor = '';
        }, 2000);
        
      } catch (error) {
        // Visual feedback for invalid key
        input.style.borderColor = '#f44336';
        setTimeout(() => {
          input.style.borderColor = '';
        }, 3000);
        
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'color: #f44336; font-size: 11px; margin-top: 3px;';
        errorDiv.textContent = error.message;
        
        const existingError = section.querySelector('.api-key-error');
        if (existingError) {
          existingError.remove();
        }
        
        errorDiv.className = 'api-key-error';
        section.appendChild(errorDiv);
        
        setTimeout(() => {
          if (errorDiv.parentNode) {
            errorDiv.remove();
          }
        }, 5000);
        
        console.error('API key validation error:', error);
      }
    }
  });
  
  inputWrapper.appendChild(input);
  inputWrapper.appendChild(toggleButton);
  section.appendChild(label);
  section.appendChild(inputWrapper);
  
  return section;
}

function updateAPIKeyVisibility(selectedProvider) {
  const sections = document.querySelectorAll('.ai-api-key-section');
  sections.forEach(section => {
    section.style.display = 'none';
  });
  
  const selectedSection = document.getElementById(`ai-key-section-${selectedProvider}`);
  if (selectedSection) {
    selectedSection.style.display = 'block';
  }
}

function updateSelectedProvider(provider) {
  if (window.apiManager) {
    window.apiManager.setProvider(provider);
  }
}

async function loadAISettings() {
  if (!window.apiManager) return;
  
  // Load current provider
  const providerSelect = document.getElementById('ai-settings-provider');
  if (providerSelect && window.apiManager.settings.selectedProvider) {
    providerSelect.value = window.apiManager.settings.selectedProvider;
  }
  
  // Load API keys (async)
  const providers = Object.keys(window.apiManager.settings.apiKeys || {});
  for (const provider of providers) {
    const input = document.getElementById(`ai-api-key-${provider}`);
    if (input) {
      try {
        const key = await window.apiManager.getAPIKey(provider);
        input.value = key || '';
      } catch (error) {
        console.error(`Failed to load API key for ${provider}:`, error);
      }
    }
  }
}

async function testAPIConnection() {
  const providerSelect = document.getElementById('ai-settings-provider');
  const testButton = document.getElementById('ai-test-connection');
  const testStatus = document.getElementById('ai-test-status');
  
  if (!providerSelect || !window.apiManager) return;
  
  const provider = providerSelect.value;
  
  let apiKey;
  try {
    apiKey = await window.apiManager.getAPIKey(provider);
  } catch (error) {
    testStatus.style.display = 'block';
    testStatus.style.color = '#f44336';
    testStatus.textContent = '❌ Fehler beim Laden des API-Keys: ' + error.message;
    return;
  }
  
  if (!apiKey) {
    testStatus.style.display = 'block';
    testStatus.style.color = '#f44336';
    testStatus.textContent = '❌ Kein API-Key für diesen Provider konfiguriert';
    return;
  }
  
  // Update UI for testing
  testButton.disabled = true;
  testButton.innerHTML = `
    <div style="display: inline-block; width: 16px; height: 16px; border: 2px solid #ffffff40; border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 6px;"></div>
    Teste Verbindung...
  `;
  
  testStatus.style.display = 'block';
  testStatus.style.color = 'var(--color-text-secondary)';
  testStatus.textContent = '⏳ Verbindung wird getestet...';
  
  try {
    const result = await window.apiManager.testConnection(provider, apiKey);
    
    if (result.success) {
      testStatus.style.color = 'var(--color-success)';
      testStatus.textContent = '✓ Verbindung erfolgreich!';
    } else {
      testStatus.style.color = '#f44336';
      testStatus.textContent = `❌ Fehler: ${result.message}`;
    }
  } catch (error) {
    testStatus.style.color = '#f44336';
    testStatus.textContent = `❌ Verbindung fehlgeschlagen: ${error.message}`;
  } finally {
    // Reset button
    testButton.disabled = false;
    testButton.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22,4 12,14.01 9,11.01"/>
      </svg>
      Verbindung testen
    `;
  }
}

function createSettingsPanel() {
  const settingsPanel = document.createElement('div');
  settingsPanel.id = 'settings-panel';
  
  // Create settings content structure safely
  const settingsContent = document.createElement('div');
  settingsContent.className = 'settings-content';
  
  // Settings header
  const settingsHeader = document.createElement('div');
  settingsHeader.className = 'settings-header';
  
  const headerTitle = document.createElement('h3');
  headerTitle.textContent = 'Extension Einstellungen';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'settings-close';
  closeButton.textContent = '×';
  
  settingsHeader.appendChild(headerTitle);
  settingsHeader.appendChild(closeButton);
  
  // Setting item 1 - Auto open
  const settingItem1 = document.createElement('div');
  settingItem1.className = 'setting-item';
  
  const label1 = document.createElement('label');
  const checkbox1 = document.createElement('input');
  checkbox1.type = 'checkbox';
  checkbox1.id = 'auto-open-setting';
  const span1 = document.createElement('span');
  span1.textContent = 'Extension beim Seitenaufruf automatisch öffnen';
  
  label1.appendChild(checkbox1);
  label1.appendChild(span1);
  
  const description1 = document.createElement('div');
  description1.className = 'setting-description';
  description1.textContent = 'Das Bottom-Menu wird automatisch angezeigt wenn die Seite geladen wird';
  
  settingItem1.appendChild(label1);
  settingItem1.appendChild(description1);
  
  // Setting item 2 - Highlight prompts
  const settingItem2 = document.createElement('div');
  settingItem2.className = 'setting-item';
  
  const label2 = document.createElement('label');
  const checkbox2 = document.createElement('input');
  checkbox2.type = 'checkbox';
  checkbox2.id = 'highlight-prompts-setting';
  const span2 = document.createElement('span');
  span2.textContent = 'Eingefügte Prompts farblich hervorheben';
  
  label2.appendChild(checkbox2);
  label2.appendChild(span2);
  
  const description2 = document.createElement('div');
  description2.className = 'setting-description';
  description2.textContent = 'Extension-Prompts erhalten eine bläuliche Textfarbe im Textfeld';
  
  const statusDiv = document.createElement('div');
  statusDiv.id = 'highlighting-compatibility-status';
  statusDiv.style.marginTop = '5px';
  statusDiv.style.fontSize = '11px';
  
  description2.appendChild(statusDiv);
  
  settingItem2.appendChild(label2);
  settingItem2.appendChild(description2);
  
  // XML Editor Button Section
  const editorSection = document.createElement('div');
  editorSection.className = 'settings-section';
  editorSection.style.cssText = 'margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);';
  
  const editorTitle = document.createElement('h4');
  editorTitle.textContent = 'XML Editor';
  editorTitle.style.cssText = 'margin-bottom: 10px; color: var(--white);';
  
  const editorButtons = document.createElement('div');
  editorButtons.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap;';
  
  // Open in Popup Button
  const openEditorButton = document.createElement('button');
  openEditorButton.className = 'btn-primary';
  openEditorButton.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
    XML Editor öffnen
  `;
  openEditorButton.style.cssText = `
    padding: 8px 16px;
    background: var(--light-green);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
  `;
  openEditorButton.onmouseover = () => openEditorButton.style.background = '#0056cc';
  openEditorButton.onmouseout = () => openEditorButton.style.background = 'var(--light-green)';
  
  // Open in Window Button
  const openInWindowButton = document.createElement('button');
  openInWindowButton.className = 'btn-secondary';
  openInWindowButton.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15,3 21,3 21,9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
    In neuem Fenster öffnen
  `;
  openInWindowButton.style.cssText = `
    padding: 8px 16px;
    background: transparent;
    color: var(--white);
    border: 1px solid var(--light-green);
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
  `;
  openInWindowButton.onmouseover = () => openInWindowButton.style.background = 'rgba(1, 107, 255, 0.1)';
  openInWindowButton.onmouseout = () => openInWindowButton.style.background = 'transparent';
  
  const editorDescription = document.createElement('div');
  editorDescription.className = 'setting-description';
  editorDescription.style.cssText = 'margin-top: 10px;';
  editorDescription.textContent = 'Bearbeite die XML-Dateien für Dropdown-Optionen, Input-Felder und Checkboxen';
  
  const editorStatus = document.createElement('div');
  editorStatus.id = 'editor-open-status';
  editorStatus.style.cssText = 'margin-top: 5px; font-size: 11px; color: var(--light-green); display: none;';
  
  editorButtons.appendChild(openEditorButton);
  editorButtons.appendChild(openInWindowButton);
  editorSection.appendChild(editorTitle);
  editorSection.appendChild(editorButtons);
  editorSection.appendChild(editorDescription);
  editorSection.appendChild(editorStatus);
  
  // Event Listeners for Editor Buttons
  openEditorButton.addEventListener('click', async () => {
    try {
      const statusDiv = document.getElementById('editor-open-status');
      statusDiv.style.display = 'block';
      statusDiv.style.color = 'var(--light-green)';
      statusDiv.textContent = '⏳ Öffne XML Editor...';
      
      const response = await chrome.runtime.sendMessage({ action: 'openXMLEditor' });
      
      if (response.success) {
        statusDiv.textContent = '✓ XML Editor geöffnet';
        setTimeout(() => {
          statusDiv.style.display = 'none';
        }, 2000);
      } else if (response.fallback) {
        statusDiv.style.color = '#ff9800';
        statusDiv.innerHTML = '⚠ Bitte klicke auf das Extension-Icon <img src="' + chrome.runtime.getURL('Images/icon16.png') + '" style="width: 16px; height: 16px; vertical-align: middle; margin: 0 4px;"> in der Chrome-Toolbar';
      } else {
        statusDiv.style.color = '#f44336';
        statusDiv.textContent = '❌ Fehler: ' + response.message;
      }
    } catch (error) {
      console.error('Error opening XML Editor:', error);
      const statusDiv = document.getElementById('editor-open-status');
      statusDiv.style.display = 'block';
      statusDiv.style.color = '#f44336';
      statusDiv.textContent = '❌ Fehler beim Öffnen des Editors';
    }
  });
  
  openInWindowButton.addEventListener('click', async () => {
    try {
      const statusDiv = document.getElementById('editor-open-status');
      statusDiv.style.display = 'block';
      statusDiv.style.color = 'var(--light-green)';
      statusDiv.textContent = '⏳ Öffne XML Editor in neuem Fenster...';
      
      const response = await chrome.runtime.sendMessage({ action: 'openInNewWindow' });
      
      if (response.success) {
        statusDiv.textContent = '✓ XML Editor in neuem Fenster geöffnet';
        setTimeout(() => {
          statusDiv.style.display = 'none';
        }, 2000);
      } else {
        statusDiv.style.color = '#f44336';
        statusDiv.textContent = '❌ Fehler: ' + response.message;
      }
    } catch (error) {
      console.error('Error opening XML Editor in window:', error);
      const statusDiv = document.getElementById('editor-open-status');
      statusDiv.style.display = 'block';
      statusDiv.style.color = '#f44336';
      statusDiv.textContent = '❌ Fehler beim Öffnen des Editor-Fensters';
    }
  });
  
  // AI Settings Section
  const aiSection = createAISettingsSection();
  
  // Assemble everything
  settingsContent.appendChild(settingsHeader);
  settingsContent.appendChild(settingItem1);
  settingsContent.appendChild(settingItem2);
  settingsContent.appendChild(editorSection);
  settingsContent.appendChild(aiSection);
  settingsPanel.appendChild(settingsContent);
  
  // Event listeners
  closeButton.addEventListener('click', hideSettingsPanel);
  
  settingsPanel.addEventListener('click', (e) => {
    if (e.target === settingsPanel) {
      hideSettingsPanel();
    }
  });
  
  // Settings checkboxes are already referenced from above
  const autoOpenCheckbox = checkbox1;
  const highlightCheckbox = checkbox2;
  
  autoOpenCheckbox.addEventListener('change', (e) => {
    extensionSettings.autoOpen = e.target.checked;
    saveSettings();
  });
  
  highlightCheckbox.addEventListener('change', (e) => {
    extensionSettings.highlightPrompts = e.target.checked;
    saveSettings();
    // Update the textfield content to apply/remove highlighting immediately
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("🎨 Highlighting setting changed to:", e.target.checked);
    }
    updateTextfieldContent();
  });
  
  document.body.appendChild(settingsPanel);
  return settingsPanel;
}

function toggleSettingsPanel() {
  let settingsPanel = document.getElementById('settings-panel');
  if (!settingsPanel) {
    settingsPanel = createSettingsPanel();
  }
  
  // Update checkbox states
  const autoOpenCheckbox = settingsPanel.querySelector('#auto-open-setting');
  const highlightCheckbox = settingsPanel.querySelector('#highlight-prompts-setting');
  
  autoOpenCheckbox.checked = extensionSettings.autoOpen;
  highlightCheckbox.checked = extensionSettings.highlightPrompts;
  
  // Update highlighting compatibility status
  const statusDiv = settingsPanel.querySelector('#highlighting-compatibility-status');
  if (statusDiv) {
    try {
      // Clear previous content
      statusDiv.textContent = '';
      
      const targetNode = document.querySelector(window.getSelector());
      const statusSpan = document.createElement('span');
      
      if (targetNode) {
        if (targetNode.contentEditable === 'true') {
          statusSpan.style.color = '#4CAF50';
          statusSpan.textContent = '✓ Highlighting wird unterstützt (contentEditable Element)';
        } else {
          statusSpan.style.color = '#FF9800';
          statusSpan.textContent = '⚠ Highlighting nicht verfügbar (' + targetNode.tagName.toLowerCase() + ' Element)';
        }
      } else {
        statusSpan.style.color = '#f44336';
        statusSpan.textContent = '❌ Textfeld nicht gefunden';
      }
      
      statusDiv.appendChild(statusSpan);
    } catch (error) {
      const errorSpan = document.createElement('span');
      errorSpan.style.color = '#f44336';
      errorSpan.textContent = '❌ Fehler bei der Erkennung';
      statusDiv.appendChild(errorSpan);
      console.error("Error checking highlighting compatibility:", error);
    }
  }
  
  settingsPanel.classList.add('show');
}

function hideSettingsPanel() {
  const settingsPanel = document.getElementById('settings-panel');
  if (settingsPanel) {
    settingsPanel.classList.remove('show');
  }
}

// Make functions available globally for TopBar
window.toggleSettingsPanel = toggleSettingsPanel;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openSettingsPanel') {
    console.log('[ContentScript] Received request to open settings panel from:', message.source);
    toggleSettingsPanel();
    sendResponse({ success: true });
    return true;
  }
});

// ProseMirror styling observer
let proseMirrorObserver = null;

function setupProseMirrorObserver(targetNode, extensionPrompts) {
  // Disconnect previous observer
  if (proseMirrorObserver) {
    proseMirrorObserver.disconnect();
  }
  
  let isApplyingStyling = false; // Flag to prevent infinite loops
  let lastStyleTime = 0; // Throttle styling operations
  const STYLE_THROTTLE_MS = 500; // Minimum time between styling operations
  
  proseMirrorObserver = new MutationObserver((mutations) => {
    // Prevent infinite loops caused by our own DOM modifications
    if (isApplyingStyling) {
      return;
    }
    
    // Check if mutations were caused by our highlight spans
    const isOurMutation = mutations.some(mutation => 
      Array.from(mutation.addedNodes).some(node => 
        node.nodeType === Node.ELEMENT_NODE && node.classList?.contains('prompt-highlight')
      )
    );
    
    if (isOurMutation) {
      // Skip mutations caused by our own styling
      return;
    }
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Check if our spans were removed and need re-applying
        const hasHighlights = targetNode.querySelectorAll('.prompt-highlight').length > 0;
        const textContent = targetNode.textContent;
        
        // Only re-apply if we have content but no highlights and throttle is cleared
        const now = Date.now();
        if (textContent && !hasHighlights && (now - lastStyleTime > STYLE_THROTTLE_MS)) {
          isApplyingStyling = true; // Set flag to prevent loops
          lastStyleTime = now;
          
          try {
            // Apply color styling to text that contains our prompts
            extensionPrompts.forEach((prompt, index) => {
              if (textContent.includes(prompt.trim())) {
                // Try to find and style text nodes containing prompts
                const walker = document.createTreeWalker(
                  targetNode,
                  NodeFilter.SHOW_TEXT,
                  null,
                  false
                );
                
                let node;
                while (node = walker.nextNode()) {
                  if (node.textContent.includes(prompt.trim())) {
                    // Create a span around this text node
                    const parent = node.parentNode;
                    if (parent && !parent.classList.contains('prompt-highlight')) {
                      const span = document.createElement('span');
                      span.className = `prompt-highlight ${index % 2 === 0 ? 'even' : 'odd'}`;
                      span.style.color = index % 2 === 0 ? '#4A9EFF' : '#1E7CE8';
                      span.style.fontWeight = 'bold';
                      
                      parent.insertBefore(span, node);
                      span.appendChild(node);
                      
                      if (window.errorHandler && window.errorHandler.debugMode) {
                        console.log("🔄 Re-applied styling to prompt", index);
                      }
                    }
                  }
                }
              }
            });
          } finally {
            // Always reset the flag, even if an error occurs
            setTimeout(() => {
              isApplyingStyling = false;
            }, 100);
          }
        }
      }
    });
  });
  
  proseMirrorObserver.observe(targetNode, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

// Helper function to escape regex special characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Function to remove a specific prompt from content
function removePromptFromContent(content, promptToRemove) {
  if (!content || !promptToRemove) return content;
  
  // Create regex that handles the prompt with surrounding whitespace/newlines
  // This ensures clean removal without leaving extra blank lines
  const escapedPrompt = escapeRegex(promptToRemove);
  
  // Try different patterns to ensure clean removal
  const patterns = [
    new RegExp(escapedPrompt + '\\s*\\n\\s*\\n', 'g'),  // Prompt with double newline after
    new RegExp(escapedPrompt + '\\s*\\n', 'g'),         // Prompt with single newline after
    new RegExp('\\n\\s*' + escapedPrompt + '\\s*\\n', 'g'), // Prompt with newlines before and after
    new RegExp(escapedPrompt, 'g')                      // Just the prompt itself as fallback
  ];
  
  let cleanedContent = content;
  for (const pattern of patterns) {
    const beforeLength = cleanedContent.length;
    cleanedContent = cleanedContent.replace(pattern, '\n');
    if (cleanedContent.length < beforeLength) {
      // Successfully removed, clean up any multiple newlines
      cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n').trim();
      break;
    }
  }
  
  return cleanedContent;
}

// Universal helper functions for different element types
function getElementContent(element) {
  if (!element) return '';
  
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'textarea' || tagName === 'input') {
    return element.value || '';
  } else if (element.contentEditable === 'true') {
    // For contenteditable, get text content safely
    // Use textContent which automatically handles HTML entities
    return element.textContent || '';
  }
  return '';
}

function setElementContent(element, content) {
  if (!element) return;
  
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'textarea' || tagName === 'input') {
    element.value = content;
  } else if (element.contentEditable === 'true') {
    // For contenteditable, safely set content
    // Clear existing content
    element.textContent = '';
    
    // Split by newlines and create proper structure
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line) {
        element.appendChild(document.createTextNode(line));
      }
      if (index < lines.length - 1) {
        element.appendChild(document.createElement('br'));
      }
    });
  }
}

function triggerElementUpdate(element) {
  if (!element) return;
  
  // Trigger appropriate events for different element types
  if (element.contentEditable === 'true') {
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    // Focus the element to ensure cursor position
    element.focus();
  } else {
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function highlightDetectedTextfield() {
  const targetNode = document.querySelector(window.getSelector());
  if (targetNode) {
    targetNode.classList.add('prompt-engineer-detected');
    // Remove class after animation completes
    setTimeout(() => {
      targetNode.classList.remove('prompt-engineer-detected');
    }, 2000);
  }
}

function updateTextfieldContent() {
  // Prevent execution during initialization phase
  if (isInitializing) {
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("⚠️ updateTextfieldContent: Skipped during initialization");
    }
    return;
  }
  
  const targetNode = document.querySelector(window.getSelector());
  if (!targetNode) {
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("⚠️ updateTextfieldContent: Kein targetNode gefunden");
    }
    return;
  }

  if (window.errorHandler && window.errorHandler.debugMode) {
    console.log("🔄 updateTextfieldContent: Starte Update...");
    console.log("📊 Active prompts:", activePrompts);
    console.log("📦 Prompt history active:", Array.from(promptHistory.active));
  }

  // Get current content
  let currentContent = getElementContent(targetNode);
  
  // Extract and preserve user's own text
  // We do this by removing all known extension prompts from the current content
  let cleanedContent = currentContent;
  
  // Remove all known extension prompts (both active and inactive) to isolate user text
  promptHistory.all.forEach(knownPrompt => {
    cleanedContent = removePromptFromContent(cleanedContent, knownPrompt);
  });
  
  // What remains is the user's own text
  userOwnText = cleanedContent.trim();
  
  if (window.errorHandler && window.errorHandler.debugMode) {
    console.log("👤 Extracted user text:", userOwnText);
  }
  
  // Build list of currently active extension prompts
  let activeExtensionPrompts = [];
  
  // Add dropdown prompts
  activePrompts.dropdowns.forEach(promptObj => {
    if (promptObj.text && promptObj.text.trim()) {
      const prompt = promptObj.text.trim();
      activeExtensionPrompts.push(prompt);
      promptHistory.all.add(prompt);
      promptHistory.active.add(prompt);
    }
  });
  
  // Add checkbox prompts
  activePrompts.checkboxes.forEach(prompt => {
    if (prompt && prompt.trim()) {
      const trimmedPrompt = prompt.trim();
      activeExtensionPrompts.push(trimmedPrompt);
      promptHistory.all.add(trimmedPrompt);
      promptHistory.active.add(trimmedPrompt);
    }
  });
  
  // Add input prompts
  activePrompts.inputs.forEach(promptObj => {
    if (promptObj.text && promptObj.text.trim()) {
      const prompt = promptObj.text.trim();
      activeExtensionPrompts.push(prompt);
      promptHistory.all.add(prompt);
      promptHistory.active.add(prompt);
    }
  });
  
  // Clean up prompt history - remove inactive prompts
  promptHistory.active.forEach(prompt => {
    const isStillActive = activeExtensionPrompts.includes(prompt);
    if (!isStillActive) {
      promptHistory.active.delete(prompt);
    }
  });
  
  if (window.errorHandler && window.errorHandler.debugMode) {
    console.log("🎯 Active extension prompts:", activeExtensionPrompts);
  }
  
  // Build new content: Extension prompts + User text
  let newContent = '';
  
  if (activeExtensionPrompts.length > 0) {
    if (extensionSettings.highlightPrompts && targetNode.contentEditable === 'true') {
      // Apply highlighting for contenteditable elements
      targetNode.textContent = '';
      
      // Add extension prompts with highlighting
      activeExtensionPrompts.forEach((prompt, index) => {
        const className = index % 2 === 0 ? 'even' : 'odd';
        
        const span = document.createElement('span');
        span.className = `prompt-highlight ${className}`;
        span.textContent = prompt;
        span.style.color = className === 'even' ? '#4A9EFF' : '#1E7CE8';
        span.style.fontWeight = 'bold';
        
        targetNode.appendChild(span);
        
        if (index < activeExtensionPrompts.length - 1) {
          targetNode.appendChild(document.createElement('br'));
          targetNode.appendChild(document.createElement('br'));
        }
      });
      
      // Add separator between extension prompts and user text
      if (userOwnText) {
        targetNode.appendChild(document.createElement('br'));
        targetNode.appendChild(document.createElement('br'));
        targetNode.appendChild(document.createTextNode(userOwnText));
      }
      
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("✨ Applied highlighting to prompts:", activeExtensionPrompts.length);
      }
      
      // Set up observer for ProseMirror if needed (only after initialization)
      if (!isInitializing && targetNode.classList.contains('ProseMirror')) {
        setupProseMirrorObserver(targetNode, activeExtensionPrompts);
      }
    } else {
      // No highlighting or textarea element - use plain text
      if (activeExtensionPrompts.length > 0) {
        newContent = activeExtensionPrompts.join('\n\n');
      }
      
      if (userOwnText) {
        if (newContent) {
          newContent += '\n\n' + userOwnText;
        } else {
          newContent = userOwnText;
        }
      }
      
      // Set the combined content
      setElementContent(targetNode, newContent);
    }
  } else {
    // No extension prompts active, just restore user text
    setElementContent(targetNode, userOwnText);
  }
  
  // Trigger appropriate events
  triggerElementUpdate(targetNode);
  
  if (window.errorHandler && window.errorHandler.debugMode) {
    console.log("✅ updateTextfieldContent: Update abgeschlossen");
  }
}

function extractUserText(content) {
  // Handle empty or non-string content
  if (!content || typeof content !== 'string') return '';
  
  // First, remove highlighted prompts (if any) before processing
  let cleanContent = content;
  if (content.includes('<span class="prompt-highlight')) {
    // Remove highlighted prompt spans but keep their content for processing
    cleanContent = content.replace(/<span class="prompt-highlight[^"]*"[^>]*>/g, '').replace(/<\/span>/g, '');
    console.log("🎨 Removed highlighting spans from content");
  }
  
  // Strip remaining HTML if needed (contenteditable might have formatting)
  const textOnly = cleanContent.replace(/<[^>]*>/g, '').trim();
  
  console.log("🔍 extractUserText input:", content);
  console.log("🧹 After HTML cleanup:", textOnly);
  
  // Split content by extension markers and return only user content
  const lines = textOnly.split('\n');
  let userLines = [];
  let inExtensionBlock = false;
  
  for (let line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Enhanced heuristic: if line looks like an extension prompt, skip it
    const isExtensionPrompt = (
      // Check for highlighting markers (old and new)
      trimmedLine.startsWith('▶') || trimmedLine.startsWith('▷') ||
      trimmedLine.startsWith('🔹') || trimmedLine.startsWith('🔸') ||
      // Check for typical prompt characteristics
      (trimmedLine.length > 80 && (
        trimmedLine.includes('Generate') || 
        trimmedLine.includes('Write') || 
        trimmedLine.includes('Create') || 
        trimmedLine.includes('Provide') ||
        trimmedLine.includes('Give me') ||
        trimmedLine.includes('Compose') ||
        trimmedLine.includes('Format') ||
        trimmedLine.includes('maximum of') ||
        trimmedLine.includes('bullet points')
      ))
    );
    
    if (isExtensionPrompt) {
      console.log("🚫 Erkannt als Extension-Prompt:", trimmedLine.substring(0, 50) + "...");
      inExtensionBlock = true;
      continue;
    }
    
    // If we find a short line after extension block, assume user content starts
    if (inExtensionBlock && trimmedLine.length < 80) {
      inExtensionBlock = false;
    }
    
    if (!inExtensionBlock) {
      console.log("✅ Erkannt als User-Text:", trimmedLine);
      userLines.push(trimmedLine);
    }
  }
  
  const result = userLines.join('\n');
  console.log("👤 Final user text:", result);
  return result;
}

async function init() {
  if (initCalled) {
    return;
  }

  initCalled = true;

  if (dropdownsAdded) {
    return;
  }

  // Load settings first
  loadSettings();

  // Add 2-second delay to ensure getSelector is available
  await new Promise(resolve => setTimeout(resolve, 2000));

  removeExistingContainer();

  const container = createContainer();
  // Always append to body as last element for bottom menu
  document.body.appendChild(container);
  
  // Initialize language switcher and build UI (TopBar will be created in buildUI)
  window.initLanguageSwitcher();
  xmlData = await window.fetchDropdownData(localStorage.getItem('selectedLanguage') || 'en');
  
  // Highlight detected textfield
  highlightDetectedTextfield();



  // Ensure activePrompts are empty during initialization
  activePrompts = {
    checkboxes: [],
    dropdowns: [],
    inputs: []
  };
  
  // Clear prompt history to ensure clean state
  promptHistory = {
    all: new Set(),
    active: new Set(),
    lastKnownContent: ''
  };
  userOwnText = '';

  window.buildUI(xmlData);
  addEventListeners(container);
  
  // Mark initialization as complete and make flag globally available
  isInitializing = false;
  window.isInitializing = false;
  if (window.errorHandler && window.errorHandler.debugMode) {
    console.log("✅ Extension initialization completed - user interactions now enabled");
  }
}


function createContainer() {
  container = document.createElement("div");
  container.id = "prompt-generator-container";
  container.classList.add("prompt-generator-container");
  
  // Check auto-open setting
  if (extensionSettings.autoOpen) {
    // Start visible if auto-open is enabled
  } else {
    // Start hidden for bottom menu
    container.classList.add("hidden");
  }

  return container;
}


function addEventListeners(container) {
  const targetNode = document.querySelector(window.getSelector());


  window.submitForm = async function(xmlData) {
    let originalText = targetNode.value.trim();
    let dropdownTexts = '';
    for (const select of document.querySelectorAll('.prompt-generator-container select')) {
      const selectedText = select.options[select.selectedIndex].dataset.text;
      dropdownTexts += selectedText ? ' ' + selectedText : '';
    }
  
    let inputTexts = '';
    for (const input of document.querySelectorAll('.prompt-generator-container input[type="text"]')) {
      if (input.value) {
        inputTexts += ' ' + input.getAttribute('valueBefore') + input.value + input.getAttribute('valueAfter');
      }
    }
  
    let checkboxTexts = '';
    let additionalIds = [];
  
    for (const checkbox of document.querySelectorAll('.prompt-generator-container input[type="checkbox"]')) {
      if (checkbox.checked) {
        checkboxTexts += ' ' + checkbox.value;
        const additionalFields = checkbox.getAttribute('additionals');
        if (additionalFields) {
          const ids = additionalFields.split(',');
          ids.forEach(id => additionalIds.push(id.trim()));
        }
      } else {
        const additionalFields = checkbox.getAttribute('additionalsHide');
        if (additionalFields) {
          const ids = additionalFields.split(',');
          ids.forEach(id => {
            const inputField = document.getElementById(id.trim());
            if (inputField) {
              inputField.parentElement.classList.add('HideInput');
              inputField.value = '';
            }
          });
        }
      }
    }
  
    function getLanguageName(langCode) {
      return languageMapping[langCode] || langCode;
    }
  
    const currentLanguageDropdown = document.getElementById('language-selector');
    const selectedLanguageCode = currentLanguageDropdown.value;
    const selectedLanguageName = getLanguageName(selectedLanguageCode);
  
   
  
    if (container.classList.contains('hidden')) {
      combinedText = originalText;
    } else {
      combinedText = `${dropdownTexts}\n${checkboxTexts}\n${inputTexts}\n\n${originalText}`;
      if (selectedLanguageCode && selectedLanguageCode !== "en") {
        combinedText += `\n\nAnswer in ${selectedLanguageName} all the time.`;
      }
    }
    targetNode.value = combinedText.trim();
  
    const sendButton = document.getElementById('PromptButton');
    if (sendButton) {
      sendButton.click();

      setTimeout(function() {
        sendButton.click();
  
      setTimeout(function () {
        targetNode.value = '';
      }, 2000);
  
      setTimeout(() => {
        if (isContainerOpen()) {
          toggleContainerVisibility();
        }
      }, 10000);
    }, 10000);  // Hinzugefügt: Warte 500 ms bevor das Senden ausgelöst wird
  } else {
      console.log("Send button not found");
    }
  }
  





  targetNode.addEventListener("keydown", function (event) {
    if (event.target === targetNode && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitForm(xmlData);
    }
  });



  // Handle checkbox styling and live prompt updates
  container.addEventListener("change", function (event) {
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("🎯 Extension Change Event triggered:", event.target.type, event.target);
    }
    
    if (event.target.type === 'checkbox') {
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("📋 Checkbox Event - ID:", event.target.id, "Checked:", event.target.checked, "Value:", event.target.value);
      }
      
      const checkboxLabel = event.target.parentElement;
      const checkboxValue = event.target.value;
      
      if (event.target.checked) {
        checkboxLabel.classList.add('active');
        // Add checkbox prompt to active prompts
        if (checkboxValue && !activePrompts.checkboxes.includes(checkboxValue)) {
          activePrompts.checkboxes.push(checkboxValue);
          if (window.errorHandler && window.errorHandler.debugMode) {
            console.log("➕ Adding checkbox prompt:", checkboxValue);
          }
        }
      } else {
        checkboxLabel.classList.remove('active');
        // Remove checkbox prompt from active prompts
        activePrompts.checkboxes = activePrompts.checkboxes.filter(prompt => prompt !== checkboxValue);
        if (window.errorHandler && window.errorHandler.debugMode) {
          console.log("➖ Removing checkbox prompt:", checkboxValue);
        }
      }
      
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("📊 Updated activePrompts.checkboxes:", activePrompts.checkboxes);
        console.log("🔄 Calling updateTextfieldContent...");
      }
      updateTextfieldContent();
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("✅ Checkbox event handling completed");
      }
      return;
    }

    if (!event.target.options || typeof event.target.selectedIndex === 'undefined') {
      return;
    }

    const selectedOption = event.target.options[event.target.selectedIndex];
    let additionalIds = [];

    // Handle dropdown prompt updates
    const dropdownId = event.target.id;
    const selectedText = selectedOption.dataset.text;
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("🔽 Dropdown Event - ID:", dropdownId, "Selected text:", selectedText);
      console.log("📋 Selected option:", selectedOption);
    }
    
    if (selectedText) {
      // Find and update or add dropdown prompt
      let foundIndex = -1;
      for (let i = 0; i < activePrompts.dropdowns.length; i++) {
        if (activePrompts.dropdowns[i].id === dropdownId) {
          foundIndex = i;
          break;
        }
      }
      
      const promptObj = { id: dropdownId, text: selectedText };
      if (foundIndex >= 0) {
        if (window.errorHandler && window.errorHandler.debugMode) {
          console.log("🔄 Updating existing dropdown prompt at index:", foundIndex);
        }
        activePrompts.dropdowns[foundIndex] = promptObj;
      } else {
        if (window.errorHandler && window.errorHandler.debugMode) {
          console.log("➕ Adding new dropdown prompt:", promptObj);
        }
        activePrompts.dropdowns.push(promptObj);
      }
    } else {
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("➖ Removing dropdown prompt for ID:", dropdownId);
      }
      // Remove prompt if no selection
      activePrompts.dropdowns = activePrompts.dropdowns.filter(prompt => prompt.id !== dropdownId);
    }
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("📊 Updated activePrompts.dropdowns:", activePrompts.dropdowns);
      console.log("🔄 Calling updateTextfieldContent...");
    }
    updateTextfieldContent();
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("✅ Dropdown event handling completed");
    }

    if (selectedOption.dataset && selectedOption.dataset.additionals) {
      const ids = selectedOption.dataset.additionals.split(',');
      ids.forEach(id => additionalIds.push(id.trim()));


    }

    Array.from(container.querySelectorAll('.prompt-generator-input-div')).forEach(inputDiv => {
      const inputElement = inputDiv.querySelector('input[type="text"]');
      if (inputElement && !additionalIds.includes(inputElement.id)) {
        inputDiv.classList.add('HideInput');
        inputElement.value = '';
      }
    });

    Array.from(container.querySelectorAll('input[type="checkbox"]')).forEach(checkbox => {
      const checkboxField = checkbox.parentElement.parentElement;
      const additionals = checkbox.getAttribute('additionals');
      const additionalsHide = checkbox.getAttribute('additionalsHide');




      if (additionals && additionalsHide) {
        if (selectedOption.dataset && selectedOption.dataset.text === checkbox.value) {
          checkboxField.classList.remove('HideInput');
        } else {
          checkboxField.classList.add('HideInput');
          const ids = additionalsHide.split(',');
          ids.forEach(id => {
            const inputField = document.getElementById(id.trim());
            if (inputField) {
              inputField.value = '';
            }
          });
        }
      }
    });

    Array.from(additionalIds).forEach(id => {
      const inputField = document.getElementById(id.trim());
      if (inputField) {
        inputField.parentElement.classList.remove('HideInput');
      }
    });
  });

  // Handle input field changes for highlighting updates
  container.addEventListener("input", function (event) {
    if (event.target.type === 'text' && event.target.classList.contains('prompt-generator-input')) {
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("📝 Input Event - ID:", event.target.id, "Value:", event.target.value);
      }
      
      const inputId = event.target.id;
      const inputValue = event.target.value.trim();
      const valueBefore = event.target.getAttribute('valueBefore') || '';
      const valueAfter = event.target.getAttribute('valueAfter') || '';
      
      // Build complete prompt text if input has value
      let completePrompt = '';
      if (inputValue) {
        completePrompt = valueBefore + inputValue + valueAfter;
      }
      
      // Update active prompts for this input
      let foundIndex = -1;
      for (let i = 0; i < activePrompts.inputs.length; i++) {
        if (activePrompts.inputs[i].id === inputId) {
          foundIndex = i;
          break;
        }
      }
      
      if (completePrompt) {
        const promptObj = { id: inputId, text: completePrompt };
        if (foundIndex >= 0) {
          if (window.errorHandler && window.errorHandler.debugMode) {
            console.log("🔄 Updating existing input prompt at index:", foundIndex);
          }
          activePrompts.inputs[foundIndex] = promptObj;
        } else {
          if (window.errorHandler && window.errorHandler.debugMode) {
            console.log("➕ Adding new input prompt:", promptObj);
          }
          activePrompts.inputs.push(promptObj);
        }
      } else {
        // Remove prompt if input is empty
        if (foundIndex >= 0) {
          if (window.errorHandler && window.errorHandler.debugMode) {
            console.log("➖ Removing input prompt for ID:", inputId);
          }
          activePrompts.inputs.splice(foundIndex, 1);
        }
      }
      
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("📊 Updated activePrompts.inputs:", activePrompts.inputs);
        console.log("🔄 Calling updateTextfieldContent...");
      }
      updateTextfieldContent();
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("✅ Input event handling completed");
      }
    }
  });

  dropdownsAdded = true;
  // updateUI() removed - it was causing double initialization and unwanted text insertion
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
  initMutationObserver();
}

function initMutationObserver() {
  // Disconnect any existing observer
  if (mainObserver) {
    mainObserver.disconnect();
    mainObserver = null;
  }
  
  // Check retry limit
  if (observerRetryCount >= MAX_OBSERVER_RETRIES) {
    console.error('❌ Max observer retries reached. Extension initialization failed.');
    return;
  }
  
  observerRetryCount++;
  
  mainObserver = new MutationObserver(async (mutations) => {
    // Use a shorter, more reasonable delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (window.getSelector) {
      try {
        const targetNode = document.querySelector(window.getSelector());
        if (targetNode) {
          init();
          // Successfully initialized - clean up observer
          if (mainObserver) {
            mainObserver.disconnect();
            mainObserver = null;
          }
          observerRetryCount = 0; // Reset retry count on success
        } else {
          console.log(`⚠️ Attempt ${observerRetryCount}/${MAX_OBSERVER_RETRIES}: Textfeld nicht gefunden`);
          
          // Stop observing after max retries
          if (observerRetryCount >= MAX_OBSERVER_RETRIES) {
            if (mainObserver) {
              mainObserver.disconnect();
              mainObserver = null;
            }
            console.error('❌ Textfeld konnte nicht gefunden werden nach', MAX_OBSERVER_RETRIES, 'Versuchen');
          }
        }
      } catch (error) {
        console.error('Error in MutationObserver:', error);
        if (mainObserver) {
          mainObserver.disconnect();
          mainObserver = null;
        }
      }
    } else {
      console.log(`⚠️ getSelector function not available yet (attempt ${observerRetryCount})`);
    }
  });

  mainObserver.observe(document.body, { childList: true, subtree: true });
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (mainObserver) {
    mainObserver.disconnect();
    mainObserver = null;
  }
  if (proseMirrorObserver) {
    proseMirrorObserver.disconnect();
    proseMirrorObserver = null;
  }
});


function removeExistingContainer() {
  const existingContainer = document.getElementById('prompt-generator-container');
  if (existingContainer) {
    existingContainer.remove();
  }
}

function toggleContainerVisibility() {
  if (isContainerOpen()) {
    container.classList.add('hidden');
  } else {
    container.classList.remove('hidden');
  }
}

function getInputTexts(xmlData) {
  const inputs = xmlData.getElementsByTagName('input');
  Array.from(inputs).forEach((input) => {
    const idElement = input.querySelector('id');
    const valueBeforeElement = input.querySelector('valueBefore');
    const valueAfterElement = input.querySelector('valueAfter');
    const inputId = idElement ? idElement.textContent : '';

    if (inputId) {
      const inputElement = document.getElementById(inputId);
      if (inputElement) {
        const valueBefore = valueBeforeElement ? valueBeforeElement.textContent : '';
        const valueAfter = valueAfterElement ? valueAfterElement.textContent : '';
        inputElement.setAttribute('valueBefore', valueBefore);
        inputElement.setAttribute('valueAfter', valueAfter);
      }
    }
  });
}

function isContainerOpen() {
  // Prüfen, ob der Container sichtbar ist, indem die Sichtbarkeit des Elements geprüft wird
  return window.getComputedStyle(container).display !== "none";
}


