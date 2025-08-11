/**
 * Global Error Handler for Chrome Extension
 * Provides centralized error handling, logging, and user feedback
 */

class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 50; // Keep only last 50 errors in memory
    this.debugMode = this.isDebugMode();
    
    // Set up global error listeners
    this.setupErrorListeners();
    
    // Additional ResizeObserver error suppression
    this.suppressResizeObserverErrors();
  }
  
  /**
   * Suppress ResizeObserver errors at console level
   */
  suppressResizeObserverErrors() {
    // Override console.error to filter out ResizeObserver errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ').toString();
      if (message.includes('ResizeObserver loop completed') || 
          message.includes('ResizeObserver loop limit') ||
          message.includes('ResizeObserver')) {
        // Suppress ResizeObserver errors completely
        return;
      }
      originalConsoleError.apply(console, args);
    };
    
    // Override console.warn for ResizeObserver warnings
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      const message = args.join(' ').toString();
      if (message.includes('ResizeObserver')) {
        return;
      }
      originalConsoleWarn.apply(console, args);
    };
  }
  
  /**
   * Check if extension is in debug mode
   * @returns {boolean}
   */
  isDebugMode() {
    // Check localStorage for debug setting
    const debugSetting = localStorage.getItem('promptEngineerDebugMode');
    // Also check for development environment
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';
    return debugSetting === 'true' || isDev;
  }
  
  /**
   * Set up global error listeners
   */
  setupErrorListeners() {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      // Prevent ResizeObserver errors from being logged
      if (event.message && (
        event.message.includes('ResizeObserver') ||
        event.message.includes('ResizeObserver loop completed') ||
        event.message.includes('ResizeObserver loop limit')
      )) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
      
      this.handleError({
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error,
        type: 'uncaught'
      });
    });
    
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        error: event.reason,
        type: 'promise'
      });
    });
  }
  
  /**
   * Handle an error
   * @param {Object} errorInfo - Error information
   */
  handleError(errorInfo) {
    // Filter out known non-critical browser errors
    if (this.isIgnorableError(errorInfo)) {
      return; // Don't process ignorable errors
    }
    
    // Create error record
    const errorRecord = {
      timestamp: new Date().toISOString(),
      ...errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Store error
    this.errors.push(errorRecord);
    
    // Trim error history if needed
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
    
    // Log error based on mode
    this.logError(errorRecord);
    
    // Show user feedback for critical errors
    if (errorInfo.critical) {
      this.showUserError(errorInfo.userMessage || 'Ein Fehler ist aufgetreten');
    }
  }
  
  /**
   * Check if error should be ignored (non-critical browser issues)
   * @param {Object} errorInfo - Error information
   * @returns {boolean} - True if error should be ignored
   */
  isIgnorableError(errorInfo) {
    const message = errorInfo.message || '';
    
    // Ignore ResizeObserver errors (browser optimization issues)
    if (message.includes('ResizeObserver loop completed with undelivered notifications') ||
        message.includes('ResizeObserver loop limit exceeded')) {
      return true;
    }
    
    // Ignore other common non-critical browser errors
    const ignorablePatterns = [
      'Non-Error promise rejection captured',
      'Script error',
      'Network request failed',
      'Loading chunk',
      'Loading CSS chunk'
    ];
    
    return ignorablePatterns.some(pattern => message.includes(pattern));
  }
  
  /**
   * Log error based on debug mode
   * @param {Object} errorRecord - Error record to log
   */
  logError(errorRecord) {
    if (this.debugMode) {
      console.group('🔴 PromptEngineer Error');
      console.error('Message:', errorRecord.message);
      if (errorRecord.source) console.error('Source:', errorRecord.source);
      if (errorRecord.line) console.error('Line:', errorRecord.line);
      if (errorRecord.error && errorRecord.error.stack) {
        console.error('Stack:', errorRecord.error.stack);
      }
      console.error('Full Error:', errorRecord);
      console.groupEnd();
    } else {
      // In production, only log minimal info
      console.error('PromptEngineer Error:', errorRecord.message);
    }
  }
  
  /**
   * Show error message to user
   * @param {string} message - Error message to display
   */
  showUserError(message) {
    // Check if error notification already exists
    let errorNotification = document.getElementById('prompt-engineer-error');
    
    if (!errorNotification) {
      errorNotification = document.createElement('div');
      errorNotification.id = 'prompt-engineer-error';
      errorNotification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10001;
        max-width: 300px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
      `;
      
      const closeButton = document.createElement('button');
      closeButton.textContent = '×';
      closeButton.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
      `;
      closeButton.onclick = () => errorNotification.remove();
      
      const messageSpan = document.createElement('span');
      messageSpan.textContent = message;
      
      errorNotification.appendChild(messageSpan);
      errorNotification.appendChild(closeButton);
      document.body.appendChild(errorNotification);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (errorNotification && errorNotification.parentNode) {
          errorNotification.remove();
        }
      }, 5000);
    } else {
      // Update existing notification
      const messageSpan = errorNotification.querySelector('span');
      if (messageSpan) {
        messageSpan.textContent = message;
      }
    }
  }
  
  /**
   * Wrap a function with error handling
   * @param {Function} fn - Function to wrap
   * @param {string} context - Context for error messages
   * @param {*} fallbackValue - Fallback value on error
   * @returns {Function} - Wrapped function
   */
  wrapFunction(fn, context = 'Unknown', fallbackValue = null) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError({
          message: `Error in ${context}: ${error.message}`,
          error: error,
          context: context,
          type: 'wrapped'
        });
        return fallbackValue;
      }
    };
  }
  
  /**
   * Wrap an async function with retry logic
   * @param {Function} fn - Async function to wrap
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} delay - Delay between retries in ms
   * @param {string} context - Context for error messages
   * @returns {Function} - Wrapped function
   */
  wrapWithRetry(fn, maxRetries = 3, delay = 1000, context = 'Unknown') {
    return async (...args) => {
      let lastError;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await fn(...args);
        } catch (error) {
          lastError = error;
          
          if (attempt < maxRetries) {
            if (this.debugMode) {
              console.log(`⚠️ Retry ${attempt}/${maxRetries} for ${context} after ${delay}ms`);
            }
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // All retries failed
      this.handleError({
        message: `Failed after ${maxRetries} retries in ${context}: ${lastError.message}`,
        error: lastError,
        context: context,
        type: 'retry-failed',
        critical: true,
        userMessage: `Operation fehlgeschlagen nach ${maxRetries} Versuchen`
      });
      
      throw lastError;
    };
  }
  
  /**
   * Get error statistics
   * @returns {Object} - Error statistics
   */
  getStats() {
    const stats = {
      total: this.errors.length,
      byType: {},
      recent: this.errors.slice(-10)
    };
    
    this.errors.forEach(error => {
      const type = error.type || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });
    
    return stats;
  }
  
  /**
   * Clear error history
   */
  clearErrors() {
    this.errors = [];
    console.log('✅ Error history cleared');
  }
  
  /**
   * Export errors for debugging
   * @returns {string} - JSON string of errors
   */
  exportErrors() {
    return JSON.stringify(this.errors, null, 2);
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Helper functions for easy use
const safeExecute = (fn, context, fallback) => 
  errorHandler.wrapFunction(fn, context, fallback);

const executeWithRetry = (fn, maxRetries, delay, context) => 
  errorHandler.wrapWithRetry(fn, maxRetries, delay, context);

// Export for use in extension
window.ErrorHandler = ErrorHandler;
window.errorHandler = errorHandler;
window.safeExecute = safeExecute;
window.executeWithRetry = executeWithRetry;

// Debug helpers
window.getErrorStats = () => errorHandler.getStats();
window.clearErrors = () => errorHandler.clearErrors();
window.exportErrors = () => errorHandler.exportErrors();