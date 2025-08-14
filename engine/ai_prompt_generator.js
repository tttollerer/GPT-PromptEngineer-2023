/**
 * AI PROMPT GENERATOR
 * UI and logic for AI-powered prompt generation
 * Uses API Manager to communicate with different AI providers
 */

class AIPromptGenerator {
  constructor() {
    this.isOpen = false;
    this.modal = null;
    this.generatedPrompts = [];
    this.currentRequest = null;
  }

  /**
   * Open the AI prompt generator modal
   */
  openGenerator() {
    if (this.isOpen) return;
    
    this.createModal();
    this.isOpen = true;
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("🤖 AI Prompt Generator opened");
    }
  }

  /**
   * Close the AI prompt generator modal
   */
  closeGenerator() {
    if (!this.isOpen || !this.modal) return;
    
    // Cancel any ongoing request
    if (this.currentRequest) {
      this.currentRequest = null;
    }
    
    this.modal.remove();
    this.modal = null;
    this.isOpen = false;
    this.generatedPrompts = [];
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("🤖 AI Prompt Generator closed");
    }
  }

  /**
   * Create the modal interface
   */
  createModal() {
    // Modal overlay
    this.modal = document.createElement('div');
    this.modal.className = 'ai-generator-modal';
    
    // Modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'ai-generator-modal-content';
    
    // Header
    const header = this.createHeader();
    modalContent.appendChild(header);
    
    // Configuration section
    const configSection = this.createConfigSection();
    modalContent.appendChild(configSection);
    
    // Input section
    const inputSection = this.createInputSection();
    modalContent.appendChild(inputSection);
    
    // Results section
    const resultsSection = this.createResultsSection();
    modalContent.appendChild(resultsSection);
    
    this.modal.appendChild(modalContent);
    document.body.appendChild(this.modal);
    
    // Focus on input
    const textarea = this.modal.querySelector('#ai-user-input');
    if (textarea) {
      setTimeout(() => textarea.focus(), 100);
    }
    
    // Close on backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeGenerator();
      }
    });
    
    // Close on escape key
    document.addEventListener('keydown', this.handleEscapeKey.bind(this));
  }

  /**
   * Create modal header
   */
  createHeader() {
    const header = document.createElement('div');
    header.className = 'ai-generator-header';
    
    const title = document.createElement('h2');
    title.textContent = '🤖 KI-Prompt Generator';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'ai-generator-close';
    closeButton.innerHTML = '×';
    closeButton.addEventListener('click', () => this.closeGenerator());
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    return header;
  }

  /**
   * Create configuration section
   */
  createConfigSection() {
    const section = document.createElement('div');
    section.className = 'ai-generator-config';
    
    const providerLabel = document.createElement('label');
    providerLabel.textContent = 'KI-Provider:';
    
    const providerSelect = document.createElement('select');
    providerSelect.id = 'ai-provider-select';
    providerSelect.className = 'ai-generator-select';
    
    // Populate providers
    const providers = window.apiManager.getProviders();
    const configuredProviders = window.apiManager.getConfiguredProviders();
    
    if (configuredProviders.length === 0) {
      const noConfig = document.createElement('option');
      noConfig.value = '';
      noConfig.textContent = 'Keine API-Keys konfiguriert';
      providerSelect.appendChild(noConfig);
      providerSelect.disabled = true;
    } else {
      providers.forEach(provider => {
        if (configuredProviders.includes(provider.id)) {
          const option = document.createElement('option');
          option.value = provider.id;
          option.textContent = provider.name;
          if (provider.id === window.apiManager.settings.selectedProvider) {
            option.selected = true;
          }
          providerSelect.appendChild(option);
        }
      });
    }
    
    const modelLabel = document.createElement('label');
    modelLabel.textContent = 'Model:';
    
    const modelSelect = document.createElement('select');
    modelSelect.id = 'ai-model-select';
    modelSelect.className = 'ai-generator-select';
    
    // Update models when provider changes
    providerSelect.addEventListener('change', () => {
      this.updateModelSelect(providerSelect.value, modelSelect);
    });
    
    // Initialize model select
    if (providerSelect.value) {
      this.updateModelSelect(providerSelect.value, modelSelect);
    }
    
    const settingsButton = document.createElement('button');
    settingsButton.className = 'ai-generator-settings-btn';
    settingsButton.textContent = '⚙️ API-Keys konfigurieren';
    settingsButton.addEventListener('click', () => {
      this.closeGenerator();
      if (window.toggleSettingsPanel) {
        window.toggleSettingsPanel();
      }
    });
    
    section.appendChild(providerLabel);
    section.appendChild(providerSelect);
    section.appendChild(modelLabel);
    section.appendChild(modelSelect);
    section.appendChild(settingsButton);
    
    return section;
  }

  /**
   * Update model select based on provider
   */
  updateModelSelect(providerId, modelSelect) {
    modelSelect.innerHTML = '';
    
    if (!providerId) return;
    
    const provider = window.apiManager.providers[providerId];
    if (provider && provider.models) {
      provider.models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        if (model === provider.defaultModel) {
          option.selected = true;
        }
        modelSelect.appendChild(option);
      });
    }
  }

  /**
   * Create input section
   */
  createInputSection() {
    const section = document.createElement('div');
    section.className = 'ai-generator-input-section';
    
    const label = document.createElement('label');
    label.textContent = 'Beschreibe, welchen Prompt du brauchst:';
    label.htmlFor = 'ai-user-input';
    
    const textarea = document.createElement('textarea');
    textarea.id = 'ai-user-input';
    textarea.className = 'ai-generator-textarea';
    textarea.placeholder = 'z.B. "Erstelle einen Prompt für eine Zusammenfassung von wissenschaftlichen Artikeln" oder "Ich brauche einen Prompt für kreatives Schreiben von Kurgeschichten"';
    textarea.rows = 4;
    
    const generateButton = document.createElement('button');
    generateButton.id = 'ai-generate-button';
    generateButton.className = 'ai-generator-generate-btn';
    generateButton.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
      Prompt generieren
    `;
    generateButton.addEventListener('click', () => this.generatePrompt());
    
    section.appendChild(label);
    section.appendChild(textarea);
    section.appendChild(generateButton);
    
    return section;
  }

  /**
   * Create results section
   */
  createResultsSection() {
    const section = document.createElement('div');
    section.id = 'ai-generator-results';
    section.className = 'ai-generator-results';
    section.style.display = 'none';
    
    const title = document.createElement('h3');
    title.textContent = 'Generierte Prompts:';
    
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'ai-results-container';
    resultsContainer.className = 'ai-results-container';
    
    section.appendChild(title);
    section.appendChild(resultsContainer);
    
    return section;
  }

  /**
   * Generate prompt using AI
   */
  async generatePrompt() {
    const userInput = document.getElementById('ai-user-input').value.trim();
    const providerSelect = document.getElementById('ai-provider-select');
    const modelSelect = document.getElementById('ai-model-select');
    const generateButton = document.getElementById('ai-generate-button');
    
    if (!userInput) {
      this.showError('Bitte beschreibe, welchen Prompt du brauchst.');
      return;
    }
    
    if (!providerSelect.value) {
      this.showError('Bitte konfiguriere zuerst einen API-Key in den Einstellungen.');
      return;
    }
    
    // Update UI for loading state
    generateButton.disabled = true;
    generateButton.innerHTML = `
      <div class="ai-generator-spinner"></div>
      Generiere Prompt...
    `;
    
    this.hideError();
    this.hideResults();
    
    try {
      this.currentRequest = Date.now();
      const requestId = this.currentRequest;
      
      const response = await window.apiManager.generatePrompt(userInput, {
        provider: providerSelect.value,
        model: modelSelect.value,
        maxTokens: 800,
        temperature: 0.7
      });
      
      // Check if request is still current
      if (this.currentRequest !== requestId) {
        return; // Request was cancelled
      }
      
      this.displayResults(response);
      
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("✅ AI Prompt generated successfully");
      }
      
    } catch (error) {
      console.error("❌ Failed to generate prompt:", error);
      this.showError(`Fehler bei der Prompt-Generierung: ${error.message}`);
    } finally {
      // Reset button state
      generateButton.disabled = false;
      generateButton.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        Prompt generieren
      `;
    }
  }

  /**
   * Display generated prompts
   */
  displayResults(response) {
    const resultsSection = document.getElementById('ai-generator-results');
    const resultsContainer = document.getElementById('ai-results-container');
    
    resultsContainer.innerHTML = '';
    
    // Split response by "---" to handle multiple prompts
    const prompts = response.split('---').map(p => p.trim()).filter(p => p.length > 0);
    
    this.generatedPrompts = prompts;
    
    prompts.forEach((prompt, index) => {
      const promptCard = this.createPromptCard(prompt, index);
      resultsContainer.appendChild(promptCard);
    });
    
    resultsSection.style.display = 'block';
  }

  /**
   * Create a prompt card
   */
  createPromptCard(prompt, index) {
    const card = document.createElement('div');
    card.className = 'ai-prompt-card';
    
    const content = document.createElement('div');
    content.className = 'ai-prompt-content';
    content.textContent = prompt;
    
    const actions = document.createElement('div');
    actions.className = 'ai-prompt-actions';
    
    const useButton = document.createElement('button');
    useButton.className = 'ai-prompt-use-btn';
    useButton.textContent = '✓ Verwenden';
    useButton.addEventListener('click', () => {
      this.usePrompt(prompt);
      this.closeGenerator();
    });
    
    const copyButton = document.createElement('button');
    copyButton.className = 'ai-prompt-copy-btn';
    copyButton.textContent = '📋 Kopieren';
    copyButton.addEventListener('click', () => this.copyPrompt(prompt, copyButton));
    
    actions.appendChild(useButton);
    actions.appendChild(copyButton);
    
    card.appendChild(content);
    card.appendChild(actions);
    
    return card;
  }

  /**
   * Use a generated prompt (insert into text field)
   */
  usePrompt(prompt) {
    try {
      const targetNode = document.querySelector(window.getSelector());
      if (!targetNode) {
        this.showError('Textfeld nicht gefunden. Bitte stelle sicher, dass du dich auf einer unterstützten Seite befindest.');
        return;
      }

      // Get current content
      let currentContent = '';
      if (targetNode.tagName.toLowerCase() === 'textarea' || targetNode.tagName.toLowerCase() === 'input') {
        currentContent = targetNode.value || '';
      } else if (targetNode.contentEditable === 'true') {
        currentContent = targetNode.textContent || '';
      }

      // Insert the prompt
      let newContent = '';
      if (currentContent.trim()) {
        newContent = prompt + '\n\n' + currentContent;
      } else {
        newContent = prompt;
      }

      // Set the content
      if (targetNode.tagName.toLowerCase() === 'textarea' || targetNode.tagName.toLowerCase() === 'input') {
        targetNode.value = newContent;
      } else if (targetNode.contentEditable === 'true') {
        targetNode.textContent = newContent;
      }

      // Trigger events
      targetNode.dispatchEvent(new Event('input', { bubbles: true }));
      targetNode.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Focus the target field
      targetNode.focus();

      // Show success message
      this.showSuccessMessage('Prompt erfolgreich eingefügt!');

      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("✅ AI-generated prompt inserted into text field");
      }

    } catch (error) {
      console.error("❌ Failed to use prompt:", error);
      this.showError('Fehler beim Einfügen des Prompts.');
    }
  }

  /**
   * Copy prompt to clipboard
   */
  async copyPrompt(prompt, button) {
    try {
      await navigator.clipboard.writeText(prompt);
      
      const originalText = button.textContent;
      button.textContent = '✓ Kopiert!';
      button.style.background = 'var(--color-success)';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
      }, 2000);
      
    } catch (error) {
      console.error("❌ Failed to copy prompt:", error);
      this.showError('Fehler beim Kopieren in die Zwischenablage.');
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    this.hideError(); // Remove any existing error
    
    const errorDiv = document.createElement('div');
    errorDiv.id = 'ai-generator-error';
    errorDiv.className = 'ai-generator-error';
    errorDiv.textContent = message;
    
    const inputSection = this.modal.querySelector('.ai-generator-input-section');
    inputSection.appendChild(errorDiv);
  }

  /**
   * Hide error message
   */
  hideError() {
    const errorDiv = document.getElementById('ai-generator-error');
    if (errorDiv) {
      errorDiv.remove();
    }
  }

  /**
   * Hide results section
   */
  hideResults() {
    const resultsSection = document.getElementById('ai-generator-results');
    if (resultsSection) {
      resultsSection.style.display = 'none';
    }
  }

  /**
   * Show success message
   */
  showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'ai-generator-success-toast';
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 3000);
  }

  /**
   * Handle escape key
   */
  handleEscapeKey(e) {
    if (e.key === 'Escape' && this.isOpen) {
      this.closeGenerator();
      document.removeEventListener('keydown', this.handleEscapeKey.bind(this));
    }
  }

  /**
   * Check if AI functionality is available
   */
  isAvailable() {
    if (!window.apiManager) {
      return false;
    }
    
    const configuredProviders = window.apiManager.getConfiguredProviders();
    return configuredProviders.length > 0;
  }

  /**
   * Get status for UI display
   */
  getStatus() {
    if (!window.apiManager) {
      return { 
        available: false, 
        message: 'API Manager nicht verfügbar' 
      };
    }
    
    const configuredProviders = window.apiManager.getConfiguredProviders();
    
    if (configuredProviders.length === 0) {
      return { 
        available: false, 
        message: 'Keine API-Keys konfiguriert' 
      };
    }
    
    return { 
      available: true, 
      message: `${configuredProviders.length} Provider konfiguriert` 
    };
  }
}

// Global instance
window.aiPromptGenerator = new AIPromptGenerator();