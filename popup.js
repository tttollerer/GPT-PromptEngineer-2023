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
      
      // Wait for CodeMirror to be ready
      await this.waitForCodeMirror();
      
      // Initialize UI
      this.initializeUI();
      
      // Load file sizes
      await this.loadFileSizes();
      
      // Populate file list
      this.populateFileList();
      
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
    
    // Re-create editor with appropriate theme if it exists
    if (this.editor && this.currentFile) {
      const content = this.getEditorContent();
      this.createEditor(content);
    }
  }
  
  waitForCodeMirror() {
    return new Promise((resolve) => {
      if (window.CM) {
        resolve();
      } else {
        window.addEventListener('codemirror-ready', () => resolve(), { once: true });
        
        // Fallback timeout
        setTimeout(() => {
          if (!window.CM) {
            console.warn('⚠️ CodeMirror not loaded, will use fallback editor');
          }
          resolve();
        }, 5000);
      }
    });
  }
  
  initializeUI() {
    // Initialize resizable window if opened in a new window
    this.initializeResize();
    
    // File list click handler
    const fileList = document.getElementById('xml-file-list');
    fileList.addEventListener('click', (e) => {
      const fileItem = e.target.closest('.file-item');
      if (fileItem) {
        const fileName = fileItem.dataset.filename;
        this.loadFile(fileName);
      }
    });
    
    // Toolbar buttons
    document.getElementById('refresh-files').addEventListener('click', () => this.refreshFiles());
    document.getElementById('format-xml').addEventListener('click', () => this.formatXML());
    document.getElementById('validate-xml').addEventListener('click', () => this.validateXML());
    
    // Action buttons
    document.getElementById('save-file').addEventListener('click', () => this.saveFile());
    document.getElementById('reset-file').addEventListener('click', () => this.resetFile());
    document.getElementById('export-all').addEventListener('click', () => this.exportAll());
    
    // Tab close
    document.querySelector('.tab-close').addEventListener('click', () => this.closeFile());
    
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
  
  populateFileList() {
    const fileList = document.getElementById('xml-file-list');
    fileList.innerHTML = '';
    
    this.xmlFiles.forEach(file => {
      const listItem = document.createElement('li');
      listItem.className = 'file-item';
      listItem.dataset.filename = file.name;
      
      listItem.innerHTML = `
        <span class=\"file-icon\">${file.icon}</span>
        <span class=\"file-name\">${file.name}</span>
        <span class=\"file-size\">${this.formatFileSize(file.size)}</span>
      `;
      
      fileList.appendChild(listItem);
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
      
    } catch (error) {
      console.error(`❌ Failed to load ${fileName}:`, error);
      this.showNotification(`Fehler beim Laden von ${fileName}`, 'error');
    } finally {
      this.hideLoading();
    }
  }
  
  async fetchFileContent(fileName) {
    try {
      // First try to load from chrome storage (user modifications)
      const result = await chrome.storage.local.get(fileName);
      if (result[fileName]) {
        console.log(`📦 Loaded ${fileName} from storage`);
        return result[fileName];
      }
      
      // Fallback to original file
      const response = await fetch(chrome.runtime.getURL(fileName));
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      console.log(`📁 Loaded ${fileName} from extension`);
      return content;
      
    } catch (error) {
      console.error(`Error fetching ${fileName}:`, error);
      
      // Return minimal XML structure as fallback
      const fallbackContent = this.getFallbackContent(fileName);
      console.log(`🔄 Using fallback content for ${fileName}`);
      return fallbackContent;
    }
  }
  
  getFallbackContent(fileName) {
    if (fileName.includes('dropdown')) {
      return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
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
      </options>
    </dropdown>
  </dropdowns>
</data>`;
    } else if (fileName.includes('input')) {
      return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
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
      return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
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
    return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<data>
  <!-- ${fileName} - Beispiel-Struktur -->
  <!-- Fügen Sie hier Ihren XML-Inhalt hinzu -->
</data>`;
  }
  
  createEditor(content) {
    const editorContainer = document.getElementById('editor-container');
    
    // Clear existing editor
    editorContainer.innerHTML = '';
    
    // Create CodeMirror editor
    try {
      if (!window.CM) {
        throw new Error('CodeMirror not available');
      }
      
      const { EditorView, EditorState, basicSetup, xml, oneDark } = window.CM;
      
      const extensions = [
        basicSetup,
        xml(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            this.onContentChanged();
          }
        }),
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-scroller': { overflow: 'auto' },
          '.cm-focused': { outline: 'none' }
        })
      ];
      
      // Add dark theme if dark mode is active
      if (document.body.classList.contains('dark-theme')) {
        extensions.push(oneDark);
      }
      
      const state = EditorState.create({
        doc: content,
        extensions
      });
      
      this.editor = new EditorView({
        state,
        parent: editorContainer
      });
      
      console.log('✅ CodeMirror editor created');
      
    } catch (error) {
      console.error('❌ Failed to create CodeMirror editor:', error);
      this.createFallbackEditor(content, editorContainer);
    }
  }
  
  createFallbackEditor(content, container) {
    // Fallback to simple textarea if CodeMirror fails
    console.log('🔄 Using fallback textarea editor');
    
    const textarea = document.createElement('textarea');
    textarea.value = content;
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
      background: #fafafa;
      color: #333;
    `;
    
    textarea.addEventListener('input', () => this.onContentChanged());
    
    container.appendChild(textarea);
    this.editor = { getValue: () => textarea.value, setValue: (val) => textarea.value = val };
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
    if (this.editor && this.editor.state) {
      // CodeMirror 6
      return this.editor.state.doc.toString();
    } else if (this.editor && this.editor.getValue) {
      // Fallback editor
      return this.editor.getValue();
    }
    return '';
  }
  
  setEditorContent(content) {
    if (this.editor && this.editor.dispatch) {
      // CodeMirror 6
      this.editor.dispatch({
        changes: { from: 0, to: this.editor.state.doc.length, insert: content }
      });
    } else if (this.editor && this.editor.setValue) {
      // Fallback editor
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
        this.populateFileList();
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
    this.populateFileList();
    
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
    document.querySelectorAll('.file-item').forEach(item => {
      item.classList.toggle('active', item.dataset.filename === fileName);
    });
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