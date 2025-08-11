async function loadTranslations() {
  if (!window.translations) {
    const url = chrome.runtime.getURL('translation/translations.js');
    await import(url);
  }
  return window.translations;
}

let preferLocalizedLabel = true;

async function fetchAllXml() {
  try {
    // Ensure XML_FILES exists and has entries
    if (!window.XML_FILES || !window.XML_FILES.length) {
      const error = new Error('No XML files configured');
      if (window.errorHandler) {
        window.errorHandler.handleError({
          message: 'No XML files configured in window.XML_FILES',
          error: error,
          context: 'fetchAllXml',
          critical: true,
          userMessage: 'Extension Konfiguration fehlt'
        });
      } else {
        console.error('No XML files configured in window.XML_FILES');
      }
      throw error;
    }

    const xmls = await Promise.all(window.XML_FILES.map(async (file) => {
      try {
        const url = chrome.runtime.getURL(file);
        console.log(`Fetching XML from: ${url}`);
        
        // Add timeout protection
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(url, {
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, 'application/xml');
        
        // Check for XML parsing errors
        const parserError = xml.getElementsByTagName('parsererror');
        if (parserError.length > 0) {
          throw new Error('Invalid XML format');
        }
        
        return xml;
      } catch (error) {
        // Log error with error handler if available
        if (window.errorHandler) {
          window.errorHandler.handleError({
            message: `Failed to load XML file ${file}: ${error.message}`,
            error: error,
            context: 'fetchAllXml',
            file: file
          });
        } else {
          console.error(`Failed to load XML file ${file}:`, error);
        }
        // Return empty document as fallback
        return new DOMParser().parseFromString('<root/>', 'application/xml');
      }
    }));

    // Merge all successful XMLs
    const validXmls = xmls.filter(xml =>
      xml.documentElement && xml.documentElement.children.length > 0
    );
    
    if (validXmls.length === 0) {
      const error = new Error('No valid XML files could be loaded');
      if (window.errorHandler) {
        window.errorHandler.handleError({
          message: error.message,
          error: error,
          context: 'fetchAllXml',
          critical: true,
          userMessage: 'Keine Daten konnten geladen werden. Bitte Seite neu laden.'
        });
      }
      throw error;
    }
    
    const mergedXml = validXmls[0];
    const mergedRoot = mergedXml.documentElement;
    
    for (let i = 1; i < validXmls.length; i++) {
      const xml = validXmls[i];
      const root = xml.documentElement;
      while (root.firstChild) {
        mergedRoot.appendChild(root.firstChild);
      }
    }
    
    return mergedXml;
  } catch (error) {
    if (window.errorHandler) {
      window.errorHandler.handleError({
        message: `Error in fetchAllXml: ${error.message}`,
        error: error,
        context: 'fetchAllXml',
        critical: true
      });
    } else {
      console.error('Error in fetchAllXml:', error);
    }
    // Return minimal fallback XML
    return new DOMParser().parseFromString(
      '<root><error>Failed to load data</error></root>',
      'application/xml'
    );
  }
}

async function fetchDropdownData(lang) {
  if (!translations) {
    await loadTranslations();
  }

  let xml = await fetchAllXml();

  const nodesToCheck = ["label"];

  for (const nodeToCheck of nodesToCheck) {
    const nodeSnapshot = xml.evaluate(`//${nodeToCheck}`, xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = 0; i < nodeSnapshot.snapshotLength; i++) {
      const node = nodeSnapshot.snapshotItem(i);
      const label = node.textContent.trim();
      if (translations && translations[lang] && label in translations[lang]) {
        node.textContent = translations[lang][label];
      } 
    }
  }

  return xml;
}
window.fetchDropdownData = fetchDropdownData;