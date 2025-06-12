

(async function() {
  const inputFieldCreation = {
    createInputField: function(type, data) {
      let inputField;
      if (type === 'input') {
        inputField = document.createElement('input');
      
        if (data.type === 'file') {
          inputField.type = 'file';
          inputField.accept = '.txt';  // Dateitypen, die akzeptiert werden sollen
        } else {
          inputField.type = data.type;
        }
        inputField.id = data.id;
      
        


        
      } else if (type === 'select') {
        inputField = document.createElement('select');
        data.options.forEach((option) => {
          if (option) {
            const opt = document.createElement('option');
            if (option.label) {
              opt.textContent = option.label;
            } else {
              console.warn("Warnung: option.label ist null oder undefined.");
            }
            if (option.text) {
              opt.dataset.text = option.text;
            }
            if (option.additionals) {
              opt.dataset.additionals = option.additionals;
            }
            inputField.appendChild(opt);
          }
        });
      }
      return inputField;
    },

    createCheckbox: function(checkboxData) {
      const labelDiv = document.createElement('div');
      labelDiv.classList.add('prompt-generator-label-div');
      const label = document.createElement('label');
      label.classList.add('checkbox_btn');
      label.textContent = checkboxData.label;
      labelDiv.appendChild(label);

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = checkboxData.value;
      input.id = checkboxData.id;
      input.setAttribute('additionals', checkboxData.additionals);
      input.setAttribute('additionalsHide', checkboxData.additionalsHide);

      // Add change event listener for styling
      input.addEventListener('change', function() {
        if (this.checked) {
          label.classList.add('selected');
        } else {
          label.classList.remove('selected');
        }
      });

      label.appendChild(input);
      return labelDiv;
    },

    createDropdown: function(dropdownData) {
      const dropdownWrapper = document.createElement('div');
      dropdownWrapper.classList.add('prompt-generator-dropdown-wrapper');
      const labelDiv = document.createElement('div');
      labelDiv.classList.add('prompt-generator-label-div');

      const label = document.createElement('label');
      label.textContent = dropdownData.label;
      labelDiv.appendChild(label);

      dropdownWrapper.appendChild(labelDiv);

      const dropdownElement = this.createInputField('select', { options: dropdownData.options });
      dropdownElement.id = dropdownData.id;
      dropdownElement.classList.add('prompt-generator-dropdown');
      dropdownWrapper.appendChild(dropdownElement);
      return dropdownWrapper;
    },

    createInput: function(inputData) {
      const inputDiv = document.createElement('div');
      inputDiv.classList.add('prompt-generator-input-div');
      if (inputData.id !== 'fileUpload') {
        inputDiv.classList.add('HideInput');
    }    
      const label = document.createElement('label');
      label.textContent = inputData.label;
      inputDiv.appendChild(label);
    
      const inputElement = this.createInputField('input', { type: inputData.type, id: inputData.id });
      if (inputData.type === 'file') {
        inputElement.classList.add('prompt-generator-input');
      } else {
        inputElement.classList.add('prompt-generator-input');
      }
      inputDiv.appendChild(inputElement);
    
      return inputDiv;
    },
  };
  let lastSelectedLanguageIndex = 0;
  async function buildUI(xmlData) {
    try {
      console.warn("buildUI");
      if (!xmlData) {
        console.error('xmlData is null');
        return;
      }

      const targetNode = setupTargetNode();
      if (!targetNode) {
        return;
      }

      const container = setupContainer();
      setupToggleButton(targetNode, container);
      
      buildUIComponents(container, xmlData);
      addAttribution(container);
      
    } catch (error) {
      console.error('Error in buildUI:', error);
    }
  }

  function setupTargetNode() {
    const selector = window.getSelector();
    const targetNode = document.querySelector(selector);
    
    if (targetNode) {
      console.log('PromptEngineer: Target node found with selector:', selector);
      targetNode.setAttribute('id', 'PromptInput');
      
      // Try to find send button - different approaches for different sites
      let promptButton = targetNode.nextElementSibling;
      if (!promptButton) {
        // For chatgpt.com, button might be in parent container
        promptButton = targetNode.parentElement?.querySelector('button[type="submit"]');
      }
      if (!promptButton) {
        // Generic button search
        promptButton = targetNode.closest('form')?.querySelector('button[type="submit"]');
      }
      
      if (promptButton) {
        promptButton.setAttribute('id', 'PromptButton');
        console.log('PromptEngineer: Send button found and configured');
      } else {
        console.warn('PromptEngineer: Send button not found - form submission may not work');
      }
      
      return targetNode;
    } else {
      console.error('PromptEngineer: Target node not found. Selector:', selector);
      console.error('PromptEngineer: Available elements:');
      console.error('- textareas:', document.querySelectorAll('textarea').length);
      console.error('- #thread-bottom-container:', document.querySelectorAll('#thread-bottom-container').length);
      return null;
    }
  }

  function setupContainer() {
    const existingContainer = document.getElementById('prompt-generator-container');
    const container = existingContainer || document.createElement('div');
    container.id = 'prompt-generator-container';
    container.classList.add('prompt-generator-container');
    clearContainer(container);

    const image = document.createElement('img');
    image.src = chrome.runtime.getURL('Images/logo.png');
    image.classList.add('prompt-generator-image');
    container.appendChild(image);

    return container;
  }

  function setupToggleButton(targetNode, container) {
    if (!toggleButtonAdded) {
      const toggleButton = document.createElement('button');
      toggleButton.classList.add('toggle-button');
      toggleButton.onclick = toggleContainer;

      const toggleButtonImage = document.createElement('img');
      toggleButtonImage.src = chrome.runtime.getURL('Images/OnOff.png');
      toggleButtonImage.width = 128;
      toggleButtonImage.height = 128;
      toggleButton.appendChild(toggleButtonImage);

      const parentElement = targetNode.parentElement;
      parentElement.insertBefore(container, targetNode);
      parentElement.insertBefore(toggleButton, targetNode);
      toggleButtonAdded = true;
    }
  }

  function buildUIComponents(container, xmlData) {
    const languageDropdown = window.createLanguageDropdown();
    container.appendChild(languageDropdown);

    buildCheckboxes(container, xmlData);
    buildDropdowns(container, xmlData);
    createInputs(container, xmlData);
    getInputTexts(xmlData);
  }

  function buildCheckboxes(container, xmlData) {
    const checkboxes = xmlData.getElementsByTagName('checkbox');
    const checkboxContainer = document.createElement('div');
    checkboxContainer.classList.add('prompt-generator-checkbox-container');
    container.appendChild(checkboxContainer);

    Array.from(checkboxes).forEach((checkbox) => {
      const checkboxData = extractCheckboxData(checkbox);
      if (checkboxData) {
        const checkboxElement = inputFieldCreation.createCheckbox(checkboxData);
        checkboxContainer.appendChild(checkboxElement);
      }
    });
  }

  function extractCheckboxData(checkbox) {
    try {
      return {
        label: checkbox.querySelector('label')?.textContent || '',
        value: checkbox.querySelector('value')?.textContent || '',
        id: checkbox.querySelector('id')?.textContent || '',
        additionals: checkbox.querySelector('additionals')?.textContent || '',
        additionalsHide: checkbox.querySelector('additionalsHide')?.textContent || '',
      };
    } catch (error) {
      console.warn('Error extracting checkbox data:', error);
      return null;
    }
  }

  function buildDropdowns(container, xmlData) {
    const dropdowns = xmlData.getElementsByTagName('dropdown');
    const dropdownContainer = document.createElement('div');
    dropdownContainer.classList.add('prompt-generator-dropdown-container');
    container.appendChild(dropdownContainer);

    Array.from(dropdowns).forEach((dropdown) => {
      const dropdownData = extractDropdownData(dropdown);
      if (dropdownData) {
        const dropdownElement = inputFieldCreation.createDropdown(dropdownData);
        dropdownContainer.appendChild(dropdownElement);
      }
    });
  }

  function extractDropdownData(dropdown) {
    try {
      const options = dropdown.querySelectorAll('options option');
      const idElement = dropdown.querySelector('id');
      const labelElement = dropdown.querySelector('label');
      
      return {
        id: idElement?.textContent || '',
        label: labelElement?.textContent || '',
        options: Array.from(options).map((option) => {
          const optionLabelElement = option.querySelector('label');
          const optionValueElement = option.querySelector('value');
          const optionAdditionalsElement = option.querySelector('additionals');
          return {
            label: optionLabelElement?.textContent || '',
            text: optionValueElement?.textContent || '',
            additionals: optionAdditionalsElement?.textContent || null,
          };
        }),
      };
    } catch (error) {
      console.warn('Error extracting dropdown data:', error);
      return null;
    }
  }

  function addAttribution(container) {
    const attribution = document.createElement('div');
    attribution.textContent = window.attributionHTML || '';
    attribution.classList.add('prompt-generator-attribution');
    container.appendChild(attribution);
  }

  function getInputTexts(xmlData) {
    try {
      if (!xmlData) {
        console.warn('XML data not available for input text extraction');
        return;
      }

      const inputs = xmlData.getElementsByTagName('input');
      Array.from(inputs).forEach((input) => {
        const idElement = input.querySelector('id');
        const valueBeforeElement = input.querySelector('valueBefore');
        const valueAfterElement = input.querySelector('valueAfter');
        const inputId = idElement?.textContent || '';

        if (inputId) {
          const inputElement = document.getElementById(inputId);
          if (inputElement) {
            const valueBefore = valueBeforeElement?.textContent || '';
            const valueAfter = valueAfterElement?.textContent || '';
            inputElement.setAttribute('valueBefore', valueBefore);
            inputElement.setAttribute('valueAfter', valueAfter);
          }
        }
      });
    } catch (error) {
      console.error('Error getting input texts:', error);
    }
  }

  function clearContainer(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  function createInputs(container, xmlData) {
    try {
      const inputs = xmlData.getElementsByTagName('input');
      const inputContainer = document.createElement('div');
      inputContainer.classList.add('prompt-generator-input-container');
      container.appendChild(inputContainer);
    
      Array.from(inputs).forEach((input) => {
        const inputData = extractInputData(input);
        if (inputData && inputData.label && inputData.id) {
          const inputElement = inputFieldCreation.createInput(inputData);
          const inputField = inputElement.querySelector('input');
          if (inputField) {
            inputField.setAttribute('valueBefore', inputData.valueBefore);
            inputField.setAttribute('valueAfter', inputData.valueAfter);
            inputField.placeholder = inputData.label;
            inputContainer.appendChild(inputElement);
          }
        } else {
          console.warn("Warnung: Ein oder mehrere benötigte Elemente wurden nicht gefunden.");
        }
      });
    } catch (error) {
      console.error('Error creating inputs:', error);
    }
  }

  function extractInputData(input) {
    try {
      const labelElement = input.querySelector('label');
      const idElement = input.querySelector('id');
      const typeElement = input.querySelector('type');
      const valueBeforeElement = input.querySelector('valueBefore');
      const valueAfterElement = input.querySelector('valueAfter');

      return {
        label: labelElement?.textContent || '',
        id: idElement?.textContent || '',
        type: typeElement?.textContent || 'text',
        valueBefore: valueBeforeElement?.textContent || '',
        valueAfter: valueAfterElement?.textContent || '',
      };
    } catch (error) {
      console.warn('Error extracting input data:', error);
      return null;
    }
  }
  


  window.buildUI = buildUI;

})();

   

/*container öffnen schliessen */

let containerVisible = true;

function toggleContainer() {
  try {
    const container = document.getElementById('prompt-generator-container');
    const toggleButton = document.querySelector('.toggle-button');
    
    if (!container || !toggleButton) {
      console.warn('Container or toggle button not found');
      return;
    }
    
    const containerVisible = !container.classList.contains('hidden');
    
    if (containerVisible) {
      container.classList.add('hidden');
      toggleButton.classList.add('rotated');
    } else {
      const selectedLanguage = localStorage.getItem('selectedLanguage') || window.initialLang;
      window.updateUI(selectedLanguage);
      container.classList.remove('hidden');
      toggleButton.classList.remove('rotated');
    }
  } catch (error) {
    console.error('Error toggling container:', error);
  }
}

function resetInputFields() {
  try {
    const container = document.getElementById('prompt-generator-container');
    if (!container) {
      console.warn('Container not found for reset');
      return;
    }
    
    const inputs = container.querySelectorAll('input, select');
    inputs.forEach(input => {
      if (input.type === 'checkbox') {
        input.checked = false;
      } else if (input.tagName === 'SELECT') {
        input.selectedIndex = 0;
      } else {
        input.value = '';
      }
    });
  } catch (error) {
    console.error('Error resetting input fields:', error);
  }
}

function hideAdditionalInputs() {
  try {
    const inputElements = document.querySelectorAll('.prompt-generator-input-container .prompt-generator-input-div');
    inputElements.forEach(inputDiv => {
      if (!inputDiv.classList.contains('HideInput')) {
        inputDiv.classList.add('HideInput');
        const inputElement = inputDiv.querySelector('input[type="text"]');
        if (inputElement) {
          inputElement.value = '';
        }
      }
    });
  } catch (error) {
    console.error('Error hiding additional inputs:', error);
  }
}