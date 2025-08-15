/**
 * AI SETTINGS
 * Handles AI-related settings UI and functionality
 */

window.aiSettings = {
  // Create AI Settings section for the settings panel
  createAISettingsSection: function() {
    const aiSection = document.createElement('div');
    aiSection.className = 'settings-section';
    aiSection.style.cssText = 'margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);';
    
    const aiTitle = document.createElement('h4');
    aiTitle.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle;">
        <path d="M12 8V4H8"/>
        <rect width="16" height="12" x="4" y="8" rx="2"/>
        <path d="M2 14h2"/>
        <path d="M20 14h2"/>
        <path d="M15 13v2"/>
        <path d="M9 13v2"/>
      </svg>
      KI-Prompt Generator
    `;
    aiTitle.style.cssText = 'margin-bottom: 10px; color: var(--white); display: flex; align-items: center;';
    
    // Provider selection
    const providerSection = document.createElement('div');
    providerSection.style.cssText = 'margin-bottom: 20px;';
    
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
      const keySection = this.createAPIKeySection(provider.id, provider.name);
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
      margin-top: 15px;
      transition: background 0.2s;
    `;
    
    const testStatus = document.createElement('div');
    testStatus.id = 'ai-test-status';
    testStatus.style.cssText = 'margin-top: 10px; font-size: 12px; display: none;';
    
    // Custom System Prompt Section
    const systemPromptSection = this.createSystemPromptSection();
    
    const description = document.createElement('div');
    description.className = 'setting-description';
    description.style.cssText = 'margin-top: 10px;';
    description.textContent = 'Konfiguriere deine API-Keys für KI-gestützte Prompt-Generierung. Die Keys werden sicher gespeichert.';
    
    // Event listeners
    providerSelect.addEventListener('change', (e) => {
      this.updateAPIKeyVisibility(e.target.value);
      this.updateSelectedProvider(e.target.value);
    });
    
    testButton.addEventListener('click', () => this.testAPIConnection());
    
    // Assemble section
    aiSection.appendChild(aiTitle);
    aiSection.appendChild(providerSection);
    aiSection.appendChild(apiKeyContainer);
    aiSection.appendChild(testButton);
    aiSection.appendChild(testStatus);
    aiSection.appendChild(systemPromptSection);
    aiSection.appendChild(description);
    
    // Initialize display
    if (window.apiManager) {
      setTimeout(() => {
        this.loadAISettings();
        this.updateAPIKeyVisibility(providerSelect.value);
      }, 100);
    }
    
    return aiSection;
  },

  // Create API key section for a specific provider
  createAPIKeySection: function(providerId, providerName) {
    const section = document.createElement('div');
    section.className = 'ai-api-key-section';
    section.id = `ai-key-section-${providerId}`;
    section.style.cssText = 'margin: 15px 0; display: none;';
    
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
    toggleButton.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    `;
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
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary);
    `;
    
    toggleButton.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text';
        toggleButton.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9.88 9.88a3 3 0 1 0 4.24 4.24"/>
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 8 11 8a13.16 13.16 0 0 1-1.67 2.68"/>
            <path d="M6.61 6.61A13.526 13.526 0 0 0 1 12s4 8 11 8a9.74 9.74 0 0 0 5.39-1.61"/>
            <line x1="2" x2="22" y1="2" y2="22"/>
          </svg>
        `;
      } else {
        input.type = 'password';
        toggleButton.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        `;
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
  },

  // Update API key visibility based on selected provider
  updateAPIKeyVisibility: function(selectedProvider) {
    const sections = document.querySelectorAll('.ai-api-key-section');
    sections.forEach(section => {
      section.style.display = 'none';
    });
    
    const selectedSection = document.getElementById(`ai-key-section-${selectedProvider}`);
    if (selectedSection) {
      selectedSection.style.display = 'block';
    }
  },

  // Update selected provider in API manager
  updateSelectedProvider: function(provider) {
    if (window.apiManager) {
      window.apiManager.setProvider(provider);
    }
  },

  // Load AI settings from storage
  loadAISettings: async function() {
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
  },

  // Create System Prompt section
  createSystemPromptSection: function() {
    const section = document.createElement('div');
    section.className = 'system-prompt-section';
    section.style.cssText = 'margin: 20px 0; padding: 20px 0; border-top: 1px solid rgba(255,255,255,0.1);';
    
    const title = document.createElement('h5');
    title.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: middle;">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
      </svg>
      System Prompt
    `;
    title.style.cssText = 'margin-bottom: 8px; color: var(--white); font-size: 14px; display: flex; align-items: center;';
    
    const promptDescription = document.createElement('div');
    promptDescription.className = 'setting-description';
    promptDescription.style.cssText = 'margin-bottom: 12px; font-size: 12px; color: var(--color-text-secondary);';
    promptDescription.textContent = 'Ausschließlich für die "Prompt Verbessern" Funktion verwendet';
    
    // System prompt selector dropdown
    const promptSelectorWrapper = document.createElement('div');
    promptSelectorWrapper.style.cssText = 'margin-bottom: 10px;';
    
    const promptSelectorLabel = document.createElement('label');
    promptSelectorLabel.textContent = 'Vordefinierte Prompts:';
    promptSelectorLabel.style.cssText = 'display: block; margin-bottom: 5px; font-size: 13px;';
    
    const promptSelector = document.createElement('select');
    promptSelector.id = 'ai-system-prompt-selector';
    promptSelector.style.cssText = `
      width: 100%;
      padding: 6px;
      background: var(--color-surface);
      border: 1px solid var(--color-border-default);
      border-radius: 4px;
      color: var(--color-text-primary);
      font-size: 13px;
      margin-bottom: 10px;
    `;
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Eigenes System Prompt verwenden';
    promptSelector.appendChild(defaultOption);
    
    // Load predefined prompts
    this.loadSystemPrompts(promptSelector);
    
    promptSelectorWrapper.appendChild(promptSelectorLabel);
    promptSelectorWrapper.appendChild(promptSelector);
    
    // Custom system prompt textarea
    const textareaWrapper = document.createElement('div');
    textareaWrapper.style.cssText = 'margin-bottom: 10px;';
    
    const textareaLabel = document.createElement('label');
    textareaLabel.textContent = 'Eigenes System Prompt:';
    textareaLabel.style.cssText = 'display: block; margin-bottom: 5px; font-size: 13px;';
    
    const textarea = document.createElement('textarea');
    textarea.id = 'ai-custom-system-prompt';
    textarea.placeholder = 'Gib dein eigenes System Prompt ein...';
    textarea.style.cssText = `
      width: 100%;
      min-height: 100px;
      padding: 8px;
      background: var(--color-surface);
      border: 1px solid var(--color-border-default);
      border-radius: 4px;
      color: var(--color-text-primary);
      font-size: 13px;
      resize: vertical;
      box-sizing: border-box;
    `;
    
    textareaWrapper.appendChild(textareaLabel);
    textareaWrapper.appendChild(textarea);
    
    // Preview area for selected system prompt
    const previewArea = document.createElement('div');
    previewArea.id = 'ai-system-prompt-preview';
    previewArea.style.cssText = `
      background: var(--color-surface-hover);
      border: 1px solid var(--color-border-default);
      border-radius: 4px;
      padding: 10px;
      font-size: 12px;
      color: var(--color-text-secondary);
      max-height: 120px;
      overflow-y: auto;
      display: none;
    `;
    
    // Event listeners
    promptSelector.addEventListener('change', (e) => {
      this.handleSystemPromptSelection(e.target.value, textarea, previewArea);
    });
    
    textarea.addEventListener('input', (e) => {
      this.saveCustomSystemPrompt(e.target.value);
    });
    
    // Assemble section
    section.appendChild(title);
    section.appendChild(promptDescription);
    section.appendChild(promptSelectorWrapper);
    section.appendChild(textareaWrapper);
    section.appendChild(previewArea);
    
    // Load saved settings
    setTimeout(() => {
      this.loadSystemPromptSettings(promptSelector, textarea);
    }, 100);
    
    return section;
  },

  // Load system prompts from JSON file
  loadSystemPrompts: async function(selectElement) {
    try {
      const response = await fetch(chrome.runtime.getURL('data/system_prompts.json'));
      const prompts = await response.json();
      
      Object.keys(prompts).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = this.getSystemPromptDisplayName(key);
        selectElement.appendChild(option);
      });
    } catch (error) {
      console.error('Failed to load system prompts:', error);
    }
  },

  // Get display name for system prompt
  getSystemPromptDisplayName: function(key) {
    const displayNames = {
      'promptEngineering': 'Prompt Engineering',
      'contentCreation': 'Content Erstellung',
      'codeReview': 'Code Review',
      'dataAnalysis': 'Datenanalyse'
    };
    return displayNames[key] || key;
  },

  // Handle system prompt selection
  handleSystemPromptSelection: async function(selectedKey, textarea, previewArea) {
    if (!selectedKey) {
      // Custom prompt selected
      previewArea.style.display = 'none';
      textarea.style.display = 'block';
      return;
    }
    
    try {
      const response = await fetch(chrome.runtime.getURL('data/system_prompts.json'));
      const prompts = await response.json();
      const selectedPrompt = prompts[selectedKey];
      
      if (selectedPrompt && selectedPrompt.system) {
        // Show preview
        previewArea.textContent = selectedPrompt.system;
        previewArea.style.display = 'block';
        textarea.style.display = 'block';
        
        // Save selection
        this.saveSystemPromptSelection(selectedKey);
      }
    } catch (error) {
      console.error('Failed to load selected system prompt:', error);
    }
  },

  // Save system prompt selection
  saveSystemPromptSelection: function(selectedKey) {
    if (window.settingsManager) {
      window.settingsManager.updateSetting('aiSystemPromptType', selectedKey);
    } else {
      localStorage.setItem('ai-system-prompt-type', selectedKey);
    }
  },

  // Save custom system prompt
  saveCustomSystemPrompt: function(promptText) {
    if (window.settingsManager) {
      window.settingsManager.updateSetting('aiCustomSystemPrompt', promptText);
    } else {
      localStorage.setItem('ai-custom-system-prompt', promptText);
    }
  },

  // Load system prompt settings
  loadSystemPromptSettings: function(selectElement, textarea) {
    const selectedType = window.settingsManager 
      ? window.settingsManager.getSetting('aiSystemPromptType')
      : localStorage.getItem('ai-system-prompt-type');
    
    const customPrompt = window.settingsManager
      ? window.settingsManager.getSetting('aiCustomSystemPrompt')
      : localStorage.getItem('ai-custom-system-prompt');
    
    if (selectedType) {
      selectElement.value = selectedType;
      this.handleSystemPromptSelection(selectedType, textarea, document.getElementById('ai-system-prompt-preview'));
    }
    
    if (customPrompt) {
      textarea.value = customPrompt;
    }
  },

  // Get current system prompt (to be used by AI generator)
  getCurrentSystemPrompt: async function() {
    const selectedType = window.settingsManager 
      ? window.settingsManager.getSetting('aiSystemPromptType')
      : localStorage.getItem('ai-system-prompt-type');
    
    if (!selectedType) {
      // Use custom prompt
      const customPrompt = window.settingsManager
        ? window.settingsManager.getSetting('aiCustomSystemPrompt')
        : localStorage.getItem('ai-custom-system-prompt');
      return customPrompt || null;
    }
    
    // Use predefined prompt
    try {
      const response = await fetch(chrome.runtime.getURL('data/system_prompts.json'));
      const prompts = await response.json();
      const selectedPrompt = prompts[selectedType];
      return selectedPrompt ? selectedPrompt.system : null;
    } catch (error) {
      console.error('Failed to load system prompt:', error);
      return null;
    }
  },

  // Test API connection
  testAPIConnection: async function() {
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
      testStatus.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;">
          <circle cx="12" cy="12" r="10"/>
          <path d="m15 9-6 6"/>
          <path d="m9 9 6 6"/>
        </svg>
        Fehler beim Laden des API-Keys: ${error.message}
      `;
      return;
    }
    
    if (!apiKey) {
      testStatus.style.display = 'block';
      testStatus.style.color = '#f44336';
      testStatus.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;">
          <circle cx="12" cy="12" r="10"/>
          <path d="m15 9-6 6"/>
          <path d="m9 9 6 6"/>
        </svg>
        Kein API-Key für diesen Provider konfiguriert
      `;
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
    testStatus.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle; animation: spin 1s linear infinite;">
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
        <path d="M21 21v-5h-5"/>
      </svg>
      Verbindung wird getestet...
    `;
    
    try {
      const result = await window.apiManager.testConnection(provider, apiKey);
      
      if (result.success) {
        testStatus.style.color = 'var(--color-success)';
        testStatus.innerHTML = `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;">
            <path d="M9 12l2 2 4-4"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
          Verbindung erfolgreich!
        `;
      } else {
        testStatus.style.color = '#f44336';
        testStatus.innerHTML = `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;">
            <circle cx="12" cy="12" r="10"/>
            <path d="m15 9-6 6"/>
            <path d="m9 9 6 6"/>
          </svg>
          Fehler: ${result.message}
        `;
      }
    } catch (error) {
      testStatus.style.color = '#f44336';
      testStatus.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;">
          <circle cx="12" cy="12" r="10"/>
          <path d="m15 9-6 6"/>
          <path d="m9 9 6 6"/>
        </svg>
        Verbindung fehlgeschlagen: ${error.message}
      `;
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
};

// Backward compatibility functions
function createAISettingsSection() {
  return window.aiSettings.createAISettingsSection();
}

function updateAPIKeyVisibility(selectedProvider) {
  return window.aiSettings.updateAPIKeyVisibility(selectedProvider);
}

function updateSelectedProvider(provider) {
  return window.aiSettings.updateSelectedProvider(provider);
}

async function loadAISettings() {
  return window.aiSettings.loadAISettings();
}

async function testAPIConnection() {
  return window.aiSettings.testAPIConnection();
}

async function getCurrentSystemPrompt() {
  return window.aiSettings.getCurrentSystemPrompt();
}

function saveSystemPromptSelection(selectedKey) {
  return window.aiSettings.saveSystemPromptSelection(selectedKey);
}

function saveCustomSystemPrompt(promptText) {
  return window.aiSettings.saveCustomSystemPrompt(promptText);
}

// Make main functions globally available
window.getCurrentSystemPrompt = getCurrentSystemPrompt;

if (window.errorHandler && window.errorHandler.debugMode) {
  console.log("🤖 AI Settings initialized");
}