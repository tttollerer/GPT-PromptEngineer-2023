/**
 * Advanced XML Editor - CSP-compliant replacement for CodeMirror
 * Provides syntax highlighting, line numbers, and XML validation
 */

class AdvancedXMLEditor {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      theme: options.theme || 'light',
      lineNumbers: options.lineNumbers !== false,
      syntaxHighlighting: options.syntaxHighlighting !== false,
      wordWrap: options.wordWrap !== false,
      autoIndent: options.autoIndent !== false,
      validateXML: options.validateXML !== false,
      placeholder: options.placeholder || 'XML Inhalt hier eingeben...',
      ...options
    };
    
    this.content = '';
    this.cursorPosition = { line: 0, col: 0 };
    this.changeListeners = [];
    this.validationErrors = [];
    this.highlightTimeout = null;
    
    this.init();
  }
  
  init() {
    this.createEditor();
    this.attachEventListeners();
    this.updateSyntaxHighlighting();
  }
  
  createEditor() {
    this.container.innerHTML = '';
    this.container.className = `xml-editor-container ${this.options.theme}`;
    
    // Create wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'xml-editor-wrapper';
    
    // Create line numbers if enabled
    if (this.options.lineNumbers) {
      this.lineNumbersEl = document.createElement('div');
      this.lineNumbersEl.className = 'xml-line-numbers';
      this.wrapper.appendChild(this.lineNumbersEl);
    }
    
    // Create main editor area
    this.editorArea = document.createElement('div');
    this.editorArea.className = 'xml-editor-area';
    
    // Create textarea for input
    this.textarea = document.createElement('textarea');
    this.textarea.className = 'xml-editor-textarea';
    this.textarea.placeholder = this.options.placeholder;
    this.textarea.spellcheck = false;
    this.textarea.autocomplete = 'off';
    this.textarea.wrap = this.options.wordWrap ? 'soft' : 'off';
    
    // Create highlight layer
    if (this.options.syntaxHighlighting) {
      this.highlightLayer = document.createElement('div');
      this.highlightLayer.className = 'xml-editor-highlight';
      this.highlightLayer.setAttribute('aria-hidden', 'true');
      this.editorArea.appendChild(this.highlightLayer);
    }
    
    this.editorArea.appendChild(this.textarea);
    this.wrapper.appendChild(this.editorArea);
    
    // Create error display
    this.errorDisplay = document.createElement('div');
    this.errorDisplay.className = 'xml-editor-errors';
    this.wrapper.appendChild(this.errorDisplay);
    
    this.container.appendChild(this.wrapper);
  }
  
  attachEventListeners() {
    // Content change
    this.textarea.addEventListener('input', (e) => {
      this.content = this.textarea.value;
      this.updateLineNumbers();
      this.scheduleHighlightUpdate();
      this.validateXMLContent();
      this.notifyChange();
    });
    
    // Cursor position tracking
    this.textarea.addEventListener('selectionchange', () => {
      this.updateCursorPosition();
    });
    
    this.textarea.addEventListener('keyup', () => {
      this.updateCursorPosition();
    });
    
    this.textarea.addEventListener('click', () => {
      this.updateCursorPosition();
    });
    
    // Auto-indent on Enter
    if (this.options.autoIndent) {
      this.textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.handleAutoIndent(e);
        }
        if (e.key === 'Tab') {
          this.handleTab(e);
        }
      });
    }
    
    // Sync scroll between textarea and highlight layer
    if (this.highlightLayer) {
      this.textarea.addEventListener('scroll', () => {
        this.highlightLayer.scrollTop = this.textarea.scrollTop;
        this.highlightLayer.scrollLeft = this.textarea.scrollLeft;
      });
    }
    
    // Handle paste
    this.textarea.addEventListener('paste', (e) => {
      setTimeout(() => {
        this.content = this.textarea.value;
        this.updateLineNumbers();
        this.scheduleHighlightUpdate();
        this.validateXMLContent();
        this.notifyChange();
      }, 0);
    });
  }
  
  updateLineNumbers() {
    if (!this.lineNumbersEl) return;
    
    const lines = this.content.split('\n');
    const lineCount = lines.length;
    
    let html = '';
    for (let i = 1; i <= lineCount; i++) {
      html += `<div class="line-number">${i}</div>`;
    }
    
    this.lineNumbersEl.innerHTML = html;
  }
  
  scheduleHighlightUpdate() {
    if (!this.options.syntaxHighlighting) return;
    
    clearTimeout(this.highlightTimeout);
    this.highlightTimeout = setTimeout(() => {
      this.updateSyntaxHighlighting();
    }, 100);
  }
  
  updateSyntaxHighlighting() {
    if (!this.highlightLayer) return;
    
    const highlightedContent = this.highlightXML(this.content);
    this.highlightLayer.innerHTML = highlightedContent;
    
    // Sync scroll
    this.highlightLayer.scrollTop = this.textarea.scrollTop;
    this.highlightLayer.scrollLeft = this.textarea.scrollLeft;
  }
  
  highlightXML(content) {
    if (!content.trim()) return '';
    
    let highlighted = content;
    
    // Escape HTML entities first
    highlighted = highlighted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Highlight XML elements
    highlighted = highlighted
      // Comments
      .replace(/(&lt;!--.*?--&gt;)/gs, '<span class="xml-comment">$1</span>')
      
      // Processing instructions
      .replace(/(&lt;\?.*?\?&gt;)/gs, '<span class="xml-processing">$1</span>')
      
      // CDATA sections
      .replace(/(&lt;!\[CDATA\[.*?\]\]&gt;)/gs, '<span class="xml-cdata">$1</span>')
      
      // Opening tags with attributes
      .replace(/(&lt;)([a-zA-Z][a-zA-Z0-9\-:]*)((?:\s+[a-zA-Z][a-zA-Z0-9\-:]*\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?&gt;)/g, 
        (match, openBracket, tagName, attributes, closeBracket) => {
          let result = '<span class="xml-bracket">' + openBracket + '</span>';
          result += '<span class="xml-tag">' + tagName + '</span>';
          
          if (attributes) {
            result += attributes.replace(
              /(\s+)([a-zA-Z][a-zA-Z0-9\-:]*)\s*=\s*("[^"]*"|'[^']*')/g,
              '$1<span class="xml-attr-name">$2</span>=<span class="xml-attr-value">$3</span>'
            );
          }
          
          result += '<span class="xml-bracket">' + closeBracket + '</span>';
          return result;
        })
      
      // Closing tags
      .replace(/(&lt;\/)([a-zA-Z][a-zA-Z0-9\-:]*)\s*(&gt;)/g, 
        '<span class="xml-bracket">$1</span><span class="xml-tag">$2</span><span class="xml-bracket">$3</span>')
      
      // Standalone opening brackets that weren't caught
      .replace(/(&lt;)(?![!/?\w])/g, '<span class="xml-bracket">$1</span>')
      .replace(/(?<![!/?\w])(&gt;)/g, '<span class="xml-bracket">$1</span>');
    
    // Add line breaks
    highlighted = highlighted.replace(/\n/g, '<br>');
    
    return highlighted;
  }
  
  validateXMLContent() {
    if (!this.options.validateXML) return;
    
    this.validationErrors = [];
    
    if (!this.content.trim()) {
      this.displayErrors([]);
      return;
    }
    
    try {
      // Basic XML validation
      const parser = new DOMParser();
      const doc = parser.parseFromString(this.content, 'text/xml');
      
      const parseErrors = doc.getElementsByTagName('parsererror');
      if (parseErrors.length > 0) {
        const error = parseErrors[0].textContent;
        this.validationErrors.push({
          message: error,
          line: this.extractLineNumber(error),
          type: 'error'
        });
      }
    } catch (e) {
      this.validationErrors.push({
        message: e.message,
        line: 1,
        type: 'error'
      });
    }
    
    // Additional custom validations
    this.performCustomValidations();
    
    this.displayErrors(this.validationErrors);
  }
  
  performCustomValidations() {
    const lines = this.content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for unclosed tags
      const openTags = line.match(/<[a-zA-Z][^>]*[^/]>/g) || [];
      const closeTags = line.match(/<\/[a-zA-Z][^>]*>/g) || [];
      
      // Basic bracket matching
      const openBrackets = (line.match(/</g) || []).length;
      const closeBrackets = (line.match(/>/g) || []).length;
      
      if (openBrackets !== closeBrackets) {
        this.validationErrors.push({
          message: `Unmatched brackets on line ${lineNum}`,
          line: lineNum,
          type: 'warning'
        });
      }
    });
  }
  
  extractLineNumber(errorMessage) {
    const match = errorMessage.match(/line (\d+)/i);
    return match ? parseInt(match[1]) : 1;
  }
  
  displayErrors(errors) {
    if (!errors.length) {
      this.errorDisplay.innerHTML = '';
      this.errorDisplay.style.display = 'none';
      return;
    }
    
    this.errorDisplay.style.display = 'block';
    this.errorDisplay.innerHTML = errors.map(error => `
      <div class="xml-error ${error.type}">
        <span class="error-line">Line ${error.line}:</span>
        <span class="error-message">${error.message}</span>
      </div>
    `).join('');
  }
  
  handleAutoIndent(e) {
    e.preventDefault();
    
    const cursorPos = this.textarea.selectionStart;
    const beforeCursor = this.content.substring(0, cursorPos);
    const afterCursor = this.content.substring(cursorPos);
    
    const currentLine = beforeCursor.split('\n').pop();
    const indent = currentLine.match(/^(\s*)/)[1];
    
    // Add extra indent for opening tags
    const extraIndent = currentLine.match(/<[^/][^>]*[^/]>$/) ? '  ' : '';
    
    const newContent = beforeCursor + '\n' + indent + extraIndent + afterCursor;
    
    this.setValue(newContent);
    this.setCursorPosition(cursorPos + 1 + indent.length + extraIndent.length);
  }
  
  handleTab(e) {
    e.preventDefault();
    
    const cursorPos = this.textarea.selectionStart;
    const beforeCursor = this.content.substring(0, cursorPos);
    const afterCursor = this.content.substring(cursorPos);
    
    const newContent = beforeCursor + '  ' + afterCursor;
    this.setValue(newContent);
    this.setCursorPosition(cursorPos + 2);
  }
  
  updateCursorPosition() {
    const cursorPos = this.textarea.selectionStart;
    const beforeCursor = this.content.substring(0, cursorPos);
    const lines = beforeCursor.split('\n');
    
    this.cursorPosition = {
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    };
    
    // Dispatch cursor position change event
    this.dispatchEvent('cursorchange', this.cursorPosition);
  }
  
  // Public API methods (CodeMirror-compatible)
  getValue() {
    return this.content;
  }
  
  setValue(content) {
    this.content = content || '';
    this.textarea.value = this.content;
    this.updateLineNumbers();
    this.updateSyntaxHighlighting();
    this.validateXMLContent();
    this.updateCursorPosition();
  }
  
  setCursorPosition(pos) {
    this.textarea.selectionStart = pos;
    this.textarea.selectionEnd = pos;
    this.textarea.focus();
    this.updateCursorPosition();
  }
  
  focus() {
    this.textarea.focus();
  }
  
  getLine(lineNumber) {
    const lines = this.content.split('\n');
    return lines[lineNumber - 1] || '';
  }
  
  lineCount() {
    return this.content.split('\n').length;
  }
  
  // Event system
  on(event, callback) {
    if (event === 'change') {
      this.changeListeners.push(callback);
    }
  }
  
  off(event, callback) {
    if (event === 'change') {
      const index = this.changeListeners.indexOf(callback);
      if (index > -1) {
        this.changeListeners.splice(index, 1);
      }
    }
  }
  
  notifyChange() {
    this.changeListeners.forEach(callback => {
      try {
        callback({ target: this });
      } catch (e) {
        console.error('Error in change listener:', e);
      }
    });
  }
  
  dispatchEvent(eventName, data) {
    const event = new CustomEvent(`xmleditor-${eventName}`, { detail: data });
    this.container.dispatchEvent(event);
  }
  
  // Theme management
  setTheme(theme) {
    this.options.theme = theme;
    this.container.className = this.container.className.replace(/\b(light|dark)\b/, theme);
    this.container.classList.add(theme);
  }
  
  // Format XML content
  formatXML() {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(this.content, 'text/xml');
      
      if (doc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('Invalid XML - cannot format');
      }
      
      const formatted = this.prettyPrintXML(this.content);
      this.setValue(formatted);
      return true;
    } catch (e) {
      console.error('XML formatting failed:', e);
      return false;
    }
  }
  
  prettyPrintXML(xml) {
    let formatted = '';
    let indent = 0;
    const tab = '  ';
    
    xml.split(/>\s*</).forEach((node, index) => {
      if (index > 0) node = '<' + node;
      if (index < xml.split(/>\s*</).length - 1) node = node + '>';
      
      if (node.match(/^<\/\w/)) {
        indent--;
      }
      
      formatted += tab.repeat(indent) + node + '\n';
      
      if (node.match(/^<\w[^>]*[^/]>$/)) {
        indent++;
      }
    });
    
    return formatted.trim();
  }
  
  // Destroy editor
  destroy() {
    clearTimeout(this.highlightTimeout);
    this.container.innerHTML = '';
    this.changeListeners = [];
  }
}

// Export for use
window.AdvancedXMLEditor = AdvancedXMLEditor;