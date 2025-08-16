/**
 * DOM Utility Functions for Safe Element Creation
 * Provides helper functions to safely create DOM elements without using innerHTML
 */

window.DOMUtils = {
  /**
   * Creates an SVG element with given attributes
   * @param {string} svgString - SVG content as string
   * @returns {SVGElement|null} The created SVG element
   */
  createSVGFromString: function(svgString) {
    if (!svgString || typeof svgString !== 'string') {
      console.warn('DOMUtils.createSVGFromString: Invalid input:', typeof svgString);
      return null;
    }
    
    // For inline SVG strings (which is what we have), use HTML parsing directly
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = svgString;
      const svgElement = tempDiv.querySelector('svg');
      
      if (svgElement) {
        return svgElement.cloneNode(true);
      } else {
        console.warn('DOMUtils.createSVGFromString: No SVG element found in:', svgString.substring(0, 100));
        return null;
      }
    } catch (error) {
      console.error('DOMUtils.createSVGFromString: HTML parsing failed:', error);
      return null;
    }
  },

  /**
   * Creates SVG from HTML string (fallback method)
   * @param {string} htmlString - HTML containing SVG
   * @returns {SVGElement|null} The created SVG element
   */
  createSVGFromHTML: function(htmlString) {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlString;
      const svgElement = tempDiv.querySelector('svg');
      
      if (svgElement) {
        return svgElement.cloneNode(true);
      }
      
      return null;
    } catch (error) {
      console.error('HTML SVG parsing failed:', error);
      return null;
    }
  },

  /**
   * Safely sets HTML content by parsing and creating elements
   * @param {HTMLElement} element - Target element
   * @param {string} htmlString - HTML content
   */
  safeSetHTML: function(element, htmlString) {
    // Clear existing content
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
    
    // Create a temporary container
    const temp = document.createElement('template');
    temp.innerHTML = htmlString;
    
    // Clone and append all child nodes
    const fragment = temp.content.cloneNode(true);
    element.appendChild(fragment);
  },

  /**
   * Creates an SVG element using createElementNS
   * @param {Object} config - SVG configuration
   * @returns {SVGElement} The created SVG element
   */
  createSVG: function(config) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    
    // Set attributes
    if (config.attrs) {
      Object.keys(config.attrs).forEach(key => {
        svg.setAttribute(key, config.attrs[key]);
      });
    }
    
    // Set styles
    if (config.style) {
      Object.assign(svg.style, config.style);
    }
    
    // Add paths
    if (config.paths) {
      config.paths.forEach(pathData => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        svg.appendChild(path);
      });
    }
    
    // Add circles
    if (config.circles) {
      config.circles.forEach(circleData => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        Object.keys(circleData).forEach(key => {
          circle.setAttribute(key, circleData[key]);
        });
        svg.appendChild(circle);
      });
    }
    
    return svg;
  },

  /**
   * Clears all children from an element
   * @param {HTMLElement} element - Element to clear
   */
  clearElement: function(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
};