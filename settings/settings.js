window.languageMapping = {
    'de': 'German',
    'en': 'English',
    'es': 'Spain',
    'ch': 'Schwitzerdütch',
    'sch': 'Schwäbisch',
    'fr': 'French',
    'it': 'Italian',
    'ru': 'Russian',
    'zh': 'Chinese',
    'th': 'Thai',
    'pt': 'Portuguese'
  };

  window.XML_FILES = [
    'data_dropdown_employee.xml',
    'data_dropdown_tasks.xml',
    'data_dropdowns.xml',
    'data_inputs.xml',
    'data_checkboxes.xml'
  ];

  window.SETTINGS = {
    LANGUAGE_DROPDOWN_OPTIONS: `
    <option value="en">🇺🇸 English</option>
    <option value="zh">🇨🇳 Chinese</option>
    <option value="es">🇪🇸 Spanish</option>
    <option value="hi">🇮🇳 Hindi</option>
    <option value="fr">🇫🇷 French</option>
    <option value="de">🇩🇪 German</option>
    <option value="ru">🇷🇺 Russian</option>
    <option value="pt">🇵🇹 Portuguese</option>
    <option value="it">🇮🇹 Italian</option>
    <option value="th">🇹🇭 Thai</option>
    <option value="">Dialects:</option>
    <option value="ch">🇨🇭 Switzerdütsch</option>
    <option value="by">💠 Bayrisch</option>
    <option value="sch">🇩🇪 Schwäbisch</option>
    `,
  };


  const attributionHTML = 'Supported by <a href="https://www.ritterwagner.de/?utm_source=promptEngineer&utm_medium=chromeExtension" tabindex="-1" <font style="text-decoration:underline;">RitterWagner</a> Germany. Developed with ❤ at night in Tenerife. <font style="text-decoration:underline;"><a href="https://ko-fi.com/42aidiaries" tabindex="-1">Donate A Coffee ☕️</a></font> or <font style="text-decoration:underline;"><a href="https://amzn.to/3qdpAY4" tabindex="-1">Free Affiliate Support</a></font>';






window.PLACEHOLDER_TEXT = 'Stelle irgendeine Frage';

window.PAGE_SETTINGS = [
    {
      url: "https://chatgpt.com/*",
      selectors: [
        'div[contenteditable="true"]',
        '[role="textbox"]',
        'textarea[placeholder]',
        'textarea[data-id]',
        '#prompt-textarea',
        'textarea:not([readonly])',
        'form textarea',
        'textarea[placeholder*="message"]',
        'textarea[placeholder*="Message"]',
        'textarea[placeholder*="Send"]',
        '[data-testid*="prompt"]',
        'textarea[rows]',
        'main textarea',
        'form div[contenteditable="true"]'
      ]
    },
    {
      url: "https://bing.com/*",
      selectors: ['#searchboxform']
    },
    {
      url: "https://bard.google.com/*",
      selectors: ['#mat-input-0']
    },
  ];
  
  // ChatGPT-specific detection function
  window.detectChatGPTTextfield = function() {
    console.log("🎯 Spezielle ChatGPT-Erkennung gestartet...");
    
    // ChatGPT-spezifische Muster
    const chatgptPatterns = [
      'textarea[placeholder*="message"]',
      'textarea[placeholder*="Message"]', 
      'textarea[placeholder*="Send"]',
      'textarea[placeholder*="Type"]',
      '[data-testid*="prompt"]',
      '[data-id*="prompt"]',
      'textarea[rows]', // ChatGPT oft mit rows-Attribut
      'main textarea', // Oft im main-Element
      'form textarea:last-of-type' // Meist letztes textarea in Form
    ];
    
    for (let pattern of chatgptPatterns) {
      const elements = document.querySelectorAll(pattern);
      for (let element of elements) {
        if (isVisible(element) && element.offsetHeight > 30) {
          console.log("✅ ChatGPT-Pattern gefunden:", pattern, element);
          return generateSelector(element);
        }
      }
    }
    
    // Suche nach Elementen in der unteren Bildschirmhälfte
    const textareas = document.querySelectorAll('textarea');
    const midHeight = window.innerHeight / 2;
    
    for (let textarea of textareas) {
      const rect = textarea.getBoundingClientRect();
      if (rect.top > midHeight && isVisible(textarea)) {
        console.log("✅ Textarea in unterer Bildschirmhälfte gefunden:", textarea);
        return generateSelector(textarea);
      }
    }
    
    console.log("❌ Keine ChatGPT-spezifische Erkennung möglich");
    return null;
  };
  
  // Helper function to check if element is visible
  function isVisible(element) {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    // Check basic visibility
    if (style.display === 'none' || 
        style.visibility === 'hidden' || 
        style.opacity === '0' ||
        element.offsetParent === null) {
      return false;
    }
    
    // Check if element has dimensions
    if (rect.width === 0 || rect.height === 0) {
      return false;
    }
    
    // Check if element is in viewport (at least partially)
    if (rect.bottom < 0 || rect.top > window.innerHeight ||
        rect.right < 0 || rect.left > window.innerWidth) {
      return false;
    }
    
    return true;
  }

  // Robust textfield detection function
  window.detectMainTextfield = function() {
    console.log("🔍 Allgemeine Textfeld-Erkennung gestartet...");
    
    // Zuerst ChatGPT-spezifische Erkennung versuchen
    if (window.location.href.includes('chatgpt.com')) {
      const chatgptResult = window.detectChatGPTTextfield();
      if (chatgptResult) {
        return chatgptResult;
      }
    }
    
    const candidates = [];
    
    // Get all possible input elements
    const textareas = Array.from(document.querySelectorAll('textarea'));
    const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
    const contentEditables = Array.from(document.querySelectorAll('[contenteditable="true"]'));
    
    const allElements = [...textareas, ...inputs, ...contentEditables];
    
    allElements.forEach(element => {
      // Skip if element is not visible
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || element.offsetParent === null) {
        return;
      }
      
      const rect = element.getBoundingClientRect();
      
      // Skip very small elements
      if (rect.width < 100 || rect.height < 30) {
        return;
      }
      
      let score = 0;
      
      // Size scoring (40% weight) - larger elements get higher score
      const area = rect.width * rect.height;
      score += Math.min(area / 50000, 40); // Cap at 40 points
      
      // Position scoring (30% weight) - elements closer to center get higher score
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const elementCenterX = rect.left + rect.width / 2;
      const elementCenterY = rect.top + rect.height / 2;
      
      const distanceFromCenter = Math.sqrt(
        Math.pow(elementCenterX - centerX, 2) + Math.pow(elementCenterY - centerY, 2)
      );
      const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
      score += (1 - (distanceFromCenter / maxDistance)) * 30;
      
      // Visibility scoring (20% weight)
      if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
        score += 20; // Fully visible
      } else if (rect.top < window.innerHeight && rect.bottom > 0) {
        score += 10; // Partially visible
      }
      
      // Element type scoring (10% weight)
      if (element.tagName.toLowerCase() === 'textarea') {
        score += 10; // Prefer textareas
      } else if (element.tagName.toLowerCase() === 'input') {
        score += 5;
      }
      
      candidates.push({
        element: element,
        score: score,
        selector: generateSelector(element)
      });
    });
    
    // Sort by score and return the best candidate
    candidates.sort((a, b) => b.score - a.score);
    
    if (candidates.length > 0) {
      return candidates[0].selector;
    }
    
    return null;
  };
  
  // Generate a unique selector for an element
  function generateSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.length > 0);
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
      }
    }
    
    // Fallback to tag name with nth-child
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(child => child.tagName === element.tagName);
      const index = siblings.indexOf(element) + 1;
      return `${element.tagName.toLowerCase()}:nth-child(${index})`;
    }
    
    return element.tagName.toLowerCase();
  }

  // Updated getSelector with comprehensive debug system
  window.getSelector = function() {
      const url = window.location.href;
      
      // Debug-Ausgabe starten
      console.group("🤖 PromptEngineer: Textfeld-Erkennung");
      console.log("URL:", url);

      // First try the predefined selectors
      for (let i = 0; i < window.PAGE_SETTINGS.length; i++) {
          const pageSetting = window.PAGE_SETTINGS[i];
          if (url.match(new RegExp(pageSetting.url.replace(/\*/g, ".*")))) {
              console.log("📍 Gefundene Seitenregel für:", pageSetting.url);
              
              // Try all selectors for this page
              if (pageSetting.selectors) {
                  for (let j = 0; j < pageSetting.selectors.length; j++) {
                      const selector = pageSetting.selectors[j];
                      const element = document.querySelector(selector);
                      if (element) {
                          // Check if element is actually visible
                          const isElementVisible = isVisible(element);
                          console.log("🔍 Element gefunden mit Selector:", selector);
                          console.log("📋 Element:", element);
                          console.log("👁️ Sichtbar:", isElementVisible);
                          
                          if (isElementVisible) {
                              console.log("✅ Sichtbares Textfeld gefunden!");
                              console.groupEnd();
                              return selector;
                          } else {
                              console.log("⚠️ Element ist versteckt (display:none, visibility:hidden, etc.)");
                          }
                      } else {
                          console.log("❌ Selector funktioniert nicht:", selector);
                      }
                  }
              } else if (pageSetting.selector) {
                  // Legacy support for single selector
                  const element = document.querySelector(pageSetting.selector);
                  if (element && isVisible(element)) {
                      console.log("✅ Legacy-Selector erfolgreich:", pageSetting.selector);
                      console.groupEnd();
                      return pageSetting.selector;
                  } else {
                      console.log("❌ Legacy-Selector fehlgeschlagen oder Element versteckt:", pageSetting.selector);
                  }
              }
          }
      }

      console.log("⚡ Versuche Auto-Detection...");
      // Fallback to auto-detection
      const autoSelector = window.detectMainTextfield();
      if (autoSelector) {
          console.log("✅ Auto-Detection erfolgreich:", autoSelector);
          console.groupEnd();
          return autoSelector;
      }

      // Fehler-Fall - umfassende Debug-Ausgabe
      console.error("❌ Kein Textfeld gefunden!");
      console.log("🔍 Debug-Informationen:");
      console.log("Available textareas:", document.querySelectorAll('textarea'));
      console.log("Available text inputs:", document.querySelectorAll('input[type="text"]'));
      console.log("Available contenteditable:", document.querySelectorAll('[contenteditable="true"]'));
      console.log("Available role=textbox:", document.querySelectorAll('[role="textbox"]'));
      
      console.log("💡 Manuelle Selektoren zum Testen:");
      document.querySelectorAll('textarea').forEach((el, i) => {
          console.log(`textarea ${i+1}:`, generateSelector(el));
      });
      
      console.groupEnd();
      return "";
  };

