/**
 * SETTINGS MANAGER
 * Handles loading and saving of extension settings
 */

window.settingsManager = {
  // Load settings from localStorage
  loadSettings: function() {
    const state = window.getExtensionState();
    state.extensionSettings.autoOpen = localStorage.getItem('promptEngineerAutoOpen') === 'true';
    
    // Default to true if no setting exists yet
    const savedHighlightSetting = localStorage.getItem('promptEngineerHighlightPrompts');
    state.extensionSettings.highlightPrompts = savedHighlightSetting !== null ? savedHighlightSetting === 'true' : true;
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("⚙️ Settings loaded:", state.extensionSettings);
    }
    
    return state.extensionSettings;
  },

  // Save settings to localStorage
  saveSettings: function() {
    const state = window.getExtensionState();
    localStorage.setItem('promptEngineerAutoOpen', state.extensionSettings.autoOpen.toString());
    localStorage.setItem('promptEngineerHighlightPrompts', state.extensionSettings.highlightPrompts.toString());
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("💾 Settings saved:", state.extensionSettings);
    }
  },

  // Update specific setting
  updateSetting: function(key, value) {
    const state = window.getExtensionState();
    if (state.extensionSettings.hasOwnProperty(key)) {
      state.extensionSettings[key] = value;
      this.saveSettings();
      
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log(`🔧 Setting updated: ${key} = ${value}`);
      }
      
      return true;
    }
    
    console.warn(`⚠️ Unknown setting: ${key}`);
    return false;
  },

  // Get specific setting
  getSetting: function(key) {
    const state = window.getExtensionState();
    return state.extensionSettings[key];
  },

  // Get all settings
  getAllSettings: function() {
    const state = window.getExtensionState();
    return { ...state.extensionSettings };
  },

  // Reset settings to defaults
  resetToDefaults: function() {
    const state = window.getExtensionState();
    state.extensionSettings = {
      autoOpen: false,
      highlightPrompts: true
    };
    this.saveSettings();
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("🔄 Settings reset to defaults");
    }
  }
};

// Backward compatibility functions (to maintain existing code)
function loadSettings() {
  return window.settingsManager.loadSettings();
}

function saveSettings() {
  return window.settingsManager.saveSettings();
}

if (window.errorHandler && window.errorHandler.debugMode) {
  console.log("⚙️ Settings Manager initialized");
}