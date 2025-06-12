// Platform Detector - AI Platform Style Integration
(function() {
  'use strict';

  const PlatformDetector = {
    
    // Detect which AI platform we're on
    detectPlatform() {
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;
      
      console.log('PromptEngineer: Detecting platform...', hostname);
      
      if (hostname.includes('chatgpt.com') || hostname.includes('chat.openai.com')) {
        return 'chatgpt';
      } else if (hostname.includes('claude.ai')) {
        return 'claude';
      } else if (hostname.includes('gemini.google.com')) {
        return 'gemini';
      } else if (hostname.includes('bard.google.com')) {
        return 'gemini'; // Bard is now Gemini
      }
      
      return 'default';
    },

    // Get platform-specific design tokens
    getPlatformTokens(platform) {
      const tokens = {
        chatgpt: {
          // ChatGPT's design system
          colors: {
            'bg-primary': '#ffffff',
            'bg-secondary': '#f7f7f8',
            'bg-tertiary': '#ececf1',
            'bg-hover': '#f1f1f1',
            'text-primary': '#2d3748',
            'text-secondary': '#616b7d',
            'text-muted': '#8e8ea0',
            'accent-primary': '#10a37f',
            'accent-hover': '#0d8e6e',
            'border-color': '#e2e8f0',
            'border-hover': '#d1d9e6'
          },
          typography: {
            'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            'font-size-sm': '14px',
            'font-size-base': '16px',
            'font-size-lg': '18px',
            'font-weight-normal': '400',
            'font-weight-medium': '500',
            'font-weight-semibold': '600',
            'line-height': '1.5'
          },
          spacing: {
            'space-1': '4px',
            'space-2': '8px',
            'space-3': '12px',
            'space-4': '16px',
            'space-5': '20px',
            'space-6': '24px'
          },
          design: {
            'border-radius': '8px',
            'border-radius-sm': '6px',
            'border-radius-lg': '12px',
            'shadow': '0 1px 3px rgba(0, 0, 0, 0.1)',
            'shadow-lg': '0 4px 6px rgba(0, 0, 0, 0.1)'
          }
        },

        claude: {
          // Claude's warm, sophisticated design
          colors: {
            'bg-primary': '#faf9f7',
            'bg-secondary': '#f4f1eb',
            'bg-tertiary': '#ede8e0',
            'bg-hover': '#e8e3da',
            'text-primary': '#1a1a1a',
            'text-secondary': '#6b6b6b',
            'text-muted': '#8a8a8a',
            'accent-primary': '#d97706',
            'accent-hover': '#b45309',
            'accent-secondary': '#f59e0b',
            'border-color': '#e5e1db',
            'border-hover': '#d6d0c8'
          },
          typography: {
            'font-family': '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            'font-size-sm': '14px',
            'font-size-base': '15px',
            'font-size-lg': '17px',
            'font-weight-normal': '400',
            'font-weight-medium': '500',
            'font-weight-semibold': '600',
            'line-height': '1.6'
          },
          spacing: {
            'space-1': '4px',
            'space-2': '8px',
            'space-3': '12px',
            'space-4': '16px',
            'space-5': '20px',
            'space-6': '24px'
          },
          design: {
            'border-radius': '8px',
            'border-radius-sm': '6px',
            'border-radius-lg': '12px',
            'shadow': '0 2px 8px rgba(0, 0, 0, 0.08)',
            'shadow-lg': '0 4px 12px rgba(0, 0, 0, 0.12)'
          }
        },

        gemini: {
          // Google Material Design 3
          colors: {
            'bg-primary': '#ffffff',
            'bg-secondary': '#f8f9fa',
            'bg-tertiary': '#e8f0fe',
            'bg-hover': '#f1f3f4',
            'text-primary': '#202124',
            'text-secondary': '#5f6368',
            'text-muted': '#80868b',
            'accent-primary': '#1a73e8',
            'accent-hover': '#1557b0',
            'accent-secondary': '#4285f4',
            'border-color': '#dadce0',
            'border-hover': '#c1c7cd'
          },
          typography: {
            'font-family': '"Google Sans", Roboto, -apple-system, sans-serif',
            'font-size-sm': '14px',
            'font-size-base': '16px',
            'font-size-lg': '18px',
            'font-weight-normal': '400',
            'font-weight-medium': '500',
            'font-weight-semibold': '600',
            'line-height': '1.5'
          },
          spacing: {
            'space-1': '4px',
            'space-2': '8px',
            'space-3': '12px',
            'space-4': '16px',
            'space-5': '20px',
            'space-6': '24px'
          },
          design: {
            'border-radius': '8px',
            'border-radius-sm': '4px',
            'border-radius-lg': '12px',
            'border-radius-pill': '20px',
            'shadow': '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)',
            'shadow-lg': '0 2px 6px 2px rgba(60,64,67,.15), 0 1px 2px 0 rgba(60,64,67,.3)'
          }
        },

        default: {
          // Fallback neutral design
          colors: {
            'bg-primary': '#ffffff',
            'bg-secondary': '#f5f5f5',
            'bg-tertiary': '#e5e5e5',
            'bg-hover': '#ebebeb',
            'text-primary': '#333333',
            'text-secondary': '#666666',
            'text-muted': '#999999',
            'accent-primary': '#007acc',
            'accent-hover': '#005a9e',
            'border-color': '#ddd',
            'border-hover': '#ccc'
          },
          typography: {
            'font-family': 'system-ui, -apple-system, sans-serif',
            'font-size-sm': '14px',
            'font-size-base': '16px',
            'font-size-lg': '18px',
            'font-weight-normal': '400',
            'font-weight-medium': '500',
            'font-weight-semibold': '600',
            'line-height': '1.5'
          },
          spacing: {
            'space-1': '4px',
            'space-2': '8px',
            'space-3': '12px',
            'space-4': '16px',
            'space-5': '20px',
            'space-6': '24px'
          },
          design: {
            'border-radius': '8px',
            'border-radius-sm': '4px',
            'border-radius-lg': '12px',
            'shadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
            'shadow-lg': '0 4px 8px rgba(0, 0, 0, 0.15)'
          }
        }
      };

      return tokens[platform] || tokens.default;
    },

    // Generate CSS custom properties from platform tokens
    generateCSSVariables(tokens) {
      let css = ':root {\n';
      
      // Add color variables
      Object.entries(tokens.colors).forEach(([key, value]) => {
        css += `  --pe-${key}: ${value};\n`;
      });
      
      // Add typography variables
      Object.entries(tokens.typography).forEach(([key, value]) => {
        css += `  --pe-${key}: ${value};\n`;
      });
      
      // Add spacing variables
      Object.entries(tokens.spacing).forEach(([key, value]) => {
        css += `  --pe-${key}: ${value};\n`;
      });
      
      // Add design variables
      Object.entries(tokens.design).forEach(([key, value]) => {
        css += `  --pe-${key}: ${value};\n`;
      });
      
      css += '}\n';
      return css;
    },

    // Apply platform-specific styles
    applyPlatformStyles(platform) {
      // Remove existing platform styles
      const existingStyles = document.querySelector('#pe-platform-styles');
      if (existingStyles) {
        existingStyles.remove();
      }

      // Get platform tokens and generate CSS
      const tokens = this.getPlatformTokens(platform);
      const cssVariables = this.generateCSSVariables(tokens);

      // Create and inject stylesheet
      const styleSheet = document.createElement('style');
      styleSheet.id = 'pe-platform-styles';
      styleSheet.textContent = cssVariables;
      document.head.appendChild(styleSheet);

      // Add platform class to body for specific styling
      document.body.classList.remove('pe-platform-chatgpt', 'pe-platform-claude', 'pe-platform-gemini', 'pe-platform-default');
      document.body.classList.add(`pe-platform-${platform}`);

      console.log(`PromptEngineer: Applied ${platform} platform styles`);
      return platform;
    },

    // Initialize platform detection and styling
    init() {
      const platform = this.detectPlatform();
      this.applyPlatformStyles(platform);
      
      // Store current platform for other components
      window.PROMPT_ENGINEER_PLATFORM = platform;
      
      return platform;
    }
  };

  // Export to global scope
  window.PromptPlatformDetector = PlatformDetector;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      PlatformDetector.init();
    });
  } else {
    PlatformDetector.init();
  }

})();