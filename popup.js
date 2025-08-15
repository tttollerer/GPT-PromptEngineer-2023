/**
 * PromptEngineer XML Editor - Popup Script
 * Provides a complete XML editor interface for managing prompt templates
 */

class XMLEditor {
  constructor() {
    this.xmlFiles = [
      { name: 'data_dropdowns.xml', icon: this.getIcon('file-text'), size: 0 },
      { name: 'data_inputs.xml', icon: this.getIcon('edit'), size: 0 },
      { name: 'data_checkboxes.xml', icon: this.getIcon('check-square'), size: 0 },
      { name: 'data_dropdown_employee.xml', icon: this.getIcon('users'), size: 0 },
      { name: 'data_dropdown_tasks.xml', icon: this.getIcon('list'), size: 0 }
    ];
    
    this.currentFile = null;
    this.editor = null;
    this.isModified = false;
    this.originalContent = '';
    this.isVisualMode = false;
    this.xmlTree = null;
    this.parsedData = null;
    
    this.init();
  }
  
  getIcon(name) {
    const icons = {
      'file-text': '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>',
      'edit': '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
      'check-square': '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9,11 12,14 22,4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
      'users': '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      'list': '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
      'file': '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>',
      'refresh-cw': '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
      'save': '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>',
      'upload': '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
      'external-link': '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
      'rotate-ccw': '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>'
    };
    
    return icons[name] || icons['file'];
  }
  
  async init() {
    console.log('[XMLEditor] Initializing...');
    
    // Show loading
    this.showLoading('XML Editor wird geladen...');
    
    try {
      // Initialize theme
      this.initializeTheme();
      
      // Wait for XML Editor to be ready
      await this.waitForXMLEditor();
      
      // Initialize UI
      this.initializeUI();
      
      // Load file sizes
      await this.loadFileSizes();
      
      // Populate file dropdown
      this.populateFileDropdown();
      
      // Update connection status
      this.updateConnectionStatus('connected', 'Bereit');
      
      console.log('[XMLEditor] Initialization complete');
      
    } catch (error) {
      console.error('[XMLEditor] Initialization failed:', error);
      this.updateConnectionStatus('error', 'Fehler');
      this.showNotification('Fehler beim Laden der XML-Editor Komponenten', 'error');
    } finally {
      this.hideLoading();
    }
  }
  
  initializeTheme() {
    // Load saved theme preference or use system preference
    chrome.storage.local.get(['editorTheme'], (result) => {
      const savedTheme = result.editorTheme;
      
      if (savedTheme) {
        this.setTheme(savedTheme);
      } else {
        // Use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(prefersDark ? 'dark' : 'light');
      }
    });
    
    // Theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        chrome.storage.local.set({ editorTheme: newTheme });
      });
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only auto-switch if no manual preference is saved
      chrome.storage.local.get(['editorTheme'], (result) => {
        if (!result.editorTheme) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    });
  }
  
  setTheme(theme) {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    if (theme === 'dark') {
      body.classList.add('dark-theme');
      // Moon icon for dark mode
      if (themeIcon) {
        themeIcon.innerHTML = '<path d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.64 6.35,17.66C9.37,20.67 14.19,20.78 17.33,17.97Z" fill="currentColor"/>';
      }
    } else {
      body.classList.remove('dark-theme');
      // Sun icon for light mode
      if (themeIcon) {
        themeIcon.innerHTML = '<path d="M12,18V6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,15.31L23.31,12L20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31Z" fill="currentColor"/>';
      }
    }
    
    // Update editor theme if it exists
    if (this.editor) {
      if (typeof this.editor.setTheme === 'function') {
        // AdvancedXMLEditor theme switching
        this.editor.setTheme(theme);
      } else if (this.currentFile) {
        // Fallback: recreate editor with new theme
        const content = this.getEditorContent();
        this.createEditor(content);
      }
    }
  }
  
  waitForXMLEditor() {
    return new Promise((resolve) => {
      if (window.AdvancedXMLEditor) {
        console.log('✅ AdvancedXMLEditor available');
        resolve();
      } else {
        // Wait a bit for script to load
        setTimeout(() => {
          if (window.AdvancedXMLEditor) {
            console.log('✅ AdvancedXMLEditor loaded successfully');
          } else {
            console.warn('⚠️ AdvancedXMLEditor not available, using fallback');
          }
          resolve();
        }, 100);
      }
    });
  }
  
  initializeUI() {
    // Initialize resizable window if opened in a new window
    this.initializeResize();
    
    // File dropdown change handler
    const fileDropdown = document.getElementById('file-dropdown');
    fileDropdown.addEventListener('change', (e) => {
      const fileName = e.target.value;
      if (fileName) {
        this.loadFile(fileName);
      }
    });
    
    // Toolbar buttons
    document.getElementById('refresh-files-header').addEventListener('click', () => this.refreshFiles());
    document.getElementById('format-xml').addEventListener('click', () => this.formatXML());
    document.getElementById('validate-xml').addEventListener('click', () => this.validateXML());
    
    // New toolbar buttons
    document.getElementById('toggle-xml-tree').addEventListener('click', () => this.toggleXMLTree());
    document.getElementById('toggle-visual-mode').addEventListener('click', () => this.toggleVisualMode());
    document.getElementById('test-prompt').addEventListener('click', () => this.testPrompt());
    
    // Action buttons
    document.getElementById('save-file').addEventListener('click', () => this.saveFile());
    document.getElementById('reset-file').addEventListener('click', () => this.resetFile());
    document.getElementById('export-all').addEventListener('click', () => this.exportAll());
    
    // Tab close
    document.querySelector('.tab-close').addEventListener('click', () => this.closeFile());
    
    // Tree panel controls
    document.getElementById('expand-all-tree').addEventListener('click', () => this.expandAllTreeNodes());
    document.getElementById('collapse-all-tree').addEventListener('click', () => this.collapseAllTreeNodes());
    document.getElementById('toggle-tree-panel').addEventListener('click', () => this.toggleXMLTree());
    
    // Preview panel controls
    document.getElementById('close-preview').addEventListener('click', () => this.closeLivePreview());
    
    // Visual editor element buttons
    document.querySelectorAll('.element-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const type = e.currentTarget.dataset.type;
        this.addVisualElement(type);
      });
    });
    
    // Handle beforeunload for unsaved changes
    window.addEventListener('beforeunload', (e) => {
      if (this.isModified) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }
  
  initializeResize() {
    // Check if we're in a popup window (not the extension popup)
    const isInWindow = window.opener === null && window.top === window.self;
    
    if (!isInWindow) {
      // In extension popup - add resize handle for manual resize
      this.addResizeHandle();
    } else {
      // In separate window - track window size changes
      this.trackWindowSize();
    }
  }
  
  addResizeHandle() {
    const container = document.querySelector('.popup-container');
    
    // Create resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    resizeHandle.innerHTML = `
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14m-7-7h14"/>
      </svg>
    `;
    resizeHandle.style.cssText = `
      position: absolute;
      bottom: 0;
      right: 0;
      width: 20px;
      height: 20px;
      cursor: nwse-resize;
      background: var(--border);
      border-radius: 0 0 var(--radius) 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: var(--text-muted);
      user-select: none;
      z-index: 1000;
    `;
    
    container.appendChild(resizeHandle);
    container.style.position = 'relative';
    
    // Load saved dimensions
    chrome.storage.local.get(['popupWidth', 'popupHeight'], (result) => {
      if (result.popupWidth && result.popupHeight) {
        // Only apply saved dimensions in popup mode
        const isInWindow = window.opener === null && window.top === window.self;
        if (!isInWindow) {
          container.style.width = result.popupWidth + 'px';
          container.style.height = result.popupHeight + 'px';
          document.body.style.width = result.popupWidth + 'px';
          document.body.style.height = result.popupHeight + 'px';
        }
      }
    });
    
    // Resize logic
    let isResizing = false;
    let startX, startY, startWidth, startHeight;
    
    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(document.defaultView.getComputedStyle(container).width, 10);
      startHeight = parseInt(document.defaultView.getComputedStyle(container).height, 10);
      
      document.body.style.cursor = 'nwse-resize';
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      
      const width = Math.min(Math.max(600, startWidth + e.clientX - startX), 1400);
      const height = Math.min(Math.max(400, startHeight + e.clientY - startY), 900);
      
      container.style.width = width + 'px';
      container.style.height = height + 'px';
      document.body.style.width = width + 'px';
      document.body.style.height = height + 'px';
    });
    
    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = '';
        
        // Save dimensions
        const width = parseInt(container.style.width, 10);
        const height = parseInt(container.style.height, 10);
        chrome.storage.local.set({ 
          popupWidth: width, 
          popupHeight: height 
        });
      }
    });
  }
  
  trackWindowSize() {
    // For separate window mode - track and save window dimensions
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        chrome.storage.local.set({
          editorWindowWidth: window.outerWidth,
          editorWindowHeight: window.outerHeight
        });
      }, 500);
    });
  }
  
  async loadFileSizes() {
    try {
      for (const file of this.xmlFiles) {
        try {
          const content = await this.fetchFileContent(file.name);
          file.size = new Blob([content]).size;
        } catch (error) {
          console.warn(`Could not load ${file.name}:`, error);
          file.size = 0;
        }
      }
    } catch (error) {
      console.error('Error loading file sizes:', error);
    }
  }
  
  populateFileDropdown() {
    const fileDropdown = document.getElementById('file-dropdown');
    
    // Clear existing options except the first one
    fileDropdown.innerHTML = '<option value="">Datei auswählen...</option>';
    
    this.xmlFiles.forEach(file => {
      const option = document.createElement('option');
      option.value = file.name;
      option.textContent = `${file.name} (${this.formatFileSize(file.size)})`;
      fileDropdown.appendChild(option);
    });
  }
  
  async loadFile(fileName) {
    if (this.isModified) {
      const shouldContinue = confirm('Es gibt ungespeicherte Änderungen. Möchten Sie trotzdem fortfahren?');
      if (!shouldContinue) return;
    }
    
    console.log(`📂 Loading file: ${fileName}`);
    
    this.showLoading(`Lade ${fileName}...`);
    
    try {
      const content = await this.fetchFileContent(fileName);
      
      this.currentFile = fileName;
      this.originalContent = content;
      this.isModified = false;
      
      // Update UI
      this.updateFileTab(fileName);
      this.updateActiveFile(fileName);
      this.createEditor(content);
      this.updateSaveButton(false);
      this.updateStatusBar();
      
      console.log(`✅ File loaded: ${fileName}`);
      
      // Show success notification
      setTimeout(() => {
        this.showNotification(`📄 ${fileName} erfolgreich geladen`, 'success');
      }, 500);
      
    } catch (error) {
      console.error(`❌ Failed to load ${fileName}:`, error);
      this.showNotification(`Fehler beim Laden von ${fileName}`, 'error');
    } finally {
      this.hideLoading();
    }
  }
  
  async fetchFileContent(fileName) {
    console.log(`🔍 Fetching content for: ${fileName}`);
    
    try {
      // First try to load from chrome storage (user modifications)
      const result = await chrome.storage.local.get(fileName);
      if (result[fileName]) {
        console.log(`📦 Loaded ${fileName} from storage`);
        return result[fileName];
      }
      
      // Fallback to original file - try multiple approaches
      const fileUrl = chrome.runtime.getURL(fileName);
      console.log(`🌐 Attempting to fetch from URL: ${fileUrl}`);
      
      const response = await fetch(fileUrl);
      console.log(`📡 Fetch response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      console.log(`📁 Successfully loaded ${fileName} from extension (${content.length} chars)`);
      
      // Validate that we got actual XML content
      if (!content.trim().startsWith('<?xml') && !content.trim().startsWith('<')) {
        throw new Error(`Invalid XML content received for ${fileName}`);
      }
      
      return content;
      
    } catch (error) {
      console.error(`❌ Error fetching ${fileName}:`, error);
      console.error(`Full error details:`, {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Return minimal XML structure as fallback
      const fallbackContent = this.getFallbackContent(fileName);
      console.log(`🔄 Using fallback content for ${fileName} (${fallbackContent.length} chars)`);
      
      // Show warning notification that fallback is being used
      setTimeout(() => {
        this.showNotification(
          `⚠️ ${fileName} konnte nicht geladen werden - verwende Standard-Template`,
          'warning'
        );
      }, 1000);
      
      return fallbackContent;
    }
  }
  
  getFallbackContent(fileName) {
    console.log(`🔧 Generating fallback content for: ${fileName}`);
    
    // Special handling for employee dropdown
    if (fileName.includes('employee')) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<data>
  <dropdowns>
    <dropdown>
      <label>Mitarbeiter Rollen</label>
      <id>employee_roles</id>
      <options>
        <option>
          <label>Geschäftsführer</label>
          <value>Als Geschäftsführer mit langjähriger Erfahrung in der Unternehmensführung</value>
          <id>ceo</id>
          <additionals></additionals>
          <additionalsHide />
        </option>
        <option>
          <label>Marketing Manager</label>
          <value>Als erfahrener Marketing Manager mit Fokus auf digitale Strategien</value>
          <id>marketing_manager</id>
          <additionals></additionals>
          <additionalsHide />
        </option>
        <option>
          <label>Software Entwickler</label>
          <value>Als Senior Software Developer mit Expertise in modernen Technologien</value>
          <id>developer</id>
          <additionals></additionals>
          <additionalsHide />
        </option>
      </options>
    </dropdown>
  </dropdowns>
</data>`;
    }
    
    // Special handling for tasks dropdown  
    if (fileName.includes('tasks')) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<data>
  <dropdowns>
    <dropdown>
      <label>Aufgaben</label>
      <id>common_tasks</id>
      <options>
        <option>
          <label>E-Mail schreiben</label>
          <value>Verfasse eine professionelle E-Mail</value>
          <id>email</id>
          <additionals></additionals>
          <additionalsHide />
        </option>
        <option>
          <label>Präsentation erstellen</label>
          <value>Erstelle eine überzeugende Präsentation</value>
          <id>presentation</id>
          <additionals></additionals>
          <additionalsHide />
        </option>
        <option>
          <label>Bericht schreiben</label>
          <value>Schreibe einen detaillierten Bericht</value>
          <id>report</id>
          <additionals></additionals>
          <additionalsHide />
        </option>
      </options>
    </dropdown>
  </dropdowns>
</data>`;
    }
    
    // Generic dropdown fallback
    if (fileName.includes('dropdown')) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<data>
  <dropdowns>
    <dropdown>
      <label>Beispiel Dropdown</label>
      <id>example</id>
      <options>
        <option>
          <label>Option 1</label>
          <value>Dies ist ein Beispiel-Prompt für Option 1</value>
          <id>option1</id>
          <additionals></additionals>
          <additionalsHide />
        </option>
        <option>
          <label>Option 2</label>
          <value>Dies ist ein Beispiel-Prompt für Option 2</value>
          <id>option2</id>
          <additionals></additionals>
          <additionalsHide />
        </option>
      </options>
    </dropdown>
  </dropdowns>
</data>`;
    } else if (fileName.includes('input')) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<data>
  <inputs>
    <input>
      <label>Beispiel Input</label>
      <id>example_input</id>
      <class>prompt-generator-input</class>
      <valueBefore>Text davor: </valueBefore>
      <valueAfter>. Text danach</valueAfter>
    </input>
  </inputs>
</data>`;
    } else if (fileName.includes('checkbox')) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<data>
  <checkboxes>
    <checkbox>
      <label>Beispiel Checkbox</label>
      <id>example_checkbox</id>
      <value>Zusätzlicher Prompt-Text für diese Checkbox-Option</value>
      <additionals></additionals>
      <additionalsHide />
    </checkbox>
  </checkboxes>
</data>`;
    }
    
    // Default fallback
    return `<?xml version="1.0" encoding="UTF-8"?>
<data>
  <!-- ${fileName} - Fallback-Template -->
  <!-- Datei konnte nicht geladen werden - verwende Standard-Vorlage -->
  <dropdowns>
    <dropdown>
      <label>Standard Vorlage</label>
      <id>fallback</id>
      <options>
        <option>
          <label>Beispiel Option</label>
          <value>Dies ist ein Fallback-Prompt für ${fileName}</value>
          <id>fallback_option</id>
          <additionals></additionals>
          <additionalsHide />
        </option>
      </options>
    </dropdown>
  </dropdowns>
</data>`;
  }
  
  createEditor(content) {
    const codeEditorView = document.getElementById('code-editor-view');
    
    // Clear existing editor
    codeEditorView.innerHTML = '';
    
    // Create Advanced XML Editor
    try {
      if (window.AdvancedXMLEditor) {
        console.log('✅ Creating AdvancedXMLEditor');
        
        // Determine theme
        const isDark = document.body.classList.contains('dark-theme');
        
        this.editor = new AdvancedXMLEditor(codeEditorView, {
          theme: isDark ? 'dark' : 'light',
          lineNumbers: true,
          syntaxHighlighting: true,
          wordWrap: true,
          autoIndent: true,
          validateXML: true,
          placeholder: 'XML Inhalt hier eingeben...'
        });
        
        // Set content
        this.editor.setValue(content || '');
        
        // Add change listener
        this.editor.on('change', () => {
          this.onContentChanged();
          // Update tree view if visible
          if (document.getElementById('xml-tree-panel').style.display !== 'none') {
            this.buildXMLTree();
          }
        });
        
        // Listen for cursor changes for status bar
        codeEditorView.addEventListener('xmleditor-cursorchange', (e) => {
          this.updateStatusBar();
        });
        
        console.log('✅ AdvancedXMLEditor created successfully');
        
      } else {
        throw new Error('AdvancedXMLEditor not available');
      }
      
    } catch (error) {
      console.error('❌ Failed to create AdvancedXMLEditor:', error);
      this.createFallbackEditor(content, codeEditorView);
    }
  }
  
  createFallbackEditor(content, container) {
    // Fallback to simple textarea if CodeMirror fails
    console.log('🔄 Using fallback textarea editor');
    
    // Clear container first
    const placeholder = container.querySelector('.editor-placeholder');
    if (placeholder) {
      placeholder.remove();
    }
    
    const textarea = document.createElement('textarea');
    textarea.className = 'fallback-editor';
    textarea.value = content;
    textarea.placeholder = 'XML Inhalt hier eingeben...';
    
    // Apply theme-aware styling
    const isDark = document.body.classList.contains('dark-theme');
    textarea.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      resize: none;
      padding: 16px;
      font-family: Monaco, Menlo, 'Ubuntu Mono', monospace;
      font-size: 13px;
      line-height: 1.4;
      outline: none;
      background: ${isDark ? '#1e1e1e' : '#fafafa'};
      color: ${isDark ? '#d4d4d4' : '#333'};
      box-sizing: border-box;
    `;
    
    textarea.addEventListener('input', () => this.onContentChanged());
    
    container.appendChild(textarea);
    this.editor = { 
      getValue: () => textarea.value, 
      setValue: (val) => textarea.value = val,
      dispatch: () => {}, // Dummy for compatibility
      dom: textarea
    };
    
    // Show notification about fallback mode
    this.showNotification('Editor läuft im Kompatibilitätsmodus', 'warning');
  }
  
  onContentChanged() {
    const currentContent = this.editor.getValue ? this.editor.getValue() : this.getEditorContent();
    this.isModified = currentContent !== this.originalContent;
    
    this.updateSaveButton(this.isModified);
    this.updateFileTab(this.currentFile, this.isModified);
    this.updateStatusBar();
    
    // Auto-validate on change (debounced)
    clearTimeout(this.validateTimeout);
    this.validateTimeout = setTimeout(() => {
      this.validateXML(false); // Silent validation
    }, 1000);
  }
  
  getEditorContent() {
    if (this.editor && this.editor.getValue) {
      // AdvancedXMLEditor or fallback editor
      return this.editor.getValue();
    }
    return '';
  }
  
  setEditorContent(content) {
    if (this.editor && this.editor.setValue) {
      // AdvancedXMLEditor or fallback editor
      this.editor.setValue(content);
    }
  }
  
  async saveFile() {
    if (!this.currentFile || !this.isModified) return;
    
    console.log(`💾 Saving file: ${this.currentFile}`);
    
    this.showLoading(`Speichere ${this.currentFile}...`);
    
    try {
      const content = this.getEditorContent();
      
      // Validate before saving
      const validation = this.performXMLValidation(content);
      if (!validation.isValid) {
        const shouldContinue = confirm(`Das XML ist nicht gültig:\\n${validation.errors.join('\\n')}\\n\\nTrotzdem speichern?`);
        if (!shouldContinue) {
          this.hideLoading();
          return;
        }
      }
      
      // Save to chrome storage
      await chrome.storage.local.set({ [this.currentFile]: content });
      
      this.originalContent = content;
      this.isModified = false;
      
      this.updateSaveButton(false);
      this.updateFileTab(this.currentFile, false);
      
      // Update file size in list
      const file = this.xmlFiles.find(f => f.name === this.currentFile);
      if (file) {
        file.size = new Blob([content]).size;
        this.populateFileDropdown();
        this.updateActiveFile(this.currentFile);
      }
      
      this.showNotification(`${this.currentFile} erfolgreich gespeichert`, 'success');
      console.log(`✅ File saved: ${this.currentFile}`);
      
    } catch (error) {
      console.error(`❌ Failed to save ${this.currentFile}:`, error);
      this.showNotification(`Fehler beim Speichern von ${this.currentFile}`, 'error');
    } finally {
      this.hideLoading();
    }
  }
  
  async resetFile() {
    if (!this.currentFile) return;
    
    const shouldReset = confirm(`Möchten Sie ${this.currentFile} auf den ursprünglichen Zustand zurücksetzen? Alle Änderungen gehen verloren.`);
    if (!shouldReset) return;
    
    console.log(`🔄 Resetting file: ${this.currentFile}`);
    
    try {
      // Remove from chrome storage to fall back to original
      await chrome.storage.local.remove(this.currentFile);
      
      // Reload the file
      await this.loadFile(this.currentFile);
      
      this.showNotification(`${this.currentFile} wurde zurückgesetzt`, 'success');
      
    } catch (error) {
      console.error(`❌ Failed to reset ${this.currentFile}:`, error);
      this.showNotification(`Fehler beim Zurücksetzen von ${this.currentFile}`, 'error');
    }
  }
  
  validateXML(showNotification = true) {
    const content = this.getEditorContent();
    const validation = this.performXMLValidation(content);
    
    const statusElement = document.getElementById('validation-status');
    
    if (validation.isValid) {
      statusElement.textContent = '✅ Gültiges XML';
      statusElement.className = 'status-item success';
      
      if (showNotification) {
        this.showNotification('XML ist gültig', 'success');
      }
    } else {
      statusElement.textContent = '❌ Ungültiges XML';
      statusElement.className = 'status-item error';
      statusElement.title = validation.errors.join('\\n');
      
      if (showNotification) {
        this.showNotification(`XML-Validierung fehlgeschlagen: ${validation.errors[0]}`, 'error');
      }
    }
    
    return validation;
  }
  
  performXMLValidation(content) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'application/xml');
      
      const errors = [];
      
      // Check for parser errors
      const parserError = xmlDoc.getElementsByTagName('parsererror');
      if (parserError.length > 0) {
        errors.push('XML-Parser-Fehler: ' + parserError[0].textContent);
      }
      
      // Basic structure validation
      const rootElement = xmlDoc.documentElement;
      if (!rootElement) {
        errors.push('Kein Root-Element gefunden');
      } else if (rootElement.tagName !== 'data') {
        errors.push('Root-Element sollte <data> sein');
      }
      
      return {
        isValid: errors.length === 0,
        errors: errors
      };
      
    } catch (error) {
      return {
        isValid: false,
        errors: ['XML-Parsing-Fehler: ' + error.message]
      };
    }
  }
  
  formatXML() {
    try {
      // Use the new editor's built-in format functionality if available
      if (this.editor && typeof this.editor.formatXML === 'function') {
        const success = this.editor.formatXML();
        if (success) {
          this.showNotification('XML formatiert', 'success');
        } else {
          this.showNotification('Kann XML nicht formatieren: Ungültiges XML', 'error');
        }
        return;
      }
      
      // Fallback to manual formatting
      const content = this.getEditorContent();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'application/xml');
      
      // Check if parsing was successful
      if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
        this.showNotification('Kann XML nicht formatieren: Ungültiges XML', 'error');
        return;
      }
      
      // Format the XML
      const formatted = this.formatXMLString(xmlDoc);
      this.setEditorContent(formatted);
      
      this.showNotification('XML formatiert', 'success');
      
    } catch (error) {
      console.error('Error formatting XML:', error);
      this.showNotification('Fehler beim Formatieren des XML', 'error');
    }
  }
  
  formatXMLString(xmlDoc) {
    const serializer = new XMLSerializer();
    let xmlString = serializer.serializeToString(xmlDoc);
    
    // Simple formatting (not perfect but functional)
    xmlString = xmlString.replace(/></g, '>\\n<');
    
    const formatted = [];
    const lines = xmlString.split('\\n');
    let indent = 0;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed) {
        if (trimmed.startsWith('</')) {
          indent = Math.max(0, indent - 1);
        }
        
        formatted.push('  '.repeat(indent) + trimmed);
        
        if (trimmed.startsWith('<') && !trimmed.endsWith('/>') && !trimmed.startsWith('</')) {
          indent++;
        }
      }
    });
    
    return formatted.join('\\n');
  }
  
  async exportAll() {
    console.log('📤 Exporting all XML files...');
    
    this.showLoading('Exportiere alle XML-Dateien...');
    
    try {
      const zip = new JSZip(); // Note: Would need to include JSZip library
      
      for (const file of this.xmlFiles) {
        const content = await this.fetchFileContent(file.name);
        zip.file(file.name, content);
      }
      
      const blob = await zip.generateAsync({ type: 'blob' });
      
      // Download the ZIP file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'promptengineer-xml-files.zip';
      a.click();
      
      URL.revokeObjectURL(url);
      
      this.showNotification('XML-Dateien erfolgreich exportiert', 'success');
      
    } catch (error) {
      console.error('❌ Export failed:', error);
      
      // Fallback: export individual files
      this.exportIndividualFiles();
    } finally {
      this.hideLoading();
    }
  }
  
  async exportIndividualFiles() {
    // Fallback method: download each file individually
    for (const file of this.xmlFiles) {
      try {
        const content = await this.fetchFileContent(file.name);
        const blob = new Blob([content], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error(`Failed to export ${file.name}:`, error);
      }
    }
    
    this.showNotification('XML-Dateien einzeln exportiert', 'success');
  }
  
  async refreshFiles() {
    console.log('🔄 Refreshing file list...');
    
    await this.loadFileSizes();
    this.populateFileDropdown();
    
    if (this.currentFile) {
      this.updateActiveFile(this.currentFile);
    }
    
    this.showNotification('Dateiliste aktualisiert', 'success');
  }
  
  closeFile() {
    if (this.isModified) {
      const shouldClose = confirm('Es gibt ungespeicherte Änderungen. Möchten Sie die Datei trotzdem schließen?');
      if (!shouldClose) return;
    }
    
    this.currentFile = null;
    this.editor = null;
    this.isModified = false;
    this.originalContent = '';
    
    // Reset UI
    document.getElementById('editor-container').innerHTML = `
      <div class="editor-placeholder">
        <div class="placeholder-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </div>
        <h3>Wähle eine XML-Datei zum Bearbeiten</h3>
        <p>Klicke auf eine Datei in der linken Liste, um sie im Editor zu öffnen.</p>
      </div>
    `;
    
    this.updateFileTab(null);
    this.updateActiveFile(null);
    this.updateSaveButton(false);
    this.updateStatusBar();
  }
  
  // UI Helper Methods
  updateFileTab(fileName, isModified = false) {
    const tabName = document.querySelector('.tab-name');
    
    if (fileName) {
      tabName.textContent = fileName + (isModified ? ' *' : '');
      document.querySelector('.editor-tab').style.display = 'flex';
    } else {
      tabName.textContent = 'Keine Datei ausgewählt';
      document.querySelector('.editor-tab').style.display = 'flex';
    }
  }
  
  updateActiveFile(fileName) {
    const fileDropdown = document.getElementById('file-dropdown');
    if (fileDropdown) {
      fileDropdown.value = fileName || '';
    }
  }
  
  updateSaveButton(enabled) {
    const saveButton = document.getElementById('save-file');
    saveButton.disabled = !enabled;
  }
  
  updateStatusBar() {
    const content = this.getEditorContent();
    
    // Update file size
    const sizeElement = document.getElementById('file-size');
    sizeElement.textContent = this.formatFileSize(new Blob([content]).size);
    
    // Update cursor position (if available)
    // Note: Would need CodeMirror cursor position API for accurate info
    const positionElement = document.getElementById('cursor-position');
    positionElement.textContent = `${content.split('\\n').length} Zeilen`;
  }
  
  updateConnectionStatus(status, message) {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    
    statusDot.className = `status-indicator ${status}`;
    statusText.textContent = message;
  }
  
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
  
  showLoading(message) {
    const overlay = document.getElementById('loading-overlay');
    const text = overlay.querySelector('.loading-text');
    
    text.textContent = message;
    overlay.style.display = 'flex';
  }
  
  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'none';
  }
  
  showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    notification.innerHTML = `
      <span class=\"notification-icon\">${icons[type] || icons.info}</span>
      <span class=\"notification-text\">${message}</span>
      <button class=\"notification-close\">&times;</button>
    `;
    
    // Add close handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.remove();
    });
    
    container.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }
  
  // ===== NEW METHODS FOR ENHANCED UI =====
  
  toggleXMLTree() {
    const treePanel = document.getElementById('xml-tree-panel');
    const button = document.getElementById('toggle-xml-tree');
    
    if (treePanel.style.display === 'none') {
      treePanel.style.display = 'flex';
      button.classList.add('active');
      if (this.currentFile) {
        this.buildXMLTree();
      }
    } else {
      treePanel.style.display = 'none';
      button.classList.remove('active');
    }
  }
  
  toggleVisualMode() {
    const codeView = document.getElementById('code-editor-view');
    const visualView = document.getElementById('visual-editor-view');
    const button = document.getElementById('toggle-visual-mode');
    
    this.isVisualMode = !this.isVisualMode;
    
    if (this.isVisualMode) {
      codeView.style.display = 'none';
      visualView.style.display = 'flex';
      button.classList.add('active');
      this.buildVisualEditor();
    } else {
      codeView.style.display = 'flex';
      visualView.style.display = 'none';
      button.classList.remove('active');
    }
  }
  
  buildXMLTree() {
    if (!this.currentFile) return;
    
    const container = document.getElementById('xml-tree-container');
    container.innerHTML = '';
    
    try {
      const content = this.getEditorContent();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'text/xml');
      
      if (xmlDoc.querySelector('parsererror')) {
        container.innerHTML = '<div class="tree-error">XML-Fehler: Datei kann nicht geparst werden</div>';
        return;
      }
      
      const rootElement = xmlDoc.documentElement;
      const treeNode = this.createTreeNode(rootElement, 0);
      container.appendChild(treeNode);
      
    } catch (error) {
      console.error('Error building XML tree:', error);
      container.innerHTML = '<div class="tree-error">Fehler beim Aufbau der Baumstruktur</div>';
    }
  }
  
  createTreeNode(element, level) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'tree-node';
    
    const hasChildren = element.children.length > 0;
    const nodeContent = document.createElement('div');
    nodeContent.className = 'tree-node-content';
    
    // Toggle button for expandable nodes
    if (hasChildren) {
      const toggle = document.createElement('button');
      toggle.className = 'tree-node-toggle expanded';
      toggle.innerHTML = '▶';
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleTreeNode(nodeDiv);
      });
      nodeContent.appendChild(toggle);
    } else {
      const spacer = document.createElement('span');
      spacer.style.width = '16px';
      spacer.style.height = '16px';
      spacer.style.display = 'inline-block';
      nodeContent.appendChild(spacer);
    }
    
    // Icon
    const icon = document.createElement('span');
    icon.className = 'tree-node-icon';
    icon.innerHTML = this.getTreeNodeIcon(element.tagName);
    nodeContent.appendChild(icon);
    
    // Label
    const label = document.createElement('span');
    label.className = 'tree-node-label';
    label.textContent = this.getTreeNodeLabel(element);
    nodeContent.appendChild(label);
    
    // Type badge
    const type = document.createElement('span');
    type.className = 'tree-node-type';
    type.textContent = element.tagName;
    nodeContent.appendChild(type);
    
    // Click handler to jump to position in editor
    nodeContent.addEventListener('click', () => {
      this.jumpToXMLElement(element);
    });
    
    nodeDiv.appendChild(nodeContent);
    
    // Children
    if (hasChildren) {
      const children = document.createElement('div');
      children.className = 'tree-node-children';
      
      Array.from(element.children).forEach(child => {
        const childNode = this.createTreeNode(child, level + 1);
        children.appendChild(childNode);
      });
      
      nodeDiv.appendChild(children);
    }
    
    return nodeDiv;
  }
  
  getTreeNodeIcon(tagName) {
    const icons = {
      'dropdown': '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M3,6L7,10L11,6H3Z" fill="currentColor"/></svg>',
      'input': '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M2,6H14V10H2V6Z" fill="currentColor"/></svg>',
      'checkbox': '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M2,2H14V14H2V2M4,8L7,11L12,5" fill="currentColor"/></svg>',
      'option': '<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="3" fill="currentColor"/></svg>',
      'label': '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M2,4H14V6H2V4M2,8H10V10H2V8M2,12H12V14H2V12Z" fill="currentColor"/></svg>',
      'value': '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M2,2H14V14H2V2M4,6H12V8H4V6M4,10H10V12H4V10Z" fill="currentColor"/></svg>'
    };
    
    return icons[tagName] || '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M4,4H12V12H4V4Z" fill="currentColor"/></svg>';
  }
  
  getTreeNodeLabel(element) {
    const tagName = element.tagName;
    
    // Try to get a meaningful label
    const labelElement = element.querySelector('label');
    if (labelElement && labelElement.textContent.trim()) {
      return labelElement.textContent.trim();
    }
    
    const idElement = element.querySelector('id');
    if (idElement && idElement.textContent.trim()) {
      return idElement.textContent.trim();
    }
    
    // Fallback to tag name
    return tagName;
  }
  
  toggleTreeNode(nodeDiv) {
    const toggle = nodeDiv.querySelector('.tree-node-toggle');
    const children = nodeDiv.querySelector('.tree-node-children');
    
    if (children) {
      const isExpanded = toggle.classList.contains('expanded');
      
      if (isExpanded) {
        children.style.display = 'none';
        toggle.classList.remove('expanded');
      } else {
        children.style.display = 'block';
        toggle.classList.add('expanded');
      }
    }
  }
  
  expandAllTreeNodes() {
    const toggles = document.querySelectorAll('.tree-node-toggle');
    toggles.forEach(toggle => {
      const children = toggle.closest('.tree-node').querySelector('.tree-node-children');
      if (children) {
        children.style.display = 'block';
        toggle.classList.add('expanded');
      }
    });
  }
  
  collapseAllTreeNodes() {
    const toggles = document.querySelectorAll('.tree-node-toggle');
    toggles.forEach(toggle => {
      const children = toggle.closest('.tree-node').querySelector('.tree-node-children');
      if (children) {
        children.style.display = 'none';
        toggle.classList.remove('expanded');
      }
    });
  }
  
  jumpToXMLElement(element) {
    // Clear previous selections
    const selectedNodes = document.querySelectorAll('.tree-node-content.selected');
    selectedNodes.forEach(node => node.classList.remove('selected'));
    
    // Find the corresponding tree node and select it
    const allTreeNodes = document.querySelectorAll('.tree-node-content');
    allTreeNodes.forEach(node => {
      const label = node.querySelector('.tree-node-label').textContent;
      const elementLabel = this.getTreeNodeLabel(element);
      
      if (label === elementLabel) {
        node.classList.add('selected');
      }
    });
    
    // Jump to element position in AdvancedXMLEditor
    if (this.editor && element) {
      try {
        const position = this.findElementPositionInEditor(element);
        if (position !== -1) {
          // Move cursor to the element position
          this.editor.setCursorPosition(position);
          
          // Focus the editor
          this.editor.focus();
          
          console.log(`🎯 Jumped to element at position ${position}`);
        }
      } catch (error) {
        console.error('Error jumping to element:', error);
      }
    }
  }
  
  findElementPositionInEditor(element) {
    if (!this.editor) return -1;
    
    const editorContent = this.getEditorContent();
    const elementLabel = this.getTreeNodeLabel(element);
    const tagName = element.tagName;
    
    // Try different search patterns
    const searchPatterns = [
      `<${tagName}>`,
      `<${tagName} `,
      `<label>${elementLabel}</label>`,
      elementLabel
    ];
    
    for (const pattern of searchPatterns) {
      const index = editorContent.indexOf(pattern);
      if (index !== -1) {
        return index;
      }
    }
    
    // Fallback: search for just the tag name
    const tagIndex = editorContent.indexOf(`<${tagName}`);
    return tagIndex !== -1 ? tagIndex : -1;
  }
  
  buildVisualEditor() {
    if (!this.currentFile) return;
    
    const container = document.getElementById('visual-editor-content');
    container.innerHTML = '';
    
    try {
      const content = this.getEditorContent();
      this.parsedData = this.parseXMLForVisualEditor(content);
      
      if (!this.parsedData) {
        container.innerHTML = '<div class="visual-placeholder"><h4>XML-Fehler</h4><p>Die Datei kann nicht geparst werden.</p></div>';
        return;
      }
      
      this.renderVisualElements();
      
    } catch (error) {
      console.error('Error building visual editor:', error);
      container.innerHTML = '<div class="visual-placeholder"><h4>Fehler</h4><p>Visueller Editor konnte nicht geladen werden.</p></div>';
    }
  }
  
  parseXMLForVisualEditor(content) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'text/xml');
      
      if (xmlDoc.querySelector('parsererror')) {
        return null;
      }
      
      const data = { type: this.getXMLType(), elements: [] };
      
      if (this.currentFile.includes('dropdown')) {
        const dropdowns = xmlDoc.querySelectorAll('dropdown');
        dropdowns.forEach(dropdown => {
          data.elements.push(this.parseDropdown(dropdown));
        });
      } else if (this.currentFile.includes('input')) {
        const inputs = xmlDoc.querySelectorAll('input');
        inputs.forEach(input => {
          data.elements.push(this.parseInput(input));
        });
      } else if (this.currentFile.includes('checkbox')) {
        const checkboxes = xmlDoc.querySelectorAll('checkbox');
        checkboxes.forEach(checkbox => {
          data.elements.push(this.parseCheckbox(checkbox));
        });
      }
      
      return data;
      
    } catch (error) {
      console.error('Error parsing XML:', error);
      return null;
    }
  }
  
  getXMLType() {
    if (this.currentFile.includes('dropdown')) return 'dropdown';
    if (this.currentFile.includes('input')) return 'input';
    if (this.currentFile.includes('checkbox')) return 'checkbox';
    return 'unknown';
  }
  
  parseDropdown(dropdown) {
    const element = {
      type: 'dropdown',
      id: this.getElementText(dropdown, 'id'),
      label: this.getElementText(dropdown, 'label'),
      options: []
    };
    
    const options = dropdown.querySelectorAll('option');
    options.forEach(option => {
      element.options.push({
        id: this.getElementText(option, 'id'),
        label: this.getElementText(option, 'label'),
        value: this.getElementText(option, 'value'),
        additionals: this.getElementText(option, 'additionals'),
        additionalsHide: this.getElementText(option, 'additionalsHide')
      });
    });
    
    return element;
  }
  
  parseInput(input) {
    return {
      type: 'input',
      id: this.getElementText(input, 'id'),
      label: this.getElementText(input, 'label'),
      class: this.getElementText(input, 'class'),
      valueBefore: this.getElementText(input, 'valueBefore'),
      valueAfter: this.getElementText(input, 'valueAfter')
    };
  }
  
  parseCheckbox(checkbox) {
    return {
      type: 'checkbox',
      id: this.getElementText(checkbox, 'id'),
      label: this.getElementText(checkbox, 'label'),
      value: this.getElementText(checkbox, 'value'),
      additionals: this.getElementText(checkbox, 'additionals'),
      additionalsHide: this.getElementText(checkbox, 'additionalsHide')
    };
  }
  
  getElementText(parent, tagName) {
    const element = parent.querySelector(tagName);
    return element ? element.textContent.trim() : '';
  }
  
  renderVisualElements() {
    const container = document.getElementById('visual-editor-content');
    
    if (!this.parsedData || !this.parsedData.elements.length) {
      container.innerHTML = '<div class="visual-placeholder"><h4>Keine Elemente</h4><p>Fügen Sie Elemente mit den Buttons links hinzu.</p></div>';
      return;
    }
    
    container.innerHTML = '';
    
    this.parsedData.elements.forEach((element, index) => {
      const elementDiv = this.createVisualElement(element, index);
      container.appendChild(elementDiv);
    });
  }
  
  createVisualElement(element, index) {
    const elementDiv = document.createElement('div');
    elementDiv.className = 'visual-element';
    elementDiv.dataset.index = index;
    
    // Header
    const header = document.createElement('div');
    header.className = 'visual-element-header';
    
    const title = document.createElement('div');
    title.className = 'visual-element-title';
    title.textContent = element.label || `${element.type} ${index + 1}`;
    
    const type = document.createElement('span');
    type.className = 'visual-element-type';
    type.textContent = element.type;
    
    const controls = document.createElement('div');
    controls.className = 'visual-element-controls';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-icon btn-danger';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Element löschen';
    deleteBtn.addEventListener('click', () => this.deleteVisualElement(index));
    
    controls.appendChild(deleteBtn);
    header.appendChild(title);
    header.appendChild(type);
    header.appendChild(controls);
    
    // Content
    const content = document.createElement('div');
    content.className = 'visual-element-content';
    
    if (element.type === 'dropdown') {
      content.appendChild(this.createDropdownEditor(element, index));
    } else if (element.type === 'input') {
      content.appendChild(this.createInputEditor(element, index));
    } else if (element.type === 'checkbox') {
      content.appendChild(this.createCheckboxEditor(element, index));
    }
    
    elementDiv.appendChild(header);
    elementDiv.appendChild(content);
    
    return elementDiv;
  }
  
  createDropdownEditor(element, index) {
    const container = document.createElement('div');
    
    // Basic fields
    container.appendChild(this.createField('Label', element.label, (value) => {
      this.updateElementField(index, 'label', value);
    }));
    
    container.appendChild(this.createField('ID', element.id, (value) => {
      this.updateElementField(index, 'id', value);
    }));
    
    // Options
    const optionsLabel = document.createElement('label');
    optionsLabel.textContent = 'Optionen:';
    container.appendChild(optionsLabel);
    
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    
    element.options.forEach((option, optionIndex) => {
      const optionDiv = this.createOptionEditor(option, index, optionIndex);
      optionsContainer.appendChild(optionDiv);
    });
    
    container.appendChild(optionsContainer);
    
    // Add option button
    const addBtn = document.createElement('button');
    addBtn.textContent = '+ Option hinzufügen';
    addBtn.className = 'btn-secondary';
    addBtn.addEventListener('click', () => this.addOption(index));
    container.appendChild(addBtn);
    
    return container;
  }
  
  createOptionEditor(option, elementIndex, optionIndex) {
    const container = document.createElement('div');
    container.className = 'option-editor';
    container.style.border = '1px solid var(--border)';
    container.style.borderRadius = 'var(--radius-small)';
    container.style.padding = '12px';
    container.style.marginBottom = '8px';
    
    container.appendChild(this.createField('Label', option.label, (value) => {
      this.updateOptionField(elementIndex, optionIndex, 'label', value);
    }));
    
    container.appendChild(this.createField('Prompt-Text', option.value, (value) => {
      this.updateOptionField(elementIndex, optionIndex, 'value', value);
    }, 'textarea'));
    
    container.appendChild(this.createField('ID', option.id, (value) => {
      this.updateOptionField(elementIndex, optionIndex, 'id', value);
    }));
    
    // Delete option button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Option löschen';
    deleteBtn.className = 'btn-secondary btn-danger';
    deleteBtn.style.marginTop = '8px';
    deleteBtn.addEventListener('click', () => this.deleteOption(elementIndex, optionIndex));
    container.appendChild(deleteBtn);
    
    return container;
  }
  
  createInputEditor(element, index) {
    const container = document.createElement('div');
    
    container.appendChild(this.createField('Label', element.label, (value) => {
      this.updateElementField(index, 'label', value);
    }));
    
    container.appendChild(this.createField('ID', element.id, (value) => {
      this.updateElementField(index, 'id', value);
    }));
    
    container.appendChild(this.createField('Text davor', element.valueBefore, (value) => {
      this.updateElementField(index, 'valueBefore', value);
    }));
    
    container.appendChild(this.createField('Text danach', element.valueAfter, (value) => {
      this.updateElementField(index, 'valueAfter', value);
    }));
    
    return container;
  }
  
  createCheckboxEditor(element, index) {
    const container = document.createElement('div');
    
    container.appendChild(this.createField('Label', element.label, (value) => {
      this.updateElementField(index, 'label', value);
    }));
    
    container.appendChild(this.createField('ID', element.id, (value) => {
      this.updateElementField(index, 'id', value);
    }));
    
    container.appendChild(this.createField('Prompt-Text', element.value, (value) => {
      this.updateElementField(index, 'value', value);
    }, 'textarea'));
    
    return container;
  }
  
  createField(label, value, onChange, type = 'input') {
    const field = document.createElement('div');
    field.className = 'visual-field';
    
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    field.appendChild(labelEl);
    
    const input = document.createElement(type);
    input.value = value || '';
    input.addEventListener('input', (e) => {
      onChange(e.target.value);
      this.onContentChanged();
    });
    
    field.appendChild(input);
    return field;
  }
  
  updateElementField(elementIndex, field, value) {
    if (this.parsedData && this.parsedData.elements[elementIndex]) {
      this.parsedData.elements[elementIndex][field] = value;
      this.syncVisualToCode();
    }
  }
  
  updateOptionField(elementIndex, optionIndex, field, value) {
    if (this.parsedData && 
        this.parsedData.elements[elementIndex] && 
        this.parsedData.elements[elementIndex].options &&
        this.parsedData.elements[elementIndex].options[optionIndex]) {
      this.parsedData.elements[elementIndex].options[optionIndex][field] = value;
      this.syncVisualToCode();
    }
  }
  
  addOption(elementIndex) {
    if (this.parsedData && this.parsedData.elements[elementIndex]) {
      const newOption = {
        id: '',
        label: 'Neue Option',
        value: '',
        additionals: '',
        additionalsHide: ''
      };
      
      this.parsedData.elements[elementIndex].options.push(newOption);
      this.renderVisualElements();
      this.syncVisualToCode();
    }
  }
  
  deleteOption(elementIndex, optionIndex) {
    if (this.parsedData && 
        this.parsedData.elements[elementIndex] && 
        this.parsedData.elements[elementIndex].options) {
      this.parsedData.elements[elementIndex].options.splice(optionIndex, 1);
      this.renderVisualElements();
      this.syncVisualToCode();
    }
  }
  
  deleteVisualElement(index) {
    if (this.parsedData && this.parsedData.elements[index]) {
      this.parsedData.elements.splice(index, 1);
      this.renderVisualElements();
      this.syncVisualToCode();
    }
  }
  
  addVisualElement(type) {
    if (!this.parsedData) {
      this.parsedData = { type: type, elements: [] };
    }
    
    let newElement;
    
    if (type === 'dropdown') {
      newElement = {
        type: 'dropdown',
        id: '',
        label: 'Neuer Dropdown',
        options: [{
          id: '',
          label: 'Option 1',
          value: '',
          additionals: '',
          additionalsHide: ''
        }]
      };
    } else if (type === 'input') {
      newElement = {
        type: 'input',
        id: '',
        label: 'Neues Input',
        class: 'prompt-generator-input',
        valueBefore: '',
        valueAfter: ''
      };
    } else if (type === 'checkbox') {
      newElement = {
        type: 'checkbox',
        id: '',
        label: 'Neue Checkbox',
        value: '',
        additionals: '',
        additionalsHide: ''
      };
    }
    
    this.parsedData.elements.push(newElement);
    this.renderVisualElements();
    this.syncVisualToCode();
  }
  
  syncVisualToCode() {
    if (!this.parsedData || !this.isVisualMode) return;
    
    const xmlContent = this.generateXMLFromParsedData();
    
    if (this.editor && this.getEditorContent() !== xmlContent) {
      this.setEditorContent(xmlContent);
    }
  }
  
  generateXMLFromParsedData() {
    if (!this.parsedData) return '';
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n';
    
    if (this.parsedData.type === 'dropdown') {
      xml += '  <dropdowns>\n';
      this.parsedData.elements.forEach(element => {
        xml += '    <dropdown>\n';
        xml += `      <label>${this.escapeXML(element.label)}</label>\n`;
        xml += `      <id>${this.escapeXML(element.id)}</id>\n`;
        xml += '      <options>\n';
        
        element.options.forEach(option => {
          xml += '        <option>\n';
          xml += `          <label>${this.escapeXML(option.label)}</label>\n`;
          xml += `          <value>${this.escapeXML(option.value)}</value>\n`;
          xml += `          <id>${this.escapeXML(option.id)}</id>\n`;
          xml += `          <additionals>${this.escapeXML(option.additionals)}</additionals>\n`;
          xml += '          <additionalsHide />\n';
          xml += '        </option>\n';
        });
        
        xml += '      </options>\n';
        xml += '    </dropdown>\n';
      });
      xml += '  </dropdowns>\n';
      
    } else if (this.parsedData.type === 'input') {
      xml += '  <inputs>\n';
      this.parsedData.elements.forEach(element => {
        xml += '    <input>\n';
        xml += `      <label>${this.escapeXML(element.label)}</label>\n`;
        xml += `      <id>${this.escapeXML(element.id)}</id>\n`;
        xml += `      <class>${this.escapeXML(element.class)}</class>\n`;
        xml += `      <valueBefore>${this.escapeXML(element.valueBefore)}</valueBefore>\n`;
        xml += `      <valueAfter>${this.escapeXML(element.valueAfter)}</valueAfter>\n`;
        xml += '    </input>\n';
      });
      xml += '  </inputs>\n';
      
    } else if (this.parsedData.type === 'checkbox') {
      xml += '  <checkboxes>\n';
      this.parsedData.elements.forEach(element => {
        xml += '    <checkbox>\n';
        xml += `      <label>${this.escapeXML(element.label)}</label>\n`;
        xml += `      <id>${this.escapeXML(element.id)}</id>\n`;
        xml += `      <value>${this.escapeXML(element.value)}</value>\n`;
        xml += `      <additionals>${this.escapeXML(element.additionals)}</additionals>\n`;
        xml += '      <additionalsHide />\n';
        xml += '    </checkbox>\n';
      });
      xml += '  </checkboxes>\n';
    }
    
    xml += '</data>';
    return xml;
  }
  
  escapeXML(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  testPrompt() {
    const previewPanel = document.getElementById('live-preview-panel');
    previewPanel.style.display = 'flex';
    
    this.updateLivePreview();
  }
  
  updateLivePreview() {
    if (!this.parsedData) return;
    
    const previewText = document.getElementById('preview-text');
    let prompt = 'Beispiel-Prompt:\n\n';
    
    this.parsedData.elements.forEach(element => {
      if (element.type === 'dropdown' && element.options.length > 0) {
        const firstOption = element.options[0];
        if (firstOption.value) {
          prompt += firstOption.value + '\n\n';
        }
      } else if (element.type === 'input') {
        prompt += `${element.valueBefore}[${element.label}]${element.valueAfter}\n\n`;
      } else if (element.type === 'checkbox') {
        if (element.value) {
          prompt += element.value + '\n\n';
        }
      }
    });
    
    previewText.textContent = prompt.trim() || 'Keine Vorschau verfügbar';
  }
  
  closeLivePreview() {
    const previewPanel = document.getElementById('live-preview-panel');
    previewPanel.style.display = 'none';
  }
}

// Initialize the XML Editor when the popup loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 Popup DOM loaded, initializing XML Editor...');
  
  // Check if we're in the right context
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    new XMLEditor();
  } else {
    console.error('❌ Chrome extension context not available');
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h3>Fehler</h3>
        <p>XML Editor kann nur als Chrome Extension Popup verwendet werden.</p>
      </div>
    `;
  }
});

// Global error handling
window.addEventListener('error', (event) => {
  console.error('❌ Global error in XML Editor popup:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled promise rejection in XML Editor popup:', event.reason);
});