/**
 * ResourceManager - Centralized management for DOM resources to prevent memory leaks
 * Tracks and cleans up event listeners, timeouts, intervals, and observers
 */
class ResourceManager {
  constructor() {
    this.eventListeners = [];
    this.timeouts = new Set();
    this.intervals = new Set();
    this.observers = [];
    this.abortControllers = [];
    
    // Bind cleanup to window unload
    this.handleUnload = this.cleanup.bind(this);
    window.addEventListener('beforeunload', this.handleUnload);
  }
  
  /**
   * Add event listener with tracking
   * @param {HTMLElement} element - Target element
   * @param {string} eventType - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event listener options
   */
  addEventListener(element, eventType, handler, options = false) {
    if (!element || !eventType || !handler) {
      console.error('Invalid addEventListener parameters');
      return;
    }
    
    // Store reference for later cleanup
    this.eventListeners.push({
      element,
      eventType,
      handler,
      options
    });
    
    // Add the actual event listener
    element.addEventListener(eventType, handler, options);
  }
  
  /**
   * Remove specific event listener
   * @param {HTMLElement} element - Target element
   * @param {string} eventType - Event type
   * @param {Function} handler - Event handler
   */
  removeEventListener(element, eventType, handler) {
    // Remove from tracking
    this.eventListeners = this.eventListeners.filter(listener => 
      !(listener.element === element && 
        listener.eventType === eventType && 
        listener.handler === handler)
    );
    
    // Remove actual listener
    element.removeEventListener(eventType, handler);
  }
  
  /**
   * Set timeout with tracking
   * @param {Function} callback - Timeout callback
   * @param {number} delay - Delay in milliseconds
   * @returns {number} - Timeout ID
   */
  setTimeout(callback, delay) {
    const timeoutId = setTimeout(() => {
      this.timeouts.delete(timeoutId);
      callback();
    }, delay);
    
    this.timeouts.add(timeoutId);
    return timeoutId;
  }
  
  /**
   * Clear timeout and remove from tracking
   * @param {number} timeoutId - Timeout ID to clear
   */
  clearTimeout(timeoutId) {
    if (this.timeouts.has(timeoutId)) {
      clearTimeout(timeoutId);
      this.timeouts.delete(timeoutId);
    }
  }
  
  /**
   * Set interval with tracking
   * @param {Function} callback - Interval callback
   * @param {number} delay - Delay in milliseconds
   * @returns {number} - Interval ID
   */
  setInterval(callback, delay) {
    const intervalId = setInterval(callback, delay);
    this.intervals.add(intervalId);
    return intervalId;
  }
  
  /**
   * Clear interval and remove from tracking
   * @param {number} intervalId - Interval ID to clear
   */
  clearInterval(intervalId) {
    if (this.intervals.has(intervalId)) {
      clearInterval(intervalId);
      this.intervals.delete(intervalId);
    }
  }
  
  /**
   * Create and track MutationObserver
   * @param {Function} callback - Observer callback
   * @returns {MutationObserver} - New observer instance
   */
  createMutationObserver(callback) {
    const observer = new MutationObserver(callback);
    this.observers.push(observer);
    return observer;
  }
  
  /**
   * Disconnect and remove observer
   * @param {MutationObserver} observer - Observer to disconnect
   */
  disconnectObserver(observer) {
    if (observer) {
      observer.disconnect();
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    }
  }
  
  /**
   * Create AbortController for fetch requests
   * @returns {AbortController} - New AbortController instance
   */
  createAbortController() {
    const controller = new AbortController();
    this.abortControllers.push(controller);
    return controller;
  }
  
  /**
   * Remove AbortController from tracking
   * @param {AbortController} controller - Controller to remove
   */
  removeAbortController(controller) {
    const index = this.abortControllers.indexOf(controller);
    if (index > -1) {
      this.abortControllers.splice(index, 1);
    }
  }
  
  /**
   * Clean up all tracked resources
   */
  cleanup() {
    console.log('🧹 ResourceManager: Starting cleanup...');
    
    // Remove all event listeners
    this.eventListeners.forEach(({ element, eventType, handler, options }) => {
      try {
        element.removeEventListener(eventType, handler, options);
      } catch (e) {
        console.error('Error removing event listener:', e);
      }
    });
    this.eventListeners = [];
    
    // Clear all timeouts
    this.timeouts.forEach(timeoutId => {
      try {
        clearTimeout(timeoutId);
      } catch (e) {
        console.error('Error clearing timeout:', e);
      }
    });
    this.timeouts.clear();
    
    // Clear all intervals
    this.intervals.forEach(intervalId => {
      try {
        clearInterval(intervalId);
      } catch (e) {
        console.error('Error clearing interval:', e);
      }
    });
    this.intervals.clear();
    
    // Disconnect all observers
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (e) {
        console.error('Error disconnecting observer:', e);
      }
    });
    this.observers = [];
    
    // Abort all pending fetch requests
    this.abortControllers.forEach(controller => {
      try {
        controller.abort();
      } catch (e) {
        console.error('Error aborting request:', e);
      }
    });
    this.abortControllers = [];
    
    console.log('✅ ResourceManager: Cleanup complete');
  }
  
  /**
   * Get resource statistics
   * @returns {Object} - Current resource counts
   */
  getStats() {
    return {
      eventListeners: this.eventListeners.length,
      timeouts: this.timeouts.size,
      intervals: this.intervals.size,
      observers: this.observers.length,
      abortControllers: this.abortControllers.length
    };
  }
  
  /**
   * Destroy the resource manager itself
   */
  destroy() {
    this.cleanup();
    window.removeEventListener('beforeunload', this.handleUnload);
  }
}

// Create singleton instance
const resourceManager = new ResourceManager();

// Export for use in extension
window.ResourceManager = ResourceManager;
window.resourceManager = resourceManager;

// Debug helper
window.getResourceStats = () => resourceManager.getStats();