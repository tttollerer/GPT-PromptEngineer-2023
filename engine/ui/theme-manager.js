// Theme Manager - Advanced Theme System
(function() {
  'use strict';

  // Theme Definitions
  const THEMES = {
    original: {
      name: 'Original Dark',
      description: 'Das originale PromptEngineer Design',
      colors: {
        // Original CSS Variables
        'light-grey': '#c9c9c9',
        'dark-grey': '#282828',
        'grey': '#424242',
        'white': '#f0f0f0',
        'light-green': '#016bff',
        
        // Semantic Colors
        'bg-primary': '#282828',
        'bg-secondary': '#424242',
        'bg-hover': '#4a4a4a',
        'text-primary': '#f0f0f0',
        'text-secondary': '#c9c9c9',
        'text-muted': '#a49f9f',
        'border-default': '#424242',
        'border-active': '#016bff',
        'border-glow': '#1776d969',
        'accent-primary': '#016bff',
        'accent-hover': '#0080ff',
        'glow-color': '#9ecaed'
      },
      properties: {
        'border-radius': '8px',
        'transition-speed': '0.5s',
        'glow-animation': 'pe-glow 3s ease-in-out infinite',
        'shadow-glow': '0 0 5px #016bff',
        'shadow-hover': '0 0 15px rgba(10, 98, 212, 0.8)',
        'checkbox-size': '18px'
      }
    },
    
    modern: {
      name: 'Modern Light',
      description: 'Modernes helles Design',
      colors: {
        'light-grey': '#6B7280',
        'dark-grey': '#FFFFFF',
        'grey': '#F3F4F6',
        'white': '#111827',
        'light-green': '#3B82F6',
        
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#F9FAFB',
        'bg-hover': '#F3F4F6',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'text-muted': '#9CA3AF',
        'border-default': '#E5E7EB',
        'border-active': '#3B82F6',
        'border-glow': '#3B82F620',
        'accent-primary': '#3B82F6',
        'accent-hover': '#2563EB',
        'glow-color': '#93C5FD'
      },
      properties: {
        'border-radius': '8px',
        'transition-speed': '0.3s',
        'glow-animation': 'pe-glow-light 2s ease-in-out infinite',
        'shadow-glow': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'shadow-hover': '0 4px 12px rgba(59, 130, 246, 0.3)',
        'checkbox-size': '16px'
      }
    }
  };

  let currentTheme = 'original';

  const ThemeManager = {
    
    init() {
      // Load saved theme preference
      const savedTheme = localStorage.getItem('pe-theme') || 'original';
      this.applyTheme(savedTheme);
      console.log('PromptEngineer: Theme system initialized with theme:', savedTheme);
    },

    applyTheme(themeName) {
      if (!THEMES[themeName]) {
        console.warn('PromptEngineer: Theme not found:', themeName);
        themeName = 'original';
      }

      currentTheme = themeName;
      const theme = THEMES[themeName];
      
      // Apply CSS custom properties
      this.setCSSVariables(theme);
      
      // Update body class for theme-specific styles
      document.body.className = document.body.className.replace(/pe-theme-\w+/g, '');
      document.body.classList.add(`pe-theme-${themeName}`);
      
      // Save preference
      localStorage.setItem('pe-theme', themeName);
      
      console.log('PromptEngineer: Applied theme:', theme.name);
    },

    setCSSVariables(theme) {
      const root = document.documentElement;
      
      // Apply color variables
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--pe-${key}`, value);
      });
      
      // Apply property variables
      Object.entries(theme.properties).forEach(([key, value]) => {
        root.style.setProperty(`--pe-${key}`, value);
      });
    },

    getCurrentTheme() {
      return currentTheme;
    },

    getAvailableThemes() {
      return Object.keys(THEMES).map(key => ({
        id: key,
        name: THEMES[key].name,
        description: THEMES[key].description
      }));
    },

    createThemeSelector() {
      const themes = this.getAvailableThemes();
      let optionsHTML = '';
      
      themes.forEach(theme => {
        const selected = theme.id === currentTheme ? 'selected' : '';
        optionsHTML += `<option value="${theme.id}" ${selected}>${theme.name}</option>`;
      });

      return `
        <div class="pe-field pe-theme-field">
          <label for="pe-theme-selector">Theme:</label>
          <select id="pe-theme-selector" class="pe-select pe-theme-select">
            ${optionsHTML}
          </select>
        </div>
      `;
    },

    bindThemeSelector() {
      const selector = document.querySelector('#pe-theme-selector');
      if (selector) {
        selector.addEventListener('change', (e) => {
          this.applyTheme(e.target.value);
        });
      }
    },

    // Auto-detect website theme and suggest appropriate theme
    detectWebsiteTheme() {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches ||
                     document.documentElement.classList.contains('dark') ||
                     document.body.classList.contains('dark') ||
                     getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)';
      
      // Auto-apply theme based on website
      if (currentTheme === 'original') return; // Don't auto-change if user has preference
      
      const suggestedTheme = isDark ? 'original' : 'modern';
      if (currentTheme !== suggestedTheme) {
        console.log('PromptEngineer: Auto-detected website theme, suggesting:', suggestedTheme);
      }
    }
  };

  // Export to global scope
  window.PromptThemeManager = ThemeManager;

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ThemeManager.init();
    });
  } else {
    ThemeManager.init();
  }

})();