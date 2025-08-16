// Safe DOM manipulation helpers to prevent XSS attacks

/**
 * Safely creates an element with text content
 * @param {string} tag - HTML tag name
 * @param {string} text - Text content (will be escaped)
 * @param {Object} attributes - Optional attributes
 * @returns {HTMLElement}
 */
function createElementSafe(tag, text = '', attributes = {}) {
  const element = document.createElement(tag);
  
  if (text) {
    element.textContent = text; // textContent automatically escapes HTML
  }
  
  // Safely set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'id') {
      element.id = value;
    } else if (key.startsWith('data-')) {
      element.setAttribute(key, value);
    } else if (['href', 'src', 'alt', 'title', 'placeholder'].includes(key)) {
      element.setAttribute(key, value);
    }
  });
  
  return element;
}

/**
 * Safely creates complex DOM structures
 * @param {string} tag - Root element tag
 * @param {Object} config - Configuration object
 * @returns {HTMLElement}
 */
function createElementStructure(tag, config = {}) {
  const element = document.createElement(tag);
  
  if (config.className) element.className = config.className;
  if (config.id) element.id = config.id;
  if (config.text) element.textContent = config.text;
  
  if (config.children) {
    config.children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      } else if (child && typeof child === 'object') {
        element.appendChild(createElementStructure(child.tag, child));
      }
    });
  }
  
  if (config.attributes) {
    Object.entries(config.attributes).forEach(([key, value]) => {
      element.setAttribute(key, sanitizeAttribute(key, value));
    });
  }
  
  return element;
}

/**
 * Sanitizes user input to prevent XSS
 * @param {string} input - User input string
 * @returns {string} - Sanitized string
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  // HTML entity encoding for dangerous characters
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return String(input).replace(/[&<>"'`=\/]/g, s => entityMap[s]);
}

/**
 * Sanitizes attribute values
 * @param {string} name - Attribute name
 * @param {string} value - Attribute value
 * @returns {string} - Sanitized value
 */
function sanitizeAttribute(name, value) {
  // For URLs, ensure they're safe
  if (['href', 'src'].includes(name)) {
    // Allow only http, https, and relative URLs
    if (!/^(https?:\/\/|\/|#)/.test(value)) {
      return '#';
    }
  }
  
  return sanitizeInput(value);
}

/**
 * Safely sets HTML content with sanitization
 * @param {HTMLElement} element - Target element
 * @param {string} html - HTML string (will be sanitized)
 */
function setHTMLSafe(element, html) {
  // For simple text, use textContent
  if (!html.includes('<')) {
    element.textContent = html;
    return;
  }
  
  // For structured content, parse and rebuild safely using DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Check for parsing errors
  if (doc.querySelector('parsererror')) {
    console.warn('HTML parsing error, falling back to textContent');
    element.textContent = html;
    return;
  }
  
  const bodyContent = doc.body || doc.documentElement;
  
  // Clear element
  element.textContent = '';
  
  // Rebuild content safely
  Array.from(bodyContent.childNodes).forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      element.appendChild(document.createTextNode(node.textContent));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Only allow safe tags
      const safeTags = ['span', 'div', 'p', 'a', 'strong', 'em', 'br'];
      if (safeTags.includes(node.tagName.toLowerCase())) {
        const safeElement = document.createElement(node.tagName);
        safeElement.textContent = node.textContent;
        
        // Only copy safe attributes
        if (node.tagName.toLowerCase() === 'a' && node.getAttribute('href')) {
          const href = node.getAttribute('href');
          if (/^(https?:\/\/|#)/.test(href)) {
            safeElement.setAttribute('href', href);
            safeElement.setAttribute('target', '_blank');
            safeElement.setAttribute('rel', 'noopener noreferrer');
          }
        }
        
        element.appendChild(safeElement);
      } else {
        // For unsafe tags, just append text content
        element.appendChild(document.createTextNode(node.textContent));
      }
    }
  });
}

/**
 * Creates an SVG element safely
 * @param {string} svgString - SVG string
 * @returns {SVGElement|null}
 */
function createSVGSafe(svgString) {
  // Basic SVG sanitization - only allow specific elements and attributes
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  
  // Check for parsing errors
  if (doc.querySelector('parsererror')) {
    console.error('Invalid SVG');
    return null;
  }
  
  const svg = doc.querySelector('svg');
  if (!svg) return null;
  
  // Clone with only safe attributes
  const safeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const safeAttrs = ['viewBox', 'width', 'height', 'fill', 'stroke'];
  
  safeAttrs.forEach(attr => {
    if (svg.hasAttribute(attr)) {
      safeSvg.setAttribute(attr, svg.getAttribute(attr));
    }
  });
  
  // Only allow safe SVG elements
  const safeElements = ['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'g'];
  
  function cloneSafeElements(source, target) {
    Array.from(source.children).forEach(child => {
      if (safeElements.includes(child.tagName.toLowerCase())) {
        const newElement = document.createElementNS('http://www.w3.org/2000/svg', child.tagName);
        
        // Copy safe attributes
        Array.from(child.attributes).forEach(attr => {
          if (['d', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'points', 'fill', 'stroke', 'stroke-width', 'transform'].includes(attr.name)) {
            newElement.setAttribute(attr.name, attr.value);
          }
        });
        
        target.appendChild(newElement);
        
        // Recursively clone children for 'g' elements
        if (child.tagName.toLowerCase() === 'g') {
          cloneSafeElements(child, newElement);
        }
      }
    });
  }
  
  cloneSafeElements(svg, safeSvg);
  
  return safeSvg;
}

// Export for use in other files
window.DOMHelpers = {
  createElementSafe,
  createElementStructure,
  sanitizeInput,
  sanitizeAttribute,
  setHTMLSafe,
  createSVGSafe
};