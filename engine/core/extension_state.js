/**
 * EXTENSION STATE MANAGEMENT
 * Global variables and state management for the PromptEngineer extension
 */

// Core extension state
// Prevent double initialization
if (!window.extensionState) {
  window.extensionState = {
  // Configuration flags
  firstDropdownsUnhidable: 6,
  dropdownsAdded: false,
  initCalled: false,
  isInitializing: true, // Flag to prevent unwanted updateTextfieldContent calls during init
  
  // Core objects
  container: null,
  xmlData: null,
  combinedText: null,
  
  // Active prompts tracking
  activePrompts: {
    checkboxes: [],
    dropdowns: [],
    inputs: [],
    categories: {}  // New: Category-based prompts
  },
  
  // Separate tracking for user's own text
  userOwnText: '',
  
  // Prompt history for exact tracking
  promptHistory: {
    all: new Set(),      // All prompts ever used
    active: new Set(),   // Currently active prompts
    lastKnownContent: '' // Last known full content for comparison
  },
  
  // Observer management
  mainObserver: null,
  proseMirrorObserver: null,
  observerRetryCount: 0,
  MAX_OBSERVER_RETRIES: 5,
  
  // Settings management
  extensionSettings: {
    autoOpen: false,
    highlightPrompts: true  // Default to true for testing
  }
  };
}

// Make state accessible globally (for backward compatibility)
// Check if variables already exist to prevent double declaration errors
if (typeof firstDropdownsUnhidable === 'undefined') {
  var firstDropdownsUnhidable = window.extensionState.firstDropdownsUnhidable;
  var dropdownsAdded = window.extensionState.dropdownsAdded;
  var initCalled = window.extensionState.initCalled;
  var isInitializing = window.extensionState.isInitializing;
  var container = window.extensionState.container;
  var xmlData = window.extensionState.xmlData;
  var combinedText = window.extensionState.combinedText;
  var activePrompts = window.extensionState.activePrompts;
  var userOwnText = window.extensionState.userOwnText;
  var promptHistory = window.extensionState.promptHistory;
  var mainObserver = window.extensionState.mainObserver;
  var observerRetryCount = window.extensionState.observerRetryCount;
  var MAX_OBSERVER_RETRIES = window.extensionState.MAX_OBSERVER_RETRIES;
  var extensionSettings = window.extensionState.extensionSettings;
}

// State management functions
window.extensionState.resetPromptState = function() {
  this.activePrompts = {
    checkboxes: [],
    dropdowns: [],
    inputs: [],
    categories: {}  // Reset category prompts
  };
  
  this.promptHistory = {
    all: new Set(),
    active: new Set(),
    lastKnownContent: ''
  };
  
  this.userOwnText = '';
  
  // Update global references
  activePrompts = this.activePrompts;
  promptHistory = this.promptHistory;
  userOwnText = this.userOwnText;
};

window.extensionState.updateContainer = function(newContainer) {
  this.container = newContainer;
  container = newContainer;
};

window.extensionState.setInitializing = function(value) {
  this.isInitializing = value;
  isInitializing = value;
  window.isInitializing = value;
};

window.extensionState.setInitCalled = function(value) {
  this.initCalled = value;
  initCalled = value;
};

window.extensionState.setDropdownsAdded = function(value) {
  this.dropdownsAdded = value;
  dropdownsAdded = value;
};

// Export for modules that need direct access
window.getExtensionState = function() {
  return window.extensionState;
};

if (window.errorHandler && window.errorHandler.debugMode) {
  console.log("📊 Extension State Management initialized");
}