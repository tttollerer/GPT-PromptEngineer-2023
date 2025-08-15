/**
 * MAIN CONTENT SCRIPT (REFACTORED)
 * Simplified main orchestrator for the PromptEngineer extension
 * Dependencies are loaded from separate modules for better maintainability
 */

// Global state access helper
function getState() {
  return window.getExtensionState ? window.getExtensionState() : window.extensionState;
}

// Settings Panel Management (moved from settings/settings_panel.js)
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
  
  
  // AI Settings Section
  const aiSection = window.aiSettings.createAISettingsSection();
  
  // Assemble everything
  settingsContent.appendChild(settingsHeader);
  settingsContent.appendChild(settingItem1);
  settingsContent.appendChild(settingItem2);
  settingsContent.appendChild(aiSection);
  settingsPanel.appendChild(settingsContent);
  
  // Event listeners
  closeButton.addEventListener('click', hideSettingsPanel);
  
  settingsPanel.addEventListener('click', (e) => {
    if (e.target === settingsPanel) {
      hideSettingsPanel();
    }
  });
  
  // Settings checkboxes event handlers
  checkbox1.addEventListener('change', (e) => {
    window.settingsManager.updateSetting('autoOpen', e.target.checked);
  });
  
  checkbox2.addEventListener('change', (e) => {
    window.settingsManager.updateSetting('highlightPrompts', e.target.checked);
    window.contentUpdater.updateTextfieldContent();
  });
  
  document.body.appendChild(settingsPanel);
  return settingsPanel;
}

function toggleSettingsPanel() {
  let settingsPanel = document.getElementById('settings-panel');
  if (!settingsPanel) {
    settingsPanel = createSettingsPanel();
  }
  
  const settings = window.settingsManager.getAllSettings();
  
  // Update checkbox states
  const autoOpenCheckbox = settingsPanel.querySelector('#auto-open-setting');
  const highlightCheckbox = settingsPanel.querySelector('#highlight-prompts-setting');
  
  autoOpenCheckbox.checked = settings.autoOpen;
  highlightCheckbox.checked = settings.highlightPrompts;
  
  // Update highlighting compatibility status
  const statusDiv = settingsPanel.querySelector('#highlighting-compatibility-status');
  if (statusDiv) {
    try {
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

// Form submission functionality
window.submitForm = async function(xmlData) {
  const state = window.getExtensionState();
  const targetNode = document.querySelector(window.getSelector());
  
  if (!targetNode) return;
  
  let originalText = window.textUtils.getElementContent(targetNode).trim();
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
  for (const checkbox of document.querySelectorAll('.prompt-generator-container input[type="checkbox"]')) {
    if (checkbox.checked) {
      checkboxTexts += ' ' + checkbox.value;
    }
  }

  function getLanguageName(langCode) {
    return languageMapping[langCode] || langCode;
  }

  const currentLanguageDropdown = document.getElementById('language-selector');
  const selectedLanguageCode = currentLanguageDropdown?.value || 'en';
  const selectedLanguageName = getLanguageName(selectedLanguageCode);

  if (state.container.classList.contains('hidden')) {
    state.combinedText = originalText;
  } else {
    state.combinedText = `${dropdownTexts}\n${checkboxTexts}\n${inputTexts}\n\n${originalText}`;
    if (selectedLanguageCode && selectedLanguageCode !== "en") {
      state.combinedText += `\n\nAnswer in ${selectedLanguageName} all the time.`;
    }
  }
  
  window.textUtils.setElementContent(targetNode, state.combinedText.trim());

  const sendButton = document.getElementById('PromptButton');
  if (sendButton) {
    sendButton.click();
    
    setTimeout(() => {
      window.textUtils.setElementContent(targetNode, '');
      if (window.containerManager.isContainerOpen()) {
        window.containerManager.toggleContainerVisibility();
      }
    }, 12000);
  }
};

// Event handlers for UI interactions
function addEventListeners(container) {
  const targetNode = document.querySelector(window.getSelector());
  if (!targetNode) return;

  targetNode.addEventListener("keydown", function (event) {
    if (event.target === targetNode && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      window.submitForm(getState().xmlData);
    }
  });

  // Handle checkbox and dropdown changes
  container.addEventListener("change", function (event) {
    const state = window.getExtensionState();
    
    if (event.target.type === 'checkbox') {
      const checkboxLabel = event.target.parentElement;
      const checkboxValue = event.target.value;
      
      if (event.target.checked) {
        checkboxLabel.classList.add('active');
        if (checkboxValue && !state.activePrompts.checkboxes.includes(checkboxValue)) {
          state.activePrompts.checkboxes.push(checkboxValue);
        }
      } else {
        checkboxLabel.classList.remove('active');
        state.activePrompts.checkboxes = state.activePrompts.checkboxes.filter(prompt => prompt !== checkboxValue);
      }
      
      window.contentUpdater.updateTextfieldContent();
      return;
    }

    if (event.target.options) {
      const selectedOption = event.target.options[event.target.selectedIndex];
      const dropdownId = event.target.id;
      const selectedText = selectedOption.dataset.text;
      
      if (selectedText) {
        let foundIndex = -1;
        for (let i = 0; i < state.activePrompts.dropdowns.length; i++) {
          if (state.activePrompts.dropdowns[i].id === dropdownId) {
            foundIndex = i;
            break;
          }
        }
        
        const promptObj = { id: dropdownId, text: selectedText };
        if (foundIndex >= 0) {
          state.activePrompts.dropdowns[foundIndex] = promptObj;
        } else {
          state.activePrompts.dropdowns.push(promptObj);
        }
      } else {
        state.activePrompts.dropdowns = state.activePrompts.dropdowns.filter(prompt => prompt.id !== dropdownId);
      }
      
      window.contentUpdater.updateTextfieldContent();
    }
  });

  // Handle input field changes
  container.addEventListener("input", function (event) {
    if (event.target.type === 'text' && event.target.classList.contains('prompt-generator-input')) {
      const state = window.getExtensionState();
      const inputId = event.target.id;
      const inputValue = event.target.value.trim();
      const valueBefore = event.target.getAttribute('valueBefore') || '';
      const valueAfter = event.target.getAttribute('valueAfter') || '';
      
      let completePrompt = '';
      if (inputValue) {
        completePrompt = valueBefore + inputValue + valueAfter;
      }
      
      let foundIndex = -1;
      for (let i = 0; i < state.activePrompts.inputs.length; i++) {
        if (state.activePrompts.inputs[i].id === inputId) {
          foundIndex = i;
          break;
        }
      }
      
      if (completePrompt) {
        const promptObj = { id: inputId, text: completePrompt };
        if (foundIndex >= 0) {
          state.activePrompts.inputs[foundIndex] = promptObj;
        } else {
          state.activePrompts.inputs.push(promptObj);
        }
      } else if (foundIndex >= 0) {
        state.activePrompts.inputs.splice(foundIndex, 1);
      }
      
      window.contentUpdater.updateTextfieldContent();
    }
  });

  getState().setDropdownsAdded(true);
}

// Main initialization function
async function init() {
  const state = window.getExtensionState();
  
  if (state.initCalled) return;
  state.setInitCalled(true);

  if (state.dropdownsAdded) return;

  // Load settings
  window.settingsManager.loadSettings();

  // Add delay to ensure getSelector is available
  await new Promise(resolve => setTimeout(resolve, 2000));

  window.containerManager.removeExistingContainer();

  const container = window.containerManager.createContainer();
  window.containerManager.appendToDOM(container);
  
  // Initialize language switcher and build UI
  window.initLanguageSwitcher();
  state.xmlData = await window.fetchDropdownData(localStorage.getItem('selectedLanguage') || 'en');
  
  window.textUtils.highlightDetectedTextfield();

  // Reset state
  state.resetPromptState();

  window.buildUI(state.xmlData);
  addEventListeners(container);
  
  // Mark initialization as complete
  state.setInitializing(false);
  
  if (window.errorHandler && window.errorHandler.debugMode) {
    console.log("✅ Extension initialization completed - user interactions now enabled");
  }
}

// Mutation observer for initialization
function initMutationObserver() {
  const state = window.getExtensionState();
  
  if (state.mainObserver) {
    state.mainObserver.disconnect();
    state.mainObserver = null;
  }
  
  if (state.observerRetryCount >= state.MAX_OBSERVER_RETRIES) {
    console.error('❌ Max observer retries reached. Extension initialization failed.');
    return;
  }
  
  state.observerRetryCount++;
  
  state.mainObserver = new MutationObserver(async (mutations) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (window.getSelector) {
      try {
        const targetNode = document.querySelector(window.getSelector());
        if (targetNode) {
          init();
          if (state.mainObserver) {
            state.mainObserver.disconnect();
            state.mainObserver = null;
          }
          state.observerRetryCount = 0;
        }
      } catch (error) {
        console.error('Error in MutationObserver:', error);
        if (state.mainObserver) {
          state.mainObserver.disconnect();
          state.mainObserver = null;
        }
      }
    }
  });

  state.mainObserver.observe(document.body, { childList: true, subtree: true });
}

// Helper function for XML data processing
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

// Make functions globally available
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

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  const state = window.getExtensionState();
  if (state.mainObserver) {
    state.mainObserver.disconnect();
    state.mainObserver = null;
  }
  window.proseMirrorObserver.disconnect();
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init();
  });
} else {
  init();
  initMutationObserver();
}

if (window.errorHandler && window.errorHandler.debugMode) {
  console.log("🚀 Main Content Script (Refactored) initialized");
}