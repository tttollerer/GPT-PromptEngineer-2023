// LAZY-LOADED Data Provider - No Auto-Init
(function() {
  'use strict';
  
  let xmlData = null;
  let translations = {};
  let loadingState = 'idle';
  let initPromise = null;

  // Fallback data that always works
  const FALLBACK_DATA = `
    <data>
      <dropdowns>
        <dropdown>
          <label>Writing Style</label>
          <id>style</id>
          <options>
            <option><label>Select style</label><value></value></option>
            <option><label>Professional</label><value>Write in a professional tone.</value></option>
            <option><label>Casual</label><value>Write in a casual, friendly tone.</value></option>
            <option><label>Academic</label><value>Write in an academic, formal style.</value></option>
          </options>
        </dropdown>
      </dropdowns>
      <checkboxes>
        <checkbox>
          <label>Include Examples</label>
          <value>Provide relevant examples.</value>
          <id>examples</id>
          <additionals></additionals>
          <additionalsHide></additionalsHide>
        </checkbox>
      </checkboxes>
      <inputs>
        <input>
          <label>Context</label>
          <id>context</id>
          <type>text</type>
          <valueBefore>Context: </valueBefore>
          <valueAfter></valueAfter>
        </input>
      </inputs>
    </data>
  `;

  function createFallbackXml() {
    const parser = new DOMParser();
    return parser.parseFromString(FALLBACK_DATA, 'application/xml');
  }

  // Only try to load if chrome extension context is ready
  function isExtensionReady() {
    return typeof chrome !== 'undefined' && 
           chrome.runtime && 
           chrome.runtime.getURL &&
           chrome.runtime.id;
  }

  async function tryLoadTranslations() {
    if (!isExtensionReady()) {
      return {};
    }
    
    try {
      const url = chrome.runtime.getURL('translation/translations.json');
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('PromptEngineer: Translations loaded');
        return data;
      }
    } catch (error) {
      // Silent fail - translations are optional
    }
    return {};
  }

  async function tryLoadXmlFile(filename) {
    if (!isExtensionReady()) {
      return null;
    }
    
    try {
      const url = chrome.runtime.getURL(filename);
      const response = await fetch(url);
      
      if (!response.ok) {
        return null;
      }
      
      const xmlText = await response.text();
      if (!xmlText?.trim()) {
        return null;
      }
      
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, 'application/xml');
      
      if (xml.querySelector('parsererror')) {
        return null;
      }
      
      return xml;
    } catch (error) {
      return null;
    }
  }

  async function loadXmlData() {
    const xmlFiles = [
      'data_dropdowns.xml',
      'data_inputs.xml', 
      'data_checkboxes.xml',
      'data_dropdown_employee.xml',
      'data_dropdown_tasks.xml'
    ];

    if (!isExtensionReady()) {
      console.log('PromptEngineer: Extension not ready, using fallback data');
      return createFallbackXml();
    }

    try {
      const loadPromises = xmlFiles.map(file => tryLoadXmlFile(file));
      const results = await Promise.all(loadPromises);
      const validXmls = results.filter(xml => xml !== null);
      
      if (validXmls.length === 0) {
        console.log('PromptEngineer: No XML files loaded, using fallback');
        return createFallbackXml();
      }
      
      // Merge XMLs
      const mergedXml = validXmls[0].cloneNode(true);
      const mergedRoot = mergedXml.documentElement;
      
      for (let i = 1; i < validXmls.length; i++) {
        const xml = validXmls[i];
        const children = Array.from(xml.documentElement.children);
        children.forEach(child => {
          const importedNode = mergedXml.importNode(child, true);
          mergedRoot.appendChild(importedNode);
        });
      }
      
      console.log(`PromptEngineer: Loaded ${validXmls.length}/${xmlFiles.length} XML files`);
      return mergedXml;
      
    } catch (error) {
      console.log('PromptEngineer: XML loading failed, using fallback');
      return createFallbackXml();
    }
  }

  // LAZY initialization - only when actually needed
  async function initialize() {
    // Return existing promise if already initializing
    if (initPromise) {
      return initPromise;
    }
    
    // Return cached data if already loaded
    if (loadingState === 'loaded' && xmlData) {
      return xmlData;
    }
    
    loadingState = 'loading';
    
    // Create initialization promise
    initPromise = (async () => {
      try {
        console.log('PromptEngineer: Starting lazy initialization...');
        
        const [translationsResult, xmlResult] = await Promise.all([
          tryLoadTranslations(),
          loadXmlData()
        ]);
        
        translations = translationsResult;
        xmlData = xmlResult;
        loadingState = 'loaded';
        
        console.log('PromptEngineer: Initialization complete');
        return xmlData;
        
      } catch (error) {
        loadingState = 'error';
        xmlData = createFallbackXml();
        
        console.warn('PromptEngineer: Initialization failed, using fallback:', error.message);
        return xmlData;
      }
    })();
    
    return initPromise;
  }

  function applyLanguage(xml, lang) {
    if (!lang || lang === 'en' || !translations[lang]) {
      return xml;
    }
    
    try {
      const clonedXml = xml.cloneNode(true);
      const labels = clonedXml.querySelectorAll('label');
      
      labels.forEach(labelNode => {
        const originalText = labelNode.textContent.trim();
        if (translations[lang][originalText]) {
          labelNode.textContent = translations[lang][originalText];
        }
      });
      
      return clonedXml;
    } catch (error) {
      console.warn('PromptEngineer: Translation error:', error);
      return xml;
    }
  }

  // Main API function - always returns data
  async function fetchDropdownData(lang) {
    try {
      await initialize();
      return applyLanguage(xmlData, lang);
    } catch (error) {
      console.error('PromptEngineer: fetchDropdownData failed:', error);
      return createFallbackXml();
    }
  }

  function getLoadingState() {
    return {
      state: loadingState,
      hasData: xmlData !== null,
      isExtensionReady: isExtensionReady()
    };
  }

  // Export to namespace that won't conflict
  const PromptEngineData = {
    fetchDropdownData,
    getLoadingState
  };

  // Safe window export
  if (typeof window !== 'undefined') {
    // Use a unique namespace
    if (!window.PromptEngineData) {
      window.PromptEngineData = PromptEngineData;
    }
    
    // Backward compatibility only if not already defined
    if (!window.fetchDropdownData) {
      window.fetchDropdownData = fetchDropdownData;
    }
    
    console.log('PromptEngineer: Data module exported (lazy-loading)');
  }

})();