/**
 * TEXT UTILITIES
 * Helper functions for text processing and manipulation
 */

window.textUtils = {
  // Helper function to escape regex special characters
  escapeRegex: function(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  // Function to remove a specific prompt from content
  removePromptFromContent: function(content, promptToRemove) {
    if (!content || !promptToRemove) return content;
    
    // Create regex that handles the prompt with surrounding whitespace/newlines
    // This ensures clean removal without leaving extra blank lines
    const escapedPrompt = this.escapeRegex(promptToRemove);
    
    // Try different patterns to ensure clean removal
    const patterns = [
      new RegExp(escapedPrompt + '\\s*\\n\\s*\\n', 'g'),  // Prompt with double newline after
      new RegExp(escapedPrompt + '\\s*\\n', 'g'),         // Prompt with single newline after
      new RegExp('\\n\\s*' + escapedPrompt + '\\s*\\n', 'g'), // Prompt with newlines before and after
      new RegExp(escapedPrompt, 'g')                      // Just the prompt itself as fallback
    ];
    
    let cleanedContent = content;
    for (const pattern of patterns) {
      const beforeLength = cleanedContent.length;
      cleanedContent = cleanedContent.replace(pattern, '\n');
      if (cleanedContent.length < beforeLength) {
        // Successfully removed, clean up any multiple newlines
        cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n').trim();
        break;
      }
    }
    
    return cleanedContent;
  },

  // Universal helper functions for different element types
  getElementContent: function(element) {
    if (!element) return '';
    
    const tagName = element.tagName.toLowerCase();
    if (tagName === 'textarea' || tagName === 'input') {
      return element.value || '';
    } else if (element.contentEditable === 'true') {
      // For contenteditable, get text content safely
      // Use textContent which automatically handles HTML entities
      return element.textContent || '';
    }
    return '';
  },

  setElementContent: function(element, content) {
    if (!element) return;
    
    const tagName = element.tagName.toLowerCase();
    if (tagName === 'textarea' || tagName === 'input') {
      element.value = content;
    } else if (element.contentEditable === 'true') {
      // For contenteditable, safely set content
      // Clear existing content
      element.textContent = '';
      
      // Split by newlines and create proper structure
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line) {
          element.appendChild(document.createTextNode(line));
        }
        if (index < lines.length - 1) {
          element.appendChild(document.createElement('br'));
        }
      });
    }
  },

  triggerElementUpdate: function(element) {
    if (!element) return;
    
    // Trigger appropriate events for different element types
    if (element.contentEditable === 'true') {
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      // Focus the element to ensure cursor position
      element.focus();
    } else {
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  },

  highlightDetectedTextfield: function() {
    const targetNode = document.querySelector(window.getSelector());
    if (targetNode) {
      targetNode.classList.add('prompt-engineer-detected');
      // Remove class after animation completes
      setTimeout(() => {
        targetNode.classList.remove('prompt-engineer-detected');
      }, 2000);
    }
  },

  extractUserText: function(content) {
    // Handle empty or non-string content
    if (!content || typeof content !== 'string') return '';
    
    // First, remove highlighted prompts (if any) before processing
    let cleanContent = content;
    if (content.includes('<span class="prompt-highlight')) {
      // Remove highlighted prompt spans but keep their content for processing
      cleanContent = content.replace(/<span class="prompt-highlight[^"]*"[^>]*>/g, '').replace(/<\/span>/g, '');
      console.log("🎨 Removed highlighting spans from content");
    }
    
    // Strip remaining HTML if needed (contenteditable might have formatting)
    const textOnly = cleanContent.replace(/<[^>]*>/g, '').trim();
    
    console.log("🔍 extractUserText input:", content);
    console.log("🧹 After HTML cleanup:", textOnly);
    
    // Split content by extension markers and return only user content
    const lines = textOnly.split('\n');
    let userLines = [];
    let inExtensionBlock = false;
    
    for (let line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Enhanced heuristic: if line looks like an extension prompt, skip it
      const isExtensionPrompt = (
        // Check for highlighting markers (old and new)
        trimmedLine.startsWith('▶') || trimmedLine.startsWith('▷') ||
        trimmedLine.startsWith('🔹') || trimmedLine.startsWith('🔸') ||
        // Check for typical prompt characteristics
        (trimmedLine.length > 80 && (
          trimmedLine.includes('Generate') || 
          trimmedLine.includes('Write') || 
          trimmedLine.includes('Create') || 
          trimmedLine.includes('Provide') ||
          trimmedLine.includes('Give me') ||
          trimmedLine.includes('Compose') ||
          trimmedLine.includes('Format') ||
          trimmedLine.includes('maximum of') ||
          trimmedLine.includes('bullet points')
        ))
      );
      
      if (isExtensionPrompt) {
        console.log("🚫 Erkannt als Extension-Prompt:", trimmedLine.substring(0, 50) + "...");
        inExtensionBlock = true;
        continue;
      }
      
      // If we find a short line after extension block, assume user content starts
      if (inExtensionBlock && trimmedLine.length < 80) {
        inExtensionBlock = false;
      }
      
      if (!inExtensionBlock) {
        console.log("✅ Erkannt als User-Text:", trimmedLine);
        userLines.push(trimmedLine);
      }
    }
    
    const result = userLines.join('\n');
    console.log("👤 Final user text:", result);
    return result;
  }
};

// Backward compatibility functions
function escapeRegex(string) {
  return window.textUtils.escapeRegex(string);
}

function removePromptFromContent(content, promptToRemove) {
  return window.textUtils.removePromptFromContent(content, promptToRemove);
}

function getElementContent(element) {
  return window.textUtils.getElementContent(element);
}

function setElementContent(element, content) {
  return window.textUtils.setElementContent(element, content);
}

function triggerElementUpdate(element) {
  return window.textUtils.triggerElementUpdate(element);
}

function highlightDetectedTextfield() {
  return window.textUtils.highlightDetectedTextfield();
}

function extractUserText(content) {
  return window.textUtils.extractUserText(content);
}

if (window.errorHandler && window.errorHandler.debugMode) {
  console.log("📝 Text Utils initialized");
}