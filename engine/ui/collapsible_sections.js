/**
 * COLLAPSIBLE SECTIONS SYSTEM
 * Wiederverwendbare Komponente für auf-/zuklappbare Bereiche mit State Persistence
 */

// Lucide Icons für Collapsible States
window.COLLAPSIBLE_ICONS = {
  expanded: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`, // ChevronDown
  collapsed: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>` // ChevronRight
};

// Collapsible Sections Manager
window.collapsibleSections = {
  
  // Configuration
  config: {
    animationDuration: 300,
    storagePrefix: 'promptEngineer_',
    defaultState: false // false = expanded, true = collapsed
  },
  
  // Initialize collapsible functionality for a section
  init: function(sectionId, options = {}) {
    const settings = {
      storageKey: options.storageKey || `${this.config.storagePrefix}${sectionId}_collapsed`,
      headerSelector: options.headerSelector || `.${sectionId}-header`,
      contentSelector: options.contentSelector || `.${sectionId}-content`,
      defaultCollapsed: options.defaultCollapsed || this.config.defaultState,
      onToggle: options.onToggle || null,
      accessibility: options.accessibility || {
        expandedLabel: 'Section expanded, click to collapse',
        collapsedLabel: 'Section collapsed, click to expand'
      }
    };
    
    const header = document.querySelector(settings.headerSelector);
    const content = document.querySelector(settings.contentSelector);
    
    if (!header || !content) {
      console.warn(`⚠️ Collapsible section elements not found for ${sectionId}`);
      return false;
    }
    
    // Load saved state
    const isCollapsed = this.loadState(settings.storageKey, settings.defaultCollapsed);
    
    // Setup header as clickable
    this.setupHeader(header, sectionId, settings);
    
    // Setup content container
    this.setupContent(content, sectionId);
    
    // Set initial state
    this.setState(sectionId, isCollapsed, false); // No animation on init
    
    // Store settings for later use
    this.storeSectionSettings(sectionId, settings);
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log(`🔧 Collapsible section initialized: ${sectionId}, collapsed: ${isCollapsed}`);
    }
    
    return true;
  },
  
  // Setup clickable header
  setupHeader: function(header, sectionId, settings) {
    // Add collapsible header class
    header.classList.add('collapsible-header');
    header.setAttribute('data-section', sectionId);
    
    // Make header focusable and add ARIA attributes
    header.setAttribute('tabindex', '0');
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', 'true');
    
    // Add icon container if not exists
    let iconContainer = header.querySelector('.collapsible-icon');
    if (!iconContainer) {
      iconContainer = document.createElement('span');
      iconContainer.className = 'collapsible-icon';
      if (window.COLLAPSIBLE_ICONS && window.COLLAPSIBLE_ICONS.expanded && window.DOMUtils) {
        const svgElement = window.DOMUtils.createSVGFromString(window.COLLAPSIBLE_ICONS.expanded);
        if (svgElement) {
          iconContainer.appendChild(svgElement);
        } else {
          iconContainer.textContent = '▼'; // Fallback
        }
      } else {
        iconContainer.textContent = '▼'; // Fallback
      }
      header.appendChild(iconContainer);
    }
    
    // Add click handler
    header.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggle(sectionId);
    });
    
    // Add keyboard handler
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle(sectionId);
      }
    });
    
    // Add hover effects
    header.addEventListener('mouseenter', () => {
      header.classList.add('hover');
    });
    
    header.addEventListener('mouseleave', () => {
      header.classList.remove('hover');
    });
  },
  
  // Setup content container
  setupContent: function(content, sectionId) {
    content.classList.add('collapsible-content');
    content.setAttribute('data-section', sectionId);
    
    // Ensure content has proper styling for animations
    if (!content.style.overflow) {
      content.style.overflow = 'hidden';
    }
  },
  
  // Store section settings for later access
  storeSectionSettings: function(sectionId, settings) {
    if (!this.sections) {
      this.sections = {};
    }
    this.sections[sectionId] = settings;
  },
  
  // Get section settings
  getSectionSettings: function(sectionId) {
    return this.sections && this.sections[sectionId] ? this.sections[sectionId] : null;
  },
  
  // Toggle section state
  toggle: function(sectionId) {
    const header = document.querySelector(`[data-section="${sectionId}"].collapsible-header`);
    const isCurrentlyCollapsed = header.getAttribute('aria-expanded') === 'false';
    
    this.setState(sectionId, !isCurrentlyCollapsed, true);
  },
  
  // Set section state
  setState: function(sectionId, collapsed, animate = true) {
    const header = document.querySelector(`[data-section="${sectionId}"].collapsible-header`);
    const content = document.querySelector(`[data-section="${sectionId}"].collapsible-content`);
    const iconContainer = header.querySelector('.collapsible-icon');
    const settings = this.getSectionSettings(sectionId);
    
    if (!header || !content) {
      console.warn(`⚠️ Cannot set state for section ${sectionId} - elements not found`);
      return;
    }
    
    // Update ARIA attributes
    header.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    
    // Update accessibility label
    if (settings && settings.accessibility) {
      const label = collapsed ? settings.accessibility.collapsedLabel : settings.accessibility.expandedLabel;
      header.setAttribute('aria-label', label);
      header.title = label;
    }
    
    // Update icon
    if (iconContainer) {
      // Clear existing content
      while (iconContainer.firstChild) {
        iconContainer.removeChild(iconContainer.firstChild);
      }
      
      const iconString = collapsed ? 
        window.COLLAPSIBLE_ICONS.collapsed : 
        window.COLLAPSIBLE_ICONS.expanded;
      
      if (iconString && window.DOMUtils) {
        const svgElement = window.DOMUtils.createSVGFromString(iconString);
        if (svgElement) {
          iconContainer.appendChild(svgElement);
        } else {
          iconContainer.textContent = collapsed ? '▶' : '▼'; // Fallback
        }
      } else {
        iconContainer.textContent = collapsed ? '▶' : '▼'; // Fallback
      }
    }
    
    // Update content visibility
    if (animate) {
      this.animateContent(content, collapsed);
    } else {
      // Immediate state change
      content.classList.toggle('collapsed', collapsed);
      content.style.maxHeight = collapsed ? '0' : '';
    }
    
    // Save state to localStorage
    if (settings) {
      this.saveState(settings.storageKey, collapsed);
    }
    
    // Call onToggle callback if provided
    if (settings && settings.onToggle) {
      settings.onToggle(collapsed, sectionId);
    }
    
    // Dispatch custom event
    const event = new CustomEvent('collapsibleSectionToggle', {
      detail: { sectionId, collapsed, animated: animate }
    });
    document.dispatchEvent(event);
  },
  
  // Animate content show/hide
  animateContent: function(content, collapse) {
    // Get current height
    const startHeight = content.offsetHeight;
    
    if (collapse) {
      // Collapsing: animate from current height to 0
      content.style.maxHeight = startHeight + 'px';
      content.classList.add('collapsing');
      
      // Force reflow
      content.offsetHeight;
      
      // Animate to 0
      content.style.maxHeight = '0';
      
      setTimeout(() => {
        content.classList.add('collapsed');
        content.classList.remove('collapsing');
      }, this.config.animationDuration);
      
    } else {
      // Expanding: animate from 0 to natural height
      content.classList.remove('collapsed');
      content.classList.add('expanding');
      
      // Get natural height
      content.style.maxHeight = 'none';
      const targetHeight = content.offsetHeight;
      content.style.maxHeight = '0';
      
      // Force reflow
      content.offsetHeight;
      
      // Animate to target height
      content.style.maxHeight = targetHeight + 'px';
      
      setTimeout(() => {
        content.style.maxHeight = '';
        content.classList.remove('expanding');
      }, this.config.animationDuration);
    }
  },
  
  // Load state from localStorage
  loadState: function(storageKey, defaultValue = false) {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved !== null ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.warn(`⚠️ Failed to load collapsible state for ${storageKey}:`, error);
      return defaultValue;
    }
  },
  
  // Save state to localStorage
  saveState: function(storageKey, collapsed) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(collapsed));
    } catch (error) {
      console.warn(`⚠️ Failed to save collapsible state for ${storageKey}:`, error);
    }
  },
  
  // Get current state of a section
  isCollapsed: function(sectionId) {
    const header = document.querySelector(`[data-section="${sectionId}"].collapsible-header`);
    return header ? header.getAttribute('aria-expanded') === 'false' : false;
  },
  
  // Expand a section
  expand: function(sectionId) {
    if (this.isCollapsed(sectionId)) {
      this.setState(sectionId, false, true);
    }
  },
  
  // Collapse a section
  collapse: function(sectionId) {
    if (!this.isCollapsed(sectionId)) {
      this.setState(sectionId, true, true);
    }
  },
  
  // Destroy collapsible functionality
  destroy: function(sectionId) {
    const header = document.querySelector(`[data-section="${sectionId}"].collapsible-header`);
    const content = document.querySelector(`[data-section="${sectionId}"].collapsible-content`);
    
    if (header) {
      header.classList.remove('collapsible-header');
      header.removeAttribute('data-section');
      header.removeAttribute('tabindex');
      header.removeAttribute('role');
      header.removeAttribute('aria-expanded');
      header.removeAttribute('aria-label');
      header.removeAttribute('title');
      
      // Remove icon
      const icon = header.querySelector('.collapsible-icon');
      if (icon) icon.remove();
    }
    
    if (content) {
      content.classList.remove('collapsible-content', 'collapsed', 'collapsing', 'expanding');
      content.removeAttribute('data-section');
      content.style.maxHeight = '';
    }
    
    // Remove from stored sections
    if (this.sections && this.sections[sectionId]) {
      delete this.sections[sectionId];
    }
  }
};

// Convenience function for Quick Access
window.toggleQuickAccess = function() {
  window.collapsibleSections.toggle('quick-access');
};

// Initialize after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log("🔧 Collapsible Sections System loaded");
    }
  });
} else {
  if (window.errorHandler && window.errorHandler.debugMode) {
    console.log("🔧 Collapsible Sections System loaded");
  }
}