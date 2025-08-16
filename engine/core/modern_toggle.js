/**
 * MODERN TOGGLE SYSTEM
 * Modern, animated toggle button with smart positioning and state management
 */

// Lucide Icons for toggle states
window.TOGGLE_ICONS = {
  closed: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><path d="M15 3v18"></path><path d="m8 9 3 3-3 3"></path></svg>`, // PanelRightOpen
  open: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><path d="M15 3v18"></path><path d="m10 9-3 3 3 3"></path></svg>`, // PanelRightClose
  loading: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.28 0 2.5.27 3.6.75"></path></svg>` // Loader
};

// Modern Toggle System
window.modernToggle = {
  
  // Toggle button element
  button: null,
  
  // Current state
  isOpen: false,
  isAnimating: false,
  
  // Configuration
  config: {
    buttonSize: 56,
    margin: 20,
    animationDuration: 300,
    rippleEnabled: true
  },

  // Initialize the modern toggle system
  init: function() {
    // Detect current sidebar state
    this.isOpen = this.isSidebarOpen();
    
    this.createToggleButton();
    this.setupEventListeners();
    this.updateButtonState();
    this.updateButtonPosition();
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log(`🎛️ Modern Toggle System initialized - Sidebar ${this.isOpen ? 'open' : 'closed'}`);
    }
  },

  // Create the modern toggle button
  createToggleButton: function() {
    // Remove existing toggle button
    const existingToggle = document.querySelector('.toggle-button, .modern-toggle-button');
    if (existingToggle) {
      existingToggle.remove();
    }

    // Create new modern toggle button
    this.button = document.createElement('button');
    this.button.className = 'modern-toggle-button';
    this.button.setAttribute('aria-label', 'Toggle PromptEngineer Sidebar');
    this.button.setAttribute('type', 'button');
    
    // Create icon container
    const iconContainer = document.createElement('div');
    iconContainer.className = 'toggle-icon-container';
    if (window.TOGGLE_ICONS && window.TOGGLE_ICONS.closed) {
      if (window.DOMUtils) {
        const svgElement = window.DOMUtils.createSVGFromString(window.TOGGLE_ICONS.closed);
        if (svgElement) {
          iconContainer.appendChild(svgElement);
        } else {
          console.warn('Failed to create toggle SVG, using fallback');
          iconContainer.textContent = '▶'; // Fallback
        }
      } else {
        console.warn('DOMUtils not available for toggle, using fallback');
        iconContainer.textContent = '▶'; // Fallback
      }
    } else {
      console.warn('TOGGLE_ICONS not available, using fallback');
      iconContainer.textContent = '▶'; // Fallback
    }
    this.button.appendChild(iconContainer);

    // Create ripple container
    if (this.config.rippleEnabled) {
      const rippleContainer = document.createElement('div');
      rippleContainer.className = 'toggle-ripple-container';
      this.button.appendChild(rippleContainer);
    }

    // Add to DOM
    document.body.appendChild(this.button);
    
    // Initial positioning
    this.updateButtonPosition();
  },

  // Setup event listeners
  setupEventListeners: function() {
    if (!this.button) return;

    // Click handler
    this.button.addEventListener('click', (e) => {
      this.handleToggleClick(e);
    });

    // Hover handlers for micro-interactions
    this.button.addEventListener('mouseenter', () => {
      if (!this.isAnimating) {
        this.button.classList.add('hover');
      }
    });

    this.button.addEventListener('mouseleave', () => {
      this.button.classList.remove('hover');
    });

    // Window resize handler for responsive positioning
    window.addEventListener('resize', () => {
      this.updateButtonPosition();
    });

    // Listen for sidebar state changes
    document.addEventListener('sidebarStateChange', (e) => {
      this.isOpen = e.detail.isOpen;
      this.updateButtonState();
      this.updateButtonPosition();
    });
  },

  // Handle toggle button click
  handleToggleClick: function(e) {
    if (this.isAnimating) return;

    // Create ripple effect
    if (this.config.rippleEnabled) {
      this.createRippleEffect(e);
    }

    // Toggle sidebar
    this.toggleSidebar();
  },

  // Create ripple effect on click
  createRippleEffect: function(e) {
    const rippleContainer = this.button.querySelector('.toggle-ripple-container');
    if (!rippleContainer) return;

    const ripple = document.createElement('div');
    ripple.className = 'toggle-ripple';
    
    const rect = this.button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    rippleContainer.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  },

  // Toggle sidebar state
  toggleSidebar: function() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.showLoadingState();

    // Toggle the sidebar
    const container = document.getElementById('prompt-generator-container');
    const body = document.body;
    
    if (container) {
      const willBeOpen = container.classList.contains('hidden');
      
      if (willBeOpen) {
        // Opening sidebar
        container.classList.remove('hidden');
        body.classList.add('prompt-engineer-active');
        this.isOpen = true;
      } else {
        // Closing sidebar
        container.classList.add('hidden');
        body.classList.remove('prompt-engineer-active');
        this.isOpen = false;
      }

      // Dispatch state change event
      const event = new CustomEvent('sidebarStateChange', {
        detail: { isOpen: this.isOpen }
      });
      document.dispatchEvent(event);

      // Update button after animation delay
      setTimeout(() => {
        this.updateButtonState();
        this.updateButtonPosition();
        this.isAnimating = false;
      }, this.config.animationDuration);
      
    } else {
      console.warn('⚠️ Sidebar container not found');
      this.isAnimating = false;
      this.updateButtonState();
    }
  },

  // Show loading state
  showLoadingState: function() {
    const iconContainer = this.button.querySelector('.toggle-icon-container');
    if (iconContainer) {
      // Clear existing content
      while (iconContainer.firstChild) {
        iconContainer.removeChild(iconContainer.firstChild);
      }
      
      if (window.TOGGLE_ICONS && window.TOGGLE_ICONS.loading && window.DOMUtils) {
        const svgElement = window.DOMUtils.createSVGFromString(window.TOGGLE_ICONS.loading);
        if (svgElement) {
          iconContainer.appendChild(svgElement);
        } else {
          iconContainer.textContent = '⏳'; // Fallback
        }
      } else {
        iconContainer.textContent = '⏳'; // Fallback
      }
      iconContainer.classList.add('loading');
    }
  },

  // Update button state (icon and tooltip)
  updateButtonState: function() {
    if (!this.button) return;

    const iconContainer = this.button.querySelector('.toggle-icon-container');
    
    if (iconContainer) {
      iconContainer.classList.remove('loading');
      
      // Update icon based on state
      // Clear existing content
      while (iconContainer.firstChild) {
        iconContainer.removeChild(iconContainer.firstChild);
      }
      
      const newIcon = this.isOpen ? window.TOGGLE_ICONS.open : window.TOGGLE_ICONS.closed;
      if (newIcon && window.DOMUtils) {
        const svgElement = window.DOMUtils.createSVGFromString(newIcon);
        if (svgElement) {
          iconContainer.appendChild(svgElement);
        } else {
          iconContainer.textContent = this.isOpen ? '◀' : '▶'; // Fallback
        }
      } else {
        iconContainer.textContent = this.isOpen ? '◀' : '▶'; // Fallback
      }
      
      // Update tooltip
      const tooltip = this.isOpen ? 'Close PromptEngineer' : 'Open PromptEngineer';
      this.button.setAttribute('aria-label', tooltip);
      this.button.title = tooltip;
    }

    // Update button state class
    this.button.classList.toggle('open', this.isOpen);
  },

  // Update button position based on sidebar state
  updateButtonPosition: function() {
    if (!this.button) return;

    const container = document.getElementById('prompt-generator-container');
    let sidebarWidth = 0;

    if (this.isOpen && container) {
      // Get actual sidebar width
      const containerStyles = window.getComputedStyle(container);
      sidebarWidth = parseInt(containerStyles.width) || 0;
    }

    // Calculate new position
    const rightPosition = this.config.margin + sidebarWidth;
    
    // Apply position with smooth transition
    this.button.style.right = `${rightPosition}px`;
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log(`🎛️ Toggle position updated: right=${rightPosition}px, sidebarWidth=${sidebarWidth}px`);
    }
  },

  // Get current sidebar width
  getSidebarWidth: function() {
    const container = document.getElementById('prompt-generator-container');
    if (!container || !this.isOpen) return 0;
    
    const styles = window.getComputedStyle(container);
    return parseInt(styles.width) || 0;
  },

  // Cleanup function
  destroy: function() {
    if (this.button) {
      this.button.remove();
      this.button = null;
    }
    
    window.removeEventListener('resize', this.updateButtonPosition);
    document.removeEventListener('sidebarStateChange', this.updateButtonState);
  },

  // Check if sidebar is currently open
  isSidebarOpen: function() {
    const container = document.getElementById('prompt-generator-container');
    const body = document.body;
    
    return container && 
           !container.classList.contains('hidden') && 
           body.classList.contains('prompt-engineer-active');
  }
};

// Initialize after a short delay to ensure other components are ready
function initializeModernToggle() {
  // Wait for container to be created
  const checkContainer = () => {
    const container = document.getElementById('prompt-generator-container');
    if (container) {
      window.modernToggle.init();
    } else {
      // Retry after 100ms
      setTimeout(checkContainer, 100);
    }
  };
  
  // Start checking after 1 second to allow other scripts to load
  setTimeout(checkContainer, 1000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeModernToggle);
} else {
  initializeModernToggle();
}

// Backward compatibility
window.toggleContainer = function() {
  window.modernToggle.toggleSidebar();
};

if (window.errorHandler && window.errorHandler.debugMode) {
  console.log("🎛️ Modern Toggle System loaded");
}