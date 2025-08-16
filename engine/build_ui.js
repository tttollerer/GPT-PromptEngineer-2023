window.attributionHTML = attributionHTML;

// Translation helper function
function getTranslation(key, fallback = key) {
  const currentLanguage = localStorage.getItem('selectedLanguage') || 'de';
  
  if (window.translations && 
      window.translations[currentLanguage] && 
      window.translations[currentLanguage][key]) {
    return window.translations[currentLanguage][key];
  }
  
  // Fallback to English if current language doesn't have the key
  if (window.translations && 
      window.translations['en'] && 
      window.translations['en'][key]) {
    return window.translations['en'][key];
  }
  
  // Ultimate fallback to the key itself or provided fallback
  return fallback;
}

// Language flag mapping
const languageFlags = {
  'en': '🇺🇸', 'zh': '🇨🇳', 'es': '🇪🇸', 'hi': '🇮🇳', 
  'fr': '🇫🇷', 'de': '🇩🇪', 'ru': '🇷🇺', 'pt': '🇵🇹', 
  'it': '🇮🇹', 'th': '🇹🇭', 'ch': '🇨🇭', 'by': '🔠', 'sch': '🇩🇪'
};

// Language menu functionality
function showLanguageMenu(languageIcon, currentLangFlag) {
  // Remove existing menu
  const existingMenu = document.querySelector('.language-menu');
  if (existingMenu) {
    existingMenu.remove();
    return;
  }
  
  const menu = document.createElement('div');
  menu.className = 'language-menu';
  
  const languages = [
    { value: 'en', text: '🇺🇸 English' },
    { value: 'zh', text: '🇨🇳 Chinese' },
    { value: 'es', text: '🇪🇸 Spanish' },
    { value: 'hi', text: '🇮🇳 Hindi' },
    { value: 'fr', text: '🇫🇷 French' },
    { value: 'de', text: '🇩🇪 German' },
    { value: 'ru', text: '🇷🇺 Russian' },
    { value: 'pt', text: '🇵🇹 Portuguese' },
    { value: 'it', text: '🇮🇹 Italian' },
    { value: 'th', text: '🇹🇭 Thai' },
    { value: '', text: '── Dialects ──', disabled: true },
    { value: 'ch', text: '🇨🇭 Switzerdütsch' },
    { value: 'by', text: '🔠 Bayrisch' },
    { value: 'sch', text: '🇩🇪 Schwäbisch' }
  ];
  
  languages.forEach(lang => {
    const item = document.createElement('div');
    item.className = 'language-menu-item';
    if (lang.disabled) {
      item.classList.add('disabled');
    }
    item.textContent = lang.text;
    
    if (!lang.disabled) {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        // Update current flag
        currentLangFlag.textContent = languageFlags[lang.value] || '🌍';
        // Trigger language change
        localStorage.setItem('selectedLanguage', lang.value);
        updateUI(lang.value);
        // Update AI button texts when language changes
        if (window.updateAIGeneratorButtonText) {
          window.updateAIGeneratorButtonText();
        }
        menu.remove();
      });
    }
    
    menu.appendChild(item);
  });
  
  // Position menu
  languageIcon.appendChild(menu);
  
  // Close menu when clicking outside
  setTimeout(() => {
    document.addEventListener('click', () => {
      menu.remove();
    }, { once: true });
  }, 10);
}

// TopBar creation functions
function createTopBar(container) {
  const topBar = document.createElement('div');
  topBar.className = 'extension-topbar';
  
  // Logo section - centered
  const logoSection = document.createElement('div');
  logoSection.className = 'extension-logo';
  const logoImg = document.createElement('img');
  logoImg.src = chrome.runtime.getURL('Images/logo.png');
  logoImg.alt = 'PromptEngineer Logo';
  logoSection.appendChild(logoImg);
  
  // Controls section - right aligned
  const controlsSection = document.createElement('div');
  controlsSection.className = 'extension-controls';
  
  // Language selector as icon button
  const languageIcon = document.createElement('div');
  languageIcon.id = 'language-icon';
  languageIcon.className = 'header-icon-button';
  languageIcon.title = 'Select Language';
  
  // Current language flag (default German)
  const currentLangFlag = document.createElement('span');
  currentLangFlag.className = 'current-language-flag';
  currentLangFlag.textContent = '🇩🇪'; // Default flag
  languageIcon.appendChild(currentLangFlag);
  
  // Hidden language selector
  const languageSelector = createLanguageDropdown();
  languageSelector.style.display = 'none';
  languageIcon.appendChild(languageSelector);
  
  // Click handler for language icon
  languageIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    // Create temporary dropdown menu
    showLanguageMenu(languageIcon, currentLangFlag);
  });
  
  // XML Editor icon
  const xmlEditorIcon = document.createElement('div');
  xmlEditorIcon.id = 'xml-editor-icon';
  xmlEditorIcon.className = 'header-icon-button';
  xmlEditorIcon.title = 'XML Editor';
  
  // Create XML icon SVG
  const xmlSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  xmlSvg.setAttribute('viewBox', '0 0 24 24');
  
  const xmlPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  xmlPath.setAttribute('d', 'M12.89,3L14.85,3.4L11.11,21L9.15,20.6L12.89,3M19.59,12L16,8.41V5.58L22.42,12L16,18.41V15.58L19.59,12M1.58,12L8,5.58V8.41L4.41,12L8,15.58V18.41L1.58,12Z');
  
  xmlSvg.appendChild(xmlPath);
  xmlEditorIcon.appendChild(xmlSvg);
  xmlEditorIcon.addEventListener('click', () => {
    // Open XML Editor in new tab
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'openPopup' });
    }
  });
  
  // Settings icon
  const settingsIcon = document.createElement('div');
  settingsIcon.id = 'settings-icon';
  settingsIcon.className = 'header-icon-button';
  settingsIcon.title = 'Settings';
  
  // Create SVG element safely
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M10,22C9.75,22 9.54,21.82 9.5,21.58L9.13,18.93C8.5,18.68 7.96,18.34 7.44,17.94L4.95,18.95C4.73,19.03 4.46,18.95 4.34,18.73L2.34,15.27C2.21,15.05 2.27,14.78 2.46,14.63L4.57,12.97L4.5,12L4.57,11.03L2.46,9.37C2.27,9.22 2.21,8.95 2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.96 4.95,5.05L7.44,6.05C7.96,5.66 8.5,5.32 9.13,5.07L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18 14.5,2.42L14.87,5.07C15.5,5.32 16.04,5.66 16.56,6.05L19.05,5.05C19.27,4.96 19.54,5.05 19.66,5.27L21.66,8.73C21.79,8.95 21.73,9.22 21.54,9.37L19.43,11.03L19.5,12L19.43,12.97L21.54,14.63C21.73,14.78 21.79,15.05 21.66,15.27L19.66,18.73C19.54,18.95 19.27,19.04 19.05,18.95L16.56,17.95C16.04,18.34 15.5,18.68 14.87,18.93L14.5,21.58C14.46,21.82 14.25,22 14,22H10M11.25,4L10.88,6.61C9.68,6.86 8.62,7.5 7.85,8.39L5.44,7.35L4.69,8.65L6.8,10.2C6.4,11.37 6.4,12.64 6.8,13.8L4.68,15.36L5.43,16.66L7.86,15.62C8.63,16.5 9.68,17.14 10.87,17.38L11.24,20H12.76L13.13,17.39C14.32,17.14 15.37,16.5 16.14,15.62L18.57,16.66L19.32,15.36L17.2,13.81C17.6,12.64 17.6,11.37 17.2,10.2L19.31,8.65L18.56,7.35L16.15,8.39C15.38,7.5 14.32,6.86 13.12,6.62L12.75,4H11.25Z');
  
  svg.appendChild(path);
  settingsIcon.appendChild(svg);
  settingsIcon.addEventListener('click', () => {
    if (window.toggleSettingsPanel) {
      window.toggleSettingsPanel();
    }
  });
  
  // Add to controls
  controlsSection.appendChild(languageIcon);
  controlsSection.appendChild(xmlEditorIcon);
  controlsSection.appendChild(settingsIcon);
  
  // Add to topbar
  topBar.appendChild(logoSection);
  topBar.appendChild(controlsSection);
  
  // Add as first child of container
  container.appendChild(topBar);
  
  // Set initial language flag from localStorage
  const savedLanguage = localStorage.getItem('selectedLanguage') || 'de';
  currentLangFlag.textContent = languageFlags[savedLanguage] || '🇩🇪';
  
  return { languageSelector: languageSelector, settingsIcon, languageIcon, currentLangFlag };
}

(async function() {
  // Local inputFieldCreation object - robust fallback solution
  const inputFieldCreation = {
    createInputField: function(type, data) {
      let inputField;
      if (type === 'input') {
        inputField = document.createElement('input');
        inputField.type = data.type || 'text';
        inputField.id = data.id;
      } else if (type === 'select') {
        inputField = document.createElement('select');
        if (data.options) {
          data.options.forEach((option) => {
            if (option) {
              const opt = document.createElement('option');
              opt.textContent = option.label || '';
              if (option.text) opt.dataset.text = option.text;
              if (option.additionals) opt.dataset.additionals = option.additionals;
              inputField.appendChild(opt);
            }
          });
        }
      }
      return inputField;
    },

    createCheckbox: function(checkboxData) {
      const labelDiv = document.createElement('div');
      labelDiv.classList.add('prompt-generator-label-div');
      const label = document.createElement('label');
      label.classList.add('checkbox_btn');
      label.textContent = checkboxData.label || '';
      labelDiv.appendChild(label);

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = checkboxData.value || '';
      input.id = checkboxData.id || '';
      if (checkboxData.additionals) input.setAttribute('additionals', checkboxData.additionals);
      if (checkboxData.additionalsHide) input.setAttribute('additionalsHide', checkboxData.additionalsHide);

      label.appendChild(input);
      return labelDiv;
    },

    createDropdown: function(dropdownData) {
      const dropdownWrapper = document.createElement('div');
      dropdownWrapper.classList.add('prompt-generator-dropdown-wrapper');
      const labelDiv = document.createElement('div');
      labelDiv.classList.add('prompt-generator-label-div');

      const label = document.createElement('label');
      label.textContent = dropdownData.label || '';
      labelDiv.appendChild(label);

      dropdownWrapper.appendChild(labelDiv);

      const dropdownElement = this.createInputField('select', { options: dropdownData.options });
      dropdownElement.id = dropdownData.id || '';
      dropdownElement.classList.add('prompt-generator-dropdown');
      dropdownWrapper.appendChild(dropdownElement);
      return dropdownWrapper;
    },

    createInput: function(inputData) {
      const inputDiv = document.createElement('div');
      inputDiv.classList.add('prompt-generator-input-div');
      if (inputData.id !== 'fileUpload') {
        inputDiv.classList.add('HideInput');
      }

      const label = document.createElement('label');
      label.textContent = inputData.label || '';
      inputDiv.appendChild(label);

      const inputElement = this.createInputField('input', { type: inputData.type, id: inputData.id });
      inputElement.classList.add('prompt-generator-input');
      inputElement.placeholder = inputData.label || '';
      inputDiv.appendChild(inputElement);

      return inputDiv;
    }
  };
  
  let lastSelectedLanguageIndex = 0;
  async function buildUI(xmlData) {
    try {
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("🔧 buildUI: Starting UI construction");
      }
      if (!xmlData) {
        console.error('xmlData is null');
        return;
      }
      
      // Using local inputFieldCreation object - no need to check global functions

    const dropdowns = xmlData.getElementsByTagName('dropdown');
    const checkboxes = xmlData.getElementsByTagName('checkbox');
    const inputs = xmlData.getElementsByTagName('input');
    
    const targetNode = document.querySelector(window.getSelector());

if (targetNode) {
  targetNode.setAttribute('id', 'PromptInput');
  const promptButton = targetNode.nextElementSibling;

  if (promptButton) {
    promptButton.setAttribute('id', 'PromptButton');
    
  }

} else {
  console.error('🤖 PromptEngineer buildUI: Das targetNode-Element wurde nicht gefunden auf', window.location.href);
  console.log('💡 Extension kann nicht initialisiert werden. Überprüfe die Console für Textfeld-Erkennungs-Details.');
  
  // Versuche einfache Fallback-Selektoren
  const fallbackSelectors = ['textarea', 'input[type="text"]', '[contenteditable="true"]'];
  let fallbackFound = false;
  
  for (let selector of fallbackSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`🔧 Fallback gefunden: ${elements.length} Elemente mit Selector "${selector}"`);
      elements.forEach((el, i) => {
        console.log(`  ${i+1}. Element:`, el);
      });
      fallbackFound = true;
    }
  }
  
  if (!fallbackFound) {
    console.log('❌ Keine Textfelder auf der Seite gefunden.');
  }
}

if (!targetNode) {
  console.log('⚠️ PromptEngineer buildUI wird abgebrochen - kein Textfeld verfügbar');
  return;
}

    const existingContainer = document.getElementById('prompt-generator-container');
const container = existingContainer ? existingContainer : document.createElement('div');
container.id = 'prompt-generator-container';
container.classList.add('prompt-generator-container');
clearContainer(container);

// Create TopBar with logo and controls
const topBarElements = createTopBar(container);

// Set up language change handler for TopBar language selector
if (topBarElements.languageSelector) {
  topBarElements.languageSelector.addEventListener('change', function(event) {
    const lang = event.target.value;
    localStorage.setItem('selectedLanguage', lang);
    updateUI(lang);
  });
}









// Modern toggle button is now handled by modern_toggle.js






    // Language dropdown is now in TopBar




    // Create and add search UI
    const searchUI = window.promptSearchUI.createSearchUI();
    container.appendChild(searchUI);

    // Create AI Prompt Generator button
    const aiGeneratorButton = document.createElement('button');
    aiGeneratorButton.className = 'ai-generator-button';
    
    // Get current language for translation
    const currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
    let buttonText = 'AI Create Prompt'; // Default fallback
    
    // Safely access translations with multiple fallbacks
    if (window.translations && window.translations[currentLanguage] && window.translations[currentLanguage]["AI Create Prompt"]) {
      buttonText = window.translations[currentLanguage]["AI Create Prompt"];
    } else if (window.translations && window.translations['en'] && window.translations['en']["AI Create Prompt"]) {
      buttonText = window.translations['en']["AI Create Prompt"];
    } else if (window.translations && window.translations['de'] && window.translations['de']["AI Create Prompt"]) {
      buttonText = window.translations['de']["AI Create Prompt"]; // German fallback since it was originally German
    }
    
    // Clear button content
    aiGeneratorButton.textContent = '';
    
    // Create SVG element safely
    const svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg1.setAttribute('viewBox', '0 0 24 24');
    svg1.setAttribute('width', '16');
    svg1.setAttribute('height', '16');
    svg1.setAttribute('fill', 'none');
    svg1.setAttribute('stroke', 'currentColor');
    svg1.setAttribute('stroke-width', '2');
    svg1.setAttribute('stroke-linecap', 'round');
    svg1.setAttribute('stroke-linejoin', 'round');
    svg1.style.marginRight = '6px';
    
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'm12 2 3 7s4 1 4 5.5c0 2.8-2.2 5.5-5 5.5s-5-2.7-5-5.5c0-4.5 4-5.5 4-5.5z');
    svg1.appendChild(path1);
    
    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M5 3L4 6l7 6 1-3z');
    svg1.appendChild(path2);
    
    const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle1.setAttribute('cx', '12');
    circle1.setAttribute('cy', '17');
    circle1.setAttribute('r', '1');
    svg1.appendChild(circle1);
    
    aiGeneratorButton.appendChild(svg1);
    aiGeneratorButton.appendChild(document.createTextNode(buttonText));
    
    aiGeneratorButton.addEventListener('click', () => {
      if (window.aiPromptGenerator) {
        window.aiPromptGenerator.openGenerator();
      } else {
        console.warn('⚠️ AI Prompt Generator not loaded yet');
      }
    });
    
    // Create AI Prompt Improver button
    const aiImproverButton = document.createElement('button');
    aiImproverButton.className = 'ai-improver-button';
    
    // Get translation for improver button
    let improverButtonText = 'AI Improve Prompt'; // Default fallback
    
    // Safely access translations with multiple fallbacks for improver button
    if (window.translations && window.translations[currentLanguage] && window.translations[currentLanguage]["AI Improve Prompt"]) {
      improverButtonText = window.translations[currentLanguage]["AI Improve Prompt"];
    } else if (window.translations && window.translations['en'] && window.translations['en']["AI Improve Prompt"]) {
      improverButtonText = window.translations['en']["AI Improve Prompt"];
    } else if (window.translations && window.translations['de'] && window.translations['de']["AI Improve Prompt"]) {
      improverButtonText = window.translations['de']["AI Improve Prompt"];
    }
    
    // Clear button content
    aiImproverButton.textContent = '';
    
    // Create SVG element safely
    const svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg2.setAttribute('viewBox', '0 0 24 24');
    svg2.setAttribute('width', '16');
    svg2.setAttribute('height', '16');
    svg2.setAttribute('fill', 'none');
    svg2.setAttribute('stroke', 'currentColor');
    svg2.setAttribute('stroke-width', '2');
    svg2.setAttribute('stroke-linecap', 'round');
    svg2.setAttribute('stroke-linejoin', 'round');
    svg2.style.marginRight = '6px';
    
    const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path3.setAttribute('d', 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z');
    svg2.appendChild(path3);
    
    aiImproverButton.appendChild(svg2);
    aiImproverButton.appendChild(document.createTextNode(improverButtonText));
    
    aiImproverButton.addEventListener('click', () => {
      if (window.aiPromptGenerator && window.aiPromptGenerator.improveExistingPrompt) {
        window.aiPromptGenerator.improveExistingPrompt();
      } else {
        console.warn('⚠️ AI Prompt Improver not loaded yet');
      }
    });
    
    // Create container for both AI buttons
    const aiButtonsContainer = document.createElement('div');
    aiButtonsContainer.className = 'ai-buttons-container';
    aiButtonsContainer.appendChild(aiGeneratorButton);
    aiButtonsContainer.appendChild(aiImproverButton);
    container.appendChild(aiButtonsContainer);

    // Quick Access headline (collapsible) before checkboxes
    const quickAccessHeadline = document.createElement('h3');
    quickAccessHeadline.className = 'section-headline quick-access-headline quick-access-header';
    quickAccessHeadline.textContent = getTranslation('Quick Access', 'Quick Access');
    container.appendChild(quickAccessHeadline);

    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'prompt-generator-checkbox-container quick-access-content';
    container.appendChild(checkboxContainer);

    Array.from(checkboxes).forEach((checkbox) => {
      const checkboxData = {
        label: checkbox.querySelector('label').textContent,
        value: checkbox.querySelector('value').textContent,
        id: checkbox.querySelector('id').textContent,
        additionals: checkbox.querySelector('additionals').textContent,
        additionalsHide: checkbox.querySelector('additionalsHide').textContent,
      };
      const checkboxElement = inputFieldCreation.createCheckbox(checkboxData);
      checkboxContainer.appendChild(checkboxElement);
    });

    // Prompt Categories headline before category navigation
    const promptCategoriesHeadline = document.createElement('h3');
    promptCategoriesHeadline.className = 'section-headline prompt-categories-headline';
    promptCategoriesHeadline.textContent = getTranslation('Prompt Categories', 'Prompt Categories');
    container.appendChild(promptCategoriesHeadline);

    // Initialize category navigation instead of dropdowns
    if (window.categoryNavigation) {
      window.categoryNavigation.init(xmlData);
    } else {
      console.warn('Category navigation not loaded, falling back to dropdowns');
      
      // Fallback: Create traditional dropdowns if category navigation fails
      const dropdownContainer = document.createElement('div');
      dropdownContainer.classList.add('prompt-generator-dropdown-container');
      container.appendChild(dropdownContainer);

      Array.from(dropdowns).forEach((dropdown) => {
        const options = dropdown.querySelectorAll('options option');
        const idElement = dropdown.querySelector('id');
        const labelElement = dropdown.querySelector('label');
        const dropdownData = {
          id: idElement ? idElement.textContent : '',
          label: labelElement ? labelElement.textContent : '',
          options: Array.from(options).map((option) => {
            const optionLabelElement = option.querySelector('label');
            const optionValueElement = option.querySelector('value');
            const optionAdditionalsElement = option.querySelector('additionals');
            return {
              label: optionLabelElement ? optionLabelElement.textContent : '',
              text: optionValueElement ? optionValueElement.textContent : '',
              additionals: optionAdditionalsElement ? optionAdditionalsElement.textContent : null,
            };
          }),
        };
        const dropdownElement = inputFieldCreation.createDropdown(dropdownData);
        dropdownContainer.appendChild(dropdownElement);
      });
    }


/*funktioniert */
const inputContainer = document.createElement('div');
//inputContainer.classList.add('prompt-generator-input-container');
//container.appendChild(inputContainer);

Array.from(inputs).forEach((input) => {
  const labelElement = input.querySelector('label');
  const idElement = input.querySelector('id');
  const typeElement = input.querySelector('type');
  const inputData = {
    label: labelElement ? labelElement.textContent : '',
    id: idElement ? idElement.textContent : '',
    type: typeElement ? typeElement.textContent : 'text',  // Standard auf 'text' setzen, wenn kein Typ definiert ist
  };


  if (!labelElement || !idElement) {
    console.warn("Warnung: Ein oder mehrere benötigte Elemente wurden nicht gefunden.");
    return;
  }

  

  const inputElement = inputFieldCreation.createInput(inputData);
  const inputField = inputElement.querySelector('input');
  inputField.placeholder = inputData.label;
  inputContainer.appendChild(inputElement);
  
  if (window.errorHandler && window.errorHandler.debugMode) {
    console.log("📝 Created input field:", inputData.label);
  }
});

// Container is already appended to body in content_script.js







    const attribution = document.createElement('div');
    
    // Create attribution content safely
    const supportText = document.createTextNode('Supported by ');
    
    const link1 = document.createElement('a');
    link1.href = 'https://www.ritterwagner.de/?utm_source=promptEngineer&utm_medium=chromeExtension';
    link1.tabIndex = -1;
    link1.style.textDecoration = 'underline';
    link1.textContent = 'RitterWagner';
    link1.target = '_blank';
    link1.rel = 'noopener noreferrer';
    
    const text2 = document.createTextNode(' Germany. Developed with ❤ at night in Tenerife. ');
    
    const link2 = document.createElement('a');
    link2.href = 'https://ko-fi.com/42aidiaries';
    link2.tabIndex = -1;
    link2.style.textDecoration = 'underline';
    link2.textContent = 'Donate A Coffee ☕️';
    link2.target = '_blank';
    link2.rel = 'noopener noreferrer';
    
    const text3 = document.createTextNode(' or ');
    
    const link3 = document.createElement('a');
    link3.href = 'https://amzn.to/3qdpAY4';
    link3.tabIndex = -1;
    link3.style.textDecoration = 'underline';
    link3.textContent = 'Free Affiliate Support';
    link3.target = '_blank';
    link3.rel = 'noopener noreferrer';
    
    attribution.appendChild(supportText);
    attribution.appendChild(link1);
    attribution.appendChild(text2);
    attribution.appendChild(link2);
    attribution.appendChild(text3);
    attribution.appendChild(link3);

    attribution.classList.add('prompt-generator-attribution');
    
    createInputs(container, xmlData);
    getInputTexts(xmlData);
  
    container.appendChild(attribution);
    
    // Initialize collapsible functionality for Quick Access
    if (window.collapsibleSections) {
      // Short delay to ensure DOM is ready
      setTimeout(() => {
        const success = window.collapsibleSections.init('quick-access', {
          defaultCollapsed: false, // Default expanded
          accessibility: {
            expandedLabel: getTranslation('Quick Access expanded, click to collapse', 'Quick Access expanded, click to collapse'),
            collapsedLabel: getTranslation('Quick Access collapsed, click to expand', 'Quick Access collapsed, click to expand')
          },
          onToggle: (collapsed, sectionId) => {
            if (window.errorHandler && window.errorHandler.debugMode) {
              console.log(`🔧 Quick Access ${collapsed ? 'collapsed' : 'expanded'}`);
            }
          }
        });
        
        if (success && window.errorHandler && window.errorHandler.debugMode) {
          console.log('✅ Quick Access collapsible functionality initialized');
        }
      }, 100);
    } else {
      console.warn('⚠️ Collapsible sections not loaded - Quick Access will not be collapsible');
    }
    
    } catch (error) {
      console.error('❌ buildUI Error:', error);
      
      // Handle error with error handler if available
      if (window.errorHandler) {
        window.errorHandler.handleError({
          message: `buildUI failed: ${error.message}`,
          error: error,
          context: 'buildUI',
          critical: true,
          userMessage: 'Fehler beim Aufbau der Benutzeroberfläche'
        });
      }
      
      // Try to create a minimal fallback UI
      createFallbackUI();
    }
  }
  
  function createFallbackUI() {
    try {
      const targetNode = document.querySelector(window.getSelector());
      if (!targetNode) return;
      
      // Remove any existing container
      const existingContainer = document.getElementById('prompt-generator-container');
      if (existingContainer) {
        existingContainer.remove();
      }
      
      // Create minimal container with safe DOM manipulation
      const container = document.createElement('div');
      container.id = 'prompt-generator-container';
      
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = 'padding: 20px; text-align: center; background: #f44336; color: white; border-radius: 8px; margin: 10px;';
      
      const title = document.createElement('h3');
      title.textContent = '⚠️ PromptEngineer Fehler';
      
      const message1 = document.createElement('p');
      message1.textContent = 'Die Extension konnte nicht vollständig geladen werden.';
      
      const message2 = document.createElement('p');
      message2.textContent = 'Bitte Seite neu laden oder Extension neu installieren.';
      
      const reloadButton = document.createElement('button');
      reloadButton.textContent = '🔄 Seite neu laden';
      reloadButton.style.cssText = 'margin: 10px; padding: 8px 16px; background: white; color: #f44336; border: none; border-radius: 4px; cursor: pointer;';
      reloadButton.onclick = () => window.location.reload();
      
      errorDiv.appendChild(title);
      errorDiv.appendChild(message1);
      errorDiv.appendChild(message2);
      errorDiv.appendChild(reloadButton);
      container.appendChild(errorDiv);
      
      document.body.appendChild(container);
      
    } catch (fallbackError) {
      console.error('❌ Even fallback UI failed:', fallbackError);
    }
  }

  function clearContainer(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  function createInputs(container, xmlData) {
    const inputs = xmlData.getElementsByTagName('input');
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('prompt-generator-input-container');
    container.appendChild(inputContainer);
  
    Array.from(inputs).forEach((input) => {
      const labelElement = input.querySelector('label');
      const idElement = input.querySelector('id');
      const typeElement = input.querySelector('type');  // Lese das 'type' Element aus den XML-Daten
      const valueBeforeElement = input.querySelector('valueBefore');
      const valueAfterElement = input.querySelector('valueAfter');
  
      const inputData = {
        label: labelElement ? labelElement.textContent : '',
        id: idElement ? idElement.textContent : '',
        type: typeElement ? typeElement.textContent : 'text',  // Setze den 'type' Wert in inputData
        valueBefore: valueBeforeElement ? valueBeforeElement.textContent : '',
        valueAfter: valueAfterElement ? valueAfterElement.textContent : '',
      };
  
      const inputElement = inputFieldCreation.createInput(inputData);
      const inputField = inputElement.querySelector('input');
      inputField.setAttribute('valueBefore', inputData.valueBefore);
      inputField.setAttribute('valueAfter', inputData.valueAfter);
      inputField.placeholder = inputData.label;
      inputContainer.appendChild(inputElement);
    });
  }
  


  // Function to update AI button texts when language changes
function updateAIGeneratorButtonText() {
  const aiGeneratorButton = document.querySelector('.ai-generator-button');
  const aiImproverButton = document.querySelector('.ai-improver-button');
  const currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
  
  // Update AI Generator button
  if (aiGeneratorButton) {
    let buttonText = 'AI Create Prompt'; // Default fallback
    
    // Safely access translations with multiple fallbacks
    if (window.translations && window.translations[currentLanguage] && window.translations[currentLanguage]["AI Create Prompt"]) {
      buttonText = window.translations[currentLanguage]["AI Create Prompt"];
    } else if (window.translations && window.translations['en'] && window.translations['en']["AI Create Prompt"]) {
      buttonText = window.translations['en']["AI Create Prompt"];
    } else if (window.translations && window.translations['de'] && window.translations['de']["AI Create Prompt"]) {
      buttonText = window.translations['de']["AI Create Prompt"]; // German fallback since it was originally German
    }
    
    // Clear button content
    aiGeneratorButton.textContent = '';
    
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
    path1.setAttribute('d', 'm12 2 3 7s4 1 4 5.5c0 2.8-2.2 5.5-5 5.5s-5-2.7-5-5.5c0-4.5 4-5.5 4-5.5z');
    svg.appendChild(path1);
    
    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M5 3L4 6l7 6 1-3z');
    svg.appendChild(path2);
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '17');
    circle.setAttribute('r', '1');
    svg.appendChild(circle);
    
    aiGeneratorButton.appendChild(svg);
    aiGeneratorButton.appendChild(document.createTextNode(buttonText));
  }
  
  // Update AI Improver button
  if (aiImproverButton) {
    let improverButtonText = 'AI Improve Prompt'; // Default fallback
    
    // Safely access translations with multiple fallbacks for improver button
    if (window.translations && window.translations[currentLanguage] && window.translations[currentLanguage]["AI Improve Prompt"]) {
      improverButtonText = window.translations[currentLanguage]["AI Improve Prompt"];
    } else if (window.translations && window.translations['en'] && window.translations['en']["AI Improve Prompt"]) {
      improverButtonText = window.translations['en']["AI Improve Prompt"];
    } else if (window.translations && window.translations['de'] && window.translations['de']["AI Improve Prompt"]) {
      improverButtonText = window.translations['de']["AI Improve Prompt"];
    }
    
    // Clear button content
    aiImproverButton.textContent = '';
    
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
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z');
    svg.appendChild(path);
    
    aiImproverButton.appendChild(svg);
    aiImproverButton.appendChild(document.createTextNode(improverButtonText));
  }
}

window.buildUI = buildUI;
window.updateAIGeneratorButtonText = updateAIGeneratorButtonText;

})();

   

// Legacy toggle functionality moved to modern_toggle.js

function resetInputFields() {
  const container = document.getElementById('prompt-generator-container');
  const inputs = container.querySelectorAll('input, select');
  inputs.forEach(input => {
    if (input.type === 'checkbox') {
      input.checked = false;
    } else if (input.tagName === 'SELECT') {
      input.selectedIndex = 0;
    } else {
      input.value = '';
    }
  });
}



function hideAdditionalInputs() {
  const inputElements = document.querySelectorAll('.prompt-generator-input-container .prompt-generator-input-div');
  inputElements.forEach(inputDiv => {
    if (!inputDiv.classList.contains('HideInput')) {
      inputDiv.classList.add('HideInput');
      const inputElement = inputDiv.querySelector('input[type="text"]');
      inputElement.value = '';
    }
  });
}