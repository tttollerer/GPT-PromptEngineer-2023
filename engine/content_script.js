let firstDropdownsUnhidable = 6;
let dropdownsAdded = false;
let initCalled = false;
let container;
let toggleButtonAdded = false;
let xmlData;
let combinedText;
let activePrompts = {
  checkboxes: [],
  dropdowns: [],
  inputs: []
};

// Universal helper functions for different element types
function getElementContent(element) {
  if (!element) return '';
  
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'textarea' || tagName === 'input') {
    return element.value || '';
  } else if (element.contentEditable === 'true') {
    // For contenteditable, convert <br> tags back to \n
    const htmlContent = element.innerHTML || '';
    return htmlContent.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
  }
  return '';
}

function setElementContent(element, content) {
  if (!element) return;
  
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'textarea' || tagName === 'input') {
    element.value = content;
  } else if (element.contentEditable === 'true') {
    // For contenteditable, convert \n to <br> tags
    const htmlContent = content.replace(/\n/g, '<br>');
    element.innerHTML = htmlContent;
  }
}

function triggerElementUpdate(element) {
  if (!element) return;
  
  // Trigger appropriate events for different element types
  if (element.contentEditable === 'true') {
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    // Focus the element to ensure cursor position
    element.focus();
  } else {
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function highlightDetectedTextfield() {
  const targetNode = document.querySelector(window.getSelector());
  if (targetNode) {
    targetNode.classList.add('prompt-engineer-detected');
    // Remove class after animation completes
    setTimeout(() => {
      targetNode.classList.remove('prompt-engineer-detected');
    }, 2000);
  }
}

function updateTextfieldContent() {
  const targetNode = document.querySelector(window.getSelector());
  if (!targetNode) {
    console.log("⚠️ updateTextfieldContent: Kein targetNode gefunden");
    return;
  }

  console.log("🔄 updateTextfieldContent: Starte Update...");
  console.log("📋 Element:", targetNode);
  console.log("📊 Active prompts:", activePrompts);

  // Get current content and extract user text (preserve user content)
  let currentContent = getElementContent(targetNode);
  let userText = extractUserText(currentContent);
  
  console.log("📄 Current content:", currentContent);
  console.log("👤 User text:", userText);
  
  // Build extension prompts
  let extensionPrompts = [];
  
  // Add dropdown prompts
  activePrompts.dropdowns.forEach(promptObj => {
    if (promptObj.text && promptObj.text.trim()) {
      extensionPrompts.push(promptObj.text);
    }
  });
  
  // Add checkbox prompts
  activePrompts.checkboxes.forEach(prompt => {
    if (prompt.trim()) extensionPrompts.push(prompt);
  });
  
  // Add input prompts
  activePrompts.inputs.forEach(prompt => {
    if (prompt.trim()) extensionPrompts.push(prompt);
  });
  
  console.log("🎯 Extension prompts:", extensionPrompts);
  
  // Combine prompts with user text
  let newContent = '';
  if (extensionPrompts.length > 0) {
    newContent = extensionPrompts.join('\n\n') + '\n\n';
  }
  if (userText.trim()) {
    newContent += userText;
  }
  
  console.log("📝 New content:", newContent);
  
  // Update textfield using universal helper
  setElementContent(targetNode, newContent);
  
  // Trigger appropriate events
  triggerElementUpdate(targetNode);
  
  console.log("✅ updateTextfieldContent: Update abgeschlossen");
}

function extractUserText(content) {
  // Handle empty or non-string content
  if (!content || typeof content !== 'string') return '';
  
  // Strip HTML if needed (contenteditable might have formatting)
  const textOnly = content.replace(/<[^>]*>/g, '').trim();
  
  console.log("🔍 extractUserText input:", content);
  console.log("🧹 After HTML cleanup:", textOnly);
  
  // Split content by extension markers and return only user content
  const lines = textOnly.split('\n');
  let userLines = [];
  let inExtensionBlock = false;
  
  for (let line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Enhanced heuristic: if line looks like an extension prompt, skip it
    const isExtensionPrompt = trimmedLine.length > 80 && (
      trimmedLine.includes('Generate') || 
      trimmedLine.includes('Write') || 
      trimmedLine.includes('Create') || 
      trimmedLine.includes('Provide') ||
      trimmedLine.includes('Give me') ||
      trimmedLine.includes('Compose') ||
      trimmedLine.includes('Format') ||
      trimmedLine.includes('maximum of') ||
      trimmedLine.includes('bullet points')
    );
    
    if (isExtensionPrompt) {
      console.log("🚫 Erkannt als Extension-Prompt:", trimmedLine.substring(0, 50) + "...");
      inExtensionBlock = true;
      continue;
    }
    
    // If we find a short line after extension block, assume user content starts
    if (inExtensionBlock && trimmedLine.length < 80) {
      inExtensionBlock = false;
    }
    
    if (!inExtensionBlock) {
      console.log("✅ Erkannt als User-Text:", trimmedLine);
      userLines.push(trimmedLine);
    }
  }
  
  const result = userLines.join('\n');
  console.log("👤 Final user text:", result);
  return result;
}

async function init() {
  if (initCalled) {
    return;
  }

  initCalled = true;

  if (dropdownsAdded) {
    return;
  }

  // Add 2-second delay to ensure getSelector is available
  await new Promise(resolve => setTimeout(resolve, 2000));

  removeExistingContainer();

  const container = createContainer();
  // Always append to body as last element for bottom menu
  document.body.appendChild(container);
  window.initLanguageSwitcher();
  xmlData = await window.fetchDropdownData(localStorage.getItem('selectedLanguage') || 'en');
  
  // Highlight detected textfield
  highlightDetectedTextfield();



  //window.buildUI(xmlData);
  window.buildUIElements(container);
  addEventListeners(container);
}


function createContainer() {
  container = document.createElement("div");
  container.id = "prompt-generator-container";
  container.classList.add("prompt-generator-container");
  // Start hidden for bottom menu
  container.classList.add("hidden");

  return container;
}


function addEventListeners(container) {
  const targetNode = document.querySelector(window.getSelector());


  window.submitForm = async function(xmlData) {
    let originalText = targetNode.value.trim();
    let dropdownTexts = '';
    for (const select of document.querySelectorAll('.prompt-generator-container select')) {
      const selectedText = select.options[select.selectedIndex].dataset.text;
      dropdownTexts += selectedText ? ' ' + selectedText : '';
    }
  
    let inputTexts = '';
    for (const input of document.querySelectorAll('.prompt-generator-container input[type="text"]')) {
      if (input.value) {
        inputTexts += ' ' + input.getAttribute('valueBefore') + input.value + input.getAttribute('valueAfter');
      }
    }
  
    let checkboxTexts = '';
    let additionalIds = [];
  
    for (const checkbox of document.querySelectorAll('.prompt-generator-container input[type="checkbox"]')) {
      if (checkbox.checked) {
        checkboxTexts += ' ' + checkbox.value;
        const additionalFields = checkbox.getAttribute('additionals');
        if (additionalFields) {
          const ids = additionalFields.split(',');
          ids.forEach(id => additionalIds.push(id.trim()));
        }
      } else {
        const additionalFields = checkbox.getAttribute('additionalsHide');
        if (additionalFields) {
          const ids = additionalFields.split(',');
          ids.forEach(id => {
            const inputField = document.getElementById(id.trim());
            if (inputField) {
              inputField.parentElement.classList.add('HideInput');
              inputField.value = '';
            }
          });
        }
      }
    }
  
    function getLanguageName(langCode) {
      return languageMapping[langCode] || langCode;
    }
  
    const currentLanguageDropdown = document.getElementById('language-selector');
    const selectedLanguageCode = currentLanguageDropdown.value;
    const selectedLanguageName = getLanguageName(selectedLanguageCode);
  
   
  
    if (container.classList.contains('hidden')) {
      combinedText = originalText;
    } else {
      combinedText = `${dropdownTexts}\n${checkboxTexts}\n${inputTexts}\n\n${originalText}`;
      if (selectedLanguageCode && selectedLanguageCode !== "en") {
        combinedText += `\n\nAnswer in ${selectedLanguageName} all the time.`;
      }
    }
    targetNode.value = combinedText.trim();
  
    const sendButton = document.getElementById('PromptButton');
    if (sendButton) {
      sendButton.click();

      setTimeout(function() {
        sendButton.click();
  
      setTimeout(function () {
        targetNode.value = '';
      }, 2000);
  
      setTimeout(() => {
        if (isContainerOpen()) {
          toggleContainerVisibility();
        }
      }, 10000);
    }, 10000);  // Hinzugefügt: Warte 500 ms bevor das Senden ausgelöst wird
  } else {
      console.log("Send button not found");
    }
  }
  





  targetNode.addEventListener("keydown", function (event) {
    if (event.target === targetNode && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitForm(xmlData);
    }
  });



  // Handle checkbox styling and live prompt updates
  container.addEventListener("change", function (event) {
    console.log("🎯 Extension Change Event triggered:", event.target.type, event.target);
    
    if (event.target.type === 'checkbox') {
      console.log("📋 Checkbox Event - ID:", event.target.id, "Checked:", event.target.checked, "Value:", event.target.value);
      
      const checkboxLabel = event.target.parentElement;
      if (event.target.checked) {
        checkboxLabel.classList.add('active');
        // Add checkbox prompt to active prompts
        const checkboxValue = event.target.value;
        console.log("➕ Adding checkbox prompt:", checkboxValue);
        if (checkboxValue && !activePrompts.checkboxes.includes(checkboxValue)) {
          activePrompts.checkboxes.push(checkboxValue);
        }
      } else {
        checkboxLabel.classList.remove('active');
        // Remove checkbox prompt from active prompts
        const checkboxValue = event.target.value;
        console.log("➖ Removing checkbox prompt:", checkboxValue);
        activePrompts.checkboxes = activePrompts.checkboxes.filter(prompt => prompt !== checkboxValue);
      }
      
      console.log("📊 Updated activePrompts.checkboxes:", activePrompts.checkboxes);
      console.log("🔄 Calling updateTextfieldContent...");
      updateTextfieldContent();
      console.log("✅ Checkbox event handling completed");
      return;
    }

    if (!event.target.options || typeof event.target.selectedIndex === 'undefined') {
      return;
    }

    const selectedOption = event.target.options[event.target.selectedIndex];
    let additionalIds = [];

    // Handle dropdown prompt updates
    const dropdownId = event.target.id;
    const selectedText = selectedOption.dataset.text;
    
    console.log("🔽 Dropdown Event - ID:", dropdownId, "Selected text:", selectedText);
    console.log("📋 Selected option:", selectedOption);
    
    if (selectedText) {
      // Find and update or add dropdown prompt
      let foundIndex = -1;
      for (let i = 0; i < activePrompts.dropdowns.length; i++) {
        if (activePrompts.dropdowns[i].id === dropdownId) {
          foundIndex = i;
          break;
        }
      }
      
      const promptObj = { id: dropdownId, text: selectedText };
      if (foundIndex >= 0) {
        console.log("🔄 Updating existing dropdown prompt at index:", foundIndex);
        activePrompts.dropdowns[foundIndex] = promptObj;
      } else {
        console.log("➕ Adding new dropdown prompt:", promptObj);
        activePrompts.dropdowns.push(promptObj);
      }
    } else {
      console.log("➖ Removing dropdown prompt for ID:", dropdownId);
      // Remove prompt if no selection
      activePrompts.dropdowns = activePrompts.dropdowns.filter(prompt => prompt.id !== dropdownId);
    }
    
    console.log("📊 Updated activePrompts.dropdowns:", activePrompts.dropdowns);
    console.log("🔄 Calling updateTextfieldContent...");
    updateTextfieldContent();
    console.log("✅ Dropdown event handling completed");

    if (selectedOption.dataset && selectedOption.dataset.additionals) {
      const ids = selectedOption.dataset.additionals.split(',');
      ids.forEach(id => additionalIds.push(id.trim()));


    }

    Array.from(container.querySelectorAll('.prompt-generator-input-div')).forEach(inputDiv => {
      const inputElement = inputDiv.querySelector('input[type="text"]');
      if (inputElement && !additionalIds.includes(inputElement.id)) {
        inputDiv.classList.add('HideInput');
        inputElement.value = '';
      }
    });

    Array.from(container.querySelectorAll('input[type="checkbox"]')).forEach(checkbox => {
      const checkboxField = checkbox.parentElement.parentElement;
      const additionals = checkbox.getAttribute('additionals');
      const additionalsHide = checkbox.getAttribute('additionalsHide');




      if (additionals && additionalsHide) {
        if (selectedOption.dataset && selectedOption.dataset.text === checkbox.value) {
          checkboxField.classList.remove('HideInput');
        } else {
          checkboxField.classList.add('HideInput');
          const ids = additionalsHide.split(',');
          ids.forEach(id => {
            const inputField = document.getElementById(id.trim());
            if (inputField) {
              inputField.value = '';
            }
          });
        }
      }
    });

    Array.from(additionalIds).forEach(id => {
      const inputField = document.getElementById(id.trim());
      if (inputField) {
        inputField.parentElement.classList.remove('HideInput');
      }
    });
  });

  dropdownsAdded = true;
  updateUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
  initMutationObserver();
}

function initMutationObserver() {
  const observer = new MutationObserver(async (mutations) => {
    // Add delay to ensure getSelector function is available
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (window.getSelector) {
      const targetNode = document.querySelector(window.getSelector());
      if (targetNode) {
        init();
        observer.disconnect();
      } else {
        console.log("targetNode, bzw. das Eingabefeld wurde nicht gefunden, überprüfe den Spaceholder in den Settings.");
      }
    } else {
      console.log("getSelector function not available yet");
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}


function removeExistingContainer() {
  const existingContainer = document.getElementById('prompt-generator-container');
  if (existingContainer) {
    existingContainer.remove();
  }
}

function toggleContainerVisibility() {
  if (isContainerOpen()) {
    container.classList.add('hidden');
  } else {
    container.classList.remove('hidden');
  }
}

function getInputTexts(xmlData) {
  const inputs = xmlData.getElementsByTagName('input');
  Array.from(inputs).forEach((input) => {
    const idElement = input.querySelector('id');
    const valueBeforeElement = input.querySelector('valueBefore');
    const valueAfterElement = input.querySelector('valueAfter');
    const inputId = idElement ? idElement.textContent : '';

    if (inputId) {
      const inputElement = document.getElementById(inputId);
      if (inputElement) {
        const valueBefore = valueBeforeElement ? valueBeforeElement.textContent : '';
        const valueAfter = valueAfterElement ? valueAfterElement.textContent : '';
        inputElement.setAttribute('valueBefore', valueBefore);
        inputElement.setAttribute('valueAfter', valueAfter);
      }
    }
  });
}

function isContainerOpen() {
  // Prüfen, ob der Container sichtbar ist, indem die Sichtbarkeit des Elements geprüft wird
  return window.getComputedStyle(container).display !== "none";
}


