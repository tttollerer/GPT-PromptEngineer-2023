// Theme Manager - Advanced Theme System
(function() {
  'use strict';

  // Theme Definitions
  const THEMES = {
    original: {
      name: 'Original Dark',
      description: 'Das originale PromptEngineer Design',
      colors: {
        // Legacy compatibility colors
        'light-grey': '#cbd5e1',
        'dark-grey': '#0f172a',
        'grey': '#334155',
        'white': '#f8fafc',
        'light-green': '#3b82f6',
        
        // Modern dark theme colors
        'bg-primary': '#0f172a',
        'bg-secondary': '#1e293b',
        'bg-tertiary': '#334155',
        'bg-hover': '#334155',
        'bg-active': '#475569',
        'bg-selected': '#1e3a8a',
        'text-primary': '#f8fafc',
        'text-secondary': '#cbd5e1',
        'text-tertiary': '#94a3b8',
        'text-muted': '#64748b',
        'text-inverse': '#0f172a',
        'text-accent': '#60a5fa',
        'border-default': '#334155',
        'border-active': '#3b82f6',
        'border-glow': '#3b82f6',
        'accent-primary': '#3b82f6',
        'accent-hover': '#2563eb',
        'glow-color': 'rgba(59, 130, 246, 0.2)'
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
        // Legacy compatibility colors
        'light-grey': '#94a3b8',
        'dark-grey': '#ffffff',
        'grey': '#f1f5f9',
        'white': '#0f172a',
        'light-green': '#3b82f6',
        
        // Modern design system colors
        'bg-primary': '#ffffff',
        'bg-secondary': '#f8fafc',
        'bg-tertiary': '#e2e8f0',
        'bg-hover': '#f1f5f9',
        'bg-active': '#e2e8f0',
        'bg-selected': '#dbeafe',
        'text-primary': '#0f172a',
        'text-secondary': '#475569',
        'text-tertiary': '#64748b',
        'text-muted': '#94a3b8',
        'text-inverse': '#ffffff',
        'text-accent': '#2563eb',
        'border-default': '#e2e8f0',
        'border-active': '#3b82f6',
        'border-glow': '#3b82f6',
        'accent-primary': '#3b82f6',
        'accent-hover': '#2563eb',
        'glow-color': 'rgba(59, 130, 246, 0.1)'
      },
      properties: {
        'border-radius': '8px',
        'transition-speed': '0.2s',
        'glow-animation': 'none',
        'shadow-glow': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'shadow-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'checkbox-size': '16px'
      }
    }
  };

  let currentTheme = 'original';

  const ThemeManager = {
    
    init() {
      // Wait for platform detection, then apply appropriate theme
      this.waitForPlatformDetection().then((platform) => {
        const savedTheme = localStorage.getItem('pe-theme') || this.getDefaultThemeForPlatform(platform);
        this.applyTheme(savedTheme, platform);
        console.log('PromptEngineer: Theme system initialized with theme:', savedTheme, 'for platform:', platform);
      });
    },

    async waitForPlatformDetection() {
      let attempts = 0;
      while (!window.PROMPT_ENGINEER_PLATFORM && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      return window.PROMPT_ENGINEER_PLATFORM || 'default';
    },

    getDefaultThemeForPlatform(platform) {
      // Return platform-appropriate default theme
      switch (platform) {
        case 'chatgpt':
        case 'claude':
        case 'gemini':
          return 'modern'; // Use the clean, modern theme for AI platforms
        default:
          return 'original';
      }
    },

    applyTheme(themeName, platform) {
      const currentPlatform = platform || window.PROMPT_ENGINEER_PLATFORM || 'default';
      
      if (!THEMES[themeName]) {
        console.warn('PromptEngineer: Theme not found:', themeName);
        themeName = this.getDefaultThemeForPlatform(currentPlatform);
      }

      currentTheme = themeName;
      const theme = THEMES[themeName];
      
      // For AI platforms, create platform-adaptive color overrides
      if (currentPlatform !== 'default') {
        this.applyPlatformAdaptiveTheme(theme, themeName, currentPlatform);
      } else {
        // Apply full theme for non-AI platforms
        this.setCSSVariables(theme);
      }
      
      // Update body classes for theme-specific styles
      document.body.className = document.body.className.replace(/pe-theme-\w+/g, '');
      document.body.classList.add(`pe-theme-${themeName}`);
      
      // Add semantic theme class for enhanced styling
      const isDark = themeName === 'original' || themeName.includes('dark');
      document.body.classList.remove('pe-theme-dark', 'pe-theme-light');
      document.body.classList.add(isDark ? 'pe-theme-dark' : 'pe-theme-light');
      
      // Save preference
      localStorage.setItem('pe-theme', themeName);
      
      console.log(`PromptEngineer: Applied ${theme.name} for platform ${currentPlatform}`);
    },

    applyPlatformAdaptiveTheme(theme, themeName, platform) {
      // Get platform tokens
      const platformTokens = window.PromptPlatformDetector ? 
        window.PromptPlatformDetector.getPlatformTokens(platform) : {};
      
      // Create adaptive theme that respects both platform and user theme preference
      const adaptiveTheme = this.createAdaptiveTheme(theme, platformTokens, themeName, platform);
      
      // Apply the adaptive CSS variables
      this.setCSSVariables(adaptiveTheme);
    },

    createAdaptiveTheme(userTheme, platformTokens, themeName, platform) {
      // Start with platform tokens as base
      const adaptiveTheme = {
        colors: { ...platformTokens.colors },
        properties: { ...platformTokens.design, ...platformTokens.spacing }
      };
      
      // If user chose dark theme, adapt platform colors to be darker
      if (themeName === 'original') {
        adaptiveTheme.colors = this.adaptColorsForDarkMode(adaptiveTheme.colors, platform);
      }
      
      // Always respect user theme for accent colors if they conflict
      if (userTheme.colors['accent-primary']) {
        adaptiveTheme.colors['accent-primary'] = userTheme.colors['accent-primary'];
        adaptiveTheme.colors['accent-hover'] = userTheme.colors['accent-hover'];
      }
      
      return adaptiveTheme;
    },

    adaptColorsForDarkMode(platformColors, platform) {
      // Platform-specific dark mode adaptations
      const darkColors = { ...platformColors };
      
      switch (platform) {
        case 'chatgpt':
          darkColors['bg-primary'] = '#2d3748';
          darkColors['bg-secondary'] = '#4a5568';
          darkColors['text-primary'] = '#f7fafc';
          darkColors['text-secondary'] = '#e2e8f0';
          darkColors['border-color'] = '#4a5568';
          break;
          
        case 'claude':
          darkColors['bg-primary'] = '#1a1a1a';
          darkColors['bg-secondary'] = '#2d2d2d';
          darkColors['text-primary'] = '#f4f1eb';
          darkColors['text-secondary'] = '#d6d0c8';
          darkColors['border-color'] = '#3d3d3d';
          break;
          
        case 'gemini':
          darkColors['bg-primary'] = '#202124';
          darkColors['bg-secondary'] = '#303134';
          darkColors['text-primary'] = '#e8eaed';
          darkColors['text-secondary'] = '#9aa0a6';
          darkColors['border-color'] = '#3c4043';
          break;
      }
      
      return darkColors;
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