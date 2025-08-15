/**
 * CONTAINER MANAGER
 * Handles container creation, visibility management, and DOM manipulation
 */

window.containerManager = {
  // Create the main extension container
  createContainer: function() {
    const state = window.getExtensionState();
    const container = document.createElement("div");
    container.id = "prompt-generator-container";
    container.classList.add("prompt-generator-container");
    
    // Check auto-open setting
    if (state.extensionSettings.autoOpen) {
      // Start visible if auto-open is enabled
    } else {
      // Start hidden for bottom menu
      container.classList.add("hidden");
    }

    // Update state
    state.updateContainer(container);
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("📦 Container created:", container.id);
    }

    return container;
  },

  // Remove existing container from DOM
  removeExistingContainer: function() {
    const existingContainer = document.getElementById('prompt-generator-container');
    if (existingContainer) {
      existingContainer.remove();
      
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("🗑️ Existing container removed");
      }
    }
  },

  // Toggle container visibility
  toggleContainerVisibility: function() {
    const state = window.getExtensionState();
    const container = state.container;
    
    if (!container) {
      console.warn("⚠️ Container not found for visibility toggle");
      return;
    }
    
    if (this.isContainerOpen()) {
      container.classList.add('hidden');
      document.body.classList.remove('prompt-engineer-active');
      
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("📦 Container hidden");
      }
    } else {
      container.classList.remove('hidden');
      document.body.classList.add('prompt-engineer-active');
      
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("📦 Container shown");
      }
    }
  },

  // Check if container is currently visible
  isContainerOpen: function() {
    const state = window.getExtensionState();
    const container = state.container;
    
    if (!container) {
      return false;
    }
    
    // Check if the container is visible by examining the display style
    const computedStyle = window.getComputedStyle(container);
    return computedStyle.display !== "none" && !container.classList.contains('hidden');
  },

  // Get current container reference
  getContainer: function() {
    const state = window.getExtensionState();
    return state.container;
  },

  // Append container to DOM
  appendToDOM: function(container) {
    if (!container) {
      console.error("❌ Cannot append null container to DOM");
      return;
    }
    
    // Always append to body as last element for bottom menu
    document.body.appendChild(container);
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("📦 Container appended to DOM");
    }
  }
};

// Backward compatibility functions
function createContainer() {
  return window.containerManager.createContainer();
}

function removeExistingContainer() {
  return window.containerManager.removeExistingContainer();
}

function toggleContainerVisibility() {
  return window.containerManager.toggleContainerVisibility();
}

function isContainerOpen() {
  return window.containerManager.isContainerOpen();
}

if (window.errorHandler && window.errorHandler.debugMode) {
  console.log("📦 Container Manager initialized");
}