/**
 * PROSEMIRROR OBSERVER
 * Handles ProseMirror styling and observation for content updates
 */

window.proseMirrorObserver = {
  observer: null,

  // ProseMirror styling observer
  setupObserver: function(targetNode, extensionPrompts) {
    const state = window.getExtensionState();
    
    // Disconnect previous observer
    if (state.proseMirrorObserver) {
      state.proseMirrorObserver.disconnect();
    }
    
    let isApplyingStyling = false; // Flag to prevent infinite loops
    let lastStyleTime = 0; // Throttle styling operations
    const STYLE_THROTTLE_MS = 500; // Minimum time between styling operations
    
    state.proseMirrorObserver = new MutationObserver((mutations) => {
      // Prevent infinite loops caused by our own DOM modifications
      if (isApplyingStyling) {
        return;
      }
      
      // Check if mutations were caused by our highlight spans
      const isOurMutation = mutations.some(mutation => 
        Array.from(mutation.addedNodes).some(node => 
          node.nodeType === Node.ELEMENT_NODE && node.classList?.contains('prompt-highlight')
        )
      );
      
      if (isOurMutation) {
        // Skip mutations caused by our own styling
        return;
      }
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Check if our spans were removed and need re-applying
          const hasHighlights = targetNode.querySelectorAll('.prompt-highlight').length > 0;
          const textContent = targetNode.textContent;
          
          // Only re-apply if we have content but no highlights and throttle is cleared
          const now = Date.now();
          if (textContent && !hasHighlights && (now - lastStyleTime > STYLE_THROTTLE_MS)) {
            isApplyingStyling = true; // Set flag to prevent loops
            lastStyleTime = now;
            
            try {
              // Apply color styling to text that contains our prompts
              extensionPrompts.forEach((prompt, index) => {
                if (textContent.includes(prompt.trim())) {
                  // Try to find and style text nodes containing prompts
                  const walker = document.createTreeWalker(
                    targetNode,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                  );
                  
                  let node;
                  while (node = walker.nextNode()) {
                    if (node.textContent.includes(prompt.trim())) {
                      // Create a span around this text node
                      const parent = node.parentNode;
                      if (parent && !parent.classList.contains('prompt-highlight')) {
                        const span = document.createElement('span');
                        span.className = `prompt-highlight ${index % 2 === 0 ? 'even' : 'odd'}`;
                        span.style.color = index % 2 === 0 ? '#4A9EFF' : '#1E7CE8';
                        span.style.fontWeight = 'bold';
                        
                        parent.insertBefore(span, node);
                        span.appendChild(node);
                        
                        if (window.errorHandler && window.errorHandler.debugMode) {
                          console.log("🔄 Re-applied styling to prompt", index);
                        }
                      }
                    }
                  }
                }
              });
            } finally {
              // Always reset the flag, even if an error occurs
              setTimeout(() => {
                isApplyingStyling = false;
              }, 100);
            }
          }
        }
      });
    });
    
    state.proseMirrorObserver.observe(targetNode, {
      childList: true,
      subtree: true,
      characterData: true
    });

    // Update global reference for backward compatibility
    proseMirrorObserver = state.proseMirrorObserver;
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("👁️ ProseMirror observer setup completed");
    }
  },

  // Disconnect the observer
  disconnect: function() {
    const state = window.getExtensionState();
    if (state.proseMirrorObserver) {
      state.proseMirrorObserver.disconnect();
      state.proseMirrorObserver = null;
      proseMirrorObserver = null;
      
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("👁️ ProseMirror observer disconnected");
      }
    }
  }
};

// Backward compatibility function
function setupProseMirrorObserver(targetNode, extensionPrompts) {
  return window.proseMirrorObserver.setupObserver(targetNode, extensionPrompts);
}

// Clean up observer on page unload
if (!window.proseMirrorCleanupRegistered) {
  window.addEventListener('beforeunload', () => {
    window.proseMirrorObserver.disconnect();
  });
  window.proseMirrorCleanupRegistered = true;
}

if (window.errorHandler && window.errorHandler.debugMode) {
  console.log("👁️ ProseMirror Observer initialized");
}