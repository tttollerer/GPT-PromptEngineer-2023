// Form Builder - Dynamic Form Generation from XML
(function() {
  'use strict';

  const FormBuilder = {
    
    async buildForm(xmlData) {
      if (!xmlData) {
        throw new Error('No XML data provided');
      }

      const formHTML = `
        <div class="pe-logo-container">
          <img src="${chrome.runtime.getURL('Images/logo.png')}" alt="Prompt Engineer" class="pe-logo">
        </div>
        <form class="pe-form">
          ${this.buildCheckboxes(xmlData)}
          ${this.buildDropdowns(xmlData)}
          ${this.buildInputs(xmlData)}
          ${this.buildSubmitButton()}
          ${this.buildAttribution()}
        </form>
      `;

      return formHTML;
    },

    buildLanguageSelector() {
      // Use the existing language options from settings
      const options = window.SETTINGS?.LANGUAGE_DROPDOWN_OPTIONS || `
        <option value="en">🇺🇸</option>
        <option value="de">🇩🇪</option>
        <option value="es">🇪🇸</option>
        <option value="fr">🇫🇷</option>
      `;

      return `
        <div class="pe-field pe-language-field">
          <select id="pe-language" class="pe-select" title="Language / Sprache">
            ${options}
          </select>
        </div>
      `;
    },

    buildDropdowns(xmlData) {
      const dropdowns = xmlData.querySelectorAll('dropdown');
      if (!dropdowns.length) return '';

      let html = `
        <div class="pe-card">
          <div class="pe-card-header">
            <h3 class="pe-card-title">${this.translateText('Selections')}</h3>
            <span class="pe-card-subtitle">${this.translateText('Choose your preferences')}</span>
          </div>
          <div class="pe-card-content">
            <div class="pe-section pe-dropdowns">`;
      
      dropdowns.forEach((dropdown, index) => {
        const label = dropdown.querySelector('label')?.textContent || `Option ${index + 1}`;
        const id = dropdown.querySelector('id')?.textContent || `dropdown-${index}`;
        const options = dropdown.querySelectorAll('options option');

        html += `
          <div class="pe-field">
            <label for="pe-${id}">${this.escapeHtml(this.translateText(label))}:</label>
            <select id="pe-${id}" class="pe-select">
              <option value="">Select ${this.escapeHtml(this.translateText(label))}</option>
        `;

        options.forEach(option => {
          const optionLabel = option.querySelector('label')?.textContent || '';
          const optionValue = option.querySelector('value')?.textContent || '';
          const additionals = option.querySelector('additionals')?.textContent || '';
          
          html += `
            <option value="${this.escapeHtml(optionValue)}" 
                    data-text="${this.escapeHtml(optionValue)}"
                    data-additionals="${this.escapeHtml(additionals)}">
              ${this.escapeHtml(this.translateText(optionLabel))}
            </option>
          `;
        });

        html += `
            </select>
          </div>
        `;
      });

      html += `
            </div>
          </div>
        </div>
      `;
      return html;
    },

    buildCheckboxes(xmlData) {
      const checkboxes = xmlData.querySelectorAll('checkbox');
      if (!checkboxes.length) return '';

      let html = `
        <div class="pe-card">
          <div class="pe-card-header">
            <h3 class="pe-card-title">${this.translateText('Options')}</h3>
          </div>
          <div class="pe-card-content">
            <div class="pe-section pe-checkboxes">
      `;
      
      checkboxes.forEach((checkbox, index) => {
        const label = checkbox.querySelector('label')?.textContent || `Option ${index + 1}`;
        const value = checkbox.querySelector('value')?.textContent || '';
        const id = checkbox.querySelector('id')?.textContent || `checkbox-${index}`;
        const additionals = checkbox.querySelector('additionals')?.textContent || '';
        const additionalsHide = checkbox.querySelector('additionalsHide')?.textContent || '';

        html += `
          <div class="pe-field pe-checkbox-field">
            <div class="pe-checkbox-label">
              <span class="pe-checkbox-text">${this.escapeHtml(this.translateText(label))}</span>
              <input type="checkbox" 
                     id="pe-${id}" 
                     value="${this.escapeHtml(value)}"
                     data-additionals="${this.escapeHtml(additionals)}"
                     data-additionals-hide="${this.escapeHtml(additionalsHide)}"
                     class="pe-checkbox">
            </div>
          </div>
        `;
      });

      html += `
            </div>
          </div>
        </div>
      `;
      return html;
    },

    buildInputs(xmlData) {
      const inputs = xmlData.querySelectorAll('input');
      if (!inputs.length) return '';

      let html = `
        <div class="pe-card">
          <div class="pe-card-header">
            <h3 class="pe-card-title">${this.translateText('Custom Inputs')}</h3>
            <span class="pe-card-subtitle">${this.translateText('Add your specific requirements')}</span>
          </div>
          <div class="pe-card-content">
            <div class="pe-section pe-inputs">`;
      
      inputs.forEach((input, index) => {
        const label = input.querySelector('label')?.textContent || `Input ${index + 1}`;
        const id = input.querySelector('id')?.textContent || `input-${index}`;
        const type = input.querySelector('type')?.textContent || 'text';
        const valueBefore = input.querySelector('valueBefore')?.textContent || '';
        const valueAfter = input.querySelector('valueAfter')?.textContent || '';

        // Skip file inputs for now in overlay mode
        if (type === 'file') return;

        html += `
          <div class="pe-field pe-input-field pe-hidden">
            <label for="pe-${id}">${this.escapeHtml(this.translateText(label))}:</label>
            <input type="text" 
                   id="pe-${id}" 
                   placeholder="${this.escapeHtml(this.translateText(label))}"
                   data-before="${this.escapeHtml(valueBefore)}"
                   data-after="${this.escapeHtml(valueAfter)}"
                   class="pe-input">
          </div>
        `;
      });

      html += `
            </div>
          </div>
        </div>
      `;
      return html;
    },

    buildSubmitButton() {
      return `
        <div class="pe-actions">
          <button type="button" class="pe-submit-btn pe-btn-primary" role="button" aria-describedby="submit-help">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
            </svg>
            <span>${this.translateText('Generate Prompt')}</span>
          </button>
          <div id="submit-help" class="sr-only">${this.translateText('Generate AI prompt based on your selections')}</div>
        </div>
      `;
    },

    buildAttribution() {
      return `
        <div class="pe-attribution">
          Powered by <a href="#" style="color: var(--pe-accent-primary);">PromptEngineer</a>
        </div>
      `;
    },

    buildThemeSelector() {
      // Get available themes
      const themes = window.PromptThemeManager ? window.PromptThemeManager.getAvailableThemes() : [
        { id: 'original', name: 'Original Dark' },
        { id: 'modern', name: 'Modern Light' }
      ];

      const currentTheme = window.PromptThemeManager ? window.PromptThemeManager.getCurrentTheme() : 'original';
      
      // Determine icon based on current theme
      const isDark = currentTheme === 'original' || currentTheme.includes('dark');
      const themeIcon = isDark ? '🌙' : '☀️';
      
      return `
        <div class="pe-field pe-theme-field">
          <button type="button" id="pe-theme-toggle" class="pe-theme-button" 
                  title="Toggle Theme" aria-label="Toggle Theme">
            ${themeIcon}
          </button>
        </div>
      `;
    },

    translateText(text) {
      // Use translation from global scope if available
      if (window.TRANSLATIONS && window.TRANSLATIONS[text]) {
        return window.TRANSLATIONS[text];
      }
      return text;
    },

    escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };

  // Export to global scope
  window.PromptFormBuilder = FormBuilder;

})();