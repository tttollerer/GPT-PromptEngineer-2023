/**
 * CATEGORY NAVIGATION SYSTEM
 * Manages the second-layer navigation for prompt categories
 */

// Lucide Icons as SVG strings
window.LUCIDE_ICONS = {
  'employees': `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="m22 21-2-2m-2 2v-2a4 4 0 0 0-3-3.87"></path><circle cx="16" cy="7" r="3"></circle></svg>`,
  'task': `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3 8-8"></path><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.28 0 2.5.27 3.6.75"></path></svg>`,
  'scope': `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
  'formatting': `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,7 4,4 20,4 20,7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>`,
  'default': `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>`,
  'back': `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>`
};

// Navigation state management
window.navigationState = {
  currentLayer: 1, // 1 = Categories, 2 = Prompts, 3 = Additionals
  selectedCategory: null,
  selectedPrompt: null,
  availablePrompts: [],
  requiredInputs: [],
  categoryData: {},
  inputDefinitions: {} // Cache for input field definitions from XML
};

// Initialize category navigation
window.categoryNavigation = {
  
  // Initialize the navigation system
  init: function(xmlData) {
    this.categories = this.extractCategoriesFromXML(xmlData);
    this.loadInputDefinitions(); // Load input field definitions
    this.createCategoryButtons();
  },

  // Load input field definitions from inputs XML
  loadInputDefinitions: async function() {
    try {
      if (window.fetchData) {
        const inputsXml = await window.fetchData('data_inputs.xml');
        if (inputsXml) {
          this.cacheInputDefinitions(inputsXml);
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not load input definitions:', error);
    }
  },

  // Cache input definitions for quick lookup
  cacheInputDefinitions: function(xmlData) {
    const inputs = xmlData.getElementsByTagName('input');
    
    Array.from(inputs).forEach(input => {
      const idElement = input.querySelector('id');
      const labelElement = input.querySelector('label');
      const valueBeforeElement = input.querySelector('valueBefore');
      const valueAfterElement = input.querySelector('valueAfter');
      
      if (idElement && labelElement) {
        const inputId = idElement.textContent.trim();
        
        window.navigationState.inputDefinitions[inputId] = {
          id: inputId,
          label: labelElement.textContent.trim(),
          valueBefore: valueBeforeElement ? valueBeforeElement.textContent.trim() : '',
          valueAfter: valueAfterElement ? valueAfterElement.textContent.trim() : ''
        };
      }
    });
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log(`📝 Cached ${Object.keys(window.navigationState.inputDefinitions).length} input definitions`);
    }
  },

  // Dynamically extract categories from XML data
  extractCategoriesFromXML: function(xmlData) {
    const categories = [];
    const dropdowns = xmlData.getElementsByTagName('dropdown');
    
    Array.from(dropdowns).forEach(dropdown => {
      const labelElement = dropdown.querySelector('label');
      
      if (labelElement) {
        const categoryName = labelElement.textContent.trim();
        const categoryId = categoryName.toLowerCase();
        
        // Extract prompts from this dropdown
        const prompts = this.extractPromptsFromDropdown(dropdown, categoryId);
        
        if (prompts.length > 0) {
          categories.push({
            id: categoryId,
            label: categoryName,
            icon: this.getIconForCategory(categoryName),
            buttonClass: `category-${categoryId}`,
            prompts: prompts,
            count: prompts.length
          });
          
          // Store prompts in navigation state
          window.navigationState.categoryData[categoryId] = prompts;
        }
      }
    });
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log(`📊 Dynamically extracted ${categories.length} categories:`, categories.map(c => c.label));
    }
    
    return categories;
  },

  // Extract prompts from a dropdown element
  extractPromptsFromDropdown: function(dropdown, categoryId) {
    const prompts = [];
    const options = dropdown.querySelectorAll('options option');
    
    Array.from(options).forEach(option => {
      const optionLabelElement = option.querySelector('label');
      const optionValueElement = option.querySelector('value');
      const optionAdditionalsElement = option.querySelector('additionals');
      const optionIdElement = option.querySelector('id');
      
      // Skip empty options and placeholder options
      if (optionLabelElement && optionValueElement && 
          optionValueElement.textContent.trim() && 
          optionLabelElement.textContent.trim() !== dropdown.querySelector('label').textContent) {
        
        // Parse additionals string (comma-separated input IDs)
        const additionalsText = optionAdditionalsElement ? optionAdditionalsElement.textContent.trim() : '';
        const additionals = additionalsText ? 
          additionalsText.split(',').map(item => item.trim()).filter(item => item.length > 0) : [];
        
        prompts.push({
          label: optionLabelElement.textContent.trim(),
          value: optionValueElement.textContent.trim(),
          id: optionIdElement ? optionIdElement.textContent.trim() : '',
          category: categoryId,
          additionals: additionals,
          hasAdditionals: additionals.length > 0
        });
      }
    });
    
    return prompts;
  },

  // Get appropriate icon for category name
  getIconForCategory: function(categoryName) {
    const name = categoryName.toLowerCase();
    
    // Try exact match first
    if (window.LUCIDE_ICONS[name]) {
      return window.LUCIDE_ICONS[name];
    }
    
    // Try partial matches
    if (name.includes('employee') || name.includes('staff')) {
      return window.LUCIDE_ICONS['employees'];
    }
    if (name.includes('task') || name.includes('work')) {
      return window.LUCIDE_ICONS['task'];
    }
    if (name.includes('scope') || name.includes('target')) {
      return window.LUCIDE_ICONS['scope'];
    }
    if (name.includes('format') || name.includes('style')) {
      return window.LUCIDE_ICONS['formatting'];
    }
    
    // Default icon
    return window.LUCIDE_ICONS['default'];
  },


  // Create category buttons for layer 1
  createCategoryButtons: function() {
    const container = document.getElementById('prompt-generator-container');
    if (!container) return;

    // Find or create categories container
    let categoriesContainer = container.querySelector('.categories-layer-container');
    if (!categoriesContainer) {
      categoriesContainer = document.createElement('div');
      categoriesContainer.className = 'categories-layer-container';
      
      // Insert after prompt categories headline
      const headline = container.querySelector('.prompt-categories-headline');
      if (headline) {
        headline.insertAdjacentElement('afterend', categoriesContainer);
      } else {
        container.appendChild(categoriesContainer);
      }
    }

    // Clear existing content
    while (categoriesContainer.firstChild) {
      categoriesContainer.removeChild(categoriesContainer.firstChild);
    }

    // Create category buttons from dynamically extracted categories
    this.categories.forEach(category => {
      const button = document.createElement('button');
      button.className = `category-button ${category.buttonClass}`;
      
      const iconSpan = document.createElement('span');
      iconSpan.className = 'category-icon';
      
      // Check if category.icon is an SVG string or simple text
      if (category.icon && category.icon.includes('<svg')) {
        if (window.DOMUtils) {
          const svgElement = window.DOMUtils.createSVGFromString(category.icon);
          if (svgElement) {
            iconSpan.appendChild(svgElement);
          } else {
            console.warn('Failed to create SVG for category:', category.id, category.icon.substring(0, 50));
            iconSpan.textContent = category.icon;
          }
        } else {
          console.warn('DOMUtils not available, showing raw text for category:', category.id);
          iconSpan.textContent = category.icon;
        }
      } else {
        iconSpan.textContent = category.icon;
      }
      button.appendChild(iconSpan);
      
      const labelSpan = document.createElement('span');
      labelSpan.className = 'category-label';
      labelSpan.textContent = category.label;
      button.appendChild(labelSpan);
      
      const countSpan = document.createElement('span');
      countSpan.className = 'category-count';
      countSpan.textContent = category.count;
      button.appendChild(countSpan);
      
      button.addEventListener('click', () => {
        this.showCategory(category.id);
      });
      
      categoriesContainer.appendChild(button);
    });
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log(`🎨 Created ${this.categories.length} category buttons`);
    }
  },

  // Show prompts for selected category (layer 2)
  showCategory: function(categoryId) {
    const category = this.categories.find(cat => cat.id === categoryId);
    if (!category) return;

    window.navigationState.currentLayer = 2;
    window.navigationState.selectedCategory = categoryId;
    window.navigationState.availablePrompts = window.navigationState.categoryData[categoryId] || [];

    this.renderPromptsList(category);
  },

  // Render the prompts list for layer 2
  renderPromptsList: function(category) {
    const container = document.getElementById('prompt-generator-container');
    if (!container) return;

    // Hide layer 1
    const categoriesContainer = container.querySelector('.categories-layer-container');
    if (categoriesContainer) {
      categoriesContainer.style.display = 'none';
    }

    // Create or find prompts container
    let promptsContainer = container.querySelector('.prompts-layer-container');
    if (!promptsContainer) {
      promptsContainer = document.createElement('div');
      promptsContainer.className = 'prompts-layer-container';
      
      // Insert after categories container
      if (categoriesContainer) {
        categoriesContainer.insertAdjacentElement('afterend', promptsContainer);
      } else {
        container.appendChild(promptsContainer);
      }
    }

    // Clear and populate prompts container
    while (promptsContainer.firstChild) {
      promptsContainer.removeChild(promptsContainer.firstChild);
    }
    promptsContainer.style.display = 'block';

    // Back button - simplified to icon only
    const backButton = document.createElement('button');
    backButton.className = 'back-to-categories-button';
    if (window.LUCIDE_ICONS && window.LUCIDE_ICONS['back'] && window.DOMUtils) {
      const svgElement = window.DOMUtils.createSVGFromString(window.LUCIDE_ICONS['back']);
      if (svgElement) {
        backButton.appendChild(svgElement);
      } else {
        backButton.textContent = '←'; // Fallback
      }
    } else {
      backButton.textContent = '←'; // Fallback
    }
    backButton.title = 'Back to Categories'; // Tooltip for accessibility
    backButton.addEventListener('click', () => {
      this.hideCategory();
    });
    promptsContainer.appendChild(backButton);

    // Category title
    const categoryTitle = document.createElement('h3');
    categoryTitle.className = 'category-title';
    
    const titleIcon = document.createElement('span');
    titleIcon.className = 'title-icon';
    
    // Check if category.icon is an SVG string or simple text
    if (category.icon && category.icon.includes('<svg') && window.DOMUtils) {
      const svgElement = window.DOMUtils.createSVGFromString(category.icon);
      if (svgElement) {
        titleIcon.appendChild(svgElement);
      } else {
        titleIcon.textContent = category.icon;
      }
    } else {
      titleIcon.textContent = category.icon;
    }
    categoryTitle.appendChild(titleIcon);
    
    const titleText = document.createElement('span');
    titleText.className = 'title-text';
    titleText.textContent = category.label;
    categoryTitle.appendChild(titleText);
    
    promptsContainer.appendChild(categoryTitle);

    // Prompts list
    const promptsList = document.createElement('div');
    promptsList.className = 'prompts-list';
    
    window.navigationState.availablePrompts.forEach(prompt => {
      const promptButton = document.createElement('button');
      promptButton.className = 'prompt-item-button';
      promptButton.textContent = prompt.label;
      promptButton.title = prompt.value; // Show prompt text on hover
      
      promptButton.addEventListener('click', () => {
        this.selectPrompt(prompt);
      });
      
      promptsList.appendChild(promptButton);
    });

    promptsContainer.appendChild(promptsList);
  },

  // Select a prompt - check if additionals are needed
  selectPrompt: function(prompt) {
    // Store selected prompt
    window.navigationState.selectedPrompt = prompt;
    
    // Check if prompt has additionals (Level 3 needed)
    if (prompt.hasAdditionals && prompt.additionals.length > 0) {
      // Show Level 3 - Additionals Input
      this.showAdditionals(prompt);
    } else {
      // No additionals needed - complete selection immediately
      this.completePromptSelection(prompt);
    }
  },

  // Complete prompt selection (final step)
  completePromptSelection: function(prompt, additionalInputs = {}) {
    // Add the selected prompt to active prompts
    const state = window.getExtensionState();
    
    // Remove any existing prompt from this category
    state.activePrompts.categories = state.activePrompts.categories || {};
    
    // Clone prompt and add additional inputs if any
    const finalPrompt = {
      ...prompt,
      additionalInputs: additionalInputs
    };
    
    state.activePrompts.categories[prompt.category] = finalPrompt;
    
    // Update the textfield content
    if (window.contentUpdater && window.contentUpdater.updateTextfieldContent) {
      window.contentUpdater.updateTextfieldContent();
    }
    
    // Return to layer 1
    this.hideCategory();
    
    // Clear Level 3 if it was shown
    this.hideAdditionals();
    
    // Visual feedback
    this.showPromptSelectedFeedback(prompt);
  },

  // Show Level 3 - Additionals input fields
  showAdditionals: function(prompt) {
    window.navigationState.currentLayer = 3;
    window.navigationState.requiredInputs = prompt.additionals;

    const container = document.getElementById('prompt-generator-container');
    if (!container) return;

    // Hide layer 2 (prompts)
    const promptsContainer = container.querySelector('.prompts-layer-container');
    if (promptsContainer) {
      promptsContainer.style.display = 'none';
    }

    // Create or find additionals container
    let additionalsContainer = container.querySelector('.additionals-layer-container');
    if (!additionalsContainer) {
      additionalsContainer = document.createElement('div');
      additionalsContainer.className = 'additionals-layer-container';
      
      // Insert after prompts container
      if (promptsContainer) {
        promptsContainer.insertAdjacentElement('afterend', additionalsContainer);
      } else {
        container.appendChild(additionalsContainer);
      }
    }

    // Clear and populate additionals container
    while (additionalsContainer.firstChild) {
      additionalsContainer.removeChild(additionalsContainer.firstChild);
    }
    additionalsContainer.style.display = 'block';

    // Back button to Layer 2
    const backButton = document.createElement('button');
    backButton.className = 'back-to-prompts-button';
    if (window.LUCIDE_ICONS && window.LUCIDE_ICONS['back'] && window.DOMUtils) {
      const svgElement = window.DOMUtils.createSVGFromString(window.LUCIDE_ICONS['back']);
      if (svgElement) {
        backButton.appendChild(svgElement);
      } else {
        backButton.textContent = '←'; // Fallback arrow
      }
    } else {
      backButton.textContent = '←'; // Fallback arrow
    }
    backButton.title = 'Back to Prompts';
    backButton.addEventListener('click', () => {
      this.hideAdditionals();
    });
    additionalsContainer.appendChild(backButton);

    // Prompt title
    const promptTitle = document.createElement('h3');
    promptTitle.className = 'prompt-title';
    
    const titleText = document.createElement('span');
    titleText.className = 'title-text';
    titleText.textContent = prompt.label;
    promptTitle.appendChild(titleText);
    
    additionalsContainer.appendChild(promptTitle);

    // Instructions
    const instructions = document.createElement('p');
    instructions.className = 'additionals-instructions';
    instructions.textContent = 'Please provide the following information to complete your prompt:';
    additionalsContainer.appendChild(instructions);

    // Input fields container
    const inputFieldsContainer = document.createElement('div');
    inputFieldsContainer.className = 'additionals-input-fields';
    
    // Generate input fields for each additional
    this.createAdditionalInputFields(inputFieldsContainer, prompt.additionals);
    
    additionalsContainer.appendChild(inputFieldsContainer);

    // Complete button
    const completeButton = document.createElement('button');
    completeButton.className = 'complete-prompt-button';
    
    // Create SVG element safely
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.style.marginRight = '6px';
    
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'm9 11 3 3 8-8');
    svg.appendChild(path1);
    
    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.28 0 2.5.27 3.6.75');
    svg.appendChild(path2);
    
    completeButton.appendChild(svg);
    completeButton.appendChild(document.createTextNode('Complete Prompt'));
    completeButton.addEventListener('click', () => {
      this.collectInputsAndComplete(prompt);
    });
    additionalsContainer.appendChild(completeButton);
  },

  // Hide Level 3 - return to Level 2
  hideAdditionals: function() {
    window.navigationState.currentLayer = 2;
    window.navigationState.requiredInputs = [];

    // Show prompts container
    const promptsContainer = document.querySelector('.prompts-layer-container');
    if (promptsContainer) {
      promptsContainer.style.display = 'block';
    }

    // Hide additionals container
    const additionalsContainer = document.querySelector('.additionals-layer-container');
    if (additionalsContainer) {
      additionalsContainer.style.display = 'none';
    }
  },

  // Collect input values and complete prompt selection
  collectInputsAndComplete: function(prompt) {
    const additionalsContainer = document.querySelector('.additionals-layer-container');
    if (!additionalsContainer) return;

    const additionalInputs = {};
    const inputFields = additionalsContainer.querySelectorAll('.additional-input-field');
    
    inputFields.forEach(field => {
      const inputId = field.dataset.inputId;
      const inputValue = field.value.trim();
      if (inputId && inputValue) {
        additionalInputs[inputId] = inputValue;
      }
    });

    // Complete the prompt selection with additional inputs
    this.completePromptSelection(prompt, additionalInputs);
  },

  // Create input fields for additionals
  createAdditionalInputFields: function(container, additionalIds) {
    additionalIds.forEach(inputId => {
      const inputDef = window.navigationState.inputDefinitions[inputId];
      
      // Create input field group
      const fieldGroup = document.createElement('div');
      fieldGroup.className = 'additional-input-group';
      
      // Create label
      const label = document.createElement('label');
      label.className = 'additional-input-label';
      label.textContent = inputDef ? inputDef.label : inputId;
      label.setAttribute('for', `additional-${inputId}`);
      
      // Create input field
      const inputField = document.createElement('input');
      inputField.type = 'text';
      inputField.className = 'additional-input-field';
      inputField.id = `additional-${inputId}`;
      inputField.dataset.inputId = inputId;
      inputField.placeholder = inputDef ? inputDef.label : `Enter ${inputId}`;
      
      // Add special handling for different input types
      if (inputId.toLowerCase().includes('url') || inputId.toLowerCase().includes('link')) {
        inputField.type = 'url';
        inputField.placeholder = 'https://example.com';
      } else if (inputId.toLowerCase().includes('email')) {
        inputField.type = 'email';
        inputField.placeholder = 'example@domain.com';
      }
      
      // Add to group
      fieldGroup.appendChild(label);
      fieldGroup.appendChild(inputField);
      
      // Add to container
      container.appendChild(fieldGroup);
      
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log(`📋 Created input field for: ${inputId} - ${inputDef ? inputDef.label : 'No definition'}`);
      }
    });
  },

  // Show visual feedback when prompt is selected
  showPromptSelectedFeedback: function(prompt) {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.className = 'prompt-selected-notification';
    
    const iconSpan = document.createElement('span');
    iconSpan.className = 'notification-icon';
    iconSpan.textContent = '✓';
    notification.appendChild(iconSpan);
    
    const textSpan = document.createElement('span');
    textSpan.className = 'notification-text';
    textSpan.textContent = `Selected: ${prompt.label}`;
    notification.appendChild(textSpan);
    
    const container = document.getElementById('prompt-generator-container');
    if (container) {
      container.appendChild(notification);
      
      // Auto-remove after 2 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 2000);
    }
  },

  // Return to layer 1 (categories)
  hideCategory: function() {
    window.navigationState.currentLayer = 1;
    window.navigationState.selectedCategory = null;
    window.navigationState.selectedPrompt = null;
    window.navigationState.requiredInputs = [];

    // Show categories container
    const categoriesContainer = document.querySelector('.categories-layer-container');
    if (categoriesContainer) {
      categoriesContainer.style.display = 'block';
    }

    // Hide prompts container
    const promptsContainer = document.querySelector('.prompts-layer-container');
    if (promptsContainer) {
      promptsContainer.style.display = 'none';
    }

    // Hide additionals container
    const additionalsContainer = document.querySelector('.additionals-layer-container');
    if (additionalsContainer) {
      additionalsContainer.style.display = 'none';
    }
  },

  // Get currently selected prompts from categories
  getSelectedCategoryPrompts: function() {
    const state = window.getExtensionState();
    const categoryPrompts = state.activePrompts.categories || {};
    
    return Object.values(categoryPrompts).map(prompt => prompt.value).join('\n');
  }
};

// Export for global access
window.showCategory = window.categoryNavigation.showCategory.bind(window.categoryNavigation);
window.hideCategory = window.categoryNavigation.hideCategory.bind(window.categoryNavigation);