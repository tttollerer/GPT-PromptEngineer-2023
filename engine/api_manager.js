/**
 * API MANAGER
 * Manages API keys and handles requests to different AI providers
 * Supports OpenAI, Claude, Gemini, and OpenRouter
 */

class APIManager {
  constructor() {
    this.encryptionKey = null;
    this.memoryCleanupTimer = null;
    this.lastActivity = Date.now();
    this.CLEANUP_INTERVAL = 300000; // 5 minutes
    
    this.providers = {
      openai: {
        name: 'OpenAI',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        defaultModel: 'gpt-4'
      },
      claude: {
        name: 'Anthropic Claude',
        endpoint: 'https://api.anthropic.com/v1/messages',
        models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
        defaultModel: 'claude-3-sonnet-20240229'
      },
      gemini: {
        name: 'Google Gemini',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/',
        models: ['gemini-pro', 'gemini-pro-vision'],
        defaultModel: 'gemini-pro'
      },
      openrouter: {
        name: 'OpenRouter',
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        models: ['openai/gpt-4', 'anthropic/claude-3-opus', 'google/gemini-pro', 'meta-llama/llama-2-70b-chat'],
        defaultModel: 'openai/gpt-4'
      }
    };
    
    this.settings = {
      selectedProvider: 'openai',
      selectedModel: null,
      apiKeys: {},
      timeout: 30000, // 30 seconds
      maxRetries: 3
    };
    
    this.loadSettings();
    this.startMemoryCleanup();
  }

  /**
   * Initialize encryption key
   */
  async initEncryptionKey() {
    if (this.encryptionKey) return;
    
    try {
      // Generate a key from the extension ID and user agent for consistency
      const keyData = new TextEncoder().encode(chrome.runtime.id + navigator.userAgent);
      this.encryptionKey = await window.crypto.subtle.importKey(
        'raw',
        keyData.slice(0, 32), // Use first 32 bytes
        'AES-GCM',
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to initialize encryption key:', error);
      // Fallback: use simple obfuscation if Web Crypto fails
      this.encryptionKey = 'fallback';
    }
  }

  /**
   * Encrypt API key
   */
  async encryptAPIKey(apiKey) {
    if (!apiKey) return '';
    
    await this.initEncryptionKey();
    
    if (this.encryptionKey === 'fallback') {
      // Simple obfuscation fallback
      return btoa(apiKey.split('').reverse().join(''));
    }
    
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(apiKey);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        this.encryptionKey,
        data
      );
      
      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);
      
      return btoa(String.fromCharCode.apply(null, combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      // Fallback to simple obfuscation
      return btoa(apiKey.split('').reverse().join(''));
    }
  }

  /**
   * Decrypt API key
   */
  async decryptAPIKey(encryptedKey) {
    if (!encryptedKey) return '';
    
    await this.initEncryptionKey();
    
    if (this.encryptionKey === 'fallback') {
      // Simple deobfuscation fallback
      try {
        return atob(encryptedKey).split('').reverse().join('');
      } catch (error) {
        return encryptedKey; // Return as-is if decoding fails
      }
    }
    
    try {
      const combined = new Uint8Array(
        atob(encryptedKey).split('').map(char => char.charCodeAt(0))
      );
      
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);
      
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        this.encryptionKey,
        encrypted
      );
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      // Try fallback deobfuscation
      try {
        return atob(encryptedKey).split('').reverse().join('');
      } catch (fallbackError) {
        return encryptedKey; // Return as-is if all decryption fails
      }
    }
  }

  /**
   * Start memory cleanup timer
   */
  startMemoryCleanup() {
    this.memoryCleanupTimer = setInterval(() => {
      const now = Date.now();
      if (now - this.lastActivity > this.CLEANUP_INTERVAL) {
        this.clearMemoryAPIKeys();
      }
    }, 60000); // Check every minute
  }

  /**
   * Clear API keys from memory (security measure)
   */
  clearMemoryAPIKeys() {
    if (this.memoryCache) {
      // Clear any cached decrypted keys
      Object.keys(this.memoryCache).forEach(key => {
        delete this.memoryCache[key];
      });
      this.memoryCache = {};
      
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log('🧹 Cleared API keys from memory for security');
      }
    }
  }

  /**
   * Update last activity timestamp
   */
  updateActivity() {
    this.lastActivity = Date.now();
  }

  /**
   * Get secure debug info (without exposing API keys)
   */
  getSecureDebugInfo() {
    const configuredProviders = Object.keys(this.settings.apiKeys || {}).map(provider => {
      const key = this.settings.apiKeys[provider];
      return {
        provider,
        configured: !!key,
        keyLength: key ? key.length : 0,
        keyPreview: key ? key.substring(0, 8) + '...' + key.substring(key.length - 4) : 'none'
      };
    });
    
    return {
      selectedProvider: this.settings.selectedProvider,
      selectedModel: this.settings.selectedModel,
      timeout: this.settings.timeout,
      maxRetries: this.settings.maxRetries,
      configuredProviders,
      totalProviders: configuredProviders.length
    };
  }

  /**
   * Load settings from Chrome storage
   */
  async loadSettings() {
    try {
      const stored = await chrome.storage.sync.get(['promptEngineeerAI']);
      if (stored.promptEngineeerAI) {
        this.settings = { ...this.settings, ...stored.promptEngineeerAI };
      }
      
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("🔧 API Manager settings loaded:", this.getSecureDebugInfo());
      }
    } catch (error) {
      console.error("❌ Failed to load API settings:", error);
    }
  }

  /**
   * Save settings to Chrome storage
   */
  async saveSettings() {
    try {
      await chrome.storage.sync.set({ 
        promptEngineeerAI: this.settings 
      });
      
      if (window.errorHandler && window.errorHandler.debugMode) {
        console.log("💾 API Manager settings saved");
      }
    } catch (error) {
      console.error("❌ Failed to save API settings:", error);
    }
  }

  /**
   * Set API key for a provider (with encryption)
   */
  async setAPIKey(provider, apiKey) {
    if (!this.providers[provider]) {
      throw new Error(`Unknown provider: ${provider}`);
    }
    
    // Validate API key format
    if (!this.validateAPIKey(provider, apiKey)) {
      throw new Error(`Invalid API key format for ${provider}`);
    }
    
    this.updateActivity();
    
    // Encrypt the API key before storing
    const encryptedKey = await this.encryptAPIKey(apiKey);
    this.settings.apiKeys[provider] = encryptedKey;
    
    // Clear memory cache for this provider
    if (this.memoryCache && this.memoryCache[provider]) {
      delete this.memoryCache[provider];
    }
    
    await this.saveSettings();
  }

  /**
   * Get API key for a provider (with decryption)
   */
  async getAPIKey(provider) {
    this.updateActivity();
    
    if (!this.memoryCache) {
      this.memoryCache = {};
    }
    
    // Check memory cache first
    if (this.memoryCache[provider]) {
      return this.memoryCache[provider];
    }
    
    const encryptedKey = this.settings.apiKeys[provider] || '';
    if (!encryptedKey) return '';
    
    // Decrypt the API key
    const decryptedKey = await this.decryptAPIKey(encryptedKey);
    
    // Cache in memory for performance (will be cleared automatically)
    this.memoryCache[provider] = decryptedKey;
    
    return decryptedKey;
  }

  /**
   * Validate API key format for different providers
   */
  validateAPIKey(provider, apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }
    
    // Remove whitespace
    const key = apiKey.trim();
    
    switch (provider) {
      case 'openai':
        return key.startsWith('sk-') && key.length > 20;
      case 'claude':
        return key.startsWith('sk-ant-') || (key.startsWith('ak-') && key.length > 20);
      case 'gemini':
        return key.length > 20 && /^[A-Za-z0-9_-]+$/.test(key);
      case 'openrouter':
        return key.startsWith('sk-or-') || (key.length > 20 && /^[A-Za-z0-9_-]+$/.test(key));
      default:
        return key.length > 10; // Generic validation
    }
  }

  /**
   * Set the selected provider
   */
  async setProvider(provider, model = null) {
    if (!this.providers[provider]) {
      throw new Error(`Unknown provider: ${provider}`);
    }
    
    this.settings.selectedProvider = provider;
    this.settings.selectedModel = model || this.providers[provider].defaultModel;
    await this.saveSettings();
  }

  /**
   * Test API connection
   */
  async testConnection(provider, apiKey) {
    try {
      const testPrompt = "Hello, this is a connection test. Please respond with 'Connection successful'.";
      
      const response = await this.generatePrompt(testPrompt, {
        provider,
        apiKey,
        maxTokens: 50
      });
      
      return {
        success: true,
        message: "Connection successful",
        response: response.trim()
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        response: null
      };
    }
  }

  /**
   * Generate a prompt using the selected AI provider
   */
  async generatePrompt(userInput, options = {}) {
    const provider = options.provider || this.settings.selectedProvider;
    const apiKey = options.apiKey || await this.getAPIKey(provider);
    const model = options.model || this.settings.selectedModel || this.providers[provider].defaultModel;
    
    if (!apiKey) {
      throw new Error(`No API key configured for ${this.providers[provider].name}`);
    }

    const systemPrompt = this.getSystemPrompt();
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log(`🤖 Generating prompt with ${provider}:`, { userInput, model });
    }

    switch (provider) {
      case 'openai':
        return await this.callOpenAI(apiKey, model, systemPrompt, userInput, options);
      case 'claude':
        return await this.callClaude(apiKey, model, systemPrompt, userInput, options);
      case 'gemini':
        return await this.callGemini(apiKey, model, systemPrompt, userInput, options);
      case 'openrouter':
        return await this.callOpenRouter(apiKey, model, systemPrompt, userInput, options);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Improve an existing prompt using the configured system prompt
   */
  async improvePrompt(existingPrompt, options = {}) {
    const provider = options.provider || this.settings.selectedProvider;
    const apiKey = options.apiKey || await this.getAPIKey(provider);
    const model = options.model || this.settings.selectedModel || this.providers[provider].defaultModel;
    
    if (!apiKey) {
      throw new Error(`No API key configured for ${this.providers[provider].name}`);
    }

    // Get custom system prompt from settings if available, otherwise use default improvement prompt
    let systemPrompt = options.systemPrompt;
    if (!systemPrompt && window.getCurrentSystemPrompt) {
      try {
        systemPrompt = await window.getCurrentSystemPrompt();
      } catch (error) {
        console.warn('Failed to get custom system prompt:', error);
      }
    }
    
    // Fallback to default improvement system prompt if no custom system prompt is configured
    if (!systemPrompt) {
      systemPrompt = `You are an expert prompt engineer. Your task is to improve the given prompt to make it more effective, clear, and detailed while preserving the original intent.

Guidelines for improvement:
1. Make the prompt more specific and actionable
2. Add relevant context if missing
3. Improve structure and clarity
4. Suggest better phrasing where appropriate
5. Maintain the original purpose and tone
6. Only respond with the improved prompt, no explanations

Please improve the following prompt:`;
    }
    
    // Create the improvement instruction
    const improvementInstruction = `${systemPrompt}\n\nOriginal prompt: "${existingPrompt}"\n\nImproved prompt:`;
    
    if (window.errorHandler && window.errorHandler.debugMode) {
      console.log(`🔧 Improving prompt with ${provider}:`, { existingPrompt, model });
    }

    switch (provider) {
      case 'openai':
        return await this.callOpenAI(apiKey, model, 'You are a helpful assistant that improves prompts.', improvementInstruction, options);
      case 'claude':
        return await this.callClaude(apiKey, model, 'You are a helpful assistant that improves prompts.', improvementInstruction, options);
      case 'gemini':
        return await this.callGemini(apiKey, model, 'You are a helpful assistant that improves prompts.', improvementInstruction, options);
      case 'openrouter':
        return await this.callOpenRouter(apiKey, model, 'You are a helpful assistant that improves prompts.', improvementInstruction, options);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(apiKey, model, systemPrompt, userInput, options) {
    const response = await this.makeRequest(this.providers.openai.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput }
        ],
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || `OpenAI API error: ${response.status}`);
    }

    return data.choices[0].message.content;
  }

  /**
   * Call Claude API
   */
  async callClaude(apiKey, model, systemPrompt, userInput, options) {
    const response = await this.makeRequest(this.providers.claude.endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: options.maxTokens || 500,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userInput }
        ],
        temperature: options.temperature || 0.7
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || `Claude API error: ${response.status}`);
    }

    return data.content[0].text;
  }

  /**
   * Call Gemini API
   */
  async callGemini(apiKey, model, systemPrompt, userInput, options) {
    const endpoint = `${this.providers.gemini.endpoint}${model}:generateContent?key=${apiKey}`;
    
    const response = await this.makeRequest(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser Input: ${userInput}`
          }]
        }],
        generationConfig: {
          maxOutputTokens: options.maxTokens || 500,
          temperature: options.temperature || 0.7
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || `Gemini API error: ${response.status}`);
    }

    return data.candidates[0].content.parts[0].text;
  }

  /**
   * Call OpenRouter API
   */
  async callOpenRouter(apiKey, model, systemPrompt, userInput, options) {
    const response = await this.makeRequest(this.providers.openrouter.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'PromptEngineer Chrome Extension'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput }
        ],
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || `OpenRouter API error: ${response.status}`);
    }

    return data.choices[0].message.content;
  }

  /**
   * Make HTTP request with timeout and retries
   */
  async makeRequest(url, options, retries = 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.settings.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - API did not respond in time');
      }
      
      // Retry logic for network errors
      if (retries < this.settings.maxRetries && error.message.includes('network')) {
        if (window.errorHandler && window.errorHandler.debugMode) {
          console.log(`🔄 Retrying request (${retries + 1}/${this.settings.maxRetries})`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
        return this.makeRequest(url, options, retries + 1);
      }
      
      throw error;
    }
  }

  /**
   * Get the system prompt for AI prompt generation
   */
  getSystemPrompt() {
    return `You are an expert prompt engineer specialized in creating high-quality prompts for AI assistants. Your task is to transform user input into effective, detailed, and well-structured prompts.

Guidelines:
1. Make prompts clear, specific, and actionable
2. Include relevant context and constraints
3. Structure complex requests with numbered steps or bullet points
4. Add examples when helpful
5. Specify the desired output format
6. Keep the tone professional but friendly
7. Optimize for the intended AI assistant (ChatGPT, Claude, etc.)

Take the user's input and create 1-3 optimized prompt variations that would produce better results than the original input. Focus on clarity, specificity, and effectiveness.

Respond only with the improved prompt(s), separated by "---" if providing multiple versions. Do not include explanations unless specifically requested.`;
  }

  /**
   * Get available providers
   */
  getProviders() {
    return Object.keys(this.providers).map(key => ({
      id: key,
      name: this.providers[key].name,
      models: this.providers[key].models
    }));
  }

  /**
   * Get current settings
   */
  getSettings() {
    return {
      ...this.settings,
      apiKeys: Object.keys(this.settings.apiKeys) // Don't expose actual keys
    };
  }

  /**
   * Clear all API keys
   */
  async clearAPIKeys() {
    this.settings.apiKeys = {};
    
    // Clear memory cache
    if (this.memoryCache) {
      Object.keys(this.memoryCache).forEach(key => {
        delete this.memoryCache[key];
      });
      this.memoryCache = {};
    }
    
    await this.saveSettings();
  }

  /**
   * Check if provider is configured
   */
  isProviderConfigured(provider) {
    return !!this.settings.apiKeys[provider];
  }

  /**
   * Get configured providers
   */
  getConfiguredProviders() {
    return Object.keys(this.settings.apiKeys).filter(provider => 
      this.settings.apiKeys[provider] && this.settings.apiKeys[provider].length > 0
    );
  }
}

// Global instance
window.apiManager = new APIManager();