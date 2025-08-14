/**
 * PROMPT SEARCH ENGINE
 * Live search functionality for all prompts across XML files
 * Supports fuzzy search with real-time filtering
 */

class PromptSearchEngine {
  constructor() {
    this.promptIndex = [];
    this.isInitialized = false;
    this.debounceTimer = null;
    this.currentResults = [];
  }

  /**
   * Initialize the search engine by loading and indexing all XML data
   */
  async initialize() {
    try {
      if (this.isInitialized) return;
      
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("🔍 Initializing Prompt Search Engine...");
      }

      // Load all XML files and create searchable index
      await this.buildPromptIndex();
      this.isInitialized = true;
      
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log(`✅ Search engine initialized with ${this.promptIndex.length} prompts`);
      }
    } catch (error) {
      console.error("❌ Failed to initialize search engine:", error);
    }
  }

  /**
   * Build searchable index from all XML files
   */
  async buildPromptIndex() {
    this.promptIndex = [];
    
    // Get all XML files from settings
    const xmlFiles = window.XML_FILES || [
      'data_dropdowns.xml',
      'data_inputs.xml', 
      'data_checkboxes.xml',
      'data_dropdown_employee.xml',
      'data_dropdown_tasks.xml',
      'data_dropdown_clients.xml'
    ];
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("🔍 Indexing XML files:", xmlFiles);
    }
    
    // Index each XML file
    for (const xmlFile of xmlFiles) {
      try {
        await this.indexXMLFile(xmlFile);
      } catch (error) {
        console.warn(`⚠️ Failed to index ${xmlFile}:`, error.message);
        // Continue with other files
      }
    }
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log(`📊 Prompt index built with ${this.promptIndex.length} prompts from ${xmlFiles.length} files`);
    }
  }

  /**
   * Index any XML file - universal function
   */
  async indexXMLFile(filename) {
    try {
      const xmlData = await this.fetchXMLFile(filename);
      const fileType = this.getFileType(filename);
      
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log(`📁 Indexing ${filename} as ${fileType}`);
      }
      
      switch (fileType) {
        case 'dropdown':
          await this.indexDropdownsFromXML(xmlData, filename);
          break;
        case 'input':
          await this.indexInputsFromXML(xmlData, filename);
          break;
        case 'checkbox':
          await this.indexCheckboxesFromXML(xmlData, filename);
          break;
        default:
          // Try to auto-detect content
          await this.indexMixedContentFromXML(xmlData, filename);
          break;
      }
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('Failed to fetch')) {
        // File doesn't exist, skip silently
        return;
      }
      throw error;
    }
  }

  /**
   * Get file type from filename
   */
  getFileType(filename) {
    if (filename.includes('dropdown')) return 'dropdown';
    if (filename.includes('input')) return 'input';
    if (filename.includes('checkbox')) return 'checkbox';
    return 'mixed';
  }

  /**
   * Index dropdown content from XML
   */
  async indexDropdownsFromXML(xmlData, filename) {
    const dropdowns = xmlData.getElementsByTagName('dropdown');
    
    Array.from(dropdowns).forEach(dropdown => {
      const dropdownLabel = dropdown.querySelector('label')?.textContent?.trim() || 'Unknown';
      const options = dropdown.querySelectorAll('options option');
      
      Array.from(options).forEach(option => {
        const label = option.querySelector('label')?.textContent?.trim();
        const value = option.querySelector('value')?.textContent?.trim();
        
        if (label && value && label !== dropdownLabel) {
          // Create synonym-enhanced search text
          const searchText = this.enhanceSearchText(`${label} ${value}`);
          
          this.promptIndex.push({
            id: `dropdown-${Date.now()}-${Math.random()}`,
            type: 'dropdown',
            source: `${this.getSourceName(filename)}: ${dropdownLabel}`,
            title: label,
            content: value,
            searchText: searchText,
            preview: this.createPreview(value),
            filename: filename
          });
        }
      });
    });
  }

  /**
   * Index input content from XML
   */
  async indexInputsFromXML(xmlData, filename) {
    const inputs = xmlData.getElementsByTagName('input');
    
    Array.from(inputs).forEach(input => {
      const label = input.querySelector('label')?.textContent?.trim();
      const valueBefore = input.querySelector('valueBefore')?.textContent?.trim() || '';
      const valueAfter = input.querySelector('valueAfter')?.textContent?.trim() || '';
      
      if (label && (valueBefore || valueAfter)) {
        const content = `${valueBefore}[EINGABE]${valueAfter}`.trim();
        const searchText = this.enhanceSearchText(`${label} ${content}`);
        
        this.promptIndex.push({
          id: `input-${Date.now()}-${Math.random()}`,
          type: 'input',
          source: this.getSourceName(filename),
          title: label,
          content: content,
          searchText: searchText,
          preview: this.createPreview(content),
          valueBefore,
          valueAfter,
          filename: filename
        });
      }
    });
  }

  /**
   * Index checkbox content from XML
   */
  async indexCheckboxesFromXML(xmlData, filename) {
    const checkboxes = xmlData.getElementsByTagName('checkbox');
    
    Array.from(checkboxes).forEach(checkbox => {
      const label = checkbox.querySelector('label')?.textContent?.trim();
      const value = checkbox.querySelector('value')?.textContent?.trim();
      
      if (label && value) {
        const searchText = this.enhanceSearchText(`${label} ${value}`);
        
        this.promptIndex.push({
          id: `checkbox-${Date.now()}-${Math.random()}`,
          type: 'checkbox',
          source: this.getSourceName(filename),
          title: label,
          content: value,
          searchText: searchText,
          preview: this.createPreview(value),
          filename: filename
        });
      }
    });
  }

  /**
   * Index mixed content from XML (auto-detect)
   */
  async indexMixedContentFromXML(xmlData, filename) {
    // Try dropdowns first
    const dropdowns = xmlData.getElementsByTagName('dropdown');
    if (dropdowns.length > 0) {
      await this.indexDropdownsFromXML(xmlData, filename);
      return;
    }
    
    // Try inputs
    const inputs = xmlData.getElementsByTagName('input');
    if (inputs.length > 0) {
      await this.indexInputsFromXML(xmlData, filename);
      return;
    }
    
    // Try checkboxes
    const checkboxes = xmlData.getElementsByTagName('checkbox');
    if (checkboxes.length > 0) {
      await this.indexCheckboxesFromXML(xmlData, filename);
      return;
    }

    // Try dropdowns root element (for employee/tasks files)
    const rootDropdowns = xmlData.querySelector('dropdowns');
    if (rootDropdowns) {
      await this.indexDropdownsFromXML(xmlData, filename);
      return;
    }

    if (window.errorHandler && window.errorHandler.debugMode) {
      console.warn(`⚠️ No recognized content found in ${filename}`);
    }
  }

  /**
   * Get user-friendly source name from filename
   */
  getSourceName(filename) {
    const names = {
      'data_dropdowns.xml': 'Dropdowns',
      'data_inputs.xml': 'Inputs',
      'data_checkboxes.xml': 'Checkboxes',
      'data_dropdown_employee.xml': 'Mitarbeiter',
      'data_dropdown_tasks.xml': 'Aufgaben',
      'data_dropdown_clients.xml': 'Kunden'
    };
    return names[filename] || filename.replace('.xml', '').replace('data_', '');
  }

  /**
   * Enhance search text with synonyms and translations
   */
  enhanceSearchText(text) {
    const synonyms = {
      // German-English legal terms
      'lawyer': ['anwalt', 'rechtsanwalt', 'jurist', 'legal'],
      'anwalt': ['lawyer', 'rechtsanwalt', 'jurist', 'legal'],
      'rechtsanwalt': ['lawyer', 'anwalt', 'jurist', 'legal'],
      
      // German-English business terms  
      'business': ['geschäft', 'unternehmen', 'firma', 'betrieb'],
      'geschäft': ['business', 'unternehmen', 'firma', 'betrieb'],
      'unternehmen': ['business', 'geschäft', 'firma', 'company'],
      
      // Tax-related terms
      'tax': ['steuer', 'steuern', 'besteuerung', 'fiscal'],
      'steuer': ['tax', 'steuern', 'besteuerung', 'fiscal'],
      'steuern': ['tax', 'steuer', 'taxes', 'taxation'],
      
      // Coach terms
      'coach': ['trainer', 'berater', 'mentor', 'beratung'],
      'trainer': ['coach', 'berater', 'mentor'],
      'berater': ['coach', 'trainer', 'consultant', 'advisor'],
      'mentor': ['coach', 'trainer', 'berater', 'guide']
    };

    let enhancedText = text.toLowerCase();
    
    // Add synonyms for each word
    const words = text.toLowerCase().split(/\s+/);
    words.forEach(word => {
      // Remove punctuation for matching
      const cleanWord = word.replace(/[.,!?;:"()]/g, '');
      if (synonyms[cleanWord]) {
        enhancedText += ' ' + synonyms[cleanWord].join(' ');
      }
    });
    
    return enhancedText;
  }

  /**
   * Find specific synonym matches for stricter relevance
   */
  findSynonymMatches(searchTerm, prompt) {
    const synonyms = {
      // German-English legal terms
      'anwalt': ['lawyer', 'legal'],
      'rechtsanwalt': ['lawyer', 'legal'],
      'lawyer': ['anwalt', 'rechtsanwalt'],
      'legal': ['anwalt', 'rechtsanwalt', 'recht'],
      
      // German-English business terms  
      'steuer': ['tax', 'taxation'],
      'steuern': ['tax', 'taxes'],
      'tax': ['steuer', 'steuern'],
      'taxes': ['steuer', 'steuern'],
      
      // Coach terms
      'coach': ['trainer', 'berater'],
      'trainer': ['coach'],
      'berater': ['consultant', 'advisor']
    };

    const searchTermLower = searchTerm.toLowerCase();
    const matches = [];
    
    // Only check for exact synonym matches
    if (synonyms[searchTermLower]) {
      synonyms[searchTermLower].forEach(synonym => {
        if (prompt.title.toLowerCase().includes(synonym) || 
            prompt.content.toLowerCase().includes(synonym)) {
          matches.push(synonym);
        }
      });
    }
    
    return matches;
  }

  /**
   * Fetch and parse XML file
   */
  async fetchXMLFile(filename) {
    const response = await fetch(chrome.runtime.getURL(filename));
    const xmlText = await response.text();
    const parser = new DOMParser();
    return parser.parseFromString(xmlText, 'text/xml');
  }

  /**
   * Create preview text (first 100 characters)
   */
  createPreview(text) {
    if (!text) return '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  }

  /**
   * Perform search with debouncing
   */
  search(query, callback) {
    // Clear previous debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Debounce search for 300ms
    this.debounceTimer = setTimeout(() => {
      this.performSearch(query, callback);
    }, 300);
  }

  /**
   * Perform the actual search
   */
  performSearch(query, callback) {
    if (!this.isInitialized) {
      console.warn("⚠️ Search engine not initialized");
      callback([]);
      return;
    }

    if (!query || query.trim().length < 1) {
      this.currentResults = [];
      callback([]);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const enhancedQuery = this.enhanceSearchText(searchTerm);
    const queryWords = searchTerm.split(/\s+/).filter(w => w.length > 0);
    const results = [];

    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log(`🔍 Searching for: "${searchTerm}" (enhanced: "${enhancedQuery.substring(0, 50)}...")`);
    }

    // Enhanced search implementation with stricter relevance
    this.promptIndex.forEach(prompt => {
      let score = 0;
      let hasDirectMatch = false;
      
      // Check for direct matches first (original search term must appear somewhere)
      if (prompt.title.toLowerCase().includes(searchTerm) || 
          prompt.content.toLowerCase().includes(searchTerm)) {
        hasDirectMatch = true;
        
        // Exact title match gets highest score
        if (prompt.title.toLowerCase().includes(searchTerm)) {
          score += 150;
        }
        
        // Content match gets high score
        if (prompt.content.toLowerCase().includes(searchTerm)) {
          score += 120;
        }
      }
      
      // Check for synonym matches ONLY if we have a direct match OR if it's a known synonym
      if (!hasDirectMatch) {
        const synonymMatches = this.findSynonymMatches(searchTerm, prompt);
        if (synonymMatches.length > 0) {
          hasDirectMatch = true;
          score += 100; // Lower score for synonym matches
        }
      }
      
      // Only proceed with further scoring if we have a direct match
      if (hasDirectMatch) {
        // Enhanced search text match (includes synonyms)
        if (prompt.searchText.includes(searchTerm)) {
          score += 80;
        }
        
        // Fuzzy match for individual words (only for direct matches)
        queryWords.forEach(word => {
          if (word.length > 1) {
            // Partial matches within words
            if (prompt.searchText.includes(word)) {
              score += 40;
            }
            
            // Check if any word in the prompt starts with the query word
            const promptWords = prompt.searchText.split(/\s+/);
            promptWords.forEach(promptWord => {
              if (promptWord.startsWith(word)) {
                score += 30;
              }
            });
          }
        });
        
        // Source boost for employee/tasks (more specific content)
        if (prompt.filename && (prompt.filename.includes('employee') || prompt.filename.includes('tasks'))) {
          score += 10;
        }

        results.push({
          ...prompt,
          score
        });
      }
    });

    // Sort by score and limit to top 12 results
    results.sort((a, b) => b.score - a.score);
    this.currentResults = results.slice(0, 12);
    
    if (window.errorHandler && window.errorHandler.debugMode && this.currentResults.length > 0) {
      console.log(`✅ Found ${this.currentResults.length} results, top score: ${this.currentResults[0].score}`);
    }
    
    callback(this.currentResults);
  }

  /**
   * Get a prompt by ID
   */
  getPromptById(id) {
    return this.currentResults.find(prompt => prompt.id === id);
  }

  /**
   * Clear search results
   */
  clearResults() {
    this.currentResults = [];
  }
}

// Global instance
window.promptSearchEngine = new PromptSearchEngine();

/**
 * UI COMPONENT: Search Field and Results
 */
class PromptSearchUI {
  constructor() {
    this.searchContainer = null;
    this.searchInput = null;
    this.resultsContainer = null;
    this.isVisible = false;
  }

  /**
   * Create the search UI components
   */
  createSearchUI() {
    // Main search container
    this.searchContainer = document.createElement('div');
    this.searchContainer.className = 'prompt-search-container';
    
    // Search field wrapper
    const searchFieldWrapper = document.createElement('div');
    searchFieldWrapper.className = 'prompt-search-field-wrapper';
    
    // Search input
    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.className = 'prompt-search-input';
    this.searchInput.placeholder = '🔍 Prompts durchsuchen...';
    
    // Search icon (already in placeholder, but could be separate)
    searchFieldWrapper.appendChild(this.searchInput);
    
    // Results container
    this.resultsContainer = document.createElement('div');
    this.resultsContainer.className = 'prompt-search-results';
    this.resultsContainer.style.display = 'none';
    
    // Assemble components
    this.searchContainer.appendChild(searchFieldWrapper);
    this.searchContainer.appendChild(this.resultsContainer);
    
    this.attachEventListeners();
    
    return this.searchContainer;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Search input events
    this.searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      window.promptSearchEngine.search(query, (results) => {
        this.displayResults(results);
      });
    });

    // Focus events
    this.searchInput.addEventListener('focus', () => {
      if (this.searchInput.value.trim().length >= 2) {
        this.showResults();
      }
    });

    // Click outside to hide results
    document.addEventListener('click', (e) => {
      if (!this.searchContainer.contains(e.target)) {
        this.hideResults();
      }
    });

    // Escape key to hide results
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideResults();
        this.searchInput.blur();
      }
    });
  }

  /**
   * Display search results
   */
  displayResults(results) {
    this.resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
      if (this.searchInput.value.trim().length >= 2) {
        const noResults = document.createElement('div');
        noResults.className = 'prompt-search-no-results';
        noResults.textContent = 'Keine Prompts gefunden';
        this.resultsContainer.appendChild(noResults);
      }
      this.showResults();
      return;
    }

    results.forEach(prompt => {
      const resultItem = this.createResultItem(prompt);
      this.resultsContainer.appendChild(resultItem);
    });

    this.showResults();
  }

  /**
   * Create a result item element
   */
  createResultItem(prompt) {
    const item = document.createElement('div');
    item.className = 'prompt-search-result-item';
    item.dataset.promptId = prompt.id;
    
    const title = document.createElement('div');
    title.className = 'prompt-search-result-title';
    title.textContent = prompt.title;
    
    const source = document.createElement('div');
    source.className = 'prompt-search-result-source';
    source.textContent = prompt.source;
    
    const preview = document.createElement('div');
    preview.className = 'prompt-search-result-preview';
    preview.textContent = prompt.preview;
    
    item.appendChild(title);
    item.appendChild(source);
    item.appendChild(preview);
    
    // Click handler to insert prompt
    item.addEventListener('click', () => {
      this.insertPrompt(prompt);
      this.hideResults();
      this.searchInput.value = '';
    });
    
    return item;
  }

  /**
   * Insert selected prompt into the text field
   */
  insertPrompt(prompt) {
    try {
      const targetNode = document.querySelector(window.getSelector());
      if (!targetNode) {
        console.error("❌ Target text field not found");
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
        newContent = prompt.content + '\n\n' + currentContent;
      } else {
        newContent = prompt.content;
      }

      // Set the content
      if (targetNode.tagName.toLowerCase() === 'textarea' || targetNode.tagName.toLowerCase() === 'input') {
        targetNode.value = newContent;
      } else if (targetNode.contentEditable === 'true') {
        targetNode.textContent = newContent;
      }

      // Trigger events to notify the system
      targetNode.dispatchEvent(new Event('input', { bubbles: true }));
      targetNode.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Focus the target field
      targetNode.focus();

      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("✅ Prompt inserted:", prompt.title);
      }

      // Show success feedback
      this.showInsertionFeedback(prompt.title);

    } catch (error) {
      console.error("❌ Failed to insert prompt:", error);
    }
  }

  /**
   * Show feedback when a prompt is inserted
   */
  showInsertionFeedback(title) {
    const feedback = document.createElement('div');
    feedback.className = 'prompt-search-feedback';
    feedback.textContent = `✓ "${title}" eingefügt`;
    
    document.body.appendChild(feedback);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 3000);
  }

  /**
   * Show results container
   */
  showResults() {
    this.resultsContainer.style.display = 'block';
    this.isVisible = true;
  }

  /**
   * Hide results container
   */
  hideResults() {
    this.resultsContainer.style.display = 'none';
    this.isVisible = false;
  }

  /**
   * Clear search input and results
   */
  clear() {
    this.searchInput.value = '';
    this.resultsContainer.innerHTML = '';
    this.hideResults();
  }
}

// Global instance
window.promptSearchUI = new PromptSearchUI();

// Initialize search engine when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.promptSearchEngine.initialize();
  });
} else {
  window.promptSearchEngine.initialize();
}