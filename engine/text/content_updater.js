/**
 * CONTENT UPDATER
 * Handles text field content updates and highlighting functionality
 */

window.contentUpdater = {
  // Main function to update textfield content
  updateTextfieldContent: function() {
    const state = window.getExtensionState();
    
    // Prevent execution during initialization phase
    if (state.isInitializing) {
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("⚠️ updateTextfieldContent: Skipped during initialization");
      }
      return;
    }
    
    const targetNode = document.querySelector(window.getSelector());
    if (!targetNode) {
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("⚠️ updateTextfieldContent: Kein targetNode gefunden");
      }
      return;
    }

    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("🔄 updateTextfieldContent: Starte Update...");
      console.log("📊 Active prompts:", state.activePrompts);
      console.log("📦 Prompt history active:", Array.from(state.promptHistory.active));
    }

    // Get current content
    let currentContent = window.textUtils.getElementContent(targetNode);
    
    // Extract and preserve user's own text
    // We do this by removing all known extension prompts from the current content
    let cleanedContent = currentContent;
    
    // Remove all known extension prompts (both active and inactive) to isolate user text
    state.promptHistory.all.forEach(knownPrompt => {
      cleanedContent = window.textUtils.removePromptFromContent(cleanedContent, knownPrompt);
    });
    
    // What remains is the user's own text
    state.userOwnText = cleanedContent.trim();
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("👤 Extracted user text:", state.userOwnText);
    }
    
    // Build list of currently active extension prompts
    let activeExtensionPrompts = [];
    
    // Add dropdown prompts
    state.activePrompts.dropdowns.forEach(promptObj => {
      if (promptObj.text && promptObj.text.trim()) {
        const prompt = promptObj.text.trim();
        activeExtensionPrompts.push(prompt);
        state.promptHistory.all.add(prompt);
        state.promptHistory.active.add(prompt);
      }
    });
    
    // Add checkbox prompts
    state.activePrompts.checkboxes.forEach(prompt => {
      if (prompt && prompt.trim()) {
        const trimmedPrompt = prompt.trim();
        activeExtensionPrompts.push(trimmedPrompt);
        state.promptHistory.all.add(trimmedPrompt);
        state.promptHistory.active.add(trimmedPrompt);
      }
    });
    
    // Add input prompts
    state.activePrompts.inputs.forEach(promptObj => {
      if (promptObj.text && promptObj.text.trim()) {
        const prompt = promptObj.text.trim();
        activeExtensionPrompts.push(prompt);
        state.promptHistory.all.add(prompt);
        state.promptHistory.active.add(prompt);
      }
    });

    // Add category prompts
    if (state.activePrompts.categories) {
      Object.values(state.activePrompts.categories).forEach(promptObj => {
        if (promptObj.value && promptObj.value.trim()) {
          const prompt = promptObj.value.trim();
          activeExtensionPrompts.push(prompt);
          state.promptHistory.all.add(prompt);
          state.promptHistory.active.add(prompt);
        }
      });
    }
    
    // Clean up prompt history - remove inactive prompts
    state.promptHistory.active.forEach(prompt => {
      const isStillActive = activeExtensionPrompts.includes(prompt);
      if (!isStillActive) {
        state.promptHistory.active.delete(prompt);
      }
    });
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("🎯 Active extension prompts:", activeExtensionPrompts);
    }
    
    // Build new content: Extension prompts + User text
    let newContent = '';
    
    if (activeExtensionPrompts.length > 0) {
      if (state.extensionSettings.highlightPrompts && targetNode.contentEditable === 'true') {
        // Apply highlighting for contenteditable elements
        targetNode.textContent = '';
        
        // Add extension prompts with highlighting
        activeExtensionPrompts.forEach((prompt, index) => {
          const className = index % 2 === 0 ? 'even' : 'odd';
          
          const span = document.createElement('span');
          span.className = `prompt-highlight ${className}`;
          span.textContent = prompt;
          span.style.color = className === 'even' ? '#4A9EFF' : '#1E7CE8';
          span.style.fontWeight = 'bold';
          
          targetNode.appendChild(span);
          
          if (index < activeExtensionPrompts.length - 1) {
            targetNode.appendChild(document.createElement('br'));
            targetNode.appendChild(document.createElement('br'));
          }
        });
        
        // Add separator between extension prompts and user text
        if (state.userOwnText) {
          targetNode.appendChild(document.createElement('br'));
          targetNode.appendChild(document.createElement('br'));
          targetNode.appendChild(document.createTextNode(state.userOwnText));
        }
        
        if (window.errorHandler && window.errorHandler.debugMode) {
          console.log("✨ Applied highlighting to prompts:", activeExtensionPrompts.length);
        }
        
        // Set up observer for ProseMirror if needed (only after initialization)
        if (!state.isInitializing && targetNode.classList.contains('ProseMirror')) {
          window.proseMirrorObserver.setupObserver(targetNode, activeExtensionPrompts);
        }
      } else {
        // No highlighting or textarea element - use plain text
        if (activeExtensionPrompts.length > 0) {
          newContent = activeExtensionPrompts.join('\n\n');
        }
        
        if (state.userOwnText) {
          if (newContent) {
            newContent += '\n\n' + state.userOwnText;
          } else {
            newContent = state.userOwnText;
          }
        }
        
        // Set the combined content
        window.textUtils.setElementContent(targetNode, newContent);
      }
    } else {
      // No extension prompts active, just restore user text
      window.textUtils.setElementContent(targetNode, state.userOwnText);
    }
    
    // Trigger appropriate events
    window.textUtils.triggerElementUpdate(targetNode);
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("✅ updateTextfieldContent: Update abgeschlossen");
    }
  }
};

// Backward compatibility function
function updateTextfieldContent() {
  return window.contentUpdater.updateTextfieldContent();
}

if (window.errorHandler && window.errorHandler.debugMode) {
  console.log("🔄 Content Updater initialized");
}