// Overlay Manager - Independent UI System
(function() {
  'use strict';

  let overlayState = 'collapsed'; // collapsed, expanded, loading, error
  let currentMode = 'desktop'; // desktop, tablet, mobile
  let overlayContainer = null;
  let toggleButton = null;

  // UI State Management
  const OverlayManager = {
    
    init() {
      console.log('PromptEngineer: Initializing Overlay UI...');
      this.loadGoogleFonts();
      this.detectMode();
      this.createToggleButton();
      this.createOverlayContainer();
      this.bindEvents();
      this.applyTheme();
      console.log('PromptEngineer: Overlay UI initialized in', currentMode, 'mode');
    },

    loadGoogleFonts() {
      // Add Inter font for DaisyUI theme
      if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Inter"]')) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = 'https://fonts.googleapis.com';
        document.head.appendChild(link);

        const link2 = document.createElement('link');
        link2.rel = 'preconnect';
        link2.href = 'https://fonts.gstatic.com';
        link2.crossOrigin = 'anonymous';
        document.head.appendChild(link2);

        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
        document.head.appendChild(fontLink);
      }
    },

    detectMode() {
      const width = window.innerWidth;
      if (width <= 480) {
        currentMode = 'mobile';
      } else if (width <= 768) {
        currentMode = 'tablet';
      } else {
        currentMode = 'desktop';
      }
      
      // Update CSS class on body for responsive styling
      document.body.classList.remove('pe-desktop', 'pe-tablet', 'pe-mobile');
      document.body.classList.add(`pe-${currentMode}`);
    },

    createToggleButton() {
      if (toggleButton) return;

      toggleButton = document.createElement('button');
      toggleButton.id = 'prompt-engineer-toggle';
      toggleButton.className = 'pe-toggle-button';
      toggleButton.setAttribute('aria-label', 'Toggle Prompt Engineer');
      
      // Try to load original OnOff.png image first, with SVG fallback
      const img = document.createElement('img');
      img.src = chrome.runtime.getURL('Images/OnOff.png');
      img.width = 64;
      img.height = 64;
      img.alt = 'Toggle';
      img.style.background = 'transparent';
      
      // Fallback SVG if image fails
      img.onerror = () => {
        toggleButton.innerHTML = `
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" fill="var(--pe-bg-primary)" stroke="var(--pe-accent-primary)" stroke-width="2"/>
            <path d="M20 32h24M32 20v24" stroke="var(--pe-accent-primary)" stroke-width="3" stroke-linecap="round"/>
          </svg>
        `;
      };
      
      toggleButton.appendChild(img);

      document.body.appendChild(toggleButton);
    },

    createOverlayContainer() {
      if (overlayContainer) return;

      // Main container
      overlayContainer = document.createElement('div');
      overlayContainer.id = 'prompt-engineer-overlay';
      overlayContainer.className = `pe-overlay pe-${currentMode} pe-collapsed`;
      
      // Header
      const header = document.createElement('div');
      header.className = 'pe-header';
      header.innerHTML = `
        <div class="pe-header-content">
          <h3 class="pe-title">Prompt Engineer</h3>
          <button class="pe-close-btn" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      `;

      // Content area
      const content = document.createElement('div');
      content.className = 'pe-content';
      content.innerHTML = `
        <div class="pe-loading">
          <div class="pe-spinner"></div>
          <p>Loading prompt options...</p>
        </div>
      `;

      overlayContainer.appendChild(header);
      overlayContainer.appendChild(content);
      document.body.appendChild(overlayContainer);
    },

    bindEvents() {
      // Toggle button click
      toggleButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      // Close button click
      const closeBtn = overlayContainer?.querySelector('.pe-close-btn');
      closeBtn?.addEventListener('click', () => {
        this.collapse();
      });

      // Click outside to close
      document.addEventListener('click', (e) => {
        if (overlayState === 'expanded' && 
            !overlayContainer?.contains(e.target) && 
            !toggleButton?.contains(e.target)) {
          this.collapse();
        }
      });

      // Escape key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlayState === 'expanded') {
          this.collapse();
        }
      });

      // Responsive resize handling
      window.addEventListener('resize', this.debounce(() => {
        const oldMode = currentMode;
        this.detectMode();
        if (oldMode !== currentMode) {
          this.updateMode();
        }
      }, 250));
    },

    toggle() {
      if (overlayState === 'collapsed') {
        this.expand();
      } else {
        this.collapse();
      }
    },

    expand() {
      if (overlayState === 'expanded') return;
      
      overlayState = 'loading';
      overlayContainer.className = `pe-overlay pe-${currentMode} pe-expanded pe-loading`;
      
      // Load form content
      this.loadFormContent().then(() => {
        overlayState = 'expanded';
        overlayContainer.classList.remove('pe-loading');
      }).catch(error => {
        console.error('PromptEngineer: Error loading form:', error);
        this.showError('Failed to load prompt options');
      });
    },

    collapse() {
      overlayState = 'collapsed';
      overlayContainer.className = `pe-overlay pe-${currentMode} pe-collapsed`;
    },

    async loadFormContent() {
      try {
        // Get data using our existing fetch system
        const xmlData = await window.fetchDropdownData();
        const formHTML = await window.PromptFormBuilder.buildForm(xmlData);
        
        const content = overlayContainer.querySelector('.pe-content');
        content.innerHTML = formHTML;
        
        // Bind form events
        this.bindFormEvents();
        
      } catch (error) {
        throw new Error('Form loading failed: ' + error.message);
      }
    },

    bindFormEvents() {
      // Form submission
      const submitBtn = overlayContainer.querySelector('.pe-submit-btn');
      submitBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });

      // Dynamic form interactions
      const selects = overlayContainer.querySelectorAll('select');
      selects.forEach(select => {
        select.addEventListener('change', this.handleFormChange.bind(this));
      });

      // Initialize input visibility based on current selections
      this.initializeInputVisibility();

      // Bind theme selector
      this.bindThemeSelector();
    },

    handleFormSubmit() {
      try {
        const formData = this.collectFormData();
        const promptText = this.buildPromptText(formData);
        
        // Insert into active input field
        this.insertIntoActiveInput(promptText);
        
        // Collapse after successful submission
        this.collapse();
        
      } catch (error) {
        console.error('PromptEngineer: Form submission error:', error);
        this.showError('Failed to submit form');
      }
    },

    collectFormData() {
      const formData = {
        dropdowns: {},
        checkboxes: [],
        inputs: {},
        originalText: ''
      };

      // Collect dropdown values
      const selects = overlayContainer.querySelectorAll('select');
      selects.forEach(select => {
        if (select.value) {
          const selectedOption = select.options[select.selectedIndex];
          formData.dropdowns[select.id] = selectedOption.dataset.text || selectedOption.textContent;
        }
      });

      // Collect checkbox values
      const checkboxes = overlayContainer.querySelectorAll('input[type="checkbox"]:checked');
      checkboxes.forEach(checkbox => {
        const text = checkbox.value || '';
        const additionals = checkbox.dataset.additionals || '';
        if (text) {
          formData.checkboxes.push(text);
          if (additionals) formData.checkboxes.push(additionals);
        }
      });

      // Collect text inputs
      const inputs = overlayContainer.querySelectorAll('input[type="text"]');
      inputs.forEach(input => {
        if (input.value.trim()) {
          const before = input.getAttribute('data-before') || '';
          const after = input.getAttribute('data-after') || '';
          formData.inputs[input.id] = before + input.value + after;
        }
      });

      return formData;
    },

    buildPromptText(formData) {
      const parts = [];
      
      // Add dropdown texts
      Object.values(formData.dropdowns).forEach(text => {
        if (text) parts.push(text);
      });
      
      // Add checkbox texts
      formData.checkboxes.forEach(text => {
        if (text) parts.push(text);
      });
      
      // Add input texts
      Object.values(formData.inputs).forEach(text => {
        if (text) parts.push(text);
      });
      
      return parts.join('\n');
    },

    insertIntoActiveInput(text) {
      const domain = window.location.hostname;
      let targetElement = null;
      
      // First, try to get the currently focused element
      if (document.activeElement && ['TEXTAREA', 'INPUT'].includes(document.activeElement.tagName)) {
        targetElement = document.activeElement;
      }
      
      // If no active element, use intelligent site-specific detection
      if (!targetElement) {
        targetElement = this.detectTextFieldBySite(domain);
      }
      
      // Generic fallback detection
      if (!targetElement) {
        targetElement = this.detectTextFieldGeneric();
      }
      
      if (targetElement) {
        this.insertText(targetElement, text);
        console.log('PromptEngineer: Text inserted into input field');
      } else {
        console.warn('PromptEngineer: No suitable input field found');
        this.showClickToSelectUI(text);
      }
    },

    detectTextFieldBySite(domain) {
      const siteSelectors = {
        'chatgpt.com': [
          '#prompt-textarea',
          'textarea[data-id="root"]',
          'textarea[placeholder]',
          'div[contenteditable="true"][data-testid]',
          'div[contenteditable="true"]',
          'textarea'
        ],
        'claude.ai': [
          'div[contenteditable="true"][data-testid="chat-input"]',
          'div[contenteditable="true"]',
          'textarea[placeholder]',
          'textarea'
        ],
        'gemini.google.com': [
          'div[contenteditable="true"][data-testid="input-area"]',
          'div[contenteditable="true"]',
          'textarea[placeholder]',
          'textarea'
        ],
        'bard.google.com': [
          'div[contenteditable="true"]',
          'textarea[placeholder]',
          'textarea'
        ]
      };
      
      const selectors = siteSelectors[domain] || [];
      
      for (const selector of selectors) {
        try {
          const element = document.querySelector(selector);
          if (element && this.isElementVisible(element)) {
            console.log(`PromptEngineer: Found text field using selector: ${selector}`);
            this.saveSuccessfulSelector(domain, selector);
            return element;
          }
        } catch (e) {
          // Invalid selector, continue to next
          continue;
        }
      }
      
      return null;
    },

    detectTextFieldGeneric() {
      // Generic selectors as fallback (language-independent)
      const genericSelectors = [
        // Contenteditable divs (modern chat interfaces)
        'div[contenteditable="true"]:not([readonly])',
        'div[role="textbox"]:not([readonly])',
        
        // Textareas
        'textarea:not([readonly]):not([disabled])',
        
        // Input fields
        'input[type="text"]:not([readonly]):not([disabled])',
        'input:not([type]):not([readonly]):not([disabled])'
      ];
      
      for (const selector of genericSelectors) {
        const elements = document.querySelectorAll(selector);
        
        // Find the most likely candidate (largest, most recently focused, etc.)
        for (const element of elements) {
          if (this.isElementVisible(element) && this.isLikelyInputField(element)) {
            console.log(`PromptEngineer: Found text field using generic selector: ${selector}`);
            return element;
          }
        }
      }
      
      return null;
    },

    isElementVisible(element) {
      if (!element) return false;
      
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      
      return (
        rect.width > 0 && 
        rect.height > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        element.offsetParent !== null
      );
    },

    isLikelyInputField(element) {
      const rect = element.getBoundingClientRect();
      
      // Must be reasonably sized (not tiny buttons or hidden fields)
      if (rect.width < 100 || rect.height < 20) return false;
      
      // Check if it's positioned like a main input (not floating or absolute in strange places)
      const style = window.getComputedStyle(element);
      if (style.position === 'absolute' && (rect.top < 50 || rect.right < 100)) return false;
      
      // Prefer larger text areas
      const area = rect.width * rect.height;
      return area > 5000; // Reasonable size for chat input
    },

    insertText(element, text) {
      element.focus();
      
      if (element.contentEditable === 'true') {
        // Handle contenteditable divs
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        // Clear existing content or append
        if (element.textContent.trim()) {
          // Move cursor to end and add new lines
          range.selectNodeContents(element);
          range.collapse(false);
          const lineBreaks = document.createTextNode('\n\n');
          range.insertNode(lineBreaks);
          range.setStartAfter(lineBreaks);
          range.collapse(true);
        }
        
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Trigger events for React/Vue apps
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
      } else {
        // Handle textarea and input elements
        if (element.value && element.value.trim()) {
          element.value += '\n\n' + text;
        } else {
          element.value = text;
        }
        
        // Trigger events
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
      }
    },

    saveSuccessfulSelector(domain, selector) {
      try {
        const key = `pe-selector-${domain}`;
        const data = {
          selector: selector,
          timestamp: Date.now(),
          success: true
        };
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        // Ignore localStorage errors
      }
    },

    showClickToSelectUI(text) {
      // Create click-to-select overlay
      const overlay = document.createElement('div');
      overlay.id = 'pe-click-select-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 1000001;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      `;
      
      const dialog = document.createElement('div');
      dialog.style.cssText = `
        background: var(--pe-bg-primary, #282828);
        color: var(--pe-text-primary, #f0f0f0);
        padding: 20px;
        border-radius: 8px;
        border: 1px solid var(--pe-accent-primary, #016bff);
        max-width: 400px;
        text-align: center;
      `;
      
      dialog.innerHTML = `
        <h3 style="margin: 0 0 15px 0; color: var(--pe-accent-primary, #016bff);">Select Text Field</h3>
        <p style="margin: 0 0 15px 0; font-size: 14px;">Click on the text input field where you want to insert the prompt.</p>
        <button id="pe-cancel-select" style="
          background: var(--pe-bg-secondary, #424242);
          color: var(--pe-text-primary, #f0f0f0);
          border: 1px solid var(--pe-border-default, #424242);
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 10px;
        ">Cancel</button>
        <button id="pe-copy-text" style="
          background: var(--pe-accent-primary, #016bff);
          color: white;
          border: 1px solid var(--pe-accent-primary, #016bff);
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        ">Copy to Clipboard</button>
      `;
      
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
      
      // Handle click to select
      const clickHandler = (e) => {
        if (e.target === overlay || e.target.id === 'pe-cancel-select') {
          document.removeEventListener('click', clickHandler, true);
          overlay.remove();
          return;
        }
        
        if (e.target.id === 'pe-copy-text') {
          navigator.clipboard.writeText(text).then(() => {
            console.log('PromptEngineer: Text copied to clipboard');
          });
          document.removeEventListener('click', clickHandler, true);
          overlay.remove();
          return;
        }
        
        // Check if clicked element is a text input
        if (e.target.tagName === 'TEXTAREA' || 
            e.target.tagName === 'INPUT' || 
            e.target.contentEditable === 'true') {
          e.preventDefault();
          e.stopPropagation();
          
          this.insertText(e.target, text);
          
          // Save this selector for future use
          const domain = window.location.hostname;
          const selector = this.generateSelectorForElement(e.target);
          if (selector) {
            this.saveSuccessfulSelector(domain, selector);
          }
          
          document.removeEventListener('click', clickHandler, true);
          overlay.remove();
          console.log('PromptEngineer: Text inserted via click-to-select');
        }
      };
      
      // Use capture phase to intercept clicks
      document.addEventListener('click', clickHandler, true);
    },

    generateSelectorForElement(element) {
      if (element.id) {
        return `#${element.id}`;
      }
      
      if (element.className) {
        const classes = element.className.split(' ').filter(c => c.length > 0);
        if (classes.length > 0) {
          return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
        }
      }
      
      // Use data attributes if available
      for (const attr of element.attributes) {
        if (attr.name.startsWith('data-') && attr.value) {
          return `${element.tagName.toLowerCase()}[${attr.name}="${attr.value}"]`;
        }
      }
      
      return element.tagName.toLowerCase();
    },

    handleFormChange(event) {
      // Handle dynamic form updates (show/hide fields based on selections)
      const select = event.target;
      const selectedOption = select.options[select.selectedIndex];
      
      this.updateInputVisibility(selectedOption);
    },

    updateInputVisibility(selectedOption) {
      if (!selectedOption) return;
      
      // Get additional field IDs to show
      const additionals = selectedOption.dataset.additionals || '';
      const additionalIds = additionals ? additionals.split(',').map(id => id.trim()) : [];
      
      // Hide all input fields first
      this.hideAllInputs();
      
      // Show only the required input fields
      this.showAdditionalInputs(additionalIds);
    },

    hideAllInputs() {
      const inputFields = overlayContainer.querySelectorAll('.pe-input-field');
      inputFields.forEach(field => {
        field.classList.add('pe-hidden');
        // Clear input values when hidden
        const input = field.querySelector('input');
        if (input) input.value = '';
      });
    },

    showAdditionalInputs(additionalIds) {
      additionalIds.forEach(id => {
        // Handle both with and without 'pe-' prefix
        const cleanId = id.replace('pe-', '');
        const field = overlayContainer.querySelector(`#pe-${cleanId}`) || 
                     overlayContainer.querySelector(`#${cleanId}`);
        
        if (field) {
          field.closest('.pe-field').classList.remove('pe-hidden');
        }
      });
    },

    initializeInputVisibility() {
      // Hide all inputs initially
      this.hideAllInputs();
      
      // Check current dropdown selections and show relevant inputs
      const selects = overlayContainer.querySelectorAll('select');
      selects.forEach(select => {
        if (select.selectedIndex > 0) { // Skip placeholder option
          const selectedOption = select.options[select.selectedIndex];
          this.updateInputVisibility(selectedOption);
        }
      });
    },

    bindThemeSelector() {
      const themeSelector = overlayContainer.querySelector('#pe-theme-selector');
      if (themeSelector) {
        themeSelector.addEventListener('change', (e) => {
          const selectedTheme = e.target.value;
          if (window.PromptThemeManager) {
            window.PromptThemeManager.applyTheme(selectedTheme);
          }
        });
      }
    },

    updateMode() {
      overlayContainer.className = `pe-overlay pe-${currentMode} pe-${overlayState}`;
      console.log('PromptEngineer: UI mode updated to', currentMode);
    },

    showError(message) {
      overlayState = 'error';
      const content = overlayContainer.querySelector('.pe-content');
      content.innerHTML = `
        <div class="pe-error">
          <div class="pe-error-icon">⚠️</div>
          <p class="pe-error-message">${message}</p>
          <button class="pe-retry-btn">Retry</button>
        </div>
      `;
      
      // Bind retry button
      const retryBtn = content.querySelector('.pe-retry-btn');
      retryBtn?.addEventListener('click', () => {
        this.loadFormContent();
      });
    },

    applyTheme() {
      // Detect if website uses dark mode
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches ||
                     document.documentElement.classList.contains('dark') ||
                     document.body.classList.contains('dark');
      
      document.body.classList.toggle('pe-dark-theme', isDark);
    },

    // Utility function
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  };

  // Export to global scope
  window.PromptEngineOverlay = OverlayManager;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      OverlayManager.init();
    });
  } else {
    OverlayManager.init();
  }

})();